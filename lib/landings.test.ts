import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { slugify, hrefForSlug, isLandingDir } from './landings.ts';

/* ---------- slugify ---------- */
// acentos viram ASCII (é o que faz "Maxx Santa Ângela" bater com app/maxx-santa-angela)
assert.equal(slugify('Maxx Santa Ângela'), 'maxx-santa-angela');
assert.equal(slugify('Gran Ville Santo Ângelo'), 'gran-ville-santo-angelo');
assert.equal(slugify('Maitá'), 'maita');
assert.equal(slugify('Avelã'), 'avela');
// pontuação e espaços repetidos colapsam num hífen só, sem sobrar nas pontas
assert.equal(slugify('  Doppio — Jundiaí!  '), 'doppio-jundiai');

/* ---------- hrefForSlug ---------- */
// Regressão que motivou o teste: estas 8 landings foram migradas depois da lista
// escrita à mão e ficaram de fora dela, então seus cards em /lotus-lancamentos
// caíam no WhatsApp em vez de abrir a página.
for (const slug of [
  'allegrato', 'avalon', 'best-view-residence', 'doppio-jundiai',
  'maita', 'odeon', 'portal-dos-lagos', 'sky-videiras',
]) {
  assert.equal(hrefForSlug(slug), `/${slug}`, `landing ${slug} deveria linkar`);
}

// Rotas do portal não são landings de empreendimento — um lançamento chamado
// "Lotus Busca" não pode sequestrar a página de busca.
for (const slug of ['lotus-busca', 'lotus-home', 'meus-dados', 'api']) {
  assert.equal(hrefForSlug(slug), null, `${slug} não é landing`);
}

// Slug sem página: card cai no contato, não gera link quebrado.
assert.equal(hrefForSlug('lago-samambaia'), null);

// A trava de verdade: toda landing em app/ tem que linkar. Criar uma pasta nova
// sem mais nada já é suficiente, e este teste falha se algum filtro a excluir.
const appDir = join(process.cwd(), 'app');
const landings = readdirSync(appDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && isLandingDir(appDir, e.name))
  .map((e) => e.name);

assert.ok(landings.length >= 23, `esperava ao menos 23 landings em app/, achei ${landings.length}`);
for (const slug of landings) {
  assert.equal(hrefForSlug(slug), `/${slug}`, `landing ${slug} existe em app/ mas não linka`);
}

console.log(`ok — ${landings.length} landings, todas linkáveis`);
