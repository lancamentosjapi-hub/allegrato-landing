/**
 * Pertencimento: sub-bairro / loteamento / condomínio -> bairro do guia.
 *
 * O cadastro do imóvel tem um campo `bairro` só, e nele a equipe grava o nível
 * mais específico: "Jardim Ermida II", "Vila Sereno", "Jardim Messina". Os
 * guias de /lotus-bairro, por sua vez, falam do nível acima: "Eloy Chaves".
 *
 * Sem uma ponte entre os dois, a busca por bairro exato não encontra nada:
 * nenhum dos imóveis cadastrados tem `bairro = "Eloy Chaves"`, então o guia de
 * Eloy Chaves mostrava zero imóveis e a página do imóvel não tinha guia para
 * apontar. Não era falta de estoque; era taxonomia.
 *
 * Este mapa é a ponte, e cobre só quem é de fato sub-bairro: só entra pertencimento que
 * dá para confirmar. Os títulos de AP676 e AP677 dizem "Vila Sereno, Eloy
 * Chaves" enquanto o campo bairro diz "Jardim Ermida II" — é daí que sai a
 * relação, não de chute geográfico. Os demais nomes que aparecem no cadastro
 * são bairros de verdade, e não sub-bairros: ver BAIRROS_SEM_GUIA_AINDA no fim
 * do arquivo.
 *
 * Quando o dashboard ganhar um campo próprio de sub-bairro, este mapa vira
 * fallback: a leitura passa a preferir o dado cadastrado e só cai aqui para os
 * registros antigos. A assinatura das funções não muda.
 */

/** sub-bairro (como vem no cadastro) -> bairro do guia (nome em lib/bairros.ts) */
const PERTENCE_A: Record<string, string> = {
  'jardim ermida i': 'Eloy Chaves',
  'jardim ermida ii': 'Eloy Chaves',
  'vila sereno': 'Eloy Chaves',
};

const chave = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Bairro do guia a que este endereço pertence, ou null.
 *
 * Um bairro que JÁ é nível de guia responde por si mesmo: "Eloy Chaves" ->
 * "Eloy Chaves". Assim quem chamar não precisa saber em que nível está.
 */
export function bairroDoGuia(bairroDoImovel: string | null | undefined, nomesDeGuia: string[]): string | null {
  const k = chave(bairroDoImovel || '');
  if (!k) return null;
  const proprio = nomesDeGuia.find((n) => chave(n) === k);
  if (proprio) return proprio;
  const pai = PERTENCE_A[k];
  return pai && nomesDeGuia.some((n) => chave(n) === chave(pai)) ? pai : null;
}

/**
 * Todos os nomes que um guia deve procurar no cadastro: ele mesmo e os
 * sub-bairros que pertencem a ele. É o que faz o guia de Eloy Chaves somar os
 * imóveis de Jardim Ermida I e II.
 */
export function nomesDoBairro(bairroDoGuiaNome: string): string[] {
  const k = chave(bairroDoGuiaNome);
  const filhos = Object.entries(PERTENCE_A)
    .filter(([, pai]) => chave(pai) === k)
    .map(([sub]) => sub);
  return [bairroDoGuiaNome, ...filhos];
}

/** Sub-bairros conhecidos, para diagnóstico e para o teste. */
export function subBairrosConhecidos(): Record<string, string> {
  return { ...PERTENCE_A };
}

/**
 * Bairros confirmados pela Lotus em 26/08/2026 como sendo de NÍVEL DE BAIRRO,
 * e não sub-bairros de outro.
 *
 * Ficam registrados porque a ausência deles no mapa acima é uma decisão, não um
 * esquecimento: eles aparecem no cadastro dos imóveis, não têm guia hoje, e
 * quem revisar isto depois poderia achar que faltou mapear e inventar um pai.
 *
 * Como são nível de bairro, ganham guia próprio quando a Lotus quiser: basta
 * acrescentá-los em lib/bairros.ts e a busca por imóveis já funciona, sem
 * precisar tocar neste arquivo.
 */
export const BAIRROS_SEM_GUIA_AINDA = [
  'Jardim Messina',
  'Jardim Pacaembu',
  'Vila Rio Branco',
  'Jardim Colonial',
] as const;
