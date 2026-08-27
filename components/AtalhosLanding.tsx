'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useState, type CSSProperties } from 'react';

/**
 * Atalhos de saída das landings: volta para a home e para a listagem de
 * lançamentos.
 *
 * Entram por portal DENTRO do <header> da própria página. Antes eram pílulas
 * fixas no canto inferior esquerdo, o que atrapalhava a leitura: ficavam por
 * cima do conteúdo durante a rolagem inteira e disputavam espaço com o botão
 * do WhatsApp e com widgets do navegador.
 *
 * Portal em vez de editar o JSX de cada landing: são 23 cabeçalhos com
 * estrutura e cor próprias, e qualquer mudança de texto ou destino voltaria a
 * ser 23 edições.
 *
 * O grupo fica EM LINHA com o logo, o menu e os CTAs do cabeçalho, a pedido da
 * Lotus. Ocupava uma linha própria antes; agora disputa espaço com o resto,
 * daí `flexShrink: 0`, que impede as pílulas de serem esmagadas quando o
 * cabeçalho aperta. Como todos os cabeçalhos das landings são escuros, elas
 * são translúcidas com borda clara, sem depender da paleta de cada uma.
 *
 * É `div role="navigation"` e não `nav`: styles/base.css tem a regra
 * `header nav:not(.lt-mobile-nav){display:none}` no celular, que existe para
 * esconder o menu horizontal do portal. Um `nav` aqui dentro cairia junto e o
 * grupo sumia no mobile, que foi o que aconteceu na primeira tentativa.
 *
 * Sem <header> na página, nada é renderizado, em vez de o grupo aparecer solto
 * no topo do conteúdo. Hoje todas têm.
 *
 * Complementa o [RodapeVoltarLancamentos], que é o botão no fim da página.
 */

/**
 * Onde encaixar o grupo, e por que depende da largura.
 *
 * No desktop o destino é o PAI do último link do cabeçalho, ou seja, o
 * container dos CTAs ("Lista VIP", "WhatsApp"): virando irmão deles, o grupo
 * entra na mesma linha seja qual for a estrutura da landing. Montar direto no
 * <header> não serve, porque em boa parte delas o <header> é bloco e o flex
 * mora num <nav> interno; o grupo virava uma faixa de largura total ABAIXO dos
 * botões (medido: 1253px no Santorini, 378px no Odeon).
 *
 * No celular esse mesmo container é escondido pelas media queries das próprias
 * landings (`.navlinks{display:none}` por volta de 1100px), e o grupo sumia
 * junto: medido 0x0 no Odeon e no Santorini a 390px. Abaixo do breakpoint o
 * destino volta a ser o <header>, onde o grupo fica visível em linha própria.
 *
 * 1100px é o menor breakpoint em que as landings escondem o menu horizontal.
 */
const LARGURA_CTAS_VISIVEIS = 1100;

function destinoNoCabecalho(): HTMLElement | null {
  const cab = document.querySelector('header');
  if (!cab) return null;
  if (window.innerWidth < LARGURA_CTAS_VISIVEIS) return cab;
  const links = cab.querySelectorAll('a');
  const ultimo = links[links.length - 1];
  return (ultimo?.parentElement as HTMLElement) ?? cab;
}

const grupo: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
  marginRight: 12,
};

export default function AtalhosLanding() {
  const [cabecalho, setCabecalho] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const escolher = () => setCabecalho(destinoNoCabecalho());
    escolher();
    // Girar o aparelho ou redimensionar cruza o breakpoint e muda o destino.
    window.addEventListener('resize', escolher);
    return () => window.removeEventListener('resize', escolher);
  }, []);

  if (!cabecalho) return null;

  return createPortal(
    <div data-atalhos-landing="" role="navigation" aria-label="Sair desta página" style={grupo}>
      <Atalho href="/lotus-home" rotulo="Início" icone={<IconeCasa />} />
      <Atalho href="/lotus-lancamentos" rotulo="Lançamentos" icone={<IconeSeta />} />
    </div>,
    cabecalho
  );
}

function Atalho({ href, rotulo, icone }: { href: string; rotulo: string; icone: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
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
