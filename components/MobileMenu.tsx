'use client';

/**
 * MobileMenu — botão hambúrguer + drawer de navegação para telas pequenas.
 *
 * Único ponto de navegação mobile do portal. Reusado no header interno
 * (LotusHeader) e no header da home. Só aparece em telas < 761px: nesse
 * ponto o CSS global (styles/base.css) esconde a <nav> horizontal; este
 * componente entra no lugar dela.
 *
 * A lista de itens é a mesma fonte de verdade do LotusHeader (NAV_ITEMS),
 * importada de lá para não divergir.
 */

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { NAV_ITEMS } from './LotusHeader';

const WHATSAPP_DEFAULT = '5511926143393';

const S = {
  // Botão hambúrguer: display é controlado 100% pela classe .lt-burger no CSS
  // (none no desktop, inline-flex ≤760px). NÃO definir `display` inline aqui —
  // estilo inline venceria a media query e o botão apareceria no desktop.
  burger: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    background: 'transparent',
    border: '1px solid rgba(205,171,110,.35)',
    borderRadius: 12,
    color: '#f7f2e8',
    cursor: 'pointer',
    padding: 0,
  } as CSSProperties,
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(11,22,16,.6)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
  } as CSSProperties,
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 201,
    width: 'min(84vw, 340px)',
    background: '#15241c',
    boxShadow: '-24px 0 60px -30px rgba(0,0,0,.7)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 22px calc(20px + env(safe-area-inset-bottom)) 22px',
  } as CSSProperties,
  panelTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  } as CSSProperties,
  brand: {
    fontFamily: "'Fraunces',serif",
    fontWeight: 400,
    fontSize: 20,
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
  } as CSSProperties,
  close: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    background: 'transparent',
    border: 'none',
    color: '#f7f2e8',
    cursor: 'pointer',
    padding: 0,
  } as CSSProperties,
  navLink: {
    display: 'block',
    padding: '13px 4px',
    fontSize: 18,
    fontWeight: 500,
    color: 'rgba(247,242,232,.9)',
    borderBottom: '1px solid rgba(247,242,232,.08)',
  } as CSSProperties,
  cta: {
    marginTop: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#b18a4a',
    color: '#15241c',
    fontWeight: 600,
    fontSize: 15,
    padding: '14px 18px',
    borderRadius: 40,
  } as CSSProperties,
};

export interface MobileMenuProps {
  /** WhatsApp do CTA dentro do drawer. */
  whatsapp?: string;
  /** Texto do CTA. */
  cta?: string;
  /** Link do CTA (default: WhatsApp derivado de `whatsapp`). */
  ctaHref?: string;
}

export default function MobileMenu({
  whatsapp = WHATSAPP_DEFAULT,
  cta = 'Falar com um especialista',
  ctaHref,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const waLink = ctaHref ?? 'https://wa.me/' + String(whatsapp ?? WHATSAPP_DEFAULT);

  // Trava o scroll do body e fecha no Esc enquanto o drawer está aberto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="lt-burger"
        aria-label="Abrir menu"
        aria-expanded={open}
        style={S.burger}
        onClick={() => setOpen(true)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div style={S.overlay} onClick={() => setOpen(false)} aria-hidden="true" />
          <div style={S.panel} role="dialog" aria-modal="true" aria-label="Menu de navegação">
            <div style={S.panelTop}>
              <span style={S.brand}>
                Lotus
                <span style={S.brandSub}>Brokers</span>
              </span>
              <button type="button" aria-label="Fechar menu" style={S.close} onClick={() => setOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="lt-mobile-nav">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  target="_top"
                  style={S.navLink}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <a href={waLink} target="_blank" rel="noopener" style={S.cta} onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
              </svg>
              {cta}
            </a>
          </div>
        </>
      )}
    </>
  );
}
