'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * Atalhos de saída das landings: "Início" leva à home da Lotus e "Voltar" à
 * listagem de lançamentos.
 *
 * ORDEM PEDIDA PELA LOTUS: "Início" é sempre o PRIMEIRO item do menu do
 * cabeçalho e "Voltar" é sempre o ÚLTIMO, com os itens da própria landing
 * entre os dois. Por isso são dois pontos de montagem diferentes, e não um
 * grupo só como era antes — o grupo unico caía inteiro no fim da barra.
 *
 * Entram por portal em vez de edição do JSX de cada landing: são 26
 * cabeçalhos com estrutura e cor próprias, e qualquer mudança de texto ou
 * destino voltaria a ser 26 edições.
 *
 * Complementa o BotaoVoltar de [RodapeLotus], que é o botão no fim da página.
 */

/**
 * Abaixo desta largura as landings escondem o menu horizontal
 * (`.navlinks{display:none}` por volta de 1100px em quase todas). Sem menu
 * visível não há "primeiro" nem "último" item para disputar: os dois botões
 * passam a ocupar uma linha própria na barra, na ordem Início → Voltar.
 */
const LARGURA_MENU_VISIVEL = 1100;

/** Acima disto o elemento é uma capa, não uma barra de menu. */
const ALTURA_MAXIMA_DE_BARRA = 200;

/**
 * A barra do topo da landing, procurada por COMPORTAMENTO e não por tag.
 *
 * Mirar em `document.querySelector('header')` estava errado em 8 das 26
 * landings: no Vigóre e no Maxx Santa Ângela o <header> é o hero de 720px, e
 * os atalhos iam parar no meio da imagem de capa; o Vivarte não tem <header>
 * nenhum, e o grupo simplesmente não aparecia; e em Avela, Best View, Maxx,
 * Vigóre e Vivarte a barra real é um <nav> ou <div> fixo no topo.
 *
 * O que define uma barra de topo: está presa no topo (fixed ou sticky) ou é um
 * <header> comum, ocupa quase toda a largura e é baixa. A mais externa vence,
 * para o grupo não cair dentro de um wrapper interno da barra.
 */
function barraDoTopo(): HTMLElement | null {
  const temCaraDeBarra = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return (
      r.height > 0 &&
      r.height <= ALTURA_MAXIMA_DE_BARRA &&
      r.width >= window.innerWidth * 0.8
    );
  };

  // O primeiro resultado em ordem de documento é sempre o mais externo: um
  // ancestral aparece antes dos seus descendentes. É o que evita ancorar num
  // wrapper interno da barra.

  // 1) A barra presa no topo — cobre as que são <nav> ou <div> (Vigóre, Maxx,
  //    Vivarte, Avela, Best View) e as <header> fixas (a maioria).
  for (const el of document.querySelectorAll<HTMLElement>('header, nav, div')) {
    const pos = getComputedStyle(el).position;
    if (pos !== 'fixed' && pos !== 'sticky') continue;
    if (el.getBoundingClientRect().top > 8) continue;
    if (temCaraDeBarra(el)) return el;
  }

  // 2) <header> que rola junto com a página. Aceita um respiro do topo porque
  //    algumas começam abaixo de uma faixa ou de uma margem — o Brisas do Japi
  //    tem a barra a 36px, e exigir topo zero deixava a página sem atalho.
  for (const el of document.querySelectorAll<HTMLElement>('header')) {
    if (el.getBoundingClientRect().top > ALTURA_MAXIMA_DE_BARRA) continue;
    if (temCaraDeBarra(el)) return el;
  }

  return null;
}

/**
 * O menu horizontal dentro da barra, se houver.
 *
 * Vários cabeçalhos guardam DOIS <nav>: o menu horizontal e a gaveta do
 * celular, que fica montada e escondida. Na Authoria a gaveta vem primeiro no
 * HTML, e pegar o primeiro <nav> mandava o "Início" para dentro dela — o botão
 * existia no DOM e não aparecia na tela. Uma gaveta ocupa a altura toda da
 * janela; um menu de barra, não. É esse o critério.
 */
