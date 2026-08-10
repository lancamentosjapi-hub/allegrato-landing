import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LotusCondominio from '@/components/LotusCondominio';
import {
  getCondominio,
  getCondominiosCards,
  type CondominioRow,
} from '@/lib/condominios';

// Rota dinâmica /lotus-condominio/[id] — lê cada condomínio do Supabase.
// ISR sob demanda: a página é renderizada no primeiro acesso (em runtime, onde
// as env vars do Supabase existem) e cacheada por 1h. Não pré-renderizamos no
// build (`generateStaticParams`) porque o ambiente de build não recebe as env
// vars do Supabase, e os dados mudam com frequência — prerender de tudo no build
// não agrega aqui.
export const revalidate = 3600;

const SITE = 'https://www.lotusbrokers.com.br';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const cond = await getCondominio(id);
  if (!cond) {
    return { title: 'Condomínio, Lotus Brokers', robots: { index: false } };
  }
  const cidade = cond.cidade || 'Jundiaí e Itupeva';
  const capa = (cond.fotos?.find((f) => f.isCapa) ?? cond.fotos?.[0])?.url;
  const title = `${cond.nome}, ${cidade}, guia do condomínio e imóveis | Lotus Brokers`;
  const description =
    cond.descricao_site?.trim() ||
    `Tudo sobre morar no ${cond.nome}, ${cidade}: estrutura, localização e imóveis disponíveis com o especialista da Lotus.`;
  const url = `${SITE}/lotus-condominio/${id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      siteName: 'Lotus Brokers',
      type: 'website',
      url,
      title: `Morar no ${cond.nome}, ${cidade}, guia da Lotus`,
      description,
      images: capa ? [capa] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

// JSON-LD (ApartmentComplex + FAQPage + BreadcrumbList) adaptado ao condomínio.
function buildJsonLd(cond: CondominioRow, id: string) {
  const cidade = cond.cidade || 'Jundiaí e Itupeva';
  const url = `${SITE}/lotus-condominio/${id}`;
  const amenities = cond.infra_portaria_24h === true
    ? [{ '@type': 'LocationFeatureSpecification', name: 'Portaria 24h' }]
    : [];

  const apartmentComplex = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: cond.nome,
    description:
      cond.descricao_site?.trim() ||
      `${cond.nome} é um condomínio em ${cidade}, procurado por famílias pela estrutura, segurança e qualidade de vida.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cond.cidade || undefined,
      addressRegion: cond.estado || 'SP',
      addressCountry: 'BR',
    },
    ...(amenities.length ? { amenityFeature: amenities } : {}),
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Vale a pena morar no ${cond.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `O ${cond.nome} é procurado por famílias em ${cidade} pela combinação de segurança, estrutura de lazer e qualidade de vida. A Lotus conhece o condomínio por dentro.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quais tipos de imóvel existem no ${cond.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As unidades variam em metragem e configuração. A Lotus tem especialistas que conhecem cada tipo de unidade do condomínio.',
        },
      },
    ],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Condomínios', item: `${SITE}/lotus-condominio` },
      { '@type': 'ListItem', position: 2, name: cond.nome, item: url },
    ],
  };

  return [apartmentComplex, faq, breadcrumb];
}

export default async function LotusCondominioPage({ params }: Params) {
  const { id } = await params;
  const cond = await getCondominio(id);
  if (!cond) notFound();

  const relacionados = await getCondominiosCards(id);
  const jsonLd = buildJsonLd(cond, id);

  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
      <LotusCondominio data={cond} relacionados={relacionados} />
    </>
  );
}
