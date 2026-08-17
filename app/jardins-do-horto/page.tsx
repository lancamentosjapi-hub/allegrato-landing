import type { Metadata } from 'next';
import JardinsDoHorto from '@/components/JardinsDoHorto';
import './jardins-do-horto.css';
import AtalhosLanding from '@/components/AtalhosLanding';

// Metadata portada do <head>/<helmet> de jardins-do-horto/index.html (paridade de SEO).
export const metadata: Metadata = {
  title:
    'Jardins do Horto, Apartamentos de 72m² e 95m² no Horto Florestal, Jundiaí | Santa Angela',
  description:
    'Jardins do Horto: apartamentos de 72m² e 95m², 2 e 3 dormitórios no Horto Florestal, Jundiaí/SP. Lazer completo, ao lado do Maxi Shopping. Um empreendimento Santa Angela. Agende sua visita.',
  keywords:
    'apartamento Horto Florestal, apartamento Jundiaí, Jardins do Horto, apartamento 2 dormitórios Jundiaí, apartamento 3 dormitórios Jundiaí, lançamento Jundiaí, Santa Angela Construtora',
  robots: 'index,follow',
  openGraph: {
    type: 'website',
    title: 'Jardins do Horto, Morar bem no Horto Florestal, Jundiaí',
    description:
      'Apartamentos de 72m² e 95m² com lazer completo no coração do Horto Florestal. Um empreendimento Santa Angela.',
    images: ['assets/img/p01.jpg'],
  },
};

// JSON-LD portado do estático (Residence).
const residenceLd = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Jardins do Horto',
  description:
    'Apartamentos de 72m² e 95m², 2 e 3 dormitórios, no Horto Florestal, Jundiaí/SP. Lazer completo. Um empreendimento Santa Angela Construtora.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Irineu de Toledo, 225',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  numberOfRooms: '2-3',
  floorSize: [
    { '@type': 'QuantitativeValue', value: 72, unitCode: 'MTK' },
    { '@type': 'QuantitativeValue', value: 95, unitCode: 'MTK' },
  ],
};

export default function JardinsDoHortoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(residenceLd) }}
      />
      <JardinsDoHorto />
      <AtalhosLanding />
    </>
  );
}
