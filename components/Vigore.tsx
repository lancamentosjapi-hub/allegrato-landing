'use client';

/**
 * Vigore — porte 1:1 de vigore/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores exatos).
 *
 * Convenções de porte (iguais às de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - style-focus="css"    -> <Focusable> (mesma ideia do Hoverable, em focus/blur)
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *
 * Toda a lógica imperativa (reveal, nav+parallax, counters, card zoom, overlays da
 * galeria, toggle de plantas, drawer mobile, scroll suave por âncora, responsivo
 * JS-driven, lightbox e form->WhatsApp) é portada FIEL do <script data-dc-script>
 * do estático, num único useEffect com cleanup.
 *
 * Imagens: os arquivos aNN.jpg/png vivem em allegrato-landing/vigore/ (git-tracked)
 * e são servidos pela mesma CDN do GitHub Pages usada pelas demais landings
 * (padrão avela). Por isso os src locais viram URLs absolutas para essa base —
 * mesmos arquivos, exatamente.
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

/**
 * Converte uma string CSS ("a:b;c:d") em objeto React.CSSProperties.
 * camelCase nas propriedades; preserva valores EXATOS (cores, px, gradientes).
 * Split no PRIMEIRO ":" de cada declaração (gradientes/data: URIs têm ":" internos).
 */
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

/** style-hover do dc-runtime: hoverStyle vira :hover (merge no enter, remove no leave). */
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

