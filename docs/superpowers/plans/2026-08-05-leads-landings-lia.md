# Envio dos leads das landings para a LIA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Todo formulário preenchido nas 23 landings vira um lead registrado na LIA via webhook `lead.created`, mesmo quando o visitante não envia a mensagem no WhatsApp.

**Architecture:** Uma rota proxy server-side (`app/api/lead/route.ts`) guarda o segredo do webhook, valida a entrada e repassa; um módulo de serviço (`lib/lead.ts`) expõe `sendLead()` para as landings e as funções puras de normalização que a rota usa. Cada `onSubmit` existente ganha uma chamada `sendLead()` disparada sem `await`, antes do `window.open` que já existe.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, `node:assert/strict` para testes (sem framework).

**Spec:** `docs/superpowers/specs/2026-08-05-leads-landings-lia-design.md`

## Global Constraints

- Segredo e URL do webhook são **server-side apenas**: `LIA_LEAD_WEBHOOK_URL` e `LEAD_WEBHOOK_SECRET`, nunca com prefixo `NEXT_PUBLIC_`.
- `sendLead()` é sempre chamado **sem `await`** e **antes** do `window.open` existente. Um `await` antes do `window.open` tira a chamada da pilha do gesto do usuário e o bloqueador de pop-up mata a aba do WhatsApp.
- Nenhuma validação, máscara, mensagem de WhatsApp ou fluxo de UI existente pode ser alterado. A única mudança em cada landing é a chamada nova.
- O `id` de deduplicação e o telefone E.164 são derivados **na rota**, nunca recebidos do cliente.
- Envelope do webhook, verbatim do contrato: `{ "event": "lead.created", "data": { id, name, phone, email, source, interest, message } }`, header `x-webhook-secret`.
- Obrigatório pelo contrato: pelo menos `name` **ou** `phone`.
- `source` é sempre `"landing_" + slug da rota em app/` (ex.: `landing_allegrato`).
- Comentários em português, como o resto do repositório.
- Commits com `git -c user.name="hash-cell" commit`, sem trailer `Co-Authored-By`.

---

### Task 1: Funções puras de `lib/lead.ts`

Normalização de telefone, derivação do id de deduplicação e montagem do envelope. São as únicas partes com lógica real, então vêm primeiro e com teste.

**Files:**
- Create: `lib/lead.ts`
- Test: `lib/lead.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type Lead`, `toE164(raw: string): string`, `leadId(source: string, phone: string, name: string): string`, `buildLeadPayload(lead: Lead): { event: 'lead.created'; data: Record<string, string> }`. A Task 2 (rota) consome as três funções; as Tasks 4–7 consomem `Lead` e `sendLead` (adicionado na Task 3).

- [ ] **Step 1: Escrever o teste que falha**

Criar `lib/lead.test.ts`:

