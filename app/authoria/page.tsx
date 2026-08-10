import type { Metadata } from 'next';
import './authoria.css';
import Authoria from '@/components/Authoria';
import VoltarParaLancamentos from '@/components/VoltarParaLancamentos';

// Metadata portada do <head> de authoria/index.html (paridade de SEO com o estático).
export const metadata: Metadata = {
  title: 'Authoria by Tebas | Apartamentos de 3 e 4 Suítes em Jundiaí, 137 a 211 m²',
  description:
    'Authoria by Tebas: alto padrão elevado ao estado da arte em Jundiaí. Apartamentos de 3 e 4 suítes, 137,39 a 211,91 m², 4 torres, lazer completo com piscina coberta, beach tennis, coworking e mais. Arquitetura HOCH e paisagismo Benedito Abbud. Agende sua visita ao decorado.',
  keywords:
    'Authoria by Tebas, apartamento Jundiaí, alto padrão Jundiaí, 4 suítes Jundiaí, 3 suítes, lançamento Jundiaí, Jardim Santa Teresa, Tebas, apartamento de luxo, imóvel Jundiaí',
  authors: [{ name: 'Tebas' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://authoria.com.br/' },
  openGraph: {
    type: 'website',
    title: 'Authoria by Tebas | Alto padrão em Jundiaí, 3 e 4 suítes',
    description:
      'Um encontro raro entre exclusividade, natureza e arquitetura. Apartamentos de 137 a 211 m² em Jundiaí, com lazer completo. Entrega Agosto/2026.',
    images: ['/authoria/a046.jpg'],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function AuthoriaPage() {
  return (
    <>
      <Authoria />
      <VoltarParaLancamentos />
    </>
  );
}
