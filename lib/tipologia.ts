/**
 * Regras que dependem da TIPOLOGIA do imóvel: gênero gramatical e quais campos
 * fazem sentido exibir.
 *
 * Existe porque o template escrevia "as condições deste casa": o texto era
 * montado com um demonstrativo fixo no masculino mais o tipo vindo do banco.
 * Corrigir só aquela frase deixaria o próximo texto dinâmico com o mesmo
 * defeito, então a regra passa a morar num lugar só.
 *
 * Módulo puro, sem o client do Supabase, para o teste importar sem arrastar o
 * banco junto — mesma razão de lib/landings.ts e lib/construtoras.ts.
 */

/** Palavras de tipologia que são femininas em português. */
const FEMININAS = [
  'casa',
  'sala',
  'loja',
  'chacara',
  'chácara',
  'cobertura',
  'kitnet',
  'kitchenette',
  'fazenda',
  'area',
  'área',
  'vaga',
  'ponta',
  'edicula',
  'edícula',
];

const semAcento = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * Gênero da PRIMEIRA palavra do tipo, que é o substantivo que rege a
 * concordância: "Casa em condomínio" concorda com "casa", não com "condomínio".
 */
export function generoDoTipo(tipo: string | null | undefined): 'm' | 'f' {
  const primeira = semAcento(tipo || '').split(/[\s/,-]+/)[0] ?? '';
  return FEMININAS.some((f) => semAcento(f) === primeira) ? 'f' : 'm';
}

/** "deste" / "desta", conforme o tipo. */
export function demonstrativoDe(tipo: string | null | undefined): string {
  return generoDoTipo(tipo) === 'f' ? 'desta' : 'deste';
}

/** "o" / "a", conforme o tipo. */
export function artigoDe(tipo: string | null | undefined): string {
  return generoDoTipo(tipo) === 'f' ? 'a' : 'o';
}

/**
 * Tipologias que NÃO têm terreno próprio: a unidade é parte de um edifício, e
 * "m² do terreno" ali é o terreno do condomínio inteiro, não do imóvel.
 *
 * Importa porque no cadastro atual `area_total` vem igual a `area_util` nos
 * apartamentos (101/101, 113/113), então a página exibia "101 m² terreno" para
 * um apartamento de 101 m². O campo continua no banco; só deixa de ser exibido
 * onde não faz sentido.
 */
const SEM_TERRENO = ['apartamento', 'apto', 'ap', 'cobertura', 'studio', 'estudio', 'flat', 'loft', 'kitnet', 'kitchenette', 'sala', 'conjunto'];

export function temAreaDeTerreno(tipo: string | null | undefined): boolean {
  const primeira = semAcento(tipo || '').split(/[\s/,-]+/)[0] ?? '';
  if (!primeira) return false; // sem tipo, não afirma que há terreno
  return !SEM_TERRENO.some((t) => semAcento(t) === primeira);
}
