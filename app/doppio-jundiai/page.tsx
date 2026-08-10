import type { Metadata } from 'next';
import './doppio-jundiai.css';
import DoppioJundiai from '@/components/DoppioJundiai';
import VoltarParaLancamentos from '@/components/VoltarParaLancamentos';

// Metadata portada do <helmet> do fonte estático.
export const metadata: Metadata = {
  title: 'Doppio Jundiaí | Alto Padrão em Campos Elísios, 156 a 442 m²',
  description:
    'Doppio Jundiaí: apartamentos de alto padrão de 156 a 442 m² no Jardim Campos Elísios, com living de pé-direito duplo de 5,60 m, gardens e coberturas duplex.',
  keywords:
    'Doppio Jundiaí, apartamento alto padrão Jundiaí, Campos Elísios, pé-direito duplo, cobertura duplex, garden Jundiaí',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/doppio-jundiai' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Doppio Jundiaí, Alto padrão em Campos Elísios',
    description:
      'Living com pé-direito duplo de 5,60 m. De 156 a 442 m², em Jundiaí/SP.',
    images: ['/doppio-jundiai/a015.jpg'],
  },
};

export default function DoppioJundiaiPage() {
  return (
    <>
      <DoppioJundiai />
      <VoltarParaLancamentos />
    </>
  );
}
