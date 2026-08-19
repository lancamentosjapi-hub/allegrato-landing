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
 * O grupo ocupa uma linha inteira do cabeçalho (`flexBasis: '100%'` resolve o
 * caso do header ser flex; `width: 100%` resolve o caso de ser bloco), então
 * ele nunca disputa espaço com o logo e o menu que já estão lá. Como todos os
 * cabeçalhos das landings são escuros, as pílulas são translúcidas com borda
 * clara, sem depender da paleta de cada uma.
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

const grupo: CSSProperties = {
  width: '100%',
  flexBasis: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px calc(8px + env(safe-area-inset-bottom, 0px))',
  borderTop: '1px solid rgba(255,255,255,.12)',
  boxSizing: 'border-box',
};

export default function AtalhosLanding() {
  const [cabecalho, setCabecalho] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setCabecalho(document.querySelector('header'));
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
