import { supabase, TENANT_ID } from './supabase';
import { resumoDescricao } from './resumo-imovel';

// Camada de dados dos IMÓVEIS do Portal.
// Fonte: view pública portal_imoveis (Supabase, leitura anônima, RLS por
// status_aprovacao='aprovado'). Rotas dinâmicas /lotus-imovel/[codigo].
// Identificador da rota = codigo_imovel (ex "CA054") — URL amigável, único por tenant.

export type FotoImovel = { id?: string; url: string; legenda?: string; isCapa?: boolean };

export type ImovelRow = {
  id: string;
  tenant_id: string;
  codigo_imovel: string;
  titulo: string | null;
  tipo: string | null;
  tipo_simplificado: string | null;
  finalidade: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  area_total: number | null;
  area_util: number | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  salas: number | null;
  valor_venda: number | null;
  valor_locacao: number | null;
  valor_condominio: number | null;
  valor_iptu: number | null;
  descricao: string | null;
  fotos: FotoImovel[] | null;
  metragem_m2: number | null;
  condominio_id: string | null;
  link_video: string | null;
  tour_virtual: string | null;
};

function capaUrl(fotos: FotoImovel[] | null): string | null {
  if (!fotos || fotos.length === 0) return null;
  return (fotos.find((f) => f.isCapa) ?? fotos[0]).url ?? null;
}

export type ImovelCard = {
  codigo: string;
  titulo: string | null;
  bairro: string | null;
  cidade: string | null;
  capa: string | null;
  valor: number | null;
};

export function toCard(row: ImovelRow): ImovelCard {
  return {
    codigo: row.codigo_imovel,
    titulo: row.titulo,
    bairro: row.bairro,
    cidade: row.cidade,
    capa: capaUrl(row.fotos),
    valor: row.valor_venda || row.valor_locacao || null,
  };
}