```ts
import assert from 'node:assert/strict';
import { toE164, leadId, buildLeadPayload } from './lead.ts';

/* ---------- toE164 ---------- */
// celular com DDD, com máscara
assert.equal(toE164('(11) 99999-8888'), '+5511999998888');
// fixo com DDD
assert.equal(toE164('11 3333-4444'), '+551133334444');
// já veio com código do país
assert.equal(toE164('+55 11 99999-8888'), '+5511999998888');
assert.equal(toE164('5511999998888'), '+5511999998888');
// vazio
assert.equal(toE164(''), '');
// fora do padrão brasileiro: preserva os dígitos em vez de descartar o dado
assert.equal(toE164('99999'), '99999');

/* ---------- leadId ---------- */
// determinístico: mesma entrada, mesmo id em chamadas separadas
assert.equal(
  leadId('landing_allegrato', '+5511999998888', 'Maria Souza'),
  leadId('landing_allegrato', '+5511999998888', 'Maria Souza'),
);
assert.equal(
  leadId('landing_allegrato', '+5511999998888', 'Maria Souza'),
  'portal:landing_allegrato:5511999998888',
);
// landings diferentes não colidem
assert.notEqual(
  leadId('landing_allegrato', '+5511999998888', 'Maria'),
  leadId('landing_maita', '+5511999998888', 'Maria'),
);
// sem telefone, cai para o nome normalizado
assert.equal(
  leadId('landing_avela', '', 'Maria Souza'),
  'portal:landing_avela:maria-souza',
);

/* ---------- buildLeadPayload ---------- */
const p = buildLeadPayload({
  name: '  Maria Souza  ',
  phone: '(11) 99999-8888',
  email: 'maria@exemplo.com',
  source: 'landing_allegrato',
  interest: 'Allegrato Residencial',
  message: '2 dormitórios (55 m²)',
});
assert.equal(p.event, 'lead.created');
assert.equal(p.data.name, 'Maria Souza', 'nome vem trimado');
assert.equal(p.data.phone, '+5511999998888', 'telefone normalizado');
assert.equal(p.data.id, 'portal:landing_allegrato:5511999998888');
assert.equal(p.data.email, 'maria@exemplo.com');
assert.equal(p.data.interest, 'Allegrato Residencial');
assert.equal(p.data.message, '2 dormitórios (55 m²)');

// campos ausentes são omitidos, não vão como string vazia
const semEmail = buildLeadPayload({
  name: 'João',
  phone: '11999998888',
  source: 'landing_odeon',
  interest: 'Odeon Residencial',
});
assert.ok(!('email' in semEmail.data), 'email ausente é omitido');
assert.ok(!('message' in semEmail.data), 'message ausente é omitido');

// limites de tamanho
const longo = buildLeadPayload({
  name: 'A'.repeat(300),
  phone: '11999998888',
  message: 'M'.repeat(3000),
  source: 'landing_odeon',
  interest: 'Odeon Residencial',
});
assert.equal(longo.data.name.length, 120, 'name cortado em 120');
assert.equal(longo.data.message.length, 1000, 'message cortado em 1000');

// caracteres de controle são removidos
const sujo = buildLeadPayload({
  name: 'Maria\u0000\u001BSouza',
  phone: '11999998888',
  source: 'landing_odeon',
  interest: 'Odeon Residencial',
});
assert.equal(sujo.data.name, 'MariaSouza', 'caracteres de controle removidos');

console.log('ok');
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `node lib/lead.test.ts`
Expected: FAIL — `Cannot find module './lead.ts'`

- [ ] **Step 3: Implementar as funções puras**

Criar `lib/lead.ts`:

```ts
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

/** Remove caracteres de controle, colapsa espaços e corta no limite do campo. */
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
  const key =
    phone.replace(/\D/g, '') ||
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `node lib/lead.test.ts`
Expected: PASS — imprime `ok`

- [ ] **Step 5: Commit**

```bash
git add lib/lead.ts lib/lead.test.ts
git -c user.name="hash-cell" commit -m "feat(leads): funcoes puras de normalizacao e payload do lead"
```

---

### Task 2: Rota `app/api/lead/route.ts`

Proxy server-side. Espelha o padrão de `app/api/chat/route.ts` — vale ler esse arquivo antes de escrever este.

**Files:**
- Create: `app/api/lead/route.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `toE164`, `leadId`, `buildLeadPayload`, `Lead` de `lib/lead.ts` (Task 1).
- Produces: `POST /api/lead`, que aceita `{ name?, phone?, email?, source, interest, message? }` em JSON e responde `202` em sucesso, `400` em payload inválido, `429` em rate limit, `502` em falha do webhook. A Task 3 (`sendLead`) é a única consumidora.

- [ ] **Step 1: Ler a rota de chat existente para seguir o mesmo padrão**

Run: `cat app/api/chat/route.ts`
Observar: `runtime`/`dynamic` exportados, validação antes de qualquer fetch, `console.error` com contexto, e que nem a URL nem a chave aparecem na resposta.

- [ ] **Step 2: Escrever a rota**

Criar `app/api/lead/route.ts`:

```ts
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
```

- [ ] **Step 3: Adicionar as variáveis ao `.env.example`**

Acrescentar ao final de `.env.example`:

```
# LIA — webhook de leads dos formulários das landings. SERVER-SIDE ONLY: sem
# NEXT_PUBLIC_, senão o segredo vaza no bundle e qualquer um injeta lead no CRM.
# Usadas só em app/api/lead/route.ts. Repo é público: valores reais só no
# .env.local e nas envs do deploy.
LIA_LEAD_WEBHOOK_URL=
LEAD_WEBHOOK_SECRET=
```

- [ ] **Step 4: Verificar que o projeto compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add app/api/lead/route.ts .env.example
git -c user.name="hash-cell" commit -m "feat(leads): rota proxy do webhook de leads da LIA"
```

