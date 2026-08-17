import type { Metadata, Viewport } from 'next';
import './brisas-do-japi.css';
import BrisasDoJapi from '@/components/BrisasDoJapi';
import AtalhosLanding from '@/components/AtalhosLanding';

// Next 15: themeColor vive no export `viewport`, não em `metadata`.
export const viewport: Viewport = { themeColor: '#123c47' };

// Metadata portada do <helmet> do index.html original (valores EXATOS).
export const metadata: Metadata = {
  title:
    'Brisas do Japi, Apartamentos e Studios em Jundiaí | Minha Casa Minha Vida',
  description:
    'Brisas do Japi: studios e apartamentos de 2 dormitórios com varanda, lazer completo e vista da Serra do Japi no Bairro Medeiros, Jundiaí. Novo Minha Casa Minha Vida. Agende sua visita.',
  keywords:
    'apartamento Jundiaí, Brisas do Japi, Minha Casa Minha Vida Jundiaí, apartamento Bairro Medeiros, apartamento com varanda Jundiaí, Serra do Japi, lançamento Jundiaí, studio Jundiaí',
  robots: 'index, follow',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/brisas-do-japi' },
  openGraph: {
    type: 'website',
    title: 'Brisas do Japi, Apartamentos em Jundiaí | Minha Casa Minha Vida',
    description:
      'Studios e apartamentos de 2 dorms com varanda, +17 itens de lazer e vista da Serra do Japi no Bairro Medeiros, Jundiaí.',
    images: [
      'https://vvcconstrutora.com.br/images/brisas-banner/FACHADA01.jpg',
    ],
    locale: 'pt_BR',
  },
};

export default function Page() {
  return (
    <>
      <BrisasDoJapi />
      <AtalhosLanding />
    </>
  );
}
