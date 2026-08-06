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
  const { getLancamentosList, getLancamentosRows, toListItem, isListItemApresentavel } =
    await import('../lib/lancamentos');
  const { landingSlugs, slugify } = await import('../lib/landings');

  const landings = [...landingSlugs()].sort();

  // DUAS fontes, e a distinção importa: getLancamentosList() é a vitrine final
  // (banco + landings servidas pelo fallback), enquanto getLancamentosRows() é só
  // o banco. Ler apenas a primeira torna o diagnóstico circular — ele veria os
  // itens do fallback e concluiria que estão cadastrados.
  const doBanco = await getLancamentosRows();
  const naVitrine = await getLancamentosList();

  const explicito = new Map(doBanco.map((r) => [r.nome, (r.landing_slug ?? '').trim()]));
  const origem = (nome: string) => (explicito.get(nome) ? 'landing_slug' : 'nome');

  // Convertidos a partir de `doBanco`, não filtrados de `naVitrine`: quando o
  // fallback serve uma landing com o mesmo nome do lançamento (Doppio, Forest
  // Houses), filtrar a vitrine traria os dois e o mesmo empreendimento apareceria
  // como OK e como incompleto ao mesmo tempo. Só o banco passa pelas checagens de
  // cadastro — item do fallback não tem dono no dash para corrigir.
  const rows = doBanco.map(toListItem);

  if (doBanco.length === 0) {
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
    const vinculo = explicito.get(r.name) ?? '';
    const visivel = isListItemApresentavel(r);

    // Vínculo explícito apontando para página que não existe. O CHECK do banco
    // valida o FORMATO do slug, não se a pasta existe — sem esta checagem um
    // "vivartee" cairia em "sem landing" e voltaria a falhar calado, que é
    // exatamente o que a coluna veio resolver.
    if (vinculo && !landings.includes(slugify(vinculo))) {
      errados.push(
        `${r.name}\n      landing_slug = "${vinculo}", mas não existe app/${slugify(vinculo)}/\n      ` +
          `CORRIJA no dash — slugs válidos: ${landings.slice(0, 4).join(', ')}, …`,
      );
      continue;
    }

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

  // Landings servidas pelo fallback curado, por não terem lançamento apresentável
  // no banco. NÃO é problema: a página aparece e abre normalmente. Cadastrar no
  // dash só troca os dados do card pelos reais (foto, preço, estágio).
  const cobertasPeloBanco = new Set(
    rows.filter(isListItemApresentavel).map((r) => r.href?.replace(/^\//, '') ?? ''),
  );
  const peloFallback = landings.filter((l) => !cobertasPeloBanco.has(l));

  // A trava de verdade: landing que não aparece por caminho NENHUM — nem pelo
  // banco nem pelo fallback. Só acontece se a página existir em app/ sem entrada
  // em developments.ts. Confirmado contra a vitrine real, não deduzido.
  const naVitrineSlugs = new Set(naVitrine.map((r) => r.href?.replace(/^\//, '') ?? ''));
  const invisiveisDeVez = landings.filter((l) => !naVitrineSlugs.has(l));

  const p = (t: string, xs: string[]) => {
    console.log(`\n${t} (${xs.length})`);
    if (!xs.length) console.log('   —');
    else xs.forEach((x) => console.log('   ' + x));
  };

  console.log(
    `${doBanco.length} lançamentos no banco · ${landings.length} landings em app/ · ` +
      `${naVitrine.length} cards na vitrine`,
  );
  p('OK — abrem a landing, com dados do banco', linkam);
  p('NOME ERRADO NO DASH — a landing existe mas o card cai no WhatsApp', errados);
  p(
    'NA VITRINE PELO FALLBACK — aparece e abre; cadastrar no dash troca pelos dados reais',
    peloFallback.map((o) => `/${o}   opcional: lançamento com landing_slug = "${o}" (nome livre)`),
  );
  p(
    'NÃO APARECE EM LUGAR NENHUM — página existe mas falta entrada em lib/developments.ts',
    invisiveisDeVez.map((o) => `/${o}`),
  );
  p('CARD SEM FOTO/CIDADE — a landing aparece pelo fallback, mas com dados curados', invisiveis);
  p('SEM LANDING — card vai para o WhatsApp (esperado, não há página)', semLanding);

  // Só falha no que é de fato defeito: link para página inexistente ou landing
  // que sumiu da vitrine. Card servido pelo fallback é o funcionamento normal.
  if (errados.length || invisiveisDeVez.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
