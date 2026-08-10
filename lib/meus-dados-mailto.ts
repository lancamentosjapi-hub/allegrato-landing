export interface MeusDadosInput {
  nome: string;
  email: string;
  telefone?: string;
  direito: string;
  descricao: string;
}

// Monta um mailto: pré-preenchido para o canal de direitos LGPD.
// ponytail: mailto — sem protocolo/persistência; trocar por /api/meus-dados
// quando o backend do doc 8b (consent_log) existir.
export function buildMeusDadosMailto(input: MeusDadosInput): string {
  const to = 'atendimento@lotusbrokers.com.br';
  const subject = `Pedido LGPD, ${input.direito}`;
  const body = [
    `Nome: ${input.nome}`,
    `E-mail: ${input.email}`,
    input.telefone ? `Telefone: ${input.telefone}` : null,
    `Direito solicitado: ${input.direito}`,
    '',
    'Descrição:',
    input.descricao,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
