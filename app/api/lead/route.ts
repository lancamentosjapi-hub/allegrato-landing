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
// Segurar conexão além disso só ocupa a instância.
const TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 500;

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;

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
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Uma retentativa em falha de rede ou 5xx. Sem ela, um soluço do webhook perde
 * o lead em silêncio — que é exatamente o problema que este código resolve.
 * 4xx não retenta: payload errado não melhora repetindo.
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
      if (res.status < 500) {
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

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
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

  if (!lead.source || !lead.interest) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const payload = buildLeadPayload(lead);
  // O contrato exige pelo menos um dos dois; sem eles o lead é inútil.
  if (!payload.data.name && !payload.data.phone) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const ok = await postWebhook(url, secret, payload);
  if (!ok) {
    // O visitante não vê isto — ele já foi para o WhatsApp. O log é o alarme.
    console.error(`[lead] registro falhou para ${payload.data.id}`);
    return NextResponse.json({ error: 'webhook_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
