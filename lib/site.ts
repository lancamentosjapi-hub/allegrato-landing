/**
 * Dados institucionais/legais da Lotus — fonte única de verdade.
 *
 * Antes, a linha de rodapé "© ... CRECI ... CNPJ ..." estava copiada literal
 * em ~10 componentes. Centralizar aqui evita divergência e deixa a troca dos
 * números reais num só lugar.
 *
 * CRECI e CNPJ reais informados pela Lotus em 26/08/2026. A guarda
 * isPlaceholder continua no código: se algum dia um valor voltar a ser
 * genérico, a linha legal se omite sozinha em vez de publicar número falso.
 */

export const SITE = {
  nome: 'Lotus Brokers',
  /** Razão social registrada. O campo nome acima é o fantasia, usado na interface. */
  razaoSocial: 'Lotus Brokers Negócios Imobiliários',
  endereco: 'Av. José Luiz Sereno, 655, sala 5, Jardim Ermida II, Jundiaí/SP',
  creciPj: 'CRECI 054615-J',
  cnpj: 'CNPJ 67.767.385/0001-98',
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
