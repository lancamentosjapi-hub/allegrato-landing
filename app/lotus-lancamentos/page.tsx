import type { Metadata } from 'next';
import LotusLancamentos from '@/components/LotusLancamentos';
import { type EmpItem } from '@/lib/lancamentos-list-fallback';
import {
  getLancamentosList,
  isListItemApresentavel,
  type LancamentoListItem,
} from '@/lib/lancamentos';

// ISR: revalida a cada 1h. Mesmo padrão de app/lotus-home/page.tsx.
export const revalidate = 3600;

function toEmpItem(item: LancamentoListItem, i: number): EmpItem {
  // LancamentoListItem já espelha o shape de EmpItem; só falta `slot` (derivado).
  return {
    id: item.id,
    name: item.name,
    neighborhood: item.neighborhood,
    city: item.city,
    stage: item.stage,
    type: item.type,
    priceNum: item.priceNum,
    price: item.price,
    specs: item.specs,
    exclusive: item.exclusive,
    builder: item.builder,
    slot: `le-dyn-${i}`,
    img: item.img,
    href: item.href,
  };
}

// Merge Supabase × estático, por slug do nome (mesma lógica de mergeDevelopments
// da home): item apresentável do Supabase SUBSTITUI o estático de mesmo slug;
// estáticos sem match PERMANECEM; itens novos ENTRAM no fim. Assim a listagem
// migra item-a-item conforme o dash é preenchido, sem degradar filtros/ordenação.

// Metadata portada do <head>/<helmet> de lotus-lancamentos/index.html (paridade de SEO).
// TODO go-live: trocar canonical/og:url para o domínio final, remover noindex e publicar sitemap.
export const metadata: Metadata = {
  title: 'Lançamentos em Jundiaí e região | Lotus Brokers',
  description:
    'Conheça lançamentos selecionados em Jundiaí e região. Compare plantas, condições e estágios da obra com orientação especializada da Lotus Brokers.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-lancamentos',
  },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-lancamentos',
    title: 'Grandes escolhas começam antes da chave | Lotus Brokers',
    description:
      'Pré-lançamentos, imóveis em obras e prontos para morar, analisados por localização, projeto, condição e potencial.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD portados do estático (CollectionPage, FAQPage).
const collectionLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Lançamentos imobiliários em Jundiaí e Itupeva, Lotus Brokers',
  description:
    'Todos os empreendimentos em lançamento e pré-lançamento acompanhados pela Lotus Brokers em Jundiaí, Itupeva e região, com filtros por preço, cidade e estágio de obra.',
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Por que comprar um imóvel na planta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comprar na planta costuma oferecer o melhor preço (tabela de lançamento), condições de pagamento facilitadas direto com a construtora, potencial de valorização até a entrega e a possibilidade de escolher as melhores unidades.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comprar na planta vale a pena?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para quem pode esperar a obra, sim: o valor de entrada é menor, o pagamento é diluído e a valorização da entrega até a chave costuma superar a de um imóvel pronto. A Lotus ajuda a avaliar a construtora e o melhor momento de compra.',
      },
    },
  ],
};

export default async function LotusLancamentosPage() {
  // Fonte = SÓ o banco (Supabase). Sem merge com mock: a listagem mostra
  // exclusivamente os lançamentos do banco (foto + cidade). Se vier vazio,
  // passa undefined e o componente cai no fallback interno (rede de segurança).
  const list = await getLancamentosList();
  const apresentaveis = list.filter(isListItemApresentavel).map(toEmpItem);
  const emps = apresentaveis.length > 0 ? apresentaveis : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <LotusLancamentos emps={emps} />
    </>
  );
}
