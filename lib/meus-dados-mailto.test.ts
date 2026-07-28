import assert from 'node:assert/strict';
import { buildMeusDadosMailto } from './meus-dados-mailto.ts';

const url = buildMeusDadosMailto({
  nome: 'Ana Antão',
  email: 'ana@example.com',
  telefone: '',
  direito: 'Eliminação',
  descricao: 'Quero apagar\nmeus dados',
});

// destinatário fixo
assert.ok(url.startsWith('mailto:atendimento@lotusbrokers.com.br?'), 'destinatário correto');
// subject e body percent-encoded (acento e quebra de linha não vazam crus)
assert.ok(url.includes('subject='), 'tem subject');
assert.ok(url.includes('body='), 'tem body');
assert.ok(!url.includes('Antão'), 'acento é encodado no output');
assert.ok(!url.includes('\n'), 'quebra de linha é encodada');
// dados presentes de forma encodada
assert.ok(url.includes(encodeURIComponent('Ana Antão')), 'nome encodado presente');
assert.ok(url.includes(encodeURIComponent('Eliminação')), 'direito encodado presente');

console.log('ok');
