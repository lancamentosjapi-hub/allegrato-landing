import type { Metadata, Viewport } from 'next';
import './portal-dos-lagos.css';
import PortalDosLagos from '@/components/PortalDosLagos';
import AtalhosLanding from '@/components/AtalhosLanding';
import RodapeVoltarLancamentos from '@/components/RodapeVoltarLancamentos';

// Metadata portada do <head> do fonte portal-dos-lagos (title/description EXATOS).
// canonical / OpenGraph seguem a convenção das demais landings.
export const viewport: Viewport = { themeColor: '#091b20' };

export const metadata: Metadata = {
  title: 'Portal dos Lagos, Loteamento Residencial em Jundiaí',
  description:
    'Portal dos Lagos: loteamento residencial de alto padrão em Jundiaí/SP, a 45 min de São Paulo. Clube completo, portaria blindada e infraestrutura premium. Fale com um corretor.',
  robots: 'index, follow, max-image-preview:large',
  alternates: {
    // Era imobiliariajapi.com.br — apontava o canonical para o domínio antigo,
    // dizendo ao Google que a versão oficial desta página vive fora do site.
    // Alinhado com o domínio usado por todas as outras landings.
    canonical: 'https://www.lotusbrokers.com.br/portal-dos-lagos',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Portal dos Lagos, Loteamento Residencial em Jundiaí',
    description:
      'Portal dos Lagos: loteamento residencial de alto padrão em Jundiaí/SP, a 45 min de São Paulo. Clube completo, portaria blindada e infraestrutura premium.',
    images: ['/portal-dos-lagos/a001.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal dos Lagos, Loteamento Residencial em Jundiaí',
    description:
      'Clube completo, portaria blindada e infraestrutura premium em Jundiaí/SP, a 45 min de São Paulo.',
    images: ['/portal-dos-lagos/a001.jpg'],
  },
};

export default function PortalDosLagosPage() {
  return (
    <>
      <PortalDosLagos />
      <RodapeVoltarLancamentos />
      <AtalhosLanding />
    </>
  );
}
