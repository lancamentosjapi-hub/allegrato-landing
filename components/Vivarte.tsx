'use client';

/**
 * Vivarte — porte 1:1 de vivarte/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores EXATOS).
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *                            reproduzindo o componentDidMount original (threshold .12,
 *                            rootMargin '0px 0px -8% 0px', translateY(34px), delays por data-delay).
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - carrossel de amenities, header on-scroll, barra de progresso e parallax do hero
 *    portados em useEffect fiéis, com cleanup.
 *  - res(a.src) do estático (window.__resources) -> imagens estáticas em /vivarte/.
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
/* Dados estáticos (valores EXATOS do script)                         */
/* ------------------------------------------------------------------ */

const WHATSAPP_NUMBER_DEFAULT = '5511926143393';
const WHATSAPP_DISPLAY_DEFAULT = '+55 11 92614-3393';
const AGENCY_NAME_DEFAULT = 'Lotus Brokers';
const CRECI_DEFAULT = '[CRECI]';

type Amenity = { name: string; src: string; alt: string; desc: string };

const amenityData: Amenity[] = [
  { name: 'Piscina', src: 'a019.jpg', alt: 'Perspectiva ilustrada da piscina com paisagismo', desc: 'Piscina adulto e infantil com deck molhado e solário, em clima de resort cercado pelo verde.' },
  { name: 'Beach Lounge', src: 'a013.jpg', alt: 'Perspectiva ilustrada do beach lounge', desc: 'Um beach lounge para relaxar com todo o conforto, ao entardecer.' },
  { name: 'Fire Place', src: 'a001.jpg', alt: 'Perspectiva ilustrada do fire place', desc: 'Fire place ao entardecer, sob os ipês, para encontros memoráveis.' },
  { name: 'Quadra de Areia', src: 'a014.jpg', alt: 'Perspectiva ilustrada da quadra de areia', desc: 'A descontração dos dias ao ar livre, na quadra de areia.' },
  { name: 'Quadra Gramada', src: 'a021.jpg', alt: 'Perspectiva ilustrada da quadra gramada', desc: 'Espaço gramado para esporte e lazer em família.' },
  { name: 'Churrasqueira Gourmet', src: 'a010.jpg', alt: 'Perspectiva ilustrada da churrasqueira gourmet', desc: 'Espaço gourmet para celebrar e reunir os amigos.' },
  { name: 'Salão de Festas', src: 'a018.jpg', alt: 'Perspectiva ilustrada do salão de festas', desc: 'Salão de festas sofisticado para as suas celebrações.' },
  { name: 'Fitness', src: 'a022.jpg', alt: 'Perspectiva ilustrada do fitness', desc: 'Academia equipada com amplas vistas para o verde.' },
  { name: 'Academia ao Ar Livre', src: 'a008.jpg', alt: 'Perspectiva ilustrada da academia ao ar livre', desc: 'Treine ao ar livre, cercado pela natureza e pelo paisagismo.' },
  { name: 'Sala de Jogos', src: 'a011.jpg', alt: 'Perspectiva ilustrada da sala de jogos', desc: 'Gaming zone e sala de jogos para todas as idades.' },
  { name: 'Cine Open', src: 'a017.jpg', alt: 'Perspectiva ilustrada do cine open', desc: 'Cinema ao ar livre para noites diferentes, em casa.' },
  { name: 'Brinquedoteca', src: 'a009.jpg', alt: 'Perspectiva ilustrada da brinquedoteca', desc: 'Brinquedoteca lúdica e segura para os pequenos.' },
  { name: 'Playground', src: 'a020.jpg', alt: 'Perspectiva ilustrada do playground', desc: 'Playground integrado ao paisagismo, para brincar com liberdade.' },
  { name: 'Pet Place', src: 'a016.jpg', alt: 'Perspectiva ilustrada do pet place', desc: 'Pet place para o lazer também do seu melhor amigo.' },
  { name: 'Sauna', src: 'a012.jpg', alt: 'Perspectiva ilustrada da sauna', desc: 'Sauna com espaço de descanso para o seu bem-estar.' },
  { name: 'Boulevard', src: 'a015.jpg', alt: 'Perspectiva ilustrada do boulevard', desc: 'Um boulevard arborizado conecta cada ambiente em caminhos de convivência.' },
  { name: 'Portaria', src: 'a003.jpg', alt: 'Perspectiva ilustrada da portaria', desc: 'Chegada imponente, com portaria e hall social que anunciam o padrão do empreendimento.' },
];

const faqData: Array<{ q: string; a: string }> = [
  { q: 'Onde fica o Vivarte Grand Alamedas?', a: 'Na Av. Juvenal Arantes, s/n, em Jundiaí, SP, com vista permanente para o verde da Serra do Japi e fácil acesso.' },
  { q: 'Quais são as opções de plantas?', a: 'São apartamentos de 2 dormitórios (1 suíte) com 65,18m² e de 3 dormitórios (1 suíte) com 78,35m², ambos com ampla varanda.' },
  { q: 'Quantas vagas de garagem?', a: 'A planta de 2 dormitórios conta com 1 vaga, e a de 3 dormitórios com 1 ou 2 vagas.' },
  { q: 'Quais itens de lazer estão disponíveis?', a: 'São mais de 30 itens, entre eles piscina adulto e infantil, quadra de areia, quadra gramada, beach lounge, fire place, sauna, cine open, pet place, fitness, academia ao ar livre, salão de festas, brinquedoteca e playground.' },
  { q: 'A varanda pode ser fechada ou integrada à sala?', a: 'Sim. As plantas têm previsão para fechamento da varanda e possibilidade de integrar a sala à varanda por meio de parede removível.' },
  { q: 'Quem é a construtora responsável?', a: 'O Grupo Diretiva, com mais de 50 anos de experiência, certificação ISO 9001 e Nível A no PBQP-H de forma contínua desde 2004, referência de qualidade no interior paulista.' },
  { q: 'Como faço para agendar uma visita?', a: 'Preencha o formulário desta página ou fale diretamente pelo WhatsApp. Nosso time entra em contato para apresentar o empreendimento e agendar sua visita.' },
];

// Chips "Mais de 30 espaços" (ordem e textos exatos do markup).
const amenityChips = [
  'Portaria', 'Boulevard', 'Piscina Adulto', 'Piscina Infantil', 'Deck Molhado', 'Solário',
  'Quadra de Areia', 'Quadra Gramada', 'Academia ao Ar Livre', 'CrossFit', 'Churrasqueira Gourmet',
  'Fire Place', 'Fitness', 'Salão de Festas', 'Sala de Jogos', 'Brinquedoteca', 'Playground',
  'Play Baby', 'Cine Open', 'Pet Place', 'Beach Lounge', 'Sauna', 'Descanso Sauna', 'Praça das Mães',
  'Praça dos Ipês', 'Trilha', 'Mini-horta', 'Hall Social', 'Delivery', 'Uber Place', 'Vestiário',
];

