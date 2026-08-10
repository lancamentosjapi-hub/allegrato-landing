'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusBairro — porte 1:1 de lotus-bairro/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (mesmas de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *  - data-count           -> contador (rAF + IntersectionObserver) portado no useEffect
 */

import Link from 'next/link';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import LotusHeader from './LotusHeader';
import { getBairro, type Bairro } from '@/lib/bairros';
import type { ImovelBusca } from '@/lib/imoveis';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Converte uma string CSS ("a:b;c:d") em objeto React.CSSProperties.
 * camelCase nas propriedades; preserva valores EXATOS (cores, px, gradientes).
 * Split cuidadoso: separa apenas no PRIMEIRO ":" de cada declaração (valores
 * como gradientes e data: URIs contêm ":" internos). -webkit- -> Webkit; --custom mantém.
 */
function parseStyle(css: string): CSSProperties {
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
      ? rawProp // custom property: mantém como está
      : rawProp.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[prop] = value;
  }
  return out as CSSProperties;
}

/**
 * Reproduz style-hover do dc-runtime: hoverStyle vira :hover.
 * Aplica hoverStyle (merge sobre baseStyle) no mouseenter e remove no mouseleave.
 */
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
  // Rota interna (href "/..." não-âncora) vira <Link> do Next: navegação
  // client-side instantânea + prefetch, sem full reload/tela branca.
  const rprops = rest as Record<string, unknown>;
  const href = typeof rprops.href === 'string' ? rprops.href : undefined;
  const isInternal =
    as === 'a' && href?.startsWith('/') && rprops.target !== '_blank';
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
 * image-slot do dc-runtime: bloco com gradiente de fundo (fallback) e, quando há
 * src, a imagem cobrindo (object-fit:cover). Sem src => só o gradiente.
 * Gradiente idêntico ao do estático: linear-gradient(135deg,#1d3a2c,#3f6249).
 */
/** Iniciais (até 2) a partir do nome — fallback de avatar quando não há foto. */
function initialsOf(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function ImageSlot({
  src,
  id,
  style,
  alt = '',
  initials,
}: {
  src?: string;
  id?: string;
  style?: CSSProperties;
  alt?: string;
  /** Nome para gerar iniciais quando não há `src` (avatar-fallback). */
  initials?: string;
}) {
  const fallbackInitials = !src ? initialsOf(initials) : '';
  return (
    <div
      id={id}
      style={{
        display: 'block',
        background: 'linear-gradient(135deg,#1d3a2c,#3f6249)',
        ...style,
      }}
    >
      {!src && fallbackInitials && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(247,242,232,.9)',
            fontFamily: "'Fraunces',serif",
            fontSize: 'clamp(14px, 40%, 40px)',
          }}
        >
          {fallbackInitials}
        </span>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

// data-props default do <script data-props="{...whatsapp:{default:'5511926143393'}}">
const WHATSAPP_DEFAULT = '5511926143393';

// Fallback: usado só quando a página é renderizada sem prop `bairro`
// (compat). Em produção o bairro vem do servidor (lib/bairros).
const BAIRRO_FALLBACK: Bairro = getBairro('eloy-chaves')!;

const posts = [
  { slot: 'b-post-1', img: '/vistta-castanho/a007.jpg', cat: 'Cidade', title: 'Onde morar em Jundiaí em 2026: 5 bairros em ascensão' },
  { slot: 'b-post-2', img: '/terrace-serra-do-japi/a026.jpg', cat: 'Mercado', title: 'Quanto custa o m² em cada bairro de Jundiaí' },
  { slot: 'b-post-3', img: '/gran-ville-santo-angelo/a038.jpg', cat: 'Região', title: 'Serra do Japi: o que ter por perto muda no seu dia' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusBairro({
  whatsapp = WHATSAPP_DEFAULT,
  bairro = BAIRRO_FALLBACK,
  imoveis = [],
  vizinhos = [],
}: {
  whatsapp?: string;
  /** Guia do bairro (lib/bairros). Default = Eloy Chaves (compat). */
  bairro?: Bairro;
  /** Imóveis reais aprovados do bairro (vêm do servidor). */
  imoveis?: ImovelBusca[];
  /** Bairros vizinhos (mesma cidade) para o rodapé de navegação. */
  vizinhos?: { name: string; note: string; slug: string }[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // state = { openFaq: 0 }
  const [openFaq, setOpenFaq] = useState(0);

  const nomeBairro = bairro.nome;
  const guide = bairro.guide;

  // waLink montado com o bairro atual.
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? '5511926143393') +
    '?text=' +
    encodeURIComponent(`Quero ver imóveis em ${nomeBairro}, ${bairro.cidade}.`);

  // faqs: derivados do state (open/sign/toggle) como no estático.
  const faqs = bairro.faq.map((f, i) => ({
    q: f.q,
    a: f.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((s) => (s === i ? -1 : i)),
  }));

  // componentDidMount / componentWillUnmount -> contador data-count (rAF + IO threshold .4)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wrap = root.querySelector<HTMLElement>('[data-stats]');
    if (!wrap) return;

    const run = () => {
      wrap.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const to = parseFloat(el.getAttribute('data-count') || '0');
        const pre = el.getAttribute('data-prefix') || '';
        const suf = el.getAttribute('data-suffix') || '';
        const sep = !!el.getAttribute('data-sep');
        const start = performance.now();
        const fmt = (n: number) =>
          sep ? Math.round(n).toLocaleString('pt-BR') : String(Math.round(n));
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1500);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(to * e) + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };

    let obs: IntersectionObserver | undefined;
    if (reduce || !('IntersectionObserver' in window)) {
      run();
      return;
    }
    wrap.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      el.textContent =
        (el.getAttribute('data-prefix') || '') +
        '0' +
        (el.getAttribute('data-suffix') || '');
    });
    obs = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            run();
            obs!.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(wrap);

    return () => {
      if (obs) obs.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef}>
      {/* HEADER */}
      <LotusHeader active="bairros" maxWidth={1200} whatsapp={whatsapp} />

      {/* BREADCRUMB */}
      <div style={parseStyle('max-width:1200px;margin:0 auto;padding:18px 32px 0;font-size:13px;color:#8aa593;')}>
        <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('color:#3f6249;')} hoverStyle={parseStyle('color:#b18a4a')}>Bairros</Hoverable> › <Link href="/lotus-home" style={parseStyle('color:#3f6249;')}>{bairro.cidade}</Link> › <span style={parseStyle('color:#15241c;')}>{nomeBairro}</span>
      </div>

      {/* HERO */}
      <section style={parseStyle('max-width:1200px;margin:16px auto 0;padding:0 32px;')}>
        <div style={parseStyle('position:relative;border-radius:22px;overflow:hidden;height:clamp(320px,42vw,460px);background:#1d3a2c;')}>
          <ImageSlot src={bairro.heroImg || undefined} id="bairro-hero" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`Foto de ${nomeBairro}, ${bairro.cidade}`} />
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.25) 0%,rgba(21,36,28,.2) 40%,rgba(21,36,28,.88) 100%);')}></div>
          <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:clamp(28px,4vw,48px);')}>
            <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>Guia do bairro · {bairro.cidade}</div>
            <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,5.2vw,64px);line-height:1.02;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 14px;")}>Morar em {nomeBairro}, {bairro.cidade}</h1>
            <p style={parseStyle('font-size:clamp(15px,1.6vw,19px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.5;max-width:620px;margin:0;')}>{bairro.tagline}</p>
          </div>
        </div>
        {/* mini stats */}
        <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:18px;')}>
          {bairro.stats.map((s, i) => (
            <div key={i} style={parseStyle('background:#fff;border-radius:14px;padding:20px 22px;box-shadow:0 14px 36px -30px rgba(21,36,28,.4);')}>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:26px;color:#1d3a2c;")}>{s.value}</div>
              <div style={parseStyle('font-size:13px;color:#8aa593;margin-top:3px;')}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GEO / TL;DR + FAQ */}
      <section style={parseStyle('max-width:1200px;margin:0 auto;padding:72px 32px;display:grid;grid-template-columns:1fr 1.05fr;gap:48px;align-items:start;')}>
        <div>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Resumo do bairro</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 20px;")}>{nomeBairro} em poucas linhas.</h2>
          <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
            <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>TL;DR</div>
            <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>{bairro.tldr}</p>
          </div>
        </div>
        <div>
          {/* sc-for list=faqs as=f (4) */}
          {faqs.map((f, i) => (
            <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
              <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:22px 0;text-align:left;')}>
                <span style={parseStyle('font-size:16.5px;font-weight:500;color:#15241c;')}>{f.q}</span>
                <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{f.sign}</span>
              </button>
              {/* sc-if value=f.open */}
              {f.open && (
                <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 22px;')}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* GUIA PROFUNDO */}
      <section style={parseStyle('background:#ece2cf;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1080px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;max-width:620px;margin:0 auto 56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>O guia completo</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.4vw,44px);color:#15241c;margin:0;")}>Como é viver em {nomeBairro}.</h2>
          </div>
          <div style={parseStyle('display:flex;flex-direction:column;gap:18px;')}>
            {/* sc-for list=guide as=g (6) */}
            {guide.map((g, i) => (
              <div key={i} style={parseStyle('display:grid;grid-template-columns:64px 1fr;gap:24px;background:#f7f2e8;border-radius:18px;padding:30px 32px;align-items:start;')}>
                <div style={parseStyle('width:54px;height:54px;border-radius:14px;background:#1d3a2c;display:flex;align-items:center;justify-content:center;')}><span style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#cdab6e;")}>{g.num}</span></div>
                <div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0 0 10px;")}>{g.title}</h3>
                  <p style={parseStyle('font-size:15.5px;color:#3f6249;font-weight:300;line-height:1.65;margin:0;')}>{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DADOS DO BAIRRO — só aparece quando há número real. Um bairro sem dado
          de mercado exibiria "Transparência de mercado" sobre uma faixa vazia
          (ou sobre "R$ —"), que é o oposto do que a seção promete. */}
      {bairro.dados.length > 0 && (
      <section style={parseStyle('background:#15241c;padding:80px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1080px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('max-width:600px;margin-bottom:44px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>Dados do bairro</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#f7f2e8;margin:0;")}>Transparência de mercado, sem achismo.</h2>
          </div>
          <div data-stats="" style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:28px;')}>
            {bairro.dados.map((d, i) => (
              <div key={i}>
                <div
                  data-count={String(d.count)}
                  data-prefix={d.prefix ?? ''}
                  data-suffix={d.suffix ?? ''}
                  {...(d.sep ? { 'data-sep': '1' } : {})}
                  style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,3.4vw,42px);color:#cdab6e;line-height:1;")}
                >
                  {d.value}
                </div>
                <div style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.7);margin-top:8px;')}>{d.label}</div>
              </div>
            ))}
          </div>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;margin-top:36px;')}>
            <span style={parseStyle('font-size:13px;color:rgba(247,242,232,.6);margin-right:4px;')}>Tipologias mais comuns:</span>
            {bairro.tipologias.map((t, i) => (
              <span key={i} style={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.2);color:rgba(247,242,232,.85);font-size:13px;padding:6px 13px;border-radius:30px;')}>{t}</span>
            ))}
          </div>
          <p style={parseStyle('font-size:12px;color:rgba(247,242,232,.45);margin-top:24px;')}>Estimativas com base em anúncios e negociações da região nos últimos 12 meses. Valores ilustrativos — atualizados periodicamente pela Lotus.</p>
        </div>
      </section>
      )}

      {/* IMÓVEIS NO BAIRRO */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:36px;')}>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,40px);color:#15241c;margin:0;")}>Imóveis em {nomeBairro}</h2>
            <Link href="/lotus-busca" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Ver todos na busca <span>→</span></Link>
          </div>
          {imoveis.length > 0 ? (
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px;')}>
              {imoveis.map((m) => {
                const specs =
                  (m.beds ? m.beds + (m.beds > 1 ? ' dorms' : ' dorm') + ' · ' : '') +
                  (m.area ? m.area + ' m²' : '') +
                  (m.vagas ? ' · ' + m.vagas + (m.vagas > 1 ? ' vagas' : ' vaga') : '');
                return (
                  <Hoverable key={m.codigo} as="a" href={`/lotus-imovel/${m.codigo}`} target="_top" baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -30px rgba(21,36,28,.34);transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
                    <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}>
                      <ImageSlot id={m.slot} src={m.img || undefined} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${m.type} em ${m.neighborhood}`} />
                      <span style={parseStyle('position:absolute;top:12px;left:12px;background:rgba(29,58,44,.82);color:#f7f2e8;font-size:11px;font-weight:600;padding:5px 11px;border-radius:30px;')}>{m.type}</span>
                    </div>
                    <div style={parseStyle('padding:18px;')}>
                      <div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;")}>{m.price}</div>
                      <div style={parseStyle('font-size:13px;font-weight:600;color:#15241c;margin-top:6px;')}>{m.type} · {m.neighborhood}</div>
                      <div style={parseStyle('font-size:12.5px;color:#3f6249;margin-top:3px;')}>{specs}</div>
                    </div>
                  </Hoverable>
                );
              })}
            </div>
          ) : (
            <div style={parseStyle('background:#1d3a2c;border-radius:18px;padding:44px 40px;text-align:center;')}>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#f7f2e8;margin-bottom:10px;")}>Ainda não temos imóvel anunciado em {nomeBairro}.</div>
              <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.72);font-weight:300;max-width:460px;margin:0 auto 22px;')}>Conte pra gente o que você procura — o especialista do bairro caça o imóvel certo pra você, inclusive fora do catálogo.</p>
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Falar com o especialista <span>→</span></Hoverable>
            </div>
          )}
        </div>
      </section>

      {/* AVALIAÇÃO / CAPTAÇÃO */}
      <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
        <div style={parseStyle('max-width:880px;margin:0 auto;text-align:center;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.4vw,42px);color:#15241c;margin:0 0 16px;line-height:1.08;")}>Tem um imóvel em {nomeBairro}? Descubra quanto vale.</h2>
          <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;max-width:560px;margin:0 auto 30px;')}>Avaliação gratuita feita por quem conhece o bairro de verdade — sem custo e sem compromisso.</p>
          <Hoverable as="a" href="/lotus-anunciar" target="_top" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Avaliar meu imóvel <span>→</span></Hoverable>
        </div>
      </section>

      {/* VIZINHOS + BLOG */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;')}>
          <div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(22px,2.6vw,30px);color:#15241c;margin:0 0 22px;")}>Bairros vizinhos</h2>
            <div style={parseStyle('display:flex;flex-direction:column;')}>
              {/* sc-for list=vizinhos as=v (4) */}
              {vizinhos.length > 0 ? (
                vizinhos.map((v) => (
                  <Hoverable key={v.slug} as="a" href={`/lotus-bairro/${v.slug}`} target="_top" baseStyle={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid rgba(21,36,28,.1);transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>
                    <span style={parseStyle('font-size:16px;font-weight:500;')}>{v.name}</span>
                    <span style={parseStyle('font-size:13px;color:#8aa593;')}>{v.note} →</span>
                  </Hoverable>
                ))
              ) : (
                <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid rgba(21,36,28,.1);transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>
                  <span style={parseStyle('font-size:16px;font-weight:500;')}>Ver todos os bairros</span>
                  <span style={parseStyle('font-size:13px;color:#8aa593;')}>→</span>
                </Hoverable>
              )}
            </div>
          </div>
          <div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(22px,2.6vw,30px);color:#15241c;margin:0 0 22px;")}>Leituras sobre a região</h2>
            <div style={parseStyle('display:flex;flex-direction:column;gap:14px;')}>
              {/* sc-for list=posts as=p (3) */}
              {posts.map((p, i) => (
                <Hoverable key={i} as="a" href="/lotus-home" target="_top" baseStyle={parseStyle('display:flex;gap:16px;align-items:center;background:#fff;border-radius:14px;padding:16px;box-shadow:0 14px 36px -32px rgba(21,36,28,.34);transition:transform .25s ease;')} hoverStyle={parseStyle('transform:translateY(-2px)')}>
                  <div style={parseStyle('width:74px;height:60px;border-radius:10px;background:#1d3a2c;flex-shrink:0;overflow:hidden;position:relative;')}><ImageSlot id={p.slot} src={p.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="post" /></div>
                  <div>
                    <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#b18a4a;margin-bottom:4px;')}>{p.cat}</div>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-size:16px;color:#15241c;line-height:1.15;")}>{p.title}</div>
                  </div>
                </Hoverable>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="mapa" style={parseStyle('background:#1d3a2c;padding:72px 32px;')}>
        <div style={parseStyle('max-width:1180px;margin:0 auto;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>No mapa</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.6vw,32px);color:#f7f2e8;margin:0 0 24px;")}>{nomeBairro} no mapa</h2>
          <div style={parseStyle('position:relative;border-radius:18px;overflow:hidden;min-height:380px;background:#e7e4d7;')}>
            <iframe title={`${nomeBairro} no mapa`} src={`https://www.google.com/maps?q=${encodeURIComponent(bairro.mapQuery)}&z=14&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;border:0;')} allowFullScreen></iframe>
          </div>
        </div>
      </section>
      <footer style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1200px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding-bottom:48px;border-bottom:1px solid rgba(247,242,232,.12);')}>
            <div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px;margin-bottom:18px;')}>
                <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
              </div>
              <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:19px;color:rgba(247,242,232,.85);line-height:1.35;max-width:300px;margin:0 0 18px;")}>Grandes escolhas têm endereço.</p>
              <p style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.55);line-height:1.6;margin:0;')}>Consultoria imobiliária para compra, venda, locação e investimento em imóveis de médio e alto padrão em Jundiaí, Itupeva e região.</p>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>A Lotus</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="/lotus-sobre" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Sobre nós</Hoverable>
                <Hoverable as="a" href="/lotus-corretores" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
                <Hoverable as="a" href="/lotus-recrutamento" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Seja um corretor</Hoverable>
                <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Contato</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Serviços</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="/lotus-lancamentos" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Lançamentos</Hoverable>
                <Hoverable as="a" href="/lotus-busca" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Comprar &amp; alugar</Hoverable>
                <Hoverable as="a" href="/lotus-anunciar" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Anunciar imóvel</Hoverable>
                <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
                <Hoverable as="a" href="/lotus-home#blog" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Políticas</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="../lotus-privacidade/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Privacidade (LGPD)</Hoverable>
                <Hoverable as="a" href="../lotus-termos/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Termos de uso</Hoverable>
                <Hoverable as="a" href="../lotus-cookies/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Cookies</Hoverable>
              </div>
            </div>
          </div>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding-top:26px;font-size:13px;color:rgba(247,242,232,.5);')}>
            <div>{footerLegalLine()}</div>
            <div style={parseStyle('display:flex;gap:12px;align-items:center;')}>
              <Hoverable as="a" href="https://www.facebook.com/lotusbrokers" target="_blank" rel="noopener" aria-label="Facebook" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.youtube.com/channel/UCWl2er5kaAxh4NxLy18mwOA/" target="_blank" rel="noopener" aria-label="YouTube" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.instagram.com/lotusbrokers_/" target="_blank" rel="noopener" aria-label="Instagram" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg></Hoverable>
              <Hoverable as="a" href="https://www.tiktok.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="TikTok" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z"></path></svg></Hoverable>
            </div>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
