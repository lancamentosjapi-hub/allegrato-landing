import assert from 'node:assert/strict';
import { test } from 'node:test';
import { construtorasParaFiltro, mapaDeConstrutoras } from './construtoras.ts';

/**
 * Casos tirados do banco real: os dois grupos com grafia duplicada que a
 * auditoria de 26/08/2026 encontrou.
 */

test('agrupa variantes que só diferem por acento', () => {
  const nomes = [...Array(11).fill('Santa Angela'), ...Array(3).fill('Santa Ângela')];
  assert.deepEqual(construtorasParaFiltro(nomes), ['Santa Ângela']);
});

test('a variante acentuada vence mesmo sendo minoria', () => {
  const m = mapaDeConstrutoras(['Santa Angela', 'Santa Angela', 'Santa Ângela']);
  assert.equal(m.get('Santa Angela'), 'Santa Ângela');
  assert.equal(m.get('Santa Ângela'), 'Santa Ângela');
});

test('caixa mista vence CAIXA ALTA', () => {
  assert.deepEqual(
    construtorasParaFiltro(['SEBEL Empreendimentos', 'Sebel Empreendimentos']),
    ['Sebel Empreendimentos'],
  );
});

test('nomes realmente diferentes continuam separados', () => {
  const r = construtorasParaFiltro(['Tebas', 'Tebas Engenharia', 'Applausi']);
  assert.deepEqual(r, ['Applausi', 'Tebas', 'Tebas Engenharia']);
});

test('vazio, nulo e só espaço ficam de fora', () => {
  assert.deepEqual(construtorasParaFiltro([null, undefined, '', '   ', 'Mac Lucer']), ['Mac Lucer']);
});

test('ordem alfabética em português', () => {
  assert.deepEqual(construtorasParaFiltro(['Ávila', 'Applausi', 'Zetta']), ['Applausi', 'Ávila', 'Zetta']);
});

test('espaço repetido não cria variante nova', () => {
  assert.deepEqual(construtorasParaFiltro(['Mac  Lucer', 'Mac Lucer']).length, 1);
});

test('preenchimento generico nao vira opcao de filtro', () => {
  // 'Construtora' aparece em 7 entradas de lib/developments.ts como filler, e
  // 'Alto padrão' e categoria, nao empresa.
  assert.deepEqual(
    construtorasParaFiltro(['Construtora', 'Alto padrão', 'N/A', '-', 'Mac Lucer']),
    ['Mac Lucer'],
  );
});

test('placeholder nao entra no mapa de canonicalizacao', () => {
  assert.equal(mapaDeConstrutoras(['Construtora']).size, 0);
});
