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
 * são bairros de verdade, e não sub-bairros: ver a nota no fim
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

/*
 * NÃO mapeie Jardim Messina, Jardim Pacaembu, Vila Rio Branco nem Jardim
 * Colonial aqui dentro.
 *
 * A Lotus confirmou em 26/08/2026 que os quatro são de NÍVEL DE BAIRRO, e em
 * 27/08/2026 eles ganharam guia próprio em lib/bairros.ts. A ausência deles no
 * mapa acima é decisão, não esquecimento: quem vir "Jardim Ermida II ->
 * Eloy Chaves" e quiser dar um pai a todo bairro pequeno acabaria escondendo
 * quatro guias legítimos dentro de outro.
 *
 * Antes havia aqui uma constante BAIRROS_SEM_GUIA_AINDA listando os quatro.
 * Saiu quando os guias entraram: o nome passou a mentir, ninguém a importava, e
 * o fato que ela guardava está dito nestas linhas.
 */
