/**
 * Dados institucionais/legais da Lotus — fonte única de verdade.
 *
 * Antes, a linha de rodapé "© ... CRECI ... CNPJ ..." estava copiada literal
 * em ~10 componentes. Centralizar aqui evita divergência e deixa a troca dos
 * números reais num só lugar.
 *
 * TODO go-live: substituir CRECI_PJ e CNPJ pelos números reais da empresa.
 * Enquanto forem placeholders (00000/00.000...), a linha legal é omitida do
 * rodapé para não exibir dados falsos em produção (ver `footerLegalLine`).
 */

export const SITE = {
  nome: 'Lotus Brokers',
  creciPj: 'CRECI PJ 00000-J', // TODO: número real do CRECI PJ
  cnpj: 'CNPJ 00.000.000/0001-00', // TODO: CNPJ real
  regiao: 'Jundiaí · Itupeva · SP',
  ano: 2026,
} as const;

/** true enquanto o valor ainda é placeholder. Heurística: um número legal real
 *  não tem uma sequência de 4+ zeros seguidos; os placeholders atuais têm
 *  ("00000-J", "00.000.000/0001-00"). */
function isPlaceholder(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 0 || /0{4,}/.test(digits);
}

/**
 * Linha legal do rodapé. Monta "© ANO Nome · CRECI · CNPJ · Região",
 * omitindo CRECI/CNPJ enquanto forem placeholders — assim não vaza
 * "CRECI 00000" em produção, mas volta sozinho quando os reais entrarem.
 */
export function footerLegalLine(): string {
  const partes: string[] = [`© ${SITE.ano} ${SITE.nome}`];
  if (!isPlaceholder(SITE.creciPj)) partes.push(SITE.creciPj);
  if (!isPlaceholder(SITE.cnpj)) partes.push(SITE.cnpj);
  partes.push(SITE.regiao);
  return partes.join(' · ');
}
