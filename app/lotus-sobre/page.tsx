import type { Metadata } from 'next';
import LotusSobre from '@/components/LotusSobre';

// Metadata portado do <helmet> do fonte estático (lotus-sobre/index.html).
export const metadata: Metadata = {
  title: 'A Lotus: imobiliária de especialistas em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Conheça a Lotus Brokers: imobiliária moderna de Jundiaí e Itupeva, com time segmentado por especialidade e corretores que conhecem cada bairro.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-sobre',
  },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-sobre',
    title: 'A Lotus: imobiliária de especialistas em Jundiaí e Itupeva',
    description:
      'Time consolidado, marca nova. Especialistas por bairro que te chamam pelo nome, em Jundiaí e Itupeva.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function LotusSobrePage() {
  return <LotusSobre />;
}
