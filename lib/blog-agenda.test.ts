import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diaEmJundiai, jaSaiu, publicados } from './blog-agenda.ts';

// Instante em UTC. Os casos de fuso dependem de escrever a hora em Z para
// deixar visível a diferença de 3 horas para Jundiaí.
const em = (iso: string) => new Date(iso);

test('o dia usado é o de Jundiaí, não o do servidor', () => {
  // 28/08 às 00h30 UTC ainda é dia 27 em Jundiaí (UTC-3).
  assert.equal(diaEmJundiai(em('2026-08-28T00:30:00Z')), '2026-08-27');
  // 28/08 às 03h30 UTC já virou o dia 28 lá.
  assert.equal(diaEmJundiai(em('2026-08-28T03:30:00Z')), '2026-08-28');
});

test('o artigo sai no próprio dia marcado', () => {
  assert.equal(jaSaiu('2026-08-27', em('2026-08-27T12:00:00Z')), true);
});

test('não sai na véspera, nem quando o servidor já virou o dia', () => {
  assert.equal(jaSaiu('2026-08-28', em('2026-08-27T12:00:00Z')), false);
  // O caso que o fuso resolve: em UTC já é dia 28, em Jundiaí ainda é 27.
  assert.equal(jaSaiu('2026-08-28', em('2026-08-28T01:00:00Z')), false);
});

test('artigo antigo continua no ar', () => {
  assert.equal(jaSaiu('2026-04-01', em('2026-08-27T12:00:00Z')), true);
});

test('filtra o lote pela data de cada um', () => {
  const lote = [
    { id: 'memorial', publicadoEm: '2026-08-28' },
    { id: 'lazer', publicadoEm: '2026-08-27' },
    { id: 'antigo', publicadoEm: '2026-04-01' },
  ];
  const hoje = publicados(lote, em('2026-08-27T12:00:00Z'));
  assert.deepEqual(hoje.map((p) => p.id), ['lazer', 'antigo']);

  const amanha = publicados(lote, em('2026-08-28T12:00:00Z'));
  assert.deepEqual(amanha.map((p) => p.id), ['memorial', 'lazer', 'antigo']);
});

test('preserva a ordem da lista, que é quem define o destaque', () => {
  const lote = [
    { id: 'segundo', publicadoEm: '2026-01-02' },
    { id: 'primeiro', publicadoEm: '2026-01-01' },
  ];
  assert.deepEqual(
    publicados(lote, em('2026-08-27T12:00:00Z')).map((p) => p.id),
    ['segundo', 'primeiro']
  );
});

test('lote inteiro no futuro devolve lista vazia, e não quebra', () => {
  const lote = [{ id: 'a', publicadoEm: '2027-01-01' }];
  assert.deepEqual(publicados(lote, em('2026-08-27T12:00:00Z')), []);
});
