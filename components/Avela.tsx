'use client';

/**
 * Avela — porte 1:1 de avela/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores exatos).
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - data-count           -> count-up via IntersectionObserver (rAF), sufixo " min"
 */

import Link from 'next/link';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { sendLead } from '@/lib/lead';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Converte "a:b;c:d" em React.CSSProperties (camelCase; valores exatos). */
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
      ? rawProp
      : rawProp
          .replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
          .replace(/^webkit/, 'Webkit');
    out[prop] = value;
  }
  return out as CSSProperties;
}

/** style-hover do dc-runtime: hoverStyle vira :hover (mouseenter/mouseleave). */
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

/* ------------------------------------------------------------------ */
/* Ícones reutilizados (valores exatos do fonte)                      */
/* ------------------------------------------------------------------ */

const WaIcon = ({ size, fill = '#fff' }: { size: number; fill?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}>
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A10 10 0 1 0 12 2zm-3.3 6.3c.2 0 .4 0 .6.5l.9 2.2c.1.1.1.3.1.5-.1.2-.2.3-.3.5l-.5.5c-.1.2-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 1 1.9 1.3 2.2 1.4.2.1.4.1.5-.1l.7-.9c.2-.2.4-.2.7-.1l2 1c.3.2.5.3.6.4 0 .1 0 .7-.2 1.3-.3.7-1.4 1.3-1.9 1.3-.5.1-1 .3-3.4-.7-2.9-1.1-4.8-4-4.9-4.2-.2-.2-1.2-1.5-1.2-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3z"></path>
  </svg>
);

const ArrowIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"></path>
  </svg>
);

const CheckIcon = ({ size, stroke, sw }: { size: number; stroke: string; sw: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l4 4L19 6"></path>
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
  </svg>
);

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores EXATOS do script)                         */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511913141100';
const REVEAL_ANIM_DEFAULT = true;

type Plan = {
  label: string;
  area: string;
  sub: string;
  alt: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    label: '2 Suítes',
    area: '66,17 m²',
    sub: 'Apartamento tipo · 2 suítes',
    alt: 'Planta de 66,17 m² com 2 suítes',
    features: ['2 suítes completas', 'Cozinha integrada ao estar', 'Varanda gourmet', 'Lavabo e área de serviço'],
  },
  {
    label: '2 Suítes + Garden',
    area: '66,17 m²',
    sub: '+ Garden privativo 31,35 m²',
    alt: 'Planta de 66,17 m² com garden de 31,35 m²',
    features: ['2 suítes completas', 'Garden privativo de 31,35 m²', 'Varanda gourmet', 'Pé no jardim, no térreo'],
  },
  {
    label: 'Suíte + 2 Dorm.',
    area: '86,70 m²',
    sub: 'Apartamento tipo · 3 dormitórios',
    alt: 'Planta de 86,70 m² com suíte e 2 dormitórios',
    features: ['Suíte + 2 dormitórios', 'Cozinha e espaço gourmet', 'Living ampliado', 'Lavabo e área de serviço'],
  },
  {
    label: 'Suíte + 2 Dorm. + Garden',
    area: '86,70 m²',
    sub: '+ Garden privativo 20,02 m²',
    alt: 'Planta de 86,70 m² com garden de 20,02 m²',
    features: ['Suíte + 2 dormitórios', 'Garden privativo de 20,02 m²', 'Cozinha e espaço gourmet', 'Living ampliado'],
  },
];

// [minutos, ponto] — valores exatos (’ = ’ em "Wet’n Wild").
const distances: Array<{ t: string; p: string }> = [
  ['3', 'TexBeer Cervejaria'],
  ['6', 'Plantão de Vendas'],
  ['8', 'Parque da Cidade'],
  ['10', 'Sítio Sassafraz'],
  ['15', 'Jundiaí'],
  ['20', 'Outlet Premium'],
  ['25', 'Rod. D. Gabriel P. B. Couto'],
  ['26', 'Hopi Hari e Wet’n Wild'],
  ['30', 'Rod. Anhanguera'],
  ['40', 'Aeroporto de Viracopos'],
].map((d) => ({ t: d[0], p: d[1] }));

// Amenities (ordem e imagens exatas do markup).
const amenities: Array<{ img: string; cap: string }> = [
  { img: 'a012.jpg', cap: 'Piscina adulto e infantil' },
  { img: 'a000.jpg', cap: 'Churrasqueira' },
  { img: 'a001.jpg', cap: 'Salão de festas' },
  { img: 'a016.jpg', cap: 'Casa de campo' },
  { img: 'a008.jpg', cap: 'Academia' },
  { img: 'a013.jpg', cap: 'Quadra recreativa' },
  { img: 'a005.jpg', cap: 'Playground' },
  { img: 'a004.jpg', cap: 'Pet place' },
  { img: 'a015.jpg', cap: 'Brinquedoteca' },
  { img: 'a003.jpg', cap: 'Praça de alongamento' },
  { img: 'a002.jpg', cap: 'Garden privativo' },
  { img: 'a010.jpg', cap: 'Portaria' },
];

// Plantas: imagem por índice de plano (ordem exata do markup sc-if).
const planImgs = ['a019.jpg', 'a018.jpg', 'a020.jpg', 'a011.jpg'];

