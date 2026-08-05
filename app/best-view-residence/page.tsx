import type { Metadata } from 'next';
import './best-view-residence.css';
import BestViewResidence from '@/components/BestViewResidence';

// Metadata portada do <helmet> do fonte estático.
export const metadata: Metadata = {
  title: 'Best View Residence — Swiss Park, Campinas/SP | 2 e 3 dorms. com suíte',
  description:
    'Best View Residence no Swiss Park, Campinas/SP: apartamentos de 2 e 3 dormitórios com suíte, de 62 a 78 m² e opções Garden, 2 vagas cobertas e 22 itens de lazer.',
  keywords:
    'Best View Residence, Swiss Park, apartamento Campinas, 2 dormitórios com suíte, 3 dormitórios, garden, F A Oliva',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/best-view-residence' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Best View Residence — Swiss Park, Campinas/SP',
    description:
      'Permita-se novos horizontes. Apartamentos de 62 a 78 m² com suíte, 2 vagas cobertas e lazer completo.',
    images: ['/best-view-residence/a012.jpg'],
  },
};

export default function BestViewResidencePage() {
  return <BestViewResidence />;
}
