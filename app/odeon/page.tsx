import type { Metadata } from 'next';
import './odeon.css';
import Odeon from '@/components/Odeon';

// Metadata portada do <helmet> do fonte estático.
export const metadata: Metadata = {
  title: 'Odeon Residencial, Portal do Paraíso II | Apartamentos de 95 e 112 m² em Jundiaí',
  description:
    'Odeon Residencial em Jundiaí/SP: apartamentos de 95,85 m² e 112,3 m² com varanda gourmet integrada, até 3 dormitórios e 14 áreas de lazer decoradas e equipadas.',
  keywords:
    'Odeon Jundiaí, apartamento Jundiaí, Portal do Paraíso II, F.A. Oliva, apartamento 3 dormitórios Jundiaí, varanda gourmet, lançamento Jundiaí',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/odeon' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Odeon Residencial, Jundiaí/SP',
    description:
      'Apartamentos de 95,85 m² e 112,3 m² com 14 áreas de lazer decoradas e equipadas. Relaxe, respire e contemple.',
    images: ['/odeon/a011.jpg'],
  },
};

export default function OdeonPage() {
  return <Odeon />;
}