/* Strings de estilo literais reusadas (do renderVals). */
const S = {
  heroChip:
    'display:inline-flex;align-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.32);backdrop-filter:blur(6px);color:#fff;font-size:14px;font-weight:600;padding:9px 16px;border-radius:100px;',
  eyebrow:
    'display:inline-flex;align-items:center;gap:10px;color:#C9761A;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px;',
  eyebrowLight:
    'display:inline-flex;align-items:center;gap:10px;color:#F0C98A;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px;',
  eyebrowLeaf: 'display:inline-block;width:26px;height:1.6px;background:currentColor;',
  featurePill:
    'display:inline-flex;align-items:center;gap:9px;background:#fff;border:1px solid rgba(43,40,32,.1);padding:11px 17px;border-radius:100px;font-size:15px;font-weight:600;color:#3c3930;box-shadow:0 8px 20px -16px rgba(43,40,32,.5);',
  darkChip:
    'display:inline-flex;align-items:center;background:rgba(229,155,62,.14);border:1px solid rgba(229,155,62,.4);color:#F0C98A;font-size:13.5px;font-weight:600;padding:8px 15px;border-radius:100px;',
  amenFig:
    'position:relative;margin:0;border-radius:16px;overflow:hidden;aspect-ratio:4/3.3;cursor:zoom-in;box-shadow:0 20px 38px -22px rgba(40,37,26,.6);',
  amenImg:
    'width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.16,.84,.3,1);',
  amenBadge:
    'position:absolute;top:13px;right:13px;width:34px;height:34px;border-radius:50%;background:rgba(20,22,16,.42);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;opacity:.85;pointer-events:none;',
  amenCap:
    'position:absolute;inset:0;display:flex;align-items:flex-end;padding:18px;background:linear-gradient(0deg,rgba(20,22,16,.78) 0%,rgba(20,22,16,.18) 45%,rgba(20,22,16,0) 75%);pointer-events:none;',
  amenCapTxt:
    "color:#fff;font-family:'Zilla Slab',serif;font-weight:600;font-size:19px;line-height:1.15;text-shadow:0 1px 8px rgba(0,0,0,.4);",
  fieldLabel:
    'display:flex;flex-direction:column;gap:7px;font-size:13.5px;font-weight:600;color:#6b6555;',
  inputStyle:
    'font-size:16px;color:#2b2820;background:#fff;border:1.5px solid rgba(43,40,32,.14);border-radius:11px;padding:13px 15px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;',
};

const tabBase =
  "font-family:'Hanken Grotesk',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;padding:12px 20px;border-radius:100px;transition:all .25s;white-space:nowrap;";
const tabOn =
  tabBase +
  'background:#2b2820;color:#fff;border:1.5px solid #2b2820;box-shadow:0 10px 22px -12px rgba(43,40,32,.7);';
const tabOff =
  tabBase + 'background:transparent;color:#6b6555;border:1.5px solid rgba(43,40,32,.18);';

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

type FormState = { nome: string; tel: string; email: string; interesse: string };