const CHIP_STYLE =
  "font-family:'Jost',sans-serif;font-size:13px;letter-spacing:.04em;color:rgba(246,241,230,.78);border:1px solid rgba(246,241,230,.16);padding:9px 16px;border-radius:40px;";

// SVG do WhatsApp (ícone grande, usado no float e no bloco de contato).
const WA_PATH =
  'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.738-.755zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z';

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Vivarte({
  agencyName = AGENCY_NAME_DEFAULT,
  creci = CRECI_DEFAULT,
  whatsappNumber = WHATSAPP_NUMBER_DEFAULT,
  whatsappDisplay = WHATSAPP_DISPLAY_DEFAULT,
}: {
  agencyName?: string;
  creci?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [activeAmenity, setActiveAmenity] = useState(0);
  const [planta, setPlanta] = useState<'2' | '3'>('3');
  const [openFaq, setOpenFaq] = useState(0);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [zoom, setZoom] = useState<string | null>(null);

  // refs
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // paused (hover na galeria pausa o carrossel) e zoom via ref (para o handler de teclado)
  const pausedRef = useRef(false);
  const zoomRef = useRef<string | null>(null);
  zoomRef.current = zoom;

  // Derivados (whatsapp + valores de props) — lógica exata do renderVals.
  const num = String(whatsappNumber ?? WHATSAPP_NUMBER_DEFAULT).replace(/\D/g, '');
  const display = whatsappDisplay ?? WHATSAPP_DISPLAY_DEFAULT;
  const whatsappHref =
    'https://wa.me/' +
    num +
    '?text=' +
    encodeURIComponent('Ola! Tenho interesse no Vivarte Grand Alamedas e gostaria de mais informacoes.');

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  /* -------- reveal + scroll (nav/progress/parallax) + carrossel + teclado (componentDidMount) -------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- reveal (IntersectionObserver) — fiel ao componentDidMount original ---
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    const raf = requestAnimationFrame(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const d = el.getAttribute('data-delay') || 0;
        el.style.opacity = '0';
        el.style.transform = 'translateY(34px)';
        el.style.transition =
          'opacity 1s cubic-bezier(.16,.84,.44,1) ' + d + 'ms, transform 1.1s cubic-bezier(.16,.84,.44,1) ' + d + 'ms';
        io.observe(el);
      });
    });

    // --- scroll: nav on-scroll + barra de progresso + parallax do hero ---
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const nav = navRef.current;
      if (nav) {
        if (y > 40) {
          nav.style.background = 'rgba(10,20,14,.88)';
          nav.style.backdropFilter = 'blur(14px)';
          (nav.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'blur(14px)';
          nav.style.borderBottom = '1px solid rgba(241,235,221,.1)';
          nav.style.paddingTop = '15px';
          nav.style.paddingBottom = '15px';
        } else {
          nav.style.background = 'transparent';
          nav.style.backdropFilter = 'none';
          (nav.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'none';
          nav.style.borderBottom = '1px solid transparent';
          nav.style.paddingTop = '26px';
          nav.style.paddingBottom = '26px';
        }
      }
      const p = progressRef.current;
      if (p) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        p.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
      const bg = heroBgRef.current;
      if (bg && y < window.innerHeight * 1.2) {
        bg.style.transform = 'translateY(' + y * 0.16 + 'px)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- carrossel de amenities (4800ms, pausa no hover da galeria) ---
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setActiveAmenity((s) => (s + 1) % amenityData.length);
      }
    }, 4800);

    // --- Escape fecha o zoom ---
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomRef.current) setZoom(null);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      clearInterval(timer);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- métodos (do script) -------- */
  const onZoomPlan = () => setZoom(planta === '3' ? 'a005.jpg' : 'a006.jpg');
  const onCloseZoom = () => setZoom(null);
  const onContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nome = ((nomeRef.current && nomeRef.current.value) || '').trim();
    const tel = ((telRef.current && telRef.current.value) || '').trim();
    const email = ((emailRef.current && emailRef.current.value) || '').trim();
    if (!nome || !tel) {
      setFormError('Por favor, preencha nome e telefone.');
      return;
    }
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_vivarte',
      interest: 'Vivarte Grand Alamedas',
    });
    const n = String(whatsappNumber ?? WHATSAPP_NUMBER_DEFAULT).replace(/\D/g, '');
    const msg =
      'Ola! Tenho interesse no Vivarte Grand Alamedas.%0A%0ANome: ' +
      encodeURIComponent(nome) +
      '%0ATelefone: ' +
      encodeURIComponent(tel) +
      (email ? '%0AE-mail: ' + encodeURIComponent(email) : '') +
      '%0A%0AGostaria de agendar uma visita.';
    window.open('https://wa.me/' + n + '?text=' + msg, '_blank');
    setSent(true);
    setFormError('');
  };

  /* -------- derivados de estado (render context) -------- */
  const active = activeAmenity;
  const is3 = planta === '3';

  const amenities = amenityData.map((a, i) => ({
    name: a.name,
    barW: i === active ? '40px' : '12px',
    numColor: i === active ? '#F6F1E6' : 'rgba(241,235,221,.38)',
    nameColor: i === active ? '#F6F1E6' : 'rgba(241,235,221,.55)',
    num: pad(i),
    onClick: () => setActiveAmenity(i),
  }));

  const faqs = faqData.map((f, i) => {
    const open = openFaq === i;
    return {
      q: f.q,
      a: f.a,
      rot: open ? '45deg' : '0deg',
      maxH: open ? '320px' : '0px',
      op: open ? '1' : '0',
      onToggle: () => setOpenFaq((s) => (s === i ? -1 : i)),
    };
  });

  const activeName = amenityData[active].name;
  const activeDesc = amenityData[active].desc;
  const activeNum = pad(active);
  const totalNum = pad(amenityData.length - 1);

  const plan2Op = is3 ? '0' : '1';
  const plan3Op = is3 ? '1' : '0';
  const tab2Color = is3 ? 'rgba(27,46,34,.4)' : '#1B2E22';
  const tab3Color = is3 ? '#1B2E22' : 'rgba(27,46,34,.4)';
  const tab2Bar = is3 ? 'transparent' : '#A9743F';
  const tab3Bar = is3 ? '#A9743F' : 'transparent';

  const zoomLabel = is3 ? '3 dormitórios · 78,35 m²' : '2 dormitórios · 65,18 m²';

  return (
    <div
      ref={rootRef}
      className="vv-root"
      style={parseStyle("font-family:'Jost',sans-serif;color:#1B1813;background:#0E1A13;overflow-x:hidden;")}
    >
      {/* barra de progresso */}
      <div
        ref={progressRef}
        style={parseStyle('position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#93A074,#A9743F);z-index:120;transition:width .1s linear;')}
      ></div>

      {/* ============ NAV ============ */}
      <nav
        ref={navRef}
        style={parseStyle('position:fixed;top:0;left:0;right:0;z-index:110;display:flex;align-items:center;justify-content:space-between;padding:26px clamp(20px,5vw,72px);transition:all .45s cubic-bezier(.16,.84,.44,1);')}
      >
        <a href="#topo" style={parseStyle('text-decoration:none;display:flex;flex-direction:column;align-items:center;line-height:.84;')}>
          <span style={parseStyle("font-family:'Kaushan Script','Allura',cursive;font-size:29px;color:#F1EBDD;")}>Vivarte</span>
          <span style={parseStyle("font-family:'Allura',cursive;font-size:21px;color:#F1EBDD;margin-top:-4px;padding-left:24px;")}>Grand</span>
          <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:8px;letter-spacing:.5em;color:#93A074;padding-left:8px;margin-top:2px;")}>ALAMEDAS</span>
        </a>
        <div style={parseStyle('display:flex;align-items:center;gap:clamp(14px,2.2vw,38px);')}>
          <Hoverable as="a" href="#conceito" baseStyle={parseStyle('text-decoration:none;color:rgba(241,235,221,.82);font-size:13px;letter-spacing:.08em;transition:color .3s;')} hoverStyle={parseStyle('color:#93A074;')}>Conceito</Hoverable>
          <Hoverable as="a" href="#lazer" baseStyle={parseStyle('text-decoration:none;color:rgba(241,235,221,.82);font-size:13px;letter-spacing:.08em;transition:color .3s;')} hoverStyle={parseStyle('color:#93A074;')}>Lazer</Hoverable>
          <Hoverable as="a" href="#plantas" baseStyle={parseStyle('text-decoration:none;color:rgba(241,235,221,.82);font-size:13px;letter-spacing:.08em;transition:color .3s;')} hoverStyle={parseStyle('color:#93A074;')}>Plantas</Hoverable>
          <Hoverable as="a" href="#local" baseStyle={parseStyle('text-decoration:none;color:rgba(241,235,221,.82);font-size:13px;letter-spacing:.08em;transition:color .3s;')} hoverStyle={parseStyle('color:#93A074;')}>Localização</Hoverable>
          <Hoverable as="a" href="#diretiva" baseStyle={parseStyle('text-decoration:none;color:rgba(241,235,221,.82);font-size:13px;letter-spacing:.08em;transition:color .3s;')} hoverStyle={parseStyle('color:#93A074;')}>Construtora</Hoverable>
          <Hoverable as="a" href="#contato" baseStyle={parseStyle('text-decoration:none;color:#0E1A13;background:#F1EBDD;padding:12px 26px;border-radius:2px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;transition:all .35s;')} hoverStyle={parseStyle('background:#93A074;color:#0E1A13;')}>Agende uma visita</Hoverable>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section id="topo" data-screen-label="Hero" style={parseStyle('position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#0E1A13;')}>
        <div ref={heroBgRef} style={parseStyle('position:absolute;inset:-7% 0;will-change:transform;')}>
          <img src="/vivarte/a003.jpg" alt="Perspectiva ilustrada da portaria do Vivarte Grand Alamedas em Jundiaí" style={parseStyle('width:100%;height:100%;object-fit:cover;animation:kb 22s ease-in-out infinite alternate;')} />
        </div>
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,26,19,.55) 0%,rgba(14,26,19,.18) 32%,rgba(14,26,19,.62) 74%,rgba(14,26,19,.92) 100%);')}></div>
        <div style={parseStyle('position:absolute;inset:0;background:radial-gradient(120% 80% at 15% 90%,rgba(14,26,19,.7),transparent 60%);')}></div>
        <div style={parseStyle('position:relative;z-index:3;width:100%;max-width:1320px;margin:0 auto;padding:clamp(96px,13vh,150px) clamp(20px,5vw,72px) clamp(40px,6vh,70px);')}>
          <div data-reveal="" style={parseStyle('display:inline-flex;align-items:center;gap:14px;margin-bottom:26px;')}>
            <span style={parseStyle('width:42px;height:1px;background:#93A074;')}></span>
            <span style={parseStyle('font-size:12px;letter-spacing:.42em;color:#AAB68F;text-transform:uppercase;')}>Jundiaí · Serra do Japi</span>
          </div>
          <h1 data-reveal="" data-delay="120" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;color:#F6F1E6;font-size:clamp(2.9rem,7vw,6.6rem);line-height:.98;letter-spacing:-.5px;margin:0 0 28px;max-width:16ch;text-wrap:balance;")}>Desperte para um novo jeito de viver.</h1>
          <p data-reveal="" data-delay="240" style={parseStyle('font-size:clamp(1rem,1.4vw,1.22rem);line-height:1.7;color:rgba(246,241,230,.84);max-width:54ch;margin:0 0 40px;font-weight:300;')}>No coração de Jundiaí e aos pés da Serra do Japi, o Vivarte Grand Alamedas une arquitetura contemporânea, paisagismo exuberante e mais de 30 espaços de lazer. Um endereço pensado nos mínimos detalhes para transformar o seu dia a dia em uma experiência.</p>
          <div data-reveal="" data-delay="360" style={parseStyle('display:flex;flex-wrap:wrap;gap:16px;align-items:center;')}>
            <Hoverable as="a" href="#contato" baseStyle={parseStyle('text-decoration:none;background:#A9743F;color:#F6F1E6;padding:18px 40px;border-radius:2px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;transition:all .4s;box-shadow:0 18px 40px -18px rgba(169,116,63,.9);')} hoverStyle={parseStyle('background:#C08A52;transform:translateY(-2px);')}>Agende sua visita</Hoverable>
            <Hoverable as="a" href={whatsappHref} target="_blank" rel="noopener" baseStyle={parseStyle('text-decoration:none;color:#F6F1E6;padding:17px 34px;border:1px solid rgba(246,241,230,.4);border-radius:2px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;transition:all .4s;display:inline-flex;align-items:center;gap:10px;')} hoverStyle={parseStyle('border-color:#93A074;background:rgba(147,160,116,.12);')}>Falar no WhatsApp</Hoverable>
          </div>
        </div>
        <div style={parseStyle('position:absolute;right:clamp(20px,5vw,72px);bottom:clamp(60px,9vh,110px);z-index:3;display:flex;flex-direction:column;align-items:center;gap:12px;')}>
          <span style={parseStyle('writing-mode:vertical-rl;font-size:10px;letter-spacing:.4em;color:rgba(246,241,230,.6);text-transform:uppercase;')}>Role para descobrir</span>
          <span style={parseStyle('width:1px;height:46px;background:linear-gradient(#93A074,transparent);animation:scrollHint 1.8s ease-in-out infinite;')}></span>
        </div>
      </section>

      {/* ============ CONCEITO ============ */}
      <section id="conceito" data-screen-label="Conceito" style={parseStyle('background:#F6F1E6;padding:clamp(80px,12vh,150px) clamp(20px,5vw,72px);position:relative;')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(40px,6vw,90px);align-items:center;')}>
          <div data-reveal="" style={parseStyle('position:relative;')}>
            <div style={parseStyle('position:relative;border-radius:3px;overflow:hidden;box-shadow:0 40px 80px -40px rgba(27,24,19,.45);')}>
              <img src="/vivarte/a004.jpg" alt="Viver cercado pela natureza no Vivarte Grand Alamedas" style={parseStyle('width:100%;height:clamp(380px,56vh,620px);object-fit:cover;object-position:20% 25%;display:block;')} />
            </div>
            <div style={parseStyle('position:absolute;bottom:-34px;right:-10px;width:clamp(150px,18vw,210px);height:clamp(150px,18vw,210px);border-radius:3px;overflow:hidden;border:8px solid #F6F1E6;box-shadow:0 30px 60px -30px rgba(27,24,19,.5);animation:floaty 7s ease-in-out infinite;')}>
              <img src="/vivarte/a000.jpg" alt="Natureza e paisagismo" style={parseStyle('width:100%;height:100%;object-fit:cover;')} />
            </div>
          </div>
          <div>
            <div data-reveal="" style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px;')}>
              <span style={parseStyle('width:38px;height:1px;background:#A9743F;')}></span>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#A9743F;text-transform:uppercase;')}>O conceito</span>
            </div>
            <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.4vw,3.7rem);line-height:1.04;color:#1B2E22;margin:0 0 26px;text-wrap:balance;")}>Apaixone-se por onde você mora.</h2>
            <p data-reveal="" data-delay="140" style={parseStyle('font-size:1.08rem;line-height:1.8;color:#5A5547;font-weight:300;margin:0 0 22px;max-width:52ch;')}>Da imponência da portaria ao oásis central do projeto, caminhar pelo boulevard é descobrir espaços onde paisagismo e convivência se encontram em perfeita harmonia. Nas áreas de lazer ou no aconchego do apartamento, tudo valoriza a iluminação natural, a amplitude e a vista permanente para o verde.</p>
            <div data-reveal="" data-delay="220" style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:36px;background:rgba(27,24,19,.1);border:1px solid rgba(27,24,19,.1);')}>
              <div style={parseStyle('background:#F6F1E6;padding:22px 18px;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:#A9743F;line-height:1;")}>30+</div>
                <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:#5A5547;margin-top:8px;')}>itens de lazer</div>
              </div>
              <div style={parseStyle('background:#F6F1E6;padding:22px 18px;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:#A9743F;line-height:1;")}>2 e 3</div>
                <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:#5A5547;margin-top:8px;')}>dormitórios</div>
              </div>
              <div style={parseStyle('background:#F6F1E6;padding:22px 18px;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:#A9743F;line-height:1;")}>65–78</div>
                <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:#5A5547;margin-top:8px;')}>metros quadrados</div>
              </div>
              <div style={parseStyle('background:#F6F1E6;padding:22px 18px;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:#A9743F;line-height:1;")}>Japi</div>
                <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:#5A5547;margin-top:8px;')}>vista para a Serra</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div style={parseStyle('background:#F6F1E6;overflow:hidden;padding:8px 0 40px;')}>
        <div style={parseStyle('display:flex;width:max-content;animation:marquee 38s linear infinite;opacity:.32;')}>
          <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(2rem,5vw,3.6rem);color:#1B2E22;white-space:nowrap;padding-right:40px;")}>Natureza · Arquitetura · Privacidade · Lazer · Bem-estar · Família · Serra do Japi ·&nbsp;</span>
          <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(2rem,5vw,3.6rem);color:#1B2E22;white-space:nowrap;padding-right:40px;")}>Natureza · Arquitetura · Privacidade · Lazer · Bem-estar · Família · Serra do Japi ·&nbsp;</span>
        </div>
      </div>

      {/* ============ LAZER / GALERIA ============ */}
      <section id="lazer" data-screen-label="Galeria de Lazer" style={parseStyle('background:#0E1A13;padding:clamp(80px,13vh,160px) clamp(20px,5vw,72px);position:relative;')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;')}>
          <div style={parseStyle('display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:clamp(40px,6vh,70px);')}>
            <div>
              <div data-reveal="" style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:20px;')}>
                <span style={parseStyle('width:38px;height:1px;background:#93A074;')}></span>
                <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#AAB68F;text-transform:uppercase;')}>Vida em movimento</span>
              </div>
              <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.6vw,4rem);line-height:1;color:#F6F1E6;margin:0;text-wrap:balance;")}>A beleza do lazer,<br />a cada esquina.</h2>
            </div>
            <p data-reveal="" data-delay="160" style={parseStyle('font-size:1.02rem;line-height:1.75;color:rgba(246,241,230,.7);font-weight:300;max-width:40ch;margin:0;')}>Entre espaços para relaxar, celebrar e conviver, uma atmosfera de resort conecta cada ambiente por caminhos arborizados.</p>
          </div>

          <div
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            style={parseStyle('display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:clamp(20px,3vw,48px);align-items:stretch;')}
          >
            <div data-reveal="" style={parseStyle('position:relative;border-radius:3px;overflow:hidden;min-height:clamp(420px,62vh,680px);background:#0E1A13;box-shadow:0 50px 90px -50px rgba(0,0,0,.8);')}>
              {amenityData.map((a, i) => (
                <img
                  key={i}
                  src={`/vivarte/${a.src}`}
                  alt={a.alt}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: i === active ? 1 : 0,
                    transform: 'scale(' + (i === active ? 1.06 : 1.12) + ')',
                    transition: 'opacity 1s cubic-bezier(.4,0,.2,1), transform 6s ease-out',
                  }}
                />
              ))}
              <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(14,26,19,.9) 100%);')}></div>
              <div style={parseStyle('position:absolute;left:0;bottom:0;padding:clamp(26px,4vw,48px);width:100%;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:.95rem;color:#AAB68F;letter-spacing:.1em;margin-bottom:8px;")}>{activeNum} <span style={parseStyle('opacity:.5;')}>/ {totalNum}</span></div>
                <h3 style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(1.8rem,3.2vw,2.8rem);color:#F6F1E6;margin:0 0 10px;line-height:1;")}>{activeName}</h3>
                <p style={parseStyle('font-size:.98rem;line-height:1.6;color:rgba(246,241,230,.82);font-weight:300;max-width:46ch;margin:0;')}>{activeDesc}</p>
              </div>
            </div>
            <div style={parseStyle('display:flex;flex-direction:column;max-height:clamp(420px,62vh,680px);overflow-y:auto;padding-right:6px;')}>
              {amenities.map((item, i) => (
                <Hoverable
                  key={i}
                  as="button"
                  onClick={item.onClick}
                  onMouseEnter={item.onClick}
                  baseStyle={parseStyle('all:unset;cursor:pointer;display:flex;align-items:center;gap:18px;padding:16px 4px;border-bottom:1px solid rgba(246,241,230,.1);transition:padding .35s;')}
                  hoverStyle={parseStyle('padding-left:10px;')}
                >
                  <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1rem;color:" + item.numColor + ";min-width:30px;transition:color .35s;")}>{item.num}</span>
                  <span style={parseStyle('height:2px;width:' + item.barW + ';background:#A9743F;transition:width .4s cubic-bezier(.16,.84,.44,1);flex-shrink:0;')}></span>
                  <span style={parseStyle("font-family:'Jost',sans-serif;font-size:clamp(1rem,1.4vw,1.18rem);color:" + item.nameColor + ";letter-spacing:.01em;transition:color .35s;")}>{item.name}</span>
                </Hoverable>
              ))}
            </div>
          </div>

          <div data-reveal="" style={parseStyle('margin-top:clamp(50px,7vh,90px);')}>
            <div style={parseStyle('display:flex;align-items:center;gap:16px;margin-bottom:30px;')}>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#AAB68F;text-transform:uppercase;white-space:nowrap;')}>Mais de 30 espaços</span>
              <span style={parseStyle('flex:1;height:1px;background:rgba(246,241,230,.14);')}></span>
            </div>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;')}>
              {amenityChips.map((chip, i) => (
                <span key={i} style={parseStyle(CHIP_STYLE)}>{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section id="plantas" data-screen-label="Plantas" style={parseStyle('background:#F6F1E6;padding:clamp(80px,12vh,150px) clamp(20px,5vw,72px);')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;margin-bottom:clamp(40px,6vh,64px);')}>
            <div data-reveal="" style={parseStyle('display:inline-flex;align-items:center;gap:14px;margin-bottom:20px;')}>
              <span style={parseStyle('width:38px;height:1px;background:#A9743F;')}></span>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#A9743F;text-transform:uppercase;')}>As plantas</span>
              <span style={parseStyle('width:38px;height:1px;background:#A9743F;')}></span>
            </div>
            <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.6vw,4rem);line-height:1.02;color:#1B2E22;margin:0;text-wrap:balance;")}>Plantas inspiradas na arte de viver.</h2>
          </div>

          <div data-reveal="" style={parseStyle('display:flex;justify-content:center;gap:6px;margin-bottom:clamp(36px,5vh,56px);')}>
            <button onClick={() => setPlanta('2')} style={parseStyle('all:unset;cursor:pointer;text-align:center;padding:14px 30px;border-bottom:2px solid ' + tab2Bar + ';transition:all .35s;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:" + tab2Color + ";line-height:1;transition:color .35s;")}>2 dormitórios</div>
              <div style={parseStyle('font-size:11px;letter-spacing:.14em;color:' + tab2Color + ';opacity:.7;margin-top:5px;text-transform:uppercase;')}>65,18 m²</div>
            </button>
            <button onClick={() => setPlanta('3')} style={parseStyle('all:unset;cursor:pointer;text-align:center;padding:14px 30px;border-bottom:2px solid ' + tab3Bar + ';transition:all .35s;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:" + tab3Color + ";line-height:1;transition:color .35s;")}>3 dormitórios</div>
              <div style={parseStyle('font-size:11px;letter-spacing:.14em;color:' + tab3Color + ';opacity:.7;margin-top:5px;text-transform:uppercase;')}>78,35 m²</div>
            </button>
          </div>

          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(36px,5vw,72px);align-items:center;')}>
            <Hoverable
              data-reveal=""
              onClick={onZoomPlan}
              baseStyle={parseStyle('position:relative;background:#fff;border-radius:3px;padding:clamp(20px,3vw,42px);box-shadow:0 40px 80px -45px rgba(27,24,19,.4);min-height:clamp(300px,42vh,460px);cursor:zoom-in;transition:box-shadow .4s,transform .4s;')}
              hoverStyle={parseStyle('box-shadow:0 55px 95px -38px rgba(27,24,19,.55);transform:translateY(-3px);')}
            >
              <span style={parseStyle('position:absolute;top:14px;right:14px;z-index:3;display:inline-flex;align-items:center;gap:7px;background:#1B2E22;color:#F6F1E6;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:8px 14px;border-radius:40px;pointer-events:none;')}>⤢ Ampliar planta</span>
              <img src="/vivarte/a006.jpg" alt="Planta de 2 dormitórios, 65,18m², Vivarte Grand Alamedas" style={parseStyle('position:absolute;inset:clamp(20px,3vw,42px);width:calc(100% - clamp(40px,6vw,84px));height:calc(100% - clamp(40px,6vw,84px));object-fit:contain;opacity:' + plan2Op + ';transition:opacity .7s ease;')} />
              <img src="/vivarte/a005.jpg" alt="Planta de 3 dormitórios, 78,35m², Vivarte Grand Alamedas" style={parseStyle('position:absolute;inset:clamp(20px,3vw,42px);width:calc(100% - clamp(40px,6vw,84px));height:calc(100% - clamp(40px,6vw,84px));object-fit:contain;opacity:' + plan3Op + ';transition:opacity .7s ease;')} />
            </Hoverable>
            <div>
              {!is3 && (
                <>
                  <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,5vw,3.4rem);color:#1B2E22;line-height:1;margin-bottom:6px;")}>65,18 m²</div>
                  <div style={parseStyle('font-size:13px;letter-spacing:.16em;color:#A9743F;text-transform:uppercase;margin-bottom:28px;')}>1 suíte · 2 dorms · ampla varanda · 1 vaga</div>
                </>
              )}
              {is3 && (
                <>
                  <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,5vw,3.4rem);color:#1B2E22;line-height:1;margin-bottom:6px;")}>78,35 m²</div>
                  <div style={parseStyle('font-size:13px;letter-spacing:.16em;color:#A9743F;text-transform:uppercase;margin-bottom:28px;')}>1 suíte · 3 dorms · ampla varanda · 1 ou 2 vagas</div>
                </>
              )}
              <p style={parseStyle('font-size:1.02rem;line-height:1.75;color:#5A5547;font-weight:300;margin:0 0 28px;max-width:50ch;')}>Ambientes pensados para a iluminação natural e a amplitude, com a possibilidade de integrar sala e varanda por parede removível. Diferenciais de série:</p>
              <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:14px 26px;')}>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Ampla varanda com previsão de fechamento</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Sala integrável à varanda (parede removível)</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Espaço para closet na suíte</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Infraestrutura para ar-condicionado</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Aquecimento de água nos banheiros</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Bancada de mármore nos banheiros</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Janelas com persianas integradas</span></div>
                <div style={parseStyle('display:flex;gap:10px;align-items:flex-start;')}><span style={parseStyle('color:#93A074;margin-top:2px;')}>,</span><span style={parseStyle('font-size:.95rem;color:#3a382f;line-height:1.4;')}>Isolamento acústico entre unidades</span></div>
              </div>
              <Hoverable as="a" href="#contato" baseStyle={parseStyle('display:inline-flex;margin-top:34px;text-decoration:none;background:#1B2E22;color:#F6F1E6;padding:16px 34px;border-radius:2px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;transition:all .35s;')} hoverStyle={parseStyle('background:#A9743F;')}>Quero conhecer esta planta</Hoverable>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section id="local" data-screen-label="Localização" style={parseStyle('background:#142219;padding:clamp(80px,12vh,150px) clamp(20px,5vw,72px);')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(40px,5vw,72px);align-items:center;')}>
          <div>
            <div data-reveal="" style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px;')}>
              <span style={parseStyle('width:38px;height:1px;background:#93A074;')}></span>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#AAB68F;text-transform:uppercase;')}>A localização</span>
            </div>
            <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.4vw,3.7rem);line-height:1.04;color:#F6F1E6;margin:0 0 24px;text-wrap:balance;")}>Vista o verde da Serra como o seu ponto de partida.</h2>
            <p data-reveal="" data-delay="140" style={parseStyle('font-size:1.06rem;line-height:1.8;color:rgba(246,241,230,.78);font-weight:300;margin:0 0 30px;max-width:50ch;')}>Em Jundiaí, interior paulista, o Vivarte Grand Alamedas nasce em uma posição privilegiada, com vista permanente para a Serra do Japi e fácil acesso pela Av. Juvenal Arantes.</p>
            <div data-reveal="" data-delay="200" style={parseStyle('display:flex;flex-direction:column;gap:2px;background:rgba(246,241,230,.1);border:1px solid rgba(246,241,230,.12);')}>
              <div style={parseStyle('background:#142219;padding:20px 24px;display:flex;align-items:center;gap:16px;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#A9743F;")}>◷</span>
                <span style={parseStyle('font-size:.98rem;color:#F6F1E6;')}>Av. Juvenal Arantes, s/n, Jundiaí / SP</span>
              </div>
              <div style={parseStyle('background:#142219;padding:20px 24px;display:flex;align-items:center;gap:16px;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#A9743F;")}>▲</span>
                <span style={parseStyle('font-size:.98rem;color:#F6F1E6;')}>Vista permanente para a Serra do Japi</span>
              </div>
              <div style={parseStyle('background:#142219;padding:20px 24px;display:flex;align-items:center;gap:16px;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#A9743F;")}>❖</span>
                <span style={parseStyle('font-size:.98rem;color:#F6F1E6;')}>Empreendimento Grupo Diretiva</span>
              </div>
            </div>
          </div>
          <div data-reveal="" style={parseStyle('display:flex;flex-direction:column;gap:18px;')}>
            <div style={parseStyle('border-radius:3px;overflow:hidden;box-shadow:0 40px 80px -45px rgba(0,0,0,.7);')}>
              <img src="/vivarte/a007.jpg" alt="Vista aérea do Vivarte Grand Alamedas e da Serra do Japi em Jundiaí" style={parseStyle('width:100%;height:clamp(220px,32vh,320px);object-fit:cover;display:block;')} />
            </div>
            <div style={parseStyle('border-radius:3px;overflow:hidden;height:clamp(240px,34vh,340px);box-shadow:0 40px 80px -45px rgba(0,0,0,.7);')}>
              <iframe title="Mapa do Vivarte Grand Alamedas em Jundiaí" src="https://www.google.com/maps?q=Av.%20Juvenal%20Arantes%2C%20Jundia%C3%AD%20-%20SP&output=embed" style={parseStyle('width:100%;height:100%;border:0;filter:saturate(.9);')} loading="lazy"></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIRETIVA ============ */}
      <section id="diretiva" data-screen-label="Sobre a Diretiva" style={parseStyle('position:relative;background:#0E1A13;padding:clamp(80px,13vh,160px) clamp(20px,5vw,72px);overflow:hidden;')}>
        <div style={parseStyle('position:absolute;inset:0;opacity:.16;')}>
          <img src="/vivarte/a002.jpg" alt="" style={parseStyle('width:100%;height:100%;object-fit:cover;')} />
        </div>
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(90deg,#0E1A13 30%,rgba(14,26,19,.6));')}></div>
        <div style={parseStyle('position:relative;z-index:2;max-width:1320px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px;')}>
            <span style={parseStyle('width:38px;height:1px;background:#93A074;')}></span>
            <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#AAB68F;text-transform:uppercase;')}>A construtora</span>
          </div>
          <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.6vw,3.9rem);line-height:1.05;color:#F6F1E6;margin:0 0 30px;max-width:20ch;text-wrap:balance;")}>Há mais de 50 anos transformando confiança em metros quadrados.</h2>
          <p data-reveal="" data-delay="140" style={parseStyle('font-size:1.08rem;line-height:1.8;color:rgba(246,241,230,.78);font-weight:300;margin:0 0 50px;max-width:60ch;')}>Para o Grupo Diretiva, construir é mais do que erguer paredes, cada projeto é uma expressão de inovação e compromisso com a excelência. Com mais de cinco décadas de experiência e milhares de chaves entregues, a marca é referência de qualidade no interior paulista.</p>
          <div data-reveal="" data-delay="200" style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:rgba(246,241,230,.14);border:1px solid rgba(246,241,230,.14);')}>
            <div style={parseStyle('background:#0E1A13;padding:30px 26px;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.8rem;color:#A9743F;line-height:1;")}>+50</div>
              <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:rgba(246,241,230,.7);margin-top:10px;')}>anos de experiência</div>
            </div>
            <div style={parseStyle('background:#0E1A13;padding:30px 26px;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.8rem;color:#A9743F;line-height:1;")}>ISO</div>
              <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:rgba(246,241,230,.7);margin-top:10px;')}>9001 certificada</div>
            </div>
            <div style={parseStyle('background:#0E1A13;padding:30px 26px;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.8rem;color:#A9743F;line-height:1;")}>Nível A</div>
              <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:rgba(246,241,230,.7);margin-top:10px;')}>PBQP-H desde 2004</div>
            </div>
            <div style={parseStyle('background:#0E1A13;padding:30px 26px;')}>
              <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:2.8rem;color:#A9743F;line-height:1;")}>Milhares</div>
              <div style={parseStyle('font-size:12px;letter-spacing:.06em;color:rgba(246,241,230,.7);margin-top:10px;')}>de chaves entregues</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO ============ */}
      <section id="contato" data-screen-label="Contato" style={parseStyle('position:relative;background:#0E1A13;padding:clamp(80px,12vh,150px) clamp(20px,5vw,72px);overflow:hidden;')}>
        <div style={parseStyle('position:absolute;inset:0;')}>
          <img src="/vivarte/a001.jpg" alt="" style={parseStyle('width:100%;height:100%;object-fit:cover;')} />
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,26,19,.78),rgba(14,26,19,.92));')}></div>
        </div>
        <div style={parseStyle('position:relative;z-index:2;max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(36px,5vw,64px);align-items:center;')}>
          <div>
            <div data-reveal="" style={parseStyle('display:flex;align-items:center;gap:14px;margin-bottom:22px;')}>
              <span style={parseStyle('width:38px;height:1px;background:#93A074;')}></span>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#AAB68F;text-transform:uppercase;')}>Agende sua visita</span>
            </div>
            <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(2rem,4.4vw,3.6rem);line-height:1.04;color:#F6F1E6;margin:0 0 22px;text-wrap:balance;")}>Venha viver o verdadeiro viver.</h2>
            <p data-reveal="" data-delay="140" style={parseStyle('font-size:1.05rem;line-height:1.75;color:rgba(246,241,230,.8);font-weight:300;margin:0 0 28px;max-width:42ch;')}>Preencha seus dados e nosso time entra em contato para apresentar o Vivarte Grand Alamedas e agendar sua visita ao decorado.</p>
            <Hoverable as="a" href={whatsappHref} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:#F6F1E6;font-size:1.05rem;')} hoverStyle={parseStyle('color:#93A074;')}>
              <span style={parseStyle('display:inline-flex;width:42px;height:42px;border-radius:50%;background:#25D366;align-items:center;justify-content:center;flex-shrink:0;')}><svg width="23" height="23" viewBox="0 0 24 24" fill="#0E1A13"><path d={WA_PATH}></path></svg></span>
              {display}
            </Hoverable>
          </div>
          <div data-reveal="" data-delay="120" style={parseStyle('background:rgba(246,241,230,.97);border-radius:4px;padding:clamp(28px,4vw,44px);box-shadow:0 50px 90px -40px rgba(0,0,0,.7);')}>
            {!sent && (
              <form onSubmit={onSubmit}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.7rem;color:#1B2E22;margin-bottom:24px;")}>Receba o material completo</div>
                <label style={parseStyle('display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A5547;margin-bottom:7px;')}>Nome</label>
                <input
                  ref={nomeRef}
                  type="text"
                  placeholder="Seu nome completo"
                  style={parseStyle("width:100%;padding:14px 16px;border:1px solid rgba(27,24,19,.18);background:#fff;border-radius:2px;font-family:'Jost',sans-serif;font-size:15px;color:#1B1813;margin-bottom:18px;outline:none;transition:border-color .3s;")}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#A9743F'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(27,24,19,.18)'; }}
                />
                <label style={parseStyle('display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A5547;margin-bottom:7px;')}>Telefone / WhatsApp</label>
                <input
                  ref={telRef}
                  type="tel"
                  placeholder="(11) 90000-0000"
                  style={parseStyle("width:100%;padding:14px 16px;border:1px solid rgba(27,24,19,.18);background:#fff;border-radius:2px;font-family:'Jost',sans-serif;font-size:15px;color:#1B1813;margin-bottom:18px;outline:none;transition:border-color .3s;")}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#A9743F'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(27,24,19,.18)'; }}
                />
                <label style={parseStyle('display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A5547;margin-bottom:7px;')}>E-mail</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="voce@email.com"
                  style={parseStyle("width:100%;padding:14px 16px;border:1px solid rgba(27,24,19,.18);background:#fff;border-radius:2px;font-family:'Jost',sans-serif;font-size:15px;color:#1B1813;margin-bottom:8px;outline:none;transition:border-color .3s;")}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#A9743F'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(27,24,19,.18)'; }}
                />
                <div style={parseStyle('min-height:20px;font-size:12px;color:#b4452f;margin-bottom:10px;')}>{formError}</div>
                <Hoverable as="button" type="submit" baseStyle={parseStyle("width:100%;padding:17px;border:none;cursor:pointer;background:#A9743F;color:#F6F1E6;border-radius:2px;font-family:'Jost',sans-serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;transition:background .35s;")} hoverStyle={parseStyle('background:#1B2E22;')}>Quero agendar minha visita</Hoverable>
                <div style={parseStyle('font-size:11px;color:#8a8475;text-align:center;margin-top:14px;line-height:1.5;')}>Ao enviar, você concorda em ser contatado sobre o empreendimento.</div>
              </form>
            )}
            {sent && (
              <div style={parseStyle('text-align:center;padding:30px 10px;')}>
                <div style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.9rem;color:#1B2E22;margin-bottom:14px;")}>Obrigado! ✦</div>
                <p style={parseStyle('font-size:1rem;color:#5A5547;line-height:1.65;margin:0 0 24px;')}>Recebemos seus dados. Estamos te direcionando ao WhatsApp para concluir o agendamento.</p>
                <a href={whatsappHref} target="_blank" rel="noopener" style={parseStyle('display:inline-block;text-decoration:none;background:#25D366;color:#0E1A13;padding:14px 30px;border-radius:2px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;')}>Abrir WhatsApp</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" data-screen-label="FAQ" style={parseStyle('background:#F6F1E6;padding:clamp(80px,12vh,150px) clamp(20px,5vw,72px);')}>
        <div style={parseStyle('max-width:880px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;margin-bottom:clamp(40px,6vh,60px);')}>
            <div data-reveal="" style={parseStyle('display:inline-flex;align-items:center;gap:14px;margin-bottom:18px;')}>
              <span style={parseStyle('width:38px;height:1px;background:#A9743F;')}></span>
              <span style={parseStyle('font-size:11px;letter-spacing:.4em;color:#A9743F;text-transform:uppercase;')}>Dúvidas frequentes</span>
              <span style={parseStyle('width:38px;height:1px;background:#A9743F;')}></span>
            </div>
            <h2 data-reveal="" data-delay="80" style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(1.9rem,4vw,3.2rem);line-height:1.05;color:#1B2E22;margin:0;")}>Tudo o que você precisa saber.</h2>
          </div>
          <div data-reveal="" style={parseStyle('border-top:1px solid rgba(27,24,19,.14);')}>
            {faqs.map((item, i) => (
              <div key={i} style={parseStyle('border-bottom:1px solid rgba(27,24,19,.14);')}>
                <button onClick={item.onToggle} style={parseStyle('all:unset;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 2px;')}>
                  <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:clamp(1.2rem,2vw,1.55rem);color:#1B2E22;line-height:1.25;")}>{item.q}</span>
                  <span style={parseStyle('font-size:1.6rem;color:#A9743F;transform:rotate(' + item.rot + ');transition:transform .35s;flex-shrink:0;line-height:1;')}>+</span>
                </button>
                <div style={parseStyle('max-height:' + item.maxH + ';overflow:hidden;transition:max-height .5s cubic-bezier(.16,.84,.44,1),opacity .4s;opacity:' + item.op + ';')}>
                  <p style={parseStyle('font-size:1.02rem;line-height:1.75;color:#5A5547;font-weight:300;margin:0;padding:0 2px 26px;max-width:62ch;')}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer data-screen-label="Rodapé" style={parseStyle('background:#0A140E;padding:clamp(60px,9vh,100px) clamp(20px,5vw,72px) 40px;')}>
        <div style={parseStyle('max-width:1320px;margin:0 auto;')}>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;padding-bottom:50px;border-bottom:1px solid rgba(246,241,230,.12);')}>
            <div>
              <div style={parseStyle('display:flex;flex-direction:column;line-height:.84;margin-bottom:18px;')}>
                <span style={parseStyle("font-family:'Kaushan Script','Allura',cursive;font-size:44px;color:#F1EBDD;")}>Vivarte</span>
                <span style={parseStyle("font-family:'Allura',cursive;font-size:27px;color:#F1EBDD;margin-top:-5px;padding-left:36px;")}>Grand</span>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:10px;letter-spacing:.5em;color:#93A074;padding-left:5px;margin-top:5px;")}>ALAMEDAS</span>
              </div>
              <p style={parseStyle('font-size:.92rem;line-height:1.7;color:rgba(246,241,230,.55);font-weight:300;max-width:34ch;margin:0;')}>Apartamentos de 2 e 3 dormitórios em Jundiaí, cercados pelo verde da Serra do Japi.</p>
            </div>
            <div>
              <div style={parseStyle('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#93A074;margin-bottom:18px;')}>Navegação</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:11px;')}>
                <Hoverable as="a" href="#conceito" baseStyle={parseStyle('text-decoration:none;color:rgba(246,241,230,.7);font-size:.95rem;')} hoverStyle={parseStyle('color:#F6F1E6;')}>Conceito</Hoverable>
                <Hoverable as="a" href="#lazer" baseStyle={parseStyle('text-decoration:none;color:rgba(246,241,230,.7);font-size:.95rem;')} hoverStyle={parseStyle('color:#F6F1E6;')}>Lazer</Hoverable>
                <Hoverable as="a" href="#plantas" baseStyle={parseStyle('text-decoration:none;color:rgba(246,241,230,.7);font-size:.95rem;')} hoverStyle={parseStyle('color:#F6F1E6;')}>Plantas</Hoverable>
                <Hoverable as="a" href="#local" baseStyle={parseStyle('text-decoration:none;color:rgba(246,241,230,.7);font-size:.95rem;')} hoverStyle={parseStyle('color:#F6F1E6;')}>Localização</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#93A074;margin-bottom:18px;')}>Atendimento</div>
              <Hoverable as="a" href={whatsappHref} target="_blank" rel="noopener" baseStyle={parseStyle('text-decoration:none;color:rgba(246,241,230,.7);font-size:.95rem;display:block;margin-bottom:11px;')} hoverStyle={parseStyle('color:#F6F1E6;')}>{display}</Hoverable>
              <div style={parseStyle('font-size:.95rem;color:rgba(246,241,230,.7);margin-bottom:11px;')}>Av. Juvenal Arantes, s/n<br />Jundiaí, SP</div>
              <Hoverable as="a" href="https://vivartegrand.com.br" target="_blank" rel="noopener" baseStyle={parseStyle('text-decoration:none;color:#AAB68F;font-size:.95rem;')} hoverStyle={parseStyle('color:#F6F1E6;')}>vivartegrand.com.br</Hoverable>
            </div>
            <div>
              <div style={parseStyle('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#93A074;margin-bottom:18px;')}>Corretor parceiro</div>
              <div style={parseStyle('border:1px dashed rgba(246,241,230,.28);border-radius:3px;padding:18px;display:flex;flex-direction:column;gap:6px;')}>
                <span style={parseStyle("font-family:'Cormorant Garamond',serif;font-size:1.25rem;color:#F6F1E6;")}>{agencyName}</span>
                <span style={parseStyle('font-size:.85rem;color:rgba(246,241,230,.5);')}>{creci}</span>
              </div>
            </div>
          </div>
          <div style={parseStyle('padding-top:30px;display:flex;flex-direction:column;gap:14px;')}>
            <p style={parseStyle('font-size:11px;line-height:1.7;color:rgba(246,241,230,.4);font-weight:300;margin:0;max-width:none;')}>Imagens e perspectivas meramente ilustrativas. Os móveis, equipamentos e utensílios utilizados nas perspectivas são mera sugestão de decoração e não fazem parte do contrato de compra e venda. O empreendimento só será comercializado após a expedição do Registro de Incorporação do imóvel. Incorporadora responsável: DJL-4 Incorporações Imobiliárias LTDA., CNPJ 12.983.536/0001-53. Intermediação imobiliária: {agencyName}, {creci}.</p>
            <div style={parseStyle('font-size:11px;color:rgba(246,241,230,.35);')}>© Vivarte Grand Alamedas · Empreendimento Grupo Diretiva.</div>
          </div>
        </div>
      </footer>

      {/* ============ ZOOM (lightbox de planta) ============ */}
      {zoom && (
        <div onClick={onCloseZoom} style={parseStyle('position:fixed;inset:0;z-index:200;background:rgba(10,20,14,.93);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:clamp(18px,4vw,60px);cursor:zoom-out;animation:fadeIn .3s ease;')}>
          <div onClick={onContentClick} style={parseStyle('position:relative;max-width:1120px;width:100%;background:#fff;border-radius:4px;padding:clamp(20px,3vw,40px);box-shadow:0 60px 140px -40px rgba(0,0,0,.85);cursor:default;animation:zoomIn .35s cubic-bezier(.16,.84,.44,1);')}>
            <img src={`/vivarte/${zoom}`} alt="Planta ampliada do Vivarte Grand Alamedas" style={parseStyle('width:100%;height:auto;max-height:78vh;object-fit:contain;display:block;')} />
            <div style={parseStyle("text-align:center;font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:#1B2E22;margin-top:14px;")}>{zoomLabel}</div>
            <Hoverable as="button" onClick={onCloseZoom} aria-label="Fechar" baseStyle={parseStyle('all:unset;cursor:pointer;position:absolute;top:-16px;right:-16px;width:46px;height:46px;border-radius:50%;background:#1B2E22;color:#F6F1E6;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 12px 28px -8px rgba(0,0,0,.6);transition:background .3s;')} hoverStyle={parseStyle('background:#A9743F;')}>×</Hoverable>
          </div>
        </div>
      )}

      {/* ============ WHATSAPP FLOAT ============ */}
      <Hoverable
        as="a"
        href={whatsappHref}
        target="_blank"
        rel="noopener"
        aria-label="Falar no WhatsApp"
        baseStyle={parseStyle('position:fixed;right:clamp(18px,3vw,32px);bottom:clamp(18px,3vw,32px);z-index:130;width:60px;height:60px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px -8px rgba(37,211,102,.7);animation:pulse 2.6s infinite;transition:transform .3s;text-decoration:none;')}
        hoverStyle={parseStyle('transform:scale(1.08);')}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#0E1A13"><path d={WA_PATH}></path></svg>
      </Hoverable>
    </div>
  );
}
