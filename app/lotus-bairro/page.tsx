import type { Metadata } from 'next';
import LotusBairrosIndex from '@/components/LotusBairrosIndex';
import { listBairros } from '@/lib/bairros';

// Domínio vem da env (NEXT_PUBLIC_SITE_URL) — não hard-codar.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lotusbrokers.com.br';

export const metadata: Metadata = {
  title: 'Bairros de Jundiaí e Itupeva: guias por bairro | Lotus Brokers',
  description:
    'Guias honestos dos bairros de Jundiaí e Itupeva: como é o dia a dia, escolas, comércio, lazer e faixa de preço, com o especialista da Lotus.',
  alternates: { canonical: `${SITE}/lotus-bairro` },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: `${SITE}/lotus-bairro`,
    title: 'Bairros de Jundiaí e Itupeva, guias da Lotus',
    description:
      'Escolha o bairro certo, não só o imóvel certo. Guias por bairro de Jundiaí e Itupeva.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function LotusBairroIndexPage() {
  const bairros = listBairros();

  // JSON-LD: coleção de guias de bairro (lista dos itens reais).
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: bairros.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${b.nome}, ${b.cidade}`,
      url: `${SITE}/lotus-bairro/${b.slug}`,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bairros', item: `${SITE}/lotus-bairro` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <LotusBairrosIndex bairros={bairros} />
    </>
  );
}
