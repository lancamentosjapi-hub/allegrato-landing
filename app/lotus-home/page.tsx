import LotusHome from '@/components/LotusHome';
import { type DevelopmentCard } from '@/lib/developments';
import { getLancamentos, isApresentavel, type LancamentoCard } from '@/lib/lancamentos';
import { getImoveisBusca } from '@/lib/imoveis';
import { BAIRROS } from '@/lib/bairros';
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

export default async function LotusHomePage() {
  // Fonte = SÓ o banco (Supabase). Sem mock de fallback: a home mostra
  // exclusivamente os lançamentos apresentáveis (foto + localização) da view
  // portal_lancamentos. Se vier vazio (banco sem dados / falha), passa undefined
  // e o componente cai no seu fallback interno — rede de segurança contra página
  // vazia, não completa a lista com mock.
  const [cards, imoveis] = await Promise.all([getLancamentos(), getImoveisBusca()]);
  const apresentaveis = cards.filter(isApresentavel).map(toDevelopment);
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

  return <LotusHome developments={developments} bairroCounts={bairroCounts} />;
}
