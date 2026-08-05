'use client';

/**
 * Helpers compartilhados do porte 1:1 das landings estáticas (mecanismo dc-runtime).
 *
 * As 15 primeiras landings duplicaram este bloco em cada componente. As landings
 * portadas depois importam daqui — mesmo comportamento, uma cópia só. Não há
 * refactor das antigas: seria mudança grande sem ganho funcional.
 *
 * Convenções de porte (idênticas às dos componentes existentes):
 *   style="css literal"  -> style={parseStyle('css literal')}
 *   style-hover="css"    -> <Hoverable as="tag" baseStyle={...} hoverStyle={...}>
 *   data-reveal          -> atributo mantido; animação via useReveal()
 *   sc-for / sc-if       -> .map() / {cond && ...}
 */

import Link from 'next/link';
import React, { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/** Converte "a:b;c:d" em React.CSSProperties (camelCase; valores exatos). */
export function parseStyle(css: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!css) return out;
  for (const decl of css.split(';')) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const rawProp = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!rawProp) continue;
    const prop = rawProp.startsWith('--')
      ? rawProp
      : rawProp
          .replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
          .replace(/^webkit/, 'Webkit');
    out[prop] = value;
  }
  return out as CSSProperties;
}

type HoverableProps<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  baseStyle: CSSProperties;
  hoverStyle: CSSProperties;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'style' | 'children'>;

/** style-hover do dc-runtime: hoverStyle vira :hover (mouseenter/mouseleave). */
export function Hoverable<T extends keyof React.JSX.IntrinsicElements = 'div'>({
  as,
  baseStyle,
  hoverStyle,
  children,
  ...rest
}: HoverableProps<T>) {
  const [hover, setHover] = useState(false);
  // Rota interna (href "/..." não-âncora) vira <Link> do Next: navegação
  // client-side instantânea + prefetch, sem full reload/tela branca.
  const rprops = rest as Record<string, unknown>;
  const href = typeof rprops.href === 'string' ? rprops.href : undefined;
  const isInternal = as === 'a' && href?.startsWith('/') && rprops.target !== '_blank';
  const Tag: React.ElementType = isInternal ? Link : (as || 'div');
  const { target: _t, ...linkRest } = rprops;
  const tagProps = isInternal ? linkRest : rest;
  return (
    <Tag
      {...tagProps}
      style={hover ? { ...baseStyle, ...hoverStyle } : baseStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Tag>
  );
}

/**
 * Reveal on scroll: adiciona `cls` aos elementos de `selector` ao entrarem na
 * viewport. O `safetyMs` é a rede de segurança dos fontes estáticos — sem ela,
 * uma falha de hidratação/IO deixaria seções `opacity:0` (faixas vazias).
 */
export function useReveal(selector: string, cls: string, threshold = 0.06, safetyMs = 900) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;
    const revealAllVisible = () => {
      const vh = window.innerHeight;
      for (const el of els) {
        if (!el.classList.contains(cls) && el.getBoundingClientRect().top < vh * 0.94) {
          el.classList.add(cls);
        }
      }
    };
    if (typeof IntersectionObserver !== 'function') {
      els.forEach((el) => el.classList.add(cls));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(cls);
            io.unobserve(e.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -2% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const t = window.setTimeout(revealAllVisible, safetyMs);
    window.addEventListener('load', revealAllVisible);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      window.removeEventListener('load', revealAllVisible);
    };
  }, [selector, cls, threshold, safetyMs]);
}

/** Link de WhatsApp com texto pré-preenchido. */
export function waHref(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
