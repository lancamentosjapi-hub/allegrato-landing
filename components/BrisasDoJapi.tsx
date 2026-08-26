'use client';

/**
 * BrisasDoJapi — porte 1:1 de brisas-do-japi/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores EXATOS do fonte).
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver
 *                            + Web Animations API), FIEL ao script original (não o reveal genérico).
 *  - data-counter         -> contador rAF disparado por IntersectionObserver (threshold .5).
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - header/hero scroll   -> mutação de DOM direta (sem re-render), igual ao original.
 */

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { p34, p49, p52, p66 } from '@/app/brisas-do-japi/plantas';
import Link from 'next/link';
import { sendLead } from '@/lib/lead';
import CtaSimulacao from './CtaSimulacao';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Converte uma string CSS ("a:b;c:d") em objeto React.CSSProperties.
 * camelCase nas propriedades; preserva valores EXATOS (cores, px, gradientes).
 * Split cuidadoso: separa apenas no PRIMEIRO ":" de cada declaração (valores
 * como gradientes e data: URIs contêm ":" internos).
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

/* ------------------------------------------------------------------ */
/* Props / defaults (data-props do fonte, valores EXATOS)             */
/* ------------------------------------------------------------------ */

const AGENCY_NAME_DEFAULT = 'Lotus Brokers';
const WHATSAPP_PHONE_DEFAULT = '5511926143393';
const PROMO_TEXT_DEFAULT =
  '3ª Fase · 60 unidades · Minha Casa Minha Vida · Ar-condicionado grátis*';
const SHOW_PROMO_BAR_DEFAULT = true;

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores EXATOS do renderVals do fonte)            */
/* ------------------------------------------------------------------ */

const B = 'https://vvcconstrutora.com.br/images/brisas-banner/';
const G = 'https://vvcconstrutora.com.br/images/brisas-galeria/';

type Tipo = {
  area: string;
  title: string;
  desc: string;
  tag: string;
  delay: number;
  plantaSrc: string;
};

const tipoRaw: Tipo[] = [
  { area: '34', title: 'Studio', desc: 'Studio com varanda e vaga de garagem.', tag: '1 ambiente', delay: 0, plantaSrc: p34 },
  { area: '49', title: '2 Dormitórios', desc: '2 dormitórios com varanda e vaga de garagem.', tag: '2 dorms', delay: 80, plantaSrc: p49 },
  { area: '52', title: '2 Dorms · 1 Suíte', desc: '2 dormitórios (1 suíte) com varanda e vaga.', tag: 'com suíte', delay: 160, plantaSrc: p52 },
  { area: '66', title: '2 Dorms · 1 Suíte', desc: '2 dormitórios (1 suíte) com varanda e vaga, maior planta.', tag: 'maior planta', delay: 240, plantaSrc: p66 },
];

const lazerNames = [
  'Piscina Adulto com Prainha e Raia de 25m', 'Piscina Infantil', 'Quadra Recreativa', 'Playground Infantil',
  '4 Quiosques com Churrasqueiras', 'Pista de Caminhada', 'Área Pet', 'Quadra de Beach Tennis', 'Espaço Gourmet',
  'Espaço para Minimercado / Conveniência', 'Mini quadras gramadas', 'Academia', 'Salão de Festas Independente',
  'Salão de Jogos', 'Coworking', 'Bicicletários', '44 Vagas para Visitantes', '5.500 M² de Áreas Ajardinadas', 'Portaria',
];
const lazer = lazerNames.map((name, i) => ({ name, n: (i + 1 < 10 ? '0' : '') + (i + 1) }));

const galleryRaw = [
  { label: 'Fachada', f: B + 'FACHADA01.jpg' },
  { label: 'Piscina com raia de 25m', f: G + 'PISCINA.jpg' },
  { label: 'Beach Tennis', f: G + 'BEACHTENNIS.jpg' },
  { label: 'Salão de Festas', f: G + 'SALAODEFESTAS-01.jpg' },
  { label: 'Academia', f: G + 'academia.jpg' },
  { label: 'Coworking', f: G + 'coworking.jpg' },
  { label: 'Quadra Recreativa', f: G + 'quadra.jpg' },
  { label: 'Quiosque Churrasqueira', f: G + 'QUIOSQUECHURRASQUEIRA.jpg' },
  { label: 'Salão de Jogos', f: G + 'salaodejogos.jpg' },
  { label: 'Garagem Coberta', f: G + 'GARAGEMCOBERTATORRE.jpg' },
  { label: 'Hall de Entrada', f: B + 'HALLDEENTRADA.jpg' },
  { label: 'Apartamento Decorado', f: B + 'QUARTO02.jpg' },
];

const locPoints = [
  { t: 'Escolas' }, { t: 'Supermercados' }, { t: 'Farmácias' },
  { t: 'Unidade de saúde' }, { t: 'Restaurantes' }, { t: 'Vista da Serra do Japi' },
];

