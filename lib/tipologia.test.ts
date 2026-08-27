import assert from 'node:assert/strict';
import { test } from 'node:test';
import { artigoDe, demonstrativoDe, generoDoTipo, temAreaDeTerreno } from './tipologia.ts';

test('gênero das tipologias do cadastro atual', () => {
  assert.equal(generoDoTipo('Apartamento'), 'm');
  assert.equal(generoDoTipo('Casa'), 'f');
  assert.equal(generoDoTipo('Terreno'), 'm');
  assert.equal(generoDoTipo('Sala comercial'), 'f');
});

test('concorda com a primeira palavra, que é quem rege', () => {
  // "Casa em condomínio" é feminino: concorda com casa, não com condomínio.
  assert.equal(demonstrativoDe('Casa em condomínio'), 'desta');
  assert.equal(demonstrativoDe('Apartamento garden'), 'deste');
});

test('acento e caixa não mudam o resultado', () => {
  assert.equal(generoDoTipo('CHÁCARA'), 'f');
  assert.equal(generoDoTipo('chacara'), 'f');
  assert.equal(generoDoTipo('Chácara'), 'f');
});

test('a frase que motivou o módulo', () => {
  assert.equal(`condições ${demonstrativoDe('Casa')} casa`, 'condições desta casa');
  assert.equal(`condições ${demonstrativoDe('Apartamento')} apartamento`, 'condições deste apartamento');
  assert.equal(`condições ${demonstrativoDe('Terreno')} terreno`, 'condições deste terreno');
  assert.equal(`condições ${demonstrativoDe('Sala')} sala`, 'condições desta sala');
});

test('artigo definido', () => {
  assert.equal(artigoDe('Casa'), 'a');
  assert.equal(artigoDe('Apartamento'), 'o');
});

test('tipo desconhecido cai no masculino, que é o neutro do português', () => {
  assert.equal(generoDoTipo('Galpão'), 'm');
  assert.equal(generoDoTipo(''), 'm');
  assert.equal(generoDoTipo(null), 'm');
});

test('quem não tem terreno próprio', () => {
  for (const t of ['Apartamento', 'Cobertura', 'Studio', 'Flat', 'Sala', 'Loft'])
    assert.equal(temAreaDeTerreno(t), false, t);
});

test('quem tem terreno', () => {
  for (const t of ['Casa', 'Terreno', 'Chácara', 'Sobrado', 'Galpão', 'Casa em condomínio'])
    assert.equal(temAreaDeTerreno(t), true, t);
});

test('sem tipo, não afirma que há terreno', () => {
  assert.equal(temAreaDeTerreno(null), false);
  assert.equal(temAreaDeTerreno(''), false);
});
