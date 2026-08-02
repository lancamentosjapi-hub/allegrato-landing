/**
 * Camada de serviço do Atendimento Rápido (chat do portal).
 *
 * A UI (components/AtendimentoChat.tsx) só conhece este módulo:
 *  - tipos ChatMessage / Conversation
 *  - sendMessage(text, history)  ← ponto ÚNICO de troca pela IA real
 *  - load/save de sessão (histórico dura enquanto a aba viver)
 *
 * Para conectar a IA existente depois: trocar o corpo de `sendMessage` por um
 * fetch a uma rota server-side (ex.: POST /api/chat) que guarda a API key no
 * servidor. Nada na UI precisa mudar.
 */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO — string para serializar em sessionStorage sem conversão
  status?: 'sending' | 'sent' | 'error';
};

export type Conversation = {
  id: string;
  messages: ChatMessage[];
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
  // crypto.randomUUID existe em todo runtime alvo (browser moderno + Node 24)
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* Service — hoje mock; amanhã a IA real                               */
/* ------------------------------------------------------------------ */

// ponytail: mock temporário; substituir por fetch à rota server-side da IA.
// "#erro" força falha para exercitar o estado de erro em dev/QA.
const MOCK_REPLIES = [
  'Perfeito! Me conta um pouco mais: qual bairro ou região você tem em mente? 🌿',
  'Entendi. E qual faixa de preço você está considerando?',
  'Ótimo, já tenho um bom panorama. Um dos nossos especialistas pode te mostrar as melhores opções — quer seguir por aqui ou prefere WhatsApp?',
  'Anotado! Algo mais que eu possa registrar para o atendimento?',
];

const MOCK_DELAY_MS = 900;

export async function sendMessage(
  text: string,
  history: ChatMessage[],
): Promise<string> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  if (text.includes('#erro')) {
    throw new Error('mock: falha simulada');
  }
  const userTurns = history.filter((m) => m.role === 'user').length;
  return MOCK_REPLIES[Math.min(userTurns, MOCK_REPLIES.length - 1)];
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
