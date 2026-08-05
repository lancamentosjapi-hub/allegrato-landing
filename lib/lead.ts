/**
 * Camada de serviço dos leads das landings.
 *
 * As landings (components/*.tsx) só conhecem `sendLead`. O webhook da LIA fica
 * atrás de app/api/lead/route.ts: a URL e o x-webhook-secret vivem só no
 * servidor.
 *
 * As funções puras (toE164, leadId, buildLeadPayload) moram aqui, e não dentro
 * da rota, para o teste importá-las sem arrastar `next/server` junto. Quem as
 * usa é a rota — o cliente manda os campos crus e o servidor deriva o resto,
 * porque chave de deduplicação não se aceita de entrada não confiável.
 */

export type Lead = {
  name?: string;
  phone?: string;
  email?: string;
  source: string; // "landing_allegrato" — sempre "landing_" + slug da rota
  interest: string; // nome do empreendimento — "Allegrato Residencial"
  message?: string;
};

const LIMITS = {
  name: 120,
  phone: 32,
  email: 200,
  source: 64,
  interest: 200,
  message: 1000,
} as const;

/** Remove caracteres de controle, trimming de espaços e corta no limite do campo. */
function clean(raw: string | undefined, max: number): string {
  if (!raw) return '';
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

/**
 * Telefone brasileiro para E.164.
 *
 * Fora do padrão conhecido devolvemos os dígitos crus em vez de string vazia:
 * o contrato diz que telefone inválido não derruba o evento, e um número
 * torto ainda é mais útil para um humano do que nenhum número.
 */
export function toE164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10 || d.length === 11) return '+55' + d; // fixo ou celular com DDD
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return '+' + d;
  return d;
}

/**
 * Chave natural de deduplicação: "portal:<source>:<telefone ou nome>".
 *
 * Determinística e sem estado, então a mesma pessoa preenchendo o mesmo
 * formulário duas vezes gera o mesmo id — inclusive depois de recarregar a
 * página, o que um UUID guardado em ref não faria.
 */
export function leadId(source: string, phone: string, name: string): string {
  const digits = toE164(phone).replace(/\D/g, '');
  const key =
    digits ||
    name.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 60);
  return `portal:${source}:${key}`;
}

/** Envelope do webhook. Campos vazios são omitidos, não enviados em branco. */
export function buildLeadPayload(lead: Lead): {
  event: 'lead.created';
  data: Record<string, string>;
} {
  const name = clean(lead.name, LIMITS.name);
  const phone = toE164(clean(lead.phone, LIMITS.phone));
  const source = clean(lead.source, LIMITS.source);

  const data: Record<string, string> = {
    id: leadId(source, phone, name),
    source,
    interest: clean(lead.interest, LIMITS.interest),
  };
  if (name) data.name = name;
  if (phone) data.phone = phone;

  const email = clean(lead.email, LIMITS.email);
  if (email) data.email = email;

  const message = clean(lead.message, LIMITS.message);
  if (message) data.message = message;

  return { event: 'lead.created', data };
}

/* ------------------------------------------------------------------ */
/* Cliente — usado pelas landings                                      */
/* ------------------------------------------------------------------ */

/**
 * Registra o lead. Dispara e NÃO espera, de propósito.
 *
 * Quem chama faz `window.open(WhatsApp)` logo em seguida, e um `await` aqui
 * tiraria o open da pilha do gesto do usuário — o bloqueador de pop-up mataria
 * a aba do WhatsApp. Registrar o lead nunca pode piorar a experiência de quem
 * acabou de preencher o formulário.
 *
 * `keepalive` mantém o POST vivo se a pessoa fechar a aba logo depois de enviar.
 * Falha é silenciosa para o visitante e fica logada no servidor.
 */
export function sendLead(lead: Lead): void {
  void fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
    keepalive: true,
  }).catch(() => {
    // rede caiu no meio: o visitante segue para o WhatsApp normalmente
  });
}
