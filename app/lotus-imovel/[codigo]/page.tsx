import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LotusImovel from '@/components/LotusImovel';
import {
  formatValor,
  getImovel,
  getImoveisCards,
  type ImovelRow,
} from '@/lib/imoveis';
import { resumoDescricao } from '@/lib/resumo-imovel';

// Rota dinâmica /lotus-imovel/[codigo] — lê cada imóvel do Supabase.
// ISR sob demanda: a página é renderizada no primeiro acesso (em runtime, onde
// as env vars do Supabase existem) e cacheada por 1h. Não pré-renderizamos no
// build (`generateStaticParams`) porque o ambiente de build não recebe as env
// vars do Supabase, e os dados mudam com frequência — prerender de tudo no build
// não agrega aqui.
export const revalidate = 3600;

const SITE = 'https://www.lotusbrokers.com.br';

type Params = { params: Promise<{ codigo: string }> };

// Título/descrição derivados do imóvel (mesmo critério do componente).
function tituloDe(imovel: ImovelRow): string {
  if (imovel.titulo?.trim()) return imovel.titulo.trim();
  const tipo = imovel.tipo || imovel.tipo_simplificado || 'Imóvel';
  const q = imovel.suites || imovel.quartos;
  const comodo = imovel.suites ? 'suítes' : 'dormitórios';
  const partes = [tipo];
  if (q) partes.push(`de ${q} ${comodo}`);
  if (imovel.bairro) partes.push(`em ${imovel.bairro}`);
  return partes.join(' ');
}

function capaDe(imovel: ImovelRow): string | undefined {
  const fotos = imovel.fotos ?? [];
  return (fotos.find((f) => f.isCapa) ?? fotos[0])?.url;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { codigo } = await params;
  const imovel = await getImovel(codigo);
  if (!imovel) {
    return { title: 'Imóvel, Lotus Brokers', robots: { index: false } };
  }
  const titulo = tituloDe(imovel);
  const cidade = imovel.cidade || 'Jundiaí e Itupeva';
  const local = imovel.bairro ? `${imovel.bairro}, ${cidade}` : cidade;
  const capa = capaDe(imovel);
  // Padrao do doc de SEO: tipo, dormitorios, bairro, cidade e preco no title.
  // O preco no titulo e o que faz o resultado do Google competir com portais —
  // quem ve valor antes de clicar clica mais. Titulo e meta NAO sao copy da
  // pagina: aparecem so na aba do navegador e no resultado de busca, entao
  // mexer aqui nao altera nada do que o visitante le no site.
  const precoTitulo = imovel.valor_venda || imovel.valor_locacao || null;
  const title = precoTitulo
    ? `${titulo}, ${formatValor(precoTitulo)} | Lotus Brokers`
    : `${titulo}, à venda | Lotus Brokers`;
  // 155 caracteres e o que o Google exibe; cortar em 200 no meio de uma palavra
  // deixava reticencias no lugar errado. resumoDescricao corta em fim de frase
  // ou no ultimo espaco.
  const description =
    resumoDescricao(imovel.descricao, 155) ||
    `${titulo} em ${local}. Conheça os detalhes, agende uma visita e fale com o especialista da Lotus.`;
  const url = `${SITE}/lotus-imovel/${codigo}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      siteName: 'Lotus Brokers',
      type: 'website',
      url,
      title: titulo,
      description,
      images: capa ? [capa] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

// JSON-LD (RealEstateListing + BreadcrumbList) adaptado ao imóvel real.
function buildJsonLd(imovel: ImovelRow, codigo: string) {
  const titulo = tituloDe(imovel);
  const cidade = imovel.cidade || 'Jundiaí e Itupeva';
  const url = `${SITE}/lotus-imovel/${codigo}`;
  const capa = capaDe(imovel);
  const isLocacao = (imovel.finalidade || '').toLowerCase().match(/locac|alug/) != null;
  const preco = isLocacao
    ? (imovel.valor_locacao ?? imovel.valor_venda)
    : (imovel.valor_venda ?? imovel.valor_locacao);

  // RealEstateListing e nao Product: o vocabulario de imovel do schema.org
  // aceita area, dormitorios, banheiros e endereco, que sao justamente os
  // campos que o Google usa para montar o cartao com foto, preco e metragem
  // direto na busca. Product so permitia nome, imagem e oferta.
  //
  // Todo campo sai do banco e so entra quando existe: imovel sem area ou sem
  // CEP nao declara aquela propriedade, em vez de declarar zero. Marcacao que
  // nao corresponde ao conteudo da pagina e penalizada pelo Google, entao dado
  // ausente e melhor do que dado inventado.
  const area = imovel.area_util || imovel.area_total || imovel.metragem_m2 || null;
  const endereco: Record<string, unknown> = { '@type': 'PostalAddress', addressCountry: 'BR' };
  if (imovel.logradouro) endereco.streetAddress = [imovel.logradouro, imovel.numero].filter(Boolean).join(', ');
  if (imovel.cidade) endereco.addressLocality = imovel.cidade;
  if (imovel.estado) endereco.addressRegion = imovel.estado;
  if (imovel.cep) endereco.postalCode = imovel.cep;

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: titulo,
    url,
    description:
      imovel.descricao?.trim() ||
      `${titulo} em ${imovel.bairro ? `${imovel.bairro}, ` : ''}${cidade}.`,
    ...(capa ? { image: [capa] } : {}),
    address: endereco,
    ...(area ? { floorSize: { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' } } : {}),
    ...(imovel.quartos ? { numberOfRooms: imovel.quartos } : {}),
    ...(imovel.banheiros ? { numberOfBathroomsTotal: imovel.banheiros } : {}),
    provider: { '@type': 'RealEstateAgent', name: 'Lotus Brokers', url: SITE },
    ...(preco
      ? {
          offers: {
            '@type': 'Offer',
            price: String(preco),
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url,
            ...(isLocacao ? { businessFunction: 'https://schema.org/LeaseOut' } : {}),
          },
        }
      : {}),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Comprar', item: `${SITE}/lotus-busca` },
      ...(imovel.cidade
        ? [{ '@type': 'ListItem', position: 2, name: imovel.cidade, item: `${SITE}/lotus-busca` }]
        : []),
      { '@type': 'ListItem', position: imovel.cidade ? 3 : 2, name: titulo, item: url },
    ],
  };

  return [product, breadcrumb];
}

export default async function LotusImovelPage({ params }: Params) {
  const { codigo } = await params;
  const imovel = await getImovel(codigo);
  if (!imovel) notFound();

  const relacionados = await getImoveisCards(codigo);
  const jsonLd = buildJsonLd(imovel, codigo);

  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
      <LotusImovel data={imovel} relacionados={relacionados} />
    </>
  );
}
