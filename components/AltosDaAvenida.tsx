'use client';

/**
 * AltosDaAvenida — porte 1:1 de altos-da-avenida/index.html (dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded do script.
 *
 * Convenções de porte (mesmas de LotusHome.tsx):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - style-focus="css"    -> <Focusable> (aplica no focus, remove no blur)
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *  - data-counter         -> IntersectionObserver + requestAnimationFrame
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - imgs com data-src    -> <img src> direto (resultado visual idêntico)
 */

import Link from 'next/link';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Converte string CSS ("a:b;c:d") em React.CSSProperties.
 * camelCase; -webkit- -> Webkit; split apenas no PRIMEIRO ":" de cada
 * declaração (gradientes / data: URIs contêm ":" internos).
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

type FocusableProps<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  baseStyle: CSSProperties;
  focusStyle: CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<T>, 'style'>;

/** style-focus do dc-runtime: focusStyle vira :focus (aplica no focus, remove no blur). */
function Focusable<T extends keyof React.JSX.IntrinsicElements = 'input'>({
  as,
  baseStyle,
  focusStyle,
  ...rest
}: FocusableProps<T>) {
  const [focus, setFocus] = useState(false);
  const Tag = (as || 'input') as React.ElementType;
  return (
    <Tag
      {...rest}
      style={focus ? { ...baseStyle, ...focusStyle } : baseStyle}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores EXATOS do script dc-runtime)              */
/* ------------------------------------------------------------------ */

// Base dos assets: hospedados no GitHub Pages (mesma origem do estático).
const A = '/altos-da-avenida/';

const WHATSAPP_DEFAULT = '5511926143393';
const PHONE_DISPLAY_DEFAULT = '(11) 92614-3393';

type Planta = {
  m: string;
  dorms: string;
  desc: string;
  features: string[];
  img: string;
};

const PLANTAS: Planta[] = [
  { m: '58', dorms: '2 dormitórios', desc: 'Planta inteligente e funcional, com estar integrado à cozinha e varanda — perfeita para quem busca o primeiro lar com a qualidade Santa Angela.', features: ['2 dormitórios', 'Varanda', 'Estar integrado'], img: A + 'assets/planta_58.jpg' },
  { m: '68', dorms: '2 dormitórios, sendo 1 suíte', desc: 'Mais espaço e conforto, com suíte, varanda e ambientes amplos e bem distribuídos para o dia a dia da família.', features: ['1 suíte', 'Varanda', 'Lavabo'], img: A + 'assets/planta_68.jpg' },
  { m: '96', dorms: '3 dormitórios, sendo 1 suíte', desc: 'Três dormitórios, lavabo e varanda gourmet integrada ao living — espaço de sobra para receber e viver bem.', features: ['1 suíte', 'Varanda gourmet', 'Lavabo'], img: A + 'assets/planta_96.jpg' },
  { m: '105', dorms: '3 dormitórios + home office', desc: 'A planta mais completa: suíte com closet, home office e varanda gourmet. Pensada para quem não abre mão de espaço e sofisticação.', features: ['Suíte c/ closet', 'Home office', 'Varanda gourmet'], img: A + 'assets/planta_105.jpg' },
];

type GalleryItem = {
  img: string;
  title: string;
  tag: string;
  alt: string;
  colSpan: number;
  rowSpan: number;
};

const GAL: GalleryItem[] = [
  { img: A + 'assets/piscina.jpg', title: 'Piscina adulto e infantil', tag: 'Lazer', alt: 'Piscina do Altos da Avenida', colSpan: 6, rowSpan: 2 },
  { img: A + 'assets/quadra.jpg', title: 'Quadra poliesportiva', tag: 'Esporte', alt: 'Quadra poliesportiva', colSpan: 3, rowSpan: 1 },
  { img: A + 'assets/playground.jpg', title: 'Playground', tag: 'Crianças', alt: 'Playground', colSpan: 3, rowSpan: 1 },
  { img: A + 'assets/salao_festas.jpg', title: 'Salão de festas', tag: 'Convivência', alt: 'Salão de festas', colSpan: 3, rowSpan: 1 },
  { img: A + 'assets/gourmet.jpg', title: 'Espaço gourmet', tag: 'Convivência', alt: 'Espaço gourmet com vista', colSpan: 3, rowSpan: 1 },
  { img: A + 'assets/academia.jpg', title: 'Academia', tag: 'Fitness', alt: 'Academia equipada', colSpan: 4, rowSpan: 1 },
  { img: A + 'assets/salao_jogos.jpg', title: 'Salão de jogos', tag: 'Diversão', alt: 'Salão de jogos', colSpan: 4, rowSpan: 1 },
  { img: A + 'assets/gamer.jpg', title: 'Espaço gamer', tag: 'Diversão', alt: 'Espaço gamer', colSpan: 4, rowSpan: 1 },
  { img: A + 'assets/coworking.jpg', title: 'Coworking & estudo', tag: 'Trabalho', alt: 'Espaço coworking e estudo', colSpan: 4, rowSpan: 1 },
  { img: A + 'assets/lounge.jpg', title: 'Lounge & convivência', tag: 'Relax', alt: 'Lounge de convivência', colSpan: 4, rowSpan: 1 },
  { img: A + 'assets/brinquedoteca.jpg', title: 'Brinquedoteca', tag: 'Crianças', alt: 'Brinquedoteca', colSpan: 4, rowSpan: 1 },
];

const AMEN = ['Piscina adulto e infantil', 'Salão de festas', '2 churrasqueiras', 'Academia', 'Fitness externo', 'Espaço bem-estar', 'Coworking', 'Salão de jogos', 'Espaço gamer', 'Quadra poliesportiva', 'Playground 6 a 10 anos', 'Espaço baby', 'Espaço pet', 'Vestiários', 'Áreas comuns decoradas', 'Espaços de convivência'];

const DIF_APTO = [
  'Pé-direito de 2,70m nos apartamentos',
  'Esquadrias de alumínio preto sob medida, com persiana integrada',
  'Bancadas dos banheiros em mármore travertino',
  'Pias da cozinha e varanda em granito verde ubatuba',
  'Ralo linear nos banheiros e varanda',
  'Infraestrutura para ar-condicionado, Wi-Fi e automação',
  'Infraestrutura para sonorização na varanda',
  'Aquecimento de água a gás natural e medidores individualizados',
];

const DIF_COMUM = [
  'Microgeração de energia fotovoltaica',
  'Energia elétrica subterrânea',
  'Piscina com infraestrutura para climatização',
  'Sensores de presença em halls e elevadores',
  'Sistema de som nas churrasqueiras e salão de festas',
  'Iluminação em LED nas áreas comuns',
  'Sistema de irrigação para os jardins',
  'Infraestrutura para Wi-Fi nas áreas de lazer',
];

const CERTS = ['PBQP-H 2018 · Nível A', 'ISO 9001:2015', 'NBR 15575 · Desempenho', 'NBR 9050 · Acessibilidade', 'NBR 16071 · Playground'];

const FAQS = [
  { q: 'Onde fica o Altos da Avenida?', a: 'Na Avenida Samuel Martins, Jardim do Lago, em Jundiaí/SP — a cerca de 10 minutos da Rodovia Anhanguera e 15 minutos do Centro de Jundiaí, com escolas, padarias, mercados, bares e restaurantes por perto.' },
  { q: 'Quais são as metragens e plantas disponíveis?', a: 'São apartamentos de 58, 68, 96 e 105m², com opções de 2 ou 3 dormitórios e suíte. Fale com a Imobiliária Lotus Brokers para conferir a disponibilidade de cada torre.' },
  { q: 'O empreendimento tem área de lazer?', a: 'Sim, lazer completo: piscina adulto e infantil, academia, fitness externo, salão de festas, coworking, salão de jogos, espaço gamer, quadra poliesportiva, playground, espaço baby, espaço pet, bem-estar, 2 churrasqueiras e muito mais.' },
  { q: 'Qual é o status da obra?', a: 'O Altos da Avenida é um empreendimento da Construtora Santa Angela atualmente em construção. Consulte a Imobiliária Lotus Brokers para informações atualizadas sobre prazos.' },
  { q: 'Quem é a construtora?', a: 'A Construtora Santa Angela atua há mais de 40 anos em Jundiaí, Americana e Itatiba, com mais de 9.800 unidades entregues e certificações de qualidade como PBQP-H nível A e ISO 9001:2015.' },
  { q: 'Como faço para visitar ou saber os valores?', a: 'É só preencher o formulário desta página ou clicar no botão do WhatsApp. Um especialista da Imobiliária Lotus Brokers vai te atender e passar valores, condições e disponibilidade.' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function AltosDaAvenida({
  whatsapp = WHATSAPP_DEFAULT,
  phoneDisplay = PHONE_DISPLAY_DEFAULT,
}: {
  whatsapp?: string;
  phoneDisplay?: string;
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [navOpen, setNavOpen] = useState(false);
  const [plantaIdx, setPlantaIdx] = useState(0);
  const [plantaFade, setPlantaFade] = useState(1);
  const [faqOpen, setFaqOpen] = useState(0);
  const [lbList, setLbList] = useState<Array<{ src: string; alt: string }>>([]);
  const [lbIdx, setLbIdx] = useState(-1);

  // refs
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const plantaFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Espelhos de estado acessíveis dentro dos listeners nativos (sem re-bind).
  const lbListRef = useRef(lbList);
  const lbIdxRef = useRef(lbIdx);
  lbListRef.current = lbList;
  lbIdxRef.current = lbIdx;

  // wa(extra) — lógica EXATA do script.
  const wa = (extra?: string) => {
    const num = (whatsapp || WHATSAPP_DEFAULT).replace(/\D/g, '');
    const base = 'Olá! Vi a página do Altos da Avenida (Imobiliária Lotus Brokers) e gostaria de mais informações';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(extra ? base + ' ' + extra + '.' : base + '.');
  };

  const waLink = wa();
  const waLinkPlanta = wa('sobre a planta de ' + PLANTAS[plantaIdx].m + 'm²');

  /* -------- selectPlanta: fade-out .22s, troca, fade-in (idêntico) -------- */
  const selectPlanta = (i: number) => {
    if (i === plantaIdx) return;
    setPlantaFade(0);
    if (plantaFadeTimer.current) clearTimeout(plantaFadeTimer.current);
    plantaFadeTimer.current = setTimeout(() => {
      setPlantaIdx(i);
      setPlantaFade(1);
    }, 220);
  };

  const toggleFaq = (i: number) => setFaqOpen((s) => (s === i ? -1 : i));

  const toggleNav = () => setNavOpen((s) => !s);
  const navCta = () => {
    if (navOpen) setNavOpen(false);
  };

  /* -------- lightbox (body overflow lock; prev/next circular) -------- */
  const openLightbox = (list: Array<{ src: string; alt: string }>, idx: number) => {
    document.body.style.overflow = 'hidden';
    setLbList(list);
    setLbIdx(idx);
  };
  const closeLightbox = () => {
    document.body.style.overflow = '';
    setLbIdx(-1);
  };
  const lbPrev = (e?: { stopPropagation?: () => void }) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLbIdx((s) => {
      const n = lbListRef.current.length;
      return n ? (s - 1 + n) % n : s;
    });
  };
  const lbNext = (e?: { stopPropagation?: () => void }) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLbIdx((s) => {
      const n = lbListRef.current.length;
      return n ? (s + 1) % n : s;
    });
  };
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  /* -------- componentDidMount: scroll header, reveal, counters, responsive, keys -------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- scroll: header restyle (lógica EXATA do _onScroll) ---
    const onScroll = () => {
      const h = headerRef.current;
      if (!h) return;
      const sc = window.scrollY > 40;
      if (sc) {
        h.style.background = 'rgba(246,241,232,.96)';
        h.style.boxShadow = '0 6px 30px rgba(23,63,49,.1)';
        h.style.padding = '12px clamp(20px,4vw,64px)';
        h.style.backdropFilter = 'blur(10px)';
        h.querySelectorAll<HTMLElement>('a[href^="#"]').forEach((a) => {
          if (!a.dataset.cta) a.style.color = '#173f31';
        });
        h.querySelectorAll<HTMLElement>('[data-mob-btn] span').forEach((s) => (s.style.background = '#173f31'));
        const div = h.querySelector<HTMLElement>('a[href="#topo"] span:nth-child(2)');
        if (div) div.style.background = 'rgba(23,63,49,.2)';
        const lbl = h.querySelector<HTMLElement>('a[href="#topo"] span:last-child');
        if (lbl) lbl.style.color = '#6f665b';
      } else {
        h.style.background = 'linear-gradient(180deg,rgba(15,38,30,.55),rgba(15,38,30,0))';
        h.style.boxShadow = 'none';
        h.style.padding = '22px clamp(20px,4vw,64px)';
        h.style.backdropFilter = 'none';
        h.querySelectorAll<HTMLElement>('a[href^="#"]').forEach((a) => {
          if (!a.dataset.cta) a.style.color = '#fff';
        });
        h.querySelectorAll<HTMLElement>('[data-mob-btn] span').forEach((s) => (s.style.background = '#fff'));
        const div = h.querySelector<HTMLElement>('a[href="#topo"] span:nth-child(2)');
        if (div) div.style.background = 'rgba(255,255,255,.28)';
        const lbl = h.querySelector<HTMLElement>('a[href="#topo"] span:last-child');
        if (lbl) lbl.style.color = 'rgba(255,255,255,.82)';
      }
    };
    // marca o link CTA para não recolori-lo (data-cta='1')
    const h = headerRef.current;
    if (h) {
      const cta = h.querySelector<HTMLElement>('a[href="#contato"]');
      if (cta) cta.dataset.cta = '1';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- reveal on scroll (delay por elemento; threshold .12, rootMargin -8%) ---
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    els.forEach((e) => {
      const d = e.getAttribute('data-reveal-delay') || 0;
      e.style.opacity = '0';
      e.style.transform = 'translateY(34px)';
      e.style.transition =
        'opacity .9s cubic-bezier(.16,1,.3,1) ' + d + 'ms, transform .9s cubic-bezier(.16,1,.3,1) ' + d + 'ms';
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            (en.target as HTMLElement).style.opacity = '1';
            (en.target as HTMLElement).style.transform = 'none';
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((e) => io.observe(e));
    // rede de segurança do estático: força visível após 1000ms
    const revealFallback = setTimeout(() => {
      els.forEach((e) => {
        e.style.opacity = '1';
        e.style.transform = 'none';
      });
    }, 1000);

    // --- counters (rAF; threshold .5; toLocaleString pt-BR >= 1000) ---
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const tgt = parseInt(en.target.getAttribute('data-counter') || '0', 10);
            const span = en.target.querySelector<HTMLElement>('[data-count-target]');
            if (span) {
              const dur = 1400;
              const t0 = performance.now();
              const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('pt-BR') : String(n));
              const tick = (now: number) => {
                const p = Math.min(1, (now - t0) / dur);
                const e2 = 1 - Math.pow(1 - p, 3);
                span.textContent = fmt(Math.round(tgt * e2));
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }
            co.unobserve(en.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    root.querySelectorAll('[data-counter]').forEach((e) => co.observe(e));

    // --- responsive (_applyResponsive; breakpoints 900 e 1200) ---
    const applyResponsive = () => {
      const w = window.innerWidth;
      const mob = w < 900;
      const desk = root.querySelector<HTMLElement>('[data-desk-nav]');
      const mbtn = root.querySelector<HTMLElement>('[data-mob-btn]');
      if (desk) desk.style.display = mob ? 'none' : 'flex';
      if (mbtn) mbtn.style.display = mob ? 'flex' : 'none';
      root.querySelectorAll<HTMLElement>('[data-grid-2]').forEach((g) => (g.style.gridTemplateColumns = mob ? '1fr' : ''));
      const gp = root.querySelector<HTMLElement>('[data-grid-planta]');
      if (gp) gp.style.gridTemplateColumns = mob ? '1fr' : '1.35fr .85fr';
      root.querySelectorAll<HTMLElement>('[data-grid-3]').forEach((g) => (g.style.gridTemplateColumns = mob ? '1fr' : 'repeat(3,1fr)'));
      const amen = root.querySelector<HTMLElement>('[data-grid-amen]');
      if (amen) amen.style.gridTemplateColumns = mob ? '1fr' : w < 1200 ? 'repeat(2,1fr)' : 'repeat(4,1fr)';
      const gal = root.querySelector<HTMLElement>('[data-gallery-grid]');
      if (gal) {
        gal.style.gridTemplateColumns = mob ? 'repeat(2,1fr)' : 'repeat(12,1fr)';
        gal.style.gridAutoRows = mob ? '160px' : '240px';
      }
    };
    applyResponsive();
    const onResize = () => applyResponsive();
    window.addEventListener('resize', onResize);

    // --- keyboard (Esc fecha, setas navegam) usando refs de estado ---
    const onKey = (e: KeyboardEvent) => {
      if (lbIdxRef.current < 0) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lbPrev();
      else if (e.key === 'ArrowRight') lbNext();
    };
    window.addEventListener('keydown', onKey);

    // --- cleanup (componentWillUnmount) ---
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      io.disconnect();
      co.disconnect();
      clearTimeout(revealFallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derivados de estado (render context)
  const activePlanta = PLANTAS[plantaIdx];
  const lb = lbIdx >= 0 && lbList[lbIdx] ? lbList[lbIdx] : null;
  const lbHasPrev = lbList.length > 1;

  const galleryOpen = (i: number) =>
    openLightbox(
      GAL.map((x) => ({ src: x.img, alt: x.title })),
      i
    );
  const openPlanta = () =>
    openLightbox(
      PLANTAS.map((p) => ({ src: p.img, alt: 'Planta do apartamento de ' + p.m + 'm² — ' + p.dorms })),
      plantaIdx
    );

  const submitWhats = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const nome = (f.elements.namedItem('nome') as HTMLInputElement).value;
    const tel = (f.elements.namedItem('telefone') as HTMLInputElement).value;
    const met = (f.elements.namedItem('metragem') as HTMLSelectElement).value;
    const num = (whatsapp || WHATSAPP_DEFAULT).replace(/\D/g, '');
    const txt =
      'Olá! Tenho interesse no Altos da Avenida (via Imobiliária Lotus Brokers).%0A%0A*Nome:* ' +
      encodeURIComponent(nome) +
      '%0A*WhatsApp:* ' +
      encodeURIComponent(tel) +
      '%0A*Interesse:* ' +
      encodeURIComponent(met);
    window.open('https://wa.me/' + num + '?text=' + txt, '_blank');
  };

  return (
    <div ref={rootRef} className="ada-root" style={parseStyle('position:relative; width:100%; overflow:hidden; background:#f6f1e8;')}>
      {/* ============ NAV ============ */}
      <header
        ref={headerRef}
        style={parseStyle(
          'position:fixed; top:0; left:0; right:0; z-index:120; transition:background .45s ease, box-shadow .45s ease, padding .45s ease, backdrop-filter .45s ease; padding:22px clamp(20px,4vw,64px); background:linear-gradient(180deg,rgba(15,38,30,.55),rgba(15,38,30,0));'
        )}
      >
        <nav style={parseStyle('max-width:1340px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:24px;')}>
          <a href="#topo" style={parseStyle('display:flex; align-items:center; gap:14px; text-decoration:none; flex-shrink:0;')}>
            <img src={A + 'a001.png'} alt="Altos da Avenida" style={parseStyle('height:46px; width:auto; object-fit:contain;')} />
            <span style={parseStyle('display:block; width:1px; height:30px; background:rgba(255,255,255,.28);')}></span>
            <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:rgba(255,255,255,.82); line-height:1.3;")}>Imobiliária<br />Lotus Brokers</span>
          </a>
          <div style={parseStyle('display:flex; align-items:center; gap:34px;')} data-desk-nav="">
            <Hoverable as="a" href="#empreendimento" baseStyle={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.13em; text-transform:uppercase; color:#fff; text-decoration:none; opacity:.9; transition:opacity .25s;")} hoverStyle={parseStyle('opacity:1;')}>O Empreendimento</Hoverable>
            <Hoverable as="a" href="#localizacao" baseStyle={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.13em; text-transform:uppercase; color:#fff; text-decoration:none; opacity:.9; transition:opacity .25s;")} hoverStyle={parseStyle('opacity:1;')}>Localização</Hoverable>
            <Hoverable as="a" href="#lazer" baseStyle={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.13em; text-transform:uppercase; color:#fff; text-decoration:none; opacity:.9; transition:opacity .25s;")} hoverStyle={parseStyle('opacity:1;')}>Lazer</Hoverable>
            <Hoverable as="a" href="#plantas" baseStyle={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.13em; text-transform:uppercase; color:#fff; text-decoration:none; opacity:.9; transition:opacity .25s;")} hoverStyle={parseStyle('opacity:1;')}>Plantas</Hoverable>
            <Hoverable as="a" href="#contato" onClick={navCta} baseStyle={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.1em; text-transform:uppercase; color:#fff; text-decoration:none; background:#bd6a45; padding:13px 26px; border-radius:40px; transition:transform .25s, box-shadow .25s, background .25s; box-shadow:0 8px 24px rgba(189,106,69,.35);")} hoverStyle={parseStyle('transform:translateY(-2px); box-shadow:0 12px 30px rgba(189,106,69,.5);')}>Quero saber mais</Hoverable>
          </div>
          <button onClick={toggleNav} aria-label="Menu" style={parseStyle('display:none; background:none; border:none; cursor:pointer; padding:8px; flex-direction:column; gap:5px;')} data-mob-btn="">
            <span style={parseStyle('display:block; width:26px; height:2px; background:#fff;')}></span>
            <span style={parseStyle('display:block; width:26px; height:2px; background:#fff;')}></span>
            <span style={parseStyle('display:block; width:26px; height:2px; background:#fff;')}></span>
          </button>
        </nav>
      </header>

      {/* mobile drawer */}
      <div
        style={{
          ...parseStyle('position:fixed; inset:0; z-index:130; background:#15281e; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:30px; transition:opacity .4s ease, visibility .4s ease;'),
          opacity: navOpen ? 1 : 0,
          visibility: navOpen ? 'visible' : 'hidden',
        }}
      >
        <button onClick={toggleNav} aria-label="Fechar" style={parseStyle('position:absolute; top:26px; right:26px; background:none; border:none; color:#fff; font-size:34px; cursor:pointer; line-height:1;')}>×</button>
        <img src={A + 'a001.png'} alt="Altos da Avenida" style={parseStyle('height:54px; margin-bottom:10px;')} />
        <a href="#empreendimento" onClick={toggleNav} style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; color:#fff; text-decoration:none;")}>O Empreendimento</a>
        <a href="#localizacao" onClick={toggleNav} style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; color:#fff; text-decoration:none;")}>Localização</a>
        <a href="#lazer" onClick={toggleNav} style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; color:#fff; text-decoration:none;")}>Lazer</a>
        <a href="#plantas" onClick={toggleNav} style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; color:#fff; text-decoration:none;")}>Plantas</a>
        <a href="#contato" onClick={toggleNav} style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; letter-spacing:.1em; text-transform:uppercase; color:#fff; text-decoration:none; background:#bd6a45; padding:15px 34px; border-radius:40px; margin-top:8px;")}>Quero saber mais</a>
      </div>

      {/* ============ HERO ============ */}
      <section id="topo" data-screen-label="Hero" style={parseStyle('position:relative; min-height:680px; height:90vh; max-height:900px; display:flex; flex-direction:column; justify-content:center; overflow:hidden;')}>
        <div style={parseStyle('position:absolute; inset:0; z-index:0;')}>
          <img src={A + 'a005.png'} alt="Piscina do Altos da Avenida ao entardecer" style={parseStyle('width:100%; height:100%; object-fit:cover; animation:adKenBurns 22s ease-in-out infinite alternate;')} />
        </div>
        <div style={parseStyle('position:absolute; inset:0; z-index:1; background:linear-gradient(105deg,rgba(13,33,25,.86) 0%,rgba(13,33,25,.6) 38%,rgba(13,33,25,.18) 70%,rgba(189,106,69,.12) 100%);')}></div>
        <div style={parseStyle('position:absolute; inset:0; z-index:1; background:linear-gradient(0deg,rgba(13,33,25,.7) 0%,rgba(13,33,25,0) 35%);')}></div>

        <div style={parseStyle('position:relative; z-index:2; flex:1; display:flex; align-items:center; width:100%;')}>
          <div style={parseStyle('max-width:1340px; margin:0 auto; padding:120px clamp(20px,4vw,64px) 40px; width:100%; box-sizing:border-box;')}>
          <div style={parseStyle('max-width:720px;')}>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:26px;')}>
              <span style={parseStyle('width:30px; height:1px; background:#d6a98c;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#e6cdba;")}>Lançamento · Jardim do Lago · Jundiaí</span>
            </div>
            <h1 style={parseStyle('margin:0; color:#fff; line-height:.96;')}>
              <span data-reveal="" data-reveal-delay="80" style={parseStyle("display:block; font-family:'Sacramento',cursive; font-size:clamp(46px,7vw,92px); color:#e9b896; font-weight:400; line-height:.9; margin-bottom:-4px;")}>Viva os seus</span>
              <span data-reveal="" data-reveal-delay="160" style={parseStyle("display:block; font-family:'Cormorant Garamond',serif; font-size:clamp(58px,11vw,148px); font-weight:600; letter-spacing:-.01em;")}>Altos momentos</span>
            </h1>
            <p data-reveal="" data-reveal-delay="240" style={parseStyle('margin:30px 0 0; max-width:560px; font-size:clamp(16px,1.5vw,20px); line-height:1.65; color:rgba(255,255,255,.9); font-weight:400;')}>
              Apartamentos de <strong style={parseStyle('font-weight:600;')}>58 a 105m²</strong>, com 2 ou 3 dormitórios e opção de suíte — numa das melhores localizações de Jundiaí, com lazer completo para toda a família.
            </p>
            <div data-reveal="" data-reveal-delay="320" style={parseStyle('display:flex; flex-wrap:wrap; gap:16px; margin-top:42px;')}>
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle("display:inline-flex; align-items:center; gap:11px; font-family:'Barlow Semi Condensed',sans-serif; font-size:16px; letter-spacing:.08em; text-transform:uppercase; color:#fff; text-decoration:none; background:#bd6a45; padding:18px 34px; border-radius:46px; box-shadow:0 14px 34px rgba(189,106,69,.42); transition:transform .3s, box-shadow .3s;")} hoverStyle={parseStyle('transform:translateY(-3px); box-shadow:0 20px 44px rgba(189,106,69,.55);')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.5 14.2c-.23.66-1.34 1.26-1.85 1.3-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8s.7-1.98.95-2.25a1 1 0 0 1 .72-.34l.52.01c.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.22 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.16 1.32Z"></path></svg>
                Falar no WhatsApp
              </Hoverable>
              <Hoverable as="a" href="#empreendimento" baseStyle={parseStyle("display:inline-flex; align-items:center; gap:10px; font-family:'Barlow Semi Condensed',sans-serif; font-size:16px; letter-spacing:.08em; text-transform:uppercase; color:#fff; text-decoration:none; padding:18px 30px; border-radius:46px; border:1px solid rgba(255,255,255,.45); transition:background .3s, border-color .3s;")} hoverStyle={parseStyle('background:rgba(255,255,255,.12); border-color:#fff;')}>Conhecer o projeto</Hoverable>
            </div>
          </div>
          </div>
        </div>

        {/* hero facts strip — no fluxo (margin-top:auto cola na base sem sobrepor o conteúdo) */}
        <div data-reveal="" data-reveal-delay="400" style={parseStyle('position:relative; z-index:3; margin-top:auto; background:rgba(13,33,25,.42); backdrop-filter:blur(6px); border-top:1px solid rgba(255,255,255,.14);')}>
          <div style={parseStyle('max-width:1340px; margin:0 auto; padding:0 clamp(20px,4vw,64px); display:flex; flex-wrap:wrap;')}>
            <div style={parseStyle('flex:1; min-width:160px; padding:22px 8px; display:flex; flex-direction:column; gap:3px; border-right:1px solid rgba(255,255,255,.12);')}>
              <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#fff; line-height:1;")}>58–105m²</span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e6cdba;")}>Metragens</span>
            </div>
            <div style={parseStyle('flex:1; min-width:160px; padding:22px 8px; display:flex; flex-direction:column; gap:3px; border-right:1px solid rgba(255,255,255,.12);')}>
              <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#fff; line-height:1;")}>2 e 3 dorms</span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e6cdba;")}>Com opção de suíte</span>
            </div>
            <div style={parseStyle('flex:1; min-width:160px; padding:22px 8px; display:flex; flex-direction:column; gap:3px; border-right:1px solid rgba(255,255,255,.12);')}>
              <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#fff; line-height:1;")}>10 min</span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e6cdba;")}>Da Rod. Anhanguera</span>
            </div>
            <div style={parseStyle('flex:1; min-width:160px; padding:22px 8px; display:flex; flex-direction:column; gap:3px;')}>
              <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#fff; line-height:1;")}>Em obras</span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e6cdba;")}>Construtora Santa Angela</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOBRE / EMPREENDIMENTO ============ */}
      <section id="empreendimento" data-screen-label="O Empreendimento" style={parseStyle('position:relative; background:#f6f1e8; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto; display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(40px,6vw,90px); align-items:center;')} data-grid-2="">
          <div>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>O Empreendimento</span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,62px); font-weight:600; line-height:1.04; color:#173f31; letter-spacing:-.01em;")}>Grande no estilo e<br />na medida pra você</h2>
            <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:28px 0 0; font-size:17px; line-height:1.8; color:#4a463f; max-width:540px;')}>
              O Altos da Avenida nasceu com uma identidade visual de destaque, que se impõe com formas, volumes e cores. O <strong style={parseStyle('color:#173f31;')}>verde das fachadas</strong> dialoga com o maciço verde da Serra do Japi, enquanto os tons de cinza conversam com o cotidiano urbano de Jundiaí.
            </p>
            <p data-reveal="" data-reveal-delay="200" style={parseStyle('margin:18px 0 0; font-size:17px; line-height:1.8; color:#4a463f; max-width:540px;')}>
              A implantação foi desenhada com fluxos não-ortogonais, que se deixam preencher por um paisagismo assinado com o conceito de <em>Land Art</em> — onde o grafismo dos jardins agrega valor artístico a cada caminho.
            </p>
            <div data-reveal="" data-reveal-delay="260" style={parseStyle('display:flex; gap:38px; margin-top:40px; flex-wrap:wrap;')}>
              <div data-counter="40" style={parseStyle('display:flex; flex-direction:column;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:600; color:#bd6a45; line-height:1;")}><span data-count-target="">40</span><span style={parseStyle('font-size:30px;')}>+</span></span>
                <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:#6f665b; margin-top:6px;")}>Anos de Santa Angela</span>
              </div>
              <div data-counter="9800" style={parseStyle('display:flex; flex-direction:column;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:600; color:#bd6a45; line-height:1;")}><span data-count-target="">9.800</span><span style={parseStyle('font-size:30px;')}>+</span></span>
                <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:#6f665b; margin-top:6px;")}>Unidades entregues</span>
              </div>
              <div style={parseStyle('display:flex; flex-direction:column;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:600; color:#bd6a45; line-height:1;")}>2,70<span style={parseStyle('font-size:24px;')}>m</span></span>
                <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:#6f665b; margin-top:6px;")}>Pé-direito dos apês</span>
              </div>
            </div>
          </div>
          <div data-reveal="" data-reveal-delay="120" style={parseStyle('position:relative;')}>
            <div style={parseStyle('position:relative; border-radius:4px; overflow:hidden; box-shadow:0 40px 80px rgba(23,63,49,.28);')}>
              <img src={A + 'a002.png'} alt="Vista das torres do Altos da Avenida" style={parseStyle('width:100%; height:560px; object-fit:cover;')} />
            </div>
            <div style={parseStyle('position:absolute; bottom:-26px; left:-26px; background:#173f31; color:#fff; padding:26px 30px; border-radius:4px; max-width:240px; box-shadow:0 24px 50px rgba(23,63,49,.35);')}>
              <span style={parseStyle("font-family:'Sacramento',cursive; font-size:34px; color:#e9b896; line-height:.9; display:block;")}>alto astral</span>
              <span style={parseStyle('font-size:14px; line-height:1.5; color:rgba(255,255,255,.82); display:block; margin-top:6px;')}>3 torres entre jardins, com lazer do térreo ao topo.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section id="localizacao" data-screen-label="Localização" style={parseStyle('position:relative; background:#15281e; color:#fff; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px); overflow:hidden;')}>
        <div style={parseStyle('position:absolute; top:-80px; right:-60px; width:380px; height:380px; border-radius:50%; background:radial-gradient(circle,rgba(189,106,69,.22),transparent 70%); pointer-events:none;')}></div>
        <div style={parseStyle('max-width:1340px; margin:0 auto; position:relative;')}>
          <div style={parseStyle('text-align:center; max-width:680px; margin:0 auto 64px;')}>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#e9b896;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#e9b896;")}>Localização &amp; Conveniências</span>
              <span style={parseStyle('width:28px; height:1px; background:#e9b896;')}></span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,60px); font-weight:600; line-height:1.05;")}>No Jardim do Lago, perto<br />de tudo que importa</h2>
            <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:24px auto 0; font-size:17px; line-height:1.75; color:rgba(255,255,255,.78); max-width:600px;')}>A Avenida Samuel Martins é um endereço tranquilo e prático, com fácil acesso à Rodovia Anhanguera (São Paulo–Campinas) e ao Centro de Jundiaí — uma das melhores cidades do país para se viver.</p>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:repeat(3,1fr); gap:24px;')} data-grid-3="">
            <div data-reveal="" style={parseStyle('background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:38px 32px;')}>
              <div style={parseStyle('width:54px; height:54px; border-radius:50%; background:rgba(233,184,150,.16); display:flex; align-items:center; justify-content:center; margin-bottom:22px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9b896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l2-7 4 14 2-7h7"></path></svg>
              </div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600;")}>10 minutos</h3>
              <p style={parseStyle('margin:0; font-size:15px; line-height:1.6; color:rgba(255,255,255,.72);')}>Da Rodovia Anhanguera, eixo que conecta São Paulo e Campinas.</p>
            </div>
            <div data-reveal="" data-reveal-delay="100" style={parseStyle('background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:38px 32px;')}>
              <div style={parseStyle('width:54px; height:54px; border-radius:50%; background:rgba(233,184,150,.16); display:flex; align-items:center; justify-content:center; margin-bottom:22px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9b896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-6 9 6v12"></path><path d="M9 21v-6h6v6"></path></svg>
              </div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600;")}>15 minutos</h3>
              <p style={parseStyle('margin:0; font-size:15px; line-height:1.6; color:rgba(255,255,255,.72);')}>Do Centro de Jundiaí, com toda a sua estrutura de serviços.</p>
            </div>
            <div data-reveal="" data-reveal-delay="200" style={parseStyle('background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:38px 32px;')}>
              <div style={parseStyle('width:54px; height:54px; border-radius:50%; background:rgba(233,184,150,.16); display:flex; align-items:center; justify-content:center; margin-bottom:22px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9b896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18l-1 11H4L3 9Z"></path><path d="M8 9V6a4 4 0 0 1 8 0v3"></path></svg>
              </div>
              <h3 style={parseStyle("margin:0 0 8px; font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600;")}>Na porta</h3>
              <p style={parseStyle('margin:0; font-size:15px; line-height:1.6; color:rgba(255,255,255,.72);')}>Escolas, padarias, mercados, bares e restaurantes na Av. Samuel Martins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAZER / GALERIA ============ */}
      <section id="lazer" data-screen-label="Lazer" style={parseStyle('position:relative; background:#f6f1e8; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('display:flex; align-items:flex-end; justify-content:space-between; gap:30px; flex-wrap:wrap; margin-bottom:54px;')}>
            <div style={parseStyle('max-width:640px;')}>
              <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
                <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
                <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>Áreas de Lazer &amp; Convivência</span>
              </div>
              <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,62px); font-weight:600; line-height:1.04; color:#173f31;")}>Lazer completo,<br />do térreo ao topo</h2>
            </div>
            <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:0; font-size:16px; line-height:1.75; color:#4a463f; max-width:360px;')}>Mais de uma dúzia de ambientes equipados e decorados, pensados para você aproveitar cada momento ao lado de quem ama.</p>
          </div>

          {/* gallery grid */}
          <div style={parseStyle('display:grid; grid-template-columns:repeat(12,1fr); grid-auto-rows:240px; gap:18px;')} data-gallery-grid="">
            {GAL.map((g, i) => (
              <Hoverable
                key={i}
                as="button"
                onClick={() => galleryOpen(i)}
                baseStyle={parseStyle('position:relative; border:none; padding:0; cursor:pointer; overflow:hidden; border-radius:4px; grid-column:span ' + g.colSpan + '; grid-row:span ' + g.rowSpan + '; background:#ddd;')}
                hoverStyle={{}}
              >
                <GalleryImg src={g.img} alt={g.alt} />
                <span style={parseStyle('position:absolute; inset:0; background:linear-gradient(0deg,rgba(13,33,25,.78) 0%,rgba(13,33,25,.05) 50%,rgba(13,33,25,0) 100%); transition:opacity .4s;')}></span>
                <span style={parseStyle('position:absolute; left:20px; bottom:18px; right:18px; text-align:left; display:flex; flex-direction:column; gap:3px;')}>
                  <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:#e9b896;")}>{g.tag}</span>
                  <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:#fff; line-height:1.1;")}>{g.title}</span>
                </span>
              </Hoverable>
            ))}
          </div>

          {/* full amenity list */}
          <div data-reveal="" style={parseStyle('margin-top:60px; background:#fff; border-radius:4px; padding:clamp(32px,4vw,52px); box-shadow:0 24px 60px rgba(23,63,49,.08);')}>
            <div style={parseStyle('display:flex; align-items:center; gap:14px; margin-bottom:30px;')}>
              <img src={A + 'a001.png'} alt="" style={parseStyle('height:0; width:0; opacity:0;')} />
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.26em; text-transform:uppercase; color:#173f31;")}>Tudo isso e muito mais</span>
              <span style={parseStyle('flex:1; height:1px; background:linear-gradient(90deg,#cdbfa7,transparent);')}></span>
            </div>
            <div style={parseStyle('display:grid; grid-template-columns:repeat(4,1fr); gap:2px 30px;')} data-grid-amen="">
              {AMEN.map((a, i) => (
                <div key={i} style={parseStyle('display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid #efe7d8;')}>
                  <span style={parseStyle('flex-shrink:0; width:7px; height:7px; border-radius:50%; background:#bd6a45;')}></span>
                  <span style={parseStyle('font-size:15.5px; color:#3a362f; font-weight:500;')}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section id="plantas" data-screen-label="Plantas" style={parseStyle('position:relative; background:#ece3d3; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('text-align:center; max-width:680px; margin:0 auto 50px;')}>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>Plantas &amp; Metragens</span>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,60px); font-weight:600; line-height:1.05; color:#173f31;")}>Encontre a sua medida certa</h2>
          </div>

          {/* tabs */}
          <div data-reveal="" style={parseStyle('display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:46px;')}>
            {PLANTAS.map((p, i) => {
              const on = i === plantaIdx;
              return (
                <button
                  key={i}
                  onClick={() => selectPlanta(i)}
                  style={parseStyle(
                    "font-family:'Barlow Semi Condensed',sans-serif; font-size:17px; letter-spacing:.06em; text-transform:uppercase; padding:14px 30px; border-radius:44px; cursor:pointer; border:1px solid " +
                      (on ? '#173f31' : 'rgba(23,63,49,.3)') +
                      '; background:' +
                      (on ? '#173f31' : 'transparent') +
                      '; color:' +
                      (on ? '#fff' : '#173f31') +
                      '; transition:all .35s;'
                  )}
                >
                  {p.m}m²
                </button>
              );
            })}
          </div>

          {/* active planta */}
          <div style={parseStyle('display:grid; grid-template-columns:1.35fr .85fr; gap:clamp(30px,4vw,56px); align-items:center; background:#fff; border-radius:6px; padding:clamp(26px,3vw,48px); box-shadow:0 30px 70px rgba(23,63,49,.12);')} data-grid-planta="">
            <Hoverable
              as="button"
              onClick={openPlanta}
              aria-label="Ampliar planta"
              baseStyle={parseStyle('position:relative; display:flex; align-items:center; justify-content:center; min-height:560px; background:#f6f1e8; border:1px solid #ece3d3; border-radius:6px; padding:24px; cursor:zoom-in; overflow:hidden;')}
              hoverStyle={{}}
            >
              <img
                src={activePlanta.img}
                alt={'Planta do apartamento de ' + activePlanta.m + 'm² do Altos da Avenida'}
                style={{ ...parseStyle('max-height:660px; width:auto; max-width:100%; object-fit:contain; transition:opacity .4s, transform .6s cubic-bezier(.16,1,.3,1);'), opacity: plantaFade }}
              />
              <span style={parseStyle("position:absolute; bottom:16px; right:16px; display:inline-flex; align-items:center; gap:7px; background:rgba(23,63,49,.92); color:#fff; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.12em; text-transform:uppercase; padding:8px 14px; border-radius:40px;")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>Ampliar</span>
            </Hoverable>
            <div>
              <span style={parseStyle("font-family:'Sacramento',cursive; font-size:38px; color:#bd6a45; line-height:.8; display:block;")}>apartamento de</span>
              <h3 style={parseStyle("margin:4px 0 0; font-family:'Cormorant Garamond',serif; font-size:clamp(50px,7vw,86px); font-weight:600; color:#173f31; line-height:.95;")}>{activePlanta.m}m²</h3>
              <p style={parseStyle("margin:18px 0 0; font-family:'Barlow Semi Condensed',sans-serif; font-size:18px; letter-spacing:.05em; text-transform:uppercase; color:#1f5240;")}>{activePlanta.dorms}</p>
              <p style={parseStyle('margin:22px 0 0; font-size:16px; line-height:1.75; color:#4a463f; max-width:420px;')}>{activePlanta.desc}</p>
              <div style={parseStyle('display:flex; flex-wrap:wrap; gap:10px; margin-top:26px;')}>
                {activePlanta.features.map((f, i) => (
                  <span key={i} style={parseStyle('display:inline-flex; align-items:center; gap:8px; background:#f6f1e8; border-radius:40px; padding:9px 18px; font-size:14px; color:#3a362f; font-weight:500;')}><span style={parseStyle('width:6px; height:6px; border-radius:50%; background:#1f5240;')}></span>{f}</span>
                ))}
              </div>
              <Hoverable as="a" href={waLinkPlanta} target="_blank" rel="noopener" baseStyle={parseStyle("display:inline-flex; align-items:center; gap:10px; margin-top:34px; font-family:'Barlow Semi Condensed',sans-serif; font-size:15px; letter-spacing:.08em; text-transform:uppercase; color:#fff; text-decoration:none; background:#173f31; padding:16px 30px; border-radius:44px; transition:transform .3s, background .3s;")} hoverStyle={parseStyle('transform:translateY(-2px); background:#1f5240;')}>Consultar valores e disponibilidade</Hoverable>
            </div>
          </div>
          <p style={parseStyle('text-align:center; margin:24px auto 0; font-size:12.5px; color:#8a8073; max-width:640px;')}>Imagens meramente ilustrativas, sujeitas a alteração. As medidas dos apartamentos são internas e de face a face.</p>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section id="diferenciais" data-screen-label="Diferenciais" style={parseStyle('position:relative; background:#f6f1e8; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('text-align:center; max-width:680px; margin:0 auto 60px;')}>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>Diferenciais &amp; Qualidade</span>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,60px); font-weight:600; line-height:1.05; color:#173f31;")}>Cada detalhe pensado<br />para viver bem</h2>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:1fr 1fr; gap:24px;')} data-grid-2="">
            <div data-reveal="" style={parseStyle('background:#fff; border-radius:6px; padding:clamp(28px,3vw,44px); box-shadow:0 20px 50px rgba(23,63,49,.07);')}>
              <h3 style={parseStyle("margin:0 0 24px; font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#173f31;")}>No seu apartamento</h3>
              <div style={parseStyle('display:flex; flex-direction:column; gap:0;')}>
                {DIF_APTO.map((d, i) => (
                  <div key={i} style={parseStyle('display:flex; align-items:flex-start; gap:14px; padding:13px 0; border-bottom:1px solid #f0e8d9;')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd6a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('flex-shrink:0; margin-top:2px;')}><path d="M20 6 9 17l-5-5"></path></svg>
                    <span style={parseStyle('font-size:15.5px; line-height:1.5; color:#3a362f;')}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="" data-reveal-delay="120" style={parseStyle('background:#173f31; border-radius:6px; padding:clamp(28px,3vw,44px); box-shadow:0 20px 50px rgba(23,63,49,.18);')}>
              <h3 style={parseStyle("margin:0 0 24px; font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:600; color:#fff;")}>Nas áreas comuns</h3>
              <div style={parseStyle('display:flex; flex-direction:column; gap:0;')}>
                {DIF_COMUM.map((d, i) => (
                  <div key={i} style={parseStyle('display:flex; align-items:flex-start; gap:14px; padding:13px 0; border-bottom:1px solid rgba(255,255,255,.12);')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9b896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('flex-shrink:0; margin-top:2px;')}><path d="M20 6 9 17l-5-5"></path></svg>
                    <span style={parseStyle('font-size:15.5px; line-height:1.5; color:rgba(255,255,255,.86);')}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* certifications */}
          <div data-reveal="" style={parseStyle('margin-top:24px; background:#fff; border-radius:6px; padding:32px clamp(28px,3vw,44px); box-shadow:0 20px 50px rgba(23,63,49,.07); display:flex; flex-wrap:wrap; align-items:center; gap:30px; justify-content:space-between;')}>
            <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:14px; letter-spacing:.18em; text-transform:uppercase; color:#173f31;")}>Qualidade &amp; Segurança certificadas</span>
            <div style={parseStyle('display:flex; flex-wrap:wrap; gap:12px;')}>
              {CERTS.map((c, i) => (
                <span key={i} style={parseStyle('display:inline-flex; align-items:center; gap:8px; background:#f6f1e8; border:1px solid #e4dac7; border-radius:40px; padding:9px 18px; font-size:13.5px; font-weight:600; color:#1f5240;')}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONSTRUTORA ============ */}
      <section data-screen-label="Construtora" style={parseStyle('position:relative; background:#15281e; color:#fff; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px); overflow:hidden;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto; display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(40px,6vw,80px); align-items:center;')} data-grid-2="">
          <div data-reveal="" style={parseStyle('position:relative;')}>
            <div style={parseStyle('border-radius:6px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.4);')}>
              <img src={A + 'a004.png'} alt="Família realizando o sonho da casa própria" style={parseStyle('width:100%; height:520px; object-fit:contain; object-position:bottom; background:linear-gradient(160deg,#1f5240,#15281e);')} />
            </div>
          </div>
          <div>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#e9b896;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#e9b896;")}>A Construtora</span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,58px); font-weight:600; line-height:1.05;")}>Há 40 anos realizando<br />sonhos em Jundiaí</h2>
            <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:26px 0 0; font-size:17px; line-height:1.8; color:rgba(255,255,255,.8); max-width:560px;')}>A Construtora Santa Angela está presente em Jundiaí, Americana e Itatiba. Em constante transformação, evolui a cada projeto em observação, inovação e criatividade — acompanhando todas as fases da obra, do início à entrega das chaves.</p>
            <p data-reveal="" data-reveal-delay="200" style={parseStyle('margin:16px 0 0; font-size:17px; line-height:1.8; color:rgba(255,255,255,.8); max-width:560px;')}>Com confiança, respeito e comprometimento, queremos que a sua família viva a melhor experiência num empreendimento Santa Angela.</p>
            <div data-reveal="" data-reveal-delay="260" style={parseStyle('display:flex; gap:48px; margin-top:38px; flex-wrap:wrap;')}>
              <div><span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:48px; font-weight:600; color:#e9b896; line-height:1;")}>+40</span><span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-top:6px;")}>anos de história</span></div>
              <div><span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:48px; font-weight:600; color:#e9b896; line-height:1;")}>+9.800</span><span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-top:6px;")}>unidades entregues</span></div>
              <div><span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:48px; font-weight:600; color:#e9b896; line-height:1;")}>3</span><span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-top:6px;")}>cidades atendidas</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO ============ */}
      <section id="contato" data-screen-label="Contato" style={parseStyle('position:relative; background:#f6f1e8; padding:clamp(80px,12vh,140px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:1180px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:clamp(36px,5vw,72px); align-items:center;')} data-grid-2="">
          <div>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:22px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>Fale com a gente</span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.6vw,58px); font-weight:600; line-height:1.04; color:#173f31;")}>Quer conhecer o<br />Altos da Avenida?</h2>
            <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:24px 0 0; font-size:17px; line-height:1.8; color:#4a463f; max-width:460px;')}>Preencha o formulário e fale agora pelo WhatsApp com um especialista da <strong style={parseStyle('color:#173f31;')}>Imobiliária Lotus Brokers</strong>. Consulte valores, condições e disponibilidade.</p>
            <div data-reveal="" data-reveal-delay="200" style={parseStyle('margin-top:34px; display:flex; flex-direction:column; gap:16px;')}>
              <a href={waLink} target="_blank" rel="noopener" style={parseStyle('display:inline-flex; align-items:center; gap:13px; text-decoration:none; color:#173f31;')}>
                <span style={parseStyle('width:46px; height:46px; border-radius:50%; background:#173f31; display:flex; align-items:center; justify-content:center;')}><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.5 14.2c-.23.66-1.34 1.26-1.85 1.3-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8s.7-1.98.95-2.25a1 1 0 0 1 .72-.34l.52.01c.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.41.83-.85 1.05-.27.46-.41.62-.14.16-.28.29-.12.56.16.27.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.22 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.16 1.32Z"></path></svg></span>
                <span><span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#8a8073;")}>WhatsApp</span><span style={parseStyle('font-size:19px; font-weight:600;')}>{phoneDisplay}</span></span>
              </a>
            </div>
          </div>
          <form onSubmit={submitWhats} data-reveal="" data-reveal-delay="120" style={parseStyle('background:#fff; border-radius:8px; padding:clamp(28px,3.5vw,46px); box-shadow:0 30px 70px rgba(23,63,49,.14);')}>
            <h3 style={parseStyle("margin:0 0 6px; font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:600; color:#173f31;")}>Receba mais informações</h3>
            <p style={parseStyle('margin:0 0 24px; font-size:14px; color:#8a8073;')}>Respondemos rapidinho, direto no seu WhatsApp.</p>
            <div style={parseStyle('display:flex; flex-direction:column; gap:16px;')}>
              <label style={parseStyle('display:flex; flex-direction:column; gap:7px;')}><span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:#6f665b;")}>Nome</span><Focusable name="nome" required placeholder="Seu nome completo" baseStyle={parseStyle("font-family:'Manrope',sans-serif; font-size:15px; padding:14px 16px; border:1px solid #e0d6c4; border-radius:6px; background:#faf7f0; color:#211f1c; outline:none; transition:border-color .25s;")} focusStyle={parseStyle('border-color:#1f5240;')} /></label>
              <label style={parseStyle('display:flex; flex-direction:column; gap:7px;')}><span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:#6f665b;")}>WhatsApp</span><Focusable name="telefone" required placeholder="(11) 90000-0000" baseStyle={parseStyle("font-family:'Manrope',sans-serif; font-size:15px; padding:14px 16px; border:1px solid #e0d6c4; border-radius:6px; background:#faf7f0; color:#211f1c; outline:none; transition:border-color .25s;")} focusStyle={parseStyle('border-color:#1f5240;')} /></label>
              <label style={parseStyle('display:flex; flex-direction:column; gap:7px;')}><span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:#6f665b;")}>Metragem de interesse</span>
                <select name="metragem" style={parseStyle("font-family:'Manrope',sans-serif; font-size:15px; padding:14px 16px; border:1px solid #e0d6c4; border-radius:6px; background:#faf7f0; color:#211f1c; outline:none;")}>
                  <option>Tenho interesse geral</option>
                  <option>58m² — 2 dormitórios</option>
                  <option>68m² — 2 dormitórios c/ suíte</option>
                  <option>96m² — 3 dormitórios c/ suíte</option>
                  <option>105m² — 3 dormitórios c/ suíte</option>
                </select>
              </label>
              <Hoverable as="button" type="submit" baseStyle={parseStyle("margin-top:8px; display:inline-flex; align-items:center; justify-content:center; gap:11px; font-family:'Barlow Semi Condensed',sans-serif; font-size:16px; letter-spacing:.08em; text-transform:uppercase; color:#fff; background:#bd6a45; border:none; padding:17px; border-radius:46px; cursor:pointer; box-shadow:0 12px 30px rgba(189,106,69,.35); transition:transform .3s, box-shadow .3s;")} hoverStyle={parseStyle('transform:translateY(-2px); box-shadow:0 18px 40px rgba(189,106,69,.5);')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.5 14.2c-.23.66-1.34 1.26-1.85 1.3-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8s.7-1.98.95-2.25a1 1 0 0 1 .72-.34l.52.01c.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.22 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.16 1.32Z"></path></svg>
                Enviar pelo WhatsApp
              </Hoverable>
              <p style={parseStyle('margin:4px 0 0; font-size:11.5px; line-height:1.5; color:#a59a89; text-align:center;')}>Ao enviar, você autoriza o contato de corretores e parceiros, inclusive por WhatsApp, sobre o empreendimento.</p>
            </div>
          </form>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section data-screen-label="FAQ" style={parseStyle('position:relative; background:#ece3d3; padding:clamp(70px,10vh,120px) clamp(20px,4vw,64px);')}>
        <div style={parseStyle('max-width:880px; margin:0 auto;')}>
          <div style={parseStyle('text-align:center; margin-bottom:48px;')}>
            <div data-reveal="" style={parseStyle('display:inline-flex; align-items:center; gap:12px; margin-bottom:18px;')}>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
              <span style={parseStyle("font-family:'Barlow Semi Condensed',sans-serif; font-size:13px; letter-spacing:.3em; text-transform:uppercase; color:#bd6a45;")}>Perguntas Frequentes</span>
              <span style={parseStyle('width:28px; height:1px; background:#bd6a45;')}></span>
            </div>
            <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(32px,4.4vw,54px); font-weight:600; color:#173f31;")}>Tudo o que você precisa saber</h2>
          </div>
          <div style={parseStyle('display:flex; flex-direction:column; gap:12px;')}>
            {FAQS.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} style={parseStyle('background:#fff; border-radius:6px; overflow:hidden; box-shadow:0 8px 24px rgba(23,63,49,.06);')}>
                  <button onClick={() => toggleFaq(i)} style={parseStyle('width:100%; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:22px 26px; background:none; border:none; cursor:pointer; text-align:left;')}>
                    <span style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:21px; font-weight:600; color:#173f31;")}>{f.q}</span>
                    <span style={{ ...parseStyle('flex-shrink:0; font-size:24px; color:#bd6a45; transition:transform .3s;'), transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                  </button>
                  <div style={{ ...parseStyle('overflow:hidden; transition:max-height .4s ease;'), maxHeight: open ? '320px' : '0px' }}>
                    <p style={parseStyle('margin:0; padding:0 26px 24px; font-size:15.5px; line-height:1.7; color:#4a463f;')}>{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section data-screen-label="CTA Final" style={parseStyle('position:relative; padding:clamp(70px,11vh,130px) clamp(20px,4vw,64px); overflow:hidden; background:#173f31;')}>
        <div style={parseStyle('position:absolute; inset:0; z-index:0; opacity:.22;')}><img src={A + 'a003.png'} alt="" style={parseStyle('width:100%; height:100%; object-fit:cover;')} /></div>
        <div style={parseStyle('position:absolute; inset:0; z-index:1; background:linear-gradient(180deg,rgba(21,40,30,.85),rgba(21,40,30,.92));')}></div>
        <div style={parseStyle('position:relative; z-index:2; max-width:760px; margin:0 auto; text-align:center;')}>
          <img data-reveal="" src={A + 'a001.png'} alt="Altos da Avenida" style={parseStyle('height:60px; margin:0 auto 30px;')} />
          <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-size:clamp(36px,5.5vw,72px); font-weight:600; color:#fff; line-height:1.02;")}>Os seus Altos momentos<br />começam aqui</h2>
          <p data-reveal="" data-reveal-delay="140" style={parseStyle('margin:22px auto 0; font-size:18px; line-height:1.7; color:rgba(255,255,255,.82); max-width:520px;')}>Apartamentos de 58 a 105m² em Jundiaí. Agende sua visita com a Imobiliária Lotus Brokers.</p>
          <Hoverable as="a" data-reveal="" data-reveal-delay="200" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle("display:inline-flex; align-items:center; gap:12px; margin-top:36px; font-family:'Barlow Semi Condensed',sans-serif; font-size:17px; letter-spacing:.08em; text-transform:uppercase; color:#fff; text-decoration:none; background:#bd6a45; padding:19px 42px; border-radius:48px; box-shadow:0 16px 40px rgba(189,106,69,.45); transition:transform .3s, box-shadow .3s;")} hoverStyle={parseStyle('transform:translateY(-3px); box-shadow:0 22px 50px rgba(189,106,69,.6);')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.5 14.2c-.23.66-1.34 1.26-1.85 1.3-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8s.7-1.98.95-2.25a1 1 0 0 1 .72-.34l.52.01c.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.22 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.16 1.32Z"></path></svg>
            Falar com a Imobiliária Lotus Brokers
          </Hoverable>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={parseStyle('background:#0f201a; color:rgba(255,255,255,.7); padding:64px clamp(20px,4vw,64px) 38px;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('display:flex; flex-wrap:wrap; gap:40px; justify-content:space-between; padding-bottom:40px; border-bottom:1px solid rgba(255,255,255,.1);')}>
            <div style={parseStyle('max-width:320px;')}>
              <img src={A + 'a001.png'} alt="Altos da Avenida" style={parseStyle('height:44px; margin-bottom:18px;')} />
              <p style={parseStyle('margin:0; font-size:14px; line-height:1.7;')}>Apartamentos de 58 a 105m² na Avenida Samuel Martins, Jardim do Lago, Jundiaí/SP. Um empreendimento Construtora Santa Angela.</p>
            </div>
            <div>
              <span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e9b896; margin-bottom:16px;")}>Navegação</span>
              <div style={parseStyle('display:flex; flex-direction:column; gap:10px;')}>
                <a href="#empreendimento" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none; font-size:14px;')}>O Empreendimento</a>
                <a href="#localizacao" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none; font-size:14px;')}>Localização</a>
                <a href="#lazer" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none; font-size:14px;')}>Lazer</a>
                <a href="#plantas" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none; font-size:14px;')}>Plantas</a>
                <a href="#contato" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none; font-size:14px;')}>Contato</a>
              </div>
            </div>
            <div>
              <span style={parseStyle("display:block; font-family:'Barlow Semi Condensed',sans-serif; font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:#e9b896; margin-bottom:16px;")}>Atendimento</span>
              <div style={parseStyle('display:flex; flex-direction:column; gap:10px; font-size:14px;')}>
                <span style={parseStyle('color:#fff; font-weight:600;')}>Imobiliária Lotus Brokers</span>
                <a href={waLink} target="_blank" rel="noopener" style={parseStyle('color:rgba(255,255,255,.7); text-decoration:none;')}>WhatsApp: {phoneDisplay}</a>
              </div>
              <div style={parseStyle('margin-top:18px; background:#fff; border-radius:6px; padding:10px 14px; display:inline-block;')}>
                <img src={A + 'a000.jpg'} alt="Imobiliária Lotus Brokers" style={parseStyle('height:34px;')} />
              </div>
            </div>
          </div>
          <p style={parseStyle('margin:26px 0 0; font-size:11.5px; line-height:1.7; color:rgba(255,255,255,.42); max-width:1000px;')}>Imagens meramente ilustrativas, sujeitas a alteração. As tonalidades das cores, formas e texturas podem sofrer alterações. Os móveis e utensílios são sugestões de decoração e não fazem parte do contrato de aquisição. As medidas dos apartamentos são internas e de face a face. Registro do Imóvel: Incorporação registrada na matrícula 155.214 no 2º Oficial de Registro de Imóveis de Jundiaí, em 24/05/21. Material informativo elaborado pela Imobiliária Lotus Brokers.</p>
          <p style={parseStyle('margin:18px 0 0; font-size:12px; color:rgba(255,255,255,.5);')}>© 2026 Imobiliária Lotus Brokers · Altos da Avenida — Construtora Santa Angela.</p>
        </div>
      </footer>

      {/* ============ LIGHTBOX ============ */}
      <div
        onClick={closeLightbox}
        style={{
          ...parseStyle('position:fixed; inset:0; z-index:140; display:flex; align-items:center; justify-content:center; padding:clamp(16px,4vw,56px); background:rgba(13,33,25,.93); backdrop-filter:blur(8px); transition:opacity .4s ease, visibility .4s ease;'),
          opacity: lb ? 1 : 0,
          visibility: lb ? 'visible' : 'hidden',
        }}
      >
        <Hoverable as="button" onClick={closeLightbox} aria-label="Fechar" baseStyle={parseStyle('position:absolute; top:22px; right:26px; width:50px; height:50px; border-radius:50%; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.3); color:#fff; font-size:28px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .25s;')} hoverStyle={parseStyle('background:rgba(255,255,255,.24);')}>×</Hoverable>
        {lbHasPrev && (
          <>
            <Hoverable as="button" onClick={lbPrev} aria-label="Anterior" baseStyle={parseStyle('position:absolute; left:clamp(12px,3vw,40px); top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.3); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .25s;')} hoverStyle={parseStyle('background:rgba(255,255,255,.24);')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg></Hoverable>
          </>
        )}
        {lbHasPrev && (
          <>
            <Hoverable as="button" onClick={lbNext} aria-label="Próxima" baseStyle={parseStyle('position:absolute; right:clamp(12px,3vw,40px); top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.3); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .25s;')} hoverStyle={parseStyle('background:rgba(255,255,255,.24);')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"></path></svg></Hoverable>
          </>
        )}
        <figure onClick={stopProp} style={parseStyle('margin:0; max-width:1100px; max-height:88vh; display:flex; flex-direction:column; align-items:center; gap:18px;')}>
          {lb && <img src={lb.src} alt={lb.alt} style={parseStyle('max-width:100%; max-height:78vh; width:auto; object-fit:contain; border-radius:6px; box-shadow:0 40px 90px rgba(0,0,0,.5); background:#fff;')} />}
          <figcaption style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:24px; color:#fff; text-align:center;")}>{lb ? lb.alt : ''}</figcaption>
        </figure>
      </div>

      {/* floating whatsapp */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed; bottom:26px; right:26px; z-index:115; width:60px; height:60px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(37,211,102,.5); animation:adFloat 3.5s ease-in-out infinite;')}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.1-1.33A10 10 0 1 0 12 2Zm5.5 14.2c-.23.66-1.34 1.26-1.85 1.3-.5.05-.97.23-3.27-.68-2.75-1.08-4.5-3.9-4.64-4.08-.13-.18-1.1-1.47-1.1-2.8s.7-1.98.95-2.25a1 1 0 0 1 .72-.34l.52.01c.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.72 1.18 1.54 1.91 1.06.94 1.95 1.24 2.22 1.38.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.16 1.32Z"></path></svg>
      </a>
    </div>
  );
}

/**
 * Imagem da galeria com hover scale (style-hover do estático no <img> interno).
 * Isolada para poder ter seu próprio estado de hover independente do botão.
 */
function GalleryImg({ src, alt }: { src: string; alt: string }) {
  const [hover, setHover] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...parseStyle('width:100%; height:100%; object-fit:cover; transition:transform .9s cubic-bezier(.16,1,.3,1);'),
        transform: hover ? 'scale(1.08)' : undefined,
      }}
    />
  );
}
