import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LotusBairro from '@/components/LotusBairro';
import { getBairro, bairroSlugs, bairrosVizinhos, type Bairro } from '@/lib/bairros';
import { getImoveisPorBairro } from '@/lib/imoveis';

// Guias de bairro são conteúdo estático (lib/bairros) — dá pra pré-renderizar
// todos no build. Os imóveis do bairro vêm do banco em runtime; por isso ISR
// (revalida a lista de imóveis a cada 1h sem rebuild).
export const revalidate = 3600;

// Domínio vem da env (NEXT_PUBLIC_SITE_URL) — não hard-codar. Fallback só
// evita quebrar canonical/JSON-LD se a env não estiver definida no ambiente.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lotusbrokers.com.br';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bairroSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const bairro = getBairro(slug);
  if (!bairro) {
    return { title: 'Bairro, Lotus Brokers', robots: { index: false } };
  }
  const title = `Morar em ${bairro.nome}, ${bairro.cidade}: guia do bairro e imóveis | Lotus Brokers`;
  const description = bairro.tagline;
  const url = `${SITE}/lotus-bairro/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    // Bairros com conteúdo ainda placeholder não são indexados até revisão.
    ...(bairro.publicado ? {} : { robots: { index: false } }),
    openGraph: {
      siteName: 'Lotus Brokers',
      type: 'website',
      url,
      title: `Morar em ${bairro.nome}, ${bairro.cidade}, o guia da Lotus`,
      description,
    },
    twitter: { card: 'summary_large_image' },
  };
}

// JSON-LD (Place + FAQPage + BreadcrumbList) do bairro.
function buildJsonLd(bairro: Bairro, slug: string) {
  const url = `${SITE}/lotus-bairro/${slug}`;
  const place = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${bairro.nome}, ${bairro.cidade}`,
    description: bairro.tldr,
    address: {
      '@type': 'PostalAddress',
      addressLocality: bairro.cidade,
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: bairro.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bairros', item: `${SITE}/lotus-bairro` },
      { '@type': 'ListItem', position: 2, name: bairro.nome, item: url },
    ],
  };
  return [place, faq, breadcrumb];
}

export default async function LotusBairroSlugPage({ params }: Params) {
  const { slug } = await params;
  const bairro = getBairro(slug);
  if (!bairro) notFound();

  const imoveis = await getImoveisPorBairro(bairro.nome);
  const vizinhos = bairrosVizinhos(slug).map((v) => ({
    name: v.nome,
    note: v.cidade,
    slug: v.slug,
  }));
  const jsonLd = buildJsonLd(bairro, slug);

  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
      <LotusBairro bairro={bairro} imoveis={imoveis} vizinhos={vizinhos} />
    </>
  );
}
