import type { Metadata, Viewport } from 'next';
import './forest-houses.css';
import ForestHouses from '@/components/ForestHouses';
import AtalhosLanding from '@/components/AtalhosLanding';
import LightboxPlantas from '@/components/LightboxPlantas';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> do index.html original (valores EXATOS).
export const viewport: Viewport = { themeColor: '#022B1D' };

export const metadata: Metadata = {
  title:
    'Forest Houses | Casas em Condomínio em Louveira/SP, Lotus Brokers',
  description:
    'Forest Houses: casas em condomínio de 147m² e 200m² com 3 suítes e sacada em Louveira/SP. Lazer completo, fiação subterrânea, gás encanado e localização privilegiada a 2 km do centro. Agende sua visita com a Lotus Brokers.',
  keywords:
    'Forest Houses, casas em condomínio Louveira, condomínio fechado Louveira, casas 147m², casas 200m², 3 suítes, Lotus Brokers, imóveis Louveira SP, alto padrão',
  authors: [{ name: 'Lotus Brokers' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/forest-houses' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Lotus Brokers',
    title: 'Forest Houses, Casas em Condomínio em Louveira/SP',
    description:
      'Casas de 147m² e 200m² com 3 suítes e sacada. Natural, moderno e funcional, com lazer completo e localização privilegiada.',
    images: ['/forest-houses/a002.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forest Houses, Casas em Condomínio em Louveira/SP',
    description:
      'Casas de 147m² e 200m² com 3 suítes e sacada. Lazer completo e localização privilegiada.',
    images: ['/forest-houses/a002.jpg'],
  },
};

// Structured data (JSON-LD) portada do <head> original.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Forest Houses',
  description:
    'Casas em condomínio de 147m² e 200m² com 3 suítes e sacada em Louveira/SP. Lazer completo, fiação subterrânea e localização privilegiada.',
  image: '/forest-houses/a002.jpg',
  numberOfRooms: '3',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Louveira',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Beach Tênis' },
    { '@type': 'LocationFeatureSpecification', name: 'Piscinas Adulto e Infantil' },
    { '@type': 'LocationFeatureSpecification', name: 'Academia' },
    { '@type': 'LocationFeatureSpecification', name: 'Salão de Festas' },
    { '@type': 'LocationFeatureSpecification', name: 'Coworking' },
    { '@type': 'LocationFeatureSpecification', name: 'Playground' },
  ],
  broker: {
    '@type': 'RealEstateAgent',
    name: 'Lotus Brokers',
    telephone: '+55 11 92614-3393',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ForestHouses />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
      <LightboxPlantas />
    </>
  );
}
