import { supabase, TENANT_ID } from './supabase';
import { hrefForSlug, slugParaLanding, slugify } from './landings';

// Reexportados por compatibilidade: a descoberta das landings mora em landings.ts
// (ver o comentário de lá), mas `toCard`/`toListItem` continuam sendo o ponto de
// consumo e quem já importava daqui não precisa mudar.
export { hrefForSlug, slugify };

// Camada de dados dos LANÇAMENTOS (empreendimentos) do Portal.
// Fonte: view pública portal_lancamentos (Supabase, leitura anônima).
// A tabela `lancamentos` foi enriquecida (migration 20260717_enrich_...) com os
// campos que os cards exibem — cidade, bairro, estagio, specs, preco, exclusivo.
// Campos vazios (ainda não preenchidos no dash) caem em fallbacks neutros para
// não quebrar o layout nem inventar dado.

export type FotoLancamento = { url: string; legenda?: string; isCapa?: boolean };

export type LancamentoRow = {
  id: string;
  tenant_id: string;
  nome: string;
  descricao: string | null;
  fotos: FotoLancamento[] | null;
  endereco_plantao: string | null;
  cidade: string | null;
  bairro: string | null;
  estagio: string | null;
  construtora: string | null;
  dormitorios: string | null;
  specs: string | null;
  preco_texto: string | null;
  exclusivo: boolean | null;
  tipo_dorms: string | null;
  preco_num: number | null;
  created_at: string;
  updated_at: string;
  // Vínculo EXPLÍCITO com a landing (view portal_landing_slugs, migration 0005).
  // Quando preenchido manda, e o nome volta a ser livre no dash: "Vivarte Grand
  // Alamedas" pode apontar para /vivarte. Ausente/nulo cai no slugify(nome), o
  // comportamento de sempre. Anexado por fetchRowsComLanding — não vem de
  // portal_lancamentos, que esta base de código não controla.
  landing_slug?: string | null;
};

// Ponto único da regra — antes o slug era derivado em toCard e toListItem
// separadamente, que é como um dos dois acabaria divergindo do outro.
const slugDaLanding = (row: LancamentoRow) => slugParaLanding(row.landing_slug, row.nome);

// Card rico — o shape que os cards de empreendimento (home + lançamentos) consomem.
// Espelha os campos do array estático atual para manter o design idêntico.
export type LancamentoCard = {
  id: string;
  name: string;
  location: string;   // "Bairro · Cidade"
  stage: string;
  builder: string;
  specs: string;
  price: string;
  exclusive: boolean;
  img: string | null;
  href: string | null; // landing rica se existir; senão null (card sem link)
};

function capa(fotos: FotoLancamento[] | null): string | null {
  if (!fotos || fotos.length === 0) return null;
  return (fotos.find((f) => f.isCapa) ?? fotos[0]).url ?? null;
}

// Monta "Bairro · Cidade" com o que houver (evita separador solto).
function location(bairro: string | null, cidade: string | null): string {
  return [bairro, cidade].filter(Boolean).join(' · ');
}

export function toCard(row: LancamentoRow): LancamentoCard {
  const slug = slugDaLanding(row);
  return {
    id: row.id,
    name: row.nome,
    location: location(row.bairro, row.cidade),
    stage: row.estagio ?? '',
    builder: row.construtora ?? '',
    specs: row.specs ?? row.dormitorios ?? '',
    price: row.preco_texto ?? 'Consultar valor',
    exclusive: row.exclusivo ?? false,
    img: capa(row.fotos),
    href: hrefForSlug(slug),
  };
}

// Um card só é "apresentável" (bom o bastante para substituir o estático) quando
// tem imagem e localização. Enquanto o dash não for preenchido, os cards vêm
// incompletos e a UI deve preferir o fallback estático — sem degradar o visual.
export function isApresentavel(c: LancamentoCard): boolean {
  return Boolean(c.img && c.location);
}

// Item da LISTAGEM /lotus-lancamentos — espelha o shape `Emp` (com os campos de
// filtro tipo/preço). O componente calcula stageBg/stageColor a partir de `stage`.
export type LancamentoListItem = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  stage: string;
  type: string; // categórico p/ filtro, ex "3 dorms"
  priceNum: number;
  price: string;
  specs: string;
  exclusive: boolean;
  img: string | null;
  href: string | null; // landing rica se existir; senão null (card abre contato)
};

