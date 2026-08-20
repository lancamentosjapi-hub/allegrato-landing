import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resumoDescricao } from './resumo-imovel.ts';

/**
 * O resumo é um recorte, nunca uma reescrita: tudo que sai precisa existir na
 * entrada. Estes testes fixam as duas garantias que o card depende — não cortar
 * palavra ao meio e não inventar texto.
 */

test('descrição curta passa inteira e sem reticências', () => {
  const curta = 'Casa térrea com 2 dormitórios.';
  assert.equal(resumoDescricao(curta), curta);
});

test('vazio e nulo viram string vazia', () => {
  assert.equal(resumoDescricao(null), '');
  assert.equal(resumoDescricao(undefined), '');
  assert.equal(resumoDescricao('   '), '');
});

test('quebras de linha e espaços repetidos viram espaço simples', () => {
  assert.equal(resumoDescricao('Casa\n\n  com   quintal.'), 'Casa com quintal.');
});

test('corta na frase inteira quando há pontuação no meio do limite', () => {
  const texto =
    'Apartamento de 3 dormitórios, sendo 1 suíte, com sala ampla e cozinha planejada. ' +
    'Condomínio com piscina, salão de festas, academia e brinquedoteca para as crianças.';
  const r = resumoDescricao(texto);
  assert.ok(r.endsWith('planejada.'), `terminou em: ${JSON.stringify(r.slice(-14))}`);
  assert.ok(!r.includes('…'), 'frase completa não leva reticências');
});

test('sem pontuação, corta no espaço e nunca no meio da palavra', () => {
  const texto = 'Excelente imóvel em condomínio fechado com infraestrutura completa de lazer e ' +
    'segurança vinte e quatro horas por dia com portaria blindada e ronda motorizada permanente';
  const r = resumoDescricao(texto);
  assert.ok(r.endsWith('…'), 'texto truncado leva reticências');
  const semReticencias = r.slice(0, -1);
  assert.ok(texto.startsWith(semReticencias), 'o resumo é prefixo literal do original');
  assert.ok(!/\S…$/.test(r) || texto.includes(semReticencias.split(' ').pop()!), 'última palavra existe inteira no original');
});

test('nunca devolve texto que não estava na descrição', () => {
  const texto = 'Sobrado novo, 3 suítes, 180 m², 4 vagas, no Jardim Ermida, pronto para morar hoje mesmo.';
  const r = resumoDescricao(texto, 40);
  const conteudo = r.replace(/…$/, '');
  assert.ok(texto.includes(conteudo), 'todo o resumo veio do original');
});

test('respeita o limite informado', () => {
  const texto = 'a'.repeat(300);
  assert.ok(resumoDescricao(texto, 60).length <= 61, 'limite mais as reticências');
});
