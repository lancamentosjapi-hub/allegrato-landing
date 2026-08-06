'use client';

/**
 * LotusHeader — header/nav único das páginas internas do Portal Lotus.
 *
 * Fonte de verdade da barra de navegação: ordem, itens e destinos ficam
 * AQUI, não copiados em cada página. Isso evita a divergência que fazia os
 * itens "trocarem de lugar" entre páginas.
 *
 * Cobre o padrão visual "interno" (sticky, fundo sólido #15241c). A home
 * (header fixed transparente com efeito de scroll) é intencionalmente
 * diferente e não usa este componente.
 *
 * Uso:
 *   <LotusHeader active="comprar" whatsapp={whatsapp} />
 *   <LotusHeader active="blog" cta="Falar agora" />
 *   <LotusHeader rightSlot={<MeuBotao />} />   // substitui o CTA padrão
 */

import Link from 'next/link';
import React, { useState, type CSSProperties, type ReactNode } from 'react';
import MobileMenu from './MobileMenu';

const WHATSAPP_DEFAULT = '5511926143393';

/** Item ativo (recebe cor dourada e não é hoverável). */
export type LotusNavKey =
  | 'lancamentos'
  | 'comprar'
  | 'bairros'
  | 'sobre'
  | 'corretores'
  | 'guias'
  | 'blog'
  | null;

/** Ordem canônica da navegação — mudar aqui reflete em todas as páginas (inclui o menu mobile). */
export const NAV_ITEMS: { key: Exclude<LotusNavKey, null>; label: string; href: string }[] = [
  { key: 'lancamentos', label: 'Lançamentos', href: '/lotus-lancamentos' },
  { key: 'comprar', label: 'Comprar', href: '/lotus-busca' },
  { key: 'bairros', label: 'Bairros', href: '/lotus-bairro' },
  { key: 'sobre', label: 'A Lotus', href: '/lotus-sobre' },
  { key: 'corretores', label: 'Corretores', href: '/lotus-corretores' },
  { key: 'guias', label: 'Guias', href: '/lotus-faq' },
  { key: 'blog', label: 'Blog', href: '/lotus-blog' },
];

/* Estilos fixos (idênticos ao padrão interno atual). */
const S = {
  header: { position: 'sticky', top: 0, zIndex: 60, background: '#15241c' } as CSSProperties,
  inner: (maxWidth: number): CSSProperties => ({
    maxWidth,
    margin: '0 auto',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  }),
  logo: { display: 'flex', alignItems: 'center', gap: 11 } as CSSProperties,
  brand: {
    fontFamily: "'Fraunces',serif",
    fontWeight: 400,
    fontSize: 21,
    color: '#f7f2e8',
    lineHeight: 1,
  } as CSSProperties,
  brandSub: {
    fontSize: 11,
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: '#cdab6e',
    marginLeft: 6,
    fontFamily: "'Hanken Grotesk',sans-serif",
    fontWeight: 600,
    verticalAlign: 2,
  } as CSSProperties,
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontSize: 14.5,
    fontWeight: 500,
    color: 'rgba(247,242,232,.85)',
  } as CSSProperties,
  linkActive: { color: '#cdab6e' } as CSSProperties,
  linkBase: { transition: 'color .2s' } as CSSProperties,
  linkHover: { color: '#cdab6e' } as CSSProperties,
  cta: {
    background: '#b18a4a',
    color: '#15241c',
    fontWeight: 600,
    fontSize: 14,
    padding: '9px 17px',
    borderRadius: 40,
    transition: 'background .2s',
  } as CSSProperties,
  ctaHover: { background: '#cdab6e' } as CSSProperties,
};

function LotusMark() {
  return (
    <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
  );
}

/** Link de nav hoverável (rota interna → <Link> do Next, sem full reload). */
function NavLink({ label, href }: { label: string; href: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      target="_top"
      style={{ ...S.linkBase, ...(hover ? S.linkHover : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </Link>
  );
}

/** CTA dourado padrão (WhatsApp). */
function CtaButton({ href, label }: { href: string; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      style={{ ...S.cta, ...(hover ? S.ctaHover : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </a>
  );
}

export interface LotusHeaderProps {
  /** Item de nav destacado (dourado, sem hover). */
  active?: LotusNavKey;
  /** Número do WhatsApp para o CTA padrão. */
  whatsapp?: string;
  /** Texto do CTA padrão. */
  cta?: string;
  /** Link do CTA padrão (default: WhatsApp derivado de `whatsapp`). */
  ctaHref?: string;
  /** Substitui totalmente o CTA padrão (ex.: Favoritos + botão do Busca). */
  rightSlot?: ReactNode;
  /** Largura máxima do conteúdo (Busca usa 1480; demais, 1280). */
  maxWidth?: number;
}

export default function LotusHeader({
  active = null,
  whatsapp = WHATSAPP_DEFAULT,
  cta = 'Falar com a LIA',
  ctaHref,
  rightSlot,
  maxWidth = 1280,
}: LotusHeaderProps) {
  const waLink = ctaHref ?? 'https://wa.me/' + String(whatsapp ?? WHATSAPP_DEFAULT);

  return (
    <header style={S.header}>
      <div style={S.inner(maxWidth)}>
        <Link href="/lotus-home" style={S.logo}>
          <LotusMark />
        </Link>

        <nav style={S.nav}>
          {NAV_ITEMS.map((item) =>
            item.key === active ? (
              <span key={item.key} style={S.linkActive}>
                {item.label}
              </span>
            ) : (
              <NavLink key={item.key} label={item.label} href={item.href} />
            )
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {rightSlot ?? <CtaButton href={waLink} label={cta} />}
          <MobileMenu whatsapp={whatsapp} cta={cta} ctaHref={ctaHref} />
        </div>
      </div>
    </header>
  );
}
