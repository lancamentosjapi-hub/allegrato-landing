import type { Metadata } from 'next';
import './terrace-serra-do-japi.css';
import TerraceSerraDoJapi from '@/components/TerraceSerraDoJapi';
import AtalhosLanding from '@/components/AtalhosLanding';
import LightboxPlantas from '@/components/LightboxPlantas';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> de terrace-serra-do-japi/index.html (valores EXATOS).
export const metadata: Metadata = {
  title:
    'Terrace Serra do Japi, Apartamentos de Alto Padrão em Jundiaí | Lotus Brokers',
  description:
    'Terrace Serra do Japi: residências de 157 a 203 m² com vista permanente para a Serra do Japi, no Jardim das Samambaias, Jundiaí. 3 torres, lazer premium e localização privilegiada. Consulte valores com a Lotus Brokers.',
  keywords:
    'Terrace Serra do Japi, apartamento alto padrão Jundiaí, lançamento Jundiaí, Jardim das Samambaias, Auten, apartamento 4 suítes Jundiaí, imóvel de luxo Jundiaí',
  authors: [{ name: 'Lotus Brokers' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/terrace-serra-do-japi',
  },
  openGraph: {
    type: 'website',
    title: 'Terrace Serra do Japi, Alto padrão em Jundiaí',
    description:
      'Residências de 157 a 203 m² com vista permanente para a Serra do Japi. Lazer premium e localização privilegiada no coração de Jundiaí.',
    images: ['web/renders/fachada-1.jpg'],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// JSON-LD ApartmentComplex, portado literal do <script type="application/ld+json"> do estático.
const apartmentComplexLd = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: 'Terrace Serra do Japi',
  description:
    'Empreendimento residencial de alto padrão com 3 torres e residências de 157 a 203 m², vista permanente para a Serra do Japi, no Jardim das Samambaias, Jundiaí/SP.',
  url: 'https://www.lotusbrokers.com.br/terrace-serra-do-japi',
  image: 'web/renders/fachada-1.jpg',
  numberOfAccommodationUnits: 104,
  petsAllowed: true,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Dr. Adilson Rodrigues, 151',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    neighborhood: 'Jardim das Samambaias',
    addressCountry: 'BR',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscina com raia de 25m', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Espaço Fitness', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Quadra de Beach Tennis', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'SPA com hidromassagem', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Coworking', value: true },
  ],
  broker: {
    '@type': 'RealEstateAgent',
    name: 'Lotus Brokers',
    telephone: '+5511926143393',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(apartmentComplexLd) }}
      />
      <TerraceSerraDoJapi />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
      <LightboxPlantas />
    </>
  );
}
