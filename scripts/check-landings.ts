/**
 * Diagnóstico do casamento lançamento (dash) × landing (app/).
 *
 * Existe porque cadastrar um lançamento no dash era um chute: o link para a
 * landing sai de slugify(nome), e o único jeito de saber se o nome bateu era
 * esperar a revalidação de 1h e olhar o card. Aqui a resposta sai em segundos,
 * lendo o mesmo banco e a mesma função que a página usa.
 *
 *   npm run check:landings
 *
 * Não altera nada — só lê.
 */

// O client do Supabase é criado no import de lib/lancamentos e exige as env vars
// já presentes, então o .env.local entra antes — e os módulos entram por import
// dinâmico dentro de main(), depois disso. `--env-file` não serve aqui: o Node
// proíbe essa flag em NODE_OPTIONS, e o script roda através do tsx.
try {
  process.loadEnvFile('.env.local');
} catch {
  // sem .env.local (CI/servidor): usa as env vars já exportadas no ambiente.
}

// Preposições ficam minúsculas ("Brisas do Japi", não "Brisas Do Japi"). Cosmético:
// o slugify trata as duas formas igual, mas a sugestão é copiada e colada no dash.
const MINUSCULAS = new Set(['do', 'da', 'de', 'dos', 'das', 'e']);

/** Nome que a equipe teria que digitar no dash para cair em `slug`. */
function nomeNecessario(slug: string): string {
  return slug
    .split('-')
    .map((p, i) =>
      i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1),
    )
    .join(' ');
}

/**
 * Landing provavelmente pretendida por um nome que não bateu.
 * Heurística deliberadamente burra: o slug do lançamento começa com o slug da
 * landing ("vivarte-grand-alamedas" → "vivarte") ou o contrário. Serve para
 * apontar o erro de digitação, não para adivinhar link nenhum.
 */
function landingProvavel(slug: string, landings: string[]): string | null {
  const cand = landings
    .filter((l) => slug.startsWith(l + '-') || l.startsWith(slug + '-'))
    .sort((a, b) => b.length - a.length);
  return cand[0] ?? null;
}

async function main() {
  const { getLancamentosList, getLancamentosRows, isListItemApresentavel } =
    await import('../lib/lancamentos');
  const { landingSlugs, slugify } = await import('../lib/landings');

  const landings = [...landingSlugs()].sort();
  const rows = await getLancamentosList();

  // Para dizer se o vínculo é explícito (landing_slug) ou derivado do nome.
  const explicito = new Map(
    (await getLancamentosRows()).map((r) => [r.nome, (r.landing_slug ?? '').trim()]),
  );
  const origem = (nome: string) => (explicito.get(nome) ? 'landing_slug' : 'nome');

  if (rows.length === 0) {
    console.log('Nenhum lançamento retornado pelo banco. Verifique as env vars do Supabase.');
    process.exitCode = 1;
    return;
  }

  const linkam: string[] = [];
  const semLanding: string[] = [];
  const errados: string[] = [];
  const invisiveis: string[] = [];

  for (const r of rows) {
    const slug = slugify(r.name);
    const visivel = isListItemApresentavel(r);

    if (!visivel) {
      const falta = [!r.img && 'foto', !r.city && 'cidade'].filter(Boolean).join(' e ');
      invisiveis.push(`${r.name}  —  falta ${falta} (não aparece na vitrine)`);
      continue;
    }

    if (r.href) {
      linkam.push(`${r.name}  ->  ${r.href}   (por ${origem(r.name)})`);
    } else {
      const alvo = landingProvavel(slug, landings);
      if (alvo) {
        errados.push(
          `${r.name}\n      gera "${slug}", mas a landing é "/${alvo}"\n      ` +
            `CORRIJA o nome no dash para: "${nomeNecessario(alvo)}"`,
        );
      } else {
        semLanding.push(r.name);
      }
    }
  }

  const usados = new Set(rows.map((r) => slugify(r.name)));
  const orfas = landings.filter((l) => !usados.has(l));

  const p = (t: string, xs: string[]) => {
    console.log(`\n${t} (${xs.length})`);
    if (!xs.length) console.log('   —');
    else xs.forEach((x) => console.log('   ' + x));
  };

  console.log(`${rows.length} lançamentos no banco · ${landings.length} landings em app/`);
  p('OK — abrem a landing', linkam);
  p('NOME ERRADO NO DASH — a landing existe mas o card cai no WhatsApp', errados);
  p('LANDING ÓRFÃ — a página existe, mas nenhum lançamento no dash aponta para ela', orfas.map((o) => `/${o}   cadastre um lançamento chamado "${nomeNecessario(o)}"`));
  p('INVISÍVEL — cadastrado, mas não aparece na vitrine', invisiveis);
  p('SEM LANDING — card vai para o WhatsApp (esperado, não há página)', semLanding);

  if (errados.length || invisiveis.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
