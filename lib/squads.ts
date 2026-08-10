// Squads da Lotus — FONTE ÚNICA.
//
// Antes cada página mantinha a sua própria lista: a /lotus-sobre foi atualizada
// para "Imóveis prontos" e "Lançamentos", enquanto a home continuou anunciando
// "Squad Residencial" e a /lotus-corretores citava "Alto Padrão, Lançamentos,
// Popular e Comercial". Três respostas diferentes para a mesma pergunta.
//
// Para mudar a composição dos squads, mexa AQUI. As páginas derivam desta lista
// — inclusive a frase corrida ("Imóveis prontos e Lançamentos"), montada por
// `nomesDosSquads()` para não haver texto a esquecer.

export type Squad = {
  /** Numeração exibida no card da home ("01", "02"…). */
  num: string;
  /** Nome curto, sem o prefixo "Squad" — a UI acrescenta quando faz sentido. */
  nome: string;
  descricao: string;
};

export const SQUADS: Squad[] = [
  {
    num: '01',
    nome: 'Imóveis prontos',
    descricao:
      'Casas e apartamentos prontos para morar: visita marcada, documentação conferida e negociação direta com o proprietário.',
  },
  {
    num: '02',
    nome: 'Lançamentos',
    descricao:
      'Quem conhece cada planta e a negociação com a construtora — da escolha à chave.',
  },
];

/** "Imóveis prontos e Lançamentos" — para uso no meio de uma frase. */
export function nomesDosSquads(): string {
  const nomes = SQUADS.map((s) => s.nome);
  if (nomes.length <= 1) return nomes[0] ?? '';
  return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
}
