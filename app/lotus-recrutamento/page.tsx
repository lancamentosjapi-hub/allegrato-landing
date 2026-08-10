import type { Metadata } from 'next';
import LotusRecrutamento from '@/components/LotusRecrutamento';

// Metadata portada do <helmet> de lotus-recrutamento/index.html (paridade de SEO).
// TODO go-live: trocar canonical/og:url para o domínio final, remover noindex e publicar sitemap.
export const metadata: Metadata = {
  title:
    'Seja um corretor Lotus em Jundiaí e Itupeva: carreira | Lotus Brokers',
  description:
    'Carreira de corretor na Lotus: comissão transparente, mentoria, segurança jurídica e marketing que faz o especialista voar. Em Jundiaí e Itupeva.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-recrutamento',
  },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-recrutamento',
    title: 'Seja um corretor Lotus, carreira de especialista',
    description:
      'Vendedor de imóveis é commodity. Especialista é escolha. Construa sua carreira com estrutura, mentoria e marketing premium.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD portados do estático (<helmet>): JobPosting + FAQPage.
const jobPostingLd = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Corretor de imóveis especialista',
  description:
    'Vaga para corretor especialista na Lotus Brokers, com mentoria, estrutura de apoio, time de marketing e comissão até 60%.',
  hiringOrganization: { '@type': 'Organization', name: 'Lotus Brokers' },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jundiaí',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
  },
  employmentType: 'CONTRACTOR',
  datePosted: '2026-01-01',
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Como ser corretor em Jundiaí?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Você precisa de registro no CRECI (ou estar em curso). Na Lotus, candidatos passam por um processo seletivo de 4 etapas e uma trilha de onboarding de 90 dias com mentoria e estrutura de apoio.',
      },
    },
    {
      '@type': 'Question',
      name: 'A Lotus está contratando?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, a Lotus mantém vagas abertas por squad e cidade em Jundiaí e Itupeva, além de um banco de talentos para quando não há vaga na sua especialidade.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a comissão na Lotus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Lotus trabalha com comissão transparente de até 60%, conforme squad, performance e modelo de atuação. Os detalhes são apresentados no processo seletivo.',
      },
    },
  ],
};

export default function LotusRecrutamentoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <LotusRecrutamento />
    </>
  );
}
