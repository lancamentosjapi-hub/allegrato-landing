import LotusHome from '@/components/LotusHome';
import { type DevelopmentCard } from '@/lib/developments';
import { getLancamentos, isApresentavel, type LancamentoCard } from '@/lib/lancamentos';

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

// Na home, só entram empreendimentos com página própria. Sem landing, o card
// mandava direto para o WhatsApp — a vitrine da home é para levar o visitante a
// conhecer o empreendimento, não para pular a etapa e cair no atendimento.
// Em /lotus-lancamentos eles continuam aparecendo: lá quem chega já está
// procurando, e falar com alguém é um desfecho legítimo.
const temPaginaPropria = (c: LancamentoCard) => Boolean(c.href);

export default async function LotusHomePage() {
  // Fonte = SÓ o banco (Supabase). Sem mock de fallback: a home mostra
  // exclusivamente os lançamentos apresentáveis (foto + localização) da view
  // portal_lancamentos. Se vier vazio (banco sem dados / falha), passa undefined
  // e o componente cai no seu fallback interno — rede de segurança contra página
  // vazia, não completa a lista com mock.
  const cards = await getLancamentos();
  const apresentaveis = cards.filter(isApresentavel).filter(temPaginaPropria).map(toDevelopment);
  const developments = apresentaveis.length > 0 ? apresentaveis : undefined;

  return <LotusHome developments={developments} />;
}
