import type { Metadata } from 'next';
import './avela.css';
import Avela from '@/components/Avela';
import AtalhosLanding from '@/components/AtalhosLanding';

// Metadata portada do <helmet> de avela/index.html (paridade de SEO com o estático).
export const metadata: Metadata = {
  title:
    'Avelã Vila Residencial, Apartamentos em Itupeva/SP | A beleza do campo no coração da cidade',
  description:
    'Avelã Vila Residencial em Itupeva/SP: apartamentos de 2 e 3 dormitórios, de 66 a 87 m², com gardens privativos e mais de 12 espaços de lazer. Agende sua visita.',
  keywords:
    'Avelã Vila Residencial, apartamento Itupeva, imóvel Itupeva SP, apartamento 2 dormitórios, apartamento 3 dormitórios, garden, lazer completo, Mac Lucer',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/avela' },
  openGraph: {
    type: 'website',
    title: 'Avelã Vila Residencial, Itupeva/SP',
    description:
      'A beleza do campo no coração da cidade. Apartamentos de 66 a 87 m² com lazer completo em Itupeva/SP.',
  },
};

export default function AvelaPage() {
  return (
    <>
      <Avela />
      <AtalhosLanding />
    </>
  );
}
