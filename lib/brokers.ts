import { supabase, TENANT_ID } from './supabase';

// Camada de dados dos CORRETORES do Portal.
// Fonte: view pública portal_brokers = tenant_memberships (quem é corretor:
// role + tenant) JOIN user_profiles (nome/foto). Leitura anônima; a view expõe
// só id/name/photo_url — PII (email/phone) fica de fora por grant de coluna.
// Ver supabase/migrations/0002_portal_brokers_view.sql.

export type Broker = {
  id: string;
  name: string;
  photoUrl: string | null;
  creci: string | null;
  imoveisAtivos: number;
};

type BrokerRow = {
  id: string;
  name: string;
  photo_url: string | null;
  creci: string | null;
  imoveis_ativos: number;
};

/**
 * AJUSTES LOCAIS DA LISTA — paliativo, não a fonte de verdade.
 *
 * A composição da equipe é dado do dashboard (octo-dash2): quem entra e quem
 * sai deve ser alterado lá, na `tenant_memberships`. O portal só LÊ o Supabase,
 * então estes dois blocos permitem refletir uma mudança de equipe no site antes
 * do dashboard ser atualizado.
 *
 * Assim que o cadastro real for feito, ESVAZIE os dois: manter um corretor
 * inventado aqui depois de ele existir no banco produz entrada duplicada, e
 * manter alguém em OCULTOS depois de removido no banco vira código morto.
 */
// Existem no Supabase, mas não devem aparecer no site.
// No banco o Samir está cadastrado como "Samir Said" (não "Augusto").
const OCULTOS = new Set(['reginaldo barbosa faleiros', 'samir said']);

// Vazio: a Lara e o Samir já foram cadastrados no dashboard, então o banco é a
// fonte deles. Mirleine também saiu do banco, e o OCULTOS dela foi removido por
// ter virado código morto. Só volte a preencher aqui se precisar exibir alguém
// antes do cadastro real — e esvazie assim que o cadastro existir.
const EXTRAS: Broker[] = [];

const chaveNome = (nome: string) => nome.normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');

/** Corretores do tenant Lotus (para /lotus-corretores).
 *  A view portal_brokers já filtra role (corretor/team_leader), tenant e
 *  nome não-vazio. O .eq(tenant_id) aqui é defesa em profundidade. */
export async function getBrokers(): Promise<Broker[]> {
  const { data, error } = await supabase
    .from('portal_brokers')
    .select('id, name, photo_url, creci, imoveis_ativos')
    .eq('tenant_id', TENANT_ID)
    .order('name');

  if (error) {
    console.error('[getBrokers] erro Supabase:', error.message);
    // Sem banco não há lista: os EXTRAS sozinhos passariam a impressão de que a
    // equipe inteira é uma pessoa. Mantém o empty-state.
    return [];
  }

  const doBanco = (data as BrokerRow[])
    .map((r) => ({
      id: r.id,
      name: r.name,
      photoUrl: r.photo_url,
      creci: r.creci,
      imoveisAtivos: r.imoveis_ativos ?? 0,
    }))
    .filter((b) => !OCULTOS.has(chaveNome(b.name)));

  // Se o corretor já existe no banco, o banco vence e o EXTRA é descartado —
  // evita duplicata no dia em que o cadastro real for feito.
  const jaNoBanco = new Set(doBanco.map((b) => chaveNome(b.name)));
  const extras = EXTRAS.filter((e) => !jaNoBanco.has(chaveNome(e.name)));

  // A ordenação por nome vinha do `.order('name')`; refaz porque os extras
  // entrariam sempre no fim.
  return [...doBanco, ...extras].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
