'use client';

/**
 * JardinsDoHorto — porte 1:1 de jardins-do-horto/index.html (dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (iguais às demais landings do portal):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 * Imagens: servidas pelo GitHub Pages do próprio repo (mesmo padrão de LotusHome).
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
 * Split apenas no PRIMEIRO ":" de cada declaração (gradientes/data: URIs têm ":"
 * internos); camelCase nas propriedades; -webkit- -> Webkit; preserva valores EXATOS.
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
      ? rawProp
      : rawProp.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[prop] = value;
  }
  return out as CSSProperties;
}

/** style-hover do dc-runtime: aplica hoverStyle no mouseenter, remove no mouseleave. */
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

/** style-focus do dc-runtime (inputs): aplica focusStyle no focus, remove no blur. */
function FocusInput({
  baseStyle,
  focusStyle,
  ...rest
}: {
  baseStyle: CSSProperties;
  focusStyle: CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<'input'>, 'style'>) {
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
/* Dados (valores EXATOS do script dc-runtime)                         */
/* ------------------------------------------------------------------ */

// Base das imagens: mesmo repo, servido via GitHub Pages (padrão das landings).
const IMG = '/jardins-do-horto/';

// gallery: no estático, o script resolve g.img via window.__resources (aNNN.jpg),
// aplicado já no componentDidMount. Aqui usamos os valores já resolvidos.
const gallery = [
  { img: IMG + 'a013.jpg', tag: 'Lazer', cap: 'Piscina Adulto e Infantil', col: 7, row: 2 },
  { img: IMG + 'a010.jpg', tag: 'Convivência', cap: 'Salão de Festas', col: 5, row: 2 },
  { img: IMG + 'a011.jpg', tag: 'Bem-estar', cap: 'Academia · Céltica & Movement', col: 5, row: 2 },
  { img: IMG + 'a008.jpg', tag: 'Convivência', cap: 'Espaço Gourmet', col: 4, row: 2 },
  { img: IMG + 'a015.jpg', tag: 'Família', cap: 'Playground · Rubber Brasil', col: 3, row: 2 },
  { img: IMG + 'a017.jpg', tag: 'Chegada', cap: 'Portaria', col: 4, row: 2 },
  { img: IMG + 'a009.jpg', tag: 'Família', cap: 'Espaço Teen & Lounge', col: 4, row: 2 },
  { img: IMG + 'a014.jpg', tag: 'Paisagismo', cap: 'Alameda & Pista de Cooper', col: 4, row: 2 },
  { img: IMG + 'a018.jpg', tag: 'Conveniência', cap: 'Mini Mercado', col: 4, row: 2 },
  { img: IMG + 'a016.jpg', tag: 'Vista', cap: 'Vista aérea do lazer', col: 8, row: 2 },
  { img: IMG + 'a012.jpg', tag: 'Convivência', cap: 'Hall de Entrada', col: 4, row: 2 },
];

const stats = [
  { n: '2', suffix: '', l: 'Torres' },
  { n: '268', suffix: '', l: 'Unidades' },
  { n: '16', suffix: '', l: 'Pavimentos tipo' },
  { n: '4', suffix: '', l: 'Elevadores / torre' },
  { n: '495', suffix: '', l: 'Vagas' },
  { n: '39', suffix: '', l: 'Meses p/ entrega' },
];

const nearby = ['Maxi Shopping Jundiaí', 'Parques da Cidade', 'Mundo das Crianças', 'Jardim Botânico', 'Sesc Jundiaí', 'Centro de Jundiaí'];

const difComuns = ['Geração de energia fotovoltaica', 'Áreas comuns equipadas e decoradas', 'Playground personalizado (Rubber Brasil)', 'Academia com consultoria Céltica e Movement', 'Piscinas com infra. para climatização', 'Infraestrutura para sistema de Wi-Fi'];
const difGerais = ['Elevadores com tecnologia regenerativa', 'Energia elétrica subterrânea', 'Sensores de presença em halls e elevadores', 'Edifício garagem com vagas cobertas', 'Sala de expedição (guarda-volumes)', 'Amplo espaçamento entre torres'];
const difUnidades = ['Pé direito de 2,70m', 'Esquadrias de alumínio sob medida com persiana', 'Bancadas de banheiro em mármore', 'Pias da cozinha e varanda em granito', 'Tratamento acústico no contrapiso', 'Infra. para automação e ar-condicionado'];
const qualidade = ['PBQP-H Nível A', 'ISO 9001:2015', 'NBR 15575 · Desempenho', 'NBR 9050 · Acessibilidade'];

const faqs = [
  { q: 'Onde fica o Jardins do Horto?', a: 'Na Rua Irineu de Toledo, nº 225, no bairro Horto Florestal, em Jundiaí/SP — ao lado do Maxi Shopping Jundiaí e próximo aos Parques da Cidade, Jardim Botânico e Sesc Jundiaí.' },
  { q: 'Quais são as metragens e plantas disponíveis?', a: 'São apartamentos de 72,19m² (2 dormitórios) e 95,32m² (3 dormitórios), em plantas que privilegiam conforto e funcionalidade.' },
  { q: 'Quantas torres e unidades terá o empreendimento?', a: 'São 2 torres, totalizando 268 unidades, com térreo + 16 pavimentos tipo e 4 elevadores por torre.' },
  { q: 'Como funcionam as vagas de garagem?', a: 'O empreendimento conta com 495 vagas vinculadas, distribuídas entre o Edifício Garagem e a implantação.' },
  { q: 'Qual a previsão de entrega?', a: 'A previsão de entrega é de 39 meses. A incorporação está registrada no 1º Oficial de Registro de Imóveis da Comarca de Jundiaí/SP.' },
  { q: 'Quem é a construtora?', a: 'A Santa Angela Construtora atua há mais de 40 anos em Jundiaí, Americana e Itatiba, acompanhando cada projeto do início até a entrega das chaves.' },
];

/* ------------------------------------------------------------------ */
/* Props (data-props do dc-runtime; defaults = "")                     */
/* ------------------------------------------------------------------ */

export type JardinsDoHortoProps = {
  whatsappUrl?: string;
  imobiliaria?: string;
  telefone?: string;
  email?: string;
};

export default function JardinsDoHorto({
  whatsappUrl = '',
  imobiliaria = '',
  telefone = '',
  email = '',
}: JardinsDoHortoProps) {
  const [menu, setMenu] = useState(false);
  const [lb, setLb] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  // waHref: replica exata de renderVals — (wa && wa.length) ? wa : '#contato'.
  const waHref = whatsappUrl && whatsappUrl.length ? whatsappUrl : '#contato';

  const g = lb != null ? gallery[lb] : null;
  const lbPos = lb != null ? `${lb + 1} / ${gallery.length}` : '';

  const toggleMenu = () => setMenu((s) => !s);
  const closeMenu = () => setMenu(false);

  const openLb = (e: React.MouseEvent<HTMLButtonElement>) => {
    const i = parseInt(e.currentTarget.dataset.idx || '0', 10);
    setLb(i);
  };
  const closeLb = (e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLb(null);
  };
  const lbNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLb((s) => (s == null ? s : (s + 1) % gallery.length));
  };
  const lbPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLb((s) => (s == null ? s : (s - 1 + gallery.length) % gallery.length));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.currentTarget as HTMLFormElement;
    const val = (n: string) =>
      (f.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
    sendLead({
      name: val('nome'),
      phone: val('telefone'),
      email: val('email'),
      source: 'landing_jardins-do-horto',
      interest: 'Jardins do Horto',
      message: val('interesse'),
    });
    setSent(true);
  };

  /* ------- Teclado do lightbox (initScroll usa refs; ver useEffect abaixo) ------- */
  const lbRef = useRef<number | null>(lb);
  lbRef.current = lb;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lbRef.current == null) return;
      if (e.key === 'Escape') setLb(null);
      if (e.key === 'ArrowRight') setLb((s) => (s == null ? s : (s + 1) % gallery.length));
      if (e.key === 'ArrowLeft') setLb((s) => (s == null ? s : (s - 1 + gallery.length) % gallery.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ------- initScroll: header + parallax do hero (rAF) ------- */
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-header]');
    const heroImg = document.querySelector<HTMLElement>('[data-hero-img]');
    const burger = document.querySelector<HTMLElement>('[data-burger]');
    let ticking = false;
    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      if (header) {
        const s = y > 40;
        header.style.background = s ? 'rgba(244,238,228,.94)' : 'transparent';
        header.style.backdropFilter = s ? 'saturate(150%) blur(12px)' : 'none';
        (header.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = s ? 'saturate(150%) blur(12px)' : 'none';
        header.style.boxShadow = s ? '0 1px 0 rgba(32,29,25,.08)' : 'none';
        header.querySelectorAll<HTMLElement>('[data-navlink]').forEach((a) => {
          a.style.color = s ? '#201D19' : 'rgba(255,255,255,.92)';
        });
        const lw = header.querySelector<HTMLElement>('[data-logo-white]');
        const ld = header.querySelector<HTMLElement>('[data-logo-dark]');
        if (lw && ld) {
          lw.style.opacity = s ? '0' : '1';
          ld.style.opacity = s ? '1' : '0';
        }
        if (burger) burger.style.background = s ? '#201D19' : '#fff';
      }
      if (heroImg) heroImg.style.transform = 'translate3d(0,' + y * 0.16 + 'px,0) scale(1.12)';
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ------- initReveal: IntersectionObserver + fallback setTimeout(1200) ------- */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    let io: IntersectionObserver | null = null;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              (en.target as HTMLElement).style.opacity = '1';
              (en.target as HTMLElement).style.transform = 'none';
              io!.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      els.forEach((el) => io!.observe(el));
    }
    // fallback do estático: garante visibilidade após 1200ms
    const t = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((e) => {
        e.style.opacity = '1';
        e.style.transform = 'none';
      });
    }, 1200);
    return () => {
      if (io) io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  /* ------- initCounters: contagem animada (rAF) disparada por IO ------- */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count]');
    const run = (el: HTMLElement) => {
      const target = parseFloat(el.getAttribute('data-count') || '0') || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1500;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    let io: IntersectionObserver | null = null;
    if (!('IntersectionObserver' in window)) {
      els.forEach(run);
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              run(en.target as HTMLElement);
              io!.unobserve(en.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      els.forEach((el) => io!.observe(el));
    }
    return () => {
      if (io) io.disconnect();
    };
  }, []);

  /* ------- initPlanta: tabs 72/95 com troca de painel + animação de entrada ------- */
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-planta]');
    if (!root) return;
    const tabs = root.querySelectorAll<HTMLElement>('[data-tab]');
    const panels = root.querySelectorAll<HTMLElement>('[data-panel]');
    const setActive = (key: string) => {
      tabs.forEach((t) => {
        const on = t.getAttribute('data-tab') === key;
        t.style.background = on ? '#C75D40' : 'transparent';
        t.style.color = on ? '#fff' : '#6c6459';
      });
      panels.forEach((p) => {
        const on = p.getAttribute('data-panel') === key;
        p.style.display = on ? 'grid' : 'none';
        if (on) {
          p.style.opacity = '0';
          p.style.transform = 'translateY(18px)';
          requestAnimationFrame(() => {
            p.style.opacity = '1';
            p.style.transform = 'none';
          });
        }
      });
    };
    const handlers: Array<[HTMLElement, () => void]> = [];
    tabs.forEach((t) => {
      const h = () => setActive(t.getAttribute('data-tab') || '');
      t.addEventListener('click', h);
      handlers.push([t, h]);
    });
    return () => {
      handlers.forEach(([t, h]) => t.removeEventListener('click', h));
    };
  }, []);

  /* ------- applyContact: patch do rodapé a partir das props ------- */
  useEffect(() => {
    const t = document.querySelector('[data-tel]');
    if (t && telefone) t.textContent = 'WhatsApp · ' + telefone;
    const m = document.querySelector('[data-mail]');
    if (m && email) m.textContent = email;
    const im = document.querySelector('[data-imob]');
    if (im && imobiliaria) im.textContent = 'Anunciado por ' + imobiliaria;
  }, [telefone, email, imobiliaria]);

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */
  return (
    <div style={parseStyle("font-family:'Manrope',system-ui,sans-serif; color:#201D19; overflow-x:hidden; position:relative;")}>
      {/* ============ HEADER ============ */}
      <header data-header="" style={parseStyle('position:fixed; top:0; left:0; right:0; z-index:90; transition:background .4s ease, box-shadow .4s ease; background:transparent;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto; padding:18px 32px; display:flex; align-items:center; justify-content:space-between; gap:24px;')}>
          <a href="#topo" style={parseStyle('position:relative; display:block; height:46px; width:160px; flex-shrink:0;')}>
            <img data-logo-white="" src={IMG + 'a001.png'} alt="Jardins do Horto" style={parseStyle('position:absolute; inset:0; height:100%; width:auto; object-fit:contain; object-position:left center; transition:opacity .35s ease; opacity:1;')} />
            <img data-logo-dark="" src={IMG + 'a000.png'} alt="Jardins do Horto" style={parseStyle('position:absolute; inset:0; height:100%; width:auto; object-fit:contain; object-position:left center; transition:opacity .35s ease; opacity:0;')} />
          </a>
          <nav style={parseStyle('display:flex; align-items:center; gap:30px;')} data-desktopnav="">
            <a data-navlink="" href="#empreendimento" style={parseStyle('text-decoration:none; color:rgba(255,255,255,.92); font-size:14px; font-weight:600; letter-spacing:.01em; transition:color .35s ease, opacity .2s;')}>O Empreendimento</a>
            <a data-navlink="" href="#localizacao" style={parseStyle('text-decoration:none; color:rgba(255,255,255,.92); font-size:14px; font-weight:600; transition:color .35s ease, opacity .2s;')}>Localização</a>
            <a data-navlink="" href="#plantas" style={parseStyle('text-decoration:none; color:rgba(255,255,255,.92); font-size:14px; font-weight:600; transition:color .35s ease, opacity .2s;')}>Plantas</a>
            <a data-navlink="" href="#lazer" style={parseStyle('text-decoration:none; color:rgba(255,255,255,.92); font-size:14px; font-weight:600; transition:color .35s ease, opacity .2s;')}>Lazer</a>
            <a data-navlink="" href="#diferenciais" style={parseStyle('text-decoration:none; color:rgba(255,255,255,.92); font-size:14px; font-weight:600; transition:color .35s ease, opacity .2s;')}>Diferenciais</a>
            <Hoverable as="a" href="#contato" baseStyle={parseStyle('text-decoration:none; background:#C75D40; color:#fff; font-size:14px; font-weight:700; padding:12px 22px; border-radius:100px; letter-spacing:.01em; transition:background .25s ease, transform .25s ease;')} hoverStyle={parseStyle('background:#AE4D33; transform:translateY(-2px);')}>Fale com um corretor</Hoverable>
          </nav>
          <button data-menubtn="" onClick={toggleMenu} aria-label="Menu" style={parseStyle('display:none; background:transparent; border:0; cursor:pointer; padding:8px;')}>
            <span data-burger="" style={parseStyle('display:block; width:26px; height:2px; background:#fff; box-shadow:0 8px 0 #fff, 0 -8px 0 #fff; transition:background .35s ease;')}></span>
          </button>
        </div>
      </header>

      {/* ============ MOBILE MENU ============ */}
      {menu && (
        <div style={parseStyle('position:fixed; inset:0; z-index:95; background:#1C1A17; display:flex; flex-direction:column; padding:28px 32px;')}>
          <div style={parseStyle('display:flex; align-items:center; justify-content:space-between;')}>
            <img src={IMG + 'a001.png'} alt="Jardins do Horto" style={parseStyle('height:44px;')} />
            <button onClick={closeMenu} aria-label="Fechar" style={parseStyle('background:transparent; border:0; color:#fff; font-size:30px; cursor:pointer; line-height:1;')}>×</button>
          </div>
          <div style={parseStyle('display:flex; flex-direction:column; gap:6px; margin-top:48px;')}>
            <a onClick={closeMenu} href="#empreendimento" style={parseStyle("text-decoration:none; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:34px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.1);")}>O Empreendimento</a>
            <a onClick={closeMenu} href="#localizacao" style={parseStyle("text-decoration:none; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:34px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.1);")}>Localização</a>
            <a onClick={closeMenu} href="#plantas" style={parseStyle("text-decoration:none; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:34px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.1);")}>Plantas</a>
            <a onClick={closeMenu} href="#lazer" style={parseStyle("text-decoration:none; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:34px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.1);")}>Lazer</a>
            <a onClick={closeMenu} href="#diferenciais" style={parseStyle("text-decoration:none; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:34px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.1);")}>Diferenciais</a>
          </div>
          <a onClick={closeMenu} href="#contato" style={parseStyle('margin-top:auto; text-align:center; text-decoration:none; background:#C75D40; color:#fff; font-weight:700; padding:18px; border-radius:100px; font-size:16px;')}>Fale com um corretor</a>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section id="topo" data-screen-label="Hero" style={parseStyle('position:relative; min-height:680px; height:90vh; max-height:900px; display:flex; align-items:flex-end; overflow:hidden; background:#1C1A17;')}>
        <img data-hero-img="" src={IMG + 'a004.jpg'} alt="Fachada do Jardins do Horto ao pôr do sol — duas torres no Horto Florestal, Jundiaí" style={parseStyle('position:absolute; top:-6%; left:0; width:100%; height:112%; object-fit:cover; will-change:transform; transform:scale(1.12);')} />
        <div style={parseStyle('position:absolute; inset:0; background:linear-gradient(180deg, rgba(20,17,14,.62) 0%, rgba(20,17,14,.22) 34%, rgba(20,17,14,.30) 60%, rgba(20,17,14,.92) 100%);')}></div>
        <div style={parseStyle('position:absolute; inset:0; background:linear-gradient(96deg, rgba(20,17,14,.66) 0%, rgba(20,17,14,.30) 38%, rgba(20,17,14,0) 66%);')}></div>
        <div style={parseStyle('position:absolute; top:0; left:0; right:0; height:200px; background:linear-gradient(180deg, rgba(15,12,10,.6) 0%, rgba(15,12,10,0) 100%);')}></div>
        <div style={parseStyle('position:relative; width:100%; max-width:1340px; margin:0 auto; padding:clamp(118px,17vh,180px) 32px 64px;')}>
          <div style={parseStyle('display:inline-flex; align-items:center; gap:10px; padding:8px 16px; border:1px solid rgba(255,255,255,.32); border-radius:100px; backdrop-filter:blur(4px); margin-bottom:26px;')}>
            <span style={parseStyle('width:7px; height:7px; border-radius:50%; background:#F09080; box-shadow:0 0 0 0 rgba(240,144,128,.6); animation:jh-pulse 2.4s infinite;')}></span>
            <span style={parseStyle('color:#fff; font-size:12.5px; font-weight:600; letter-spacing:.22em; text-transform:uppercase;')}>Em obras · Horto Florestal, Jundiaí</span>
          </div>
          <h1 style={parseStyle("margin:0; color:#fff; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(44px,7.4vw,104px); line-height:.97; letter-spacing:-.01em; text-shadow:0 2px 50px rgba(0,0,0,.4);")}>
            O brilho de<br /><span style={parseStyle('font-style:italic; color:#F4D9CF;')}>morar bem</span>
          </h1>
          <p style={parseStyle('margin:24px 0 0; color:rgba(255,255,255,.9); font-size:clamp(16px,1.5vw,20px); max-width:560px; line-height:1.55; font-weight:400;')}>
            No coração do Horto Florestal, apartamentos de 72m² e 95m² que unem modernidade, lazer completo e a comodidade de viver ao lado do Maxi Shopping Jundiaí.
          </p>
          <div style={parseStyle('display:flex; flex-wrap:wrap; gap:14px; margin-top:36px;')}>
            <Hoverable as="a" href="#contato" baseStyle={parseStyle('text-decoration:none; background:#C75D40; color:#fff; font-weight:700; font-size:16px; padding:18px 34px; border-radius:100px; transition:background .25s ease, transform .25s ease, box-shadow .25s ease; box-shadow:0 14px 40px -12px rgba(199,93,64,.7);')} hoverStyle={parseStyle('background:#AE4D33; transform:translateY(-3px);')}>Agende sua visita</Hoverable>
            <Hoverable as="a" href="#lazer" baseStyle={parseStyle('text-decoration:none; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.45); color:#fff; font-weight:600; font-size:16px; padding:18px 30px; border-radius:100px; backdrop-filter:blur(6px); transition:background .25s ease;')} hoverStyle={parseStyle('background:rgba(255,255,255,.2);')}>Conheça o lazer</Hoverable>
          </div>
          <div style={parseStyle('display:flex; flex-wrap:wrap; gap:34px; margin-top:48px; padding-top:30px; border-top:1px solid rgba(255,255,255,.18);')}>
            <div><div style={parseStyle("color:#fff; font-family:'Cormorant Garamond',serif; font-size:30px; line-height:1;")}>72 e 95m²</div><div style={parseStyle('color:rgba(255,255,255,.65); font-size:13px; margin-top:4px; letter-spacing:.04em;')}>Metragens</div></div>
            <div><div style={parseStyle("color:#fff; font-family:'Cormorant Garamond',serif; font-size:30px; line-height:1;")}>2 e 3</div><div style={parseStyle('color:rgba(255,255,255,.65); font-size:13px; margin-top:4px; letter-spacing:.04em;')}>Dormitórios</div></div>
            <div><div style={parseStyle("color:#fff; font-family:'Cormorant Garamond',serif; font-size:30px; line-height:1;")}>268</div><div style={parseStyle('color:rgba(255,255,255,.65); font-size:13px; margin-top:4px; letter-spacing:.04em;')}>Unidades · 2 torres</div></div>
          </div>
        </div>
        <div style={parseStyle('position:absolute; bottom:26px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:6px;')}>
          <span style={parseStyle('color:rgba(255,255,255,.7); font-size:11px; letter-spacing:.24em; text-transform:uppercase;')}>Role</span>
          <span style={parseStyle('width:1px; height:36px; background:linear-gradient(#fff,transparent); animation:jh-cue 2s infinite;')}></span>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section id="empreendimento" data-screen-label="Empreendimento" style={parseStyle('position:relative; background:#F4EEE4; padding:clamp(80px,11vw,150px) 32px;')}>
        <img src={IMG + 'a002.png'} alt="" aria-hidden="true" style={parseStyle('position:absolute; top:40px; right:6%; width:clamp(120px,16vw,230px); opacity:.5; animation:jh-float 7s ease-in-out infinite; pointer-events:none;')} />
        <div style={parseStyle('max-width:1040px; margin:0 auto; position:relative;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#C75D40; margin-bottom:24px;')}>O Empreendimento</div>
            <h2 style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(34px,5vw,68px); line-height:1.04; letter-spacing:-.01em; max-width:18ch;")}>
              Bem pensado, bem localizado e <span style={parseStyle('font-style:italic; color:#C75D40;')}>deslumbrante.</span>
            </h2>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:clamp(28px,4vw,64px); margin-top:54px;')}>
            <p data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1) .08s, transform .9s cubic-bezier(.22,1,.36,1) .08s; margin:0; font-size:17px; line-height:1.75; color:#4A4239;')}>
              Uma síntese entre modernidade e a comodidade do entorno, trazendo uma experiência única de moradia. Cada detalhe foi planejado para atender às necessidades dos moradores, promovendo interação social e momentos de lazer inesquecíveis.
            </p>
            <p data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1) .18s, transform .9s cubic-bezier(.22,1,.36,1) .18s; margin:0; font-size:17px; line-height:1.75; color:#4A4239;')}>
              As fachadas das torres foram projetadas com empenas de volumetria retilínea e contemporânea, enquanto as pinturas dinâmicas adicionam movimento à arquitetura. O paisagismo detalhado conecta os espaços e cria um ambiente propício ao convívio comunitário.
            </p>
          </div>
        </div>
      </section>

      {/* ============ NÚMEROS (dark) ============ */}
      <section data-screen-label="Números" style={parseStyle('background:#1C1A17; padding:clamp(70px,9vw,120px) 32px; position:relative;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1); text-align:center; margin-bottom:64px;')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#F09080; margin-bottom:18px;')}>Dados do empreendimento</div>
            <h2 style={parseStyle("margin:0; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(30px,4vw,52px);")}>A escala de um grande projeto</h2>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:1px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.1); border-radius:18px; overflow:hidden;')}>
            {stats.map((s, i) => (
              <div key={i} data-reveal="" style={parseStyle('opacity:0; transform:translateY(24px); transition:opacity .8s ease, transform .8s ease; background:#1C1A17; padding:38px 22px; text-align:center;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif; color:#fff; font-size:clamp(40px,5vw,60px); line-height:1; font-weight:600;")}><span data-count={s.n} data-suffix={s.suffix}>{s.n}{s.suffix}</span></div>
                <div style={parseStyle('color:rgba(244,238,228,.6); font-size:13.5px; margin-top:12px; letter-spacing:.04em;')}>{s.l}</div>
              </div>
            ))}
          </div>
          <p data-reveal="" style={parseStyle('opacity:0; transform:translateY(24px); transition:opacity .8s ease, transform .8s ease; text-align:center; color:rgba(244,238,228,.45); font-size:13px; margin:28px auto 0; max-width:760px; line-height:1.6;')}>
            Térreo + 16 pavimentos · Apartamentos de 95,32m² e 72,19m² · 495 vagas vinculadas distribuídas entre Edifício Garagem e implantação · Previsão de entrega: 39 meses.
          </p>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section id="localizacao" data-screen-label="Localização" style={parseStyle('background:#F4EEE4; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto; display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(36px,5vw,80px); align-items:center;')} data-loc-grid="">
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#C75D40; margin-bottom:22px;')}>Localização</div>
            <h2 style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(32px,4.4vw,60px); line-height:1.05;")}>No coração do <span style={parseStyle('font-style:italic; color:#C75D40;')}>Horto Florestal</span></h2>
            <p style={parseStyle('font-size:17px; line-height:1.7; color:#4A4239; margin:24px 0 0; max-width:46ch;')}>
              Infraestrutura completa de comércio, serviços e lazer, ao lado de um dos shoppings mais tradicionais da cidade — com acesso rápido às principais avenidas e rodovias de Jundiaí.
            </p>
            <div style={parseStyle('display:flex; align-items:flex-start; gap:14px; margin:30px 0; padding:20px 22px; background:#FBF7F0; border:1px solid rgba(32,29,25,.08); border-radius:14px;')}>
              <span style={parseStyle('color:#C75D40; font-size:22px; line-height:1.2;')}>◍</span>
              <div>
                <div style={parseStyle('font-weight:700; font-size:15px;')}>Rua Irineu de Toledo, nº 225</div>
                <div style={parseStyle('color:#6c6459; font-size:14px; margin-top:3px;')}>Horto Florestal · Jundiaí / SP</div>
              </div>
            </div>
            <div style={parseStyle('display:flex; flex-wrap:wrap; gap:10px;')}>
              {nearby.map((n, i) => (
                <span key={i} style={parseStyle('display:inline-flex; align-items:center; gap:8px; padding:10px 16px; background:rgba(240,144,128,.12); border:1px solid rgba(240,144,128,.35); border-radius:100px; font-size:13.5px; font-weight:600; color:#9c4a31;')}>{n}</span>
              ))}
            </div>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px) scale(.98); transition:opacity 1s ease, transform 1s cubic-bezier(.22,1,.36,1); position:relative;')}>
            <div style={parseStyle('position:relative; border-radius:20px; overflow:hidden; box-shadow:0 40px 80px -40px rgba(32,29,25,.45);')}>
              <img src={IMG + 'a005.jpg'} alt="Vista aérea de Jundiaí e do bairro Horto Florestal" loading="lazy" style={parseStyle('width:100%; display:block; aspect-ratio:4/3; object-fit:cover;')} />
              <div style={parseStyle('position:absolute; left:18px; bottom:18px; background:rgba(28,26,23,.78); backdrop-filter:blur(6px); color:#fff; padding:10px 16px; border-radius:100px; font-size:13px; font-weight:600;')}>Vista aérea · Jundiaí / SP</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section id="plantas" data-screen-label="Plantas" data-planta="" style={parseStyle('background:#EDE5D8; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:1180px; margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1); text-align:center; margin-bottom:14px;')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#C75D40; margin-bottom:18px;')}>Plantas</div>
            <h2 style={parseStyle("margin:0 0 30px; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(32px,4.4vw,60px); line-height:1.05;")}>Escolha o seu espaço</h2>
            <div style={parseStyle('display:inline-flex; padding:5px; background:#FBF7F0; border:1px solid rgba(32,29,25,.1); border-radius:100px; gap:4px;')}>
              <button data-tab="72" style={parseStyle("border:0; cursor:pointer; padding:13px 30px; border-radius:100px; font-family:'Manrope',sans-serif; font-weight:700; font-size:15px; transition:all .3s ease; background:#C75D40; color:#fff;")}>72m² · 2 dorm.</button>
              <button data-tab="95" style={parseStyle("border:0; cursor:pointer; padding:13px 30px; border-radius:100px; font-family:'Manrope',sans-serif; font-weight:700; font-size:15px; transition:all .3s ease; background:transparent; color:#6c6459;")}>95m² · 3 dorm.</button>
            </div>
          </div>

          <div data-panel="72" data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s ease, transform .9s ease; display:grid; grid-template-columns:1.25fr .75fr; gap:clamp(28px,4vw,56px); align-items:center; margin-top:46px;')} data-planta-grid="">
            <div style={parseStyle('background:#FBF7F0; border:1px solid rgba(32,29,25,.08); border-radius:20px; padding:26px; box-shadow:0 30px 60px -40px rgba(32,29,25,.4);')}>
              <img src={IMG + 'a006.png'} alt="Planta humanizada do apartamento de 72m² (2 dormitórios) — Jardins do Horto" loading="lazy" style={parseStyle('width:100%; display:block;')} />
            </div>
            <div>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:clamp(44px,6vw,72px); line-height:1; color:#201D19;")}>72<span style={parseStyle('font-size:.42em; vertical-align:super; color:#C75D40;')}>m²</span></div>
              <div style={parseStyle('color:#6c6459; font-size:15px; margin-top:6px; letter-spacing:.02em;')}>72,19m² privativos · final 08</div>
              <div style={parseStyle('height:1px; background:rgba(32,29,25,.1); margin:24px 0;')}></div>
              <ul style={parseStyle('list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;')}>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> 2 dormitórios</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Pé direito de 2,70m</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Bancadas em mármore e granito</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Esquadrias de alumínio sob medida</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Infra. para ar-condicionado</li>
              </ul>
              <Hoverable as="a" href="#contato" baseStyle={parseStyle('display:inline-block; margin-top:30px; text-decoration:none; background:#201D19; color:#fff; font-weight:700; font-size:15px; padding:15px 28px; border-radius:100px; transition:background .25s ease;')} hoverStyle={parseStyle('background:#C75D40;')}>Quero esta planta</Hoverable>
            </div>
          </div>

          <div data-panel="95" data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s ease, transform .9s ease; display:none; grid-template-columns:1.25fr .75fr; gap:clamp(28px,4vw,56px); align-items:center; margin-top:46px;')}>
            <div style={parseStyle('background:#FBF7F0; border:1px solid rgba(32,29,25,.08); border-radius:20px; padding:26px; box-shadow:0 30px 60px -40px rgba(32,29,25,.4);')}>
              <img src={IMG + 'a007.png'} alt="Planta humanizada do apartamento de 95m² (3 dormitórios) — Jardins do Horto" loading="lazy" style={parseStyle('width:100%; display:block;')} />
            </div>
            <div>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif; font-size:clamp(44px,6vw,72px); line-height:1; color:#201D19;")}>95<span style={parseStyle('font-size:.42em; vertical-align:super; color:#C75D40;')}>m²</span></div>
              <div style={parseStyle('color:#6c6459; font-size:15px; margin-top:6px; letter-spacing:.02em;')}>95,32m² privativos · final 01</div>
              <div style={parseStyle('height:1px; background:rgba(32,29,25,.1); margin:24px 0;')}></div>
              <ul style={parseStyle('list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;')}>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> 3 dormitórios</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Pé direito de 2,70m</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Bancadas em mármore e granito</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Tratamento acústico no contrapiso</li>
                <li style={parseStyle('display:flex; gap:12px; font-size:15px; color:#3a342d;')}><span style={parseStyle('color:#C75D40; font-weight:700;')}>—</span> Infra. para automação e Wi-Fi</li>
              </ul>
              <Hoverable as="a" href="#contato" baseStyle={parseStyle('display:inline-block; margin-top:30px; text-decoration:none; background:#201D19; color:#fff; font-weight:700; font-size:15px; padding:15px 28px; border-radius:100px; transition:background .25s ease;')} hoverStyle={parseStyle('background:#C75D40;')}>Quero esta planta</Hoverable>
            </div>
          </div>
          <p style={parseStyle('text-align:center; color:#8a8175; font-size:12px; margin-top:34px;')}>Imagens meramente ilustrativas, representando perspectivas artísticas das plantas tipo.</p>
        </div>
      </section>

      {/* ============ LAZER (galeria) ============ */}
      <section id="lazer" data-screen-label="Lazer" style={parseStyle('background:#1C1A17; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:24px; margin-bottom:50px;')}>
            <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);')}>
              <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#F09080; margin-bottom:18px;')}>Lazer e Convivência</div>
              <h2 style={parseStyle("margin:0; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(32px,4.6vw,64px); line-height:1.03; max-width:14ch;")}>Um clube dentro de casa</h2>
            </div>
            <p data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s ease .1s, transform .9s ease .1s; color:rgba(244,238,228,.6); font-size:16px; line-height:1.7; max-width:42ch; margin:0;')}>
              Piscinas, complexo fitness com Academia, SPA e vestiários, salão de festas, quadra, 2 playgrounds personalizados, espaço pet, pista de cooper, horta e muito mais.
            </p>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:repeat(12,1fr); grid-auto-rows:200px; gap:14px;')} data-gallery-grid="">
            {gallery.map((gi, i) => (
              <button
                key={i}
                onClick={openLb}
                data-idx={i}
                data-reveal=""
                style={parseStyle(`opacity:0; transform:translateY(26px); transition:opacity .8s ease, transform .8s ease; grid-column:span ${gi.col}; grid-row:span ${gi.row}; position:relative; border:0; padding:0; cursor:pointer; border-radius:14px; overflow:hidden; background:#2a2723;`)}
              >
                <HoverImg src={gi.img} cap={gi.cap} />
                <div style={parseStyle('position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.78) 100%);')}></div>
                <div style={parseStyle('position:absolute; left:16px; right:16px; bottom:14px; text-align:left;')}>
                  <div style={parseStyle('color:#F09080; font-size:11px; font-weight:700; letter-spacing:.18em; text-transform:uppercase;')}>{gi.tag}</div>
                  <div style={parseStyle("color:#fff; font-family:'Cormorant Garamond',serif; font-size:21px; line-height:1.1; margin-top:2px;")}>{gi.cap}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section id="diferenciais" data-screen-label="Diferenciais" style={parseStyle('background:#F4EEE4; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1); margin-bottom:54px; max-width:680px;')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#C75D40; margin-bottom:20px;')}>Diferenciais</div>
            <h2 style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(32px,4.4vw,60px); line-height:1.05;")}>Pensado nos detalhes que fazem a diferença</h2>
          </div>
          <div style={parseStyle('display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:clamp(22px,3vw,40px);')}>
            <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(28px); transition:opacity .85s ease, transform .85s ease;')}>
              <h3 style={parseStyle("font-family:'Manrope',sans-serif; font-size:14px; letter-spacing:.06em; text-transform:uppercase; color:#C75D40; margin:0 0 20px; padding-bottom:14px; border-bottom:2px solid rgba(199,93,64,.25);")}>Áreas comuns</h3>
              <ul style={parseStyle('list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:15px;')}>
                {difComuns.map((d, i) => (
                  <li key={i} style={parseStyle('display:flex; gap:12px; font-size:15.5px; line-height:1.5; color:#3a342d;')}><span style={parseStyle('color:#C75D40;')}>✦</span>{d}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(28px); transition:opacity .85s ease .08s, transform .85s ease .08s;')}>
              <h3 style={parseStyle("font-family:'Manrope',sans-serif; font-size:14px; letter-spacing:.06em; text-transform:uppercase; color:#C75D40; margin:0 0 20px; padding-bottom:14px; border-bottom:2px solid rgba(199,93,64,.25);")}>Gerais</h3>
              <ul style={parseStyle('list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:15px;')}>
                {difGerais.map((d, i) => (
                  <li key={i} style={parseStyle('display:flex; gap:12px; font-size:15.5px; line-height:1.5; color:#3a342d;')}><span style={parseStyle('color:#C75D40;')}>✦</span>{d}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(28px); transition:opacity .85s ease .16s, transform .85s ease .16s;')}>
              <h3 style={parseStyle("font-family:'Manrope',sans-serif; font-size:14px; letter-spacing:.06em; text-transform:uppercase; color:#C75D40; margin:0 0 20px; padding-bottom:14px; border-bottom:2px solid rgba(199,93,64,.25);")}>Nas unidades</h3>
              <ul style={parseStyle('list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:15px;')}>
                {difUnidades.map((d, i) => (
                  <li key={i} style={parseStyle('display:flex; gap:12px; font-size:15.5px; line-height:1.5; color:#3a342d;')}><span style={parseStyle('color:#C75D40;')}>✦</span>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(28px); transition:opacity .85s ease, transform .85s ease; margin-top:56px; padding:34px clamp(24px,4vw,48px); background:#201D19; border-radius:20px; display:flex; flex-wrap:wrap; align-items:center; gap:30px; justify-content:space-between;')}>
            <div style={parseStyle("color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-size:clamp(22px,2.4vw,30px); max-width:18ch;")}>Qualidade e segurança certificadas</div>
            <div style={parseStyle('display:flex; flex-wrap:wrap; gap:14px;')}>
              {qualidade.map((q, i) => (
                <span key={i} style={parseStyle('padding:11px 18px; border:1px solid rgba(255,255,255,.22); border-radius:100px; color:#F4EEE4; font-size:13.5px; font-weight:600;')}>{q}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOBRE SANTA ANGELA ============ */}
      <section data-screen-label="Construtora" style={parseStyle('position:relative; background:#2E3A2C; padding:clamp(80px,11vw,150px) 32px; overflow:hidden;')}>
        <img src={IMG + 'a003.jpg'} alt="" aria-hidden="true" style={parseStyle('position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.16;')} />
        <div style={parseStyle('position:absolute; inset:0; background:linear-gradient(90deg, #2E3A2C 30%, rgba(46,58,44,.6));')}></div>
        <div style={parseStyle('position:relative; max-width:760px; margin:0 auto; text-align:center;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#F09080; margin-bottom:24px;')}>Realização · Santa Angela</div>
            <h2 style={parseStyle("margin:0; color:#F6F1E9; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(30px,4.4vw,58px); line-height:1.1;")}>Há mais de 40 anos realizando o sonho de morar bem</h2>
            <p style={parseStyle('color:rgba(246,241,233,.82); font-size:17px; line-height:1.75; margin:28px 0 0;')}>
              Presente em Jundiaí, Americana e Itatiba, a Construtora Santa Angela acompanha todas as fases de cada empreendimento — do início dos projetos à entrega das chaves. Com confiança, respeito e comprometimento, queremos que sua família viva a melhor experiência.
            </p>
            <p style={parseStyle("color:#F09080; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:clamp(22px,3vw,32px); margin:34px 0 0;")}>&quot;O brilho do interior é ter você.&quot;</p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section data-screen-label="FAQ" style={parseStyle('background:#F4EEE4; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:880px; margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1); text-align:center; margin-bottom:48px;')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#C75D40; margin-bottom:18px;')}>Perguntas frequentes</div>
            <h2 style={parseStyle("margin:0; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(30px,4.2vw,54px);")}>Tudo que você precisa saber</h2>
          </div>
          <div style={parseStyle('display:flex; flex-direction:column; gap:12px;')}>
            {faqs.map((f, i) => (
              <details key={i} data-faq="" data-reveal="" style={parseStyle('opacity:0; transform:translateY(20px); transition:opacity .7s ease, transform .7s ease; background:#FBF7F0; border:1px solid rgba(32,29,25,.08); border-radius:14px; padding:4px 24px;')}>
                <summary style={parseStyle('list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px 0; font-weight:700; font-size:16.5px; color:#201D19;')}>
                  {f.q}
                  <span data-faq-plus="" style={parseStyle('color:#C75D40; font-size:24px; line-height:1; transition:transform .3s ease; flex-shrink:0;')}>+</span>
                </summary>
                <p style={parseStyle('margin:0; padding:0 0 22px; color:#544c43; font-size:15.5px; line-height:1.7;')}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTATO ============ */}
      <section id="contato" data-screen-label="Contato" style={parseStyle('background:#1C1A17; padding:clamp(80px,11vw,150px) 32px;')}>
        <div style={parseStyle('max-width:1180px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:clamp(40px,6vw,90px); align-items:center;')} data-contact-grid="">
          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1);')}>
            <div style={parseStyle('font-size:13px; letter-spacing:.24em; text-transform:uppercase; font-weight:600; color:#F09080; margin-bottom:22px;')}>Agende sua visita</div>
            <h2 style={parseStyle("margin:0; color:#F4EEE4; font-family:'Cormorant Garamond',serif; font-weight:500; font-size:clamp(34px,4.6vw,62px); line-height:1.04;")}>Venha conhecer o <span style={parseStyle('font-style:italic; color:#F09080;')}>Jardins do Horto</span></h2>
            <p style={parseStyle('color:rgba(244,238,228,.66); font-size:17px; line-height:1.7; margin:24px 0 0; max-width:44ch;')}>
              Deixe seus dados e um corretor entrará em contato para apresentar plantas, condições e agendar sua visita ao decorado. Sem compromisso.
            </p>
            <div style={parseStyle('margin-top:34px; display:flex; flex-direction:column; gap:16px;')}>
              <a href={waHref} target="_blank" rel="noopener" style={parseStyle('display:inline-flex; align-items:center; gap:12px; text-decoration:none; color:#F4EEE4; font-weight:600; font-size:16px;')}>
                <span style={parseStyle('display:grid; place-items:center; width:46px; height:46px; border-radius:50%; background:#25D366; color:#fff; font-size:20px; flex-shrink:0;')}>✆</span>
                Falar agora no WhatsApp
              </a>
              <div style={parseStyle('display:flex; align-items:center; gap:12px; color:rgba(244,238,228,.7); font-size:15px;')}>
                <span style={parseStyle('display:grid; place-items:center; width:46px; height:46px; border-radius:50%; background:rgba(255,255,255,.08); color:#F09080; font-size:18px; flex-shrink:0;')}>◍</span>
                Rua Irineu de Toledo, 225 · Horto Florestal, Jundiaí/SP
              </div>
            </div>
          </div>

          <div data-reveal="" style={parseStyle('opacity:0; transform:translateY(30px); transition:opacity .9s cubic-bezier(.22,1,.36,1) .1s, transform .9s cubic-bezier(.22,1,.36,1) .1s;')}>
            {sent && (
              <div style={parseStyle('background:#FBF7F0; border-radius:20px; padding:54px 38px; text-align:center;')}>
                <div style={parseStyle('width:70px; height:70px; border-radius:50%; background:#25D366; color:#fff; display:grid; place-items:center; font-size:34px; margin:0 auto 22px;')}>✓</div>
                <h3 style={parseStyle("font-family:'Cormorant Garamond',serif; font-weight:600; font-size:30px; margin:0 0 10px;")}>Recebemos seu contato!</h3>
                <p style={parseStyle('color:#544c43; font-size:16px; line-height:1.6; margin:0;')}>Em breve um corretor irá falar com você para tirar todas as suas dúvidas sobre o Jardins do Horto.</p>
              </div>
            )}
            {!sent && (
              <form data-leadform="" onSubmit={onSubmit} style={parseStyle('background:#FBF7F0; border-radius:20px; padding:clamp(26px,3vw,40px);')}>
                <div style={parseStyle('display:flex; flex-direction:column; gap:16px;')}>
                  <div>
                    <label style={parseStyle('display:block; font-size:13px; font-weight:600; color:#6c6459; margin-bottom:7px;')}>Nome completo</label>
                    <FocusInput name="nome" required placeholder="Seu nome" baseStyle={parseStyle("width:100%; padding:15px 16px; border:1px solid rgba(32,29,25,.14); border-radius:11px; font-family:'Manrope',sans-serif; font-size:15px; background:#fff; outline:none; transition:border-color .2s;")} focusStyle={parseStyle('border-color:#C75D40;')} />
                  </div>
                  <div style={parseStyle('display:grid; grid-template-columns:1fr 1fr; gap:14px;')}>
                    <div>
                      <label style={parseStyle('display:block; font-size:13px; font-weight:600; color:#6c6459; margin-bottom:7px;')}>Telefone</label>
                      <FocusInput name="telefone" required placeholder="(11) 9 0000-0000" baseStyle={parseStyle("width:100%; padding:15px 16px; border:1px solid rgba(32,29,25,.14); border-radius:11px; font-family:'Manrope',sans-serif; font-size:15px; background:#fff; outline:none; transition:border-color .2s;")} focusStyle={parseStyle('border-color:#C75D40;')} />
                    </div>
                    <div>
                      <label style={parseStyle('display:block; font-size:13px; font-weight:600; color:#6c6459; margin-bottom:7px;')}>E-mail</label>
                      <FocusInput name="email" type="email" placeholder="voce@email.com" baseStyle={parseStyle("width:100%; padding:15px 16px; border:1px solid rgba(32,29,25,.14); border-radius:11px; font-family:'Manrope',sans-serif; font-size:15px; background:#fff; outline:none; transition:border-color .2s;")} focusStyle={parseStyle('border-color:#C75D40;')} />
                    </div>
                  </div>
                  <div>
                    <label style={parseStyle('display:block; font-size:13px; font-weight:600; color:#6c6459; margin-bottom:7px;')}>Interesse</label>
                    <select name="interesse" style={parseStyle("width:100%; padding:15px 16px; border:1px solid rgba(32,29,25,.14); border-radius:11px; font-family:'Manrope',sans-serif; font-size:15px; background:#fff; outline:none;")}>
                      <option>Apartamento de 72m² (2 dorm.)</option>
                      <option>Apartamento de 95m² (3 dorm.)</option>
                      <option>Ainda não sei, quero conhecer</option>
                    </select>
                  </div>
                  <label style={parseStyle('display:flex; align-items:flex-start; gap:10px; font-size:12.5px; color:#6c6459; line-height:1.45; cursor:pointer;')}>
                    <input type="checkbox" required style={parseStyle('margin-top:2px; accent-color:#C75D40;')} />
                    Autorizo o contato de corretores, inclusive por WhatsApp, para obter informações sobre o empreendimento.
                  </label>
                  <Hoverable as="button" type="submit" baseStyle={parseStyle("margin-top:6px; width:100%; border:0; cursor:pointer; background:#C75D40; color:#fff; font-family:'Manrope',sans-serif; font-weight:700; font-size:16px; padding:18px; border-radius:100px; transition:background .25s ease, transform .25s ease;")} hoverStyle={parseStyle('background:#AE4D33; transform:translateY(-2px);')}>Quero falar com um corretor</Hoverable>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={parseStyle('background:#16140F; color:rgba(244,238,228,.6); padding:64px 32px 40px;')}>
        <div style={parseStyle('max-width:1340px; margin:0 auto;')}>
          <div style={parseStyle('display:flex; flex-wrap:wrap; gap:36px; justify-content:space-between; align-items:flex-start; padding-bottom:40px; border-bottom:1px solid rgba(255,255,255,.1);')}>
            <div style={parseStyle('max-width:340px;')}>
              <img src={IMG + 'a001.png'} alt="Jardins do Horto" style={parseStyle('height:48px; margin-bottom:18px;')} />
              <p style={parseStyle('font-size:14px; line-height:1.65; margin:0;')}>Um empreendimento Santa Angela Construtora, no coração do Horto Florestal, Jundiaí/SP.</p>
            </div>
            <div>
              <div style={parseStyle('color:#F4EEE4; font-weight:700; font-size:14px; margin-bottom:14px;')}>Navegação</div>
              <div style={parseStyle('display:flex; flex-direction:column; gap:10px; font-size:14px;')}>
                <a href="#empreendimento" style={parseStyle('color:rgba(244,238,228,.6); text-decoration:none;')}>O Empreendimento</a>
                <a href="#localizacao" style={parseStyle('color:rgba(244,238,228,.6); text-decoration:none;')}>Localização</a>
                <a href="#plantas" style={parseStyle('color:rgba(244,238,228,.6); text-decoration:none;')}>Plantas</a>
                <a href="#lazer" style={parseStyle('color:rgba(244,238,228,.6); text-decoration:none;')}>Lazer</a>
              </div>
            </div>
            <div>
              <div style={parseStyle('color:#F4EEE4; font-weight:700; font-size:14px; margin-bottom:14px;')}>Contato</div>
              <div style={parseStyle('display:flex; flex-direction:column; gap:10px; font-size:14px;')}>
                <span data-imob="">Anunciado por sua imobiliária</span>
                <span data-tel="">WhatsApp · informe seu número</span>
                <span data-mail="">contato@suaimobiliaria.com.br</span>
              </div>
            </div>
          </div>
          <p style={parseStyle('font-size:11.5px; line-height:1.7; margin:26px 0 0; color:rgba(244,238,228,.4);')}>
            Imagens meramente ilustrativas. As informações constantes no Memorial de Incorporação e nos futuros Instrumentos de Compra e Venda prevalecerão sobre as divulgadas neste material. Incorporação registrada em 02 de fevereiro de 2024 no R.11 da matrícula nº 163.080 do 1º Oficial de Registro de Imóveis da Comarca de Jundiaí/SP. Quando da entrega, a vegetação poderá apresentar diferenças de tamanho e porte. Material preliminar, sujeito a alteração sem aviso prévio.
          </p>
          <div style={parseStyle('margin-top:20px; font-size:12px; color:rgba(244,238,228,.35);')}>© 2026 Jardins do Horto · Santa Angela Construtora.</div>
        </div>
      </footer>

      {/* ============ FLOAT WHATSAPP ============ */}
      <a href={waHref} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed; right:22px; bottom:22px; z-index:80; width:58px; height:58px; border-radius:50%; background:#25D366; color:#fff; display:grid; place-items:center; font-size:26px; text-decoration:none; box-shadow:0 14px 34px -8px rgba(37,211,102,.6); animation:jh-float 4s ease-in-out infinite;')}>✆</a>

      {/* ============ LIGHTBOX ============ */}
      {lb != null && (
        <div onClick={closeLb} style={parseStyle('position:fixed; inset:0; z-index:100; background:rgba(16,14,11,.94); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px;')}>
          <div style={parseStyle('position:absolute; top:22px; right:24px; display:flex; gap:14px; align-items:center;')}>
            <span style={parseStyle('color:rgba(255,255,255,.6); font-size:14px;')}>{lbPos}</span>
            <button onClick={closeLb} aria-label="Fechar" style={parseStyle('background:rgba(255,255,255,.12); border:0; color:#fff; width:44px; height:44px; border-radius:50%; font-size:24px; cursor:pointer;')}>×</button>
          </div>
          <button onClick={lbPrev} aria-label="Anterior" style={parseStyle('position:absolute; left:18px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,.12); border:0; color:#fff; width:50px; height:50px; border-radius:50%; font-size:22px; cursor:pointer;')}>‹</button>
          {g && g.img && <img src={g.img} alt={g.cap} style={parseStyle('max-width:min(1100px,92vw); max-height:78vh; object-fit:contain; border-radius:10px; box-shadow:0 30px 80px -20px rgba(0,0,0,.7);')} />}
          <button onClick={lbNext} aria-label="Próxima" style={parseStyle('position:absolute; right:18px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,.12); border:0; color:#fff; width:50px; height:50px; border-radius:50%; font-size:22px; cursor:pointer;')}>›</button>
          <div style={parseStyle('margin-top:20px; text-align:center;')}>
            <div style={parseStyle('color:#F09080; font-size:12px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;')}>{g ? g.tag : ''}</div>
            <div style={parseStyle("color:#fff; font-family:'Cormorant Garamond',serif; font-size:26px; margin-top:4px;")}>{g ? g.cap : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Imagem da galeria com hover (scale) — style-hover do <img> dentro do botão. */
function HoverImg({ src, cap }: { src: string; cap: string }) {
  const [hover, setHover] = useState(false);
  return (
    <img
      src={src}
      alt={cap}
      loading="lazy"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...parseStyle('width:100%; height:100%; object-fit:cover; display:block; transition:transform .9s cubic-bezier(.22,1,.36,1);'),
        ...(hover ? parseStyle('transform:scale(1.07);') : {}),
      }}
    />
  );
}
