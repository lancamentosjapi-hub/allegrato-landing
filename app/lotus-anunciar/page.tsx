import type { Metadata } from 'next';
import LotusAnunciar from '@/components/LotusAnunciar';

// Metadata portada de lotus-anunciar/index.html (<helmet>) — paridade de SEO com o estático.
// TODO go-live: revisar canonical/og:url para o domínio final e publicar sitemap/robots.
export const metadata: Metadata = {
  title: 'Anuncie e avalie seu imóvel em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Descubra quanto vale o seu imóvel em Jundiaí e Itupeva. Avaliação justa, marketing premium e um especialista do seu bairro do anúncio à chave.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/lotus-anunciar' },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-anunciar',
    title: 'Anuncie e avalie seu imóvel com a Lotus',
    description:
      'Avaliação sem custo, processo transparente e um especialista do seu bairro. Saiba quanto vale o seu imóvel.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD Service (portado literal do <helmet> do estático).
const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Avaliação e venda de imóveis, Lotus Brokers',
  serviceType: 'Intermediação imobiliária e avaliação',
  areaServed: ['Jundiaí', 'Itupeva', 'Vinhedo', 'Valinhos'],
  provider: { '@type': 'RealEstateAgent', name: 'Lotus Brokers' },
};

// JSON-LD FAQPage (portado literal do <helmet> do estático).
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quanto a Lotus cobra para vender meu imóvel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A comissão segue a tabela do CRECI-SP e só é cobrada quando o imóvel é vendido. A avaliação é gratuita e sem compromisso.',
      },
    },
    {
      '@type': 'Question',
      name: 'A avaliação do imóvel é gratuita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim. A estimativa online é imediata e gratuita, e a avaliação presencial com o especialista também não tem custo nem compromisso.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso dar exclusividade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Gestão Exclusiva é o modelo que rende mais, foco total, marketing premium e boletim semanal. Mas a decisão é sua; o especialista explica as opções.',
      },
    },
  ],
};

export default function LotusAnunciarPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LotusAnunciar />
    </>
  );
}
