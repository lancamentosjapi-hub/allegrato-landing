import type { Metadata } from 'next';
import './vivarte.css';
import Vivarte from '@/components/Vivarte';
import AtalhosLanding from '@/components/AtalhosLanding';

// Metadata portada do <helmet> de vivarte/index.html (paridade de SEO com o estático).
export const metadata: Metadata = {
  title: 'Vivarte Grand Alamedas | Apartamentos à venda em Jundiaí, Serra do Japi',
  description:
    'Vivarte Grand Alamedas: apartamentos de 2 e 3 dormitórios em Jundiaí, com vista para a Serra do Japi, ampla varanda e mais de 30 itens de lazer. Lançamento Grupo Diretiva. Agende sua visita.',
  keywords:
    'apartamento à venda Jundiaí, lançamento Jundiaí, Vivarte Grand Alamedas, apartamento 2 e 3 dormitórios Jundiaí, Serra do Japi, minha casa minha vida Jundiaí, Grupo Diretiva, apartamento com lazer Jundiaí',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://vivartegrand.com.br' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Vivarte Grand Alamedas | Viver cercado pelo verde da Serra do Japi',
    description:
      'Apartamentos de 2 e 3 dormitórios em Jundiaí, com ampla varanda e mais de 30 espaços de lazer. Agende sua visita.',
    images: ['/vivarte/a003.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function VivartePage() {
  return (
    <>
      <Vivarte />
      <AtalhosLanding />
    </>
  );
}
