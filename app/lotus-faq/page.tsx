import type { Metadata } from 'next';
import LotusFaq from '@/components/LotusFaq';

// Metadata portada do <head>/<helmet> do fonte estático (lotus-faq/index.html).
export const metadata: Metadata = {
  title: 'Perguntas frequentes sobre a Lotus em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Respostas diretas sobre comprar, vender e alugar com a Lotus em Jundiaí e Itupeva: atendimento, lançamentos, revenda e como funciona.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-faq',
  },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-faq',
    title: 'Perguntas frequentes, Lotus Brokers',
    description:
      'Tudo que você precisa saber antes de comprar, vender ou alugar em Jundiaí e Itupeva, respondido sem enrolação.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function LotusFaqPage() {
  return <LotusFaq />;
}
