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
    dump: () => data,
  };
}

// --- conversa nova ---
const a = newConversation();
const b = newConversation();
assert.ok(a.id && b.id && a.id !== b.id, 'conversas têm ids únicos');
assert.equal(a.messages.length, 0, 'conversa nova começa vazia');

// --- mensagens ---
const msg = newMessage('user', 'Olá');
assert.equal(msg.role, 'user');
assert.equal(msg.content, 'Olá');
assert.equal(msg.status, 'sent');
assert.ok(!Number.isNaN(Date.parse(msg.createdAt)), 'createdAt é ISO válido');

// --- mock responde e mantém conversa em várias mensagens ---
{
  const history = [newMessage('user', 'Quero encontrar um imóvel')];
  const r1 = await sendMessage('Quero encontrar um imóvel', history);
  assert.ok(typeof r1 === 'string' && r1.length > 0, 'mock responde texto não-vazio');

  history.push(newMessage('assistant', r1), newMessage('user', 'No Anhangabaú'));
  const r2 = await sendMessage('No Anhangabaú', history);
  assert.ok(r2.length > 0, 'mock responde à segunda mensagem');
  assert.notEqual(r1, r2, 'respostas avançam com o número de turnos do usuário');
}

// --- erro de envio ---
await assert.rejects(sendMessage('#erro', []), 'gatilho #erro rejeita (estado de erro testável)');

// --- persistência: roundtrip ---
{
  const s = memoryStorage();
  const conv: Conversation = {
    id: 'c1',
    messages: [newMessage('user', 'oi'), newMessage('assistant', 'olá!')],
  };
  saveConversation(s, conv);
  const loaded = loadConversation(s);
  assert.deepEqual(loaded, conv, 'save/load preserva a conversa');
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
  const conv: Conversation = {
    id: 'c2',
    messages: [{ ...newMessage('user', 'oi'), status: 'sending' }],
  };
  saveConversation(s, conv);
  const loaded = loadConversation(s);
  assert.equal(loaded?.messages[0].status, 'error', 'sending interrompido → error (permite reenviar)');
}

// --- storage quebrado não derruba o save ---
{
  const broken = {
    getItem: () => null,
    setItem: () => {
      throw new Error('quota');
    },
    removeItem: () => {},
  };
  saveConversation(broken, newConversation()); // não deve lançar
}

console.log('ok');
