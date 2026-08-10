import type { Metadata } from 'next';
import LotusBusca from '@/components/LotusBusca';
import { getImoveisBusca } from '@/lib/imoveis';

const SITE = 'https://www.lotusbrokers.com.br';

// ISR: revalida o catálogo da busca a cada 1h (mesma cadência das rotas de
// imóvel). Os dados vêm do Supabase em runtime, não no build.
export const revalidate = 3600;

// Metadata portada do <helmet> de lotus-busca (paridade de SEO com o estático).
// TODO go-live: trocar canonical/og:url para o domínio final, remover noindex e publicar sitemap/robots.
export const metadata: Metadata = {
  title: 'Comprar e alugar imóveis em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Busque imóveis à venda e para alugar em Jundiaí, Itupeva e região com a Lotus Brokers. Descreva o imóvel que você procura e o especialista do bairro caça pra você.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/lotus-busca' },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-busca',
    title: 'Comprar e alugar imóveis em Jundiaí e Itupeva, Lotus Brokers',
    description:
      'Casas, apartamentos, coberturas e terrenos em Jundiaí, Itupeva e região, curados pelo especialista do bairro.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD portados do <helmet> estático (WebSite com SearchAction, ItemList).
const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lotus Brokers',
  url: 'https://www.lotusbrokers.com.br',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.lotusbrokers.com.br/comprar?q={query}',
    'query-input': 'required name=query',
  },
};

export default async function LotusBuscaPage() {
  const imoveis = await getImoveisBusca();

  // ItemList JSON-LD montado a partir dos imóveis reais (antes eram URLs fixas).
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: imoveis.map((im, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/lotus-imovel/${im.codigo}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <LotusBusca imoveis={imoveis} />
    </>
  );
}
