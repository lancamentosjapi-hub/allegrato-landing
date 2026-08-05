'use client';

/**
 * Maitá Residencial — porte 1:1 de "Maitá Residencial - Japi Lançamentos (Wix).html"
 * (mecanismo dc-runtime) para React. CSS em app/maita/maita.css, assets em public/maita.
 *
 * Comportamentos portados do a016.js: nav sólida + link ativo, parallax, reveal on
 * scroll, count-up, menu mobile, revoada de pássaros, abas de planta, lightbox da
 * galeria e formulário com handoff para o WhatsApp.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { parseStyle, useReveal, waHref } from '@/lib/dc-runtime';
import { sendLead } from '@/lib/lead';

const WA = '5511926143393';
const wa = (text: string) => waHref(WA, text);

type Plant = {
  t: string;
  m: string;
  /** null = imagem não fornecida no material de origem (ver IMAGENS-FALTANDO.md). */
  img: string | null;
  specs: Array<[string, string]>;
};

// Valores exatos do PLANTS do a016.js. Só a planta de 63,45 m² veio no material
// original; as outras três apontavam para arquivos inexistentes (img/planta-*.png).
const PLANTS: Plant[] = [
  {
    t: '2 Dormitórios · 1 Suíte',
    m: '63,45',
    img: '/maita/a014.png',
    specs: [
      ['Configuração', '2 dormitórios (1 suíte)'],
      ['Área privativa', '63,45 m²'],
      ['Torre', 'Torre A'],
      ['Diferenciais', 'Opção de sala ampliada'],
    ],
  },
  {
    t: '2 Dormitórios · 2 Suítes',
    m: '65,52',
    img: null,
    specs: [
      ['Configuração', '2 dormitórios (2 suítes)'],
      ['Área privativa', '65,52 m²'],
      ['Torre', 'Torre A'],
      ['Diferenciais', 'Opção de sala ampliada'],
    ],
  },
  {
    t: '2 Dormitórios · 1 Suíte',
    m: '67,12',
    img: null,
    specs: [
      ['Configuração', '2 dormitórios (1 suíte)'],
      ['Área privativa', '67,12 m²'],
      ['Torre', 'Torre B'],
      ['Diferenciais', 'Opção de sala ampliada'],
    ],
  },
  {
    t: '3 Dormitórios · 1 Suíte',
    m: '80,87',
    img: null,
    specs: [
      ['Configuração', '3 dormitórios (1 suíte)'],
      ['Área privativa', '80,87 m²'],
      ['Torre', 'Torre B'],
      ['Vagas', '2 vagas de garagem'],
    ],
  },
];

const TAB_LABELS: Array<[string, string]> = [
  ['2 Dorm · 1 Suíte', '63,45 m²'],
  ['2 Dorm · 2 Suítes', '65,52 m²'],
  ['2 Dorm · 1 Suíte', '67,12 m²'],
  ['3 Dorm · 1 Suíte', '80,87 m²'],
];

type GalItem = { src: string; alt: string; lbl: string; cap: string };
const GALLERY: GalItem[] = [
  { src: '/maita/a007.jpg', alt: 'Fachada do Maitá Residencial', lbl: 'Fachada', cap: 'Fachada · imagem ilustrativa' },
  { src: '/maita/a003.jpg', alt: 'Piscina', lbl: 'Piscina', cap: 'Piscina adulto e infantil · imagem ilustrativa' },
  { src: '/maita/a005.jpg', alt: 'Hall de entrada', lbl: 'Hall de entrada', cap: 'Hall de entrada · imagem ilustrativa' },
  { src: '/maita/a006.jpg', alt: 'Espaço gourmet', lbl: 'Espaço gourmet', cap: 'Espaço gourmet com piscina · imagem ilustrativa' },
  { src: '/maita/a009.jpg', alt: 'Varanda gourmet garden', lbl: 'Garden', cap: 'Varanda gourmet garden · imagem ilustrativa' },
  { src: '/maita/a008.jpg', alt: 'Academia', lbl: 'Academia', cap: 'Academia · imagem ilustrativa' },
  { src: '/maita/a001.jpg', alt: 'Quadra recreativa', lbl: 'Quadra recreativa', cap: 'Quadra recreativa · imagem ilustrativa' },
  { src: '/maita/a012.jpg', alt: 'Salão de festas', lbl: 'Salão de festas', cap: 'Salão de festas · imagem ilustrativa' },
  { src: '/maita/a011.jpg', alt: 'Playground', lbl: 'Playground', cap: 'Playground · imagem ilustrativa' },
];

const WaGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.1.1.3 0 .5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z" />
  </svg>
);

