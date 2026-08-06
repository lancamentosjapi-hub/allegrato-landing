import type { Metadata, Viewport } from 'next';
import './manawa.css';
import Manawa from '@/components/Manawa';

// Metadata portada do <head> de manawa/index.html (paridade de SEO com o estático).
export const viewport: Viewport = { themeColor: '#2c1e10' };

export const metadata: Metadata = {
  title: 'Manawa Residencial em Jundiaí | 2 e 3 Dormitórios com Suíte',
  description:
    'Manawa Residencial em Jundiaí/SP: apartamentos de 65,96 a 102,79 m², 2 e 3 dormitórios com suíte, +15 itens de lazer, vagas 100% cobertas e infraestrutura para carro elétrico. Obras em andamento. Agende sua visita.',
  keywords:
    'Manawa Residencial, apartamento Jundiaí, 2 dormitórios Jundiaí, 3 dormitórios suíte, lançamento Jundiaí, apartamento com lazer Jundiaí, Recanto Quarto Centenário, MacLucer',
  robots: 'index, follow, max-image-preview:large',
  alternates: {
    // Era imobiliariajapi.com.br — mesmo problema do Portal dos Lagos: o
    // canonical apontava para o domínio antigo.
    canonical: 'https://www.lotusbrokers.com.br/manawa',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Manawa Residencial em Jundiaí | 2 e 3 Dormitórios com Suíte',
    description:
      '65,96 a 102,79 m², 2 e 3 dormitórios com suíte, +15 itens de lazer e vagas 100% cobertas. Obras em andamento em Jundiaí/SP.',
    images: [
      'https://maclucer.com.br/wp-content/uploads/2024/11/Banner-Manawa-site-Mac-Lucer-PSD1.jpg',
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function ManawaPage() {
  return <Manawa />;
}
