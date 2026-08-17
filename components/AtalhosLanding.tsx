'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Atalhos flutuantes de saída das landings de empreendimento: volta para a
 * listagem de lançamentos e volta para a home do portal.
 *
 * Ficam no canto INFERIOR ESQUERDO, empilhados. Três restrições explicam o
 * formato:
 *
 * - Direita está ocupada: toda landing tem o botão de WhatsApp fixo em
 *   right:22px com 60px de diâmetro.
 * - Topo não serve: cada landing veio de uma exportação diferente e tem
 *   cabeçalho próprio, então não existe um ponto comum onde encaixar sem
 *   mexer em 23 layouts distintos.
 * - Empilhado e não lado a lado: num aparelho de 360px sobram ~240px entre a
 *   margem esquerda e o botão do WhatsApp, e os dois atalhos lado a lado
 *   passam disso. Em coluna não colidem em largura nenhuma.
 *
 * A ordem é de breadcrumb, do mais geral para o mais específico: Início em
 * cima, Lançamentos embaixo (o destino mais provável fica mais perto do
 * polegar).
 *
 * Componente único de propósito: mudar texto, destino ou posição é uma edição
 * só, não vinte e três.
 */

const ATALHOS = [
  { href: '/lotus-home', rotulo: 'Início', icone: <IconeCasa /> },
  { href: '/lotus-lancamentos', rotulo: 'Lançamentos', icone: <IconeSeta /> },
];

export default function AtalhosLanding() {
  return (
    <nav
      aria-label="Sair desta página"
      style={{
        position: 'fixed',
        left: 22,
        bottom: 22,
        zIndex: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      {ATALHOS.map((a) => (
        <Atalho key={a.href} {...a} />
      ))}
    </nav>
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
        gap: 8,
        background: hover ? '#1d3a2c' : 'rgba(21,36,28,.92)',
        color: '#f7f2e8',
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        padding: '12px 18px',
        borderRadius: 40,
        border: '1px solid rgba(205,171,110,.45)',
        boxShadow: '0 14px 34px -10px rgba(21,36,28,.6)',
        backdropFilter: 'blur(4px)',
        transition: 'background .2s, transform .2s',
        transform: hover ? 'translateY(-2px)' : 'none',
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function IconeSeta() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}