const faqsData = [
  { q: 'Quantas torres e unidades tem o condomínio?', a: 'O Brisas do Japi é um condomínio vertical com 9 torres e 920 unidades no total, em uma área de 29.000m².' },
  { q: 'O Brisas do Japi aceita o Minha Casa Minha Vida?', a: 'Sim. O empreendimento se enquadra no Novo Minha Casa Minha Vida. Faça uma simulação de financiamento com nossos corretores e descubra suas condições.' },
  { q: 'Quais são os tamanhos das unidades?', a: 'Studio de 34m² e apartamentos de 2 dormitórios de 49m², 52m² (1 suíte) e 66m² (1 suíte), todos com varanda e vaga.' },
  { q: 'Onde fica o empreendimento?', a: 'No Bairro Medeiros, em Jundiaí/SP, com vista para a Serra do Japi e infraestrutura completa por perto. Entre em contato para agendar uma visita guiada.' },
  { q: 'Os apartamentos têm vaga de garagem?', a: 'Sim, todas as tipologias incluem vaga. O condomínio ainda conta com 44 vagas para visitantes.' },
  { q: 'Quais são as áreas de lazer?', a: 'São mais de 17 itens, incluindo piscinas, academia, coworking, beach tennis, salões de festa, pet agility e mais de 5.500m² de áreas ajardinadas.' },
  { q: 'Qual o tamanho do terreno?', a: 'O condomínio ocupa uma área de 29.000m² no centro do Bairro Medeiros.' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function BrisasDoJapi({
  agencyName = AGENCY_NAME_DEFAULT,
  whatsappPhone = WHATSAPP_PHONE_DEFAULT,
  promoText = PROMO_TEXT_DEFAULT,
  showPromoBar = SHOW_PROMO_BAR_DEFAULT,
}: {
  agencyName?: string;
  whatsappPhone?: string;
  promoText?: string;
  showPromoBar?: boolean;
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [lb, setLb] = useState(-1); // lightbox da galeria (-1 = fechado)
  const [sent, setSent] = useState(false); // form enviado
  const [zoom, setZoom] = useState<{ src: string; label: string } | null>(null); // zoom de planta

  // refs
  const nomeRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const tipoRef = useRef<HTMLSelectElement>(null);

  /* -------- waBase / waMsg — lógica EXATA do script -------- */
  const waBase = () => {
    const p = (whatsappPhone || '5511926143393').replace(/\D/g, '');
    return 'https://wa.me/' + p;
  };
  const waMsg = (msg: string) => waBase() + '?text=' + encodeURIComponent(msg);

  /* -------- reveals + counters + header/hero scroll (componentDidMount) -------- */
  useEffect(() => {
    const root = document.getElementById('bdj-root');
    if (!root) return;

    // Scroll reveals (Web Animations API — survive re-renders)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const d = parseFloat(el.getAttribute('data-reveal-delay') || '0');
            el.animate(
              [
                { opacity: 0, transform: 'translateY(32px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration: 900, delay: d, easing: 'cubic-bezier(.16,.84,.34,1)', fill: 'both' }
            );
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    // Animated counters
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target as HTMLElement);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    root.querySelectorAll('[data-counter]').forEach((el) => cio.observe(el));

    // Header style on scroll (DOM mutation, no re-render)
    const header = document.getElementById('bdj-header');
    const heroBg = document.getElementById('bdj-hero-bg');
    const onScroll = () => {
      const y = window.scrollY;
      if (header) {
        if (y > 40) {
          header.style.background = 'rgba(11,30,23,0.95)';
          header.style.boxShadow = '0 10px 30px rgba(0,0,0,.25)';
        } else {
          header.style.background = 'rgba(14,32,25,0.18)';
          header.style.boxShadow = 'none';
        }
      }
      if (heroBg && y < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + y * 0.22 + 'px) scale(1.08)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // cleanup (componentWillUnmount)
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      cio.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- runCounter — rAF, EXATO ao script -------- */
  const runCounter = (el: HTMLElement) => {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const dur = 1700;
    const start = performance.now();
    const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR');
    const step = (t: number) => {
      let p = Math.min(1, (t - start) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * p);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
  };

  /* -------- submit — EXATO ao script -------- */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = (nomeRef.current && nomeRef.current.value) || '';
    const tel = (telRef.current && telRef.current.value) || '';
    const email = (emailRef.current && emailRef.current.value) || '';
    const tipo = (tipoRef.current && tipoRef.current.value) || '';
    let msg = 'Olá! Tenho interesse no Brisas do Japi.';
    msg += '\nNome: ' + nome;
    msg += '\nWhatsApp: ' + tel;
    msg += '\nE-mail: ' + email;
    if (tipo) msg += '\nTipologia: ' + tipo;
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_brisas-do-japi',
      interest: 'Brisas do Japi',
      message: tipo,
    });
    setSent(true);
    window.open(waMsg(msg), '_blank');
  };

  /* -------- render context (renderVals do fonte) -------- */
  const agency = agencyName || 'Lotus Brokers';
  const promoTextValue =
    promoText ||
    '9 torres · 920 unidades · Studios e apartamentos com varanda · Minha Casa Minha Vida';
  const showPromo = showPromoBar !== false;
  const heroCta = waMsg('Olá! Quero saber mais sobre o Brisas do Japi.');

  const tipologias = tipoRaw.map((t) => ({
    ...t,
    zoom: () => setZoom({ src: t.plantaSrc, label: 'Planta ' + t.area + 'm², ' + t.title }),
  }));

  const gallery = galleryRaw.map((g, i) => ({
    label: g.label,
    src: g.f,
    open: () => setLb(i),
  }));

  const faqs = faqsData;

  const lightboxOpen = lb >= 0;
  const cur = lightboxOpen ? gallery[lb] : ({} as Partial<(typeof gallery)[number]>);
  const z = zoom;

  const zoomOpen = !!z;
  const zoomLabel = z && z.label;
  const closeZoom = () => setZoom(null);

  const curLabel = cur.label;
  const curIndex = lb + 1;
  const galTotal = gallery.length;
  const close = () => setLb(-1);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const nextImg = () => setLb((s) => (s + 1) % gallery.length);
  const prevImg = () => setLb((s) => (s - 1 + gallery.length) % gallery.length);
  const notSent = !sent;

  return (
    <div
      id="bdj-root"
      style={parseStyle(
        "font-family:'Manrope',system-ui,sans-serif;color:#19272f;background:#f4f5f3;overflow-x:hidden;position:relative;-webkit-font-smoothing:antialiased;"
      )}
    >
      {/* ============ TOP FIXED BAR ============ */}
      <div style={parseStyle('position:fixed;top:0;left:0;width:100%;z-index:120;')}>
        {showPromo && (
          <div style={parseStyle('background:linear-gradient(90deg,#123c47,#1a5666);color:#eef1ef;font-size:13px;letter-spacing:.04em;font-weight:600;text-align:center;padding:9px 16px;display:flex;align-items:center;justify-content:center;gap:10px;')}>
            <span style={parseStyle('display:inline-block;width:7px;height:7px;border-radius:50%;background:#c8a45c;')}></span>
            <span>{promoTextValue}</span>
          </div>
        )}
        <header id="bdj-header" style={parseStyle('display:flex;align-items:center;justify-content:space-between;padding:14px clamp(18px,5vw,64px);background:rgba(14,32,25,0.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:background .35s ease, box-shadow .35s ease, padding .35s ease;')}>
          <a href="#inicio" style={parseStyle('text-decoration:none;display:flex;flex-direction:column;line-height:1;')}>
            <span style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:21px;letter-spacing:.01em;color:#fff;")}>Brisas do Japi</span>
            <span style={parseStyle('font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#c8a45c;margin-top:4px;font-weight:600;')}>Jundiaí · Medeiros</span>
          </a>
          <nav style={parseStyle('display:flex;align-items:center;gap:clamp(14px,2vw,30px);flex-wrap:wrap;justify-content:flex-end;')}>
            <a href="#tipologias" style={parseStyle('color:rgba(255,255,255,.9);text-decoration:none;font-size:14px;font-weight:600;')}>Plantas</a>
            <a href="#lazer" style={parseStyle('color:rgba(255,255,255,.9);text-decoration:none;font-size:14px;font-weight:600;')}>Lazer</a>
            <a href="#galeria" style={parseStyle('color:rgba(255,255,255,.9);text-decoration:none;font-size:14px;font-weight:600;')}>Galeria</a>
            <a href="#localizacao" style={parseStyle('color:rgba(255,255,255,.9);text-decoration:none;font-size:14px;font-weight:600;')}>Localização</a>
            <a href="#contato" style={parseStyle('background:#c8a45c;color:#152730;text-decoration:none;font-size:14px;font-weight:700;padding:11px 22px;border-radius:100px;letter-spacing:.01em;box-shadow:0 6px 20px rgba(200,164,92,.35);')}>Quero saber mais</a>
          </nav>
        </header>
      </div>

      {/* ============ HERO ============ */}
      <section id="inicio" style={parseStyle('position:relative;min-height:680px;height:90vh;max-height:900px;display:flex;align-items:center;overflow:hidden;')}>
        <img id="bdj-hero-bg" src="https://vvcconstrutora.com.br/images/brisas-banner/FACHADA01.jpg" alt="Fachada do Condomínio Brisas do Japi em Jundiaí" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.08);will-change:transform;')} />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(105deg,rgba(8,24,30,.92) 0%,rgba(11,38,28,.7) 42%,rgba(12,40,30,.28) 100%);')}></div>
        <div style={parseStyle('position:relative;z-index:2;width:100%;max-width:1240px;margin:0 auto;padding:150px clamp(20px,5vw,64px) 90px;')}>
          <div data-reveal="" style={parseStyle('display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(200,164,92,.5);border-radius:100px;padding:8px 16px;margin-bottom:26px;')}>
            <span style={parseStyle('width:7px;height:7px;border-radius:50%;background:#c8a45c;')}></span>
            <span style={parseStyle('color:#e8dcc0;font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;')}>Lançamento · Bairro Medeiros</span>
          </div>
          <h1 data-reveal="" data-reveal-delay="80" style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;color:#fff;font-size:clamp(42px,6.4vw,88px);line-height:1.02;letter-spacing:-.02em;margin:0 0 24px;max-width:16ch;text-wrap:balance;")}>Sinta novos ares no Brisas do Japi</h1>
          <p data-reveal="" data-reveal-delay="160" style={parseStyle('color:rgba(238,244,243,.92);font-size:clamp(16px,1.5vw,20px);line-height:1.6;max-width:56ch;margin:0 0 38px;')}>Studios e apartamentos de 2 dormitórios com varanda, lazer completo e a vista da Serra do Japi. Um projeto VVC de 29.000m² em Jundiaí, agora pelo Novo Minha Casa Minha Vida.</p>
          <div data-reveal="" data-reveal-delay="240" style={parseStyle('display:flex;gap:14px;flex-wrap:wrap;align-items:center;')}>
            <Hoverable as="a" href="#contato" baseStyle={parseStyle('background:#c8a45c;color:#152730;text-decoration:none;font-size:16px;font-weight:700;padding:17px 34px;border-radius:100px;box-shadow:0 14px 34px rgba(200,164,92,.4);transition:transform .25s ease, box-shadow .25s ease;')} hoverStyle={parseStyle('transform:translateY(-3px);box-shadow:0 20px 44px rgba(200,164,92,.5);')}>Receber valores e condições</Hoverable>
            <Hoverable as="a" href={heroCta} target="_blank" rel="noopener" baseStyle={parseStyle('background:rgba(255,255,255,.08);color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 30px;border-radius:100px;border:1px solid rgba(255,255,255,.4);backdrop-filter:blur(6px);transition:background .25s ease;')} hoverStyle={parseStyle('background:rgba(255,255,255,.18);')}>Falar no WhatsApp</Hoverable>
          </div>
          <div data-reveal="" data-reveal-delay="320" style={parseStyle('display:flex;gap:clamp(20px,4vw,52px);flex-wrap:wrap;margin-top:54px;padding-top:30px;border-top:1px solid rgba(255,255,255,.18);')}>
            <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;color:#c8a45c;font-size:26px;font-weight:700;")}>34–66m²</div><div style={parseStyle('color:rgba(238,244,243,.75);font-size:13.5px;margin-top:4px;')}>4 tipologias com varanda</div></div>
            <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;color:#c8a45c;font-size:26px;font-weight:700;")}>+17 itens</div><div style={parseStyle('color:rgba(238,244,243,.75);font-size:13.5px;margin-top:4px;')}>de lazer no condomínio</div></div>
            <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;color:#c8a45c;font-size:26px;font-weight:700;")}>Vaga + suíte</div><div style={parseStyle('color:rgba(238,244,243,.75);font-size:13.5px;margin-top:4px;')}>nas plantas de 2 dorms</div></div>
          </div>
        </div>
        <div style={parseStyle('position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;')}>
          <span style={parseStyle('color:rgba(255,255,255,.6);font-size:11px;letter-spacing:.25em;text-transform:uppercase;')}>Role</span>
          <div style={parseStyle('width:1px;height:38px;background:linear-gradient(rgba(255,255,255,.7),transparent);animation:bdjFloaty 2s ease-in-out infinite;')}></div>
        </div>
      </section>

      {/* ============ TRUST / COUNTERS ============ */}
      <section style={parseStyle('background:#123c47;color:#eef1ef;padding:clamp(48px,6vw,72px) clamp(20px,5vw,64px);')}>
        <div data-reveal="" style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:30px;text-align:center;')}>
          <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(40px,5vw,60px);font-weight:700;color:#fff;")}><span data-counter="" data-target="29000">29.000</span></div><div style={parseStyle('color:rgba(232,240,239,.7);font-size:14px;letter-spacing:.04em;margin-top:6px;')}>m² de área total</div></div>
          <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(40px,5vw,60px);font-weight:700;color:#fff;")}><span data-counter="" data-target="9">9</span></div><div style={parseStyle('color:rgba(232,240,239,.7);font-size:14px;letter-spacing:.04em;margin-top:6px;')}>torres</div></div>
          <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(40px,5vw,60px);font-weight:700;color:#fff;")}><span data-counter="" data-target="920">920</span></div><div style={parseStyle('color:rgba(232,240,239,.7);font-size:14px;letter-spacing:.04em;margin-top:6px;')}>unidades</div></div>
          <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(40px,5vw,60px);font-weight:700;color:#fff;")}>+<span data-counter="" data-target="17">17</span></div><div style={parseStyle('color:rgba(232,240,239,.7);font-size:14px;letter-spacing:.04em;margin-top:6px;')}>itens de lazer</div></div>
        </div>
      </section>

      {/* ============ INTRO ============ */}
      <section style={parseStyle('max-width:1240px;margin:0 auto;padding:clamp(70px,9vw,130px) clamp(20px,5vw,64px);display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(36px,5vw,72px);align-items:center;')}>
        <div data-reveal="">
          <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:18px;')}>O empreendimento</div>
          <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0 0 22px;color:#152730;")}>Um bairro tranquilo, perto de tudo e com vista para a serra</h2>
          <p style={parseStyle('font-size:17px;line-height:1.7;color:#4c5a61;margin:0 0 18px;')}>O Brisas do Japi é o novo projeto da VVC Construtora no Bairro Medeiros, em Jundiaí. Cada detalhe foi pensado para aproveitar a excelente área de 29.000m² no centro do bairro, um lugar tranquilo e perto de escolas, supermercados, restaurantes e posto de saúde.</p>
          <p style={parseStyle('font-size:17px;line-height:1.7;color:#4c5a61;margin:0;')}>Todos os apartamentos possuem varanda para você desfrutar a brisa que vem da Serra do Japi. E com o Novo Minha Casa Minha Vida, ficou ainda mais fácil realizar o seu sonho.</p>
        </div>
        <div data-reveal="" data-reveal-delay="120" style={parseStyle('position:relative;')}>
          <div style={parseStyle('border-radius:18px;overflow:hidden;box-shadow:0 30px 70px rgba(16,52,62,.22);aspect-ratio:4/5;')}>
            <img src="https://vvcconstrutora.com.br/images/brisas-banner/fotoinsercao.jpg" alt="Vista aérea do Condomínio Brisas do Japi no Bairro Medeiros, Jundiaí" style={parseStyle('width:100%;height:100%;object-fit:cover;display:block;')} />
          </div>
          <div style={parseStyle('position:absolute;bottom:-22px;left:-22px;background:#c8a45c;color:#152730;padding:18px 24px;border-radius:14px;box-shadow:0 16px 36px rgba(200,164,92,.4);max-width:200px;')}>
            <div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:700;line-height:1.1;")}>Vista da Serra do Japi</div>
            <div style={parseStyle('font-size:12.5px;margin-top:5px;opacity:.8;')}>varanda em todas as unidades</div>
          </div>
        </div>
      </section>

      {/* ============ TIPOLOGIAS ============ */}
      <section id="tipologias" style={parseStyle('scroll-margin-top:120px;background:#fff;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('max-width:680px;margin-bottom:54px;')}>
            <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Plantas e tipologias</div>
            <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0;color:#152730;")}>Escolha o tamanho do seu novo lar</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;')}>
            {tipologias.map((t, i) => (
              <Hoverable key={i} data-reveal="" data-reveal-delay={String(t.delay)} baseStyle={parseStyle('border:1px solid rgba(16,52,62,.12);border-radius:16px;overflow:hidden;background:#f9faf8;display:flex;flex-direction:column;transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease;')} hoverStyle={parseStyle('transform:translateY(-6px);box-shadow:0 22px 48px rgba(16,52,62,.14);border-color:rgba(200,164,92,.6);')}>
                <button onClick={t.zoom} style={parseStyle('border:none;padding:0;cursor:zoom-in;display:block;width:100%;aspect-ratio:3/2;background:#eef1ec;border-bottom:1px solid rgba(16,52,62,.08);position:relative;overflow:hidden;')}>
                  <img src={t.plantaSrc} alt={`Planta ${t.area}m², ${t.title}, Brisas do Japi`} loading="lazy" style={parseStyle('width:100%;height:100%;object-fit:contain;display:block;padding:14px;box-sizing:border-box;transition:transform .4s ease;')} />
                  <span style={parseStyle('position:absolute;bottom:11px;right:11px;background:rgba(16,52,62,.88);color:#fff;font-size:11px;font-weight:700;letter-spacing:.02em;padding:7px 13px;border-radius:100px;pointer-events:none;')}>＋ Ampliar planta</span>
                </button>
                <div style={parseStyle('padding:26px;display:flex;flex-direction:column;flex:1;')}>
                  <span style={parseStyle('font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#b88f3f;')}>{t.tag}</span>
                  <div style={parseStyle('display:flex;align-items:baseline;gap:4px;margin:12px 0 4px;')}>
                    <span style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:52px;font-weight:700;color:#152730;line-height:1;")}>{t.area}</span>
                    <span style={parseStyle('font-size:20px;font-weight:600;color:#4c5a61;')}>m²</span>
                  </div>
                  <div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:19px;font-weight:600;color:#152730;margin-bottom:8px;")}>{t.title}</div>
                  <p style={parseStyle('font-size:14.5px;color:#5a6870;line-height:1.55;margin:0 0 22px;flex:1;')}>{t.desc}</p>
                  <Hoverable as="a" href="#contato" baseStyle={parseStyle('text-align:center;background:#123c47;color:#eef1ef;text-decoration:none;font-size:14.5px;font-weight:700;padding:13px;border-radius:100px;transition:background .25s ease;')} hoverStyle={parseStyle('background:#1a5666;')}>Tenho interesse</Hoverable>
                </div>
              </Hoverable>
            ))}
          </div>
          <p style={parseStyle('text-align:center;color:#8a949b;font-size:12.5px;margin-top:30px;letter-spacing:.04em;')}>Imagens e plantas meramente ilustrativas. Todas as tipologias com varanda e vaga.</p>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section id="lazer" style={parseStyle('scroll-margin-top:120px;background:#123c47;color:#eef1ef;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(36px,5vw,64px);align-items:end;margin-bottom:54px;')}>
            <div data-reveal="">
              <div style={parseStyle('color:#c8a45c;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Aproveite o dia a dia</div>
              <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0 0 16px;color:#fff;")}>+ de 17 itens de lazer e conveniência</h2>
              <p style={parseStyle('font-size:17px;line-height:1.65;color:rgba(232,240,239,.78);margin:0;max-width:52ch;')}>Lazer e comodidade são capítulos à parte no Brisas do Japi. Tudo para atender as necessidades modernas de moradia e convivência.</p>
            </div>
            <div data-reveal="" data-reveal-delay="100" style={parseStyle('border-radius:16px;overflow:hidden;box-shadow:0 26px 60px rgba(0,0,0,.3);aspect-ratio:16/10;')}>
              <img src="https://vvcconstrutora.com.br/images/brisas-galeria/PISCINA.jpg" alt="Piscina adulto com prainha e raia de 25 metros no Brisas do Japi" style={parseStyle('width:100%;height:100%;object-fit:cover;display:block;')} />
            </div>
          </div>
          <div data-reveal="" style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1px;background:rgba(232,240,239,.13);border:1px solid rgba(232,240,239,.13);border-radius:16px;overflow:hidden;')}>
            {lazer.map((l, i) => (
              <Hoverable key={i} baseStyle={parseStyle('background:#123c47;padding:22px 22px;display:flex;align-items:flex-start;gap:14px;transition:background .25s ease;')} hoverStyle={parseStyle('background:#15414e;')}>
                <span style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:14px;font-weight:700;color:#c8a45c;flex:none;min-width:24px;")}>{l.n}</span>
                <span style={parseStyle('font-size:14.5px;line-height:1.4;color:#e7eceb;font-weight:500;')}>{l.name}</span>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALERIA ============ */}
      <section id="galeria" style={parseStyle('scroll-margin-top:120px;background:#f4f5f3;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;margin-bottom:46px;')}>
            <div style={parseStyle('max-width:680px;')}>
              <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Galeria</div>
              <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0;color:#152730;")}>Conheça cada ambiente</h2>
            </div>
            <span style={parseStyle('color:#8a949b;font-size:13px;font-weight:600;letter-spacing:.04em;')}>Clique para ampliar</span>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;')}>
            {gallery.map((g, i) => (
              <Hoverable key={i} as="button" onClick={g.open} baseStyle={parseStyle('position:relative;border:none;padding:0;cursor:pointer;border-radius:14px;overflow:hidden;aspect-ratio:4/3;background:#dfe4e2;display:block;width:100%;box-shadow:0 8px 24px rgba(16,52,62,.1);transition:transform .35s ease, box-shadow .35s ease;')} hoverStyle={parseStyle('transform:translateY(-5px);box-shadow:0 22px 46px rgba(16,52,62,.2);')}>
                <img src={g.src} alt={`${g.label}, Brisas do Japi, Jundiaí`} loading="lazy" style={parseStyle('width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease;')} />
                <span style={parseStyle('position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(8,24,30,.78));')}></span>
                <span style={parseStyle("position:absolute;left:18px;bottom:16px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;text-align:left;text-shadow:0 2px 8px rgba(0,0,0,.4);")}>{g.label}</span>
              </Hoverable>
            ))}
          </div>
          <p style={parseStyle('text-align:center;color:#8a949b;font-size:12.5px;margin-top:28px;letter-spacing:.04em;')}>Imagens ilustrativas.</p>
        </div>
      </section>

      {/* ============ LIGHTBOX ============ */}
      {lightboxOpen && (
        <div onClick={close} style={parseStyle('position:fixed;inset:0;z-index:200;background:rgba(8,20,15,.93);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:clamp(20px,5vw,70px);')}>
          <button onClick={close} style={parseStyle('position:absolute;top:24px;right:28px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;width:46px;height:46px;border-radius:50%;font-size:22px;cursor:pointer;line-height:1;')}>×</button>
          <button onClick={prevImg} style={parseStyle('position:absolute;left:clamp(12px,3vw,40px);top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;width:52px;height:52px;border-radius:50%;font-size:24px;cursor:pointer;')}>‹</button>
          <button onClick={nextImg} style={parseStyle('position:absolute;right:clamp(12px,3vw,40px);top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;width:52px;height:52px;border-radius:50%;font-size:24px;cursor:pointer;')}>›</button>
          <div onClick={stop} style={parseStyle('max-width:1100px;width:100%;text-align:center;')}>
            {lightboxOpen && cur.src && (
              <img src={cur.src} alt={cur.label || ''} style={{ maxWidth: '100%', maxHeight: '76vh', borderRadius: '12px', boxShadow: '0 30px 80px rgba(0,0,0,.5)', objectFit: 'contain' }} />
            )}
            <div style={parseStyle('display:flex;align-items:center;justify-content:center;gap:14px;margin-top:20px;color:#eef1ef;')}>
              <span style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:18px;font-weight:600;")}>{curLabel}</span>
              <span style={parseStyle('color:rgba(232,240,239,.55);font-size:14px;')}>{curIndex} / {galTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============ ZOOM PLANTA ============ */}
      {zoomOpen && (
        <div onClick={closeZoom} style={parseStyle('position:fixed;inset:0;z-index:200;background:rgba(8,20,15,.94);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:clamp(18px,4vw,60px);')}>
          <button onClick={closeZoom} style={parseStyle('position:absolute;top:24px;right:28px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;width:46px;height:46px;border-radius:50%;font-size:22px;cursor:pointer;line-height:1;')}>×</button>
          <div onClick={stop} style={parseStyle('text-align:center;max-width:1080px;width:100%;')}>
            <div style={parseStyle('background:#fff;border-radius:16px;padding:clamp(16px,2vw,30px);box-shadow:0 40px 90px rgba(0,0,0,.5);')}>
              {z && (
                <img src={z.src} alt={z.label || ''} style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
              )}
            </div>
            <div style={parseStyle("margin-top:18px;color:#eef1ef;font-family:'Bricolage Grotesque',sans-serif;font-size:18px;font-weight:600;")}>{zoomLabel}</div>
            <div style={parseStyle('margin-top:4px;color:rgba(232,240,239,.55);font-size:12.5px;')}>Imagem meramente ilustrativa</div>
          </div>
        </div>
      )}

      {/* ============ LOCALIZAÇÃO ============ */}
      <section id="localizacao" style={parseStyle('scroll-margin-top:120px;background:#fff;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(36px,5vw,64px);align-items:center;')}>
          <div data-reveal="">
            <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Localização</div>
            <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.08;letter-spacing:-.02em;margin:0 0 18px;color:#152730;")}>O privilégio do Bairro Medeiros</h2>
            <p style={parseStyle('font-size:17px;line-height:1.7;color:#4c5a61;margin:0 0 26px;max-width:54ch;')}>Localização privilegiada no coração do Bairro Medeiros, uma região em pleno desenvolvimento e valorização imobiliária, com infraestrutura completa a poucos metros do empreendimento. Entre em contato para agendar sua visita.</p>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;')}>
              {locPoints.map((p, i) => (
                <div key={i} style={parseStyle('display:flex;align-items:center;gap:11px;padding:13px 16px;background:#f4f5f3;border-radius:10px;')}>
                  <span style={parseStyle('width:8px;height:8px;border-radius:50%;background:#c8a45c;flex:none;')}></span>
                  <span style={parseStyle('font-size:14.5px;font-weight:600;color:#2b3a42;')}>{p.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal="" data-reveal-delay="120" style={parseStyle('position:relative;border-radius:16px;overflow:hidden;box-shadow:0 26px 60px rgba(16,52,62,.18);min-height:420px;border:1px solid rgba(16,52,62,.1);')}>
            <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-46.9450%2C-23.2350%2C-46.8250%2C-23.1350&layer=mapnik&marker=-23.1857%2C-46.8842" title="Mapa do Bairro Medeiros, Jundiaí" style={parseStyle('width:100%;height:100%;min-height:420px;border:0;display:block;')} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            <a href="https://www.google.com/maps/search/?api=1&query=Bairro+Medeiros+Jundia%C3%AD+SP" target="_blank" rel="noopener" style={parseStyle('position:absolute;bottom:16px;right:16px;background:#fff;color:#123c47;text-decoration:none;font-size:13px;font-weight:700;padding:11px 18px;border-radius:100px;box-shadow:0 8px 22px rgba(0,0,0,.18);')}>Abrir no Google Maps</a>
          </div>
        </div>
      </section>

      {/* ============ MINHA CASA MINHA VIDA ============ */}
      <section id="mcmv" style={parseStyle('scroll-margin-top:120px;background:linear-gradient(135deg,#15414e,#0b2730);color:#eef1ef;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);position:relative;overflow:hidden;')}>
        <div style={parseStyle('position:absolute;top:-120px;right:-120px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(200,164,92,.22),transparent 70%);')}></div>
        <div style={parseStyle('max-width:1100px;margin:0 auto;position:relative;z-index:2;text-align:center;')}>
          <div data-reveal="" style={parseStyle('color:#c8a45c;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:18px;')}>Novo Minha Casa Minha Vida</div>
          <h2 data-reveal="" data-reveal-delay="80" style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(32px,4.6vw,58px);line-height:1.06;letter-spacing:-.02em;margin:0 0 22px;color:#fff;text-wrap:balance;")}>Realize o sonho da casa própria com condições facilitadas</h2>
          <p data-reveal="" data-reveal-delay="140" style={parseStyle('font-size:18px;line-height:1.65;color:rgba(232,240,239,.85);max-width:62ch;margin:0 auto 40px;')}>Faça uma simulação de financiamento pelo programa Minha Casa Minha Vida e descubra como é possível morar no Brisas do Japi. Venha conhecer a maquete e o apartamento decorado.</p>
          <div data-reveal="" data-reveal-delay="200" style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;max-width:780px;margin:0 auto 44px;text-align:left;')}>
            <div style={parseStyle('background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:24px;')}>
              <div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;")}>Studios e 2 dormitórios</div>
              <div style={parseStyle('font-size:14.5px;color:rgba(232,240,239,.75);line-height:1.5;')}>Plantas de 34m² a 66m², todas com varanda e vaga de garagem.</div>
            </div>
            <div style={parseStyle('background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:24px;')}>
              <div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;")}>Simulação personalizada</div>
              <div style={parseStyle('font-size:14.5px;color:rgba(232,240,239,.75);line-height:1.5;')}>Nossos corretores ajudam você a simular o financiamento e conhecer o decorado.</div>
            </div>
          </div>
          <CtaSimulacao style={parseStyle('margin-top:26px')} />
        </div>
      </section>

      {/* ============ SOBRE VVC ============ */}
      <section style={parseStyle('background:#f4f5f3;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(36px,5vw,64px);align-items:center;')}>
          <div data-reveal="">
            <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Uma realização VVC</div>
            <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(28px,3.6vw,46px);line-height:1.1;letter-spacing:-.02em;margin:0 0 20px;color:#152730;")}>Construir sonhos é a nossa missão</h2>
            <p style={parseStyle('font-size:16.5px;line-height:1.7;color:#4c5a61;margin:0 0 28px;max-width:54ch;')}>A VVC atua desde 2002 no mercado de construção civil, construindo e incorporando empreendimentos residenciais, industriais e comerciais. É reconhecida por seu comprometimento com a qualidade e a entrega dentro dos prazos estabelecidos.</p>
            <div style={parseStyle('display:flex;gap:36px;flex-wrap:wrap;')}>
              <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:38px;font-weight:700;color:#123c47;")}>2002</div><div style={parseStyle('font-size:13.5px;color:#5a6870;margin-top:4px;')}>atuando no mercado</div></div>
              <div><div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:38px;font-weight:700;color:#123c47;")}>PBQP-H</div><div style={parseStyle('font-size:13.5px;color:#5a6870;margin-top:4px;')}>certificação em nível máximo</div></div>
            </div>
          </div>
          <div data-reveal="" data-reveal-delay="120" style={parseStyle('background:#fff;border:1px solid rgba(16,52,62,.1);border-radius:18px;padding:46px;text-align:center;box-shadow:0 20px 50px rgba(16,52,62,.08);')}>
            <img src="/brisas-do-japi/a000.png" alt="Logo Condomínio Brisas do Japi" style={parseStyle('height:92px;width:auto;margin:0 auto 6px;display:block;')} />
            <p style={parseStyle('font-size:12.5px;color:#8a949b;letter-spacing:.06em;text-transform:uppercase;margin:0 0 26px;')}>Jundiaí · Bairro Medeiros</p>
            <div style={parseStyle('height:1px;background:rgba(16,52,62,.1);margin:0 0 26px;')}></div>
            <img src="https://vvcconstrutora.com.br/images/vvc-logo.png" alt="Logo VVC Construtora" style={parseStyle('height:38px;width:auto;margin-bottom:14px;')} />
            <p style={parseStyle('font-size:14px;color:#5a6870;line-height:1.6;margin:0 0 6px;')}>Uma realização <strong style={parseStyle('color:#152730;')}>VVC Construtora</strong></p>
            <p style={parseStyle('font-size:14px;color:#8a949b;line-height:1.6;margin:0;')}>Anunciado por <strong style={parseStyle('color:#123c47;')}>{agency}</strong></p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section style={parseStyle('background:#fff;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:880px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('text-align:center;margin-bottom:50px;')}>
            <div style={parseStyle('color:#b88f3f;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Perguntas frequentes</div>
            <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,50px);line-height:1.08;letter-spacing:-.02em;margin:0;color:#152730;")}>Tire suas dúvidas</h2>
          </div>
          <div data-reveal="" style={parseStyle('display:flex;flex-direction:column;gap:12px;')}>
            {faqs.map((f, i) => (
              <details key={i} style={parseStyle('background:#f4f5f3;border:1px solid rgba(16,52,62,.1);border-radius:12px;padding:4px 22px;')}>
                <summary style={parseStyle("cursor:pointer;list-style:none;padding:20px 0;font-family:'Bricolage Grotesque',sans-serif;font-size:17.5px;font-weight:600;color:#152730;display:flex;justify-content:space-between;align-items:center;gap:16px;")}>{f.q}<span style={parseStyle('color:#c8a45c;font-size:22px;font-weight:400;flex:none;')}>+</span></summary>
                <p style={parseStyle('margin:0 0 20px;font-size:15.5px;line-height:1.65;color:#54636b;')}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTATO / FORM ============ */}
      <section id="contato" style={parseStyle('scroll-margin-top:120px;background:#123c47;color:#eef1ef;padding:clamp(70px,9vw,120px) clamp(20px,5vw,64px);')}>
        <div style={parseStyle('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(40px,5vw,72px);align-items:center;')}>
          <div data-reveal="">
            <div style={parseStyle('color:#c8a45c;font-size:13px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;margin-bottom:16px;')}>Fale com um corretor</div>
            <h2 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:clamp(30px,4.2vw,52px);line-height:1.06;letter-spacing:-.02em;margin:0 0 20px;color:#fff;")}>Agende sua visita ao decorado</h2>
            <p style={parseStyle('font-size:17px;line-height:1.65;color:rgba(232,240,239,.8);margin:0 0 30px;max-width:46ch;')}>Deixe seus dados e um especialista entrará em contato com valores, plantas e condições do Minha Casa Minha Vida.</p>
            <a href={heroCta} target="_blank" rel="noopener" style={parseStyle('display:inline-flex;align-items:center;gap:12px;color:#fff;text-decoration:none;font-size:18px;font-weight:700;')}>
              <span style={parseStyle('width:42px;height:42px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;flex-shrink:0;')}><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" /></svg></span>
              Agende sua visita agora mesmo
            </a>
          </div>
          <div data-reveal="" data-reveal-delay="120">
            {notSent && (
              <form onSubmit={submit} style={parseStyle('background:#f9faf8;border-radius:18px;padding:clamp(26px,3vw,40px);box-shadow:0 30px 70px rgba(0,0,0,.3);')}>
                <div style={parseStyle('display:flex;flex-direction:column;gap:15px;')}>
                  <input ref={nomeRef} type="text" required placeholder="Seu nome completo" style={parseStyle('padding:15px 18px;border-radius:10px;border:1px solid rgba(16,52,62,.18);font-size:15px;font-family:inherit;background:#fff;color:#152730;outline:none;')} />
                  <input ref={telRef} type="tel" required placeholder="WhatsApp / Telefone" style={parseStyle('padding:15px 18px;border-radius:10px;border:1px solid rgba(16,52,62,.18);font-size:15px;font-family:inherit;background:#fff;color:#152730;outline:none;')} />
                  <input ref={emailRef} type="email" required placeholder="Seu melhor e-mail" style={parseStyle('padding:15px 18px;border-radius:10px;border:1px solid rgba(16,52,62,.18);font-size:15px;font-family:inherit;background:#fff;color:#152730;outline:none;')} />
                  <select ref={tipoRef} style={parseStyle('padding:15px 18px;border-radius:10px;border:1px solid rgba(16,52,62,.18);font-size:15px;font-family:inherit;background:#fff;color:#152730;outline:none;')}>
                    <option value="">Tipologia de interesse (opcional)</option>
                    <option>Studio · 34m²</option>
                    <option>2 Dormitórios · 49m²</option>
                    <option>2 Dorms (1 suíte) · 52m²</option>
                    <option>2 Dorms (1 suíte) · 66m²</option>
                  </select>
                  <Hoverable as="button" type="submit" baseStyle={parseStyle('margin-top:6px;background:#c8a45c;color:#152730;border:none;font-size:16px;font-weight:700;padding:16px;border-radius:100px;cursor:pointer;box-shadow:0 12px 28px rgba(200,164,92,.4);transition:transform .2s ease;')} hoverStyle={parseStyle('transform:translateY(-2px);')}>Quero receber as condições</Hoverable>
                  <p style={parseStyle('font-size:11.5px;color:#8a949b;text-align:center;line-height:1.5;margin:2px 0 0;')}>Ao enviar, você concorda em ser contatado sobre o Brisas do Japi. Seus dados estão protegidos pela LGPD.</p>
                </div>
              </form>
            )}
            {sent && (
              <div style={parseStyle('background:#f9faf8;border-radius:18px;padding:48px 36px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.3);')}>
                <div style={parseStyle('width:64px;height:64px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:30px;color:#fff;')}>✓</div>
                <h3 style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-size:24px;font-weight:700;color:#152730;margin:0 0 12px;")}>Recebemos seu contato!</h3>
                <p style={parseStyle('font-size:15.5px;color:#54636b;line-height:1.6;margin:0 0 24px;')}>Abrimos o WhatsApp para agilizar seu atendimento. Se não abriu, fale com a gente agora.</p>
                <a href={heroCta} target="_blank" rel="noopener" style={parseStyle('display:inline-block;background:#123c47;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 30px;border-radius:100px;')}>Abrir WhatsApp</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={parseStyle('background:#0a1f27;color:rgba(232,240,239,.6);padding:clamp(50px,6vw,80px) clamp(20px,5vw,64px) 40px;')}>
        <div style={parseStyle('max-width:1240px;margin:0 auto;')}>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;padding-bottom:40px;border-bottom:1px solid rgba(232,240,239,.12);')}>
            <div>
              <div style={parseStyle("font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;color:#fff;")}>Brisas do Japi</div>
              <div style={parseStyle('font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#c8a45c;margin-top:6px;')}>Jundiaí · Bairro Medeiros</div>
              <p style={parseStyle('font-size:14px;line-height:1.6;margin:18px 0 0;max-width:34ch;')}>Bairro Medeiros, Jundiaí/SP. Entre em contato para agendar sua visita com um corretor.</p>
            </div>
            <div>
              <div style={parseStyle('color:#fff;font-weight:700;font-size:14px;margin-bottom:14px;')}>Empreendimento</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:9px;font-size:14px;')}>
                <a href="#tipologias" style={parseStyle('color:rgba(232,240,239,.65);text-decoration:none;')}>Plantas</a>
                <a href="#lazer" style={parseStyle('color:rgba(232,240,239,.65);text-decoration:none;')}>Lazer</a>
                <a href="#galeria" style={parseStyle('color:rgba(232,240,239,.65);text-decoration:none;')}>Galeria</a>
                <a href="#localizacao" style={parseStyle('color:rgba(232,240,239,.65);text-decoration:none;')}>Localização</a>
              </div>
            </div>
            <div>
              <div style={parseStyle('color:#fff;font-weight:700;font-size:14px;margin-bottom:14px;')}>Atendimento</div>
              <a href={heroCta} target="_blank" rel="noopener" style={parseStyle('color:#c8a45c;text-decoration:none;font-weight:700;font-size:16px;')}>Falar no WhatsApp</a>
              <div style={parseStyle('font-size:13.5px;line-height:1.6;margin:16px 0 0;')}>
                Anunciado por
                <img src="/logo-lotus-dourado.png" alt={agency} style={{ height: 38, width: 'auto', display: 'block', marginTop: 8 }} />
              </div>
            </div>
          </div>
          <p style={parseStyle('font-size:11.5px;line-height:1.7;margin:28px 0 0;max-width:none;')}>Incorporação registrada no 1º Oficial de Registro de Imóveis, Títulos e Documentos e Civil de Pessoa Jurídica da Comarca de Jundiaí/SP, no Livro nº 2 – Registro Geral, matrícula 173.538, em 17 de abril de 2023. As imagens aqui apresentadas são de caráter meramente ilustrativo, tendo como finalidade a divulgação do empreendimento para fins comerciais e estão sujeitas a alterações. O projeto será executado de acordo com o Memorial Descritivo. A vegetação que compõe o paisagismo é ilustrativa, apresenta porte adulto de referência e, na entrega do empreendimento, apresentará diferença de tamanho, pois será entregue em forma de mudas, conforme o projeto. A construtora reserva-se no direito de alterar as especificações deste material publicitário, prevalecendo as condições informadas no ato da venda e estabelecidas em contrato. CRECISP: 28693-J.</p>
          <div style={parseStyle('margin-top:26px;font-size:12.5px;color:rgba(232,240,239,.45);')}>Uma realização VVC Construtora · © 2026 · Todos os direitos reservados.</div>
        </div>
      </footer>

      {/* ============ FLOATING WHATSAPP ============ */}
      <a href={heroCta} target="_blank" rel="noopener" aria-label="Falar no WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:150;background:#25d366;color:#0a3d22;text-decoration:none;font-weight:800;font-size:14px;padding:15px 22px;border-radius:100px;box-shadow:0 12px 30px rgba(37,211,102,.5);animation:bdjPulse 2.6s infinite;')}>WhatsApp</a>
    </div>
  );
}