---

### Task 3: `sendLead()` no cliente

**Files:**
- Modify: `lib/lead.ts` (acrescentar ao final)

**Interfaces:**
- Consumes: `type Lead` (Task 1), `POST /api/lead` (Task 2).
- Produces: `sendLead(lead: Lead): void` — dispara e não espera. É o **único** símbolo que as Tasks 4–7 importam nas landings.

- [ ] **Step 1: Acrescentar `sendLead` ao final de `lib/lead.ts`**

```ts
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
```

- [ ] **Step 2: Confirmar que o teste da Task 1 continua passando**

Run: `node lib/lead.test.ts`
Expected: PASS — imprime `ok`

- [ ] **Step 3: Verificar que o projeto compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add lib/lead.ts
git -c user.name="hash-cell" commit -m "feat(leads): sendLead() para as landings"
```

---

## Sobre as Tasks 4–7

São 23 edições cobrindo os 26 formulários (AutenJundiai, ResortPrime e VisttaCastanho já iteram sobre seus dois formulários com um handler compartilhado, então uma edição cobre os dois).

**Regra que vale para todas**, e o motivo pelo qual cada snippet abaixo é explícito em vez de genérico: os handlers já extraem os valores para variáveis locais, porque precisam deles para montar o texto do WhatsApp. Então a edição é sempre só um `sendLead({...})` usando as variáveis que já estão ali. Não há extração nova de campo, nem detecção automática de nomes — isso evita o modo de falha silencioso de um lead ir sem telefone porque o campo se chamava diferente.

Em toda landing:
1. Adicionar `import { sendLead } from '@/lib/lead';` junto aos imports existentes.
2. Inserir a chamada `sendLead({...})` **depois** da validação existente e **antes** do `window.open`.
3. Não tocar em mais nada.

---

### Task 4: Landings com handler React e valores em locals (parte 1)

**Files:**
- Modify: `components/Allegrato.tsx:122-139`
- Modify: `components/Avalon.tsx:32-43`
- Modify: `components/SkyVideiras.tsx:32-43`
- Modify: `components/BrisasDoJapi.tsx:288-301`
- Modify: `components/Vivarte.tsx:287-307`
- Modify: `components/Maita.tsx:273-292`

**Interfaces:**
- Consumes: `sendLead` de `lib/lead.ts` (Task 3).
- Produces: nada que tasks posteriores consumam.

- [ ] **Step 1: Allegrato**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após o `const interesse = ...` e antes de `const url = waUrl(extra);`:

```tsx
    sendLead({
      name: nome,
      phone: fone,
      source: 'landing_allegrato',
      interest: 'Allegrato Residencial',
      message: interesse,
    });
```

- [ ] **Step 2: Avalon**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após `const interesse = ...` e antes de `window.open(`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      source: 'landing_avalon',
      interest: 'Avalon Residencial',
      message: interesse,
    });
```

- [ ] **Step 3: SkyVideiras**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após `const interesse = ...` e antes de `window.open(`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      source: 'landing_sky-videiras',
      interest: 'SKY Videiras',
      message: interesse,
    });
```

- [ ] **Step 4: BrisasDoJapi**

Import: `import { sendLead } from '@/lib/lead';`

Em `submit`, após o bloco que monta `msg` e antes de `setSent(true);`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_brisas-do-japi',
      interest: 'Brisas do Japi',
      message: tipo,
    });
```

- [ ] **Step 5: Vivarte**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após o `if (!nome || !tel) { ... return; }` e antes de `const n = String(...)`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_vivarte',
      interest: 'Vivarte Grand Alamedas',
    });
