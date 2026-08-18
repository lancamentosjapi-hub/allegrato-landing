import type { Metadata, Viewport } from 'next';
import './gran-ville-santo-angelo.css';
import GranVilleSantoAngelo from '@/components/GranVilleSantoAngelo';
import AtalhosLanding from '@/components/AtalhosLanding';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> do index.html original (valores EXATOS).
export const viewport: Viewport = { themeColor: '#2A3826' };

export const metadata: Metadata = {
  title:
    'Gran Ville Santo Angelo, Loteamento de Alto Padrão em Itupeva-SP | Novo Urbanismo',
  description:
    'Gran Ville Santo Angelo: o novo bairro planejado em Itupeva-SP. 450 mil m² com 200 mil m² de Mata Atlântica preservada, clube privativo, complexo esportivo e lotes a partir de 360 m². Novo urbanismo da GP Desenvolvimento Urbano.',
  keywords:
    'Gran Ville Santo Angelo, loteamento Itupeva, lotes Itupeva, bairro planejado, novo urbanismo, GP Desenvolvimento Urbano, lotes alto padrão, condomínio Itupeva, Jundiaí, Mata Atlântica',
  authors: [{ name: 'GP Desenvolvimento Urbano' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://granvillesantoangelo.com.br/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Gran Ville Santo Angelo',
    title: 'Gran Ville Santo Angelo, Loteamento de Alto Padrão em Itupeva-SP',
    description:
      'O novo bairro planejado em Itupeva. 450 mil m², 200 mil m² de Mata Atlântica preservada, clube privativo e lotes a partir de 360 m².',
    images: ['img/hero-portaria.jpg'],
    url: 'https://granvillesantoangelo.com.br/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gran Ville Santo Angelo, Itupeva-SP',
    description:
      'O novo bairro planejado em Itupeva. Novo urbanismo, clube privativo e Mata Atlântica preservada.',
    images: ['img/hero-portaria.jpg'],
  },
};

export default function Page() {
  return (
    <>
      <GranVilleSantoAngelo />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
    </>
  );
}