function menuVisivelDentro(barra: HTMLElement): HTMLElement | null {
  for (const nav of barra.querySelectorAll<HTMLElement>('nav')) {
    if (nav === barra) continue;
    const cs = getComputedStyle(nav);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = nav.getBoundingClientRect();
    if (r.height === 0 || r.height > ALTURA_MAXIMA_DE_BARRA) continue;
    return nav;
  }
  return null;
}

/**
 * Cria a âncora do "Início" como PRIMEIRO item do menu.
 *
 * Dois arranjos aparecem nas landings:
 *
 * 1. A barra tem um <nav> interno só com os links de seção (Odeon e a maioria).
 *    Aí basta entrar como primeiro filho desse <nav>: a marca fica fora dele e
 *    continua na frente.
 *
 * 2. A própria barra é o menu (Vigóre, Maxx Santa Ângela, Vivarte). Aí o botão
 *    entra logo DEPOIS da marca, que continua sendo o primeiro elemento.
 *
 * A marca é localizada pelo primeiro <a> da barra, e não pelo primeiro filho:
 * no Maxx Santa Ângela a barra começa com um <div> vazio e a linha de verdade
 * é o filho seguinte, então mirar no primeiro filho punha o "Início" na frente
 * do logo, fora da linha. Pelo primeiro link a âncora cai sempre ao lado da
 * marca, dentro da mesma linha, seja qual for o aninhamento.
 */
function ancorarInicio(barra: HTMLElement): HTMLElement {
  const marca = barra.querySelector('a');
  const menuInterno = menuVisivelDentro(barra);

  // Só dá para entrar como primeiro filho do menu quando a marca está FORA
  // dele. Em Reserva Castanheira, Santorini e Oásis o <nav> guarda o logo, o
  // menu e os CTAs no mesmo flex, e prender no começo punha o "Início" na
  // frente do logo.
  if (menuInterno && (!marca || !menuInterno.contains(marca))) {
    return ancorar(menuInterno, 'inicio', 'data-atalho-inicio');
  }
  if (!marca || !marca.parentElement) {
    return ancorar(menuInterno ?? barra, 'inicio', 'data-atalho-inicio');
  }
  const ancora = criarAncora('data-atalho-inicio');
  marca.parentElement.insertBefore(ancora, marca.nextSibling);
  return ancora;
}

/**
 * O fim da barra — onde "Voltar" precisa ser o último item.
 *
 * É o container do último link (normalmente os CTAs "Lista VIP"/"WhatsApp").
 * Virando irmão deles, o botão entra na mesma linha seja qual for a estrutura.
 */
function fimDaBarra(barra: HTMLElement): HTMLElement {
  const links = barra.querySelectorAll('a');
  const ultimo = links[links.length - 1];
  return (ultimo?.parentElement as HTMLElement) ?? barra;
}

/**
 * A que distância da borda começa o conteúdo da barra.
 *
 * Medida pelo logo, que é o primeiro item visível de todas elas. Cada landing
 * usa um padding próprio (20, 24, 28px, e menor ainda no celular), e copiar um
 * número fixo deixaria os atalhos desalinhados em boa parte delas.
 */
function recuoDoConteudo(barra: HTMLElement, linha: HTMLElement): number {
  const marca = barra.querySelector('a');
  if (!marca) return 0;
  // Medido em relação à LINHA e não à barra: em parte das landings a âncora já
  // nasce dentro do container que carrega o padding, e descontar a borda da
  // barra dobrava o recuo (no Vigóre, 40px contra os 20px do logo).
  const recuo = marca.getBoundingClientRect().left - linha.getBoundingClientRect().left;
  // Logo centralizado ou fora do fluxo daria um número sem sentido aqui.
  return recuo > 0 && recuo < 80 ? recuo : 0;
}

/** Span vazio que serve de destino ao portal, sem caixa própria no layout. */
function criarAncora(marca: string): HTMLElement {
  const ancora = document.createElement('span');
  ancora.setAttribute(marca, '');
  ancora.style.display = 'contents'; // não interfere no flex/grid do hospedeiro
  return ancora;
}

/** Cria a âncora do portal na posição pedida e devolve o elemento. */
function ancorar(dentro: HTMLElement, onde: 'inicio' | 'fim', marca: string): HTMLElement {
  const ancora = criarAncora(marca);
  if (onde === 'inicio') dentro.insertBefore(ancora, dentro.firstChild);
  else dentro.appendChild(ancora);
  return ancora;
}