```

- [ ] **Step 6: Maita**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após o `if (next.nome || next.email || next.tel || next.consent) return;` e antes de `setSent(`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_maita',
      interest: 'Maitá Residencial',
    });
```

- [ ] **Step 7: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add components/Allegrato.tsx components/Avalon.tsx components/SkyVideiras.tsx components/BrisasDoJapi.tsx components/Vivarte.tsx components/Maita.tsx
git -c user.name="hash-cell" commit -m "feat(leads): registra lead em Allegrato, Avalon, Sky, Brisas, Vivarte e Maita"
```

---

### Task 5: Landings com handler React e valores em locals (parte 2), incluindo os formulários inertes

Três destas landings têm formulários que hoje **não fazem nada com os dados**. Registrar o lead conserta o buraco sem mexer no fluxo de UI: a pessoa continua vendo a mesma tela de sucesso, mas agora a LIA fica sabendo que ela existe.

**Files:**
- Modify: `components/Manawa.tsx:273-298`
- Modify: `components/Odeon.tsx:327-331`
- Modify: `components/BestViewResidence.tsx:267-271`
- Modify: `components/Avela.tsx:768-771`
- Modify: `components/JardinsDoHorto.tsx:204-207`

**Interfaces:**
- Consumes: `sendLead` de `lib/lead.ts` (Task 3).
- Produces: nada que tasks posteriores consumam.

- [ ] **Step 1: Manawa**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após `if (!ok) return;` e antes de `const msg =`:

```tsx
    sendLead({
      name: nome.value.trim(),
      phone: tel,
      email: email.value.trim(),
      source: 'landing_manawa',
      interest: 'Manawa Residencial',
      message: interesse.value,
    });
```

- [ ] **Step 2: Odeon**

Import: `import { sendLead } from '@/lib/lead';`

Em `enviarForm`, após `e.preventDefault();` e antes de `const txt =`:

```tsx
    sendLead({
      name: nome,
      phone: telefone,
      source: 'landing_odeon',
      interest: 'Odeon Residencial',
      message: interesse,
    });
```

As variáveis de state são `nome`, `telefone` e `interesse` — as mesmas que a linha 329 já usa para montar o texto do WhatsApp. `formNome`/`formTelefone`/`formInteresse` (linhas 321-323) são só apelidos usados no JSX; não usar esses aqui.

- [ ] **Step 3: BestViewResidence**

Import: `import { sendLead } from '@/lib/lead';`

Em `enviarForm`, após `e.preventDefault();` e antes de `window.open(waLinkForm, ...)`:

```tsx
    sendLead({
      name: fNome,
      phone: fFone,
      email: fEmail,
      source: 'landing_best-view-residence',
      interest: 'Best View Residence',
    });
```

Este formulário coleta `fNome`, `fEmail` e `fFone` em state e descarta tudo — o `waLinkForm` é estático. O texto do WhatsApp **continua como está** (mudá-lo é alteração de comportamento não pedida); o que muda é que os dados param de ser perdidos.

- [ ] **Step 4: Avela**

Import: `import { sendLead } from '@/lib/lead';`

O `onSubmit` inline hoje é só `e.preventDefault(); setSent(true);`. Fica:

```tsx
                onSubmit={(e) => {
                  e.preventDefault();
                  sendLead({
                    name: form.nome,
                    phone: form.tel,
                    email: form.email,
                    source: 'landing_avela',
                    interest: 'Avela',
                    message: form.interesse,
                  });
                  setSent(true);
                }}
```

Antes desta mudança o formulário era inerte: mostrava sucesso e não fazia nada com os dados.

- [ ] **Step 5: JardinsDoHorto**

Import: `import { sendLead } from '@/lib/lead';`

O `onSubmit` hoje é só `e.preventDefault(); setSent(true);` e os campos não são lidos em lugar nenhum. Os inputs têm atributo `name` (`nome`, `telefone`, `email`, `interesse`), então lê-los do próprio formulário é o caminho mais curto:

```tsx
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.currentTarget as HTMLFormElement;
    const val = (n: string) =>
      (f.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
    sendLead({
      name: val('nome'),
      phone: val('telefone'),
      email: val('email'),
      source: 'landing_jardins-do-horto',
      interest: 'Jardins do Horto',
      message: val('interesse'),
    });
    setSent(true);
  };
```

Antes desta mudança o formulário era inerte: mostrava sucesso e não fazia nada com os dados.

- [ ] **Step 6: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 7: Confirmar no navegador que os três formulários antes inertes registram**

Run: `npm run dev`, abrir `http://localhost:3000/avela`, preencher e enviar. Na aba Network, confirmar `POST /api/lead` com `202`. Repetir em `/jardins-do-horto` e `/best-view-residence`.
Expected: três `POST /api/lead` com `202`.

- [ ] **Step 8: Commit**

```bash
git add components/Manawa.tsx components/Odeon.tsx components/BestViewResidence.tsx components/Avela.tsx components/JardinsDoHorto.tsx
git -c user.name="hash-cell" commit -m "feat(leads): registra lead em Manawa, Odeon, BestView, Avela e Jardins do Horto

Avela e Jardins do Horto tinham formulario inerte (so setSent) e BestView
descartava os campos num link estatico: os tres passam a registrar o lead."
```

---

### Task 6: Landings que leem `form.elements` e handlers de DOM (parte 1)

**Files:**
- Modify: `components/AltosDaAvenida.tsx:448-463`
- Modify: `components/DoppioJundiai.tsx:334-346`
- Modify: `components/MaxxSantaAngela.tsx:272-289`
- Modify: `components/AutenJundiai.tsx:139-153`
- Modify: `components/Authoria.tsx:450-475`
- Modify: `components/ForestHouses.tsx:271-300`

**Interfaces:**
- Consumes: `sendLead` de `lib/lead.ts` (Task 3).
- Produces: nada que tasks posteriores consumam.

- [ ] **Step 1: AltosDaAvenida**

Import: `import { sendLead } from '@/lib/lead';`

Em `submitWhats`, após `const num = ...` e antes de `const txt =`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      source: 'landing_altos-da-avenida',
      interest: 'Altos da Avenida',
      message: met,
    });
