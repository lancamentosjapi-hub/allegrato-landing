'use client';

/**
 * MaxxSantaAngela — porte 1:1 de maxx-santa-angela/index.html (dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores exatos do script).
 *
 * Convenções de porte (iguais às de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - style-focus="css"    -> <Focusable baseStyle={...} focusStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via IntersectionObserver
 *  - data-count           -> contador rAF + IntersectionObserver (threshold .6)
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - data-hydra/data-src  -> src direto (o defer de hidratação do dc-runtime não é necessário)
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

/**
 * Reproduz style-hover do dc-runtime: hoverStyle vira :hover.
 * Merge sobre baseStyle no mouseenter; remove no mouseleave.
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
 * Reproduz style-focus do dc-runtime (inputs/select do formulário): focusStyle
 * vira :focus. Merge sobre baseStyle no focus; remove no blur.
 */
type FocusableProps<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  baseStyle: CSSProperties;
  focusStyle: CSSProperties;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'style' | 'children'>;

function Focusable<T extends keyof React.JSX.IntrinsicElements = 'input'>({
  as,
  baseStyle,
  focusStyle,
  children,
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
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

const HERO_HEADLINE_DEFAULT = 'More MAXX, pertinho de quem você gosta.';
const HERO_SUBTITLE_DEFAULT =
  'Apartamentos de 71 a 98 m², ao lado do Maxi Shopping Jundiaí. Lazer completo, áreas comuns decoradas e a assinatura Santa Angela.';
const SHOW_PRICE_DEFAULT = true;
const WHATSAPP_DEFAULT = '5511926143393';

const navLinks = [
  { label: 'O Empreendimento', href: '#empreendimento' },
  { label: 'Lazer', href: '#lazer' },
  { label: 'Plantas', href: '#plantas' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Contato', href: '#contato' },
];

const chips = [
  { v: '71–98', l: 'metragens (m²)' },
  { v: '2 e 3', l: 'dormitórios' },
  { v: '1 ou 2', l: 'vagas de garagem' },
  { v: '3', l: 'torres' },
];

const lazer = [
  { n: '01', t: 'Piscinas adulto e infantil' },
  { n: '02', t: 'Academia + vestiários' },
  { n: '03', t: 'Salão de festas mobiliado' },
  { n: '04', t: '02 churrasqueiras' },
  { n: '05', t: 'Playground' },
  { n: '06', t: 'Quadra recreativa' },
  { n: '07', t: 'Espaço pet' },
  { n: '08', t: 'Pista de cooper' },
  { n: '09', t: 'Praça de jogos' },
  { n: '10', t: 'Praça de encontros' },
  { n: '11', t: 'Espaço horta' },
  { n: '12', t: 'Fitness ao ar livre' },
];

const base06 =
  'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/ADG04956-HDR-';
const galSrcs = ['3', '36', '33', '32', '31', '30', '26', '24', '22', '18', '17', '14'].map(
  (n) => base06 + n + '-scaled.jpg'
);

const diferenciais = [
  { t: 'Energia fotovoltaica', d: 'Microgeração de energia limpa para abastecer as áreas comuns.' },
  { t: 'Rede elétrica subterrânea', d: 'Mais segurança e um visual livre de fiação aparente.' },
  { t: 'Som ambiente', d: 'Sistema de som nas churrasqueiras e no salão de festas.' },
  { t: 'Wi-Fi nas áreas de lazer', d: 'Infraestrutura para conectividade em todo o lazer.' },
  { t: 'Wi-Fi nos apartamentos', d: 'Preparação para internet em todas as unidades.' },
  { t: 'Tomadas acima do mercado', d: 'Quantidade de pontos superior ao padrão, vide memorial.' },
];

const nearby = [
  { i: '01', t: 'Maxi Shopping Jundiaí', d: 'Ao lado do empreendimento', min: '2 min' },
  { i: '02', t: 'SESC Jundiaí', d: 'Cultura e lazer pertinho de casa', min: '5 min' },
  { i: '03', t: 'Jardim Botânico', d: 'Natureza a poucos minutos', min: '8 min' },
  { i: '04', t: 'Supermercados', d: 'As compras do dia a dia por perto', min: '5 min' },
  { i: '05', t: 'Escolas', d: 'Educação na vizinhança', min: '6 min' },
  { i: '06', t: 'Bancos e serviços', d: 'Tudo o que você precisa ao redor', min: '5 min' },
];

const plantas = [
  {
    label: '71 m²',
    img: 'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/03/71-suite-1.png',
    tour: 'https://favarojr.com/st3/',
    desc: 'Planta inteligente com suíte, perfeita para o seu primeiro lar ou para morar com mais conforto.',
  },
  {
    label: '82 m²',
    img: 'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/03/82-1.png',
    tour: 'https://my.matterport.com/show/?m=GuAJLRVnAkm',
    desc: 'Mais espaço para a família, com ambientes generosos e bem distribuídos.',
  },
  {
    label: '98 m²',
    img: 'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/03/98m-1.png',
    tour: 'https://favarojr.com/st4/',
    desc: 'A maior metragem do Maxx, pensada para quem quer viver com amplitude.',
  },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function MaxxSantaAngela({
  heroHeadline = HERO_HEADLINE_DEFAULT,
  heroSubtitle = HERO_SUBTITLE_DEFAULT,
  showPrice = SHOW_PRICE_DEFAULT,
  whatsappNumber = WHATSAPP_DEFAULT,
}: {
  heroHeadline?: string;
  heroSubtitle?: string;
  showPrice?: boolean;
  whatsappNumber?: string;
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plantaIdx, setPlantaIdx] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // refs
  const rootRef = useRef<HTMLDivElement>(null);

  // Render context (renderVals do script) — valores derivados EXATOS.
  const gold = '#B0894E';
  void gold; // presente no script; sem uso direto no markup, mantido por fidelidade.
  const wa = whatsappNumber || '5511926143393';
  const waLink =
    'https://wa.me/' +
    wa +
    '?text=' +
    encodeURIComponent('Olá! Tenho interesse no Maxx Santa Angela e gostaria de mais informações.');

  const heroTitle = heroHeadline || HERO_HEADLINE_DEFAULT;
  const heroSub = heroSubtitle || HERO_SUBTITLE_DEFAULT;
  const showPriceVal = showPrice !== false;

  const idx = plantaIdx;
  const activePlanta = plantas[idx];
  const plantaTabs = plantas.map((p, i) => ({
    label: p.label,
    select: () => setPlantaIdx(i),
    bg: i === idx ? '#2B2521' : 'transparent',
    color: i === idx ? '#F6F1E8' : '#6f6359',
    border: i === idx ? '#2B2521' : 'rgba(43,37,33,.2)',
  }));

  const gallery = galSrcs.map((src) => ({
    src,
    onOpen: () => setLightboxSrc(src),
  }));

  const notSent = !sent;

  // Métodos (do dc-runtime)
  const toggleMobile = () => setMobileOpen((s) => !s);
  const closeMobile = () => setMobileOpen(false);
  const openPlanta = () => setLightboxSrc(plantas[idx].img);
  const closeLightbox = () => setLightboxSrc(null);

  const submitLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nome = (f.elements.namedItem('nome') as HTMLInputElement | null)?.value || '';
    const fone = (f.elements.namedItem('fone') as HTMLInputElement | null)?.value || '';
    const email = (f.elements.namedItem('email') as HTMLInputElement | null)?.value || '';
    const horario = (f.elements.namedItem('horario') as HTMLSelectElement | null)?.value || '';
    sendLead({
      name: nome,
      phone: fone,
      email,
      source: 'landing_maxx-santa-angela',
      interest: 'Maxx Santa Angela',
      message: horario ? 'Melhor horário: ' + horario : '',
    });
    const waNum = whatsappNumber || '5511926143393';
    const txt = encodeURIComponent(
      'Olá! Sou ' +
        nome +
        ' e tenho interesse no Maxx Santa Angela. Meu WhatsApp: ' +
        fone +
        '. Gostaria de mais informações.'
    );
    setSent(true);
    setTimeout(() => {
      window.open('https://wa.me/' + waNum + '?text=' + txt, '_blank');
    }, 700);
  };

  /* -------- nav scroll bg + reveal IO + count-up IO (componentDidMount) -------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- nav on-scroll (data-navbg opacity + data-nav box-shadow) ---
    const onScroll = () => {
      const solid = window.scrollY > 40;
      const bg = root.querySelector<HTMLElement>('[data-navbg]');
      if (bg) bg.style.opacity = solid ? '1' : '0';
      const nav = root.querySelector<HTMLElement>('[data-nav]');
      if (nav) nav.style.boxShadow = solid ? '0 1px 0 rgba(43,37,33,.08)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- reveal (IntersectionObserver, threshold .12, rootMargin '0px 0px -7% 0px') ---
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

    // --- count-up (IntersectionObserver, threshold .6) ---
    const countUp = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || '0');
      const suf = el.dataset.suffix || '';
      const thousand = el.dataset.fmt === 'thousand';
      const dur = 1500;
      const t0 = performance.now();
      const step = (t: number) => {
        let p = Math.min(1, (t - t0) / dur);
        p = 1 - Math.pow(1 - p, 3);
        const v = Math.round(target * p);
        el.textContent = (thousand ? v.toLocaleString('pt-BR') : String(v)) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
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

    // --- scan: observa [data-reveal] e [data-count] (rescans para conteúdo condicional) ---
    const scan = () => {
      root.querySelectorAll<HTMLElement & { __rv?: number }>('[data-reveal]').forEach((el) => {
        if (!el.__rv) {
          el.__rv = 1;
          io.observe(el);
        }
      });
      root.querySelectorAll<HTMLElement & { __cv?: number }>('[data-count]').forEach((el) => {
        if (!el.__cv) {
          el.__cv = 1;
          cio.observe(el);
        }
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(scan));
    const scanInt = setInterval(scan, 700);
    const scanStop = setTimeout(() => clearInterval(scanInt), 6000);

    // rede de segurança do estático: força reveal visível após 1200ms
    const revealFallback = setTimeout(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((e) => {
        e.style.opacity = '1';
        e.style.transform = 'none';
      });
    }, 1200);

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      cio.disconnect();
      clearInterval(scanInt);
      clearTimeout(scanStop);
      clearTimeout(revealFallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="maxx-root" style={parseStyle('position:relative;overflow-x:hidden')}>
      {/* ============ NAV ============ */}
      <nav data-nav="" style={parseStyle('position:fixed;top:0;left:0;right:0;z-index:60;transition:box-shadow .4s')}>
        <div data-navbg="" style={parseStyle('position:absolute;inset:0;background:rgba(251,248,243,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transition:opacity .45s')}></div>
        <div style={parseStyle('position:relative;max-width:1240px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px')}>
          <a href="#topo" aria-label="Maxx Santa Angela" style={parseStyle('display:flex;align-items:center;gap:13px;color:#2B2521')}>
            <svg width="30" height="34" viewBox="0 0 100 112" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
              <rect x="13" y="26" width="26" height="78"></rect><rect x="61" y="26" width="26" height="78"></rect>
              <polyline points="39,26 50,64 61,26"></polyline>
            </svg>
            <span style={parseStyle('display:flex;flex-direction:column;line-height:1')}>
              <span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:22px;letter-spacing:.16em;padding-left:.16em")}>MAXX</span>
              <span style={parseStyle('font-size:8.5px;letter-spacing:.42em;margin-top:3px;color:#8a7d6f;font-weight:600')}>SANTA ANGELA</span>
            </span>
          </a>
          <div style={parseStyle('display:flex;align-items:center;gap:30px')} data-desknav="">
            {navLinks.map((lnk, i) => (
              <Hoverable
                key={i}
                as="a"
                href={lnk.href}
                baseStyle={parseStyle('font-size:13.5px;font-weight:600;letter-spacing:.04em;color:#473f37;padding:6px 0;position:relative')}
                hoverStyle={parseStyle('color:#B0894E')}
              >
                {lnk.label}
              </Hoverable>
            ))}
            <Hoverable
              as="a"
              href={waLink}
              target="_blank"
              rel="noopener"
              baseStyle={parseStyle('display:inline-flex;align-items:center;gap:9px;background:#2B2521;color:#F6F1E8;font-weight:700;font-size:13.5px;padding:12px 22px;border-radius:40px;letter-spacing:.02em;transition:transform .3s,background .3s')}
              hoverStyle={parseStyle('transform:translateY(-2px);background:#8f6a2c')}
            >
              Fale com um corretor
            </Hoverable>
          </div>
          <button onClick={toggleMobile} aria-label="Menu" data-burger="" style={parseStyle('display:none;background:none;border:none;flex-direction:column;gap:5px;padding:8px')}>
            <span style={parseStyle('width:24px;height:2px;background:#2B2521;display:block')}></span>
            <span style={parseStyle('width:24px;height:2px;background:#2B2521;display:block')}></span>
            <span style={parseStyle('width:16px;height:2px;background:#2B2521;display:block')}></span>
          </button>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header id="topo" style={parseStyle('position:relative;min-height:680px;height:90vh;max-height:900px;display:flex;align-items:flex-end;overflow:hidden;background:#1c1813')}>
        <div style={parseStyle('position:absolute;inset:0;overflow:hidden')}>
          <img src="https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/CAPA-MAX-OLD.png" alt="Perspectiva das torres do Maxx Santa Angela" style={parseStyle('width:100%;height:100%;object-fit:cover;animation:mxKen 18s ease-out forwards')} />
        </div>
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,17,13,.42) 0%,rgba(20,17,13,0) 26%,rgba(20,17,13,.12) 58%,rgba(20,17,13,.74) 100%)')}></div>
        <div style={parseStyle('position:relative;width:100%;max-width:1240px;margin:0 auto;padding:0 32px 76px;color:#fff')}>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1);max-width:760px')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:26px')}>
              <span style={parseStyle('width:38px;height:1px;background:#D9B877')}></span>
              <span style={parseStyle('font-size:12px;letter-spacing:.34em;font-weight:700;color:#E7D2A6')}>EMPREENDIMENTO SANTA ANGELA · JUNDIAÍ/SP</span>
            </div>
            <h1 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:clamp(40px,6.4vw,84px);line-height:1.02;letter-spacing:-.01em;margin:0;text-shadow:0 2px 30px rgba(0,0,0,.35)")}>{heroTitle}</h1>
            <p style={parseStyle('font-size:clamp(16px,1.5vw,20px);line-height:1.6;max-width:560px;margin:26px 0 0;color:#F3ECE0;font-weight:400')}>{heroSub}</p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-top:38px')}>
              <Hoverable as="a" href="#contato" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;background:#8f6a2c;color:#fff;font-weight:700;font-size:15px;padding:17px 34px;border-radius:46px;letter-spacing:.02em;box-shadow:0 14px 40px rgba(176,137,78,.4);transition:transform .3s,box-shadow .3s')} hoverStyle={parseStyle('transform:translateY(-3px);box-shadow:0 20px 50px rgba(176,137,78,.55)')}>Quero saber mais</Hoverable>
              <Hoverable as="a" href="#lazer" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:600;font-size:15px;padding:17px 30px;border-radius:46px;border:1px solid rgba(255,255,255,.5);transition:background .3s,border-color .3s')} hoverStyle={parseStyle('background:rgba(255,255,255,.12);border-color:#fff')}>Conhecer o empreendimento</Hoverable>
            </div>
            <div data-priceinline="" style={parseStyle('display:none;margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,.25)')}>
              <span style={parseStyle('font-size:11px;letter-spacing:.26em;font-weight:700;color:#E7D2A6')}>A PARTIR DE</span>
              <div style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:34px;color:#fff;margin-top:4px;line-height:1")}>R$ 790.365,90</div>
              <p style={parseStyle('font-size:11.5px;color:#E3D8C6;margin:8px 0 0')}>*Torre B · 97 m² · tabela maio/2026.</p>
            </div>
          </div>
        </div>
        {showPriceVal && (
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(30px);transition:opacity 1s cubic-bezier(.16,1,.3,1) .25s,transform 1s cubic-bezier(.16,1,.3,1) .25s;position:absolute;right:32px;bottom:76px;background:rgba(251,248,243,.96);backdrop-filter:blur(6px);padding:24px 30px;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.3);max-width:300px')} data-pricecard="">
            <span style={parseStyle('font-size:11px;letter-spacing:.26em;font-weight:700;color:#9a8a72')}>A PARTIR DE</span>
            <div style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:38px;color:#2B2521;margin-top:6px;line-height:1")}>R$ 790.365<span style={parseStyle('font-size:22px')}>,90</span></div>
            <p style={parseStyle('font-size:11.5px;color:#8a7d6f;margin:12px 0 0;line-height:1.5')}>*Torre B · 97 m² · valores ref. tabela maio/2026. Consulte um corretor para outras unidades.</p>
          </div>
        )}
        <div style={parseStyle('position:absolute;left:50%;bottom:26px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.8);animation:mxFloat 2.6s ease-in-out infinite')}>
          <span style={parseStyle('font-size:9.5px;letter-spacing:.3em;font-weight:600')}>ROLE</span>
          <span style={parseStyle('width:1px;height:34px;background:linear-gradient(rgba(255,255,255,.8),transparent)')}></span>
        </div>
      </header>

      {/* ============ SOBRE ============ */}
      <section id="empreendimento" style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#F6F1E8')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,6vw,90px);align-items:center')} data-sobregrid="">
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>O EMPREENDIMENTO</span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0;color:#2B2521")}>Um lugar cercado de<br />diversão, cultura e<br /><em style={parseStyle('color:#B0894E')}>conveniência.</em></h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.75;color:#5e5347;margin:28px 0 0;max-width:520px')}>O <strong style={parseStyle('color:#2B2521')}>Maxx Santa Angela</strong> fica pertinho do Maxi Shopping Jundiaí, um dos mais tradicionais shoppings da cidade. Por perto também estão o SESC Jundiaí, o Jardim Botânico e muitos serviços, supermercados, lojas, bancos e escolas.</p>
            <p style={parseStyle('font-size:16.5px;line-height:1.75;color:#5e5347;margin:18px 0 0;max-width:520px')}>Arte, lazer e comodidade você encontra junto com o Maxx. <strong style={parseStyle('color:#2B2521')}>More pertinho de quem você gosta.</strong></p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:12px;margin-top:34px')}>
              {chips.map((c, i) => (
                <div key={i} style={parseStyle('display:flex;flex-direction:column;gap:3px;padding:14px 22px;background:#fff;border:1px solid rgba(43,37,33,.08);border-radius:14px;box-shadow:0 6px 20px rgba(43,37,33,.04)')}>
                  <span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:23px;color:#2B2521")}>{c.v}</span>
                  <span style={parseStyle('font-size:11.5px;letter-spacing:.06em;color:#8a7d6f;font-weight:600')}>{c.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1) .15s,transform .9s cubic-bezier(.16,1,.3,1) .15s;position:relative')}>
            <div style={parseStyle('position:relative;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px rgba(43,37,33,.22);aspect-ratio:4/5')}>
              <img src="https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/ADG04956-HDR-3-scaled.jpg" alt="Áreas comuns do Maxx Santa Angela" style={parseStyle('width:100%;height:100%;object-fit:cover')} />
            </div>
            <div style={parseStyle('position:absolute;left:-26px;bottom:-26px;background:#3FA39C;color:#fff;padding:22px 26px;border-radius:16px;box-shadow:0 18px 44px rgba(63,163,156,.35);max-width:200px')}>
              <div style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-size:30px;font-weight:700;line-height:1")}>3 torres</div>
              <div style={parseStyle('font-size:12.5px;margin-top:6px;line-height:1.45;opacity:.92')}>Torres A, B e C, com edifício garagem integrado.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section id="lazer" style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#2B2521;color:#F6F1E8;overflow:hidden')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto')}>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);max-width:640px')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#D9B877')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#D9B877')}>LAZER COMPLETO</span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0")}>Tudo o que a sua família<br />merece, do lado de casa.</h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.7;color:#cabfae;margin:24px 0 0')}>Áreas comuns entregues equipadas e decoradas. É só chegar e viver.</p>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-top:54px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);border-radius:18px;overflow:hidden')} data-lazergrid="">
            {lazer.map((item, i) => (
              <Hoverable
                key={i}
                data-reveal=""
                baseStyle={parseStyle('opacity:0;transform:translateY(20px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);background:#2B2521;padding:30px 26px;min-height:148px;display:flex;flex-direction:column;justify-content:space-between')}
                hoverStyle={parseStyle('background:#33291f')}
              >
                <span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;color:#B0894E;letter-spacing:.05em")}>{item.n}</span>
                <span style={parseStyle('font-size:16px;font-weight:600;line-height:1.3;color:#F6F1E8')}>{item.t}</span>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALERIA ============ */}
      <section style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#FBF8F3')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto')}>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);text-align:center;max-width:620px;margin:0 auto 54px')}>
            <div style={parseStyle('display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>GALERIA</span>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0;color:#2B2521")}>Surpreendente também por fora</h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.7;color:#5e5347;margin:20px 0 0')}>Fotos reais das áreas comuns do empreendimento.</p>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(3,1fr);gap:16px')} data-gallery="">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={g.onOpen}
                data-reveal=""
                style={parseStyle('opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);border:none;padding:0;background:#eee;border-radius:14px;overflow:hidden;aspect-ratio:4/3;position:relative;display:block')}
              >
                <Hoverable
                  as="img"
                  src={g.src}
                  alt="Área comum do Maxx Santa Angela"
                  loading="lazy"
                  baseStyle={parseStyle('width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.16,1,.3,1)')}
                  hoverStyle={parseStyle('transform:scale(1.08)')}
                />
                <span style={parseStyle('position:absolute;right:12px;bottom:12px;width:38px;height:38px;border-radius:50%;background:rgba(251,248,243,.9);color:#2B2521;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:300')}>+</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#F6F1E8')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto')}>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);max-width:640px')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>DIFERENCIAIS QUE IMPORTAM</span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0;color:#2B2521")}>Tecnologia e conforto<br />pensados pra você.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:50px')} data-difgrid="">
            {diferenciais.map((d, i) => (
              <Hoverable
                key={i}
                data-reveal=""
                baseStyle={parseStyle('opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);background:#fff;border:1px solid rgba(43,37,33,.07);border-radius:18px;padding:34px 30px;box-shadow:0 10px 30px rgba(43,37,33,.04);transition:transform .4s,box-shadow .4s')}
                hoverStyle={parseStyle('transform:translateY(-5px);box-shadow:0 22px 50px rgba(43,37,33,.1)')}
              >
                <div style={parseStyle('width:46px;height:46px;border-radius:12px;background:rgba(63,163,156,.12);display:flex;align-items:center;justify-content:center;margin-bottom:22px')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3FA39C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:21px;margin:0;color:#2B2521")}>{d.t}</h3>
                <p style={parseStyle('font-size:14.5px;line-height:1.6;color:#6f6359;margin:12px 0 0')}>{d.d}</p>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section id="plantas" style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#FBF8F3')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto')}>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);text-align:center;max-width:620px;margin:0 auto 46px')}>
            <div style={parseStyle('display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>PLANTAS</span>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0;color:#2B2521")}>Diversas metragens para você</h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.7;color:#5e5347;margin:20px 0 0')}>Apartamentos de 71 a 98 m². Explore cada planta com o tour virtual 360°.</p>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)')}>
            <div style={parseStyle('display:flex;justify-content:center;gap:10px;margin-bottom:40px;flex-wrap:wrap')}>
              {plantaTabs.map((t, i) => (
                <button
                  key={i}
                  onClick={t.select}
                  style={parseStyle(
                    "font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:19px;padding:12px 30px;border-radius:44px;border:1px solid " +
                      t.border +
                      ';background:' +
                      t.bg +
                      ';color:' +
                      t.color +
                      ';transition:all .35s'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,70px);align-items:center;background:#fff;border:1px solid rgba(43,37,33,.07);border-radius:24px;padding:clamp(28px,4vw,56px);box-shadow:0 20px 50px rgba(43,37,33,.07)')} data-plantagrid="">
              <button onClick={openPlanta} aria-label="Ampliar planta" style={parseStyle('border:none;background:transparent;padding:0;display:flex;align-items:center;justify-content:center;min-height:300px;position:relative;cursor:zoom-in;width:100%')}>
                <Hoverable
                  as="img"
                  src={activePlanta.img}
                  alt={'Planta do apartamento de ' + activePlanta.label}
                  baseStyle={parseStyle('max-height:440px;width:auto;object-fit:contain;transition:transform .5s cubic-bezier(.16,1,.3,1)')}
                  hoverStyle={parseStyle('transform:scale(1.04)')}
                />
                <span style={parseStyle('position:absolute;right:10px;bottom:10px;display:flex;align-items:center;gap:7px;background:rgba(43,37,33,.86);color:#F6F1E8;font-size:12px;font-weight:700;letter-spacing:.04em;padding:8px 14px;border-radius:40px;backdrop-filter:blur(4px)')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path></svg>
                  Ampliar
                </span>
              </button>
              <div>
                <span style={parseStyle('font-size:12px;letter-spacing:.3em;font-weight:700;color:#B0894E')}>APARTAMENTO</span>
                <div style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:clamp(48px,7vw,86px);line-height:.95;color:#2B2521;margin:10px 0 4px")}>{activePlanta.label}</div>
                <p style={parseStyle('font-size:17px;color:#6f6359;margin:14px 0 0;line-height:1.6')}>{activePlanta.desc}</p>
                <div style={parseStyle('height:1px;background:rgba(43,37,33,.1);margin:30px 0')}></div>
                <Hoverable as="a" href={activePlanta.tour} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:12px;background:#2B2521;color:#F6F1E8;font-weight:700;font-size:14.5px;padding:15px 28px;border-radius:44px;transition:transform .3s,background .3s')} hoverStyle={parseStyle('transform:translateY(-3px);background:#B0894E')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"></path></svg>
                  Fazer tour virtual 360°
                </Hoverable>
                <p style={parseStyle('font-size:12px;color:#9a8a72;margin:18px 0 0;line-height:1.5')}>Imagens meramente ilustrativas. Consulte o memorial descritivo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZACAO ============ */}
      <section id="localizacao" style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#F6F1E8')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:.95fr 1.05fr;gap:clamp(40px,6vw,80px);align-items:center')} data-locgrid="">
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>LOCALIZAÇÃO</span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,52px);line-height:1.08;margin:0;color:#2B2521")}>No coração de tudo<br />o que importa.</h2>
            <p style={parseStyle('font-size:16px;line-height:1.7;color:#5e5347;margin:22px 0 30px')}>Rua João Tonini, 400, Vila Galvão, Jundiaí/SP.</p>
            <div style={parseStyle('display:flex;flex-direction:column')}>
              {nearby.map((n, i) => (
                <div key={i} data-reveal="" style={parseStyle('opacity:0;transform:translateX(-16px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);display:flex;align-items:center;gap:18px;padding:17px 0;border-bottom:1px solid rgba(43,37,33,.1)')}>
                  <span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;color:#B0894E;min-width:24px")}>{n.i}</span>
                  <div style={parseStyle('flex:1')}><div style={parseStyle('font-weight:700;font-size:15.5px;color:#2B2521')}>{n.t}</div><div style={parseStyle('font-size:13px;color:#8a7d6f;margin-top:2px')}>{n.d}</div></div>
                  <div style={parseStyle('display:flex;align-items:center;gap:7px;background:rgba(63,163,156,.12);color:#2e7d77;padding:8px 14px;border-radius:40px;white-space:nowrap')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>
                    <span style={parseStyle('font-weight:800;font-size:13.5px')}>{n.min}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1) .12s,transform .9s cubic-bezier(.16,1,.3,1) .12s;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(43,37,33,.16);height:480px;border:6px solid #fff')}>
            <iframe title="Mapa Maxx Santa Angela" src="https://www.google.com/maps?q=Rua%20Jo%C3%A3o%20Tonini%20400%20Vila%20Galv%C3%A3o%20Jundia%C3%AD&output=embed" style={parseStyle('width:100%;height:100%;border:0;filter:grayscale(.25) contrast(1.02)')} loading="lazy"></iframe>
          </div>
        </div>
      </section>

      {/* ============ CONFIANCA ============ */}
      <section style={parseStyle('position:relative;padding:clamp(56px,6vw,84px) 32px;background:#33291f;color:#F6F1E8;overflow:hidden')}>
        <div style={parseStyle('max-width:1100px;margin:0 auto;text-align:center')} data-reveal="">
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)')}>
            <img src="https://santaangelaconstrutora.com.br/wp-content/uploads/2022/11/logo-01.png" alt="Santa Angela Construtora" style={parseStyle('height:58px;width:auto;margin:0 auto 30px;display:block;opacity:.96')} />
            <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#D9B877')}>A CONSTRUTORA MAIS CONFIÁVEL DA REGIÃO</span>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:clamp(26px,3.6vw,46px);line-height:1.2;margin:22px auto 0;max-width:780px")}>Há mais de 40 anos construindo lares e a confiança de milhares de famílias.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:44px')} data-statgrid="">
            <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)')}>
              <div data-count="40" data-suffix="+" style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:clamp(48px,7vw,82px);color:#D9B877;line-height:1")}>40+</div>
              <div style={parseStyle('font-size:14px;color:#cabfae;margin-top:10px;letter-spacing:.04em')}>anos de experiência no mercado</div>
            </div>
            <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1) .12s,transform .8s cubic-bezier(.16,1,.3,1) .12s')}>
              <div data-count="9800" data-suffix="+" data-fmt="thousand" style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:clamp(48px,7vw,82px);color:#D9B877;line-height:1")}>9.800+</div>
              <div style={parseStyle('font-size:14px;color:#cabfae;margin-top:10px;letter-spacing:.04em')}>unidades entregues</div>
            </div>
            <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1) .24s,transform .8s cubic-bezier(.16,1,.3,1) .24s')}>
              <div style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:clamp(48px,7vw,82px);color:#D9B877;line-height:1")}>100%</div>
              <div style={parseStyle('font-size:14px;color:#cabfae;margin-top:10px;letter-spacing:.04em')}>seriedade e transparência</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO ============ */}
      <section id="contato" style={parseStyle('position:relative;padding:clamp(70px,9vw,130px) 32px;background:#FBF8F3')}>
        <div style={parseStyle('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center')} data-contatogrid="">
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)')}>
            <div style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px')}>
              <span style={parseStyle('width:34px;height:1px;background:#B0894E')}></span>
              <span style={parseStyle('font-size:11.5px;letter-spacing:.32em;font-weight:700;color:#B0894E')}>FALE COM A GENTE</span>
            </div>
            <h2 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(30px,4vw,50px);line-height:1.08;margin:0;color:#2B2521")}>Tire suas dúvidas com<br />um corretor.</h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.7;color:#5e5347;margin:24px 0 0')}>Preencha o formulário e nossa equipe entra em contato. Prefere conversar agora? Chame no WhatsApp.</p>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:12px;margin-top:28px;background:#3FA39C;color:#fff;font-weight:700;font-size:15px;padding:16px 30px;border-radius:46px;transition:transform .3s')} hoverStyle={parseStyle('transform:translateY(-3px)')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3-1.3-5-4.4-5.1-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4.1.2.1.9-.1 1.3z"></path></svg>
              WhatsApp (11) 92614-3393
            </Hoverable>
          </div>
          <div data-reveal="" style={parseStyle('opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.16,1,.3,1) .1s,transform .9s cubic-bezier(.16,1,.3,1) .1s')}>
            {sent && (
              <div style={parseStyle('background:#2B2521;color:#F6F1E8;border-radius:22px;padding:48px 40px;text-align:center')}>
                <div style={parseStyle('width:62px;height:62px;border-radius:50%;background:#3FA39C;display:flex;align-items:center;justify-content:center;margin:0 auto 22px')}><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <h3 style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;margin:0")}>Recebemos seu contato!</h3>
                <p style={parseStyle('color:#cabfae;margin:14px 0 0;line-height:1.6')}>Estamos te levando para o WhatsApp para agilizar seu atendimento.</p>
              </div>
            )}
            {notSent && (
              <form onSubmit={submitLead} style={parseStyle('background:#fff;border:1px solid rgba(43,37,33,.08);border-radius:22px;padding:clamp(28px,3.5vw,44px);box-shadow:0 20px 50px rgba(43,37,33,.08);display:flex;flex-direction:column;gap:16px')}>
                <label style={parseStyle('display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:700;letter-spacing:.05em;color:#6f6359')}>NOME
                  <Focusable as="input" name="nome" required placeholder="Seu nome completo" baseStyle={parseStyle('font-family:inherit;font-size:15px;padding:14px 16px;border:1px solid rgba(43,37,33,.16);border-radius:11px;background:#FBF8F3;color:#2B2521;outline:none')} focusStyle={parseStyle('border-color:#B0894E;background:#fff')} />
                </label>
                <label style={parseStyle('display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:700;letter-spacing:.05em;color:#6f6359')}>E-MAIL
                  <Focusable as="input" name="email" type="email" required placeholder="seu@email.com" baseStyle={parseStyle('font-family:inherit;font-size:15px;padding:14px 16px;border:1px solid rgba(43,37,33,.16);border-radius:11px;background:#FBF8F3;color:#2B2521;outline:none')} focusStyle={parseStyle('border-color:#B0894E;background:#fff')} />
                </label>
                <label style={parseStyle('display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:700;letter-spacing:.05em;color:#6f6359')}>WHATSAPP
                  <Focusable as="input" name="fone" required placeholder="(11) 90000-0000" baseStyle={parseStyle('font-family:inherit;font-size:15px;padding:14px 16px;border:1px solid rgba(43,37,33,.16);border-radius:11px;background:#FBF8F3;color:#2B2521;outline:none')} focusStyle={parseStyle('border-color:#B0894E;background:#fff')} />
                </label>
                <label style={parseStyle('display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:700;letter-spacing:.05em;color:#6f6359')}>MELHOR HORÁRIO PARA CONTATO
                  <Focusable as="select" name="horario" baseStyle={parseStyle('font-family:inherit;font-size:15px;padding:14px 16px;border:1px solid rgba(43,37,33,.16);border-radius:11px;background:#FBF8F3;color:#2B2521;outline:none')} focusStyle={parseStyle('border-color:#B0894E;background:#fff')}>
                    <option>Dias de semana pela manhã</option><option>Dias de semana à tarde</option><option>Dias de semana à noite</option><option>Final de semana pela manhã</option><option>Final de semana à tarde</option>
                  </Focusable>
                </label>
                <Hoverable as="button" type="submit" baseStyle={parseStyle('margin-top:6px;background:#8f6a2c;color:#fff;font-weight:700;font-size:15.5px;padding:17px;border:none;border-radius:46px;letter-spacing:.02em;transition:transform .3s,background .3s')} hoverStyle={parseStyle('transform:translateY(-2px);background:#7d5a26')}>Quero saber mais</Hoverable>
                <p style={parseStyle('font-size:11.5px;color:#9a8a72;line-height:1.5;margin:2px 0 0')}>Ao enviar, autorizo o contato de corretores e parceiros, inclusive por WhatsApp, e declaro estar ciente da Política de Privacidade da Santa Angela.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={parseStyle('background:#211c17;color:#cabfae;padding:clamp(56px,7vw,90px) 32px 40px')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto')}>
          <div style={parseStyle('display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:48px')} data-footgrid="">
            <div>
              <div style={parseStyle('display:flex;align-items:center;gap:13px;color:#F6F1E8')}>
                <svg width="30" height="34" viewBox="0 0 100 112" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round"><rect x="13" y="26" width="26" height="78"></rect><rect x="61" y="26" width="26" height="78"></rect><polyline points="39,26 50,64 61,26"></polyline></svg>
                <span style={parseStyle('display:flex;flex-direction:column;line-height:1')}><span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:22px;letter-spacing:.16em;padding-left:.16em")}>MAXX</span><span style={parseStyle('font-size:8.5px;letter-spacing:.42em;margin-top:3px;color:#9a8a72;font-weight:600')}>SANTA ANGELA</span></span>
              </div>
              <p style={parseStyle('font-size:14px;line-height:1.7;margin:22px 0 0;max-width:340px')}>Rua João Tonini, 400, Vila Galvão, Jundiaí/SP.</p>
              <p style={parseStyle('font-size:14px;line-height:1.7;margin:14px 0 0;max-width:340px')}><strong style={parseStyle('color:#F6F1E8')}>Vendas:</strong> Casa Santa Angela, Av. Antônio Frederico Ozanan, 7600, atrás do Burger King Latorre.</p>
            </div>
            <div>
              <h4 style={parseStyle('font-size:12px;letter-spacing:.26em;color:#D9B877;font-weight:700;margin:0 0 18px')}>CONTATO</h4>
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>WhatsApp (11) 92614-3393</Hoverable>
              <Hoverable as="a" href="mailto:relacionamento@santangela.com.br" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>relacionamento@santangela.com.br</Hoverable>
            </div>
            <div>
              <h4 style={parseStyle('font-size:12px;letter-spacing:.26em;color:#D9B877;font-weight:700;margin:0 0 18px')}>NAVEGAÇÃO</h4>
              <Hoverable as="a" href="#empreendimento" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>O empreendimento</Hoverable>
              <Hoverable as="a" href="#lazer" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>Lazer</Hoverable>
              <Hoverable as="a" href="#plantas" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>Plantas</Hoverable>
              <Hoverable as="a" href="#localizacao" baseStyle={parseStyle('display:block;font-size:14.5px;margin-bottom:12px')} hoverStyle={parseStyle('color:#fff')}>Localização</Hoverable>
            </div>
          </div>
          <p style={parseStyle('font-size:11px;line-height:1.7;color:#7d7163;margin:48px 0 0;border-top:1px solid rgba(255,255,255,.08);padding-top:28px')}>Incorporação imobiliária registrada conforme R.7 da matrícula nº 163.077 do 1º Cartório de Registro de Imóveis de Jundiaí, em 13 de fevereiro de 2020. Todas as imagens são perspectivas digitais do empreendimento, razão pela qual as informações constantes no Memorial de Incorporação e nos contratos de promessa de compra e venda prevalecerão sobre as imagens divulgadas neste material. As árvores estão em sua perspectiva adulta, podendo haver variação de tamanho na entrega. Objetos de decoração, mobiliário e equipamentos retratados não fazem parte da entrega das unidades nem das áreas comuns.</p>
          <p style={parseStyle('font-size:12px;color:#7d7163;margin:22px 0 0')}>Maxx Santa Angela · Santa Angela Construtora, material publicitário sem valor contratual.</p>
          <p style={parseStyle('font-size:12.5px;color:#cabfae;margin:10px 0 0;font-weight:700;letter-spacing:.02em')}>Página desenvolvida pela <span style={parseStyle('color:#D9B877')}>Imobiliária Lotus Brokers</span>.</p>
        </div>
      </footer>

      {/* ============ FLOATING WHATSAPP ============ */}
      <Hoverable as="a" href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" baseStyle={parseStyle('position:fixed;right:24px;bottom:24px;z-index:70;width:60px;height:60px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(37,211,102,.45);animation:mxPulse 2.6s infinite;transition:transform .3s')} hoverStyle={parseStyle('transform:scale(1.08)')}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3-1.3-5-4.4-5.1-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4.1.2.1.9-.1 1.3z"></path></svg>
      </Hoverable>

      {/* ============ LIGHTBOX ============ */}
      {lightboxSrc && (
        <div onClick={closeLightbox} style={parseStyle('position:fixed;inset:0;z-index:90;background:rgba(20,17,13,.92);display:flex;align-items:center;justify-content:center;padding:40px;cursor:zoom-out')}>
          <img src={lightboxSrc} alt="Área comum do Maxx Santa Angela" style={parseStyle('max-width:92%;max-height:88vh;object-fit:contain;border-radius:8px;box-shadow:0 30px 80px rgba(0,0,0,.5)')} />
          <button onClick={closeLightbox} aria-label="Fechar" style={parseStyle('position:absolute;top:26px;right:30px;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.14);border:none;color:#fff;font-size:24px;font-weight:300')}>×</button>
        </div>
      )}

      {/* ============ MOBILE MENU ============ */}
      {mobileOpen && (
        <div style={parseStyle('position:fixed;inset:0;z-index:80;background:#F6F1E8;display:flex;flex-direction:column;padding:32px')}>
          <div style={parseStyle('display:flex;justify-content:space-between;align-items:center')}>
            <span style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:22px;letter-spacing:.16em;padding-left:.16em")}>MAXX</span>
            <button onClick={closeMobile} aria-label="Fechar" style={parseStyle('background:none;border:none;font-size:34px;font-weight:200;color:#2B2521')}>×</button>
          </div>
          <div style={parseStyle('display:flex;flex-direction:column;gap:4px;margin-top:40px')}>
            {navLinks.map((lnk, i) => (
              <a key={i} href={lnk.href} onClick={closeMobile} style={parseStyle("font-family:'Plus Jakarta Sans',sans-serif;font-size:30px;color:#2B2521;padding:14px 0;border-bottom:1px solid rgba(43,37,33,.1)")}>{lnk.label}</a>
            ))}
          </div>
          <a href={waLink} target="_blank" rel="noopener" style={parseStyle('margin-top:auto;text-align:center;background:#8f6a2c;color:#fff;font-weight:700;padding:18px;border-radius:46px')}>Fale com um corretor</a>
        </div>
      )}
    </div>
  );
}