/** style-focus do dc-runtime: focusStyle no focus, remove no blur (inputs do form). */
type FocusableInputProps = {
  baseStyle: CSSProperties;
  focusStyle: CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<'input'>, 'style'>;

function FocusableInput({ baseStyle, focusStyle, ...rest }: FocusableInputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      {...rest}
      style={focus ? { ...baseStyle, ...focusStyle } : baseStyle}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Constantes / dados estáticos (valores EXATOS do fonte)             */
/* ------------------------------------------------------------------ */

// Base CDN dos assets locais aNN.* (mesma usada pelas outras landings — padrão avela).
const IMG = '/vigore/';

const LOGO_WEBP =
  'https://static.wixstatic.com/media/72b66e_7ce953d96f414a579806196cd13fa852~mv2.webp';

// waMain — lógica EXATA do renderVals() do script.
const waMain =
  'https://wa.me/5511926143393?text=' +
  encodeURIComponent(
    'Olá! Tenho interesse no Residencial Vigóre. Pode me enviar mais informações e condições?'
  );

type Stat = { c: number; p: string; s: string; l: string };
const stats: Stat[] = [
  { c: 3, p: '', s: '', l: 'Torres residenciais' },
  { c: 280, p: '', s: '', l: 'Unidades' },
  { c: 54, p: '', s: ' m²', l: 'Plantas de 53 a 54 m²' },
  { c: 20, p: '+', s: '', l: 'Itens de lazer' },
  { c: 14000, p: '', s: ' m²', l: 'de área de terreno' },
];

const locais: string[] = [
  'A poucos minutos do centro de Jundiaí',
  'Fácil acesso à Rodovia Anhanguera',
  'Escolas e unidades de saúde próximas',
  'Supermercados e comércio local',
];

const diferenciais: string[] = [
  'Microgeração de energia fotovoltaica nas áreas comuns',
  'Piscinas com infraestrutura para climatização (GN)',
  'Medidores individualizados de água',
  'Infraestrutura seca para Wi-Fi nas áreas de lazer',
  'Infraestrutura para ar-condicionado portátil',
  'Aquecimento de água a gás natural (cozinha e chuveiro)',
  'Áreas comuns com projeto decorativo e entregues equipadas',
  'Espaçamento entre torres',
  'Elevadores com tecnologia regenerativa',
  'Sensores de presença nos halls e elevadores',
  'Bancadas em granito branco marfim e cinza andorinha',
  'Infraestrutura para máquina de lavar louça e filtro de água',
];

// Estilos base de input do form (repetidos no estático) — para o FocusableInput.
const INPUT_BASE =
  "font-family:'Hanken Grotesk';font-size:15px;padding:14px 16px;border:1px solid #e2d8c8;border-radius:11px;background:#faf7f1;color:#1a1510;outline:none;transition:border-color .25s ease";
const INPUT_FOCUS = 'border-color:#F2581E';

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Vigore() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // guarda de idempotência, espelhando root.dataset.vgWired do estático
    if (root.dataset.vgWired === '1') return;
    root.dataset.vgWired = '1';

    const q = (s: string): NodeListOf<HTMLElement> => root.querySelectorAll<HTMLElement>(s);

    /* ---- scroll reveal (FIEL: threshold .08 / -6% / WAAPI + fallback 2200ms) ---- */
    const reveal = (el: HTMLElement) => {
      if (el.dataset.vgShown === '1') return;
      el.dataset.vgShown = '1';
      el.style.setProperty('transition', 'none', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      if (el.animate) {
        try {
          el.animate(
            [
              { opacity: 0, transform: 'translateY(28px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 760, easing: 'cubic-bezier(.16,.84,.44,1)' }
          );
        } catch (e) {
          /* noop */
        }
      }
    };
    let revealIO: IntersectionObserver | undefined;
    let revealFallback: ReturnType<typeof setTimeout> | undefined;
    if ('IntersectionObserver' in window) {
      revealIO = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target as HTMLElement);
              revealIO!.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
      );
      q('[data-reveal]').forEach((el) => revealIO!.observe(el));
      revealFallback = setTimeout(() => q('[data-reveal]').forEach(reveal), 2200);
    } else {
      q('[data-reveal]').forEach(reveal);
    }

    /* ---- nav + hero parallax ---- */
    const getScroller = (): HTMLElement => {
      const cands = [
        document.scrollingElement as HTMLElement | null,
        document.documentElement,
        document.body,
      ];
      for (const c of cands) {
        if (c && c.scrollHeight - c.clientHeight > 40) return c;
      }
      return (document.scrollingElement as HTMLElement) || document.documentElement;
    };
    const scroller = getScroller();
    const getY = () =>
      window.scrollY ||
      window.pageYOffset ||
      scroller.scrollTop ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const nav = root.querySelector<HTMLElement>('#vg-nav');
    const heroWrap = root.querySelector<HTMLElement>('#vg-hero-wrap');
    const onScroll = () => {
      const y = getY();
      if (nav) {
        if (y > 36) {
          nav.style.background = 'rgba(18,14,10,.9)';
          nav.style.backdropFilter = 'blur(14px)';
          (nav.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter =
            'blur(14px)';
          nav.style.borderBottomColor = 'rgba(255,255,255,.08)';
          nav.style.boxShadow = '0 14px 40px rgba(0,0,0,.35)';
          nav.style.paddingTop = '11px';
          nav.style.paddingBottom = '11px';
        } else {
          nav.style.background = 'transparent';
          nav.style.backdropFilter = 'none';
          (nav.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter =
            'none';
          nav.style.borderBottomColor = 'rgba(255,255,255,0)';
          nav.style.boxShadow = 'none';
          nav.style.paddingTop = '16px';
          nav.style.paddingBottom = '16px';
        }
      }
      if (heroWrap && y < window.innerHeight) {
        heroWrap.style.transform = 'translate3d(0,' + y * 0.26 + 'px,0)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();

    /* ---- counters ---- */
    const fmt = (n: number) => n.toLocaleString('pt-BR');
    const animateCount = (el: HTMLElement) => {
      const target = parseInt(el.getAttribute('data-count') || '', 10) || 0;
      const pre = el.getAttribute('data-prefix') || '';
      const suf = el.getAttribute('data-suffix') || '';
      const dur = 1500,
        st = performance.now();
      const finalText = pre + fmt(target) + suf;
      const step = (now: number) => {
        const p = Math.min(1, (now - st) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(Math.round(target * e)) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => {
        el.textContent = finalText;
      }, 1700);
    };
    const counters = Array.from(q('[data-count]'));
    const checkCounters = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      counters.forEach((el) => {
        if (el.dataset.vgCounted === '1') return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.dataset.vgCounted = '1';
          animateCount(el);
        }
      });
    };
    checkCounters();
    window.addEventListener('scroll', checkCounters, { passive: true });
    document.addEventListener('scroll', checkCounters, { passive: true, capture: true });
    const countersTimeout = setTimeout(checkCounters, 400);

    /* ---- card hover zoom ---- */
    const zoomHandlers: Array<{
      parent: HTMLElement;
      enter: () => void;
      leave: () => void;
    }> = [];
    q('.vg-zoom').forEach((img) => {
      const parent = (img.closest('[data-lb]') as HTMLElement | null) || img.parentElement;
      if (!parent) return;
      const enter = () => {
        img.style.transform = 'scale(1.07)';
      };
      const leave = () => {
        img.style.transform = 'scale(1)';
      };
      parent.addEventListener('mouseenter', enter);
      parent.addEventListener('mouseleave', leave);
      zoomHandlers.push({ parent, enter, leave });
    });

    /* ---- gallery caption overlays ---- */
    const galHandlers: Array<{ card: HTMLElement; enter: () => void; leave: () => void }> = [];
    q('.vg-galov').forEach((o) => {
      const card = o.parentElement;
      if (!card) return;
      const cap = card.querySelector<HTMLElement>('.vg-galcap');
      const enter = () => {
        o.style.opacity = '1';
        if (cap) cap.style.opacity = '1';
      };
      const leave = () => {
        o.style.opacity = '0';
        if (cap) cap.style.opacity = '0';
      };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      galHandlers.push({ card, enter, leave });
    });

    /* ---- plantas toggle ---- */
    const planName = root.querySelector<HTMLElement>('#vg-plan-name');
    const planArea = root.querySelector<HTMLElement>('#vg-plan-area');
    const planBtns = Array.from(q('.vg-plan'));
    const planHandlers: Array<{ btn: HTMLElement; fn: () => void }> = [];
    planBtns.forEach((btn) => {
      const fn = () => {
        planBtns.forEach((b) => {
          b.style.background = 'transparent';
          b.style.color = '#1a1510';
          b.style.borderColor = '#d8cdbb';
        });
        btn.style.background = '#F2581E';
        btn.style.color = '#fff';
        btn.style.borderColor = '#F2581E';
        if (planName) planName.textContent = btn.getAttribute('data-name');
        if (planArea) planArea.textContent = btn.getAttribute('data-area');
      };
      btn.addEventListener('click', fn);
      planHandlers.push({ btn, fn });
    });

    /* ---- mobile drawer ---- */
    const burger = root.querySelector<HTMLElement>('#vg-burger');
    const drawer = root.querySelector<HTMLElement>('#vg-drawer');
    const closeBtn = root.querySelector<HTMLElement>('#vg-drawer-close');
    const closeDrawer = () => {
      if (drawer) {
        drawer.dataset.open = '0';
        drawer.style.transform = 'translateX(100%)';
      }
    };
    const openDrawer = () => {
      if (drawer) {
        drawer.dataset.open = '1';
        drawer.style.transform = 'translateX(0)';
      }
    };
    const burgerFn = () => {
      drawer && drawer.dataset.open === '1' ? closeDrawer() : openDrawer();
    };
    if (burger) burger.addEventListener('click', burgerFn);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    /* ---- smooth anchor scroll ---- */
    const anchorHandlers: Array<{ a: HTMLElement; fn: (e: Event) => void }> = [];
    root.querySelectorAll<HTMLElement>('a[href^="#"]').forEach((a) => {
      const fn = (e: Event) => {
        const id = a.getAttribute('href');
        if (id && id.length > 1) {
          const t = root.querySelector<HTMLElement>(id);
          if (t) {
            e.preventDefault();
            const targetY = t.getBoundingClientRect().top + getY() - 64;
            try {
              scroller.scrollTo({ top: targetY, behavior: 'smooth' });
            } catch (err) {
              window.scrollTo(0, targetY);
            }
            closeDrawer();
          }
        }
      };
      a.addEventListener('click', fn);
      anchorHandlers.push({ a, fn });
    });

    /* ---- responsive (JS-driven breakpoints) ---- */
    const gridEls: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>('div').forEach((g) => {
      if (g.style.display === 'grid' && g.style.gridTemplateColumns) {
        g.dataset.vgCols = g.style.gridTemplateColumns;
        gridEls.push(g);
      }
    });
    const colEls: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>('div').forEach((g) => {
      if (g.style.columns) {
        g.dataset.vgColumns = g.style.columns;
        colEls.push(g);
      }
    });
    const applyResponsive = () => {
      const w = window.innerWidth;
      const links = root.querySelector<HTMLElement>('#vg-links');
      const mob = w < 920;
      if (links) links.style.display = mob ? 'none' : 'flex';
      if (burger) burger.style.display = mob ? 'flex' : 'none';
      gridEls.forEach((g) => {
        const orig = g.dataset.vgCols || '1fr';
        const rm = orig.match(/repeat\(\s*(\d+)/);
        const n = rm ? parseInt(rm[1], 10) : orig.trim().split(/\s+/).length;
        if (w < 760) g.style.gridTemplateColumns = n >= 3 ? 'repeat(2,1fr)' : '1fr';
        else if (w < 1000) g.style.gridTemplateColumns = n >= 4 ? 'repeat(3,1fr)' : orig;
        else g.style.gridTemplateColumns = orig;
      });
      colEls.forEach((g) => {
        g.style.columns = w < 640 ? '1' : w < 1000 ? '2' : g.dataset.vgColumns || '3';
      });
    };

    /* ---- lightbox ---- */
    const items = Array.from(q('[data-lb]'));
    let idx = 0;
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(10,8,6,.94);opacity:0;transition:opacity .3s ease;padding:24px';
    overlay.innerHTML =
      '<button data-lbx="close" aria-label="Fechar" style="position:absolute;top:20px;right:24px;background:none;border:none;color:#fff;font-size:40px;cursor:pointer;line-height:1;z-index:2">×</button>' +
      '<button data-lbx="prev" aria-label="Anterior" style="position:absolute;left:18px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;width:54px;height:54px;border-radius:50%;font-size:24px;cursor:pointer;z-index:2">‹</button>' +
      '<button data-lbx="next" aria-label="Próxima" style="position:absolute;right:18px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff;width:54px;height:54px;border-radius:50%;font-size:24px;cursor:pointer;z-index:2">›</button>' +
      '<div style="max-width:1100px;width:100%;display:flex;flex-direction:column;align-items:center;gap:16px">' +
      '<img data-lbx="img" style="max-width:100%;max-height:78vh;object-fit:contain;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.6)">' +
      '<div data-lbx="cap" style="font-family:\'Hanken Grotesk\',sans-serif;font-size:15px;color:rgba(255,255,255,.8);text-align:center"></div>' +
      '</div>';
    root.appendChild(overlay);
    const lbImg = overlay.querySelector<HTMLImageElement>('[data-lbx="img"]')!;
    const lbCap = overlay.querySelector<HTMLElement>('[data-lbx="cap"]')!;
    const update = () => {
      const it = items[idx];
      if (!it) return;
      lbImg.src = it.getAttribute('data-lb') || '';
      lbCap.textContent = it.getAttribute('data-cap') || '';
    };
    const openLb = (i: number) => {
      idx = i;
      update();
      overlay.style.display = 'flex';
      requestAnimationFrame(() => (overlay.style.opacity = '1'));
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    };
    const go = (d: number) => {
      idx = (idx + d + items.length) % items.length;
      update();
    };
    const itemHandlers: Array<{ it: HTMLElement; fn: () => void }> = [];
    items.forEach((it, i) => {
      const fn = () => openLb(i);
      it.addEventListener('click', fn);
      itemHandlers.push({ it, fn });
    });
    const overlayClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      const act = tgt.getAttribute && tgt.getAttribute('data-lbx');
      if (act === 'close' || tgt === overlay) closeLb();
      else if (act === 'prev') {
        e.stopPropagation();
        go(-1);
      } else if (act === 'next') {
        e.stopPropagation();
        go(1);
      }
    };
    overlay.addEventListener('click', overlayClick);
    const onKeydown = (e: KeyboardEvent) => {
      if (overlay.style.display !== 'flex') return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKeydown);

    /* ---- form -> whatsapp ---- */
    const form = root.querySelector<HTMLFormElement>('#vg-form');
    const formSubmit = (e: Event) => {
      e.preventDefault();
      if (!form) return;
      const fd = new FormData(form);
      const nome = (fd.get('nome') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const tel = (fd.get('whatsapp') || '').toString().trim();
      const hor = (fd.get('horario') || '').toString().trim();
      sendLead({
        name: nome,
        phone: tel,
        email,
        source: 'landing_vigore',
        interest: 'Residencial Vigóre',
        message: hor ? 'Melhor horário: ' + hor : '',
      });
      let msg = 'Olá! Meu nome é ' + nome + ' e tenho interesse no Residencial Vigóre.';
      msg += '\n\nE-mail: ' + email;
      msg += '\nWhatsApp: ' + tel;
      if (hor) msg += '\nMelhor horário: ' + hor;
      window.open('https://wa.me/5511926143393?text=' + encodeURIComponent(msg), '_blank');
    };
    if (form) form.addEventListener('submit', formSubmit);

    window.addEventListener('resize', applyResponsive);
    applyResponsive();

    /* ---- cleanup ---- */
    return () => {
      if (revealIO) revealIO.disconnect();
      if (revealFallback) clearTimeout(revealFallback);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener('scroll', checkCounters);
      document.removeEventListener('scroll', checkCounters, {
        capture: true,
      } as EventListenerOptions);
      clearTimeout(countersTimeout);
      zoomHandlers.forEach(({ parent, enter, leave }) => {
        parent.removeEventListener('mouseenter', enter);
        parent.removeEventListener('mouseleave', leave);
      });
      galHandlers.forEach(({ card, enter, leave }) => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mouseleave', leave);
      });
      planHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
      if (burger) burger.removeEventListener('click', burgerFn);
      if (closeBtn) closeBtn.removeEventListener('click', closeDrawer);
      anchorHandlers.forEach(({ a, fn }) => a.removeEventListener('click', fn));
      itemHandlers.forEach(({ it, fn }) => it.removeEventListener('click', fn));
      overlay.removeEventListener('click', overlayClick);
      document.removeEventListener('keydown', onKeydown);
      if (form) form.removeEventListener('submit', formSubmit);
      window.removeEventListener('resize', applyResponsive);
      overlay.remove();
      delete root.dataset.vgWired;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} id="vg-root" style={parseStyle('background:#15110D;position:relative')}>
      {/* ============ NAV ============ */}
      <nav
        id="vg-nav"
        style={parseStyle(
          'position:fixed;top:0;left:0;right:0;z-index:90;display:flex;align-items:center;justify-content:space-between;padding:16px clamp(20px,4vw,52px);border-bottom:1px solid rgba(255,255,255,0);transition:background .45s ease,box-shadow .45s ease,border-color .45s ease,padding .45s ease;background:transparent'
        )}
      >
        <a
          href="#topo"
          style={parseStyle('display:flex;align-items:center;gap:10px;text-decoration:none')}
        >
          <img
            src={LOGO_WEBP}
            alt="Residencial Vigóre"
            style={parseStyle('height:34px;width:auto')}
          />
        </a>
        <div
          id="vg-links"
          style={parseStyle('display:flex;align-items:center;gap:32px')}
        >
          <a
            href="#empreendimento"
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:500;font-size:14px;letter-spacing:.02em;color:rgba(255,255,255,.82);text-decoration:none"
            )}
          >
            O Empreendimento
          </a>
          <a
            href="#lazer"
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:500;font-size:14px;color:rgba(255,255,255,.82);text-decoration:none"
            )}
          >
            Lazer
          </a>
          <a
            href="#plantas"
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:500;font-size:14px;color:rgba(255,255,255,.82);text-decoration:none"
            )}
          >
            Plantas
          </a>
          <a
            href="#localizacao"
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:500;font-size:14px;color:rgba(255,255,255,.82);text-decoration:none"
            )}
          >
            Localização
          </a>
          <a
            href="#contato"
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:500;font-size:14px;color:rgba(255,255,255,.82);text-decoration:none"
            )}
          >
            Contato
          </a>
          <Hoverable
            as="a"
            href={waMain}
            target="_blank"
            rel="noopener"
            baseStyle={parseStyle(
              "display:inline-flex;align-items:center;gap:8px;font-family:'Archivo';font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:#F2581E;padding:11px 20px;border-radius:100px;text-decoration:none;transition:transform .25s ease,background .25s ease"
            )}
            hoverStyle={parseStyle('background:#d8430c;transform:translateY(-2px)')}
          >
            WhatsApp
          </Hoverable>
        </div>
        <button
          id="vg-burger"
          aria-label="Menu"
          style={parseStyle(
            'display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px'
          )}
        >
          <span style={parseStyle('width:26px;height:2px;background:#fff;display:block')}></span>
          <span style={parseStyle('width:26px;height:2px;background:#fff;display:block')}></span>
          <span style={parseStyle('width:26px;height:2px;background:#fff;display:block')}></span>
        </button>
      </nav>

      {/* mobile drawer */}
      <div
        id="vg-drawer"
        data-open="0"
        style={parseStyle(
          'position:fixed;top:0;right:0;bottom:0;width:min(82vw,340px);background:#1b1610;z-index:95;transform:translateX(100%);transition:transform .5s cubic-bezier(.16,.84,.44,1);display:flex;flex-direction:column;padding:88px 32px 32px;gap:6px;box-shadow:-30px 0 80px rgba(0,0,0,.5)'
        )}
      >
        <button
          id="vg-drawer-close"
          aria-label="Fechar"
          style={parseStyle(
            'position:absolute;top:24px;right:24px;background:none;border:none;color:#fff;font-size:30px;cursor:pointer;line-height:1'
          )}
        >
          ×
        </button>
        <a
          href="#empreendimento"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)"
          )}
        >
          O Empreendimento
        </a>
        <a
          href="#lazer"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)"
          )}
        >
          Lazer
        </a>
        <a
          href="#plantas"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)"
          )}
        >
          Plantas
        </a>
        <a
          href="#localizacao"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)"
          )}
        >
          Localização
        </a>
        <a
          href="#diferenciais"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)"
          )}
        >
          Diferenciais
        </a>
        <a
          href="#contato"
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:19px;color:#fff;text-decoration:none;padding:14px 0"
          )}
        >
          Contato
        </a>
        <a
          href={waMain}
          target="_blank"
          rel="noopener"
          style={parseStyle(
            "margin-top:18px;text-align:center;font-family:'Archivo';font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:#F2581E;padding:15px;border-radius:100px;text-decoration:none"
          )}
        >
          Falar no WhatsApp
        </a>
      </div>

      {/* ============ HERO ============ */}
      <header
        id="topo"
        data-screen-label="Hero"
        style={parseStyle(
          'position:relative;min-height:720px;max-height:860px;height:90svh;display:flex;align-items:center;overflow:hidden;background:#0e0b08'
        )}
      >
        <div
          id="vg-hero-wrap"
          style={parseStyle('position:absolute;inset:-6% 0;z-index:0;will-change:transform')}
        >
          <div
            id="vg-hero-bg"
            style={parseStyle(
              `position:absolute;inset:0;background:url("${IMG}a44.jpg") center 38%/cover no-repeat;animation:vgKen 18s ease-out forwards`
            )}
          ></div>
        </div>
        <div
          style={parseStyle(
            'position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(14,11,8,.55) 0%,rgba(14,11,8,.12) 32%,rgba(14,11,8,.55) 72%,rgba(14,11,8,.94) 100%)'
          )}
        ></div>
        <div
          style={parseStyle(
            'position:absolute;inset:0;z-index:1;background:linear-gradient(100deg,rgba(14,11,8,.7) 0%,rgba(14,11,8,.18) 48%,rgba(14,11,8,0) 75%)'
          )}
        ></div>

        <div
          style={parseStyle(
            'position:relative;z-index:3;width:100%;max-width:1280px;margin:0 auto;padding:clamp(40px,7vh,90px) clamp(20px,4vw,52px)'
          )}
        >
          <div
            data-reveal=""
            style={parseStyle(
              'opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,.84,.44,1),transform 1s cubic-bezier(.16,.84,.44,1)'
            )}
          >
            <div
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:26px'
              )}
            >
              <span style={parseStyle('width:34px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.32em;text-transform:uppercase;color:#fff"
                )}
              >
                Lançamento · Bairro Colônia · Jundiaí/SP
              </span>
            </div>
          </div>
          <img
            data-reveal=""
            src={LOGO_WEBP}
            alt="Residencial Vigóre"
            style={parseStyle(
              'width:clamp(280px,42vw,620px);height:auto;margin-bottom:14px;opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,.84,.44,1) .08s,transform 1s cubic-bezier(.16,.84,.44,1) .08s'
            )}
          />
          <h1
            data-reveal=""
            style={parseStyle(
              "font-family:'Cormorant Garamond',serif;font-weight:500;font-style:italic;font-size:clamp(30px,5.2vw,64px);line-height:1.0;color:#fff;letter-spacing:-.01em;max-width:16ch;margin-bottom:24px;opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,.84,.44,1) .16s,transform 1s cubic-bezier(.16,.84,.44,1) .16s"
            )}
          >
            Tradição e modernidade{' '}
            <span style={parseStyle('color:#F2581E')}>brilham juntas.</span>
          </h1>
          <p
            data-reveal=""
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-weight:400;font-size:clamp(16px,1.7vw,19px);line-height:1.55;color:rgba(255,255,255,.82);max-width:48ch;margin-bottom:36px;opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,.84,.44,1) .24s,transform 1s cubic-bezier(.16,.84,.44,1) .24s"
            )}
          >
            Apartamentos de 2 dormitórios, de 53 a 54 m², com área de lazer completa. Três torres
            num dos bairros mais tradicionais de Jundiaí.
          </p>
          <div
            data-reveal=""
            style={parseStyle(
              'display:flex;flex-wrap:wrap;align-items:center;gap:18px;opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,.84,.44,1) .32s,transform 1s cubic-bezier(.16,.84,.44,1) .32s'
            )}
          >
            <Hoverable
              as="a"
              href={waMain}
              target="_blank"
              rel="noopener"
              baseStyle={parseStyle(
                "display:inline-flex;align-items:center;gap:10px;font-family:'Archivo';font-weight:700;font-size:14px;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:#F2581E;padding:17px 30px;border-radius:100px;text-decoration:none;transition:transform .25s ease,background .25s ease"
              )}
              hoverStyle={parseStyle('background:#d8430c;transform:translateY(-3px)')}
            >
              Tenho interesse
            </Hoverable>
            <Hoverable
              as="a"
              href="#lazer"
              baseStyle={parseStyle(
                "display:inline-flex;align-items:center;gap:10px;font-family:'Archivo';font-weight:700;font-size:14px;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.28);padding:16px 28px;border-radius:100px;text-decoration:none;backdrop-filter:blur(6px);transition:background .25s ease"
              )}
              hoverStyle={parseStyle('background:rgba(255,255,255,.18)')}
            >
              Explorar o lazer
            </Hoverable>
            <div
              style={parseStyle(
                'display:flex;flex-direction:column;gap:2px;padding-left:6px'
              )}
            >
              <span
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-weight:500;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.6)"
                )}
              >
                A partir de
              </span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(20px,2.3vw,27px);color:#fff;line-height:1"
                )}
              >
                R$ 395.948,71<span style={parseStyle('color:#F2581E')}>*</span>
              </span>
            </div>
          </div>
        </div>
        <a
          href="#empreendimento"
          aria-label="Rolar"
          style={parseStyle(
            "position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;animation:vgFloat 2.6s ease-in-out infinite"
          )}
        >
          <span
            style={parseStyle(
              "font-family:'Archivo';font-weight:600;font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.62)"
            )}
          >
            Role
          </span>
          <span
            style={parseStyle(
              'width:1px;height:34px;background:linear-gradient(180deg,rgba(255,255,255,.7),rgba(255,255,255,0))'
            )}
          ></span>
        </a>
      </header>

      {/* ============ STATS ============ */}
      <section
        data-screen-label="Números"
        style={parseStyle(
          'background:#15110D;padding:clamp(40px,6vw,64px) clamp(20px,4vw,52px);border-bottom:1px solid rgba(255,255,255,.07)'
        )}
      >
        <div
          style={parseStyle(
            'max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(5,1fr);gap:20px'
          )}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              data-reveal=""
              style={parseStyle(
                'display:flex;flex-direction:column;gap:6px;opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,.84,.44,1),transform .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span
                data-count={s.c}
                data-prefix={s.p}
                data-suffix={s.s}
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(30px,3.6vw,52px);line-height:1;color:#F2581E;letter-spacing:-.02em"
                )}
              >
                {s.p}0{s.s}
              </span>
              <span
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-weight:400;font-size:13.5px;line-height:1.35;color:rgba(255,255,255,.6)"
                )}
              >
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ O EMPREENDIMENTO ============ */}
      <section
        id="empreendimento"
        data-screen-label="O Empreendimento"
        style={parseStyle(
          'background:#F7F2EA;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px)'
        )}
      >
        <div
          style={parseStyle(
            'max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,6vw,90px);align-items:center'
          )}
        >
          <div>
            <div
              data-reveal=""
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#C8410F"
                )}
              >
                O Empreendimento
              </span>
            </div>
            <h2
              data-reveal=""
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.4vw,58px);line-height:1.02;letter-spacing:-.025em;color:#1a1510;margin-bottom:28px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
              )}
            >
              Um lar moderno, vibrante e feito para conviver
            </h2>
            <p
              data-reveal=""
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-weight:400;font-size:17px;line-height:1.7;color:#5b5249;margin-bottom:20px;max-width:54ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .12s"
              )}
            >
              Localizado no bairro Colônia, o Residencial Vigóre oferece fácil acesso a serviços e
              comodidades. Seu design arquitetônico vibrante se destaca na paisagem urbana, criando
              uma identidade visual marcante.
            </p>
            <p
              data-reveal=""
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-weight:400;font-size:17px;line-height:1.7;color:#5b5249;margin-bottom:38px;max-width:54ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .18s"
              )}
            >
              O paisagismo inteligente aproveita os desníveis naturais do terreno, criando um
              ambiente acolhedor e integrado, com espaços de convivência cuidadosamente
              distribuídos.
            </p>
            <div
              data-reveal=""
              style={parseStyle(
                'display:grid;grid-template-columns:1fr 1fr;gap:22px 32px;max-width:560px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .24s'
              )}
            >
              <div style={parseStyle('border-top:1px solid #E1D6C5;padding-top:14px')}>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:800;font-size:21px;color:#1a1510"
                  )}
                >
                  Alvenaria estrutural
                </div>
                <div
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:14px;color:#7a7065;margin-top:2px"
                  )}
                >
                  sobre pilotis de concreto armado
                </div>
              </div>
              <div style={parseStyle('border-top:1px solid #E1D6C5;padding-top:14px')}>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:800;font-size:21px;color:#1a1510"
                  )}
                >
                  2 elevadores
                </div>
                <div
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:14px;color:#7a7065;margin-top:2px"
                  )}
                >
                  por torre, com tecnologia regenerativa
                </div>
              </div>
              <div style={parseStyle('border-top:1px solid #E1D6C5;padding-top:14px')}>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:800;font-size:21px;color:#1a1510"
                  )}
                >
                  Pé-direito 2,60 m
                </div>
                <div
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:14px;color:#7a7065;margin-top:2px"
                  )}
                >
                  nas unidades
                </div>
              </div>
              <div style={parseStyle('border-top:1px solid #E1D6C5;padding-top:14px')}>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:800;font-size:21px;color:#1a1510"
                  )}
                >
                  280 vagas
                </div>
                <div
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:14px;color:#7a7065;margin-top:2px"
                  )}
                >
                  privativas, cobertas ou descobertas
                </div>
              </div>
            </div>
          </div>
          <div
            data-reveal=""
            style={parseStyle(
              'position:relative;opacity:0;transform:translateY(34px) scale(.98);transition:all 1s cubic-bezier(.16,.84,.44,1) .1s'
            )}
          >
            <div
              style={parseStyle(
                'position:relative;border-radius:20px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(40,20,5,.4)'
              )}
            >
              <img
                src={`${IMG}a18.jpg`}
                alt="Fachada do Residencial Vigóre"
                style={parseStyle(
                  'width:100%;height:clamp(420px,58vw,640px);object-fit:cover'
                )}
              />
            </div>
            <div
              style={parseStyle(
                'position:absolute;left:-22px;bottom:30px;background:#15110D;color:#fff;padding:22px 26px;border-radius:16px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5);max-width:230px'
              )}
            >
              <div
                style={parseStyle(
                  "font-family:'Cormorant Garamond',serif;font-style:italic;font-size:30px;line-height:1.05;color:#F2581E"
                )}
              >
                14.000 m²
              </div>
              <div
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:13.5px;color:rgba(255,255,255,.72);margin-top:6px;line-height:1.4"
                )}
              >
                de terreno e ~19.000 m² de área construída
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section
        id="lazer"
        data-screen-label="Lazer"
        style={parseStyle(
          'background:#15110D;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px);position:relative;overflow:hidden'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto')}>
          <div
            style={parseStyle(
              'display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:24px;margin-bottom:clamp(40px,5vw,64px)'
            )}
          >
            <div>
              <div
                data-reveal=""
                style={parseStyle(
                  'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
                )}
              >
                <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
                <span
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#F2581E"
                  )}
                >
                  Lazer &amp; Convivência
                </span>
              </div>
              <h2
                data-reveal=""
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.6vw,60px);line-height:1.0;letter-spacing:-.025em;color:#fff;max-width:16ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
                )}
              >
                Mais de 20 espaços para viver bem
              </h2>
            </div>
            <p
              data-reveal=""
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-weight:400;font-size:16px;line-height:1.65;color:rgba(255,255,255,.6);max-width:38ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .12s"
              )}
            >
              Cada área foi projetada para estimular a convivência e o bem-estar. Toque em qualquer
              ambiente para ampliar.
            </p>
          </div>

          {/* featured */}
          <div
            data-reveal=""
            data-lb={`${IMG}a11.jpg`}
            data-cap="Voo de pássaro — área de lazer completa"
            style={parseStyle(
              'position:relative;border-radius:22px;overflow:hidden;cursor:pointer;margin-bottom:22px;opacity:0;transform:translateY(34px);transition:all .9s cubic-bezier(.16,.84,.44,1) .1s'
            )}
          >
            <img
              className="vg-zoom"
              src={`${IMG}a11.jpg`}
              alt="Vista aérea da área de lazer do Residencial Vigóre"
              style={parseStyle(
                'width:100%;height:clamp(280px,42vw,520px);object-fit:cover;transition:transform 1s cubic-bezier(.16,.84,.44,1)'
              )}
            />
            <div
              style={parseStyle(
                'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.78) 100%)'
              )}
            ></div>
            <div
              style={parseStyle(
                'position:absolute;left:clamp(20px,3vw,40px);bottom:clamp(20px,3vw,36px);right:20px'
              )}
            >
              <div
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;color:#F2581E;margin-bottom:8px"
                )}
              >
                Clube ao ar livre
              </div>
              <h3
                style={parseStyle(
                  "font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:clamp(26px,3.4vw,46px);color:#fff;line-height:1"
                )}
              >
                Piscinas, quadras, playground e praças num só lugar
              </h3>
            </div>
            <div
              style={parseStyle(
                'position:absolute;top:20px;right:20px;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.16);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px'
              )}
            >
              ⤢
            </div>
          </div>

          {/* grid */}
          <div
            style={parseStyle(
              'display:grid;grid-template-columns:repeat(4,1fr);gap:22px'
            )}
          >
            <AmenityCard
              lb={`${IMG}a03.jpg`}
              cap="Salão de festas com espaço gourmet"
              img={`${IMG}a03.jpg`}
              alt="Salão de festas do Residencial Vigóre"
              tag="Convivência"
              title="Salão de Festas"
            />
            <AmenityCard
              lb={`${IMG}a17.jpg`}
              cap="Piscina adulto com acessibilidade, ducha e piscina infantil"
              img={`${IMG}a17.jpg`}
              alt="Piscina adulto e infantil"
              tag="Bem-estar"
              title="Piscinas"
            />
            <AmenityCard
              lb={`${IMG}a09.jpg`}
              cap="Quadra recreativa e meia quadra de basquete"
              img={`${IMG}a09.jpg`}
              alt="Quadra recreativa"
              tag="Esporte"
              title="Quadra Recreativa"
            />
            <AmenityCard
              lb={`${IMG}a10.jpg`}
              cap="3 churrasqueiras externas"
              img={`${IMG}a10.jpg`}
              alt="Churrasqueiras externas"
              tag="Gourmet"
              title="Churrasqueiras"
            />
            <AmenityCard
              lb={`${IMG}a05.jpg`}
              cap="Espaço fitness (Torre A)"
              img={`${IMG}a05.jpg`}
              alt="Espaço fitness"
              tag="Torre A"
              title="Espaço Fitness"
            />
            <AmenityCard
              lb={`${IMG}a15.jpg`}
              cap="Playgrounds para as crianças"
              img={`${IMG}a15.jpg`}
              alt="Playground"
              tag="Família"
              title="Playground"
            />
            <AmenityCard
              lb={`${IMG}a20.jpg`}
              cap="Espaço pet integrado ao paisagismo"
              img={`${IMG}a20.jpg`}
              alt="Espaço pet"
              tag="Pet"
              title="Espaço Pet"
            />
            <AmenityCard
              lb={`${IMG}a08.jpg`}
              cap="Brinquedoteca (Torre C)"
              img={`${IMG}a08.jpg`}
              alt="Brinquedoteca"
              tag="Torre C"
              title="Brinquedoteca"
            />
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section
        id="plantas"
        data-screen-label="Plantas"
        style={parseStyle(
          'background:#F7F2EA;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px)'
        )}
      >
        <div
          style={parseStyle(
            'max-width:1280px;margin:0 auto;display:grid;grid-template-columns:.92fr 1.08fr;gap:clamp(40px,6vw,80px);align-items:center'
          )}
        >
          <div>
            <div
              data-reveal=""
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#C8410F"
                )}
              >
                Plantas
              </span>
            </div>
            <h2
              data-reveal=""
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.4vw,58px);line-height:1.02;letter-spacing:-.025em;color:#1a1510;margin-bottom:24px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
              )}
            >
              2 dormitórios,
              <br />
              de 53 a 54 m²
            </h2>
            <p
              data-reveal=""
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-weight:400;font-size:17px;line-height:1.7;color:#5b5249;margin-bottom:30px;max-width:46ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .12s"
              )}
            >
              Plantas inteligentes que aproveitam cada metro. Selecione a metragem para conferir.
            </p>

            <div
              data-reveal=""
              style={parseStyle(
                'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:30px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .18s'
              )}
            >
              <button
                className="vg-plan"
                data-plan="0"
                data-area="53,27 m²"
                data-name="Planta Final 01"
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:14px;padding:12px 22px;border-radius:100px;border:1px solid #F2581E;background:#F2581E;color:#fff;cursor:pointer;transition:all .3s ease"
                )}
              >
                53,27 m²
              </button>
              <button
                className="vg-plan"
                data-plan="1"
                data-area="54,37 m²"
                data-name="Planta Final 03"
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:14px;padding:12px 22px;border-radius:100px;border:1px solid #d8cdbb;background:transparent;color:#1a1510;cursor:pointer;transition:all .3s ease"
                )}
              >
                54,37 m²
              </button>
              <button
                className="vg-plan"
                data-plan="2"
                data-area="54,70 m²"
                data-name="Planta Final 08"
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:14px;padding:12px 22px;border-radius:100px;border:1px solid #d8cdbb;background:transparent;color:#1a1510;cursor:pointer;transition:all .3s ease"
                )}
              >
                54,70 m²
              </button>
            </div>

            <div
              style={parseStyle(
                'display:flex;flex-direction:column;gap:14px;margin-bottom:34px'
              )}
            >
              <div style={parseStyle('display:flex;align-items:center;gap:12px')}>
                <span
                  style={parseStyle(
                    'width:7px;height:7px;border-radius:50%;background:#F2581E;flex:none'
                  )}
                ></span>
                <span
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:15.5px;color:#473f37"
                  )}
                >
                  Área de serviço entregue na varanda
                </span>
              </div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px')}>
                <span
                  style={parseStyle(
                    'width:7px;height:7px;border-radius:50%;background:#F2581E;flex:none'
                  )}
                ></span>
                <span
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:15.5px;color:#473f37"
                  )}
                >
                  Bancadas em granito branco marfim e cinza andorinha
                </span>
              </div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px')}>
                <span
                  style={parseStyle(
                    'width:7px;height:7px;border-radius:50%;background:#F2581E;flex:none'
                  )}
                ></span>
                <span
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-size:15.5px;color:#473f37"
                  )}
                >
                  Infraestrutura para ar-condicionado e aquecimento a gás
                </span>
              </div>
            </div>

            <Hoverable
              as="a"
              href="https://my.matterport.com/show/?m=L122KLg4aqt"
              target="_blank"
              rel="noopener"
              baseStyle={parseStyle(
                "display:inline-flex;align-items:center;gap:10px;font-family:'Archivo';font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#1a1510;border:1px solid #1a1510;padding:14px 26px;border-radius:100px;text-decoration:none;transition:all .3s ease"
              )}
              hoverStyle={parseStyle('background:#1a1510;color:#fff')}
            >
              ▸ Fazer tour virtual 360°
            </Hoverable>
          </div>
          <div
            data-reveal=""
            style={parseStyle(
              'opacity:0;transform:translateY(34px) scale(.98);transition:all 1s cubic-bezier(.16,.84,.44,1) .1s'
            )}
          >
            <div
              style={parseStyle(
                'background:#fff;border-radius:20px;padding:clamp(20px,3vw,40px);box-shadow:0 40px 80px -36px rgba(40,20,5,.34);border:1px solid #ece3d5'
              )}
            >
              <div
                style={parseStyle(
                  'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:18px'
                )}
              >
                <span
                  id="vg-plan-name"
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:800;font-size:18px;color:#1a1510"
                  )}
                >
                  Planta Final 01
                </span>
                <span
                  id="vg-plan-area"
                  style={parseStyle(
                    "font-family:'Cormorant Garamond',serif;font-style:italic;font-size:27px;color:#F2581E;line-height:1;white-space:nowrap"
                  )}
                >
                  53,27 m²
                </span>
              </div>
              <div
                data-lb={`${IMG}a00.jpg`}
                data-cap="Planta tipo — 2 dormitórios (perspectiva ilustrativa)"
                style={parseStyle(
                  'cursor:pointer;border-radius:12px;overflow:hidden;background:#f3eee6'
                )}
              >
                <img
                  src={`${IMG}a00.jpg`}
                  alt="Planta tipo do apartamento de 2 dormitórios"
                  style={parseStyle('width:100%;object-fit:contain')}
                />
              </div>
              <p
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:12px;color:#9a9082;margin-top:14px;line-height:1.5"
                )}
              >
                Perspectiva ilustrativa da planta tipo (2 dormitórios). Mobiliário meramente
                decorativo, não incluso. Medidas internas e de face a face.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section
        id="localizacao"
        data-screen-label="Localização"
        style={parseStyle(
          'background:#15110D;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px)'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto')}>
          <div
            style={parseStyle(
              'display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center'
            )}
          >
            <div>
              <div
                data-reveal=""
                style={parseStyle(
                  'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
                )}
              >
                <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
                <span
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#F2581E"
                  )}
                >
                  Localização
                </span>
              </div>
              <h2
                data-reveal=""
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.4vw,58px);line-height:1.02;letter-spacing:-.025em;color:#fff;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
                )}
              >
                No coração da Colônia
              </h2>
              <p
                data-reveal=""
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-weight:400;font-size:17px;line-height:1.7;color:rgba(255,255,255,.7);margin-bottom:14px;max-width:50ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .12s"
                )}
              >
                Um bairro tradicional de Jundiaí, com importante valor cultural e histórico, a
                poucos minutos do centro e com fácil acesso à Rodovia Anhanguera.
              </p>
              <div
                data-reveal=""
                style={parseStyle(
                  'display:flex;align-items:center;gap:14px;margin:30px 0;padding:20px 24px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .18s'
                )}
              >
                <span style={parseStyle('font-size:26px')}>📍</span>
                <div>
                  <div
                    style={parseStyle(
                      "font-family:'Archivo';font-weight:700;font-size:16px;color:#fff"
                    )}
                  >
                    Avenida Nami Azém, nº 1093
                  </div>
                  <div
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.6);margin-top:2px"
                    )}
                  >
                    Bairro Colônia · Jundiaí · São Paulo
                  </div>
                </div>
              </div>
              <div
                data-reveal=""
                style={parseStyle(
                  'display:grid;grid-template-columns:1fr 1fr;gap:14px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .24s'
                )}
              >
                {locais.map((l, i) => (
                  <div
                    key={i}
                    style={parseStyle(
                      'display:flex;align-items:center;gap:10px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px'
                    )}
                  >
                    <span
                      style={parseStyle(
                        "font-family:'Hanken Grotesk';font-size:14.5px;color:rgba(255,255,255,.82)"
                      )}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <a
              data-reveal=""
              href="https://www.google.com/maps/search/?api=1&query=Av.%20Nami%20Az%C3%A9m%2C%201093%20-%20Col%C3%B4nia%2C%20Jundia%C3%AD%20-%20SP"
              target="_blank"
              rel="noopener"
              style={parseStyle(
                'display:block;position:relative;border-radius:20px;overflow:hidden;cursor:pointer;text-decoration:none;box-shadow:0 40px 80px -34px rgba(0,0,0,.6);opacity:0;transform:translateY(34px) scale(.98);transition:all 1s cubic-bezier(.16,.84,.44,1) .1s'
              )}
            >
              <img
                className="vg-zoom"
                src={`${IMG}a02.jpg`}
                alt="Mapa da localização do Residencial Vigóre no bairro Colônia, Jundiaí"
                style={parseStyle(
                  'width:100%;height:clamp(380px,46vw,560px);object-fit:cover;transition:transform .9s cubic-bezier(.16,.84,.44,1)'
                )}
              />
              <div
                style={parseStyle(
                  "position:absolute;top:18px;left:18px;background:#F2581E;color:#fff;font-family:'Archivo';font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:9px 16px;border-radius:100px;white-space:nowrap"
                )}
              >
                Vigóre está aqui
              </div>
              <div
                style={parseStyle(
                  'position:absolute;left:18px;right:18px;bottom:18px;display:flex;justify-content:flex-end'
                )}
              >
                <span
                  style={parseStyle(
                    "display:inline-flex;align-items:center;gap:8px;background:rgba(21,17,13,.86);backdrop-filter:blur(6px);color:#fff;font-family:'Archivo';font-weight:700;font-size:12px;letter-spacing:.04em;padding:11px 18px;border-radius:100px"
                  )}
                >
                  Abrir no Google Maps ↗
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section
        id="diferenciais"
        data-screen-label="Diferenciais"
        style={parseStyle(
          'background:#F7F2EA;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px)'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto')}>
          <div style={parseStyle('text-align:center;margin-bottom:clamp(40px,5vw,64px)')}>
            <div
              data-reveal=""
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#C8410F"
                )}
              >
                Diferenciais construtivos
              </span>
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
            </div>
            <h2
              data-reveal=""
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.4vw,58px);line-height:1.02;letter-spacing:-.025em;color:#1a1510;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
              )}
            >
              Pensado nos detalhes
            </h2>
          </div>
          <div
            style={parseStyle(
              'display:grid;grid-template-columns:repeat(3,1fr);gap:16px'
            )}
          >
            {diferenciais.map((d, i) => (
              <div
                key={i}
                data-reveal=""
                style={parseStyle(
                  'display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid #ece3d5;border-radius:14px;padding:22px 22px;opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,.84,.44,1),transform .7s cubic-bezier(.16,.84,.44,1)'
                )}
              >
                <span
                  style={parseStyle(
                    "flex:none;width:30px;height:30px;border-radius:50%;background:#FCEAE0;display:flex;align-items:center;justify-content:center;color:#F2581E;font-weight:800;font-family:'Archivo';font-size:15px;margin-top:1px"
                  )}
                >
                  ✓
                </span>
                <span
                  style={parseStyle(
                    "font-family:'Hanken Grotesk';font-weight:500;font-size:15.5px;line-height:1.45;color:#3d362f"
                  )}
                >
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALERIA ============ */}
      <section
        data-screen-label="Galeria"
        style={parseStyle(
          'background:#15110D;padding:clamp(80px,10vw,130px) clamp(20px,4vw,52px)'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto')}>
          <div style={parseStyle('margin-bottom:clamp(36px,4vw,56px)')}>
            <div
              data-reveal=""
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:20px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#F2581E"
                )}
              >
                Galeria de perspectivas
              </span>
            </div>
            <h2
              data-reveal=""
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:clamp(30px,4.2vw,54px);line-height:1.02;letter-spacing:-.025em;color:#fff;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
              )}
            >
              Imagine viver aqui
            </h2>
          </div>
          <div style={parseStyle('columns:3;column-gap:18px')}>
            <GalleryCard lb={`${IMG}a18.jpg`} cap="Fachada ao entardecer" img={`${IMG}a18.jpg`} alt="Fachada ao entardecer" />
            <GalleryCard lb={`${IMG}a16.jpg`} cap="Hall das torres" img={`${IMG}a16.jpg`} alt="Hall das torres" />
            <GalleryCard lb={`${IMG}a06.jpg`} cap="Salão de festas e espaço gourmet" img={`${IMG}a06.jpg`} alt="Salão de festas e espaço gourmet" />
            <GalleryCard lb={`${IMG}a21.jpg`} cap="Voo de pássaro" img={`${IMG}a21.jpg`} alt="Voo de pássaro" />
            <GalleryCard lb={`${IMG}a12.jpg`} cap="Deck das piscinas" img={`${IMG}a12.jpg`} alt="Deck das piscinas" />
            <GalleryCard lb={`${IMG}a13.jpg`} cap="Lavanderia compartilhada" img={`${IMG}a13.jpg`} alt="Lavanderia compartilhada" />
            <GalleryCard lb={`${IMG}a19.jpg`} cap="Praça de encontros" img={`${IMG}a19.jpg`} alt="Praça de encontros" />
            <GalleryCard lb={`${IMG}a14.jpg`} cap="Mini mercado (Torre B)" img={`${IMG}a14.jpg`} alt="Mini mercado (Torre B)" />
            <GalleryCard lb={`${IMG}a07.jpg`} cap="Acesso e fachada" img={`${IMG}a07.jpg`} alt="Acesso e fachada" />
          </div>
        </div>
      </section>

      {/* ============ SANTA ANGELA ============ */}
      <section
        data-screen-label="Santa Angela"
        style={parseStyle(
          'background:#1b1610;padding:clamp(80px,10vw,130px) clamp(20px,4vw,52px);border-top:1px solid rgba(255,255,255,.06)'
        )}
      >
        <div style={parseStyle('max-width:1100px;margin:0 auto;text-align:center')}>
          <div
            data-reveal=""
            style={parseStyle(
              'display:flex;flex-direction:column;align-items:center;gap:9px;margin:0 auto 30px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
            )}
          >
            <img
              src="https://static.wixstatic.com/media/72b66e_1045ce5fbb2249f898325feaebb01a3f~mv2.png/v1/crop/x_370,y_271,w_1180,h_538,scale_1/santa-angela.png"
              alt="Santa Angela Construtora"
              style={parseStyle(
                'height:clamp(82px,11vw,122px);width:auto;max-width:90%;object-fit:contain'
              )}
            />
          </div>
          <p
            data-reveal=""
            style={parseStyle(
              "font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:clamp(24px,3.4vw,42px);line-height:1.25;color:#fff;max-width:24ch;margin:0 auto 50px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .08s"
            )}
          >
            “Há mais de 40 anos realizando o sonho de morar bem em Jundiaí.”
          </p>
          <div
            style={parseStyle(
              'display:grid;grid-template-columns:repeat(3,1fr);gap:30px;max-width:760px;margin:0 auto'
            )}
          >
            <div
              data-reveal=""
              style={parseStyle(
                'opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .1s'
              )}
            >
              <div
                data-count="40"
                data-prefix="+"
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(34px,4vw,52px);color:#F2581E;line-height:1"
                )}
              >
                +0
              </div>
              <div
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.6);margin-top:6px"
                )}
              >
                anos de mercado
              </div>
            </div>
            <div
              data-reveal=""
              style={parseStyle(
                'opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .18s'
              )}
            >
              <div
                data-count="9800"
                data-prefix="+"
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(34px,4vw,52px);color:#F2581E;line-height:1"
                )}
              >
                +0
              </div>
              <div
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.6);margin-top:6px"
                )}
              >
                unidades entregues
              </div>
            </div>
            <div
              data-reveal=""
              style={parseStyle(
                'opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .26s'
              )}
            >
              <div
                style={parseStyle(
                  "font-family:'Archivo';font-weight:800;font-size:clamp(34px,4vw,52px);color:#F2581E;line-height:1"
                )}
              >
                A
              </div>
              <div
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.6);margin-top:6px"
                )}
              >
                PBQP-H nível A · ISO 9001
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO / CTA ============ */}
      <section
        id="contato"
        data-screen-label="Contato"
        style={parseStyle(
          'position:relative;background:#0e0b08;padding:clamp(80px,10vw,140px) clamp(20px,4vw,52px);overflow:hidden'
        )}
      >
        <div
          style={parseStyle(
            `position:absolute;inset:0;z-index:0;background:url("${IMG}a21.jpg") center/cover no-repeat;opacity:.22`
          )}
        ></div>
        <div
          style={parseStyle(
            'position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(14,11,8,.85),rgba(14,11,8,.96))'
          )}
        ></div>
        <div
          style={parseStyle(
            'position:relative;z-index:2;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center'
          )}
        >
          <div>
            <div
              data-reveal=""
              style={parseStyle(
                'display:inline-flex;align-items:center;gap:11px;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1)'
              )}
            >
              <span style={parseStyle('width:30px;height:1px;background:#F2581E')}></span>
              <span
                style={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:#F2581E"
                )}
              >
                Fale com a gente
              </span>
            </div>
            <h2
              data-reveal=""
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:clamp(32px,4.4vw,56px);line-height:1.02;letter-spacing:-.025em;color:#fff;margin-bottom:22px;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .06s"
              )}
            >
              Agende sua visita ao decorado
            </h2>
            <p
              data-reveal=""
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-weight:400;font-size:17px;line-height:1.7;color:rgba(255,255,255,.72);margin-bottom:30px;max-width:44ch;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .12s"
              )}
            >
              Preencha o formulário e um de nossos consultores entra em contato pelo WhatsApp com
              todas as condições e disponibilidade.
            </p>
            <Hoverable
              as="a"
              data-reveal=""
              href={waMain}
              target="_blank"
              rel="noopener"
              baseStyle={parseStyle(
                "display:inline-flex;align-items:center;gap:12px;font-family:'Archivo';font-weight:700;font-size:15px;color:#fff;background:#25D366;padding:16px 28px;border-radius:100px;text-decoration:none;opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,.84,.44,1) .18s,transform .8s cubic-bezier(.16,.84,.44,1) .18s,filter .25s ease"
              )}
              hoverStyle={parseStyle('filter:brightness(1.08)')}
            >
              <span style={parseStyle('font-size:20px')}>✆</span> Chamar no WhatsApp agora
            </Hoverable>
            <div
              data-reveal=""
              style={parseStyle(
                "margin-top:28px;font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.55);line-height:1.7;opacity:0;transform:translateY(24px);transition:all .8s cubic-bezier(.16,.84,.44,1) .24s"
              )}
            >
              WhatsApp · <span style={parseStyle('color:#fff;font-weight:600')}>(11) 92614-3393</span>
              <br />
              Decorado na Casa Santa Angela · Av. Antônio Frederico Ozanan, 7600
            </div>
          </div>
          <form
            id="vg-form"
            data-reveal=""
            style={parseStyle(
              'background:#fff;border-radius:20px;padding:clamp(26px,3vw,40px);box-shadow:0 40px 90px -30px rgba(0,0,0,.6);opacity:0;transform:translateY(34px);transition:all 1s cubic-bezier(.16,.84,.44,1) .1s'
            )}
          >
            <h3
              style={parseStyle(
                "font-family:'Archivo';font-weight:800;font-size:21px;color:#1a1510;margin-bottom:6px"
              )}
            >
              Quero saber mais
            </h3>
            <p
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-size:14px;color:#8a8073;margin-bottom:22px"
              )}
            >
              É rápido — leva menos de um minuto.
            </p>
            <div style={parseStyle('display:flex;flex-direction:column;gap:14px')}>
              <FocusableInput
                name="nome"
                required
                placeholder="Seu nome"
                baseStyle={parseStyle(INPUT_BASE)}
                focusStyle={parseStyle(INPUT_FOCUS)}
              />
              <FocusableInput
                name="email"
                type="email"
                required
                placeholder="Seu e-mail"
                baseStyle={parseStyle(INPUT_BASE)}
                focusStyle={parseStyle(INPUT_FOCUS)}
              />
              <FocusableInput
                name="whatsapp"
                required
                placeholder="Seu WhatsApp (com DDD)"
                baseStyle={parseStyle(INPUT_BASE)}
                focusStyle={parseStyle(INPUT_FOCUS)}
              />
              <select
                name="horario"
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:15px;padding:14px 16px;border:1px solid #e2d8c8;border-radius:11px;background:#faf7f1;color:#1a1510;outline:none"
                )}
              >
                <option value="">Melhor horário para contato</option>
                <option>Dias de semana pela manhã</option>
                <option>Dias de semana à tarde</option>
                <option>Dias de semana à noite</option>
                <option>Final de semana pela manhã</option>
                <option>Final de semana à tarde</option>
              </select>
              <Hoverable
                as="button"
                type="submit"
                baseStyle={parseStyle(
                  "font-family:'Archivo';font-weight:700;font-size:15px;letter-spacing:.03em;text-transform:uppercase;color:#fff;background:#F2581E;border:none;padding:16px;border-radius:11px;cursor:pointer;transition:background .25s ease,transform .2s ease;margin-top:4px"
                )}
                hoverStyle={parseStyle('background:#d8430c;transform:translateY(-2px)')}
              >
                Enviar pelo WhatsApp
              </Hoverable>
            </div>
            <p
              style={parseStyle(
                "font-family:'Hanken Grotesk';font-size:11.5px;color:#a89e90;margin-top:14px;line-height:1.5"
              )}
            >
              Ao enviar, você autoriza o contato de consultores, inclusive por WhatsApp, para
              informações sobre o empreendimento.
            </p>
          </form>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        style={parseStyle(
          'background:#15110D;padding:clamp(50px,6vw,70px) clamp(20px,4vw,52px) 40px;border-top:1px solid rgba(255,255,255,.07)'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto')}>
          <div
            style={parseStyle(
              'display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:30px;padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,.08)'
            )}
          >
            <div style={parseStyle('max-width:340px')}>
              <img
                src={LOGO_WEBP}
                alt="Residencial Vigóre"
                style={parseStyle('height:38px;width:auto;margin-bottom:18px')}
              />
              <p
                style={parseStyle(
                  "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.55);line-height:1.6"
                )}
              >
                Apartamentos de 2 dormitórios com lazer completo no bairro Colônia, em Jundiaí/SP.
                Um empreendimento Construtora Santa Angela.
              </p>
            </div>
            <div style={parseStyle('display:flex;gap:clamp(36px,6vw,80px);flex-wrap:wrap')}>
              <div>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:700;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#F2581E;margin-bottom:14px"
                  )}
                >
                  Navegação
                </div>
                <div style={parseStyle('display:flex;flex-direction:column;gap:9px')}>
                  <a
                    href="#empreendimento"
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7);text-decoration:none"
                    )}
                  >
                    O Empreendimento
                  </a>
                  <a
                    href="#lazer"
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7);text-decoration:none"
                    )}
                  >
                    Lazer
                  </a>
                  <a
                    href="#plantas"
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7);text-decoration:none"
                    )}
                  >
                    Plantas
                  </a>
                  <a
                    href="#localizacao"
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7);text-decoration:none"
                    )}
                  >
                    Localização
                  </a>
                </div>
              </div>
              <div>
                <div
                  style={parseStyle(
                    "font-family:'Archivo';font-weight:700;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#F2581E;margin-bottom:14px"
                  )}
                >
                  Contato
                </div>
                <div style={parseStyle('display:flex;flex-direction:column;gap:9px')}>
                  <a
                    href={waMain}
                    target="_blank"
                    rel="noopener"
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7);text-decoration:none"
                    )}
                  >
                    WhatsApp (11) 92614-3393
                  </a>
                  <span
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7)"
                    )}
                  >
                    Av. Nami Azém, 1093 — Colônia
                  </span>
                  <span
                    style={parseStyle(
                      "font-family:'Hanken Grotesk';font-size:14px;color:rgba(255,255,255,.7)"
                    )}
                  >
                    Jundiaí — São Paulo
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-size:11px;color:rgba(255,255,255,.32);line-height:1.6;margin-top:26px;max-width:none"
            )}
          >
            *Valor a partir de R$ 395.948,71 referente a apartamento da Torre A, 53 m², tabela de
            maio/2026, sujeito a alteração sem aviso prévio. As informações constantes no Memorial
            de Incorporação e nos futuros Instrumentos de Compra e Venda prevalecerão sobre as
            divulgadas neste material. Todas as imagens e perspectivas são meramente ilustrativas.
            Os móveis e utensílios são sugestões de decoração e não fazem parte do contrato de
            aquisição. As medidas dos apartamentos são internas e de face a face. Incorporação
            registrada em 28 de março de 2025 no R.4 da matrícula nº 179.120 do 1º Oficial de
            Registro de Imóveis da Comarca de Jundiaí/SP.
          </p>
          <p
            style={parseStyle(
              "font-family:'Hanken Grotesk';font-size:12px;color:rgba(255,255,255,.4);margin-top:22px"
            )}
          >
            © 2026 Imobiliária Lotus Brokers — Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* floating whatsapp */}
      <a
        href={waMain}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        style={parseStyle(
          'position:fixed;right:22px;bottom:22px;z-index:80;width:60px;height:60px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 14px 34px -8px rgba(37,211,102,.6);animation:vgPulse 2.6s infinite'
        )}
      >
        <svg viewBox="0 0 32 32" width="32" height="32" fill="#fff">
          <path d="M16.04 6.4a9.6 9.6 0 0 0-8.2 14.62L6.4 26.4l5.5-1.42a9.6 9.6 0 1 0 4.14-18.58Zm0 1.75a7.85 7.85 0 0 1 6.66 12.05.8.8 0 0 0-.1.6l.84 3.07-3.16-.83a.8.8 0 0 0-.6.08 7.85 7.85 0 1 1-3.64-14.99Zm-2.3 3.4c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26 0 1.33.97 2.62 1.1 2.8.14.18 1.9 2.9 4.6 3.96 2.25.88 2.7.7 3.2.66.5-.05 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31-.27-.14-1.6-.79-1.84-.88-.25-.09-.43-.13-.6.14-.18.27-.7.88-.85 1.06-.16.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.6-1.47-.83-2.01-.22-.53-.44-.46-.6-.46Z"></path>
        </svg>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes de card (repetição idêntica no estático)            */