```

- [ ] **Step 2: DoppioJundiai**

Import: `import { sendLead } from '@/lib/lead';`

Em `submitForm`, após `if (!nome || !tel) return;` e antes de `const text =`:

```tsx
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_doppio-jundiai',
      interest: 'Doppio Jundiaí',
    });
```

- [ ] **Step 3: MaxxSantaAngela**

Import: `import { sendLead } from '@/lib/lead';`

O handler lê `nome` e `fone` mas ignora o campo de e-mail, que existe no formulário. Ler o e-mail também, e registrar. Após `const fone = ...` e antes de `const waNum = ...`:

```tsx
    const email = (f.elements.namedItem('email') as HTMLInputElement | null)?.value || '';
    sendLead({
      name: nome,
      phone: fone,
      email,
      source: 'landing_maxx-santa-angela',
      interest: 'Maxx Santa Angela',
    });
```

O texto do WhatsApp continua sem o e-mail, como hoje.

- [ ] **Step 4: AutenJundiai**

Import: `import { sendLead } from '@/lib/lead';`

O handler está dentro de um `forEach` sobre os formulários, então esta única edição cobre os **dois** formulários da página. Em `onSubmit`, após `const tipo = ...` e antes de `let msg =`:

```tsx
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_auten-jundiai',
          interest: 'Auten Jundiaí',
          message: tipo,
        });
```

- [ ] **Step 5: Authoria**

Import: `import { sendLead } from '@/lib/lead';`

No listener de submit, após o `const data = {...}` e antes de `const msg =`:

```tsx
        sendLead({
          name: data.nome,
          phone: data.telefone,
          email: data.email,
          source: 'landing_authoria',
          interest: 'Authoria by Tebas',
          message: data.tipologia,
        });
```

- [ ] **Step 6: ForestHouses**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após `if (!valid) return;` e antes de `let msg =`:

```tsx
        sendLead({
          name: nome.value.trim(),
          phone: tel.value.trim(),
          email: f.email.value.trim(),
          source: 'landing_forest-houses',
          interest: 'Forest Houses',
          message: f.interesse.value,
        });
