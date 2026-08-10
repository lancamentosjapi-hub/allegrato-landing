'use client';

/**
 * LotusBairrosIndex — índice de /lotus-bairro: lista todos os guias de bairro.
 *
 * Segue o padrão visual dos cards de bairro da home (aspect 3/4, gradiente,
 * cidade/nome). Cada card leva a /lotus-bairro/[slug]. Header/footer idênticos
 * às demais páginas internas (LotusHeader + footerLegalLine).
 */

import Link from 'next/link';
import React, { useState, type CSSProperties, type ReactNode } from 'react';
import LotusHeader from './LotusHeader';
import { footerLegalLine } from '@/lib/site';
import type { Bairro } from '@/lib/bairros';

const WHATSAPP_DEFAULT = '5511926143393';

function parseStyle(css: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!css) return out as CSSProperties;
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
      : rawProp.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
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

function Hoverable<T extends keyof React.JSX.IntrinsicElements = 'div'>({
  as,
  baseStyle,
  hoverStyle,
  children,
  ...rest
}: HoverableProps<T>) {
  const [hover, setHover] = useState(false);
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

/** Card de bairro — mesmo padrão dos cards de bairro da home. */
function BairroCard({ b }: { b: Bairro }) {
  return (
    <Hoverable
      as="a"
      href={`/lotus-bairro/${b.slug}`}
      target="_top"
      baseStyle={parseStyle('position:relative;display:block;aspect-ratio:3/4;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -28px rgba(21,36,28,.4);transition:transform .35s ease;background:#1d3a2c;')}
      hoverStyle={parseStyle('transform:translateY(-4px)')}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1d3a2c,#3f6249)' }}>
        {b.heroImg && (
          <img
            src={b.heroImg}
            alt={`${b.nome}, ${b.cidade}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,0) 40%,rgba(21,36,28,.85));')}></div>
      <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:20px;')}>
        <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#cdab6e;margin-bottom:5px;')}>{b.cidade}</div>
        <div style={parseStyle("font-family:'Fraunces',serif;font-size:21px;font-weight:400;color:#f7f2e8;line-height:1.05;")}>{b.nome}</div>
        <div style={parseStyle('font-size:12.5px;color:rgba(247,242,232,.7);margin-top:5px;')}>Ver o guia →</div>
      </div>
    </Hoverable>
  );
}

export default function LotusBairrosIndex({
  bairros,
  whatsapp = WHATSAPP_DEFAULT,
}: {
  bairros: Bairro[];
  whatsapp?: string;
}) {
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Quero ajuda para escolher o bairro certo em Jundiaí ou Itupeva.');

  // Agrupa por cidade, preservando a ordem de aparição.
  const cidades: string[] = [];
  for (const b of bairros) if (!cidades.includes(b.cidade)) cidades.push(b.cidade);

  return (
    <div>
      <LotusHeader active="bairros" maxWidth={1200} whatsapp={whatsapp} />

      {/* HERO */}
      <section style={parseStyle('max-width:1200px;margin:0 auto;padding:64px 32px 40px;')}>
        <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Guias de bairro</div>
        <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,5vw,58px);line-height:1.03;letter-spacing:-.02em;color:#15241c;margin:0 0 16px;max-width:760px;")}>
          Escolha o bairro certo, não só o imóvel certo.
        </h1>
        <p style={parseStyle('font-size:clamp(16px,1.6vw,19px);color:#3f6249;font-weight:300;line-height:1.55;max-width:620px;margin:0;')}>
          Guias honestos de cada bairro de Jundiaí e Itupeva: como é o dia a dia, escolas, comércio, lazer e a faixa de preço, com quem conhece cada rua.
        </p>
      </section>

      {/* GRIDS POR CIDADE */}
      <section style={parseStyle('max-width:1200px;margin:0 auto;padding:0 32px 90px;')}>
        {cidades.map((cidade) => (
          <div key={cidade} style={parseStyle('margin-bottom:48px;')}>
            <div style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:26px;color:#15241c;margin:0;")}>{cidade}</h2>
              <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.14);')}></span>
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;')}>
              {bairros.filter((b) => b.cidade === cidade).map((b) => (
                <BairroCard key={b.slug} b={b} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={parseStyle('background:#ece2cf;padding:72px 32px;')}>
        <div style={parseStyle('max-width:820px;margin:0 auto;text-align:center;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.2vw,40px);color:#15241c;margin:0 0 16px;line-height:1.08;")}>Não sabe por onde começar?</h2>
          <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;max-width:540px;margin:0 auto 30px;')}>Conte pra gente o seu momento, a Lotus indica o bairro que combina com o seu jeito de viver, sem custo e sem compromisso.</p>
          <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Falar com um especialista <span>→</span></Hoverable>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={parseStyle('background:#15241c;padding:56px 32px 36px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;')}>
          <div style={parseStyle('display:flex;align-items:center;gap:12px;')}>
            <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
          </div>
          <div style={parseStyle('font-size:13px;color:rgba(247,242,232,.5);')}>{footerLegalLine()}</div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
