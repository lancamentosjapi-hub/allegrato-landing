import type { Metadata } from 'next';
import AltosDaAvenida from '@/components/AltosDaAvenida';
import './altos-da-avenida.css';
import AtalhosLanding from '@/components/AtalhosLanding';

// Metadata portada do <head>/<helmet> de altos-da-avenida/index.html (paridade de SEO).
export const metadata: Metadata = {
  title:
    'Altos da Avenida, Apartamentos de 58 a 105m² em Jundiaí | Imobiliária Lotus Brokers',
  description:
    'Altos da Avenida, em Jundiaí: apartamentos de 58, 68, 96 e 105m² com 2 ou 3 dormitórios e opção de suíte, no Jardim do Lago. Lazer completo, a 10 min da Anhanguera. Fale com a Imobiliária Lotus Brokers.',
  keywords:
    'Altos da Avenida, apartamento Jundiaí, lançamento Jundiaí, Jardim do Lago, Avenida Samuel Martins, apartamento 2 dormitórios Jundiaí, apartamento 3 dormitórios, Santa Angela',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Altos da Avenida, Viva os seus Altos momentos em Jundiaí',
    description:
      'Apartamentos de 58 a 105m² com lazer completo no Jardim do Lago, Jundiaí. Fale com a Imobiliária Lotus Brokers.',
  },
};

// JSON-LD Residence, portado literal do <script type="application/ld+json"> do estático.
const residenceLd = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Altos da Avenida',
  description:
    'Apartamentos de 58, 68, 96 e 105m² com 2 ou 3 dormitórios e opção de suíte, no Jardim do Lago, Jundiaí/SP. Lazer completo, a 10 minutos da Rodovia Anhanguera.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida Samuel Martins',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscina adulto e infantil', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Academia', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Salão de festas', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Coworking', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Espaço pet', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Playground', value: true },
  ],
};

export default function AltosDaAvenidaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(residenceLd) }}
      />
      <AltosDaAvenida />
      <AtalhosLanding />
    </>
  );
}