```

- [ ] **Step 7: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add components/AltosDaAvenida.tsx components/DoppioJundiai.tsx components/MaxxSantaAngela.tsx components/AutenJundiai.tsx components/Authoria.tsx components/ForestHouses.tsx
git -c user.name="hash-cell" commit -m "feat(leads): registra lead em Altos, Doppio, Maxx, Auten, Authoria e Forest Houses"
```

---

### Task 7: Handlers de DOM (parte 2)

**Files:**
- Modify: `components/GranVilleSantoAngelo.tsx:323-350`
- Modify: `components/PortalDosLagos.tsx:143-170`
- Modify: `components/ResortPrime.tsx:117-160`
- Modify: `components/TerraceSerraDoJapi.tsx:233-260`
- Modify: `components/Vigore.tsx:527-540`
- Modify: `components/VisttaCastanho.tsx:189-212`

**Interfaces:**
- Consumes: `sendLead` de `lib/lead.ts` (Task 3).
- Produces: nada que tasks posteriores consumam.

- [ ] **Step 1: GranVilleSantoAngelo**

Import: `import { sendLead } from '@/lib/lead';`

Em `onSubmit`, após `if (!nome || !tel) { return; }` e antes de `const msg =`:

```tsx
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_gran-ville-santo-angelo',
          interest: 'Gran Ville Santo Angelo',
        });
```

- [ ] **Step 2: PortalDosLagos**

Import: `import { sendLead } from '@/lib/lead';`

Em `formHandler`, após as duas guardas de `focus()` e antes de `const msg =`:

```tsx
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_portal-dos-lagos',
          interest: 'Portal dos Lagos',
          message: inter,
        });
```

- [ ] **Step 3: ResortPrime**

Import: `import { sendLead } from '@/lib/lead';`

O handler está registrado sobre os formulários da página, então esta edição cobre os **dois**. Após `if (!ok) return;` e as três leituras (`const nome = ...`, `const email = ...`, `const tel = ...`), antes de `let msg =`:

```tsx
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_resort-prime',
          interest: 'Resort Prime',
        });
```

- [ ] **Step 4: TerraceSerraDoJapi**

Import: `import { sendLead } from '@/lib/lead';`

Em `onFormSubmit`, após `const email = ...` e antes de `const msg =`:

```tsx
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_terrace-serra-do-japi',
          interest: 'Terrace Serra do Japi',
        });
```

- [ ] **Step 5: Vigore**

Import: `import { sendLead } from '@/lib/lead';`

Em `formSubmit`, após `const hor = ...` e antes de `let msg =`:

```tsx
      sendLead({
        name: nome,
        phone: tel,
        email,
        source: 'landing_vigore',
        interest: 'Residencial Vigóre',
        message: hor ? 'Melhor horário: ' + hor : '',
      });
```

- [ ] **Step 6: VisttaCastanho**

Import: `import { sendLead } from '@/lib/lead';`

O handler está dentro de um `forEach` sobre `form[data-wa]`, então esta edição cobre os **dois** formulários. Após o `forEach` que preenche `data` e antes de `let msg =`:

```tsx
        sendLead({
          name: data.nome,
          phone: data.telefone,
          email: data.email,
          source: 'landing_vistta-castanho',
          interest: 'Vistta Castanho',
          message: [data.interesse, data.mensagem].filter(Boolean).join(' — '),
        });
```

`data` é um `Record<string, string>` montado a partir dos campos com `name`; chaves ausentes vêm `undefined`, e `sendLead` trata isso.