/* ------------------------------------------------------------------ */

function AmenityCard({
  lb,
  cap,
  img,
  alt,
  tag,
  title,
}: {
  lb: string;
  cap: string;
  img: string;
  alt: string;
  tag: string;
  title: string;
}) {
  return (
    <div
      data-reveal=""
      data-lb={lb}
      data-cap={cap}
      style={parseStyle(
        'position:relative;border-radius:16px;overflow:hidden;cursor:pointer;aspect-ratio:3/3.7;background:#211a13;opacity:0;transform:translateY(30px);transition:opacity .8s cubic-bezier(.16,.84,.44,1),transform .8s cubic-bezier(.16,.84,.44,1)'
      )}
    >
      <img
        className="vg-zoom"
        src={img}
        alt={alt}
        style={parseStyle(
          'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.16,.84,.44,1)'
        )}
      />
      <div
        style={parseStyle(
          'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(0,0,0,.8) 100%)'
        )}
      ></div>
      <div style={parseStyle('position:absolute;left:16px;right:16px;bottom:15px')}>
        <div
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#F2581E;margin-bottom:4px"
          )}
        >
          {tag}
        </div>
        <h3
          style={parseStyle(
            "font-family:'Archivo';font-weight:700;font-size:17px;color:#fff;line-height:1.1"
          )}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}

function GalleryCard({
  lb,
  cap,
  img,
  alt,
}: {
  lb: string;
  cap: string;
  img: string;
  alt: string;
}) {
  return (
    <div
      data-reveal=""
      data-lb={lb}
      data-cap={cap}
      style={parseStyle(
        'break-inside:avoid;margin-bottom:18px;border-radius:14px;overflow:hidden;cursor:pointer;position:relative;opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.16,.84,.44,1),transform .8s cubic-bezier(.16,.84,.44,1)'
      )}
    >
      <img
        className="vg-zoom"
        src={img}
        alt={alt}
        style={parseStyle(
          'width:100%;object-fit:cover;transition:transform .9s cubic-bezier(.16,.84,.44,1)'
        )}
      />
      <div
        className="vg-galov"
        style={parseStyle(
          'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 60%,rgba(0,0,0,.6) 100%);opacity:0;transition:opacity .4s ease'
        )}
      ></div>
      <span
        className="vg-galcap"
        style={parseStyle(
          "position:absolute;left:16px;bottom:13px;font-family:'Archivo';font-weight:700;font-size:13px;color:#fff;opacity:0;transition:opacity .4s ease"
        )}
      >
        {cap}
      </span>
    </div>
  );
}
