// Roda com: node lib/chat.test.ts  (Node 24 — type stripping nativo)
import assert from 'node:assert/strict';
import {
  CHAT_STORAGE_KEY,
  loadConversation,
  newConversation,
  newMessage,
  saveConversation,
  sendMessage,
  type Conversation,
} from './chat.ts';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

/** Substitui globalThis.fetch por uma resposta fixa e devolve as chamadas feitas. */
function stubFetch(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return calls;
}

// --- conversa nova ---
const a = newConversation();
const b = newConversation();
assert.ok(a.id && b.id && a.id !== b.id, 'conversas têm ids únicos');
assert.equal(a.messages.length, 0, 'conversa nova começa vazia');

// --- o id da conversa precisa ser aceito pela LIA: 8–128 chars, [A-Za-z0-9._:-] ---
assert.match(a.id, /^[A-Za-z0-9._:-]{8,128}$/, 'conversationId no formato aceito pela LIA');

// --- mensagens ---
const msg = newMessage('user', 'Olá');
assert.equal(msg.role, 'user');
assert.equal(msg.content, 'Olá');
assert.equal(msg.status, 'sent');
assert.ok(!Number.isNaN(Date.parse(msg.createdAt)), 'createdAt é ISO válido');

// --- envio: bolhas e anexos ---
{
  const calls = stubFetch(200, {
    bubbles: ['Oi! 🌿', 'Tenho 4 lançamentos com 3 dormitórios.'],
    attachments: [{ type: 'image', url: 'https://cdn.exemplo/oasis.jpg' }],
  });
  const reply = await sendMessage('tem apto de 3 dorm?', a.id);
  assert.deepEqual(reply.bubbles, ['Oi! 🌿', 'Tenho 4 lançamentos com 3 dormitórios.'], 'bolhas na ordem');
  assert.equal(reply.attachments.length, 1, 'anexo preservado');

  // o cliente fala com a NOSSA rota, nunca com a LIA direto
  assert.equal(calls[0].url, '/api/chat', 'chama a rota server-side');
  const sent = JSON.parse(String(calls[0].init.body));
  assert.equal(sent.conversationId, a.id, 'reenvia o mesmo conversationId (memória da LIA)');
  assert.equal(sent.message, 'tem apto de 3 dorm?');
  assert.ok(!('history' in sent), 'não envia histórico — a memória é da LIA');
  assert.ok(!JSON.stringify(calls[0].init.headers ?? {}).match(/api-key/i), 'nenhuma chave no cliente');
}

// --- anexos ausentes viram lista vazia (UI não precisa checar null) ---
{
  stubFetch(200, { bubbles: ['só texto'] });
  const reply = await sendMessage('oi', a.id);
  assert.deepEqual(reply.attachments, [], 'sem anexos → array vazio');
}

// --- erro da rota vira mensagem amigável, sem código cru ---
{
  stubFetch(504, { error: 'Demorei mais que o normal 😅 pode repetir?' });
  await assert.rejects(
    sendMessage('oi', a.id),
    (e: Error) => {
      assert.equal(e.message, 'Demorei mais que o normal 😅 pode repetir?');
      assert.ok(!/504|timeout|upstream/i.test(e.message), 'não vaza código técnico');
      return true;
    },
    'erro do servidor propaga texto amigável',
  );
}

// --- resposta 200 sem bolhas é falha, não conversa vazia ---
{
  stubFetch(200, { bubbles: [] });
  await assert.rejects(sendMessage('oi', a.id), 'resposta sem texto → erro');
}

// --- resposta ilegível cai no fallback ---
{
  globalThis.fetch = (async () => new Response('<html>502</html>', { status: 502 })) as typeof fetch;
  await assert.rejects(
    sendMessage('oi', a.id),
    (e: Error) => e.message.length > 0 && !e.message.includes('<html>'),
    'corpo não-JSON → mensagem amigável',
  );
}

// --- persistência: roundtrip ---
{
  const s = memoryStorage();
  const conv: Conversation = {
    id: 'c1-conversa-teste',
    messages: [newMessage('user', 'oi'), newMessage('assistant', 'olá!')],
  };
  saveConversation(s, conv);
  assert.deepEqual(loadConversation(s), conv, 'save/load preserva a conversa');
}

// --- persistência: storage vazio e corrompido ---
{
  const s = memoryStorage();
  assert.equal(loadConversation(s), null, 'storage vazio → null');
  s.setItem(CHAT_STORAGE_KEY, 'não é json');
  assert.equal(loadConversation(s), null, 'json inválido → null (não explode)');
  s.setItem(CHAT_STORAGE_KEY, JSON.stringify({ foo: 1 }));
  assert.equal(loadConversation(s), null, 'shape errado → null');
}

// --- persistência: mensagem presa em "sending" vira "error" ao recarregar ---
{
  const s = memoryStorage();
  saveConversation(s, {
    id: 'c2-conversa-teste',
    messages: [{ ...newMessage('user', 'oi'), status: 'sending' }],
  });
  assert.equal(
    loadConversation(s)?.messages[0].status,
    'error',
    'sending interrompido → error (permite reenviar)',
  );
}

// --- storage quebrado não derruba o save ---
{
  saveConversation(
    {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    },
    newConversation(),
  );
}

console.log('ok');
