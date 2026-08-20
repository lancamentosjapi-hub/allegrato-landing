import type { Metadata } from 'next';
import './allegrato.css';
import Allegrato from '@/components/Allegrato';
import AtalhosLanding from '@/components/AtalhosLanding';
import LightboxPlantas from '@/components/LightboxPlantas';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> do fonte estático.
export const metadata: Metadata = {
  title: 'Allegrato Residencial · Bairro Medeiros, Jundiaí, Minha Casa Minha Vida',
  description:
    'O apartamento mais completo do Medeiros para você sair do aluguel pagando pouco. Lazer entregue decorado, condomínio econômico e a segurança da Santa Angela. Lançamento MCMV em Jundiaí/SP.',
  keywords:
    'Allegrato Residencial, apartamento Medeiros, Jundiaí, Minha Casa Minha Vida, MCMV, Santa Angela, lançamento Jundiaí',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/allegrato' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Allegrato Residencial, Medeiros, Jundiaí/SP',
    description:
      'Lançamento Minha Casa Minha Vida no Medeiros: lazer entregue decorado e condomínio econômico.',
    images: ['/allegrato/a012.jpg'],
  },
};

export default function AllegratoPage() {
  return (
    <>
      <Allegrato />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
      <LightboxPlantas />
    </>
  );
}
