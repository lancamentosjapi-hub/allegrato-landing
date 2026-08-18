import { supabase, TENANT_ID } from './supabase';
import { hrefForSlug, slugParaLanding, slugify } from './landings';
import { developmentsFallback, type DevelopmentCard } from './developments';

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
  // null = preço não informado. Quem renderiza escolhe o texto; a camada de
  // dados não devolve rótulo de interface disfarçado de valor.
  price: string | null;
  specs: string;
  exclusive: boolean;
  img: string | null;
  href: string | null; // landing rica se existir; senão null (card abre contato)
};

// Normaliza o preço da listagem para `string | null`. Além do campo vazio, trata
// "Consultar valor" — texto de interface que o dash e o fallback curado gravaram
// como se fosse valor. Concentrado aqui para o card não precisar conhecê-lo.
function precoOuNulo(texto: string | null | undefined): string | null {
  const v = texto?.trim();
  if (!v || v.toLowerCase() === 'consultar valor') return null;
  return v;
}

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
    price: precoOuNulo(row.preco_texto),
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
      `[lancamentos] portal_landing_slugs indisponível (${error.message}), ` +
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

/**
 * Landings publicadas que nenhum lançamento do banco representa.
 *
 * Uma página que existe em app/ NÃO pode depender de cadastro no dash para ser
 * encontrada. Foi assim que 8 landings prontas e no ar (authoria, avalon,
 * best-view-residence, brisas-do-japi, odeon, sky-videiras, vigore, vivarte)
 * ficaram invisíveis na vitrine: a listagem passou a ler só do Supabase, e elas
 * não tinham linha lá. Página publicada aparece; cadastro no dash enriquece o
 * card (foto real, preço, estágio), não decide se ele existe.
 *
 * Os dados saem do fallback curado em developments.ts, que já cobre as 23.
 */
