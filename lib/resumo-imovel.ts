/**
 * Resumo da descrição do imóvel para o card da listagem.
 *
 * Módulo próprio, sem o client do Supabase, para o teste importar a função
 * pura sem arrastar o banco junto — mesma razão de lib/landings.ts existir
 * separado de lib/lancamentos.ts.
 */

/**
 * Trecho curto da descrição, para o card da listagem.
 *
 * O card já mostra tipo, bairro, cidade e specs (dormitórios, área, vagas) em
 * linhas próprias. Montar um resumo a partir desses mesmos campos só repetiria
 * o que está logo acima; o que a descrição acrescenta é o texto do corretor.
 * Então o resumo é um RECORTE do original, nunca uma reescrita: não há como
 * inventar atributo que o imóvel não tem.
 *
 * Corta na última pontuação de fim de frase dentro do limite, para a frase
 * terminar inteira. Sem pontuação, cai no último espaço, de modo que nunca
 * parte uma palavra ao meio. As reticências só aparecem quando houve corte.
 *
 * A descrição integral continua em `desc` e é o que a página do imóvel exibe.
 */
export function resumoDescricao(texto: string | null | undefined, limite = 150): string {
  const limpo = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;

  const janela = limpo.slice(0, limite);
  const fim = Math.max(janela.lastIndexOf('. '), janela.lastIndexOf('! '), janela.lastIndexOf('? '));
  // Só vale como frase se sobrar texto de verdade: um "Sr. " no começo cortaria
  // tudo fora.
  if (fim > limite * 0.5) return janela.slice(0, fim + 1);

  const espaco = janela.lastIndexOf(' ');
  const base = espaco > 0 ? janela.slice(0, espaco) : janela;
  return base.replace(/[,;:.\-–]$/, '') + '…';
}
