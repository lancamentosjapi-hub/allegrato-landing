import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import './sky-videiras.css';
import SkyVideiras from '@/components/SkyVideiras';
import AtalhosLanding from '@/components/AtalhosLanding';

// Mesmo par de fontes do fonte estático, auto-hospedado pelo next/font.
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
  title: 'SKY Videiras, Apartamentos 2 e 3 dorms com suíte em Jundiaí',
  description:
    'SKY Videiras, da SEBEL Empreendimentos. Apartamentos de 2 e 3 dormitórios com suíte, de 56,96 a 83,31 m², lazer completo no rooftop com vista para a Serra do Japi. Jd. Quintas das Videiras, Jundiaí/SP. Obras iniciadas.',
  keywords:
    'SKY Videiras, apartamento Jundiaí, Quintas das Videiras, SEBEL, rooftop, Serra do Japi, 3 dormitórios com suíte',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/sky-videiras' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'SKY Videiras, Jd. Quintas das Videiras, Jundiaí/SP',
    description:
      'De 56,96 a 83,31 m², 2 e 3 dormitórios com suíte e lazer no rooftop com vista para a Serra do Japi.',
    images: ['/sky-videiras/a001.jpg'],
  },
};

export default function SkyVideirasPage() {
  return (
    <div className={`${playfair.variable} ${montserrat.variable} sky-root`}>
      <SkyVideiras />
      <AtalhosLanding />
    </div>
  );
}
