import type { Metadata } from 'next';
import LotusCorretores from '@/components/LotusCorretores';
import { getBrokers } from '@/lib/brokers';

// ISR: revalida a lista de corretores a cada 1h (dados vêm do Supabase em
// runtime, não no build). Mesma cadência das demais rotas do portal.
export const revalidate = 3600;

// Metadata portada do <helmet> de lotus-corretores/index.html (paridade de SEO com o estático).
// TODO go-live: trocar canonical/og:url para o domínio final, remover noindex e publicar sitemap/robots.
export const metadata: Metadata = {
  title: 'Corretores especialistas por bairro em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Conheça os corretores especialistas da Lotus por bairro em Jundiaí e Itupeva. Gente que conhece cada esquina e te chama pelo nome. CRECI visível.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/lotus-corretores' },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-corretores',
    title: 'Corretores especialistas da Lotus',
    description:
      'Gente que conhece cada esquina de Jundiaí e Itupeva e te chama pelo nome. Fale com o especialista do seu bairro.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function LotusCorretoresPage() {
  const brokers = await getBrokers();
  return <LotusCorretores brokers={brokers} />;
}
