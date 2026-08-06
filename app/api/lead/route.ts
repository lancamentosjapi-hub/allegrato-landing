import { NextResponse, type NextRequest } from 'next/server';
import { buildLeadPayload, type Lead } from '@/lib/lead';

// Proxy server-side dos formulários das landings → webhook de leads da LIA.
//
// A chamada PRECISA sair daqui, nunca do navegador: o x-webhook-secret é
// secreto e vazaria no bundle, e qualquer um poderia injetar lead no CRM.
//
// O cliente (lib/lead.ts) manda os campos crus. Esta rota valida, deriva o id
// de deduplicação e o telefone E.164, e repassa com o segredo.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Ninguém está esperando esta resposta — o visitante já foi para o WhatsApp.
// Segurar conexão além disso só ocupa a instância. TIMEOUT_MS é por
// tentativa: com as duas tentativas do postWebhook + RETRY_DELAY_MS, o pior
// caso fim-a-fim é ~12s (2 × TIMEOUT_MS + RETRY_DELAY_MS).
const TIMEOUT_MS = 5_750;
const RETRY_DELAY_MS = 500;

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;

// Lead real tem algumas centenas de bytes; 16 KB é folga generosa. Sem teto,
// req.json() abaixo bufferiza o body inteiro — App Router não tem limite de
// body parser, e este repo não tem middleware.ts.
const MAX_BODY_BYTES = 16 * 1024;

// source é sempre "landing_" + slug da rota (kebab-case), nunca texto livre —
// mesmo padrão de CONVERSATION_ID_RE em app/api/chat/route.ts. Também é
// insumo do id de dedup (lib/lead.ts): sem validar o formato, dava pra
// forjar o id de um lead de outra landing só sabendo o telefone.
const SOURCE_RE = /^landing_[a-z0-9-]{1,48}$/;

// ponytail: rate limit em memória — é por instância e zera no redeploy. Se o
// portal passar a rodar com mais de uma instância, isto vira Redis/upstash.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // ponytail: limpeza grosseira do Map — sem isto ele cresce sem teto com IPs
  // que nunca voltam. Se virar problema medido, trocar por TTL por chave.
  if (hits.size > 5000) hits.clear();

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(req: NextRequest): string {
  // O último IP da lista é o que o proxy mais próximo do server anexou
  // (confiável); o primeiro é o que o cliente alega no header — forjável, e
  // trocando esse valor a cada request dava pra furar o rate limit abaixo.
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd?.split(',').pop()?.trim() || 'unknown';
  return ip.slice(0, 45); // teto de tamanho de chave do Map (IPv6 cabe em 45)
}

/**
 * Uma retentativa em falha de rede, 5xx, 408 (timeout) ou 429 (rate limit) do
 * webhook. Sem ela, um soluço perde o lead em silêncio — exatamente o
 * problema que este código resolve. Outro 4xx não retenta: payload errado
 * não melhora repetindo.
 */
async function postWebhook(
  url: string,
  secret: string,
  payload: unknown,
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': secret },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store',
      });
      if (res.ok) return true;
      // 408/429 são soluço transitório do webhook (timeout/rate limit),
      // igual 5xx — vale retentar. Outro 4xx é payload errado: repetir não ajuda.
      const retryable = res.status >= 500 || res.status === 408 || res.status === 429;
      if (!retryable) {
        console.error(`[lead] webhook recusou (${res.status})`);
        return false;
      }
      console.error(`[lead] webhook respondeu ${res.status}, tentativa ${attempt + 1}`);
    } catch {
      console.error(`[lead] webhook inacessível, tentativa ${attempt + 1}`);
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  return false;
}

export async function POST(req: NextRequest) {
  const url = process.env.LIA_LEAD_WEBHOOK_URL;
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.error('[lead] LIA_LEAD_WEBHOOK_URL/LEAD_WEBHOOK_SECRET não configurados');
    return NextResponse.json({ error: 'unavailable' }, { status: 500 });
  }

  // Content-Length ausente/ilegível também rejeita — não dá pra escapar do
  // teto só omitindo o header. Fica antes do rate limit e do req.json() de
  // propósito: precisa rodar antes do corpo ser bufferizado.
  const rawLength = req.headers.get('content-length');
  const contentLength = Number(rawLength);
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_BODY_BYTES) {
    console.error(`[lead] payload recusado por content-length inválido/grande (${rawLength})`);
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }

  const body = (await req.json().catch(() => null)) as Partial<Lead> | null;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const lead: Lead = {
    name: str(body?.name),
    phone: str(body?.phone),
    email: str(body?.email),
    source: str(body?.source),
    interest: str(body?.interest),
    message: str(body?.message),
  };

  const payload = buildLeadPayload(lead);

  // Validar o valor normalizado (pós-clean), não o bruto: "   " passa no
  // truthy check do lead cru, mas vira "" depois do clean() em buildLeadPayload.
  if (!SOURCE_RE.test(payload.data.source) || !payload.data.interest) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  // O contrato exige pelo menos um dos dois; sem eles o lead é inútil.
  if (!payload.data.name && !payload.data.phone) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Rate limit só depois de validado: senão, alguns submits em branco do
  // mesmo IP consomem o teto e derrubam o próximo lead de verdade.
  const ip = clientIp(req);
  // Chave 'unknown' = sem x-forwarded-for utilizável (app acessado direto,
  // proxy mal configurado, ou um CDN na frente que sempre repassa o mesmo IP
  // de borda). Sem IP de cliente não dá pra limitar por IP — e limitar mesmo
  // assim juntaria as 23 landings num balde só. Num formulário público,
  // alguns leads de spam são um resultado bem melhor que perder leads reais
  // em massa, então pulamos o limite em vez de aplicá-lo.
  if (ip !== 'unknown' && rateLimited(ip)) {
    console.error(`[lead] rate limit atingido para ${payload.data.id} (ip=${ip})`);
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const ok = await postWebhook(url, secret, payload);
  if (!ok) {
    // O visitante não vê isto — ele já foi para o WhatsApp. O log é o alarme.
    console.error(`[lead] registro falhou para ${payload.data.id}`);
    return NextResponse.json({ error: 'webhook_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
