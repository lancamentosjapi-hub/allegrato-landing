import { readConsent } from './consent';

/**
 * Favoritos e buscas salvas do visitante, no navegador dele.
 *
 * O botão "Salvar esta busca" existia e não guardava nada; os favoritos viviam
 * em useState e sumiam ao recarregar a página. Aqui eles passam a persistir.
 *
 * ONDE: localStorage, no próprio navegador. Nada vai para servidor, então não
 * há dado pessoal trafegando nem base a proteger. É a opção mais privada que
 * atende ao pedido.
 *
 * CONSENTIMENTO: guardar preferência que a pessoa pediu explicitamente é
 * armazenamento FUNCIONAL, não marketing — a LGPD não exige consentimento para
 * executar o que o titular solicitou. Mesmo assim exigimos que ela já tenha
 * respondido o banner (aceitando tudo OU só o essencial), porque enquanto não
 * respondeu não sabemos se ela quer que o site guarde qualquer coisa. Recusar
 * os não-essenciais NÃO desliga favoritos: seria punir quem recusou analytics
 * tirando uma funcionalidade que ela pediu.
 *
 * O acesso é sempre em try/catch: navegação privada e "bloquear dados de site"
 * fazem o localStorage lançar em vez de devolver vazio.
 */

const CHAVE_FAVORITOS = 'lotus_favoritos_v1';
const CHAVE_BUSCAS = 'lotus_buscas_v1';
const MAX_BUSCAS = 10;

export type BuscaSalva = {
  /** Query string da busca, ex "tipo=Apartamento&cidade=Jundiaí". */
  query: string;
  /** Rótulo legível, montado pelos chips ativos. */
  rotulo: string;
  /** ISO. String para serializar sem conversão. */
  em: string;
};

/** A pessoa já respondeu o banner? Só depois disso o site guarda algo. */
export function podeGuardar(): boolean {
  try {
    return readConsent() !== null;
  } catch {
    return false;
  }
}

function ler<T>(chave: string, vazio: T): T {
  try {
    const cru = window.localStorage.getItem(chave);
    return cru ? (JSON.parse(cru) as T) : vazio;
  } catch {
    return vazio;
  }
}

function gravar(chave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    // Cota estourada, navegação privada em Safari antigo, storage bloqueado.
    return false;
  }
}

/* ---------------------------------- favoritos --------------------------- */

export function lerFavoritos(): string[] {
  if (!podeGuardar()) return [];
  return ler<string[]>(CHAVE_FAVORITOS, []);
}

/** Alterna e devolve a lista resultante. Sem consentimento, não grava. */
export function alternarFavorito(codigo: string): string[] {
  const atuais = lerFavoritos();
  const novos = atuais.includes(codigo)
    ? atuais.filter((c) => c !== codigo)
    : [...atuais, codigo];
  if (podeGuardar()) gravar(CHAVE_FAVORITOS, novos);
  return novos;
}

/* -------------------------------- buscas salvas ------------------------- */

export function lerBuscas(): BuscaSalva[] {
  if (!podeGuardar()) return [];
  return ler<BuscaSalva[]>(CHAVE_BUSCAS, []);
}

/**
 * Salva uma busca. A mesma query salva de novo sobe para o topo em vez de
 * duplicar, e a lista é limitada: guardar busca antiga sem limite só enche o
 * storage de coisa que ninguém vai reabrir.
 */
export function salvarBusca(query: string, rotulo: string, agora: string): BuscaSalva[] {
  const atuais = lerBuscas().filter((b) => b.query !== query);
  const novas = [{ query, rotulo, em: agora }, ...atuais].slice(0, MAX_BUSCAS);
  if (podeGuardar()) gravar(CHAVE_BUSCAS, novas);
  return novas;
}

export function removerBusca(query: string): BuscaSalva[] {
  const novas = lerBuscas().filter((b) => b.query !== query);
  if (podeGuardar()) gravar(CHAVE_BUSCAS, novas);
  return novas;
}