export default function Maita() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [plantaIdx, setPlantaIdx] = useState(0);
  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [errs, setErrs] = useState({ nome: false, email: false, tel: false, consent: false });

  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const planta = PLANTS[plantaIdx];

  /* Hero intro: dispara cedo, sem esperar as imagens (igual ao a016.js). */
  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const play = () => hero.classList.add('in');
    requestAnimationFrame(() => requestAnimationFrame(play));
    const t = window.setTimeout(play, 400);
    return () => window.clearTimeout(t);
  }, []);

  /* Nav sólida + link ativo + parallax. Efeitos puramente visuais sobre o DOM:
     manter em useEffect evita re-render a cada scroll. */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const nav = document.querySelector('.nav');
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a'));
    const sections = links.map((a) => document.querySelector(a.getAttribute('href') || ''));
    const pxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-px]'));
    const heroBg = document.querySelector<HTMLElement>('.hero__bg img');

    const onScroll = () => {
      const y = window.scrollY;
      nav?.classList.toggle('nav--solid', y > 80);
      let idx = -1;
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top <= 140) idx = i;
      });
      links.forEach((a, i) => a.classList.toggle('active', i === idx));
      if (reduce) return;
      if (heroBg && y < window.innerHeight) heroBg.style.transform = `translateY(${y * 0.18}px)`;
      for (const el of pxEls) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom > 0 && r.top < vh) {
          const prog = (r.top + r.height / 2 - vh / 2) / vh;
          const amt = parseFloat(el.getAttribute('data-px') || '') || 30;
          el.style.transform = `translateY(${prog * amt}px)`;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useReveal('[data-reveal]', 'vis');

  /* Count-up dos números da faixa .facts (uma vez, ao entrar na viewport). */
  useEffect(() => {
    const facts = document.querySelector('.facts');
    if (!facts || typeof IntersectionObserver !== 'function') return;
    let counted = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || counted) continue;
          counted = true;
          document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
            const target = parseFloat(el.getAttribute('data-count') || '0');
            const suf = el.getAttribute('data-suf') || '';
            const pre = el.getAttribute('data-pre') || '';
            let t0: number | null = null;
            const dur = 1400;
            const step = (t: number) => {
              if (t0 === null) t0 = t;
              const p = Math.min((t - t0) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = pre + Math.round(target * eased) + suf;
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        }
      },
      { threshold: 0.4 },
    );
    io.observe(facts);
    return () => io.disconnect();
  }, []);

  /* Revoada de pássaros (decorativa, aria-hidden). */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const style = document.createElement('style');
    style.textContent =
      '@keyframes flyAcross{0%{transform:translate(-12vw,0) scaleX(1)}' +
      '25%{transform:translate(28vw,-5vh) scaleX(1)}' +
      '50%{transform:translate(58vw,3vh) scaleX(1)}' +
      '75%{transform:translate(86vw,-4vh) scaleX(1)}' +
      '100%{transform:translate(116vw,0) scaleX(1)}}';
    document.head.appendChild(style);

    const birdSVG =
      '<svg width="60" height="34" viewBox="0 0 60 34"><g fill="currentColor">' +
      '<ellipse cx="30" cy="18" rx="6.5" ry="2.6"/>' +
      '<path class="wing l" d="M30 18 C 20 4, 8 2, 1 9 C 12 9, 20 14, 30 18 Z"/>' +
      '<path class="wing r" d="M30 18 C 40 4, 52 2, 59 9 C 48 9, 40 14, 30 18 Z"/>' +
      '</g></svg>';

    const spawned: HTMLElement[] = [];
    const spawnFlock = (
      container: Element,
      { count, color, opacity }: { count: number; color: string; opacity: number },
    ) => {
      for (let i = 0; i < count; i++) {
        const b = document.createElement('div');
        b.className = 'bird';
        b.innerHTML = birdSVG;
        const scale = 0.4 + Math.random() * 0.9;
        const dur = 16 + Math.random() * 16;
        b.style.top = `${5 + Math.random() * 55}%`;
        b.style.left = '0';
        b.style.color = color;
        b.style.setProperty('--fd', `${(0.55 + Math.random() * 0.5).toFixed(2)}s`);
        b.style.opacity = String(opacity);
        const svg = b.querySelector('svg');
        if (svg instanceof SVGElement) {
          svg.style.width = `${38 * scale}px`;
          svg.style.height = 'auto';
        }
        b.style.animation = `flyAcross ${dur}s linear ${-Math.random() * dur}s infinite`;
        container.appendChild(b);
        spawned.push(b);
      }
    };

    const heroFlock = document.querySelector('.hero .flock');
    if (heroFlock) spawnFlock(heroFlock, { count: 5, color: 'rgba(246,242,233,.55)', opacity: 0.55 });
    document.querySelectorAll('[data-flock]').forEach((c) => {
      spawnFlock(c, {
        count: parseInt(c.getAttribute('data-flock') || '3', 10) || 3,
        color: c.getAttribute('data-flock-color') || 'rgba(10,110,66,.28)',
        opacity: 0.4,
      });
    });
    return () => {
      style.remove();
      spawned.forEach((b) => b.remove());
    };
  }, []);

  /* Lightbox: trava o scroll do body e responde ao teclado (Esc / setas). */
  const closeLb = useCallback(() => setLbIdx(null), []);
  useEffect(() => {
    if (lbIdx === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') setLbIdx((i) => ((i ?? 0) + 1) % GALLERY.length);
      if (e.key === 'ArrowLeft') setLbIdx((i) => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [lbIdx, closeLb]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = nomeRef.current?.value.trim() || '';
    const email = emailRef.current?.value.trim() || '';
    const tel = telRef.current?.value.trim() || '';
    const consent = consentRef.current?.checked || false;
    const next = {
      nome: nome.length <= 2,
      email: !/\S+@\S+\.\S+/.test(email),
      tel: tel.length <= 2,
      consent: !consent,
    };
    setErrs(next);
    if (next.nome || next.email || next.tel || next.consent) return;
    sendLead({
      name: nome,
      phone: tel,
      email,
      source: 'landing_maita',
      interest: 'Maitá Residencial',
    });
    setSent(
      wa(
        `Olá! Tenho interesse no *Maitá Residencial* (Jundiaí).\n\n*Nome:* ${nome}\n*E-mail:* ${email}\n*Telefone:* ${tel}`,
      ),
    );
  };

  return (
    <>
      {/* ============ TOP BAR ============ */}
      <div className="topbar">
        <span>
          <b>
            Obras iniciadas
          </b>
          {' '}· Maitá Residencial — Jundiaí/SP
        </span>
        <span className="dot">
        </span>
        <span>
          2 e 3 dormitórios · 63 a 80 m²
        </span>
        <span className="dot">
        </span>
        <a href={wa('Olá! Vi o Maitá Residencial e quero falar com um especialista.')} target="_blank" rel="noopener">
          Fale com um especialista →
        </a>
      </div>
      {/* ============ NAV ============ */}
      <header className="nav" id="nav">
        <a href="#topo" className="nav__logo" aria-label="Maitá Residencial">
          <img src="/maita/a013.png" alt="Maitá Residencial" id="navLogo" />
        </a>
        <nav className="nav__links" aria-label="Navegação principal">
          <a href="#sobre">
            O empreendimento
          </a>
          <a href="#lazer">
            Lazer
          </a>
          <a href="#plantas">
            Plantas
          </a>
          <a href="#galeria">
            Galeria
          </a>
          <a href="#local">
            Localização
          </a>
        </nav>
        <div className="nav__cta">
          <a href="#contato" className="btn btn--gold">
            Agendar visita
          </a>
          <button className="nav__burger" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <span>
            </span>
            <span>
            </span>
            <span>
            </span>
          </button>
        </div>
      </header>
      <div className={'mobile' + (menuOpen ? ' open' : '')} id="mobile" onClick={() => setMenuOpen(false)}>
        <button className="close" aria-label="Fechar menu">
          ×
        </button>
        <a href="#sobre">
          O empreendimento
        </a>
        <a href="#lazer">
          Lazer
        </a>
        <a href="#plantas">
          Plantas
        </a>
        <a href="#galeria">
          Galeria
        </a>
        <a href="#local">
          Localização
        </a>
        <a href="#contato">
          Agendar visita
        </a>
      </div>
      {/* ============ HERO ============ */}
      <section className="hero" id="topo">
        <div className="hero__bg">
          <img src="/maita/a004.jpg" alt="Pássaros em voo sobre tons de esmeralda — conceito Maitá Residencial" />
        </div>
        <div className="flock" aria-hidden="true">
        </div>
        <div className="hero__inner">
          <div className="hero__copy">
            <div className="hero__kicker">
              <span className="rule">
              </span>
              <span>
                Maitá Residencial · Jundiaí — SP
              </span>
            </div>
            <h1>
              <span className="ln">
                <span>
                  Vivencie
                </span>
              </span>
              <span className="ln">
                <span>
                  novos voos
                </span>
              </span>
              <span className="ln">
                <span>
                  com o{' '}
                  <em>
                    Maitá
                  </em>
                </span>
              </span>
            </h1>
            <p className="hero__sub">
              Novos voos para quem busca tranquilidade, conforto e praticidade. Apartamentos de 2 e 3 dormitórios, conectados com a natureza no coração de Jundiaí.
            </p>
            <div className="hero__actions">
              <a href="#contato" className="btn btn--gold btn--lg">
                <span className="sheen">
                </span>
                Quero conhecer
              </a>
              <a className="btn btn--ghost btn--lg" href={wa('Olá! Quero saber mais sobre o Maitá Residencial em Jundiaí.')} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.1.1.3 0 .5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z">
                  </path>
                </svg>
                {' '}WhatsApp{' '}
              </a>
            </div>
          </div>
          <aside className="hero__card" data-px="-30">
            <div className="frame">
              <img src="/maita/a007.jpg" alt="Fachada do Maitá Residencial — imagem ilustrativa" />
              <span className="tag">
                Fachada · Imagem ilustrativa
              </span>
            </div>
          </aside>
        </div>
        <div className="hero__scroll">
          <span>
            Explore
          </span>
          <span className="line">
          </span>
        </div>
      </section>
      {/* ============ FACTS ============ */}
      <section className="facts">
        <div className="wrap">
          <div className="facts__grid">
            <div className="fact">
              <span className="n" data-count="194">
                194
              </span>
              <span className="l">
                Unidades · 2 torres
              </span>
            </div>
            <div className="fact">
              <span className="n">
                2 a 3
              </span>
              <span className="l">
                Dormitórios com suíte
              </span>
            </div>
            <div className="fact">
              <span className="n">
                63–80
              </span>
              <span className="l">
                m² privativos
              </span>
            </div>
            <div className="fact">
              <span className="n" data-count="13" data-suf=" pav.">
                13 pav.
              </span>
              <span className="l">
                Por torre (T + 13)
              </span>
            </div>
            <div className="fact">
              <span className="n">
                24h
              </span>
              <span className="l">
                Portaria · segurança
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* ============ SOBRE ============ */}
      <section className="sec about" id="sobre">
        <div className="wrap about__grid">
          <div className="about__media" data-reveal="scale">
            <div className="main" data-px="26">
              <img src="/maita/a007.jpg" alt="Fachada do Maitá Residencial" />
            </div>
            <div className="float">
              <img src="/maita/a005.jpg" alt="Hall de entrada do Maitá Residencial" />
            </div>
            <div className="stamp">
              <span>
                <b>
                  2 torres
                </b>
                conectadas
                <br />
                à natureza
              </span>
            </div>
          </div>
          <div className="about__copy">
            <span className="eyebrow" data-reveal="">
              O empreendimento
            </span>
            <h2 style={parseStyle('--d:80')} className="h2" data-reveal="" data-d="80">
              Um projeto singular,{' '}
              <em className="it">
                conectado com a natureza
              </em>
            </h2>
            <p style={parseStyle('--d:160')} className="lead" data-reveal="" data-d="160">
              A Mac Lucer apresenta o mais novo empreendimento em Jundiaí, o{' '}
              <strong>
                Maitá Residencial
              </strong>
              : um projeto singular com apartamentos de 2 e 3 dormitórios, plantas de 63 a 80 m² e lazer completo.
            </p>
            <p style={parseStyle('--d:220')} data-reveal="" data-d="220">
              Localizado em uma área cada vez mais valorizada, na Vila Marlene, possui estrutura completa para toda a família e está próximo de supermercados, restaurantes, escolas e centros comerciais. Maitá Residencial: tudo o que você precisa perto do seu lar.
            </p>
            <ul style={parseStyle('--d:280')} className="about__chk" data-reveal="" data-d="280">
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                2 e 3 dormitórios com suíte
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                1 a 2 vagas de garagem
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Unidades garden disponíveis
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Estrutura para aquecedor a gás
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Persianas integradas nos dormitórios
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Lazer completo · portaria 24h
              </li>
            </ul>
            <div style={parseStyle('margin-top:2rem')} data-reveal="" data-d="340">
              <a href="#plantas" className="btn">
                Ver as plantas
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ============ LAZER ============ */}
      <section className="sec lazer" id="lazer">
        <div className="flock" data-flock="3" data-flock-color="rgba(216,189,125,.4)" aria-hidden="true">
        </div>
        <div className="wrap">
          <div className="lazer__top">
            <div>
              <span className="eyebrow" data-reveal="">
                Lazer completo
              </span>
              <h2 style={parseStyle('--d:80;margin-top:1rem')} className="h2" data-reveal="" data-d="80">
                Cada dia, um
                <br />
                <em className="it">
                  novo voo
                </em>
                {' '}dentro de casa
              </h2>
            </div>
            <p style={parseStyle('--d:140;color:rgba(246,242,233,.82)')} className="lead" data-reveal="" data-d="140">
              Mais de uma dezena de espaços pensados para o bem-estar de toda a família — do lazer ao trabalho, da rotina ao descanso.
            </p>
          </div>
          <div className="lazer__feature">
            <div className="tile t-lg" data-reveal="clip">
              <img src="/maita/a003.jpg" alt="Piscina adulto e infantil do Maitá Residencial" />
              <div className="cap">
                <h3>
                  Piscina adulto e infantil
                </h3>
                <p>
                  Raia de 15 m · 1,40 m de profundidade · bar de apoio
                </p>
              </div>
            </div>
            <div style={parseStyle('--d:100')} className="tile t-md" data-reveal="clip" data-d="100">
              <img src="/maita/a006.jpg" alt="Espaço gourmet com piscina privativa" />
              <div className="cap">
                <h3>
                  Espaço gourmet
                </h3>
                <p>
                  Com piscina para convidados, churrasqueira e forno de pizza
                </p>
              </div>
            </div>
          </div>
          <div className="lazer__feature">
            <div className="tile t-4" data-reveal="clip">
              <img src="/maita/a008.jpg" alt="Academia do Maitá Residencial" />
              <div className="cap">
                <h3>
                  Academia
                </h3>
              </div>
            </div>
            <div style={parseStyle('--d:100')} className="tile t-4" data-reveal="clip" data-d="100">
              <img src="/maita/a001.jpg" alt="Quadra recreativa demarcada" />
              <div className="cap">
                <h3>
                  Quadra recreativa
                </h3>
              </div>
            </div>
            <div style={parseStyle('--d:200')} className="tile t-4" data-reveal="clip" data-d="200">
              <img src="/maita/a012.jpg" alt="Salão de festas" />
              <div className="cap">
                <h3>
                  Salão de festas
                </h3>
              </div>
            </div>
          </div>
          <div className="lazer__feature">
            <div className="tile t-3" data-reveal="clip">
              <img src="/maita/a011.jpg" alt="Playground" />
              <div className="cap">
                <h3>
                  Playground
                </h3>
              </div>
            </div>
            <div style={parseStyle('--d:80')} className="tile t-3" data-reveal="clip" data-d="80">
              <img src="/maita/a015.jpg" alt="Brinquedoteca" />
              <div className="cap">
                <h3>
                  Brinquedoteca
                </h3>
              </div>
            </div>
            <div style={parseStyle('--d:160')} className="tile t-3" data-reveal="clip" data-d="160">
              <img src="/maita/a002.jpg" alt="Coworking" />
              <div className="cap">
                <h3>
                  Coworking
                </h3>
              </div>
            </div>
            <div style={parseStyle('--d:240')} className="tile t-3" data-reveal="clip" data-d="240">
              <img src="/maita/a010.jpg" alt="Churrasqueira" />
              <div className="cap">
                <h3>
                  Churrasqueira
                </h3>
              </div>
            </div>
          </div>
          <div className="lazer__list" data-reveal="">
            <div className="li">
              <span className="bd">
              </span>
              Piscina adulto e infantil
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Espaço gourmet com piscina
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Salão de festas
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Churrasqueira
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Academia
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Quadra recreativa
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Playground
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Brinquedoteca
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Coworking
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Escada fitness
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Bicicletário com o{' '}ficina
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Espaço pet com higienização
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Lavanderia coletiva
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Mini market
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Unidades garden
            </div>
            <div className="li">
              <span className="bd">
              </span>
              Portaria 24 horas
            </div>
          </div>
        </div>
      </section>
      {/* ============ PLANTAS ============ */}
      <section className="sec plantas" id="plantas">
        <div className="wrap">
          <div className="sec-head" data-reveal="">
            <span className="eyebrow">
              Plantas
            </span>
            <h2 style={parseStyle('margin-top:1rem')} className="h2">
              Encontre a metragem do{' '}
              <em className="it">
                seu voo
              </em>
            </h2>
            <p className="lead">
              Opções de 2 e 3 dormitórios, com possibilidade de sala ampliada. Escolha abaixo para visualizar a planta e os detalhes.
            </p>
          </div>
          <div className="plantas__tabs" data-reveal="">
            {TAB_LABELS.map(([label, area], i) => (
              <button
                key={label + area}
                type="button"
                className={'ptab' + (i === plantaIdx ? ' active' : '')}
                aria-pressed={i === plantaIdx}
                onClick={() => setPlantaIdx(i)}
              >
                <b>
                  {label}
                </b>
                <small>
                  {area}
                </small>
              </button>
            ))}
          </div>
          <div className="plantas__panel">
            <div className="plantas__img" data-reveal="scale">
              {planta.img ? (
                <img
                  key={planta.img}
                  id="plantaImg"
                  className="fade-swap"
                  src={planta.img}
                  alt={`Planta ${planta.t} — ${planta.m} m²`}
                />
              ) : (
                /* O material de origem não trouxe esta planta; melhor um aviso
                   honesto do que uma imagem quebrada. Ver IMAGENS-FALTANDO.md. */
                <div className="plantas__note" style={parseStyle('text-align:center;padding:2.4rem 1.2rem')}>
                  Planta de {planta.m} m² disponível sob consulta — fale com um especialista.
                </div>
              )}
            </div>
            <div style={parseStyle('--d:120')} className="plantas__info" data-reveal="" data-d="120">
              <div className="num">
                <span id="plantaNum">
                  {planta.m}
                </span>
                <span style={parseStyle('font-size:1.4rem;color:var(--ink-soft)')}>
                  m²
                </span>
              </div>
              <h3 className="h3" id="plantaTitle">
                {planta.t}
              </h3>
              <p className="muted">
                Ambientes integrados e bem aproveitados, com varanda e estrutura preparada para o seu conforto.
              </p>
              <ul className="plantas__specs" id="plantaSpecs">
                {planta.specs.map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </li>
                ))}
              </ul>
              <div className="plantas__note">
                As paredes em azul da planta podem ser removidas. Estrutura para aquecedor a gás e persianas integradas nos dormitórios. Imagens meramente ilustrativas.
              </div>
              <div style={parseStyle('margin-top:1.6rem')}>
                <a className="btn btn--wa" href={wa('Olá! Gostei das plantas do Maitá Residencial e quero mais informações.')} target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.1.1.3 0 .5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z">
                    </path>
                  </svg>
                  {' '}Solicitar tabela de unidades{' '}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ GALERIA ============ */}
      <section className="sec galeria" id="galeria">
        <div className="wrap">
          <div className="galeria__top">
            <div>
              <span className="eyebrow" data-reveal="">
                Galeria
              </span>
              <h2 style={parseStyle('--d:80;margin-top:1rem')} className="h2" data-reveal="" data-d="80">
                O Maitá em{' '}
                <em className="it">
                  imagens
                </em>
              </h2>
            </div>
            <p style={parseStyle('--d:140;color:rgba(246,242,233,.8)')} className="lead" data-reveal="" data-d="140">
              Perspectivas ilustrativas dos ambientes, áreas comuns e fachada. Clique para ampliar.
            </p>
          </div>
          <div className="ggrid" data-reveal="">
            {GALLERY.map((g, i) => (
              <div
                key={g.src}
                className="gitem"
                data-cap={g.cap}
                role="button"
                tabIndex={0}
                onClick={() => setLbIdx(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLbIdx(i);
                  }
                }}
              >
                <img src={g.src} alt={g.alt} />
                <span className="lbl">
                  {g.lbl}
                </span>
                <span className="plus">
                  +
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ============ LOCALIZAÇÃO ============ */}
      <section className="sec local" id="local">
        <div className="wrap local__grid">
          <div className="local__info">
            <span className="eyebrow" data-reveal="">
              Localização
            </span>
            <h2 style={parseStyle('--d:80;margin:1rem 0')} className="h2" data-reveal="" data-d="80">
              Tudo o que você precisa{' '}
              <em className="it">
                perto do seu lar
              </em>
            </h2>
            <div style={parseStyle('--d:140')} className="local__addr" data-reveal="" data-d="140">
              <span className="pin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z">
                  </path>
                  <circle cx="12" cy="10" r="3">
                  </circle>
                </svg>
              </span>
              <span>
                <strong>
                  Vila Marlene
                </strong>
                {' '}— Jundiaí/SP. Bairro arborizado, em valorização e muito bem conectado.{' '}
                <em className="it">
                  Endereço completo no atendimento.
                </em>
              </span>
            </div>
            <ul style={parseStyle('--d:200')} className="prox" data-reveal="" data-d="200">
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Parque Linear
                <span className="t">
                  1 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Posto de combustível
                <span className="t">
                  1 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Casa de carnes São Judas
                <span className="t">
                  2 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Rodovia Anhanguera
                <span className="t">
                  3 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Mundo das Crianças
                <span className="t">
                  3 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Parque da Cidade
                <span className="t">
                  3 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Av. 9 de Julho
                <span className="t">
                  5 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Rodovia Bandeirantes
                <span className="t">
                  5 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Shopping
                <span className="t">
                  8 min
                </span>
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9">
                    </circle>
                    <polyline points="12 7 12 12 15 14">
                    </polyline>
                  </svg>
                </span>
                Jardim Botânico
                <span className="t">
                  9 min
                </span>
              </li>
            </ul>
          </div>
          <div className="local__map" data-reveal="scale">
            <iframe title="Mapa — região da Vila Marlene, Jundiaí/SP" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Vila%20Marlene%2C%20Jundia%C3%AD%20-%20SP&t=m&z=14&output=embed">
            </iframe>
          </div>
        </div>
      </section>
      {/* ============ CONSTRUTORA ============ */}
      <section className="sec builder" id="construtora">
        <div className="builder__deco" aria-hidden="true">
        </div>
        <div className="wrap builder__grid">
          <div data-reveal="">
            <span className="eyebrow light">
              A construtora
            </span>
            <h2 style={parseStyle('margin:1rem 0 1.4rem')} className="h2">
              Mac Lucer
            </h2>
            <div className="builder__stats">
              <div className="s">
                <b>
                  1993
                </b>
                <span>
                  Início da história
                </span>
              </div>
              <div className="s">
                <b>
                  +200%
                </b>
                <span>
                  Crescimento em vendas
                </span>
              </div>
              <div className="s">
                <b>
                  90%
                </b>
                <span>
                  Altíssimi vendido em
                  <br />
                  um único fim de semana
                </span>
              </div>
            </div>
          </div>
          <div style={parseStyle('--d:120')} data-reveal="" data-d="120">
            <p style={parseStyle('color:rgba(246,242,233,.92)')} className="lead">
              A história da Mac Lucer começou com a visão de futuro de uma família. Em 2014, com o{' '} Residencial Olívio Boa, a construtora entrou definitivamente no mercado imobiliário de Jundiaí e região.
            </p>
            <p>
              Em 2019, o Altíssimi Residencial tornou-se um marco — 90% vendido em um único fim de semana. De lá para cá, a Mac Lucer conquistou um espaço cada vez maior, presente hoje em Jundiaí e nas cidades ao redor.
            </p>
            <div className="seller">
              <span className="badge">
                Japi Lançamentos
              </span>
              <span>
                <small>
                  Comercialização & atendimento
                </small>
                Especialistas em Jundiaí e região
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* ============ CONTATO ============ */}
      <section className="sec cta" id="contato">
        <div className="wrap cta__grid">
          <div data-reveal="">
            <span className="eyebrow light">
              Fale com a Japi Lançamentos
            </span>
            <h2 style={parseStyle('margin:1rem 0 1.2rem')} className="h2">
              Agende sua visita ao{' '}
              <em className="it">
                decorado
              </em>
            </h2>
            <p className="lead">
              Deixe seus dados e um especialista da Japi Lançamentos entra em contato com condições, disponibilidade de unidades e agendamento de visita.
            </p>
            <ul className="cta__perks">
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Atendimento exclusivo e sem compromisso
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Tabela completa de unidades e plantas
              </li>
              <li>
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12">
                    </polyline>
                  </svg>
                </span>
                Visita ao decorado e simulação de financiamento
              </li>
            </ul>
          </div>
          {sent ? (
            <div className="form">
              <div className="form-ok">
                <div className="ck">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>
                  Recebemos o seu interesse!
                </h3>
                <p className="fnote" style={parseStyle('margin:.6rem auto 1.4rem;max-width:34ch')}>
                  Um especialista da Japi Lançamentos vai falar com você. Para agilizar, finalize pelo {' '}WhatsApp{' '}.
                </p>
                <a className="btn btn--wa btn--lg" href={sent} target="_blank" rel="noopener">
                  Continuar no {' '}WhatsApp{' '}
                </a>
              </div>
            </div>
          ) : (
          <form className="form" id="leadForm" noValidate onSubmit={onSubmit}>
            <h3>
              Quero conhecer o Maitá
            </h3>
            <p className="fnote">
              Resposta rápida · seus dados estão seguros.
            </p>
            <div className={'field' + (errs.nome ? ' err' : '')}>
              <input ref={nomeRef} type="text" id="f-nome" placeholder=" " autoComplete="name" />
              <label htmlFor="f-nome">
                Nome completo
              </label>
            </div>
            <div className={'field' + (errs.email ? ' err' : '')}>
              <input ref={emailRef} type="email" id="f-email" placeholder=" " autoComplete="email" />
              <label htmlFor="f-email">
                E-mail
              </label>
            </div>
            <div className={'field' + (errs.tel ? ' err' : '')}>
              <input ref={telRef} type="tel" id="f-tel" placeholder=" " autoComplete="tel" />
              <label htmlFor="f-tel">
                Telefone / {' '}WhatsApp{' '}
              </label>
            </div>
            <label className="consent" style={errs.consent ? parseStyle('color:var(--coral)') : undefined}>
              <input ref={consentRef} type="checkbox" id="f-consent" />
              <span>
                Estou ciente das condições de tratamento dos meus dados pessoais e coleta de cookies ao continuar meu cadastro, conforme a{' '}
                <a href="/lotus-privacidade">
                  Política de Privacidade
                </a>
                .
              </span>
            </label>
            <button type="submit" className="btn btn--gold btn--lg">
              <span className="sheen">
              </span>
              Quero ser contatado
            </button>
            <div className="form__or">
              ou
            </div>
            <a className="btn btn--wa btn--lg" href={wa('Olá! Quero agendar uma visita ao decorado do Maitá Residencial.')} target="_blank" rel="noopener">
              <WaGlyph />
              Falar agora no {' '}WhatsApp{' '}
            </a>
          </form>
          )}
        </div>
      </section>
      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__grid">
            <div>
              <img className="footer__logo" src="/maita/a013.png" alt="Maitá Residencial" />
              <p style={parseStyle('max-width:38ch')}>
                Maitá Residencial — apartamentos de 2 e 3 dormitórios em Jundiaí/SP. Comercialização{' '}
                <strong>
                  Japi Lançamentos
                </strong>
                . Construção Mac Lucer.
              </p>
              <div className="social">
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5">
                    </rect>
                    <circle cx="12" cy="12" r="4">
                    </circle>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none">
                    </circle>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h2.5l.5-3H13v-1.5A1.5 1.5 0 0 1 14.5 9H14Z">
                    </path>
                  </svg>
                </a>
                <a href={wa('Olá! Quero informações sobre o Maitá Residencial.')} target="_blank" rel="noopener" aria-label="{' '}WhatsApp{' '}">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20Z">
                    </path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4>
                Navegação
              </h4>
              <ul>
                <li>
                  <a href="#sobre">
                    O empreendimento
                  </a>
                </li>
                <li>
                  <a href="#lazer">
                    Lazer
                  </a>
                </li>
                <li>
                  <a href="#plantas">
                    Plantas
                  </a>
                </li>
                <li>
                  <a href="#galeria">
                    Galeria
                  </a>
                </li>
                <li>
                  <a href="#local">
                    Localização
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4>
                Atendimento
              </h4>
              <ul>
                <li>
                  <a href={wa('Olá! Quero falar com a Japi Lançamentos sobre o Maitá.')} target="_blank" rel="noopener">
                    {' '}WhatsApp{' '}: (11) 92614-3393
                  </a>
                </li>
                <li>
                  <a href="#contato">
                    Agendar visita
                  </a>
                </li>
              </ul>
              <p style={parseStyle('margin-top:1rem;font-size:.84rem;opacity:.7')}>
                Vila Marlene — Jundiaí/SP. Endereço completo e tour no atendimento.
              </p>
            </div>
          </div>
          <div className="footer__legal">
            <p className="disc">
              O empreendimento só será comercializado após o registro do Memorial de Incorporação no Cartório de Registro de Imóveis, nos termos da Lei nº 4.591/64. Material preliminar, sujeito a alterações sem aviso prévio. Imagens meramente ilustrativas.
            </p>
            <p>
              © 2026 Japi Lançamentos · Maitá Residencial / Mac Lucer.
            </p>
          </div>
        </div>
      </footer>
      {/* Lightbox */}
      <div
        className={'lightbox' + (lbIdx !== null ? ' open' : '')}
        id="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLb();
        }}
      >
        <button className="x" aria-label="Fechar" onClick={closeLb}>
          ×
        </button>
        <button
          className="ar prev"
          aria-label="Anterior"
          onClick={(e) => {
            e.stopPropagation();
            setLbIdx((i) => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
          }}
        >
          ‹
        </button>
        <img
          src={lbIdx !== null ? GALLERY[lbIdx].src : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}
          alt={lbIdx !== null ? GALLERY[lbIdx].alt : ''}
        />
        <button
          className="ar next"
          aria-label="Próxima"
          onClick={(e) => {
            e.stopPropagation();
            setLbIdx((i) => ((i ?? 0) + 1) % GALLERY.length);
          }}
        >
          ›
        </button>
        <div className="lbcap">
          {lbIdx !== null ? GALLERY[lbIdx].cap : ''}
        </div>
      </div>
      {/* {' '}WhatsApp{' '} float */}
      <a className="wafloat" href={wa('Olá! Quero informações sobre o Maitá Residencial em Jundiaí.')} target="_blank" rel="noopener" aria-label="Falar no {' '}WhatsApp{' '}">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c.1.1.1.3 0 .5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1Z">
          </path>
        </svg>
      </a>
    </>
  );
}
