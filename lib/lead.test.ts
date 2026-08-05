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
// landline com código do país (12 dígitos)
assert.equal(toE164('+55 11 3333-4444'), '+551133334444');

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
// determinismo: raw e normalized form do mesmo número produzem o mesmo id
assert.equal(
  leadId('landing_x', '11999998888', 'M'),
  leadId('landing_x', '+5511999998888', 'M'),
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
