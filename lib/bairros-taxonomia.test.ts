import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bairroDoGuia, nomesDoBairro, subBairrosConhecidos } from './bairros-taxonomia.ts';

const GUIAS = ['Eloy Chaves', 'Vianelo Bonfiglioli', 'Medeiros', 'Caxambu', 'Centro'];

test('sub-bairro encontra o bairro do guia', () => {
  assert.equal(bairroDoGuia('Jardim Ermida II', GUIAS), 'Eloy Chaves');
  assert.equal(bairroDoGuia('Jardim Ermida I', GUIAS), 'Eloy Chaves');
  assert.equal(bairroDoGuia('Vila Sereno', GUIAS), 'Eloy Chaves');
});

test('bairro que já é nível de guia responde por si mesmo', () => {
  assert.equal(bairroDoGuia('Eloy Chaves', GUIAS), 'Eloy Chaves');
  assert.equal(bairroDoGuia('Medeiros', GUIAS), 'Medeiros');
});

test('acento e caixa não atrapalham', () => {
  assert.equal(bairroDoGuia('JARDIM ERMIDA II', GUIAS), 'Eloy Chaves');
  assert.equal(bairroDoGuia('  jardim ermida ii  ', GUIAS), 'Eloy Chaves');
});

test('bairro de nível próprio não é agrupado sob outro', () => {
  // Confirmado pela Lotus: estes quatro são bairros, não sub-bairros.
  for (const b of ['Jardim Messina', 'Jardim Pacaembu', 'Vila Rio Branco', 'Jardim Colonial'])
    assert.equal(bairroDoGuia(b, GUIAS), null, b);
});

test('vazio e nulo devolvem null', () => {
  assert.equal(bairroDoGuia('', GUIAS), null);
  assert.equal(bairroDoGuia(null, GUIAS), null);
});

test('pai fora da lista de guias não vale', () => {
  // Se o guia de Eloy Chaves não existir, o sub-bairro não aponta para nada.
  assert.equal(bairroDoGuia('Jardim Ermida II', ['Medeiros']), null);
});

test('o guia procura por si e pelos filhos', () => {
  const nomes = nomesDoBairro('Eloy Chaves');
  assert.ok(nomes.includes('Eloy Chaves'));
  assert.ok(nomes.includes('jardim ermida i'));
  assert.ok(nomes.includes('jardim ermida ii'));
  assert.ok(nomes.includes('vila sereno'));
  assert.equal(nomes.length, 4);
});

test('guia sem filhos procura só por si', () => {
  assert.deepEqual(nomesDoBairro('Caxambu'), ['Caxambu']);
});

test('o mapa é somente leitura para quem consulta', () => {
  const m = subBairrosConhecidos();
  m['inventado'] = 'Nada';
  assert.equal(bairroDoGuia('inventado', GUIAS), null);
});