function landingsForaDoBanco(slugsNoBanco: Set<string>): DevelopmentCard[] {
  return developmentsFallback.filter((d) => {
    const slug = d.href?.replace(/^\//, '') ?? '';
    return slug && hrefForSlug(slug) !== null && !slugsNoBanco.has(slug);
  });
}

// "Bairro · Cidade" -> as duas partes. A listagem filtra por cidade, então o
// fallback precisa entregar os campos separados como o banco entrega.
function partesLocalizacao(location: string): { neighborhood: string; city: string } {
  const partes = location.split('·').map((p) => p.trim()).filter(Boolean);
  if (partes.length >= 2) return { neighborhood: partes[0], city: partes[partes.length - 1] };
  return { neighborhood: '', city: partes[0] ?? '' };
}

// OCULTAÇÃO TEMPORÁRIA — auditoria de capas de 07/08/2026.
//
// Estes 21 empreendimentos estão com foto de capa imprópria para vitrine:
// cômodo isolado (lavabo, área de serviço, cozinha), decorado genérico que não
// identifica o empreendimento, ou registro de obra/terraplenagem. A capa é a
// foto marcada como principal no dashboard e o portal só lê — a correção é lá.
//
// Ficam fora da home e da listagem até a troca. Assim que a foto principal for
// ajustada no dashboard, apagar o nome desta lista devolve o empreendimento.
// Esvaziar a lista devolve todos.
const OCULTOS_ATE_TROCAR_CAPA = [
  'Lago Samambaia',
  'Residencial Terras da Alvorada',
  'Anhangabaú Design',
  'Vitale Fernande',
  'Resort Prime',
  'Diferenziato',
  'Auten Jundiaí',
  'Vila Itália',
  'Altos da Avenida',
  'Reserva Marajoara',
  'Hub 9 de julho',
  'Vallis',
  'Terrace Serra do Japi',
  'Gioviale',
  'Reserva Castanheira',
  'Maxx Santa Ângela',
  'Mutton',
  'Villagio Tunis',
  'Portal dos Lagos',
];

const chaveNome = (nome: string) => nome.normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
const ocultos = new Set(OCULTOS_ATE_TROCAR_CAPA.map(chaveNome));

// CAPA CURADA — exceção deliberada à regra "o banco manda".
//
// Normalmente a capa vem da foto marcada como principal no dashboard, e o
// portal só lê. Quando a Lotus escolhe a foto por aqui, o nome entra neste
// mapa e o arquivo local passa a vencer o dashboard SÓ para esse
// empreendimento — os demais seguem o banco.
//
// Isto cria uma segunda fonte da verdade: trocar a capa no dashboard não vai
// surtir efeito em quem estiver listado aqui. É de propósito, e é temporário.
// Ao arrumar a foto principal no dashboard, apagar a linha correspondente.
//
// Chave = nome do empreendimento como aparece no site. Valor = caminho em
// public/ (a imagem precisa existir lá).
// Escolhidas revisando as fotos de cada landing contra a capa que vinha do
// dashboard. Critério: mostrar o empreendimento (fachada, conjunto ou área
// comum que o identifique), não um cômodo isolado nem decorado genérico.
// Avalon e SKY Videiras ficaram de fora: a capa que já tinham é a melhor foto
// da landing deles.
const CAPAS_CURADAS: Record<string, string> = {
  // fachada / conjunto
  'Authoria by Tebas': '/authoria/a046.jpg',       // a do dash era só sacadas, cortada
  'Jardins do Horto': '/jardins-do-horto/a004.jpg', // as torres ao pôr do sol
  Maitá: '/maita/a007.jpg',
  Manawa: '/manawa/a005.png',
  Vigóre: '/vigore/a44.jpg',                       // as duas torres, não uma lateral
  'Vivarte Grand Alamedas': '/vivarte/a015.jpg',   // o conjunto de dia
  'Doppio Jundiaí': '/assets/doppio-capa.jpg',     // resolve também a foto repetida com o Vivarte
  // aérea do conjunto
  'Best View Residence': '/best-view-residence/a013.png',
  'Forest Houses': '/forest-houses/a009.jpg',      // mostra que são casas em condomínio
  // portaria / entrada (loteamentos e condomínios)
  'Brisas do Japi': '/brisas-do-japi/HALLDEENTRADA.jpg', // e sai do servidor da construtora
  'Gran Ville Santo Ângelo': '/gran-ville-santo-angelo/a013.jpg',
  'Vistta Castanho': '/vistta-castanho/a009.jpg',
  // fachada enviada pela Lotus, recortada em 16:9
  Santorini: '/santorini/fotos/fachada.jpg',
  // lazer, quando é o que identifica o produto
  Allegrato: '/allegrato/a013.jpg',                // piscinas com as torres ao fundo
  Avelã: '/avela/a012.jpg',
  // Odeon: a landing não tem NENHUMA foto de fachada — só decorado, plantas e
  // aéreas da região. A piscina coberta é o melhor que existe até chegar uma
  // foto do prédio.
  'Odeon Residencial': '/odeon/a005.jpg',
};

const capasCuradas = new Map(Object.entries(CAPAS_CURADAS).map(([n, p]) => [chaveNome(n), p]));

const comCapaCurada = <T extends { name: string; img: string | null }>(itens: T[]): T[] =>
  itens.map((i) => {
    const curada = capasCuradas.get(chaveNome(i.name));
    return curada ? { ...i, img: curada } : i;
  });

// Ocultar era consequência da capa ruim. Ganhando capa curada, o motivo
// desaparece e o empreendimento volta sozinho — sem precisar lembrar de tirar
// o nome das duas listas.
//
// Aplicado no fim, depois do merge com as landings curadas: filtrar antes
// deixaria o fallback reintroduzir o mesmo empreendimento por outro caminho.
const semCapaRuim = <T extends { name: string }>(itens: T[]): T[] =>
  itens.filter((i) => {
    const k = chaveNome(i.name);
    return !ocultos.has(k) || capasCuradas.has(k);
  });

// Sem landing própria, o card só levava ao WhatsApp: o visitante clicava
// esperando conhecer o empreendimento e caía no atendimento. Enquanto a página
// não existir, o empreendimento fica fora da vitrine e da listagem.
//
// Criar a landing é o que o traz de volta — não há lista para editar aqui.
const temPaginaPropria = <T extends { href: string | null }>(i: T) => Boolean(i.href);

// Um empreendimento pode chegar por dois caminhos: o cadastro do banco e a
// landing curada. O merge já descarta a curada quando a do banco é
// apresentável, mas um cadastro pela metade (sem foto) escapava desse teste e
// voltava a passar depois de ganhar capa curada, duplicando o card. Deduplicar
// por nome no fim fecha isso independente da ordem em que os filtros rodam.
// Entre duas cópias, fica a que TEM foto. Guardar simplesmente a primeira
// escolhia o cadastro pela metade e descartava o bom: o card sumia inteiro
// depois, ao ser reprovado no teste de "apresentável" lá na página.
const semRepetidos = <T extends { name: string; img: string | null }>(itens: T[]): T[] => {
  const melhor = new Map<string, T>();
  for (const i of itens) {
    const k = chaveNome(i.name);
    const atual = melhor.get(k);
    if (!atual || (!atual.img && i.img)) melhor.set(k, i);
  }
  // Preserva a ordem original em vez da ordem de inserção do Map.
  const escolhidos = new Set(melhor.values());
  return itens.filter((i) => escolhidos.has(i));
};

// Ordem importa: capa curada primeiro (senão um item bom seria reprovado por
// falta de foto), depois quem aparece, depois `completo` — que descarta o
// cadastro pela metade — e só então a deduplicação. Deduplicar antes de
// `completo` fazia a cópia incompleta do banco vencer a curada e o
// empreendimento sumir por inteiro.
const publicaveis = <T extends { name: string; img: string | null; href: string | null }>(
  itens: T[],
  completo: (i: T) => boolean
): T[] =>
  semRepetidos(semCapaRuim(comCapaCurada(itens)).filter(temPaginaPropria).filter(completo));

export async function getLancamentos(): Promise<LancamentoCard[]> {
  const rows = await fetchRowsComLanding();
  const cards = rows.map(toCard);

  // Só conta como "coberta pelo banco" a landing cujo card do banco realmente vai
  // aparecer. Um lançamento cadastrado sem foto é escondido pelo filtro de
  // apresentável — se ele bastasse para bloquear o fallback, a landing sumiria
  // por ter sido cadastrada pela metade, que é pior do que não ter cadastro.
  const noBanco = new Set(
    cards
      .filter(isApresentavel)
      .map((c) => c.href?.replace(/^\//, '') ?? '')
      .filter(Boolean),
  );
  const daLanding: LancamentoCard[] = landingsForaDoBanco(noBanco).map((d) => ({
    id: `landing:${d.href}`,
    name: d.name,
    location: d.location,
    stage: d.stage,
    builder: d.builder,
    specs: d.specs,
    price: d.price,
    exclusive: d.exclusive,
    img: d.img,
    href: d.href,
  }));

  return publicaveis([...cards, ...daLanding], isApresentavel).sort((a, b) => {
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

/**
 * Lançamento correspondente a uma landing publicada — insumo da marcação de
 * lead de lançamento no /api/lead (campos `lancamento_id` e `property_code`
 * do contrato do CRM). `nome` sai exatamente como cadastrado no dash, que é
 * como o outro lado casa o lead com o empreendimento.
 *
 * null = landing sem linha no banco (ou Supabase fora — fetchRows já degrada
 * para lista vazia). Nunca inventar id/nome aqui: lead marcado errado some da
 * fila do time certo; sem id ele só segue sem o vínculo.
 */
export async function getLancamentoParaLead(
  slug: string,
): Promise<{ id: string; nome: string } | null> {
  const rows = await fetchRowsComLanding();
  const row = rows.find((r) => slugDaLanding(r) === slug);
  return row ? { id: row.id, nome: row.nome } : null;
}

// Itens da listagem /lotus-lancamentos (com campos de filtro).
export async function getLancamentosList(): Promise<LancamentoListItem[]> {
  const rows = await fetchRowsComLanding();
  const itens = rows.map(toListItem);

  // Mesmo critério da home: cadastro incompleto (sem foto/cidade) não bloqueia o
  // fallback, senão a landing some por ter sido cadastrada pela metade.
  const noBanco = new Set(
    itens
      .filter(isListItemApresentavel)
      .map((i) => i.href?.replace(/^\//, '') ?? '')
      .filter(Boolean),
  );
  const daLanding: LancamentoListItem[] = landingsForaDoBanco(noBanco).map((d) => {
    const { neighborhood, city } = partesLocalizacao(d.location);
    return {
      id: d.href?.replace(/^\//, '') ?? d.name,
      name: d.name,
      neighborhood,
      city,
      stage: d.stage,
      // Sem type/priceNum: o fallback curado não tem os categóricos de filtro. O
      // card aparece normalmente e só não é alcançado pelos filtros de tipo/preço
      // — o mesmo trade-off já aceito para os lançamentos do banco sem esses
      // campos (ver isListItemApresentavel). Mostrar vale mais que filtrar.
      type: '',
      priceNum: 0,
      price: precoOuNulo(d.price),
      specs: d.specs,
      exclusive: d.exclusive,
      img: d.img,
      href: d.href,
    };
  });

  return publicaveis([...itens, ...daLanding], isListItemApresentavel);
}
