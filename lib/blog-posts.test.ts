import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POSTS } from './blog-posts.ts';

/**
 * Invariantes da lista de artigos.
 *
 * Os artigos chegam em lote e são colados à mão no array. Estes testes pegam
 * os erros que só apareceriam na tela: id repetido quebra a chave do React e
 * faz um artigo abrir no lugar do outro, e data fora do formato passa a ser
 * comparada como texto qualquer — um "28/08/2026" nunca sairia do ar, porque
 * jamais é menor que "2026-08-28".
 */

test('todo artigo tem id único', () => {
  const ids = POSTS.map((p) => p.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(repetidos, [], 'ids repetidos: ' + repetidos.join(', '));
});

test('publicadoEm está sempre em YYYY-MM-DD', () => {
  for (const p of POSTS) {
    assert.match(p.publicadoEm, /^\d{4}-\d{2}-\d{2}$/, `${p.id} tem publicadoEm inválido: ${p.publicadoEm}`);
    assert.equal(
      Number.isNaN(new Date(p.publicadoEm + 'T12:00:00Z').getTime()),
      false,
      `${p.id} tem data inexistente: ${p.publicadoEm}`
    );
  }
});

test('nenhum artigo fica sem título, resumo ou corpo', () => {
  for (const p of POSTS) {
    assert.notEqual(p.title.trim(), '', `${p.id} sem título`);
    assert.notEqual(p.excerpt.trim(), '', `${p.id} sem excerpt`);
    assert.ok(p.body.length > 0, `${p.id} sem corpo`);
  }
});

test('a categoria é uma das que o filtro do blog oferece', () => {
  const validas = new Set(['Cidade', 'Mercado', 'Guia', 'Região']);
  for (const p of POSTS) {
    assert.ok(validas.has(p.cat), `${p.id} usa categoria "${p.cat}", que não tem chip no blog`);
  }
});
