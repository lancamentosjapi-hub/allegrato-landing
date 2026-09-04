import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Descoberta das landing pages ricas e o link do card de empreendimento.
 *
 * Mora fora de `lancamentos.ts` para o teste importar sem arrastar o client do
 * Supabase junto (mesmo motivo das funções puras em `lead.ts`).
 *
 * Uma landing é um diretório de rota em `app/` que não pertence ao portal —
 * derivado do filesystem, não de uma lista escrita à mão. A lista à mão JÁ ficou
 * defasada uma vez: 8 landings migradas depois dela (allegrato, avalon,
 * best-view-residence, doppio-jundiai, maita, odeon, portal-dos-lagos,
 * sky-videiras) nunca foram registradas, e os cards delas em /lotus-lancamentos
 * caíam no WhatsApp em vez de abrir a página. Agora criar `app/<slug>/page.tsx`
 * basta: o link aparece sozinho, sem lista para esquecer de atualizar.
 *
 * `fs` é seguro aqui porque só Server Components chegam neste módulo
 * (app/lotus-home e app/lotus-lancamentos, via lancamentos.ts).
 */

const PORTAL_ROUTE = /^(lotus-|api$|meus-dados$)/;

/** Regra única de "este diretório de app/ é uma landing" — o teste reusa esta função. */
export function isLandingDir(appDir: string, name: string): boolean {
  return (
    !name.startsWith('[') && // rotas dinâmicas não são landings
    !PORTAL_ROUTE.test(name) &&
    existsSync(join(appDir, name, 'page.tsx'))
  );
}

/**
 * Landings servidas como HTML estático de public/<slug>/index.html, com rewrite
 * em next.config.mjs. Não vivem em app/, então a varredura do diretório não as
 * enxerga — daí a lista explícita. Ao converter uma para componente React,
 * remover o slug daqui e criar app/<slug>/.
 */
export const LANDINGS_HTML = ['altissimi', 'oasis', 'vila-triunfo', 'reserva-castanheira', 'santorini', 'epic-jundiai'] as const;

let cache: Set<string> | null = null;

export function landingSlugs(): Set<string> {
  if (cache) return cache;
  const appDir = join(process.cwd(), 'app');
  let slugs: string[] = [];
  try {
    slugs = readdirSync(appDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && isLandingDir(appDir, e.name))
      .map((e) => e.name);
  } catch (err) {
    // Sem app/ legível não dá para saber quais landings existem. Loga alto em vez
    // de degradar em silêncio: o sintoma seria a listagem inteira cair no contato.
    console.error('[landings] não foi possível ler app/:', err);
  }
  if (slugs.length === 0) {
    console.error('[landings] nenhuma landing encontrada em app/, cards vão cair no contato');
  }
  cache = new Set([...slugs, ...LANDINGS_HTML]);
  return cache;
}

/** slug a partir do nome (ex.: "Gran Ville Santo Ângelo" -> "gran-ville-santo-angelo") */
export function slugify(nome: string): string {
  return nome
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Rota da landing rica para um slug, ou null se não existir página.
 * Fonte única de verdade do link do card (banco e fallback estático).
 */
export function hrefForSlug(slug: string): string | null {
  return landingSlugs().has(slug) ? `/${slug}` : null;
}

/**
 * Slug da landing de um lançamento: o vínculo explícito do dash quando houver,
 * senão o nome normalizado.
 *
 * O explícito (coluna `landing_slug`, migration 0004) também passa pelo slugify:
 * ele vem de um campo de texto digitado à mão, então "Vivarte" ou " vivarte "
 * valem tanto quanto "vivarte" — a coluna deve poupar o operador de adivinhar,
 * não criar uma segunda forma de errar.
 */
export function slugParaLanding(landingSlug: string | null | undefined, nome: string): string {
  const explicito = landingSlug?.trim();
  return slugify(explicito ? explicito : nome);
}
