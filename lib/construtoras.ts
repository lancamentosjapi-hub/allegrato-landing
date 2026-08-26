/**
 * Nome canônico de construtora, para o filtro de /lotus-lancamentos.
 *
 * O dashboard é campo de texto livre, e o mesmo nome chegou grafado de formas
 * diferentes: "Santa Angela" (11 registros) e "Santa Ângela" (3); "Sebel
 * Empreendimentos" e "SEBEL Empreendimentos". Um filtro montado direto do banco
 * mostraria a mesma construtora duas vezes, e escolher uma das opções esconderia
 * metade dos empreendimentos dela.
 *
 * Agrupar aqui, e não corrigir no banco, é de propósito: o portal só lê o
 * Supabase. A correção definitiva é na origem; enquanto ela não vem, o filtro
 * não pode exibir a bagunça.
 *
 * Módulo próprio, sem o client do Supabase, para o teste importar a função pura
 * sem arrastar o banco junto — mesma razão de lib/landings.ts existir separado
 * de lib/lancamentos.ts.
 */

/** Reduz a chave de comparação: sem acento, sem caixa, sem espaço repetido. */
function chave(nome: string): string {
  return nome
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valores que ocupam o campo mas não nomeiam ninguém.
 *
 * lib/developments.ts usa 'Construtora' como preenchimento genérico em 7
 * entradas, e uma traz 'Alto padrão', que é categoria e não empresa. Virariam
 * opções de filtro sem sentido, agrupando empreendimentos de construtoras
 * diferentes sob o mesmo rótulo. Tratados como não informado: o empreendimento
 * não é alcançado pelo filtro, que é honesto, em vez de aparecer sob um nome
 * que não é o dele.
 */
const PLACEHOLDERS = new Set(['construtora', 'incorporadora', 'construtor', 'alto padrao', 'n/a', '-', '--']);

function ehPlaceholder(nome: string): boolean {
  return PLACEHOLDERS.has(chave(nome));
}

const temAcento = (s: string) => /[\u00C0-\u024F]/.test(s);
const soMaiuscula = (s: string) => s === s.toUpperCase() && /[A-Z]{3,}/.test(s);

/**
 * Entre variantes da mesma construtora, escolhe a que vai aparecer no filtro.
 *
 * A mais frequente NÃO é o melhor critério: "Santa Angela" aparece mais que
 * "Santa Ângela" justamente porque digitar sem acento é o atalho comum. Então a
 * ordem é: com acento ganha de sem acento, caixa mista ganha de CAIXA ALTA, e só
 * então a frequência desempata.
 */
function melhorVariante(variantes: string[], frequencia: Map<string, number>): string {
  return [...variantes].sort((a, b) => {
    if (temAcento(a) !== temAcento(b)) return temAcento(a) ? -1 : 1;
    if (soMaiuscula(a) !== soMaiuscula(b)) return soMaiuscula(a) ? 1 : -1;
    const fa = frequencia.get(a) ?? 0;
    const fb = frequencia.get(b) ?? 0;
    if (fa !== fb) return fb - fa;
    return a.localeCompare(b, 'pt-BR');
  })[0];
}

/**
 * Mapa "nome como está no banco" -> "nome canônico", a partir de todos os nomes
 * observados. Nome vazio ou só espaço fica de fora: empreendimento sem
 * construtora preenchida não deve inventar uma.
 */
export function mapaDeConstrutoras(nomes: (string | null | undefined)[]): Map<string, string> {
  const porChave = new Map<string, Set<string>>();
  const frequencia = new Map<string, number>();

  for (const bruto of nomes) {
    const nome = bruto?.trim();
    if (!nome || ehPlaceholder(nome)) continue;
    frequencia.set(nome, (frequencia.get(nome) ?? 0) + 1);
    const k = chave(nome);
    if (!porChave.has(k)) porChave.set(k, new Set());
    porChave.get(k)!.add(nome);
  }

  const mapa = new Map<string, string>();
  for (const variantes of porChave.values()) {
    const canonico = melhorVariante([...variantes], frequencia);
    for (const v of variantes) mapa.set(v, canonico);
  }
  return mapa;
}

/** Lista de construtoras para o filtro, já sem duplicata e em ordem alfabética. */
export function construtorasParaFiltro(nomes: (string | null | undefined)[]): string[] {
  return [...new Set(mapaDeConstrutoras(nomes).values())].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
