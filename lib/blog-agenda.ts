/**
 * Agendamento de publicação do blog.
 *
 * Os artigos chegam da Lotus em lote, com data marcada para cada um ("o 23
 * hoje, o 24 amanhã"). Antes não havia como agendar: o campo `date` do post é
 * texto de exibição ("Ago 2026"), não data, então subir o lote inteiro
 * colocava todos no ar de uma vez.
 *
 * A regra mora aqui, separada dos dados e do componente, porque é a única
 * parte com lógica de verdade — e a única que dá para testar sem montar a
 * página.
 *
 * FUSO. A comparação é feita no dia de Jundiaí, não no do servidor. Em UTC,
 * um artigo marcado para 28/08 apareceria às 21h do dia 27 no horário de
 * Brasília. Intl resolve o fuso sem trazer biblioteca de data.
 *
 * GRANULARIDADE. Dia, não hora. A Lotus agenda por data, e prometer hora
 * exigiria hora no cadastro e revalidação mais curta do que a de uma hora que
 * as rotas usam hoje.
 */

const FUSO_DA_LOTUS = 'America/Sao_Paulo';

// 'en-CA' formata como YYYY-MM-DD, que é a mesma forma de `publicadoEm` e
// permite comparar as duas datas como texto, sem parse nem timezone no meio.
const DIA = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO_DA_LOTUS,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Data de hoje em Jundiaí, no formato YYYY-MM-DD. */
export function diaEmJundiai(agora: Date): string {
  return DIA.format(agora);
}

/** Qualquer item com data de publicação agendada (YYYY-MM-DD). */
export type ComAgenda = { publicadoEm: string };

/** O artigo já pode aparecer? Sai no próprio dia marcado, não no seguinte. */
export function jaSaiu(publicadoEm: string, agora: Date): boolean {
  return publicadoEm <= diaEmJundiai(agora);
}

/**
 * Só os artigos cuja data já chegou, na ordem original da lista.
 *
 * A ordem é preservada de propósito: quem escreve a lista decide o destaque
 * (o primeiro item vira a capa do blog), e reordenar aqui tiraria esse
 * controle de quem edita o conteúdo.
 */
export function publicados<T extends ComAgenda>(itens: readonly T[], agora: Date = new Date()): T[] {
  return itens.filter((item) => jaSaiu(item.publicadoEm, agora));
}
