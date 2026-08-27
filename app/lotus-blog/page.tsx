import type { Metadata } from 'next';
import LotusBlog from '@/components/LotusBlog';
import { POSTS } from '@/lib/blog-posts';
import { publicados } from '@/lib/blog-agenda';

/**
 * Revalida de hora em hora para os artigos agendados entrarem no ar sem
 * depender de um deploy. Sem isso a pagina ficaria estatica no build e um
 * artigo marcado para amanha so apareceria no proximo push.
 *
 * A janela de ate uma hora depois da meia-noite e aceitavel para blog, e e
 * o mesmo intervalo que /lotus-home ja usa.
 */
export const revalidate = 3600;

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
  // O filtro roda no servidor: LotusBlog e componente de cliente, e decidir a
  // data la dentro daria divergencia de hidratacao na virada do dia.
  return <LotusBlog posts={publicados(POSTS)} />;
}
