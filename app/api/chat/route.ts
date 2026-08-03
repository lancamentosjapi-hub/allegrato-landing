import { NextResponse, type NextRequest } from 'next/server';

// Proxy server-side do chat de Atendimento Rápido → LIA.
//
// A chamada PRECISA sair daqui, nunca do navegador:
//  - o endpoint da LIA é http e o portal é https (mixed content bloquearia);
//  - a x-api-key é secreta e vazaria no bundle do cliente.
//
// O cliente (lib/chat.ts) manda só { conversationId, message }. Esta rota
// valida, repassa com a chave e traduz qualquer falha para uma mensagem
// amigável — o código cru da LIA nunca chega ao visitante.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONVERSATION_ID_RE = /^[A-Za-z0-9._:-]{8,128}$/;
const MAX_CHARS = 4000;
// A LIA corta em 45s e devolve 504; 60s é a nossa rede de segurança.
const TIMEOUT_MS = 60_000;

// Códigos de erro da LIA → texto que o visitante lê.
const FRIENDLY: Record<string, string> = {
  timeout: 'Demorei mais que o normal 😅 pode repetir?',
  conversation_busy: 'Ainda estou terminando a resposta anterior — só um instante 🌿',
  rate_limited: 'Recebi muitas mensagens seguidas. Aguarde alguns segundos e tente de novo.',
  message_too_long: 'Essa mensagem ficou muito longa. Pode resumir um pouco?',
  empty_message: 'Não recebi sua mensagem. Pode escrever de novo?',
};
const FALLBACK = 'Tive um problema para responder agora. Pode tentar de novo?';

type LiaResponse = {
  reply?: unknown;
  bubbles?: unknown;
  attachments?: unknown;
  error?: unknown;
  retry_after?: unknown;
};

function fail(status: number, error: string, retryAfter?: unknown) {
  const body: { error: string; retryAfter?: number } = { error };
  if (typeof retryAfter === 'number') body.retryAfter = retryAfter;
  return NextResponse.json(body, { status });
}

/** Texto das bolhas: prefere `bubbles`; cai para `reply` quando vier só ele. */
function readBubbles(data: LiaResponse): string[] {
  const source = Array.isArray(data.bubbles) ? data.bubbles : [data.reply];
  return source.filter((b): b is string => typeof b === 'string' && b.trim() !== '');
}

/** Só imagens com URL http(s) — evita renderizar javascript:/data: vindos de fora. */
function readAttachments(data: LiaResponse): { type: 'image'; url: string }[] {
  if (!Array.isArray(data.attachments)) return [];
  return data.attachments.flatMap((a) => {
    const url = (a as { url?: unknown })?.url;
    const type = (a as { type?: unknown })?.type;
    if (type !== 'image' || typeof url !== 'string') return [];
    return /^https?:\/\//i.test(url) ? [{ type: 'image' as const, url }] : [];
  });
}

export async function POST(req: NextRequest) {
  const url = process.env.LIA_API_URL;
  const apiKey = process.env.LIA_API_KEY;
  if (!url || !apiKey) {
    console.error('[chat] LIA_API_URL/LIA_API_KEY não configurados');
    return fail(500, FALLBACK);
  }

  const body = (await req.json().catch(() => null)) as {
    message?: unknown;
    conversationId?: unknown;
  } | null;
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : '';
  if (!message || message.length > MAX_CHARS || !CONVERSATION_ID_RE.test(conversationId)) {
    return fail(400, 'Não consegui ler sua mensagem. Pode escrever de novo?');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      // `history` não é enviado: a memória da conversa é da LIA, por conversationId.
      body: JSON.stringify({ channel: 'portal', conversationId, message }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    return fail(504, FRIENDLY.timeout);
  }

  const data = ((await res.json().catch(() => null)) ?? {}) as LiaResponse;

  if (!res.ok) {
    const code = typeof data.error === 'string' ? data.error : `http_${res.status}`;
    // 401 é erro de configuração nosso (chave errada/ausente) — precisa aparecer no log.
    if (res.status === 401) console.error('[chat] LIA recusou a x-api-key (401)');
    else console.error(`[chat] LIA respondeu ${res.status}: ${code}`);
    return fail(res.status, FRIENDLY[code] ?? FALLBACK, data.retry_after);
  }

  const bubbles = readBubbles(data);
  if (bubbles.length === 0) {
    console.error('[chat] LIA respondeu 200 sem texto');
    return fail(502, FALLBACK);
  }

  return NextResponse.json({ bubbles, attachments: readAttachments(data) });
}
