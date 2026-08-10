import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LotusImovel from '@/components/LotusImovel';
import {
  getImovel,
  getImoveisCards,
  type ImovelRow,
} from '@/lib/imoveis';

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
  const title = `${titulo}, à venda | Lotus Brokers`;
  const description =
    imovel.descricao?.trim()?.slice(0, 200) ||
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

// JSON-LD (Product + BreadcrumbList) adaptado ao imóvel real.
function buildJsonLd(imovel: ImovelRow, codigo: string) {
  const titulo = tituloDe(imovel);
  const cidade = imovel.cidade || 'Jundiaí e Itupeva';
  const url = `${SITE}/lotus-imovel/${codigo}`;
  const capa = capaDe(imovel);
  const isLocacao = (imovel.finalidade || '').toLowerCase().match(/locac|alug/) != null;
  const preco = isLocacao
    ? (imovel.valor_locacao ?? imovel.valor_venda)
    : (imovel.valor_venda ?? imovel.valor_locacao);

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titulo,
    description:
      imovel.descricao?.trim() ||
      `${titulo} em ${imovel.bairro ? `${imovel.bairro}, ` : ''}${cidade}.`,
    brand: { '@type': 'RealEstateAgent', name: 'Lotus Brokers' },
    ...(capa ? { image: [capa] } : {}),
    ...(preco
      ? {
          offers: {
            '@type': 'Offer',
            price: String(preco),
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url,
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