// Formata valor em R$ (para a UI). null/0 -> "Consultar valor".
export function formatValor(v: number | null): string {
  if (!v || v <= 0) return 'Consultar valor';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const SELECT_FULL =
  'id, tenant_id, codigo_imovel, titulo, tipo, tipo_simplificado, finalidade, logradouro, numero, bairro, cidade, estado, cep, area_total, area_util, quartos, suites, banheiros, vagas, salas, valor_venda, valor_locacao, valor_condominio, valor_iptu, descricao, fotos, metragem_m2, condominio_id, link_video, tour_virtual';

/* ------------------------------------------------------------------ */
/* Busca (/lotus-busca) — imóveis reais aprovados, formato da UI        */
/* ------------------------------------------------------------------ */

// Formato consumido pela página de busca. Espelha o shape que o componente
// LotusBusca já esperava (antes vinha de dados mock), agora derivado do banco.
export type ImovelBusca = {
  id: string; // = codigo_imovel (usado no href /lotus-imovel/[codigo])
  codigo: string;
  fin: 'comprar' | 'alugar';
  type: string;
  neighborhood: string;
  city: string;
  beds: number;
  area: number;
  vagas: number;
  priceNum: number;
  price: string; // valor formatado (ex "R$ 790.000")
  pinLabel: string; // rótulo curto do pin do mapa (ex "R$ 790k")
  badge: string; // selo opcional ("Lotus Listing")
  /** Descrição integral, como veio do dash. A página do imóvel usa esta. */
  desc: string;
  /** Trecho curto de `desc`, para o card da listagem. Ver resumoDescricao. */
  resumo: string;
  img: string; // capa (url do Storage) ou '' (fallback gradiente)
  slot: string;
  x: string; // posição do pin no mapa decorativo (derivada do código)
  y: string;
  recent: number; // score p/ ordenação "mais recentes" (derivado)
};

export { resumoDescricao };

/** Mapeia finalidade do banco -> aba da busca. Aceita venda/locação/aluguel. */
function finalidadeToAba(finalidade: string | null): 'comprar' | 'alugar' {
  return /loca|alug/i.test(finalidade ?? '') ? 'alugar' : 'comprar';
}

/** Rótulo curto de preço p/ o pin ("R$ 790k", "R$ 1,2 mi", "R$ 2,8k/mês"). */
function pinLabelDe(valor: number, aluguel: boolean): string {
  if (!valor || valor <= 0) return 'Consultar';
  if (aluguel) return 'R$ ' + Math.round(valor / 1000) + 'k';
  if (valor >= 1_000_000) {
    return 'R$ ' + (valor / 1_000_000).toFixed(valor % 1_000_000 === 0 ? 0 : 1).replace('.', ',') + ' mi';
  }
  return 'R$ ' + Math.round(valor / 1000) + 'k';
}

/** Posição x/y determinística do pin (0..1 estável por código, sem lat/lng real). */
function pinXY(codigo: string): { x: string; y: string } {
  let h = 0;
  for (let i = 0; i < codigo.length; i++) h = (h * 31 + codigo.charCodeAt(i)) | 0;
  const h2 = Math.abs(h);
  const x = 16 + (h2 % 68); // 16%..84%
  const y = 18 + ((Math.floor(h2 / 68)) % 60); // 18%..78%
  return { x: x + '%', y: y + '%' };
}

function toBusca(row: ImovelRow, index: number): ImovelBusca {
  const aluguel = finalidadeToAba(row.finalidade) === 'alugar';
  const valor = (aluguel ? row.valor_locacao : row.valor_venda) || row.valor_venda || row.valor_locacao || 0;
  const area = row.area_util || row.area_total || row.metragem_m2 || 0;
  const tipo = row.tipo || (row.tipo_simplificado ? row.tipo_simplificado[0].toUpperCase() + row.tipo_simplificado.slice(1) : 'Imóvel');
  const { x, y } = pinXY(row.codigo_imovel);
  return {
    id: row.codigo_imovel,
    codigo: row.codigo_imovel,
    fin: aluguel ? 'alugar' : 'comprar',
    type: tipo,
    neighborhood: row.bairro ?? '',
    city: row.cidade ?? '',
    beds: row.quartos ?? row.suites ?? 0,
    area,
    vagas: row.vagas ?? 0,
    priceNum: valor,
    price: formatValor(valor) + (aluguel && valor > 0 ? '/mês' : ''),
    pinLabel: pinLabelDe(valor, aluguel),
    badge: '',
    desc: row.descricao?.trim() ?? '',
    resumo: resumoDescricao(row.descricao),
    img: capaUrl(row.fotos) ?? '',
    slot: 'busca-' + row.codigo_imovel,
    x,
    y,
    recent: index, // ordem de retorno do banco = proxy de "mais recentes"
  };
}

/** Imóveis reais aprovados (RLS status_aprovacao='aprovado') p/ a busca. */
export async function getImoveisBusca(): Promise<ImovelBusca[]> {
  const { data, error } = await supabase
    .from('portal_imoveis')
    .select(SELECT_FULL)
    .eq('tenant_id', TENANT_ID);
  if (error) {
    console.error('[getImoveisBusca] erro Supabase:', error.message);
    return [];
  }
  return (data as unknown as ImovelRow[]).map((row, i) => toBusca(row, i));
}

/** Imóveis reais aprovados de um bairro específico (para /lotus-bairro/[slug]). */
export async function getImoveisPorBairro(
  bairro: string,
  limite = 4
): Promise<ImovelBusca[]> {
  const alvo = bairro.trim().toLowerCase();
  const todos = await getImoveisBusca();
  return todos.filter((im) => im.neighborhood.trim().toLowerCase() === alvo).slice(0, limite);
}

// Um imóvel por codigo_imovel (para a rota /lotus-imovel/[codigo]).
export async function getImovel(codigo: string): Promise<ImovelRow | null> {
  const { data, error } = await supabase
    .from('portal_imoveis')
    .select(SELECT_FULL)
    .eq('tenant_id', TENANT_ID)
    .eq('codigo_imovel', codigo)
    .maybeSingle();

  if (error) {
    console.error('[getImovel] erro Supabase:', error.message);
    return null;
  }
  return (data as unknown as ImovelRow) ?? null;
}

// Todos os códigos aprovados (para generateStaticParams).
export async function getImovelCodigos(): Promise<string[]> {
  const { data, error } = await supabase
    .from('portal_imoveis')
    .select('codigo_imovel')
    .eq('tenant_id', TENANT_ID);
  if (error) {
    console.error('[getImovelCodigos] erro Supabase:', error.message);
    return [];
  }
  return (data as { codigo_imovel: string }[]).map((r) => r.codigo_imovel);
}

// Cards resumidos (relacionados / listagem). Exclui opcionalmente um código.
export async function getImoveisCards(excludeCodigo?: string): Promise<ImovelCard[]> {
  const { data, error } = await supabase
    .from('portal_imoveis')
    .select('id, tenant_id, codigo_imovel, titulo, bairro, cidade, fotos, valor_venda, valor_locacao')
    .eq('tenant_id', TENANT_ID);
  if (error) {
    console.error('[getImoveisCards] erro Supabase:', error.message);
    return [];
  }
  return (data as ImovelRow[])
    .filter((r) => r.codigo_imovel !== excludeCodigo)
    .map(toCard);
}
