import type { Metadata } from 'next';
import './maita.css';
import Maita from '@/components/Maita';

// Metadata portada do <head> do fonte estático. O canonical aponta para o domínio
// do portal (o original apontava para japilancamentos.com.br).
export const metadata: Metadata = {
  title: 'Maitá Residencial Jundiaí | Apartamentos 2 e 3 Dormitórios',
  description:
    'Maitá Residencial em Jundiaí/SP: apartamentos de 2 e 3 dormitórios com suíte, 63 a 80 m², lazer completo e conexão com a natureza. Obras iniciadas.',
  keywords:
    'Maitá Residencial, apartamento Jundiaí, lançamento Jundiaí, apartamento 2 dormitórios, apartamento 3 dormitórios, Mac Lucer, Vila Marlene',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/maita' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Maitá Residencial Jundiaí | 2 e 3 Dormitórios com Lazer Completo',
    description:
      'Apartamentos de 63 a 80 m² em Jundiaí, conectados com a natureza. Lazer completo, obras iniciadas.',
    images: ['/maita/a007.jpg'],
  },
};

export default function MaitaPage() {
  return <Maita />;
}
