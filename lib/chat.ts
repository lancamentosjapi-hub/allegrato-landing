/**
 * Camada de serviço do Atendimento Rápido (chat do portal).
 *
 * A UI (components/AtendimentoChat.tsx) só conhece este módulo:
 *  - tipos ChatMessage / Conversation
 *  - sendMessage(text, conversationId) → fala com a LIA via /api/chat
 *  - load/save de sessão (histórico dura enquanto a aba viver)
 *
 * A LIA fica atrás de app/api/chat/route.ts: a URL e a x-api-key vivem só no
 * servidor. Aqui não há endpoint externo, chave nem lógica de atendimento.
 *
 * O histórico NÃO é enviado: a memória da conversa é da LIA, indexada pelo
 * conversationId (o mesmo `Conversation.id` que persistimos na sessão).
 */

export type ChatRole = 'user' | 'assistant';

export type ChatAttachment = { type: 'image'; url: string };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO, string para serializar em sessionStorage sem conversão
  status?: 'sending' | 'sent' | 'error';
  attachments?: ChatAttachment[];
};

export type Conversation = {
  id: string;
  messages: ChatMessage[];
};

/** Resposta da LIA: uma ou mais bolhas, renderizadas em sequência. */
export type ChatReply = {
  bubbles: string[];
  attachments: ChatAttachment[];
};

export function newConversation(): Conversation {
  return { id: newId(), messages: [] };
}

export function newMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: newId(),
    role,
    content,
    createdAt: new Date().toISOString(),
    status: 'sent',
  };
}

function newId(): string {
  // UUID v4 cabe no formato aceito pela LIA (8–128 chars, [A-Za-z0-9._:-]).
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* Service — conversa com a LIA através da nossa rota server-side      */
/* ------------------------------------------------------------------ */

export const MAX_MESSAGE_CHARS = 4000;

// A LIA leva 15–25s por resposta e a rota corta em 60s; aqui esperamos um
// pouco mais para que o texto de erro venha do servidor, não de um abort local.
const CLIENT_TIMEOUT_MS = 70_000;

const FALLBACK_ERROR = 'Tive um problema para responder agora. Pode tentar de novo?';

export async function sendMessage(text: string, conversationId: string): Promise<ChatReply> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, conversationId }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch {
    throw new Error('Demorei mais que o normal 😅 pode repetir?');
  }

  const data = (await res.json().catch(() => null)) as
    | { bubbles?: string[]; attachments?: ChatAttachment[]; error?: string }
    | null;

  if (!res.ok || !data?.bubbles?.length) {
    throw new Error(typeof data?.error === 'string' ? data.error : FALLBACK_ERROR);
  }
  return { bubbles: data.bubbles, attachments: data.attachments ?? [] };
}

/* ------------------------------------------------------------------ */
/* Persistência de sessão                                              */
/* ------------------------------------------------------------------ */

export const CHAT_STORAGE_KEY = 'lotus-atendimento-chat';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function loadConversation(storage: StorageLike): Conversation | null {
  try {
    const raw = storage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Conversation;
    if (!data || typeof data.id !== 'string' || !Array.isArray(data.messages)) {
      return null;
    }
    // Mensagem presa em "sending" (aba fechada no meio do envio) vira erro,
    // para o usuário poder reenviar em vez de ver um loading eterno.
    for (const m of data.messages) {
      if (m.status === 'sending') m.status = 'error';
    }
    return data;
  } catch {
    return null;
  }
}

export function saveConversation(storage: StorageLike, conv: Conversation): void {
  try {
    storage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conv));
  } catch {
    // storage cheio/indisponível (modo privado) — chat segue só em memória
  }
}