export function toListItem(row: LancamentoRow): LancamentoListItem {
  const slug = slugDaLanding(row);
  return {
    id: slug,
    name: row.nome,
    neighborhood: row.bairro ?? '',
    city: row.cidade ?? '',
    stage: row.estagio ?? '',
    type: row.tipo_dorms ?? '',
    priceNum: row.preco_num ?? 0,
    price: row.preco_texto ?? 'Consultar valor',
    specs: row.specs ?? row.dormitorios ?? '',
    exclusive: row.exclusivo ?? false,
    img: capa(row.fotos),
    href: hrefForSlug(slug),
  };
}

// Item da listagem é apresentável quando tem imagem e cidade (mesmo critério da
// home). Os campos de filtro (type/preco_num) são opcionais: quando ausentes, o
// item ainda aparece — só não é alcançado pelos filtros de tipo/preço até a
// equipe preencher esses campos no dash. Preferimos mostrar o dado real (foto +
// localização) a esconder o lançamento por falta de metadado de filtro.
export function isListItemApresentavel(i: LancamentoListItem): boolean {
  return Boolean(i.img && i.city);
}

// Busca os lançamentos publicados do tenant Lotus. Ordena: os que têm landing
// rica primeiro, depois por nome.
// Colunas expostas pela view portal_lancamentos (mantidas em sincronia com a view).
const SELECT_COLS =
  'id, tenant_id, nome, descricao, fotos, endereco_plantao, cidade, bairro, estagio, construtora, dormitorios, specs, preco_texto, exclusivo, tipo_dorms, preco_num, created_at, updated_at';

async function fetchRows(): Promise<LancamentoRow[]> {
  const { data, error } = await supabase
    .from('portal_lancamentos')
    .select(SELECT_COLS)
    .eq('tenant_id', TENANT_ID);

  if (error) {
    // ponytail: não derruba a página se o Supabase falhar; loga e devolve vazio.
    console.error('[lancamentos] erro Supabase:', error.message);
    return [];
  }
  return data as LancamentoRow[];
}

/**
 * Vínculo explícito lançamento -> landing, por id (migration 0005).
 *
 * View à parte de propósito: portal_lancamentos é criada no repo do dash, e
 * acrescentar uma coluna lá exigiria reescrever a definição inteira. Cruzar duas
 * listas por id em JS custa uma query e não arrisca a listagem.
 *
 * Falha (view ainda não criada, sem grant, Supabase fora) devolve mapa vazio: o
 * slug volta a sair do nome, que é o comportamento de antes da 0004. Nunca
 * derruba a página — daí o log ser aviso, não erro.
 */
async function fetchLandingSlugs(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('portal_landing_slugs')
    .select('id, landing_slug')
    .eq('tenant_id', TENANT_ID);

  if (error) {
    console.warn(
      `[lancamentos] portal_landing_slugs indisponível (${error.message}) — ` +
        'o link da landing sai do nome. Ver supabase/migrations/0005.',
    );
    return new Map();
  }
  return new Map(
    (data ?? [])
      .filter((r): r is { id: string; landing_slug: string } => Boolean(r.landing_slug))
      .map((r) => [r.id, r.landing_slug]),
  );
}

/** Lançamentos já com o vínculo explícito anexado, prontos para toCard/toListItem. */
async function fetchRowsComLanding(): Promise<LancamentoRow[]> {
  const [rows, slugs] = await Promise.all([fetchRows(), fetchLandingSlugs()]);
  return rows.map((r) => ({ ...r, landing_slug: slugs.get(r.id) ?? null }));
}

export async function getLancamentos(): Promise<LancamentoCard[]> {
  const rows = await fetchRowsComLanding();
  return rows
    .map(toCard)
    .sort((a, b) => {
      const al = a.href ? 0 : 1;
      const bl = b.href ? 0 : 1;
      return al !== bl ? al - bl : a.name.localeCompare(b.name, 'pt-BR');
    });
}

// Linhas cruas do banco. Só o diagnóstico (scripts/check-landings.ts) usa — ele
// precisa enxergar landing_slug para dizer se o vínculo é explícito ou derivado
// do nome. As páginas consomem os `to*` acima, não isto.
export async function getLancamentosRows(): Promise<LancamentoRow[]> {
  return fetchRowsComLanding();
}

// Itens da listagem /lotus-lancamentos (com campos de filtro).
export async function getLancamentosList(): Promise<LancamentoListItem[]> {
  const rows = await fetchRowsComLanding();
  return rows.map(toListItem);
}
