'use client';

/**
 * Doppio Jundiaí — porte 1:1 de "Doppio Jundiai - standalone.html" (mecanismo
 * dc-runtime) para React. CSS em app/doppio-jundiai/doppio-jundiai.css,
 * assets em public/doppio-jundiai.
 *
 * A classe `Component extends DCLogic` do fonte vira estado + effects aqui:
 * abas de tipologia, chips de metragem, lightbox da galeria, lightbox de planta,
 * menu mobile, barra de progresso, header sólido, parallax do hero, count-up e
 * formulário com handoff para o WhatsApp.
 *
 * Diferenças conscientes em relação ao fonte:
 *  - O lightbox usa o src real do <img> de cada tile; o galleryData apontava para
 *    `assets/raw/*.jpg`, caminhos que não existem fora do bundle.
 *  - As plantas (`assets/plantas/*.jpg`) não vieram no material de origem. Ficam
 *    em /doppio-jundiai/plantas/ com fallback visível — ver IMAGENS-FALTANDO.md.
 */

import React, { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { parseStyle, waHref } from '@/lib/dc-runtime';
import { sendLead } from '@/lib/lead';

const WA_NUMBER = '5511926143393';
const waMain = waHref(
  WA_NUMBER,
  'Olá! Tenho interesse no Doppio Jundiaí e gostaria de receber mais informações.',
);

/** Títulos do galleryData na ordem dos data-idx; o src vem do tile correspondente. */
const GALLERY: Array<{ src: string; title: string }> = [
  { src: '/doppio-jundiai/a003.jpg', title: 'Piscina' },
  { src: '/doppio-jundiai/a013.jpg', title: 'Salão de Festas' },
  { src: '/doppio-jundiai/a009.jpg', title: 'Espaço Gourmet' },
  { src: '/doppio-jundiai/a016.jpg', title: 'Fitness · TechnoGym' },
  { src: '/doppio-jundiai/a012.jpg', title: 'SPA · Espaço Massagem' },
  { src: '/doppio-jundiai/a004.jpg', title: 'Sauna Úmida' },
  { src: '/doppio-jundiai/a011.jpg', title: 'Club House' },
  { src: '/doppio-jundiai/a007.jpg', title: 'Beauty Care' },
  { src: '/doppio-jundiai/a001.jpg', title: 'Hall Social' },
  { src: '/doppio-jundiai/a008.jpg', title: 'Espaço Yoga' },
  { src: '/doppio-jundiai/a006.jpg', title: 'Salão de Jogos' },
  { src: '/doppio-jundiai/a014.jpg', title: 'Mini Mercado' },
];

const PLANTAS = '/doppio-jundiai/plantas/';

type Floor = { img: string; label: string };
type Plan = {
  area: string;
  sub: string;
  detail: string;
  suites: string;
  vagas: string;
  desc: string;
  floors: Floor[];
};
type Tipology = { key: string; tab: string; plans: Plan[] };

// Valores exatos do `tipologies` do fonte.
const TIPOLOGIES: Tipology[] = [
  {
    key: 'tipo',
    tab: 'Apartamentos Tipo',
    plans: [
      { area: '210 m²', sub: 'Planta Tipo', detail: 'Finais 1 e 6', suites: '3 suítes', vagas: '3 vagas', desc: 'A maior metragem entre os apartamentos tipo, com living de pé-direito duplo de 5,60 m e hall social privativo.', floors: [{ img: PLANTAS + 'tipo210.jpg', label: 'Planta Tipo · Finais 1 e 6' }] },
      { area: '191 m²', sub: 'Opção Living Ampliado', detail: 'Finais 2 e 5', suites: '3 suítes', vagas: '3 vagas', desc: 'Opção com living ampliado e pé-direito duplo de 5,60 m, com três suítes e hall social privativo.', floors: [{ img: PLANTAS + 'tipo191.jpg', label: 'Opção Living Ampliado · Finais 2 e 5' }] },
      { area: '156 m²', sub: 'Planta Tipo', detail: 'Finais 3 e 4', suites: '3 suítes', vagas: '3 vagas', desc: 'Três suítes e living de pé-direito duplo de 5,60 m, com hall social privativo.', floors: [{ img: PLANTAS + 'tipo156a.jpg', label: 'Planta Tipo · Finais 3 e 4' }] },
      { area: '156 m²', sub: 'Opção II · Living Ampliado', detail: 'Finais 3 e 4', suites: '2 suítes', vagas: '3 vagas', desc: 'Segunda opção dos finais 3 e 4, com living ampliado, duas suítes e pé-direito duplo de 5,60 m.', floors: [{ img: PLANTAS + 'tipo156b.jpg', label: 'Opção II Living Ampliado · Finais 3 e 4' }] },
    ],
  },
  {
    key: 'garden',
    tab: 'Gardens',
    plans: [
      { area: '186 m²', sub: 'Garden I', detail: 'Finais 3 e 4', suites: '3 suítes', vagas: '3 vagas', desc: 'Garden com área externa privativa e living de pé-direito duplo de 5,60 m.', floors: [{ img: PLANTAS + 'gar186.jpg', label: 'Garden I · Finais 3 e 4' }] },
      { area: '212 m²', sub: 'Garden II', detail: 'Finais 2 e 5', suites: '4 suítes', vagas: '3 vagas', desc: 'Quatro suítes e amplo jardim privativo, com living de pé-direito duplo de 5,60 m.', floors: [{ img: PLANTAS + 'gar212.jpg', label: 'Garden II · Finais 2 e 5' }] },
      { area: '244 m²', sub: 'Garden III', detail: 'Finais 1 e 6', suites: '3 suítes', vagas: '3 vagas', desc: 'O maior garden, com generosa área externa privativa e living de pé-direito duplo.', floors: [{ img: PLANTAS + 'gar244.jpg', label: 'Garden III · Finais 1 e 6' }] },
    ],
  },
  {
    key: 'plana',
    tab: 'Coberturas Planas',
    plans: [
      { area: '442 m²', sub: 'Cobertura Plana', detail: '', suites: '4 suítes', vagas: '5 vagas', desc: 'Cobertura em um único pavimento, com quatro suítes e cinco vagas demarcadas.', floors: [{ img: PLANTAS + 'plana442.jpg', label: 'Cobertura Plana' }] },
      { area: '434 m²', sub: 'Cobertura Plana II', detail: '', suites: '4 suítes', vagas: '5 vagas', desc: 'Segunda opção de cobertura plana, com quatro suítes e cinco vagas demarcadas.', floors: [{ img: PLANTAS + 'plana434.jpg', label: 'Cobertura Plana II' }] },
    ],
  },
  {
    key: 'duplex',
    tab: 'Coberturas Duplex',
    plans: [
      { area: '375 m²', sub: 'Cobertura Duplex I', detail: 'Finais 2 e 5', suites: '4 suítes', vagas: '4 vagas', desc: 'Dois pavimentos integrados, com quatro suítes e living de pé-direito duplo de 5,60 m.', floors: [{ img: PLANTAS + 'dpx375i.jpg', label: 'Pavimento Inferior' }, { img: PLANTAS + 'dpx375s.jpg', label: 'Pavimento Superior' }] },
      { area: '307 m²', sub: 'Cobertura Duplex II', detail: 'Finais 3 e 4', suites: '4 suítes', vagas: '4 vagas', desc: 'Dois pavimentos integrados, com quatro suítes distribuídas entre os níveis.', floors: [{ img: PLANTAS + 'dpx307i.jpg', label: 'Pavimento Inferior' }, { img: PLANTAS + 'dpx307s.jpg', label: 'Pavimento Superior' }] },
      { area: '374 m²', sub: 'Cobertura Duplex III', detail: 'Finais 1 e 6', suites: '4 suítes', vagas: '4 vagas', desc: 'Dois pavimentos integrados dos finais 1 e 6, com quatro suítes e living de pé-direito duplo.', floors: [{ img: PLANTAS + 'dpx374i.jpg', label: 'Pavimento Inferior' }, { img: PLANTAS + 'dpx374s.jpg', label: 'Pavimento Superior' }] },
    ],
  },
];

const PLAN_IMG_STYLE: CSSProperties = {
  width: '100%',
  height: 'auto',
  borderRadius: '3px',
  display: 'block',
};

/**
 * Imagem de planta com fallback: o material de origem não trouxe os arquivos.
 * Assim que forem colocados em public/doppio-jundiai/plantas/ a imagem aparece
 * sozinha; até lá, um aviso legível em vez de um ícone de imagem quebrada.
 */
function PlanImg({ src, alt, style }: { src: string; alt: string; style?: CSSProperties }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 220,
          padding: 24,
          color: '#6b5a44',
          fontSize: 13.5,
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        {alt}, planta disponível sob consulta.
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" style={style} onError={() => setFailed(true)} />;
}

export default function DoppioJundiai() {
  const [activeTipo, setActiveTipo] = useState(0);
  const [activePlan, setActivePlan] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [planLb, setPlanLb] = useState<Floor | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const ti = TIPOLOGIES[activeTipo] || TIPOLOGIES[0];
  const plans = ti.plans;
  const pIdx = Math.min(activePlan, plans.length - 1);
  const plan = plans[pIdx];

  const tipoTabs = TIPOLOGIES.map((t, i) => ({
    tab: t.tab,
    active: i === activeTipo,
    select: () => {
      setActiveTipo(i);
      setActivePlan(0);
    },
  }));
  const planChips = plans.map((p, i) => ({
    area: p.area,
    sub: p.sub,
    active: i === pIdx,
    select: () => setActivePlan(i),
  }));
  const floors = plan.floors.map((f) => ({
    label: f.label,
    open: () => setPlanLb(f),
    imgEl: <PlanImg src={f.img} alt={`Planta ${f.label}, ${plan.area}`} style={PLAN_IMG_STYLE} />,
  }));

  const lbOpen = lightbox != null;
  const lb = lbOpen ? GALLERY[lightbox as number] : null;
  const lbImgEl = lb ? <img src={lb.src} alt={lb.title} /> : null;
  const lbTitle = lb ? lb.title : '';
  const lbCounter = lbOpen ? `${(lightbox as number) + 1} / ${GALLERY.length}` : '';
  const planLbOpen = planLb != null;
  const planLbImgEl = planLb ? (
    <PlanImg src={planLb.img} alt={`Planta ${planLb.label}`} style={{ background: '#fff', padding: '14px' }} />
  ) : null;
  const planLbTitle = planLb ? planLb.label : '';
  const formIdle = !formSent;

  const navLb = useCallback(
    (d: number) => setLightbox((i) => (i == null ? i : (i + d + GALLERY.length) % GALLERY.length)),
    [],
  );

  /* Reveal, count-up, barra de progresso, header sólido e parallax do hero —
     mesmos parâmetros do componentDidMount do fonte. */
  useEffect(() => {
    const root = document.getElementById('doppio-lp');
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    const fallback = window.setTimeout(
      () => root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in')),
      4000,
    );

    const animateCount = (el: Element) => {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const sep = el.getAttribute('data-sep') === '1';
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const fmt = (v: number) => {
        let s = v.toFixed(dec).replace('.', ',');
        if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return prefix + s + suffix;
      };
      const dur = 1500;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target);
      };
      requestAnimationFrame(step);
    };
    const counted = new Set<Element>();
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !counted.has(e.target)) {
            counted.add(e.target);
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

    const header = document.getElementById('lp-header');
    const bar = document.getElementById('lp-progress');
    const heroImg = document.getElementById('lp-hero-img');
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
      header?.classList.toggle('scrolled', y > 40);
      if (heroImg && y < window.innerHeight) {
        heroImg.style.transform = `scale(1.16) translateY(${y * 0.16}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      cio.disconnect();
      window.clearTimeout(fallback);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* Cliques delegados: data-scroll, menu, lightbox — como no fonte. */
  useEffect(() => {
    const root = document.getElementById('doppio-lp');
    if (!root) return;
    const onClick = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const sc = target.closest('[data-scroll]');
      if (sc) {
        ev.preventDefault();
        const t = document.getElementById(sc.getAttribute('data-scroll') || '');
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
        setMenuOpen(false);
        return;
      }
      if (target.closest('[data-menu-toggle]')) {
        setMenuOpen((o) => !o);
        return;
      }
      const tile = target.closest('[data-lightbox]');
      if (tile) {
        setLightbox(parseInt(tile.getAttribute('data-idx') || '0', 10));
        return;
      }
      if (target.closest('[data-lb-next]')) {
        ev.stopPropagation();
        navLb(1);
        return;
      }
      if (target.closest('[data-lb-prev]')) {
        ev.stopPropagation();
        navLb(-1);
        return;
      }
      if (target.closest('[data-lb-stop]')) {
        ev.stopPropagation();
        return;
      }
      if (target.closest('[data-lb-close]')) {
        setLightbox(null);
        return;
      }
      if (target.closest('[data-planlb-stop]')) {
        ev.stopPropagation();
        return;
      }
      if (target.closest('[data-planlb-close]')) setPlanLb(null);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [navLb]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (planLbOpen && e.key === 'Escape') {
        setPlanLb(null);
        return;
      }
      if (!lbOpen) return;
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') navLb(1);
      else if (e.key === 'ArrowLeft') navLb(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lbOpen, planLbOpen, navLb]);

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nome = (f.elements.namedItem('nome') as HTMLInputElement)?.value.trim() || '';
    const tel = (f.elements.namedItem('telefone') as HTMLInputElement)?.value.trim() || '';
    const email = (f.elements.namedItem('email') as HTMLInputElement)?.value.trim() || '';
    if (!nome || !tel) return;
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_doppio-jundiai',
      interest: 'Doppio Jundiaí',
    });
    const text =
      `Olá! Sou ${nome} e tenho interesse no Doppio Jundiaí.\nTelefone: ${tel}` +
      (email ? `\nE-mail: ${email}` : '');
    window.open(waHref(WA_NUMBER, text), '_blank', 'noopener');
    setFormSent(true);
  };

  return (
    <>
      <div id="doppio-lp" className="lp">
        <div id="lp-progress">
        </div>
        <header id="lp-header">
          <div style={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:20px')} className="container">
            <a style={parseStyle('cursor:pointer;display:flex;align-items:center')} data-scroll="topo">
              <img style={parseStyle('height:34px;width:auto')} src="/doppio-jundiai/a005.png" alt="Doppio Jundiaí" />
            </a>
            <nav className="desk-nav">
              <a className="navlink" data-scroll="conceito">
                Conceito
              </a>
              <a className="navlink" data-scroll="diferenciais">
                Diferenciais
              </a>
              <a className="navlink" data-scroll="lazer">
                Lazer
              </a>
              <a className="navlink" data-scroll="plantas">
                Plantas
              </a>
              <a className="navlink" data-scroll="localizacao">
                Localização
              </a>
              <a style={parseStyle('padding:13px 26px')} className="btn-gold" data-scroll="contato">
                Quero conhecer
              </a>
            </nav>
            <button style={parseStyle('width:46px;height:46px;border:1px solid rgba(231,205,156,.4);border-radius:50%;background:transparent;cursor:pointer;place-items:center;gap:5px;flex-direction:column')} className="hamb" data-menu-toggle="" aria-label="Menu">
              <span style={parseStyle('width:18px;height:1.5px;background:#e7cd9c;display:block')}>
              </span>
              <span style={parseStyle('width:18px;height:1.5px;background:#e7cd9c;display:block')}>
              </span>
            </button>
          </div>
        </header>
        {menuOpen && (<>
          <div style={parseStyle('position:fixed;inset:0;z-index:65;background:rgba(18,11,6,.97);backdrop-filter:blur(16px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px')}>
            <button style={parseStyle('position:absolute;top:26px;right:26px;width:46px;height:46px;border:1px solid rgba(231,205,156,.4);border-radius:50%;background:transparent;color:#e7cd9c;font-size:24px;cursor:pointer')} data-menu-toggle="" aria-label="Fechar">
              ×
            </button>
            <a style={parseStyle('font-size:18px')} className="navlink" data-scroll="conceito">
              Conceito
            </a>
            <a style={parseStyle('font-size:18px')} className="navlink" data-scroll="diferenciais">
              Diferenciais
            </a>
            <a style={parseStyle('font-size:18px')} className="navlink" data-scroll="lazer">
              Lazer
            </a>
            <a style={parseStyle('font-size:18px')} className="navlink" data-scroll="plantas">
              Plantas
            </a>
            <a style={parseStyle('font-size:18px')} className="navlink" data-scroll="localizacao">
              Localização
            </a>
            <a style={parseStyle('margin-top:14px')} className="btn-gold" data-scroll="contato">
              Falar com consultor
            </a>
          </div>
        </>)}
        {/* HERO */}
        <section style={parseStyle('position:relative;min-height:100vh;display:flex;align-items:flex-end;overflow:hidden;background:#140c06')} id="topo">
          <div style={parseStyle('position:absolute;inset:0;overflow:hidden')}>
            <img style={parseStyle('width:100%;height:100%;object-fit:cover;object-position:72% center;transform:scale(1.12);animation:kenburns 22s ease-out forwards;will-change:transform')} id="lp-hero-img" src="/doppio-jundiai/a015.jpg" alt="Doppio Jundiaí ao entardecer, em Campos Elísios, perspectiva artística preliminar" />
          </div>
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to right,rgba(18,11,6,.86) 0%,rgba(18,11,6,.62) 26%,rgba(18,11,6,.22) 48%,transparent 64%)')}>
          </div>
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to top,rgba(18,11,6,.62) 0%,transparent 26%)')}>
          </div>
          <div style={parseStyle('position:relative;z-index:3;padding-bottom:clamp(48px,8vh,92px);padding-top:140px')} className="container">
            <div style={parseStyle('display:inline-flex;align-items:center;gap:14px;margin-bottom:30px')} data-reveal="">
              <span style={parseStyle('width:34px;height:1px;background:#caa067')}>
              </span>
              <span style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.42em;font-size:12px;color:#e7cd9c")}>
                Breve Lançamento · Campos Elísios · Jundiaí
              </span>
            </div>
            <h1 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(2.4rem,6.2vw,6rem);line-height:1.04;letter-spacing:.01em;margin:0;max-width:16ch;color:#f7efe2;text-wrap:balance")} data-reveal="">
              O ícone de sofisticação está nascendo no{' '}
              <span style={parseStyle('font-weight:400;background:linear-gradient(110deg,#d9b277,#f3e2bb,#caa067);-webkit-background-clip:text;background-clip:text;color:transparent')}>
                Jardim Campos Elísios
              </span>
              .
            </h1>
            <p style={parseStyle('margin:30px 0 0;font-size:clamp(1rem,1.5vw,1.2rem);font-weight:300;color:rgba(240,230,214,.82);max-width:46ch;line-height:1.65')} data-reveal="">
              Living com pé-direito duplo de 5,60 m. Apartamentos de{' '}
              <strong style={parseStyle('font-weight:500;color:#f3ece0')}>
                156 a 210 m²
              </strong>
              {' '}e coberturas de{' '}
              <strong style={parseStyle('font-weight:500;color:#f3ece0')}>
                307 a 442 m²
              </strong>
              .
            </p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:16px;margin-top:40px')} data-reveal="">
              <a className="btn-gold" data-scroll="contato">
                Quero conhecer
                <span style={parseStyle('font-size:16px')}>
                  →
                </span>
              </a>
              <a className="btn-ghost" href={waMain} target="_blank" rel="noopener">
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div style={parseStyle('position:absolute;left:50%;bottom:26px;transform:translateX(-50%);z-index:3;width:24px;height:40px;border:1px solid rgba(231,205,156,.45);border-radius:14px;display:grid;justify-items:center;padding-top:7px')}>
            <span style={parseStyle('width:3px;height:8px;border-radius:3px;background:#e7cd9c;animation:scrolldot 1.9s infinite')}>
            </span>
          </div>
        </section>
        {/* STATS */}
        <section style={parseStyle('background:#f3ece0;color:#241a10;padding:0')}>
          <div style={parseStyle('padding:0')} className="container">
            <div style={parseStyle('border-bottom:1px solid rgba(40,26,14,.1)')} className="statrow">
              <div style={parseStyle('padding:46px 22px;border-right:1px solid rgba(40,26,14,.1)')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="5.6" data-dec="1" data-suffix=" m">
                    5,6 m
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  Pé-direito duplo no living
                </div>
              </div>
              <div style={parseStyle('padding:46px 22px;border-right:1px solid rgba(40,26,14,.1)')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="20" data-prefix="+">
                    +20
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  Opções de lazer e bem-estar
                </div>
              </div>
              <div style={parseStyle('padding:46px 22px;border-right:1px solid rgba(40,26,14,.1)')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="1700" data-prefix="+" data-sep="1" data-suffix=" m²">
                    +1.700 m²
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  De área de lazer
                </div>
              </div>
              <div style={parseStyle('padding:46px 22px;border-right:1px solid rgba(40,26,14,.1)')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="25">
                    25
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  Pavimentos · torre única
                </div>
              </div>
              <div style={parseStyle('padding:46px 22px;border-right:1px solid rgba(40,26,14,.1)')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="106">
                    106
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  Unidades exclusivas
                </div>
              </div>
              <div style={parseStyle('padding:46px 22px')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:400;font-size:clamp(2rem,3.2vw,2.9rem);color:#1f140c")}>
                  <span data-count="3385" data-sep="1" data-suffix=" m²">
                    3.385 m²
                  </span>
                </div>
                <div style={parseStyle('font-size:12px;letter-spacing:.05em;color:rgba(40,26,14,.6);margin-top:8px;line-height:1.4')}>
                  De terreno
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CONCEITO */}
        <section style={parseStyle('background:#18100a;padding:clamp(80px,12vh,150px) 0;position:relative')} id="conceito">
          <div className="container">
            <div className="g2">
              <div data-reveal="left">
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#caa067;margin-bottom:26px")}>
                  O Conceito
                </div>
                <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.9rem,3.6vw,3.3rem);line-height:1.12;margin:0;color:#f3ece0")}>
                  Há espaços que abrigam.
                  <br />
                  E há espaços que{' '}
                  <span style={parseStyle("font-family:'Allura',cursive;font-weight:400;font-size:1.5em;background:linear-gradient(110deg,#d9b277,#f3e2bb);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:.8")}>
                    elevam
                  </span>
                  .
                </h2>
                <p style={parseStyle('margin:32px 0 0;font-size:1.06rem;font-weight:300;line-height:1.85;color:rgba(240,230,214,.74);max-width:52ch')}>
                  No Doppio Jundiaí, cada ambiente foi pensado para ampliar a luz, o olhar e as sensações. O pé-direito duplo não é apenas uma escolha arquitetônica, é uma expressão de liberdade, respiro e imponência.
                </p>
                <p style={parseStyle('margin:20px 0 0;font-size:1.06rem;font-weight:300;line-height:1.85;color:rgba(240,230,214,.74);max-width:52ch')}>
                  O design dialoga com o conforto. A sofisticação se revela em cada linha, cada textura, cada detalhe que transforma o morar em arte.
                </p>
                <div style={parseStyle('display:flex;gap:38px;margin-top:42px;flex-wrap:wrap')}>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.7rem;color:#e7cd9c;font-weight:400")}>
                      5,60 m
                    </div>
                    <div style={parseStyle('font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,230,214,.5);margin-top:4px')}>
                      Living duplo
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.7rem;color:#e7cd9c;font-weight:400")}>
                      3 e 4
                    </div>
                    <div style={parseStyle('font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,230,214,.5);margin-top:4px')}>
                      Suítes
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.7rem;color:#e7cd9c;font-weight:400")}>
                      3 a 5
                    </div>
                    <div style={parseStyle('font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,230,214,.5);margin-top:4px')}>
                      Vagas
                    </div>
                  </div>
                </div>
              </div>
              <div style={parseStyle('position:relative')} data-reveal="right">
                <div style={parseStyle('position:relative;overflow:hidden;border-radius:4px;box-shadow:0 40px 90px -40px rgba(0,0,0,.8)')}>
                  <img style={parseStyle('width:100%;height:clamp(420px,62vh,640px);object-fit:cover')} src="/doppio-jundiai/a017.jpg" alt="Living com pé-direito duplo de 5,60 m, perspectiva artística preliminar" loading="lazy" />
                  <div style={parseStyle("position:absolute;left:22px;bottom:20px;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:11px;color:#f3ece0;background:rgba(20,12,6,.5);backdrop-filter:blur(6px);padding:9px 16px;border-radius:30px;border:1px solid rgba(231,205,156,.25)")}>
                    Living · pé-direito duplo 5,60 m
                  </div>
                </div>
                <div style={parseStyle("position:absolute;top:-18px;right:-10px;font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,230,214,.45)")}>
                  Imagem preliminar · sujeita a alteração
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* DIFERENCIAIS */}
        <section style={parseStyle('background:#f3ece0;color:#241a10;padding:clamp(80px,12vh,150px) 0')} id="diferenciais">
          <div className="container">
            <div style={parseStyle('text-align:center;max-width:60ch;margin:0 auto 60px')} data-reveal="">
              <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#a8763c;margin-bottom:20px")}>
                Diferenciais
              </div>
              <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.9rem,3.6vw,3.2rem);line-height:1.14;margin:0;color:#1f140c")}>
                Cada metro foi pensado para{' '}
                <span style={parseStyle("font-family:'Allura',cursive;font-weight:400;font-size:1.35em;color:#a8763c;line-height:.7")}>
                  elevar o cotidiano
                </span>
              </h2>
            </div>
            <div className="g3">
              <div style={parseStyle('background:#fff;border:1px solid rgba(40,26,14,.08);border-radius:10px;overflow:hidden;display:flex;flex-direction:column')} data-reveal="" className="dif-card">
                <div style={parseStyle('position:relative;height:196px;overflow:hidden')}>
                  <img style={parseStyle('width:100%;height:100%;object-fit:cover')} src="/doppio-jundiai/a018.jpg" alt="Acesso e fachada do Doppio Jundiaí, perspectiva preliminar" loading="lazy" />
                  <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to top,rgba(18,10,5,.9),rgba(18,10,5,.05) 62%)')}>
                  </div>
                  <div style={parseStyle("position:absolute;top:16px;left:16px;width:42px;height:42px;border-radius:50%;background:rgba(243,236,224,.94);display:grid;place-items:center;font-family:'Jost',sans-serif;color:#a8763c;font-size:14px;letter-spacing:.05em")}>
                    01
                  </div>
                  <div style={parseStyle("position:absolute;left:24px;right:20px;bottom:16px;font-family:'Jost',sans-serif;font-size:1.45rem;font-weight:300;color:#f5ecdd;letter-spacing:.01em")}>
                    Localização & Projeto
                  </div>
                </div>
                <ul style={parseStyle('list-style:none;margin:0;padding:14px 30px 30px;display:flex;flex-direction:column')}>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Localização privilegiada no Campos Elísios
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Vista para a Serra do Japi
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Torre única com mais de 25 andares
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    1º pavimento no 5º andar, a 16 m do nível da rua
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Área de lazer a 12 m do nível da rua
                  </li>
                </ul>
              </div>
              <div style={parseStyle('background:#fff;border:1px solid rgba(40,26,14,.08);border-radius:10px;overflow:hidden;display:flex;flex-direction:column')} data-reveal="" className="dif-card">
                <div style={parseStyle('position:relative;height:196px;overflow:hidden')}>
                  <img style={parseStyle('width:100%;height:100%;object-fit:cover')} src="/doppio-jundiai/a011.jpg" alt="Club House com piscina do Doppio Jundiaí, perspectiva preliminar" loading="lazy" />
                  <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to top,rgba(18,10,5,.9),rgba(18,10,5,.05) 62%)')}>
                  </div>
                  <div style={parseStyle("position:absolute;top:16px;left:16px;width:42px;height:42px;border-radius:50%;background:rgba(243,236,224,.94);display:grid;place-items:center;font-family:'Jost',sans-serif;color:#a8763c;font-size:14px;letter-spacing:.05em")}>
                    02
                  </div>
                  <div style={parseStyle("position:absolute;left:24px;right:20px;bottom:16px;font-family:'Jost',sans-serif;font-size:1.45rem;font-weight:300;color:#f5ecdd;letter-spacing:.01em")}>
                    Áreas Comuns
                  </div>
                </div>
                <ul style={parseStyle('list-style:none;margin:0;padding:14px 30px 30px;display:flex;flex-direction:column')}>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    +20 opções de lazer com +1.700 m²
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Fitness com equipamentos TechnoGym
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Club House com churrasqueira e piscina
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Gerador para áreas comuns e elevadores de serviço
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Controle de acesso com clausura e guarita antivandalismo
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Entregues equipadas e decoradas
                  </li>
                </ul>
              </div>
              <div style={parseStyle('background:#fff;border:1px solid rgba(40,26,14,.08);border-radius:10px;overflow:hidden;display:flex;flex-direction:column')} data-reveal="" className="dif-card">
                <div style={parseStyle('position:relative;height:196px;overflow:hidden')}>
                  <img style={parseStyle('width:100%;height:100%;object-fit:cover')} src="/doppio-jundiai/a017.jpg" alt="Living com pé-direito duplo de 5,60 m, perspectiva preliminar" loading="lazy" />
                  <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to top,rgba(18,10,5,.9),rgba(18,10,5,.05) 62%)')}>
                  </div>
                  <div style={parseStyle("position:absolute;top:16px;left:16px;width:42px;height:42px;border-radius:50%;background:rgba(243,236,224,.94);display:grid;place-items:center;font-family:'Jost',sans-serif;color:#a8763c;font-size:14px;letter-spacing:.05em")}>
                    03
                  </div>
                  <div style={parseStyle("position:absolute;left:24px;right:20px;bottom:16px;font-family:'Jost',sans-serif;font-size:1.45rem;font-weight:300;color:#f5ecdd;letter-spacing:.01em")}>
                    Apartamentos
                  </div>
                </div>
                <ul style={parseStyle('list-style:none;margin:0;padding:14px 30px 30px;display:flex;flex-direction:column')}>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Living com pé-direito duplo de 5,60 m
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Hall social privativo
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    3 e 4 suítes · 3 a 5 vagas demarcadas
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Depósitos privativos para todas as unidades
                  </li>
                  <li style={parseStyle('display:flex;gap:13px;align-items:flex-start;font-size:14.5px;line-height:1.5;color:#3a2a1a;padding:13px 0;border-bottom:1px solid rgba(40,26,14,.07)')}>
                    <span style={parseStyle('flex:none;width:19px;height:19px;border-radius:50%;background:rgba(200,156,96,.16);color:#a8763c;display:grid;place-items:center;font-size:10px;margin-top:1px')}>
                      ✓
                    </span>
                    Infra. para ar-condicionado, automação de persianas e churrasqueira a gás
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* LAZER */}
        <section style={parseStyle('background:#18100a;padding:clamp(80px,12vh,140px) 0 clamp(70px,9vh,110px)')} id="lazer">
          <div className="container">
            <div style={parseStyle('max-width:62ch;margin-bottom:18px')} data-reveal="">
              <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#caa067;margin-bottom:22px")}>
                Lazer & Bem-estar
              </div>
              <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.9rem,3.6vw,3.2rem);line-height:1.12;margin:0;color:#f3ece0")}>
                Mais de 20 experiências, a 12 metros do chão
              </h2>
              <p style={parseStyle('margin:24px 0 0;font-size:1.05rem;font-weight:300;line-height:1.8;color:rgba(240,230,214,.7);max-width:58ch')}>
                Um refúgio urbano de mais de 1.700 m² no 4º pavimento: piscina, spa, fitness, club house e ambientes assinados, para viver o extraordinário todos os dias.
              </p>
            </div>
          </div>
          <div style={parseStyle('overflow:hidden;padding:30px 0 40px;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)')}>
            <div className="marquee">
              <span>
                Piscina
              </span>
              <span>
                Spa
              </span>
              <span>
                Sauna
              </span>
              <span>
                Fitness
              </span>
              <span>
                Club House
              </span>
              <span>
                Espaço Gourmet
              </span>
              <span>
                Salão de Festas
              </span>
              <span>
                Yoga
              </span>
              <span>
                Beauty Care
              </span>
              <span>
                Brinquedoteca
              </span>
              <span>
                Pet Place
              </span>
              <span>
                Mini Mercado
              </span>
              <span>
                Piscina
              </span>
              <span>
                Spa
              </span>
              <span>
                Sauna
              </span>
              <span>
                Fitness
              </span>
              <span>
                Club House
              </span>
              <span>
                Espaço Gourmet
              </span>
              <span>
                Salão de Festas
              </span>
              <span>
                Yoga
              </span>
              <span>
                Beauty Care
              </span>
              <span>
                Brinquedoteca
              </span>
              <span>
                Pet Place
              </span>
              <span>
                Mini Mercado
              </span>
            </div>
          </div>
          <div className="container">
            <div className="gal" data-reveal="">
              <div className="tile big" data-lightbox="" data-idx="0">
                <img src="/doppio-jundiai/a003.jpg" alt="Piscina coberta" loading="lazy" />
                <div className="cap">
                  Piscina
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="1">
                <img src="/doppio-jundiai/a013.jpg" alt="Salão de festas" loading="lazy" />
                <div className="cap">
                  Salão de Festas
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="2">
                <img src="/doppio-jundiai/a009.jpg" alt="Espaço gourmet" loading="lazy" />
                <div className="cap">
                  Espaço Gourmet
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile big" data-lightbox="" data-idx="3">
                <img src="/doppio-jundiai/a016.jpg" alt="Fitness TechnoGym" loading="lazy" />
                <div className="cap">
                  Fitness · TechnoGym
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="4">
                <img src="/doppio-jundiai/a012.jpg" alt="Espaço massagem e spa" loading="lazy" />
                <div className="cap">
                  SPA · Massagem
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="5">
                <img src="/doppio-jundiai/a004.jpg" alt="Sauna úmida" loading="lazy" />
                <div className="cap">
                  Sauna Úmida
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile big" data-lightbox="" data-idx="6">
                <img src="/doppio-jundiai/a011.jpg" alt="Club House com piscina" loading="lazy" />
                <div className="cap">
                  Club House
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="7">
                <img src="/doppio-jundiai/a007.jpg" alt="Beauty care" loading="lazy" />
                <div className="cap">
                  Beauty Care
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="8">
                <img src="/doppio-jundiai/a001.jpg" alt="Hall social" loading="lazy" />
                <div className="cap">
                  Hall Social
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="9">
                <img src="/doppio-jundiai/a008.jpg" alt="Espaço yoga" loading="lazy" />
                <div className="cap">
                  Espaço Yoga
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="10">
                <img src="/doppio-jundiai/a006.jpg" alt="Salão de jogos" loading="lazy" />
                <div className="cap">
                  Salão de Jogos
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
              <div className="tile" data-lightbox="" data-idx="11">
                <img src="/doppio-jundiai/a014.jpg" alt="Mini mercado" loading="lazy" />
                <div className="cap">
                  Mini Mercado
                  <span className="plus">
                    +
                  </span>
                </div>
              </div>
            </div>
            <div style={parseStyle("text-align:center;margin-top:18px;font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,230,214,.4)")}>
              Perspectivas artísticas preliminares · imagens meramente ilustrativas
            </div>
          </div>
        </section>
        {/* PLANTAS */}
        <section style={parseStyle('background:#f3ece0;color:#241a10;padding:clamp(80px,12vh,150px) 0')} id="plantas">
          <div className="container">
            <div style={parseStyle('margin-bottom:46px')} data-reveal="">
              <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#a8763c;margin-bottom:20px")}>
                Plantas & Tipologias
              </div>
              <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.9rem,3.6vw,3.2rem);line-height:1.12;margin:0;color:#1f140c")}>
                De 156 m² ao topo: 442 m²
              </h2>
            </div>
            <div style={parseStyle('margin-bottom:30px')} className="tabs" data-reveal="">
              {tipoTabs.map((t, i) => (<React.Fragment key={i}>
                <button className="tipo-tab" data-tab-active={t.active} onClick={t.select}>
                  {t.tab}
                </button>
              </React.Fragment>))}
            </div>
            <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:#a8763c;margin-bottom:14px")} data-reveal="">
              Escolha a metragem
            </div>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;margin-bottom:44px')} data-reveal="">
              {planChips.map((p, i) => (<React.Fragment key={i}>
                <button className="medida-chip" data-chip-active={p.active} onClick={p.select}>
                  <span className="m-area">
                    {p.area}
                  </span>
                  <span className="m-sub">
                    {p.sub}
                  </span>
                </button>
              </React.Fragment>))}
            </div>
            <div className="tipo-grid" data-reveal="">
              <div>
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:12px;color:#a8763c;margin-bottom:16px")}>
                  {plan.sub}
                  {!!plan.detail && (<>
                    <span style={parseStyle('color:rgba(40,26,14,.45)')}>
                      · {plan.detail}
                    </span>
                  </>)}
                </div>
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:500;font-size:clamp(2.8rem,6vw,4.4rem);line-height:.95;color:#1f140c")}>
                  {plan.area}
                </div>
                <div style={parseStyle('display:flex;gap:12px;flex-wrap:wrap;margin:28px 0')}>
                  <span className="pill">
                    {plan.suites}
                  </span>
                  <span className="pill">
                    {plan.vagas}
                  </span>
                  <span className="pill">
                    Pé-direito duplo 5,60 m
                  </span>
                </div>
                <p style={parseStyle('font-size:1.04rem;font-weight:300;line-height:1.8;color:rgba(40,26,14,.72);max-width:46ch;margin:0')}>
                  {plan.desc}
                </p>
                <div style={parseStyle("margin-top:32px;display:flex;align-items:center;gap:13px;color:#a8763c;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:11px")}>
                  <span style={parseStyle('width:36px;height:36px;border:1px solid rgba(168,118,60,.45);border-radius:50%;display:grid;place-items:center;font-size:16px')}>
                    ⤢
                  </span>
                  {' '}Clique na planta para ampliar
                </div>
              </div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:16px')}>
                {floors.map((f, i) => (<React.Fragment key={i}>
                  <figure style={parseStyle('margin:0;position:relative;background:#fff;border:1px solid rgba(40,26,14,.1);border-radius:8px;padding:20px;cursor:zoom-in;overflow:hidden')} className="planfig" onClick={f.open}>
                    {f.imgEl}
                    <figcaption style={parseStyle("position:absolute;left:20px;bottom:18px;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:11px;color:#1f140c;background:rgba(243,236,224,.92);backdrop-filter:blur(4px);padding:7px 14px;border-radius:30px;border:1px solid rgba(40,26,14,.1)")}>
                      {f.label}
                    </figcaption>
                    <span className="zoombadge">
                      ⤢
                    </span>
                  </figure>
                </React.Fragment>))}
              </div>
            </div>
            <div style={parseStyle("text-align:right;margin-top:16px;font-family:'Jost',sans-serif;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(40,26,14,.42)")} data-reveal="">
              Plantas ilustrativas · metragem com depósito privado · sujeita a alteração
            </div>
          </div>
        </section>
        {/* LOCALIZAÇÃO */}
        <section style={parseStyle('background:#18100a;padding:clamp(80px,12vh,150px) 0;position:relative')} id="localizacao">
          <div className="container">
            <div className="loc-grid">
              <div data-reveal="left">
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#caa067;margin-bottom:22px")}>
                  Localização
                </div>
                <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.9rem,3.6vw,3.2rem);line-height:1.12;margin:0;color:#f3ece0")}>
                  Entre o design e a natureza da{' '}
                  <span style={parseStyle("font-family:'Allura',cursive;font-weight:400;font-size:1.3em;background:linear-gradient(110deg,#d9b277,#f3e2bb);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:.7")}>
                    Serra do Japi
                  </span>
                </h2>
                <p style={parseStyle('margin:24px 0 30px;font-size:1.04rem;font-weight:300;line-height:1.8;color:rgba(240,230,214,.72);max-width:48ch')}>
                  Av. Luiz Gonzaga Martins Guimarães, 725, Campos Elísios, Jundiaí/SP. Acesso fácil a rodovias, clubes e gastronomia.
                </p>
                <div className="prox-list">
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      800 m
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Rodovia Anhanguera
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      1 min
                    </span>
                  </div>
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      1,5 km
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Avenida 9 de Julho
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      3 min
                    </span>
                  </div>
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      1,5 km
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Tênis Clube Jundiaí
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      4 min
                    </span>
                  </div>
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      1,6 km
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Dom Olívio Supermercado
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      5 min
                    </span>
                  </div>
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      2,9 km
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Jundiaí Shopping
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      5 min
                    </span>
                  </div>
                  <div style={parseStyle('display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid rgba(231,205,156,.14);border-bottom:1px solid rgba(231,205,156,.14)')}>
                    <span style={parseStyle("font-family:'Jost',sans-serif;color:#e7cd9c;font-size:13px;width:64px;flex:none")}>
                      8,5 km
                    </span>
                    <span style={parseStyle('flex:1;font-size:15px;color:#f0e6d6')}>
                      Parque da Cidade
                    </span>
                    <span style={parseStyle('font-size:12.5px;color:rgba(240,230,214,.5)')}>
                      10 min
                    </span>
                  </div>
                </div>
                <div style={parseStyle('font-size:11px;color:rgba(240,230,214,.4);margin-top:12px')}>
                  *Distâncias estimadas pelo Google Maps.
                </div>
              </div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:16px')} data-reveal="right">
                <a style={parseStyle('position:relative;overflow:hidden;border-radius:6px;flex:1;min-height:320px;display:block;text-decoration:none;border:1px solid rgba(231,205,156,.18)')} href="https://www.google.com/maps?q=Av.+Luiz+Gonzaga+Martins+Guimaraes,+725,+Jundiai+SP" target="_blank" rel="noopener">
                  <img style={parseStyle('width:100%;height:100%;min-height:320px;object-fit:cover')} src="/doppio-jundiai/a010.jpg" alt="Vista aérea de Jundiaí com a Serra do Japi ao fundo e a localização do Doppio em Campos Elísios" loading="lazy" />
                  <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(to top,rgba(20,12,6,.82),rgba(20,12,6,.04) 46%)')}>
                  </div>
                  <div style={parseStyle('position:absolute;left:55%;top:45%;transform:translate(-50%,-100%);filter:drop-shadow(0 8px 16px rgba(0,0,0,.5))')} className="map-pin">
                    <span style={parseStyle('display:grid;place-items:center;width:42px;height:42px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#caa067,#ecd4a4);transform:rotate(-45deg)')}>
                      <span style={parseStyle('width:12px;height:12px;border-radius:50%;background:#1a0f06;transform:rotate(45deg)')}>
                      </span>
                    </span>
                  </div>
                  <div style={parseStyle('position:absolute;left:22px;right:22px;bottom:20px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px')}>
                    <div>
                      <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.18em;font-size:10.5px;color:#e7cd9c;margin-bottom:6px")}>
                        Jardim Campos Elísios · Jundiaí/SP
                      </div>
                      <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:300;font-size:1.02rem;color:#f5ecdd;line-height:1.3")}>
                        Av. Luiz Gonzaga Martins Guimarães, 725
                      </div>
                    </div>
                    <span style={parseStyle("flex:none;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.12em;font-size:10.5px;color:#1a0f06;background:linear-gradient(120deg,#caa067,#ecd4a4);padding:11px 17px;border-radius:30px;white-space:nowrap")}>
                      Abrir mapa →
                    </span>
                  </div>
                </a>
                <div style={parseStyle('position:relative;overflow:hidden;border-radius:6px;border:1px solid rgba(231,205,156,.18);background:#0f0904')}>
                  <iframe style={parseStyle('width:100%;height:250px;border:0;display:block')} title="Mapa, Doppio Jundiaí, Av. Luiz Gonzaga Martins Guimarães 725" src="https://www.openstreetmap.org/export/embed.html?bbox=-46.9255,-23.1955,-46.8855,-23.1695&layer=mapnik&marker=-23.1825203,-46.9055259" loading="lazy">
                  </iframe>
                  <a style={parseStyle("position:absolute;right:14px;bottom:14px;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.12em;font-size:10.5px;color:#1a0f06;background:linear-gradient(120deg,#caa067,#ecd4a4);padding:11px 17px;border-radius:30px;text-decoration:none;box-shadow:0 8px 22px -8px rgba(0,0,0,.6)")} href="https://www.google.com/maps/search/?api=1&query=-23.1825203,-46.9055259" target="_blank" rel="noopener">
                    Abrir no Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ARQUITETURA */}
        <section style={parseStyle('background:#f3ece0;color:#241a10;padding:clamp(80px,12vh,150px) 0')}>
          <div className="container">
            <div className="g2">
              <div style={parseStyle('overflow:hidden;border-radius:4px;box-shadow:0 40px 90px -45px rgba(0,0,0,.6)')} data-reveal="left">
                <img style={parseStyle('width:100%;height:clamp(380px,56vh,560px);object-fit:cover')} src="/doppio-jundiai/a018.jpg" alt="Porte cochère do Doppio Jundiaí, perspectiva artística preliminar" loading="lazy" />
              </div>
              <div data-reveal="right">
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#a8763c;margin-bottom:24px")}>
                  Assinaturas
                </div>
                <p style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.4rem,2.4vw,2rem);line-height:1.4;color:#1f140c;margin:0 0 26px")}>
                  "Nos traços da fachada, a intenção foi dissolver limites, aproximar o interior do exterior e fazer a arquitetura respirar junto com quem a habita."
                </p>
                <div style={parseStyle('font-size:14px;color:#a8763c;letter-spacing:.04em;margin-bottom:40px')}>
                  Nivaldo Callegari · Arquiteto e Urbanista
                </div>
                <div className="bgrid">
                  <div style={parseStyle('border-top:1px solid rgba(40,26,14,.14);padding-top:16px')}>
                    <div style={parseStyle("font-family:'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#a8763c;margin-bottom:6px")}>
                      Arquitetura
                    </div>
                    <div style={parseStyle('font-size:15px;color:#1f140c')}>
                      Pass Arquitetura · Nivaldo Callegari
                    </div>
                  </div>
                  <div style={parseStyle('border-top:1px solid rgba(40,26,14,.14);padding-top:16px')}>
                    <div style={parseStyle("font-family:'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#a8763c;margin-bottom:6px")}>
                      Paisagismo
                    </div>
                    <div style={parseStyle('font-size:15px;color:#1f140c')}>
                      Martha Gavião
                    </div>
                  </div>
                  <div style={parseStyle('border-top:1px solid rgba(40,26,14,.14);padding-top:16px')}>
                    <div style={parseStyle("font-family:'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#a8763c;margin-bottom:6px")}>
                      Interiores
                    </div>
                    <div style={parseStyle('font-size:15px;color:#1f140c')}>
                      Barbara & Purchio · Cristina Barbara
                    </div>
                  </div>
                  <div style={parseStyle('border-top:1px solid rgba(40,26,14,.14);padding-top:16px')}>
                    <div style={parseStyle("font-family:'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;font-size:10.5px;color:#a8763c;margin-bottom:6px")}>
                      Decorado
                    </div>
                    <div style={parseStyle('font-size:15px;color:#1f140c')}>
                      Andra Callegari
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CONSTRUTORAS */}
        <section style={parseStyle('background:#18100a;padding:clamp(80px,12vh,140px) 0')}>
          <div className="container">
            <div style={parseStyle('text-align:center;margin-bottom:54px')} data-reveal="">
              <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#caa067;margin-bottom:20px")}>
                Realização
              </div>
              <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.7rem,3.2vw,2.8rem);line-height:1.14;margin:0;color:#f3ece0")}>
                Tradição que constrói confiança
              </h2>
            </div>
            <div style={parseStyle('gap:24px;align-items:stretch')} className="g2">
              <div style={parseStyle('background:linear-gradient(160deg,#221610,#1a110a);border:1px solid rgba(231,205,156,.16);border-radius:8px;padding:44px 40px')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:500;letter-spacing:.06em;font-size:1.5rem;color:#f3ece0")}>
                  Construtora Marino
                </div>
                <div style={parseStyle('font-size:13.5px;color:#caa067;margin:6px 0 28px;letter-spacing:.05em')}>
                  45 anos no mercado imobiliário
                </div>
                <div style={parseStyle('gap:20px')} className="bgrid">
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      42
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Empreendimentos entregues
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      570 mil m²
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Construídos
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      2.000
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Unidades
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      R$ 500 mi
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Em land bank
                    </div>
                  </div>
                </div>
              </div>
              <div style={parseStyle('background:linear-gradient(160deg,#221610,#1a110a);border:1px solid rgba(231,205,156,.16);border-radius:8px;padding:44px 40px')} data-reveal="">
                <div style={parseStyle("font-family:'Jost',sans-serif;font-weight:500;letter-spacing:.06em;font-size:1.5rem;color:#f3ece0")}>
                  REM Construtora
                </div>
                <div style={parseStyle('font-size:13.5px;color:#caa067;margin:6px 0 28px;letter-spacing:.05em')}>
                  Mais de 35 anos · Prêmio Master Imobiliário 2025
                </div>
                <div style={parseStyle('gap:20px')} className="bgrid">
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      56
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Empreendimentos
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      630 mil m²
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Construídos
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      4.000
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Unidades
                    </div>
                  </div>
                  <div>
                    <div style={parseStyle("font-family:'Jost',sans-serif;font-size:1.6rem;color:#e7cd9c;font-weight:400")}>
                      R$ 1 bi
                    </div>
                    <div style={parseStyle('font-size:12px;color:rgba(240,230,214,.55);margin-top:3px')}>
                      Em land bank
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CONTATO */}
        <section style={parseStyle('position:relative;padding:clamp(80px,12vh,150px) 0;overflow:hidden;background:#140c06')} id="contato">
          <img style={parseStyle('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.22')} src="/doppio-jundiai/a002.jpg" alt="" aria-hidden="true" />
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(120deg,rgba(20,12,6,.96),rgba(20,12,6,.78))')}>
          </div>
          <div style={parseStyle('position:relative;z-index:2')} className="container">
            <div style={parseStyle('background:rgba(28,18,11,.72);backdrop-filter:blur(14px);border:1px solid rgba(231,205,156,.2);border-radius:12px;overflow:hidden')} className="fgrid">
              <div style={parseStyle('padding:clamp(38px,5vw,60px)')}>
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.34em;font-size:12px;color:#caa067;margin-bottom:22px")}>
                  Atendimento exclusivo
                </div>
                <h2 style={parseStyle("font-family:'Jost',sans-serif;font-weight:200;font-size:clamp(1.7rem,3vw,2.6rem);line-height:1.16;margin:0 0 16px;color:#f7efe2")}>
                  Receba o material completo e as condições de lançamento
                </h2>
                <p style={parseStyle('font-size:1.02rem;font-weight:300;line-height:1.75;color:rgba(240,230,214,.7);max-width:42ch;margin:0 0 30px')}>
                  Fale agora com um consultor da Japi Lançamentos e seja um dos primeiros a conhecer o Doppio Jundiaí.
                </p>
                <div style={parseStyle('display:flex;align-items:center;gap:14px;padding:18px 0;border-top:1px solid rgba(231,205,156,.16)')}>
                  <span style={parseStyle('width:42px;height:42px;border-radius:50%;border:1px solid rgba(231,205,156,.35);display:grid;place-items:center;color:#e7cd9c')}>
                    ✆
                  </span>
                  <div>
                    <div style={parseStyle('font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,230,214,.5)')}>
                      WhatsApp
                    </div>
                    <a style={parseStyle("font-family:'Jost',sans-serif;font-size:1.2rem;color:#f3ece0;text-decoration:none")} href={waMain} target="_blank" rel="noopener">
                      +55 11 92614-3393
                    </a>
                  </div>
                </div>
              </div>
              <div style={parseStyle('padding:clamp(38px,5vw,60px);background:rgba(20,12,7,.5)')}>
                {formSent && (<>
                  <div style={parseStyle('height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:16px;min-height:280px')}>
                    <div style={parseStyle('width:64px;height:64px;border-radius:50%;background:linear-gradient(120deg,#caa067,#ecd4a4);display:grid;place-items:center;color:#1a0f06;font-size:30px')}>
                      ✓
                    </div>
                    <h3 style={parseStyle("font-family:'Jost',sans-serif;font-weight:300;font-size:1.5rem;color:#f3ece0;margin:0")}>
                      Tudo certo!
                    </h3>
                    <p style={parseStyle('color:rgba(240,230,214,.7);font-size:15px;line-height:1.6;margin:0;max-width:30ch')}>
                      Abrimos o WhatsApp para finalizar seu contato. Caso não tenha aberto, fale conosco pelo botão verde.
                    </p>
                  </div>
                </>)}
                {formIdle && (<>
                  <form style={parseStyle('display:flex;flex-direction:column;gap:16px')} onSubmit={submitForm}>
                    <div>
                      <label style={parseStyle('display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,230,214,.55);margin-bottom:8px')}>
                        Nome completo
                      </label>
                      <input className="field" name="nome" type="text" placeholder="Seu nome" required />
                    </div>
                    <div>
                      <label style={parseStyle('display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,230,214,.55);margin-bottom:8px')}>
                        Telefone / WhatsApp
                      </label>
                      <input className="field" name="telefone" type="tel" placeholder="(11) 90000-0000" required />
                    </div>
                    <div>
                      <label style={parseStyle('display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,230,214,.55);margin-bottom:8px')}>
                        E-mail
                      </label>
                      <input className="field" name="email" type="email" placeholder="voce@email.com" />
                    </div>
                    <button style={parseStyle('justify-content:center;margin-top:8px;width:100%')} type="submit" className="btn-gold">
                      Quero ser consultor · Falar agora
                    </button>
                    <p style={parseStyle('font-size:11px;color:rgba(240,230,214,.4);text-align:center;margin:2px 0 0;line-height:1.5')}>
                      Ao enviar, você concorda em ser contatado pela Imobiliária Japi Lançamentos.
                    </p>
                  </form>
                </>)}
              </div>
            </div>
          </div>
        </section>
        {/* FOOTER */}
        <footer style={parseStyle('background:#0f0904;padding:clamp(56px,8vh,90px) 0 40px;border-top:1px solid rgba(231,205,156,.12)')}>
          <div className="container">
            <div style={parseStyle('display:flex;flex-wrap:wrap;justify-content:space-between;gap:34px;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid rgba(231,205,156,.1)')}>
              <div style={parseStyle('max-width:300px')}>
                <img style={parseStyle('height:40px;width:auto;margin-bottom:18px')} src="/doppio-jundiai/a005.png" alt="Doppio Jundiaí" />
                <p style={parseStyle('font-size:13.5px;line-height:1.7;color:rgba(240,230,214,.55);margin:0')}>
                  O ícone de sofisticação no Jardim Campos Elísios. Living com pé-direito duplo de 5,60 m.
                </p>
              </div>
              <div>
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:11px;color:#caa067;margin-bottom:16px")}>
                  Navegação
                </div>
                <div style={parseStyle('display:flex;flex-direction:column;gap:11px')}>
                  <a className="navlink" data-scroll="conceito">
                    Conceito
                  </a>
                  <a className="navlink" data-scroll="diferenciais">
                    Diferenciais
                  </a>
                  <a className="navlink" data-scroll="lazer">
                    Lazer
                  </a>
                  <a className="navlink" data-scroll="plantas">
                    Plantas
                  </a>
                  <a className="navlink" data-scroll="localizacao">
                    Localização
                  </a>
                </div>
              </div>
              <div>
                <div style={parseStyle("font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:11px;color:#caa067;margin-bottom:16px")}>
                  Atendimento
                </div>
                <div style={parseStyle('font-size:14px;color:rgba(240,230,214,.7);line-height:1.9')}>
                  Imobiliária Japi Lançamentos
                  <br />
                  <a style={parseStyle('color:#f3ece0;text-decoration:none')} href={waMain} target="_blank" rel="noopener">
                    +55 11 92614-3393
                  </a>
                  <br />
                  Campos Elísios · Jundiaí/SP
                </div>
                <a style={parseStyle('margin-top:18px;padding:13px 24px')} className="btn-gold" href={waMain} target="_blank" rel="noopener">
                  Falar no WhatsApp
                </a>
              </div>
            </div>
            <p style={parseStyle('font-size:10.5px;line-height:1.7;color:rgba(240,230,214,.36);margin:26px 0 0;max-width:none')}>
              Registro de Incorporação R.3 da matrícula 189.290, no 1º Oficial de Registro de Imóveis de Jundiaí/SP em 12/03/2026. MARINO JUNDIAI EMPREENDIMENTO IMOBILIARIO SPE LTDA, CNPJ nº 51.854.681/0001-96. Imagens e perspectivas são meramente ilustrativas, podendo sofrer alteração sem aviso prévio, inclusive quanto à forma, à cor, à textura e ao tamanho. Os acabamentos, a quantidade de móveis, os equipamentos e os utensílios serão entregues conforme o memorial descritivo. O porte da vegetação na entrega do empreendimento será de acordo com o projeto paisagístico e poderá apresentar diferença de tamanho. Comercialização: REM Consultoria e Vendas, CRECI J-33208 e Mediterrâneo Negócios Imobiliários Ltda CRECI 032134-J. MATERIAL PRELIMINAR, SUJEITO A ALTERAÇÕES. Produzido em 05/2026.
            </p>
            <div style={parseStyle('font-size:11px;color:rgba(240,230,214,.3);margin-top:20px')}>
              © 2026 Doppio Jundiaí · Realização Construtora Marino & REM · Página por Imobiliária Japi Lançamentos.
            </div>
          </div>
        </footer>
        <a className="wa-float" href={waMain} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff">
            <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.3-.4c-1-1.6-1.5-3.4-1.5-5.3C4.4 9.6 9.6 4.4 16 4.4S27.6 9.6 27.6 16 22.4 24.8 16 24.8zm6.5-7.9c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2-.2.4-.9 1.2-1.1 1.4-.2.2-.4.2-.8.1-.4-.2-1.5-.6-2.9-1.8-1.1-1-1.8-2.2-2-2.5-.2-.4 0-.6.2-.7.2-.2.4-.4.5-.6.2-.2.2-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.8 0 1.7 1.2 3.3 1.4 3.5.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2.1-.8 2.4-1.7.3-.8.3-1.6.2-1.7-.1-.2-.3-.3-.7-.4z">
            </path>
          </svg>
        </a>
        {lbOpen && (<>
          <div className="lb" data-lb-close="">
            <button style={parseStyle('left:24px')} className="lb-btn" data-lb-prev="">
              ‹
            </button>
            <div style={parseStyle('text-align:center')} data-lb-stop="">
              {lbImgEl}
              <div style={parseStyle("margin-top:18px;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:13px;color:#e7cd9c")}>
                {lbTitle} ·{' '}
                <span style={parseStyle('color:rgba(240,230,214,.5)')}>
                  {lbCounter}
                </span>
              </div>
            </div>
            <button style={parseStyle('right:24px')} className="lb-btn" data-lb-next="">
              ›
            </button>
            <button style={parseStyle('top:24px;right:24px;transform:none')} className="lb-btn" data-lb-close="">
              ×
            </button>
          </div>
        </>)}
        {planLbOpen && (<>
          <div className="lb" data-planlb-close="">
            <div style={parseStyle('text-align:center;max-width:94vw')} data-planlb-stop="">
              {planLbImgEl}
              <div style={parseStyle("margin-top:16px;font-family:'Jost',sans-serif;text-transform:uppercase;letter-spacing:.2em;font-size:13px;color:#e7cd9c")}>
                {planLbTitle}
              </div>
            </div>
            <button style={parseStyle('top:24px;right:24px;transform:none')} className="lb-btn" data-planlb-close="">
              ×
            </button>
          </div>
        </>)}
      </div>
    </>
  );
}