- [ ] **Step 7: Verificar compilação**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add components/GranVilleSantoAngelo.tsx components/PortalDosLagos.tsx components/ResortPrime.tsx components/TerraceSerraDoJapi.tsx components/Vigore.tsx components/VisttaCastanho.tsx
git -c user.name="hash-cell" commit -m "feat(leads): registra lead em GranVille, Portal dos Lagos, Resort Prime, Terrace, Vigore e Vistta"
```

---

### Task 8: Verificação de cobertura e teste ponta a ponta

**Files:**
- Nenhum arquivo modificado. Esta task é verificação.

**Interfaces:**
- Consumes: tudo das Tasks 1–7.
- Produces: nada.

- [ ] **Step 1: Confirmar que as 23 landings chamam `sendLead`**

Run: `grep -rl "sendLead" components/ | sort`
Expected: exatamente 23 arquivos — Allegrato, AltosDaAvenida, AutenJundiai, Authoria, Avalon, Avela, BestViewResidence, BrisasDoJapi, DoppioJundiai, ForestHouses, GranVilleSantoAngelo, JardinsDoHorto, Maita, Manawa, MaxxSantaAngela, Odeon, PortalDosLagos, ResortPrime, SkyVideiras, TerraceSerraDoJapi, Vigore, VisttaCastanho, Vivarte.

Se faltar alguma, voltar à task correspondente.

- [ ] **Step 2: Confirmar que nenhum `source` foi repetido por copiar e colar**

Run: `grep -rho "source: 'landing_[a-z-]*'" components/ | sort | uniq -c | sort -rn`
Expected: 23 linhas, todas com contagem `1`. Contagem maior que 1 significa que um `sendLead` foi colado numa landing e o slug não foi trocado.

- [ ] **Step 3: Confirmar que nenhum `sendLead` ficou com `await`**

Run: `grep -rn "await sendLead" components/`
Expected: nenhum resultado. Um `await` aqui faria o bloqueador de pop-up matar a aba do WhatsApp.

- [ ] **Step 4: Confirmar que o segredo não vazou para o cliente**

Run: `grep -rn "LEAD_WEBHOOK_SECRET\|LIA_LEAD_WEBHOOK_URL" components/ lib/ app/`
Expected: só `app/api/lead/route.ts`. Qualquer ocorrência em `components/` ou `lib/` é vazamento no bundle.

- [ ] **Step 5: Rodar o teste unitário e o build**

Run: `node lib/lead.test.ts && npm run build`
Expected: `ok` e build concluído sem erros.

- [ ] **Step 6: Teste ponta a ponta com o webhook real**

Preencher `LIA_LEAD_WEBHOOK_URL` e `LEAD_WEBHOOK_SECRET` no `.env.local`, subir com `npm run dev`, abrir `http://localhost:3000/allegrato`, preencher o formulário e enviar.

Expected:
- Aba Network mostra `POST /api/lead` respondendo `202`.
- A aba do WhatsApp abre normalmente, com o mesmo texto de antes.
- O lead aparece no CRM com `source: landing_allegrato`, `interest: Allegrato Residencial` e `id: portal:landing_allegrato:<telefone>`.

- [ ] **Step 7: Confirmar a deduplicação**

Enviar o mesmo formulário de novo, com o mesmo telefone, depois de recarregar a página.

Expected: o CRM não cria um segundo lead — o `id` é idêntico ao do envio anterior.

- [ ] **Step 8: Confirmar que falha do webhook não quebra o formulário**

Trocar `LIA_LEAD_WEBHOOK_URL` no `.env.local` por uma URL inexistente, reiniciar o dev server e enviar o formulário.

Expected: a aba do WhatsApp abre normalmente; o console do servidor mostra `[lead] webhook inacessível, tentativa 1` e `tentativa 2`; o visitante não vê erro nenhum.

- [ ] **Step 9: Commit final**

```bash
git add -A
git -c user.name="hash-cell" commit -m "chore(leads): verificacao de cobertura das 23 landings"
```

---

## Fora de escopo (não implementar)

- Formulários do portal fora das landings: `LotusAnunciar`, `LotusCorretores`, `LotusCondominio`, `LotusImovel`, FAQ, newsletter, busca, recrutamento.
- Unificar os 26 formulários num componente comum.
- Persistência própria de leads em banco.
- O disparo ativo da LIA — é automação do CRM, do lado deles.
- Corrigir o texto estático do WhatsApp em `BestViewResidence` (mudança de comportamento não pedida; ver Task 5, Step 3).
