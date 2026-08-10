import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './avalon.css';
import Avalon from '@/components/Avalon';

// O fonte carregava estas fontes pelo CDN do Google. next/font auto-hospeda:
// sem request a terceiro e sem flash de fonte. As variáveis alimentam
// --serif/--sans do avalon.css.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Metadata portada do <head> do fonte estático.
export const metadata: Metadata = {
  title: 'Avalon Residencial, Apartamentos de 78,5 e 108 m² em Jundiaí | F A Oliva',
  description:
    'Avalon Residencial, da F A Oliva. Apartamentos de 78,5 e 108 m², 2 e 3 dormitórios com suíte, 19 áreas de lazer, piscina coberta e aquecida. Vila Hortolândia, Jundiaí/SP.',
  keywords:
    'Avalon Residencial, apartamento Jundiaí, Vila Hortolândia, F A Oliva, 3 dormitórios com suíte, piscina aquecida',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/avalon' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Avalon Residencial, Vila Hortolândia, Jundiaí/SP',
    description:
      'Apartamentos de 78,5 e 108 m² com suíte, 19 áreas de lazer e piscina coberta e aquecida.',
    images: ['/avalon/a001.jpg'],
  },
};

export default function AvalonPage() {
  return (
    <div className={`${playfair.variable} ${montserrat.variable} avalon-root`}>
      <Avalon />
    </div>
  );
}
