import type { Metadata, Viewport } from 'next';
import MaxxSantaAngela from '@/components/MaxxSantaAngela';
import './maxx-santa-angela.css';
import AtalhosLanding from '@/components/AtalhosLanding';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// theme-color do <helmet> estático (no Next 15 vai no export `viewport`).
export const viewport: Viewport = {
};

// Metadata portada do <helmet> de maxx-santa-angela/index.html (paridade de SEO).
export const metadata: Metadata = {
  title:
    'Maxx Santa Angela | Apartamentos de 71 a 98m² ao lado do Maxi Shopping Jundiaí',
  description:
    'Maxx Santa Angela: apartamentos de 71 a 98 m², 2 e 3 dormitórios, ao lado do Maxi Shopping Jundiaí. Lazer completo, áreas comuns decoradas e a confiança de quem entregou +9.800 unidades. A partir de R$ 790.365,90.',
  openGraph: {
    type: 'website',
    title: 'Maxx Santa Angela, More pertinho de quem você gosta',
    description:
      'Apartamentos de 71 a 98 m² ao lado do Maxi Shopping Jundiaí. Lazer completo e a assinatura Santa Angela.',
    images: [
      'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/CAPA-MAX-OLD.png',
    ],
  },
};

// JSON-LD Residence (portado do <script application/ld+json> do estático).
const residenceLd = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Maxx Santa Angela',
  description:
    'Apartamentos de 71 a 98 m², 2 e 3 dormitórios, ao lado do Maxi Shopping Jundiaí.',
  image:
    'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/CAPA-MAX-OLD.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua João Tonini, 400 - Vila Galvão',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  telephone: '+5511926143393',
};

export default function MaxxSantaAngelaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(residenceLd) }}
      />
      <MaxxSantaAngela />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
    </>
  );
}
