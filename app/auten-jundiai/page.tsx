import type { Metadata } from 'next';
import AutenJundiai from '@/components/AutenJundiai';
import './auten-jundiai.css';
import AtalhosLanding from '@/components/AtalhosLanding';
import LightboxPlantas from '@/components/LightboxPlantas';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> de auten-jundiai/index.html (paridade de SEO com o estático).
export const metadata: Metadata = {
  title:
    'Auten Jundiaí | Apartamentos de 128 a 264 m² no Anhangabaú, Até 4 Suítes e 4 Vagas',
  description:
    'Auten Jundiaí: alto padrão no Anhangabaú, a 3 min da Rua do Retiro. Apartamentos de 128 a 264 m², até 4 suítes e 4 vagas, +20 itens de lazer e apenas 74 unidades. Agende sua visita.',
  keywords: [
    'Auten Jundiaí',
    'apartamento alto padrão Jundiaí',
    'apartamento Anhangabaú',
    'lançamento Jundiaí',
    '4 suítes Jundiaí',
    'apartamento 4 vagas',
    'Rua do Retiro',
  ],
  authors: [{ name: 'Auten Incorporadora, Grupo Cataguá' }],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.lotusbrokers.com.br/auten-jundiai' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Auten Jundiaí',
    title: 'Auten Jundiaí | Alto padrão no Anhangabaú, até 4 suítes e 4 vagas',
    description:
      'Apartamentos de 128 a 264 m², +20 itens de lazer e apenas 74 unidades. Um projeto que nasceu para ser um marco na sua vida.',
    images: ['/auten-jundiai/a002.jpg'],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD ApartmentComplex (portado do <script application/ld+json> do estático).
const apartmentLd = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: 'Auten Jundiaí',
  description:
    'Empreendimento residencial de alto padrão no bairro Anhangabaú, em Jundiaí/SP. Apartamentos de 128,51 m² a 264,54 m², com até 4 suítes, até 4 vagas e mais de 20 itens de lazer. Apenas 74 unidades.',
  numberOfAccommodationUnits: 74,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Ida Luchesi Gomes de Camargo, 177, Anhangabaú',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  amenityFeature: [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Piscina adulto aquecida com raia de 25 m',
      value: true,
    },
    { '@type': 'LocationFeatureSpecification', name: 'Family Club', value: true },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Espaço wellness com sala de massagem e yoga',
      value: true,
    },
    { '@type': 'LocationFeatureSpecification', name: 'Coworking', value: true },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Portaria 24h com clausura',
      value: true,
    },
  ],
  developer: {
    '@type': 'Organization',
    name: 'Auten Incorporadora, Grupo Cataguá Soluções Imobiliárias',
  },
};

export default function AutenJundiaiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apartmentLd) }}
      />
      <AutenJundiai />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
      <LightboxPlantas />
    </>
  );
}