export default function Avela({
  whatsappPhone = WHATSAPP_DEFAULT,
  revealAnimations = REVEAL_ANIM_DEFAULT,
}: {
  whatsappPhone?: string;
  revealAnimations?: boolean;
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [plan, setPlan] = useState(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<FormState>({
    nome: '',
    tel: '',
    email: '',
    interesse: '2 dormitórios (66 m²)',
  });
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; alt: string }>({
    open: false,
    src: '',
    alt: '',
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // waLink — lógica exata do script.
  const wa = (whatsappPhone || WHATSAPP_DEFAULT).replace(/\D/g, '');
  const waLink =
    'https://wa.me/' +
    wa +
    '?text=' +
    encodeURIComponent('Olá! Tenho interesse no Avelã Vila Residencial e gostaria de mais informações.');

  const year = new Date().getFullYear();
  const isMobile = !isDesktop;
  const cur = PLANS[plan];

  const openLightbox = (src: string, alt: string) => {
    setLightbox({ open: true, src, alt });
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    setLightbox({ open: false, src: '', alt: '' });
    document.body.style.overflow = '';
  };

  const setField = (k: keyof FormState, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  /* -------- scroll + resize (componentDidMount) -------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    const onResize = () => {
      const d = window.innerWidth >= 992;
      setIsDesktop(d);
      if (d) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* -------- reveal + count-up (componentDidMount, dentro de rAF) -------- */
  useEffect(() => {
    if (revealAnimations === false) return;
    const root = rootRef.current;
    if (!root) return;

    const raf = requestAnimationFrame(() => {
      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
      els.forEach((el) => {
        const dir = el.getAttribute('data-reveal');
        el.style.opacity = '0';
        el.style.transform =
          dir === 'left'
            ? 'translateX(-30px)'
            : dir === 'right'
              ? 'translateX(30px)'
              : 'translateY(32px)';
        el.style.transition =
          'opacity .9s cubic-bezier(.16,.84,.3,1), transform .9s cubic-bezier(.16,.84,.3,1)';
        const d = el.getAttribute('data-delay');
        if (d) el.style.transitionDelay = d + 'ms';
        el.style.willChange = 'opacity, transform';
      });

      if (!('IntersectionObserver' in window)) {
        els.forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).style.opacity = '1';
              (e.target as HTMLElement).style.transform = 'none';
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
      );
      els.forEach((el) => io.observe(el));

      // count-up
      const countUp = (el: HTMLElement) => {
        const target = parseInt(el.getAttribute('data-count') || '', 10);
        if (isNaN(target)) return;
        const dur = 1100;
        const t0 = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(ease(p) * target) + ' min';
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const counts = Array.from(root.querySelectorAll<HTMLElement>('[data-count]'));
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              countUp(e.target as HTMLElement);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counts.forEach((el) => cio.observe(el));

      cleanupRef.current = () => {
        io.disconnect();
        cio.disconnect();
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      if (cleanupRef.current) cleanupRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- Estilos derivados de `scrolled` (do renderVals) -------- */
  const sc = scrolled;
  const headerStyle =
    'position:fixed;top:0;left:0;right:0;z-index:100;height:' +
    (sc ? '66px' : '82px') +
    ';transition:height .3s,background .3s,box-shadow .3s;' +
    (sc
      ? 'background:rgba(251,248,241,.92);backdrop-filter:blur(12px);box-shadow:0 6px 24px -14px rgba(43,40,32,.45);'
      : 'background:linear-gradient(180deg,rgba(20,22,16,.42),rgba(20,22,16,0));');
  const logoStyle =
    'height:' +
    (sc ? '42px' : '54px') +
    ';width:auto;transition:height .3s;' +
    (sc ? '' : 'filter:drop-shadow(0 2px 10px rgba(0,0,0,.45));');
  const navLinkStyle =
    'text-decoration:none;font-size:15px;font-weight:600;white-space:nowrap;transition:color .25s;color:' +
    (sc ? '#3c3930' : 'rgba(255,255,255,.95)') +
    ';' +
    (sc ? '' : 'text-shadow:0 1px 8px rgba(0,0,0,.4);');
  const burgerBar =
    'display:block;width:24px;height:2.4px;border-radius:2px;background:' +
    (sc ? '#2b2820' : '#fff') +
    ';transition:background .3s;';

  const toggleMenu = () => setMenuOpen((s) => !s);
  const closeMenu = () => setMenuOpen(false);

  const openAmenity = (e: React.MouseEvent<HTMLElement>) => {
    const f = e.currentTarget;
    const img = f.querySelector('img');
    if (img) openLightbox((img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src, f.getAttribute('data-cap') || '');
  };
  const openPlanImg = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    openLightbox(img.currentSrc || img.src, img.getAttribute('alt') || '');
  };

  return (
    <div
      ref={rootRef}
      className="av-root"
      style={parseStyle(
        "font-family:'Hanken Grotesk',sans-serif;color:#2b2820;background:#FBF8F1;overflow-x:hidden;position:relative;"
      )}
    >
      {/* ============ HEADER ============ */}
      <header style={parseStyle(headerStyle)}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;padding:0 26px;height:100%;display:flex;align-items:center;justify-content:space-between;gap:20px;')}>
          <a href="#topo" style={parseStyle('display:flex;align-items:center;gap:0;text-decoration:none;flex-shrink:0;')}>
            <img src="/avela/a006.png" alt="Avelã Vila Residencial" style={parseStyle(logoStyle)} />
          </a>
          {isDesktop && (
            <nav style={parseStyle('display:flex;align-items:center;gap:30px;')}>
              <a href="#empreendimento" onClick={closeMenu} style={parseStyle(navLinkStyle)}>O Avelã</a>
              <a href="#lazer" onClick={closeMenu} style={parseStyle(navLinkStyle)}>Lazer</a>
              <a href="#plantas" onClick={closeMenu} style={parseStyle(navLinkStyle)}>Plantas</a>
              <a href="#localizacao" onClick={closeMenu} style={parseStyle(navLinkStyle)}>Localização</a>
              <Hoverable
                as="a"
                href={waLink}
                target="_blank"
                rel="noopener"
                baseStyle={parseStyle('display:inline-flex;align-items:center;gap:9px;background:#25D366;color:#fff;font-weight:700;font-size:14.5px;text-decoration:none;padding:11px 20px;border-radius:100px;box-shadow:0 8px 20px -8px rgba(37,211,102,.6);transition:transform .25s,box-shadow .25s;')}
                hoverStyle={parseStyle('transform:translateY(-2px);box-shadow:0 12px 26px -8px rgba(37,211,102,.8);')}
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="#fff"><path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.4-.2-3 .8.8-2.9-.2-.4A8 8 0 0 1 12 4zm-3.3 4.3c-.2 0-.5 0-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.2 2.4 1 2.9.8 3.4.7.5 0 1.6-.6 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.9-2.2c-.2-.5-.4-.5-.6-.5z"></path></svg>
                (11) 91314-1100
              </Hoverable>
            </nav>
          )}
          {isMobile && (
            <button onClick={toggleMenu} aria-label="Menu" style={parseStyle('background:transparent;border:0;cursor:pointer;padding:8px;display:flex;flex-direction:column;gap:5px;')}>
              <span style={parseStyle(burgerBar)}></span>
              <span style={parseStyle(burgerBar)}></span>
              <span style={parseStyle(burgerBar)}></span>
            </button>
          )}
        </div>
      </header>

      {/* mobile slide menu */}
      {menuOpen && (
        <div onClick={closeMenu} style={parseStyle('position:fixed;inset:0;z-index:90;background:rgba(20,18,14,.55);backdrop-filter:blur(3px);animation:avFade .3s ease;')}>
          <div style={parseStyle('position:absolute;top:0;right:0;height:100%;width:min(82vw,330px);background:#FBF8F1;box-shadow:-20px 0 60px rgba(0,0,0,.3);padding:88px 30px 30px;display:flex;flex-direction:column;gap:6px;')}>
            <a href="#empreendimento" onClick={closeMenu} style={parseStyle("padding:14px 4px;font-family:'Zilla Slab',serif;font-size:20px;font-weight:600;color:#2b2820;text-decoration:none;border-bottom:1px solid rgba(0,0,0,.08);")}>O Avelã</a>
            <a href="#lazer" onClick={closeMenu} style={parseStyle("padding:14px 4px;font-family:'Zilla Slab',serif;font-size:20px;font-weight:600;color:#2b2820;text-decoration:none;border-bottom:1px solid rgba(0,0,0,.08);")}>Lazer</a>
            <a href="#plantas" onClick={closeMenu} style={parseStyle("padding:14px 4px;font-family:'Zilla Slab',serif;font-size:20px;font-weight:600;color:#2b2820;text-decoration:none;border-bottom:1px solid rgba(0,0,0,.08);")}>Plantas</a>
            <a href="#localizacao" onClick={closeMenu} style={parseStyle("padding:14px 4px;font-family:'Zilla Slab',serif;font-size:20px;font-weight:600;color:#2b2820;text-decoration:none;border-bottom:1px solid rgba(0,0,0,.08);")}>Localização</a>
            <a href="#contato" onClick={closeMenu} style={parseStyle('margin-top:18px;text-align:center;background:#DD8A2A;color:#fff;font-weight:700;padding:14px;border-radius:100px;text-decoration:none;')}>Agende sua visita</a>
            <a href={waLink} target="_blank" rel="noopener" style={parseStyle('margin-top:10px;text-align:center;background:#25D366;color:#fff;font-weight:700;padding:14px;border-radius:100px;text-decoration:none;')}>WhatsApp</a>
          </div>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section id="topo" style={parseStyle('position:relative;min-height:680px;height:90vh;max-height:900px;display:flex;align-items:flex-end;overflow:hidden;')}>
        <div style={parseStyle('position:absolute;inset:0;animation:avHeroBg 2.4s cubic-bezier(.16,.84,.3,1) both;')}>
          <img src="/avela/a007.jpg" alt="Fachada do Avelã Vila Residencial" style={parseStyle('width:100%;height:100%;object-fit:cover;object-position:center 38%;')} />
        </div>
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,28,38,.42) 0%,rgba(20,28,38,0) 26%,rgba(18,22,18,.12) 55%,rgba(22,20,14,.82) 100%);')}></div>
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(95deg,rgba(20,22,16,.55) 0%,rgba(20,22,16,.12) 42%,rgba(20,22,16,0) 70%);')}></div>

        <div style={parseStyle('position:relative;width:100%;max-width:1240px;margin:0 auto;padding:0 26px clamp(48px,7vw,96px);')}>
          <div style={parseStyle('max-width:760px;')}>
            <div style={parseStyle('display:inline-flex;align-items:center;gap:10px;color:#F3D9B0;font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;margin-bottom:22px;animation:avUp .9s .15s both;')}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#DD8A2A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21c0-9 5-15.5 14-17.5C18 14 13 19.8 5 21z"></path><path d="M5.5 20.5C7.5 14.5 11 11 16 10"></path></svg>
              Vila Residencial · Itupeva / SP
            </div>
            <h1 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;color:#fff;font-size:clamp(40px,6.6vw,82px);line-height:1.02;letter-spacing:-.01em;margin:0 0 24px;text-shadow:0 2px 30px rgba(0,0,0,.35);text-wrap:balance;")}>
              A beleza do campo<br /><span style={parseStyle("font-family:'Playfair Display',serif;font-style:italic;font-weight:500;color:#F0C98A;")}>no coração da cidade</span>
            </h1>
            <p style={parseStyle('color:rgba(255,255,255,.92);font-size:clamp(16px,1.7vw,20px);line-height:1.6;max-width:600px;margin:0 0 32px;animation:avUp .9s .3s both;')}>
              Apartamentos de 2 e 3 dormitórios, de <strong style={parseStyle('font-weight:700;color:#fff;')}>66 a 87 m²</strong>, com gardens privativos e mais de 12 espaços de lazer — cercados de natureza, a minutos de tudo.
            </p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:13px;margin-bottom:36px;animation:avUp .9s .42s both;')}>
              <span style={parseStyle(S.heroChip)}>2 e 3 dormitórios</span>
              <span style={parseStyle(S.heroChip)}>66 a 87 m²</span>
              <span style={parseStyle(S.heroChip)}>+12 espaços de lazer</span>
              <span style={parseStyle(S.heroChip)}>Gardens privativos</span>
            </div>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:15px;animation:avUp .9s .54s both;')}>
              <Hoverable
                as="a"
                href="#contato"
                baseStyle={parseStyle('display:inline-flex;align-items:center;gap:11px;background:#DD8A2A;color:#fff;font-weight:700;font-size:16.5px;text-decoration:none;padding:17px 30px;border-radius:100px;box-shadow:0 16px 34px -12px rgba(221,138,42,.9);transition:transform .25s,box-shadow .25s;')}
                hoverStyle={parseStyle('transform:translateY(-3px);box-shadow:0 22px 40px -12px rgba(221,138,42,1);')}
              >
                Agende sua visita
                <ArrowIcon size={19} />
              </Hoverable>
              <Hoverable
                as="a"
                href={waLink}
                target="_blank"
                rel="noopener"
                baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.12);color:#fff;font-weight:600;font-size:16.5px;text-decoration:none;padding:17px 26px;border-radius:100px;border:1.5px solid rgba(255,255,255,.45);backdrop-filter:blur(6px);transition:background .25s,border-color .25s;')}
                hoverStyle={parseStyle('background:rgba(255,255,255,.22);border-color:#fff;')}
              >
                <WaIcon size={19} />
                Falar no WhatsApp
              </Hoverable>
            </div>
          </div>
        </div>
        <div style={parseStyle('position:absolute;bottom:22px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:7px;')}>
          <span style={parseStyle('color:rgba(255,255,255,.7);font-size:11px;letter-spacing:.2em;text-transform:uppercase;')}>Role</span>
          <div style={parseStyle('width:23px;height:38px;border:1.5px solid rgba(255,255,255,.55);border-radius:14px;display:flex;justify-content:center;padding-top:7px;')}>
            <span style={parseStyle('width:3px;height:8px;background:#fff;border-radius:3px;animation:avScroll 1.8s ease-in-out infinite;')}></span>
          </div>
        </div>
      </section>

      {/* ============ STRIP ============ */}
      <section style={parseStyle('background:#2b2820;color:#F6F2E9;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;padding:34px 26px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:26px;')}>
          <div data-reveal="up" style={parseStyle('display:flex;flex-direction:column;gap:4px;')}>
            <span style={parseStyle("font-family:'Zilla Slab',serif;font-size:30px;font-weight:700;color:#E59B3E;")}>2 e 3</span>
            <span style={parseStyle('font-size:14.5px;color:rgba(246,242,233,.72);')}>dormitórios por unidade</span>
          </div>
          <div data-reveal="up" data-delay="90" style={parseStyle('display:flex;flex-direction:column;gap:4px;')}>
            <span style={parseStyle("font-family:'Zilla Slab',serif;font-size:30px;font-weight:700;color:#E59B3E;")}>66–87 m²</span>
            <span style={parseStyle('font-size:14.5px;color:rgba(246,242,233,.72);')}>opções com garden privativo</span>
          </div>
          <div data-reveal="up" data-delay="180" style={parseStyle('display:flex;flex-direction:column;gap:4px;')}>
            <span style={parseStyle("font-family:'Zilla Slab',serif;font-size:30px;font-weight:700;color:#E59B3E;")}>+12</span>
            <span style={parseStyle('font-size:14.5px;color:rgba(246,242,233,.72);')}>espaços de lazer completos</span>
          </div>
          <div data-reveal="up" data-delay="270" style={parseStyle('display:flex;flex-direction:column;gap:4px;')}>
            <span style={parseStyle("font-family:'Zilla Slab',serif;font-size:30px;font-weight:700;color:#E59B3E;")}>6 min</span>
            <span style={parseStyle('font-size:14.5px;color:rgba(246,242,233,.72);')}>do plantão de vendas</span>
          </div>
        </div>
      </section>

      {/* ============ EMPREENDIMENTO ============ */}
      <section id="empreendimento" style={parseStyle('padding:clamp(80px,10vw,140px) 26px;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:clamp(40px,6vw,80px);align-items:center;')}>
          <div data-reveal="left">
            <div style={parseStyle(S.eyebrow)}><span style={parseStyle(S.eyebrowLeaf)}></span>O empreendimento</div>
            <h2 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:clamp(30px,4vw,48px);line-height:1.08;letter-spacing:-.01em;margin:0 0 22px;color:#2b2820;text-wrap:balance;")}>
              Seu apartamento do campo, dentro da cidade
            </h2>
            <p style={parseStyle('font-size:17px;line-height:1.7;color:#5b5648;margin:0 0 18px;')}>
              O <strong style={parseStyle('color:#2b2820;')}>Avelã Vila Residencial</strong> nasce em Itupeva para quem quer viver perto da natureza sem abrir mão da praticidade. Aqui, a arquitetura aconchegante encontra amplas áreas verdes, gardens privativos e um clube de lazer completo para a família toda.
            </p>
            <p style={parseStyle('font-size:17px;line-height:1.7;color:#5b5648;margin:0 0 30px;')}>
              São apartamentos planejados, com plantas funcionais e adaptáveis, em uma vila pensada para conviver — com a tranquilidade do interior e a cidade a poucos minutos.
            </p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:14px;')}>
              <div style={parseStyle(S.featurePill)}><CheckIcon size={18} stroke="#5E7B4E" sw="2.2" />Plantas adaptáveis</div>
              <div style={parseStyle(S.featurePill)}><CheckIcon size={18} stroke="#5E7B4E" sw="2.2" />Gardens privativos</div>
              <div style={parseStyle(S.featurePill)}><CheckIcon size={18} stroke="#5E7B4E" sw="2.2" />Condomínio clube</div>
            </div>
          </div>
          <div data-reveal="right" style={parseStyle('position:relative;')}>
            <div style={parseStyle('position:relative;border-radius:22px;overflow:hidden;box-shadow:0 40px 70px -30px rgba(43,40,32,.5);aspect-ratio:4/3.2;')}>
              <img src="/avela/a017.jpg" alt="Casa de Campo do Avelã, cercada de natureza" style={parseStyle('width:100%;height:100%;object-fit:cover;')} />
            </div>
            <div style={parseStyle('position:absolute;bottom:-26px;left:-22px;background:#fff;border-radius:16px;padding:18px 24px;box-shadow:0 24px 44px -18px rgba(43,40,32,.4);display:flex;align-items:center;gap:14px;')}>
              <span style={parseStyle("font-family:'Playfair Display',serif;font-style:italic;font-size:34px;color:#DD8A2A;line-height:1;")}>16</span>
              <span style={parseStyle('font-size:14px;line-height:1.35;color:#5b5648;')}>torres em meio<br />ao verde</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAZER / AMENITIES ============ */}
      <section id="lazer" style={parseStyle('background:#9b9883;background:linear-gradient(180deg,#a6a48f 0%,#94927d 100%);padding:clamp(80px,10vw,130px) 26px;position:relative;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div data-reveal="up" style={parseStyle('text-align:center;max-width:640px;margin:0 auto 56px;')}>
            <div style={parseStyle(S.eyebrowLight)}><span style={parseStyle(S.eyebrowLeaf)}></span>Espaços para conviver</div>
            <h2 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:clamp(30px,4.4vw,52px);line-height:1.06;margin:0 0 16px;color:#fff;text-shadow:0 2px 14px rgba(60,56,40,.18);text-wrap:balance;")}>
              Um clube de lazer completo, todos os dias
            </h2>
            <p style={parseStyle('font-size:17px;line-height:1.65;color:rgba(255,255,255,.9);margin:0;')}>
              Mais de 12 ambientes pensados para todas as idades — do mergulho na piscina ao fim de tarde na casa de campo.
            </p>
          </div>

          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;')}>
            {amenities.map((a, i) => (
              <figure key={i} onClick={openAmenity} data-cap={a.cap} data-reveal="up" style={parseStyle(S.amenFig)}>
                <Hoverable
                  as="img"
                  src={`/avela/${a.img}`}
                  alt={a.cap}
                  loading="lazy"
                  baseStyle={parseStyle(S.amenImg)}
                  hoverStyle={parseStyle('transform:scale(1.07)')}
                />
                <span style={parseStyle(S.amenBadge)}><ExpandIcon /></span>
                <figcaption style={parseStyle(S.amenCap)}><span style={parseStyle(S.amenCapTxt)}>{a.cap}</span></figcaption>
              </figure>
            ))}
          </div>

          <p style={parseStyle('text-align:center;margin:42px 0 0;color:rgba(255,255,255,.82);font-size:14px;letter-spacing:.04em;')}>Piscina adulto e infantil · Churrasqueiras · Salão de festas · Academia · Quadra · Playground · Pet place · Brinquedoteca · Casa de campo · Praça de alongamento · Garden · Portaria</p>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section id="plantas" style={parseStyle('padding:clamp(80px,10vw,130px) 26px;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div data-reveal="up" style={parseStyle('text-align:center;max-width:620px;margin:0 auto 44px;')}>
            <div style={parseStyle(S.eyebrow + ';justify-content:center;')}><span style={parseStyle(S.eyebrowLeaf)}></span>Plantas</div>
            <h2 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:clamp(30px,4.4vw,52px);line-height:1.06;margin:0 0 16px;color:#2b2820;text-wrap:balance;")}>Funcionais e adaptáveis</h2>
            <p style={parseStyle('font-size:17px;line-height:1.65;color:#5b5648;margin:0;')}>Opções de 66,17 m² e 86,70 m², com versões garden de pé no jardim.</p>
          </div>

          <div data-reveal="up" style={parseStyle('display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:40px;')}>
            {PLANS.map((p, i) => (
              <button key={i} onClick={() => setPlan(i)} style={parseStyle(i === plan ? tabOn : tabOff)}>{p.label}</button>
            ))}
          </div>

          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(30px,5vw,64px);align-items:center;')}>
            <div style={parseStyle('position:relative;background:#FBF8F1;border:1px solid rgba(43,40,32,.08);border-radius:20px;padding:clamp(18px,3vw,34px);box-shadow:0 30px 60px -34px rgba(43,40,32,.4);')}>
              {PLANS.map((p, i) =>
                i === plan ? (
                  <img
                    key={i}
                    onClick={openPlanImg}
                    src={`/avela/${planImgs[i]}`}
                    alt={p.alt}
                    style={parseStyle('width:100%;height:auto;border-radius:10px;cursor:zoom-in;display:block;animation:avFade .35s ease;')}
                  />
                ) : null
              )}
              <span style={parseStyle('position:absolute;top:18px;right:18px;display:inline-flex;align-items:center;gap:7px;background:rgba(43,40,32,.78);color:#fff;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:100px;pointer-events:none;')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                Ampliar
              </span>
            </div>
            <div>
              <span style={parseStyle("font-family:'Playfair Display',serif;font-style:italic;color:#DD8A2A;font-size:19px;")}>{cur.label}</span>
              <div style={parseStyle('display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:6px 0 4px;')}>
                <span style={parseStyle("font-family:'Zilla Slab',serif;font-weight:700;font-size:clamp(40px,6vw,62px);line-height:1;color:#2b2820;")}>{cur.area}</span>
              </div>
              <span style={parseStyle('display:inline-block;font-size:15px;color:#8c8772;margin-bottom:26px;')}>{cur.sub}</span>
              <ul style={parseStyle('list-style:none;margin:0 0 32px;padding:0;display:flex;flex-direction:column;gap:13px;')}>
                {cur.features.map((f, i) => (
                  <li key={i} style={parseStyle('display:flex;align-items:center;gap:13px;font-size:16.5px;color:#3c3930;')}>
                    <span style={parseStyle('flex-shrink:0;width:26px;height:26px;border-radius:50%;background:rgba(94,123,78,.14);display:flex;align-items:center;justify-content:center;')}>
                      <CheckIcon size={15} stroke="#5E7B4E" sw="2.4" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Hoverable
                as="a"
                href="#contato"
                baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;background:#2b2820;color:#fff;font-weight:700;font-size:16px;text-decoration:none;padding:15px 28px;border-radius:100px;transition:transform .25s,background .25s;')}
                hoverStyle={parseStyle('transform:translateY(-2px);background:#3c3930;')}
              >
                Quero conhecer essa planta
                <ArrowIcon size={18} />
              </Hoverable>
              <p style={parseStyle('font-size:12.5px;color:#a7a08c;margin:20px 0 0;')}>Imagens ilustrativas. Medidas e disposição sujeitas a alterações.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZACAO ============ */}
      <section id="localizacao" style={parseStyle('background:#2b2820;color:#F6F2E9;padding:clamp(80px,10vw,130px) 26px;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div data-reveal="up" style={parseStyle('max-width:640px;margin:0 0 50px;')}>
            <div style={parseStyle(S.eyebrowLight)}><span style={parseStyle(S.eyebrowLeaf)}></span>Localização</div>
            <h2 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:clamp(30px,4.4vw,52px);line-height:1.06;margin:0 0 16px;color:#fff;text-wrap:balance;")}>A minutos de tudo o que importa</h2>
            <p style={parseStyle('font-size:17px;line-height:1.65;color:rgba(246,242,233,.8);margin:0;')}>Em Itupeva, na região metropolitana de Jundiaí — cercado de natureza, perto de comércio, lazer e das principais rodovias do estado.</p>
          </div>

          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(34px,5vw,64px);align-items:start;')}>
            <div data-reveal="left" style={parseStyle('border-radius:18px;overflow:hidden;box-shadow:0 34px 60px -30px rgba(0,0,0,.7);background:#cfcdbe;')}>
              <img src="/avela/a014.jpg" alt="Mapa de localização do Avelã em Itupeva" style={parseStyle('width:100%;height:auto;')} />
            </div>
            <div data-reveal="right">
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px 28px;')}>
                {distances.map((d, i) => (
                  <div key={i} style={parseStyle('display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid rgba(246,242,233,.12);')}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#E59B3E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11l1.5-4.2A2 2 0 0 1 8.4 5.5h7.2a2 2 0 0 1 1.9 1.3L19 11"></path><path d="M3 11h18v5H3z"></path><circle cx="7" cy="18" r="1.6"></circle><circle cx="17" cy="18" r="1.6"></circle></svg>
                    <div style={parseStyle('display:flex;flex-direction:column;line-height:1.15;')}>
                      <span data-count={d.t} style={parseStyle("font-family:'Zilla Slab',serif;font-weight:700;font-size:19px;color:#fff;")}>{d.t} min</span>
                      <span style={parseStyle('font-size:14px;color:rgba(246,242,233,.72);')}>{d.p}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={parseStyle('margin-top:28px;display:flex;flex-wrap:wrap;gap:10px;')}>
                <span style={parseStyle(S.darkChip)}>Rota da Uva</span>
                <span style={parseStyle(S.darkChip)}>Outlet Premium</span>
                <span style={parseStyle(S.darkChip)}>Hopi Hari · Wet&apos;n Wild</span>
                <span style={parseStyle(S.darkChip)}>Aeroporto de Viracopos</span>
              </div>
              <p style={parseStyle('font-size:13px;color:rgba(246,242,233,.6);margin:22px 0 0;')}>Tempos aproximados de automóvel, podendo variar conforme o trânsito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO / FORM ============ */}
      <section id="contato" style={parseStyle('position:relative;padding:clamp(80px,10vw,130px) 26px;overflow:hidden;')}>
        <div style={parseStyle('position:absolute;inset:0;')}>
          <img src="/avela/a009.jpg" alt="" aria-hidden="true" style={parseStyle('width:100%;height:100%;object-fit:cover;object-position:center 30%;')} />
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(110deg,rgba(43,40,32,.94) 0%,rgba(43,40,32,.86) 42%,rgba(43,40,32,.55) 100%);')}></div>
        </div>
        <div style={parseStyle('position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:clamp(36px,5vw,70px);align-items:center;')}>
          <div data-reveal="left" style={parseStyle('color:#fff;')}>
            <div style={parseStyle(S.eyebrowLight)}><span style={parseStyle(S.eyebrowLeaf)}></span>Agende sua visita</div>
            <h2 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:clamp(30px,4.4vw,52px);line-height:1.06;margin:0 0 18px;text-wrap:balance;")}>Venha conhecer o Avelã de perto</h2>
            <p style={parseStyle('font-size:17.5px;line-height:1.65;color:rgba(255,255,255,.88);margin:0 0 30px;max-width:460px;')}>Preencha seus dados e um de nossos consultores entrará em contato para apresentar plantas, valores e condições. Sem compromisso.</p>
            <div style={parseStyle('display:flex;flex-direction:column;gap:16px;')}>
              <a href={waLink} target="_blank" rel="noopener" style={parseStyle('display:inline-flex;align-items:center;gap:13px;color:#fff;text-decoration:none;font-size:17px;font-weight:600;')}>
                <span style={parseStyle('width:46px;height:46px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;flex-shrink:0;')}><WaIcon size={22} /></span>
                (11) 91314-1100
              </a>
              <div style={parseStyle('display:inline-flex;align-items:center;gap:13px;color:rgba(255,255,255,.85);font-size:16px;')}>
                <span style={parseStyle('width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(255,255,255,.2);')}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"></path><circle cx="12" cy="10" r="2.4"></circle></svg></span>
                Itupeva · São Paulo
              </div>
            </div>
          </div>

          <div data-reveal="right">
            {sent ? (
              <div style={parseStyle('background:#FBF8F1;border-radius:22px;padding:48px 36px;text-align:center;box-shadow:0 40px 70px -34px rgba(0,0,0,.6);')}>
                <div style={parseStyle('width:72px;height:72px;border-radius:50%;background:rgba(94,123,78,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;')}>
                  <CheckIcon size={38} stroke="#5E7B4E" sw="2.4" />
                </div>
                <h3 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:26px;margin:0 0 10px;color:#2b2820;")}>Recebemos seu contato!</h3>
                <p style={parseStyle('font-size:16px;color:#5b5648;line-height:1.6;margin:0;')}>Em breve um consultor do Avelã falará com você. Se preferir, fale agora mesmo pelo WhatsApp.</p>
                <a href={waLink} target="_blank" rel="noopener" style={parseStyle('display:inline-flex;margin-top:22px;align-items:center;gap:9px;background:#25D366;color:#fff;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:100px;')}>Abrir WhatsApp</a>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendLead({
                    name: form.nome,
                    phone: form.tel,
                    email: form.email,
                    source: 'landing_avela',
                    interest: 'Avela',
                    message: form.interesse,
                  });
                  setSent(true);
                }}
                style={parseStyle('background:#FBF8F1;border-radius:22px;padding:clamp(26px,3.5vw,40px);box-shadow:0 40px 70px -34px rgba(0,0,0,.6);')}
              >
                <h3 style={parseStyle("font-family:'Zilla Slab',serif;font-weight:600;font-size:23px;margin:0 0 22px;color:#2b2820;")}>Fale com um consultor</h3>
                <div style={parseStyle('display:flex;flex-direction:column;gap:15px;')}>
                  <label style={parseStyle(S.fieldLabel)}>Nome completo
                    <input value={form.nome} onInput={(e) => setField('nome', (e.target as HTMLInputElement).value)} required placeholder="Seu nome" style={parseStyle(S.inputStyle)} />
                  </label>
                  <label style={parseStyle(S.fieldLabel)}>WhatsApp / Telefone
                    <input value={form.tel} onInput={(e) => setField('tel', (e.target as HTMLInputElement).value)} required placeholder="(11) 90000-0000" inputMode="tel" style={parseStyle(S.inputStyle)} />
                  </label>
                  <label style={parseStyle(S.fieldLabel)}>E-mail
                    <input value={form.email} onInput={(e) => setField('email', (e.target as HTMLInputElement).value)} type="email" placeholder="voce@email.com" style={parseStyle(S.inputStyle)} />
                  </label>
                  <label style={parseStyle(S.fieldLabel)}>Interesse
                    <select value={form.interesse} onChange={(e) => setField('interesse', e.target.value)} style={parseStyle(S.inputStyle)}>
                      <option>2 dormitórios (66 m²)</option>
                      <option>2 dorm. + Garden</option>
                      <option>3 dormitórios (87 m²)</option>
                      <option>3 dorm. + Garden</option>
                      <option>Ainda estou decidindo</option>
                    </select>
                  </label>
                </div>
                <Hoverable
                  as="button"
                  type="submit"
                  baseStyle={parseStyle('margin-top:24px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:#DD8A2A;color:#fff;font-weight:700;font-size:17px;border:0;cursor:pointer;padding:17px;border-radius:100px;box-shadow:0 16px 30px -14px rgba(221,138,42,.9);transition:transform .25s,box-shadow .25s;')}
                  hoverStyle={parseStyle('transform:translateY(-2px);box-shadow:0 20px 36px -14px rgba(221,138,42,1);')}
                >
                  Quero ser contatado
                  <ArrowIcon size={18} />
                </Hoverable>
                <p style={parseStyle('font-size:12px;color:#a7a08c;text-align:center;margin:14px 0 0;line-height:1.5;')}>Ao enviar, você concorda em ser contatado sobre o empreendimento Avelã Vila Residencial.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={parseStyle('background:#211f19;color:rgba(246,242,233,.78);padding:clamp(54px,7vw,80px) 26px 34px;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;align-items:start;padding-bottom:42px;border-bottom:1px solid rgba(246,242,233,.12);')}>
            <div>
              <img src="/avela/a006.png" alt="Avelã Vila Residencial" style={parseStyle('height:84px;width:auto;background:#F6F2E9;border-radius:12px;padding:10px 14px;margin-bottom:16px;')} />
              <p style={parseStyle("font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:#E59B3E;margin:0;")}>A beleza do campo no coração da cidade.</p>
            </div>
            <div>
              <h4 style={parseStyle("font-family:'Zilla Slab',serif;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#fff;margin:0 0 16px;")}>Navegue</h4>
              <div style={parseStyle('display:flex;flex-direction:column;gap:10px;font-size:15px;')}>
                <a href="#empreendimento" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>O empreendimento</a>
                <a href="#lazer" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>Lazer</a>
                <a href="#plantas" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>Plantas</a>
                <a href="#localizacao" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>Localização</a>
              </div>
            </div>
            <div>
              <h4 style={parseStyle("font-family:'Zilla Slab',serif;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#fff;margin:0 0 16px;")}>Contato</h4>
              <div style={parseStyle('display:flex;flex-direction:column;gap:10px;font-size:15px;')}>
                <a href={waLink} target="_blank" rel="noopener" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>WhatsApp · (11) 91314-1100</a>
                <a href="https://maclucer.com.br" target="_blank" rel="noopener" style={parseStyle('text-decoration:none;color:rgba(246,242,233,.78);')}>maclucer.com.br</a>
                <span style={parseStyle('color:rgba(246,242,233,.78);')}>@maclucer</span>
                <span style={parseStyle('color:rgba(246,242,233,.78);')}>Itupeva · São Paulo</span>
              </div>
            </div>
            <div>
              <h4 style={parseStyle("font-family:'Zilla Slab',serif;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#fff;margin:0 0 16px;")}>Realização</h4>
              <div style={parseStyle('display:flex;flex-direction:column;gap:8px;font-size:15px;color:rgba(246,242,233,.78);')}>
                <span style={parseStyle('font-weight:700;color:#fff;')}>Mac Lucer Empreendimentos</span>
                <span>Bitencourtt &amp; Jorge</span>
                <span>Três Irmãos</span>
              </div>
            </div>
          </div>
          <p style={parseStyle('font-size:12.5px;line-height:1.7;color:rgba(246,242,233,.5);margin:26px 0 0;max-width:880px;')}>
            O empreendimento só será comercializado após o registro do Memorial de Incorporação no Cartório de Imóveis, nos termos da lei de número 4.591/64. Material preliminar sujeito a alterações sem aviso prévio. Imagens meramente ilustrativas. © {year} Imobiliária Lotus Brokers.
          </p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightbox.open && (
        <div onClick={closeLightbox} style={parseStyle('position:fixed;inset:0;z-index:120;background:rgba(18,16,12,.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:max(24px,4vw);animation:avFade .25s ease;cursor:zoom-out;')}>
          <img src={lightbox.src} alt={lightbox.alt} style={parseStyle('max-width:94vw;max-height:88vh;width:auto;height:auto;border-radius:12px;box-shadow:0 50px 100px rgba(0,0,0,.7);animation:avPop .32s cubic-bezier(.16,.84,.3,1);')} />
          <Hoverable
            as="button"
            onClick={closeLightbox}
            aria-label="Fechar"
            baseStyle={parseStyle('position:fixed;top:18px;right:18px;width:48px;height:48px;border-radius:50%;border:0;cursor:pointer;background:rgba(255,255,255,.14);color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;transition:background .2s;')}
            hoverStyle={parseStyle('background:rgba(255,255,255,.28)')}
          >
            ✕
          </Hoverable>
          <div style={parseStyle("position:fixed;bottom:22px;left:0;right:0;text-align:center;color:rgba(255,255,255,.92);font-family:'Zilla Slab',serif;font-size:16px;font-weight:600;pointer-events:none;")}>{lightbox.alt}</div>
        </div>
      )}

      {/* WhatsApp float */}
      <Hoverable
        as="a"
        href={waLink}
        target="_blank"
        rel="noopener"
        aria-label="Falar no WhatsApp"
        baseStyle={parseStyle('position:fixed;right:22px;bottom:22px;z-index:80;width:60px;height:60px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px -8px rgba(37,211,102,.7);animation:avPulse 2.6s infinite;transition:transform .25s;')}
        hoverStyle={parseStyle('transform:scale(1.08)')}
      >
        <WaIcon size={32} />
      </Hoverable>
    </div>
  );
}
