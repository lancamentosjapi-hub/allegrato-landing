import type { Metadata } from 'next';
import LotusBlog from '@/components/LotusBlog';

// Metadata portada do <helmet> do fonte estático (lotus-blog, dc-runtime).
export const metadata: Metadata = {
  title: 'Blog Lotus: notícias da cidade e do mercado imobiliário',
  description:
    'Blog Lotus: notícias de Jundiaí e Itupeva, mercado imobiliário sem juridiquês, guias de compra, venda e locação e a vida na região da Serra do Japi.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-blog',
  },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.lotusbrokers.com.br/lotus-blog',
    title: 'Blog Lotus: notícias da cidade e do mercado imobiliário',
    description:
      'Notícias de Jundiaí e Itupeva, mercado imobiliário e a vida na região da Serra do Japi, por quem vive aqui.',
  },
};

export default function LotusBlogPage() {
  return <LotusBlog />;
}
