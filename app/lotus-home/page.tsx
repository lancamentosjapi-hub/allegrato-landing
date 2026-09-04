import LotusHome from '@/components/LotusHome';
import { type DevelopmentCard } from '@/lib/developments';
import { getLancamentos, isApresentavel, type LancamentoCard } from '@/lib/lancamentos';
import { getImoveisBusca } from '@/lib/imoveis';
import { BAIRROS } from '@/lib/bairros';
import { POSTS } from '@/lib/blog-posts';
import { publicados } from '@/lib/blog-agenda';
import { nomesDoBairro } from '@/lib/bairros-taxonomia';

// ISR: revalida a cada 1h. O Portal é praticamente read-only; revalidação
// on-demand (trigger do dash → /api/revalidate) entra numa fase futura.
export const revalidate = 3600;

function toDevelopment(c: LancamentoCard): DevelopmentCard {
  return {
    name: c.name,
    location: c.location,
    stage: c.stage,
    builder: c.builder,
    specs: c.specs,
    price: c.price,
    exclusive: c.exclusive,
    img: c.img,
    href: c.href,
  };
}

// A regra "só entra quem tem página própria" mudou de lugar: agora vale também
// para /lotus-lancamentos, então mora em lib/lancamentos.ts e as duas páginas a
// herdam. Mantê-la aqui viraria uma segunda cópia para divergir.

/**
 * Quais lançamentos abrem a vitrine da home.
 *
 * /lotus-lancamentos ordena por nome, e a home mostra só cinco. Sem esta
 * lista, um lançamento novo só apareceria na home se o nome começasse com A:
 * o Epic e o Mistral Jundiaí, pedidos em 04/09/2026, ficavam de fora pela
 * letra, atrás de Allegrato, Altissimi, Altos da Avenida, Auten e Authoria.
 *
 * Os slugs daqui vêm primeiro, na ordem escrita; o resto segue a ordem da
 * listagem. Slug que não existir mais é ignorado, então tirar uma landing do
 * ar não quebra a home nem exige mexer aqui.
 */
const DESTAQUES_DA_HOME: readonly string[] = ['/epic-jundiai', '/mistral-jundiai'];

/** Os destaques na frente, preservando a ordem original para os demais. */
function comDestaquesNaFrente(lista: DevelopmentCard[]): DevelopmentCard[] {
  const destaque = (d: DevelopmentCard) => DESTAQUES_DA_HOME.indexOf(d.href ?? "");
  return [...lista].sort((a, b) => {
    const ia = destaque(a), ib = destaque(b);
    if (ia === ib) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export default async function LotusHomePage() {
  // Fonte = SÓ o banco (Supabase). Sem mock de fallback: a home mostra
  // exclusivamente os lançamentos apresentáveis (foto + localização) da view
  // portal_lancamentos. Se vier vazio (banco sem dados / falha), passa undefined
  // e o componente cai no seu fallback interno — rede de segurança contra página
  // vazia, não completa a lista com mock.
  const [cards, imoveis] = await Promise.all([getLancamentos(), getImoveisBusca()]);
  const apresentaveis = comDestaquesNaFrente(cards.filter(isApresentavel).map(toDevelopment));
  const developments = apresentaveis.length > 0 ? apresentaveis : undefined;

  // Contagem real por bairro, pelo MESMO critério de getImoveisPorBairro: o
  // guia conta a si e aos sub-bairros que pertencem a ele (ver
  // lib/bairros-taxonomia). Comparar só com b.nome zerava o card do Eloy
  // Chaves na home enquanto a página do bairro listava três imóveis — os dele
  // estão cadastrados como Jardim Ermida I/II.
  const bairroCounts: Record<string, number> = {};
  for (const b of BAIRROS) {
    const alvos = new Set(nomesDoBairro(b.nome).map((n) => n.trim().toLowerCase()));
    bairroCounts[b.slug] = imoveis.filter((im) => alvos.has(im.neighborhood.trim().toLowerCase())).length;
  }

  // Os tres destaques do blog saem da MESMA fonte de /lotus-blog e respeitam o
  // agendamento: artigo marcado para amanha nao pode vazar na home hoje.
  const destaques = publicados(POSTS).slice(0, 3);

  return (
    <LotusHome developments={developments} bairroCounts={bairroCounts} posts={destaques} />
  );
}