type Montagem =
  | { modo: 'inline'; inicio: HTMLElement; voltar: HTMLElement }
  | { modo: 'linha'; linha: HTMLElement };

export default function AtalhosLanding() {
  const [montagem, setMontagem] = useState<Montagem | null>(null);

  useEffect(() => {
    let ancoras: HTMLElement[] = [];

    const limpar = () => {
      for (const a of ancoras) a.remove();
      ancoras = [];
    };

    const montar = () => {
      limpar();
      const barra = barraDoTopo();
      if (!barra) {
        setMontagem(null);
        return;
      }

      if (window.innerWidth >= LARGURA_MENU_VISIVEL) {
        const inicio = ancorarInicio(barra);
        const voltar = ancorar(fimDaBarra(barra), 'fim', 'data-atalho-voltar');
        ancoras = [inicio, voltar];
        setMontagem({ modo: 'inline', inicio, voltar });
        return;
      }

      const linha = ancorar(barra, 'fim', 'data-atalhos-linha');
      // Aqui a âncora É a linha e precisa de caixa própria: como `span` inline
      // ela ignorava a largura e o padding não empurrava o conteúdo, e os
      // botões continuavam colados na borda mesmo com o recuo calculado.
      linha.style.display = 'block';
      linha.style.width = '100%';
      // A linha entra na barra, mas FORA do container que carrega o padding
      // dela — sem isso os botões encostam na borda da tela enquanto o logo
      // respeita um recuo. O recuo do logo é a medida certa, seja ela qual
      // for na landing, e alinha os dois na mesma vertical.
      linha.style.paddingLeft = `${recuoDoConteudo(barra, linha)}px`;
      ancoras = [linha];
      setMontagem({ modo: 'linha', linha });
    };

    montar();
    // Girar o aparelho ou redimensionar cruza o breakpoint e troca o encaixe.
    window.addEventListener('resize', montar);
    return () => {
      window.removeEventListener('resize', montar);
      limpar();
    };
  }, []);

  if (!montagem) return null;

  const inicio = <Atalho href="/lotus-home" rotulo="Início" icone={<IconeCasa />} />;
  const voltar = <Atalho href="/lotus-lancamentos" rotulo="Voltar" icone={<IconeSeta />} />;

  if (montagem.modo === 'inline') {
    return (
      <>
        {createPortal(<Encaixe posicao="inicio">{inicio}</Encaixe>, montagem.inicio)}
        {createPortal(<Encaixe posicao="fim">{voltar}</Encaixe>, montagem.voltar)}
      </>
    );
  }

  return createPortal(
    <div data-atalhos-landing="" role="navigation" aria-label="Sair desta página" style={linhaPropria}>
      {inicio}
      {voltar}
    </div>,
    montagem.linha
  );
}

/* Espaçamento uniforme entre os atalhos e os itens vizinhos da barra, que é o
   que a Lotus pediu na padronização: 12px de folga do lado que encosta no
   restante do menu, e nenhuma do lado da borda. */
function Encaixe({ posicao, children }: { posicao: 'inicio' | 'fim'; children: React.ReactNode }) {
  return (
    <span
      data-atalhos-landing=""
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        [posicao === 'inicio' ? 'marginRight' : 'marginLeft']: 12,
      }}
    >
      {children}
    </span>
  );
}

const linhaPropria: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
  width: '100%',
  padding: '0 0 10px',
  boxSizing: 'border-box',
};

function Atalho({ href, rotulo, icone }: { href: string; rotulo: string; icone: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        // Todas as barras das landings são escuras: translúcido com borda clara
        // funciona nas 26 sem depender da paleta de cada uma.
        background: hover ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)',
        color: '#fff',
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        padding: '8px 14px',
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,.22)',
        transition: 'background .2s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icone}
      {rotulo}
    </Link>
  );
}

/* Ícones em SVG e não em caractere: "⌂" e "←" não existem em toda fonte de
   sistema e caem em glifo de caixa vazia em parte dos aparelhos Android. */

function IconeCasa() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function IconeSeta() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}
