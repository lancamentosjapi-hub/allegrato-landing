'use client';

/**
 * Manawa — porte 1:1 de manawa/index.html (formato CSS-class, NÃO dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Todo o CSS vive em app/manawa/manawa.css
 * (classes/:root/@font-face literais). Este componente reproduz o script a006.js:
 *  - ícones inline (SVG) no lugar dos placeholders {ICON_*}
 *  - links data-wa (WhatsApp) com href/target/rel
 *  - header sticky (.solid ao rolar > 60)
 *  - drawer mobile (abrir/fechar)
 *  - chips de lazer, galeria e fotos de obra renderizadas a partir dos dados
 *  - reveal via IntersectionObserver (.reveal -> .in)
 *  - lightbox (galeria + plantas + obra, mesma ordem do fonte)
 *  - formulário: validação, máscara de telefone BR, tela de sucesso e abertura do WhatsApp
 *  - fallback de imagem (.imgph) quando o <img> falha
 */

import React, { useEffect, useRef, useState } from 'react';
import { sendLead } from '@/lib/lead';

/* ------------------------------------------------------------------ */
/* Constantes (valores exatos do a006.js)                             */
/* ------------------------------------------------------------------ */

const WA_NUMBER = '5511926143393';
const WA_BASE = 'https://api.whatsapp.com/send?phone=' + WA_NUMBER + '&text=';
const GAL_BASE =
  'https://maclucer.com.br/wp-content/uploads/2024/11/1243.1-Mac-Lucer_pagina-empreendimento_Manawa_galeria_';

const WA_MSG = encodeURIComponent(
  'Olá! Tenho interesse no Manawa Residencial em Jundiaí. Pode me enviar mais informações?',
);
const WA_HREF = WA_BASE + WA_MSG;

/* ------------------------------------------------------------------ */
/* Ícones inline (SVG) — do objeto ICONS do a006.js                   */
/* ------------------------------------------------------------------ */

const IconPlan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 3h18v18H3z" />
    <path d="M3 9h6V3M15 21v-6h6M9 3v6h12" />
  </svg>
);
const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5M2 17h20M2 17v3M22 17v3M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
  </svg>
);
const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M5 13l1.5-5A2 2 0 0 1 8.4 6.5h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v5H5zM5 13a2 2 0 0 0-2 2v1h2M19 13a2 2 0 0 1 2 2v1h-2M7 18v2M17 18v2" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 20c8 2 16-4 16-14 0 0-12-2-15 5-1.5 3.5 0 7 3 8z" />
    <path d="M4 20c2-6 6-9 11-11" />
  </svg>
);
const IconFlame = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1.5-4 .5 2 1.5 2.5 2 2.5C9 8 11 5 12 2z" />
  </svg>
);
const IconPin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const IconKey = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="5" />
    <path d="M11.5 11.5L21 21M17 17l2-2M15 19l1.5-1.5" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M5 12l5 5L20 6" />
  </svg>
);
const IconCheckBig = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M5 12l5 5L20 6" />
  </svg>
);
const IconWa = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.985zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);
const IconExpand = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do a006.js)                        */
/* ------------------------------------------------------------------ */

const CHIPS = [
  'Piscina adulto', 'Piscina infantil', 'Piscina coberta', "Espelho d'água", 'Deck',
  'Salão de festas', 'Village Garden', 'Espaço gourmet', 'Churrasqueira', 'Brinquedoteca',
  'Salão de jogos', 'Playground', 'Quadra recreativa', 'Academia', 'Home office',
  'Pet place', 'Lavanderia compartilhada', 'Mini-market',
];

type GalItem = { f: string; c: string; cls: string };
const GAL: GalItem[] = [
  { f: 'piscina', c: 'Piscina adulto e infantil', cls: 'wide' },
  { f: 'piscina-coberta', c: 'Piscina coberta', cls: 'tall' },
  { f: 'academia', c: 'Academia', cls: '' },
  { f: 'salao-de-festas', c: 'Salão de festas', cls: 'wide' },
  { f: 'espaco-gourmet', c: 'Espaço gourmet', cls: '' },
  { f: 'churrasqueira', c: 'Churrasqueira', cls: '' },
  { f: 'coworking', c: 'Home office', cls: 'tall' },
  { f: 'brinquedoteca', c: 'Brinquedoteca', cls: '' },
  { f: 'playground', c: 'Playground', cls: '' },
  { f: 'quadra-poli', c: 'Quadra recreativa', cls: 'wide' },
  { f: 'pet-place', c: 'Pet place', cls: '' },
  { f: 'lavanderia', c: 'Lavanderia compartilhada', cls: '' },
  { f: 'mini-marketing', c: 'Mini-market', cls: '' },
  { f: 'garden', c: 'Village Garden', cls: 'wide' },
];

type LbItem = { src: string; cap: string };
const PLANTAS: LbItem[] = [
  { src: 'assets/plantas/p1-10279.png', cap: '102,79 m² · 3 dormitórios (1 suíte) + escritório · 2 vagas — Torre A' },
  { src: 'assets/plantas/p2-9462.png', cap: '94,62 m² · 3 dormitórios (1 suíte) · 2 vagas — Torre B' },
  { src: 'assets/plantas/p3-7627.png', cap: '76,27 m² · 2 suítes + lavabo · 1 vaga — Torre A' },
  { src: 'assets/plantas/p4-6596.png', cap: '65,96 m² · 2 dormitórios (1 suíte) · 1 vaga — Torre B' },
];

type ObraItem = { u: string; c: string };
const OBRA: ObraItem[] = [
  { u: 'https://maclucer.com.br/wp-content/uploads/2026/05/WhatsApp-Image-2026-04-29-at-08.43.46.jpeg', c: 'Obra Manawa — 05/2026' },
  { u: 'https://maclucer.com.br/wp-content/uploads/2026/05/WhatsApp-Image-2026-04-29-at-08.44.28.jpeg', c: 'Obra Manawa — 05/2026' },
  { u: 'https://maclucer.com.br/wp-content/uploads/2026/05/WhatsApp-Image-2026-04-29-at-08.44.49.jpeg', c: 'Obra Manawa — 05/2026' },
  { u: 'https://maclucer.com.br/wp-content/uploads/2026/02/1.jpg', c: 'Obra Manawa — 02/2026' },
];

/* Ordem do lightbox: galeria (14) -> plantas (4) -> obra (4). Igual ao a006.js. */
const galLbItems: LbItem[] = GAL.map((g) => ({ src: GAL_BASE + g.f + '.jpg', cap: g.c }));
const obraLbItems: LbItem[] = OBRA.map((o) => ({ src: o.u, cap: o.c }));
const LB_ITEMS: LbItem[] = [...galLbItems, ...PLANTAS, ...obraLbItems];
const GAL_OFFSET = 0;
const PLAN_OFFSET = galLbItems.length; // 14
const OBRA_OFFSET = galLbItems.length + PLANTAS.length; // 18

/* ------------------------------------------------------------------ */
/* Imagem com fallback (.imgph) — reproduz attachFallback do a006.js  */
/* ------------------------------------------------------------------ */

function FallbackImg({
  src,
  alt,
  ph,
  className,
}: {
  src: string;
  alt: string;
  ph?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={'imgph ' + (className || '')}
        style={{ width: '100%', height: '100%' }}
      >
        {ph || 'Imagem do empreendimento'}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Manawa() {
  const [solid, setSolid] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbCur, setLbCur] = useState(0);

  const [formSent, setFormSent] = useState(false);
  const [okHref, setOkHref] = useState(WA_HREF);
  const [errNome, setErrNome] = useState(false);
  const [errTel, setErrTel] = useState(false);
  const [errEmail, setErrEmail] = useState(false);
  const [tel, setTel] = useState('');

  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const interesseRef = useRef<HTMLSelectElement>(null);

  /* Header sticky (.solid ao rolar > 60), executa uma vez ao montar. */
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Reveal (.reveal -> .in) via IntersectionObserver, threshold .14. */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Lightbox: trava scroll do body quando aberto + teclas. */
  useEffect(() => {
    document.body.style.overflow = lbOpen ? 'hidden' : '';
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLbOpen(false);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lbOpen]);

  function openLightbox(i: number) {
    setLbCur(i);
    setLbOpen(true);
  }
  function step(d: number) {
    setLbCur((cur) => (cur + d + LB_ITEMS.length) % LB_ITEMS.length);
  }

  /* Máscara de telefone BR (igual ao a006.js). */
  function onTelInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let out = v;
    if (v.length > 6) out = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    else if (v.length > 2) out = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    else if (v.length > 0) out = '(' + v;
    setTel(out);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nome = nomeRef.current!;
    const email = emailRef.current!;
    const consent = consentRef.current!;
    const interesse = interesseRef.current!;
    let ok = true;

    if (!nome.value.trim()) { setErrNome(true); ok = false; } else setErrNome(false);
    if (tel.replace(/\D/g, '').length < 8) { setErrTel(true); ok = false; } else setErrTel(false);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) { setErrEmail(true); ok = false; } else setErrEmail(false);
    if (!consent.checked) { ok = false; }
    if (!ok) return;

    sendLead({
      name: nome.value.trim(),
      phone: tel,
      email: email.value.trim(),
      source: 'landing_manawa',
      interest: 'Manawa Residencial',
      message: interesse.value,
    });

    const msg =
      'Olá! Quero conhecer o *Manawa Residencial* (Jundiaí).%0A%0A' +
      '*Nome:* ' + encodeURIComponent(nome.value.trim()) + '%0A' +
      '*Telefone:* ' + encodeURIComponent(tel.trim()) + '%0A' +
      '*E-mail:* ' + encodeURIComponent(email.value.trim()) + '%0A' +
      '*Interesse:* ' + encodeURIComponent(interesse.value);
    const waUrl = WA_BASE + msg;

    setOkHref(waUrl);
    setFormSent(true);
    window.open(waUrl, '_blank', 'noopener');
  }

  return (
    <>
      {/* ============ HEADER ============ */}
      <header id="header" className={solid ? 'solid' : undefined}>
        <div className="wrap nav">
          <a href="#topo" className="brand" aria-label="Manawa Residencial">
            <span className="pname">
              Manawa<small>Residencial · Jundiaí</small>
            </span>
          </a>
          <nav className="navlinks" aria-label="Navegação principal">
            <a href="#diferenciais">O empreendimento</a>
            <a href="#lazer">Lazer</a>
            <a href="#plantas">Plantas</a>
            <a href="#obra">Obra</a>
            <a href="#localizacao">Localização</a>
          </nav>
          <div className="nav-cta">
            <a href="#contato" className="btn btn-gold">
              Quero conhecer
            </a>
          </div>
          <button
            className="menu-btn"
            id="menuBtn"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={'drawer' + (drawerOpen ? ' open' : '')} id="drawer">
        <button
          className="drawer-close"
          id="drawerClose"
          aria-label="Fechar menu"
          onClick={() => setDrawerOpen(false)}
        >
          ×
        </button>
        <a href="#diferenciais" onClick={() => setDrawerOpen(false)}>O empreendimento</a>
        <a href="#lazer" onClick={() => setDrawerOpen(false)}>Lazer</a>
        <a href="#plantas" onClick={() => setDrawerOpen(false)}>Plantas</a>
        <a href="#obra" onClick={() => setDrawerOpen(false)}>Obra</a>
        <a href="#localizacao" onClick={() => setDrawerOpen(false)}>Localização</a>
        <a href="#contato" className="btn btn-gold" onClick={() => setDrawerOpen(false)}>Quero conhecer</a>
      </div>

      {/* ============ HERO ============ */}
      <section className="hero" id="topo">
        <div className="hero-bg">
          <img src="/manawa/a005.png" alt="Fachada do Manawa Residencial em Jundiaí — duas torres residenciais" />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-card">
            <span className="hero-status">
              <span className="dot"></span>Obras iniciadas · Jundiaí / SP
            </span>
            <h1>
              Viva o <em>agora</em>.<br />Manawa Residencial.
            </h1>
            <p className="hero-sub">
              Conforto, natureza e lazer completo para a sua família, no coração de Jundiaí.
            </p>
            <div className="hero-meta">
              <div><div className="n">65 a 103 m²</div><div className="l">Plantas amplas</div></div>
              <div><div className="n">2 e 3</div><div className="l">Dorms. com suíte</div></div>
              <div><div className="n">+15</div><div className="l">Itens de lazer</div></div>
              <div><div className="n">2 torres</div><div className="l">158 unidades</div></div>
            </div>
            <div className="hero-cta">
              <a href="#contato" className="btn btn-gold">Receber apresentação completa</a>
              <a href={WA_HREF} className="btn btn-ghost" target="_blank" rel="noopener">
                Falar agora no WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="scroll-hint">
          <span>Role</span>
          <span className="bar"></span>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section className="section diff" id="diferenciais">
        <div className="wrap">
          <div className="diff-head reveal">
            <div>
              <span className="eyebrow">O empreendimento</span>
              <h2 className="section-title" style={{ marginTop: '16px' }}>
                Cada detalhe pensado<br />para <span className="accent">viver bem</span>.
              </h2>
            </div>
            <p className="lead">
              Ambientes planejados para maximizar conforto e funcionalidade, com acabamentos de alta
              qualidade e espaços bem distribuídos para toda a família.
            </p>
          </div>
          <div className="diff-grid reveal">
            <div className="diff-card">
              <div className="ic"><IconPlan /></div>
              <h3>65 a 103 m²</h3>
              <p>Plantas de 65,96 a 102,79 m², amplas e versáteis, com possibilidade de integrar sala e varanda.</p>
            </div>
            <div className="diff-card">
              <div className="ic"><IconBed /></div>
              <h3>2 e 3 dormitórios</h3>
              <p>Opções com suíte — e plantas com 2 suítes e lavabo ou 3 dormitórios com escritório.</p>
            </div>
            <div className="diff-card">
              <div className="ic"><IconCar /></div>
              <h3>Vagas 100% cobertas</h3>
              <p>Todas as vagas são cobertas, com infraestrutura de carregamento para carro elétrico.</p>
            </div>
            <div className="diff-card">
              <div className="ic"><IconFlame /></div>
              <h3>Aquecimento a gás</h3>
              <p>Conforto térmico em banheiros e cozinha, com a praticidade do aquecimento a gás.</p>
            </div>
            <div className="diff-card">
              <div className="ic"><IconLeaf /></div>
              <h3>Village Garden</h3>
              <p>Áreas verdes e espaços ao ar livre que aproximam você da natureza, todos os dias.</p>
            </div>
            <div className="diff-card">
              <div className="ic"><IconShield /></div>
              <h3>Construção certificada</h3>
              <p>Edificação em alvenaria estrutural e empresa certificada pelo PBQP-H — qualidade e durabilidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SOBRE ============ */}
      <section className="section about">
        <div className="wrap about-grid">
          <div className="about-img reveal">
            <FallbackImg
              src="https://maclucer.com.br/wp-content/uploads/2024/11/1243.1-Mac-Lucer_pagina-empreendimento_Manawa_projeto.jpg"
              alt="Perspectiva do projeto Manawa Residencial"
              ph="Perspectiva do projeto"
            />
            <div className="frame"></div>
          </div>
          <div className="about-txt reveal">
            <span className="eyebrow">O projeto</span>
            <h2 className="section-title">
              Um novo jeito de<br />morar em <span className="accent">Jundiaí</span>.
            </h2>
            <p>
              Apresentamos o Manawa Residencial, um novo empreendimento em Jundiaí, onde o conforto, a
              tranquilidade e a beleza são um privilégio. Os ambientes são planejados para maximizar o
              conforto e a funcionalidade, permitindo que você e sua família desfrutem de espaços bem
              distribuídos e acabamentos de alta qualidade.
            </p>
            <p>
              Áreas de lazer e infraestrutura completas: espaços para relaxamento e atividades ao ar
              livre, piscinas, áreas de jogos e muito mais. Um condomínio de 2 torres e 158 unidades, em
              terreno de 6.490,90 m². Venha conhecer o Manawa Residencial — o prazer de viver o agora.
            </p>
            <div className="about-sign">Manawa · viver o agora</div>
          </div>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section className="section lazer" id="lazer">
        <div className="wrap">
          <div className="lazer-head reveal">
            <span className="eyebrow center">Lazer completo</span>
            <h2 className="section-title">
              Mais de 15 itens de lazer<br />para todas as idades.
            </h2>
            <div className="lazer-chips" id="lazerChips">
              {CHIPS.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          </div>
          <div className="gal reveal" id="gallery" style={{ gridAutoFlow: 'dense' }}>
            {GAL.map((g, i) => (
              <figure
                key={i}
                className={g.cls || undefined}
                onClick={() => openLightbox(GAL_OFFSET + i)}
              >
                <FallbackImg
                  src={GAL_BASE + g.f + '.jpg'}
                  alt={g.c + ' — Manawa Residencial'}
                  ph={g.c}
                />
                <figcaption>{g.c}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section className="section plantas" id="plantas">
        <div className="wrap">
          <div className="diff-head reveal" style={{ marginBottom: '50px' }}>
            <div>
              <span className="eyebrow">Plantas</span>
              <h2 className="section-title" style={{ marginTop: '16px' }}>
                Encontre a metragem<br />ideal para <span className="accent">você</span>.
              </h2>
            </div>
            <p className="lead">
              Apartamentos de 65,96 a 102,79 m², com opções de 2 e 3 dormitórios. Clique em uma planta
              para ampliar — e solicite a tabela completa com a nossa equipe.
            </p>
          </div>
          <div className="plan-figs reveal">
            <figure className="plan-fig" data-plan="0" onClick={() => openLightbox(PLAN_OFFSET + 0)}>
              <div className="plan-fig-img">
                <img src="/manawa/a002.png" alt="Planta 102,79 m² — 3 dormitórios com suíte e escritório, Torre A, Manawa Residencial" />
              </div>
              <figcaption>
                <div className="pf-m">102,79 m²</div>
                <div className="pf-d">3 dormitórios · 1 suíte · escritório · 2 vagas — Torre A</div>
                <span className="pf-zoom"><IconExpand /> Ampliar planta</span>
              </figcaption>
            </figure>
            <figure className="plan-fig" data-plan="1" onClick={() => openLightbox(PLAN_OFFSET + 1)}>
              <div className="plan-fig-img">
                <img src="/manawa/a000.png" alt="Planta 94,62 m² — 3 dormitórios com suíte, Torre B, Manawa Residencial" />
              </div>
              <figcaption>
                <div className="pf-m">94,62 m²</div>
                <div className="pf-d">3 dormitórios · 1 suíte · 2 vagas — Torre B</div>
                <span className="pf-zoom"><IconExpand /> Ampliar planta</span>
              </figcaption>
            </figure>
            <figure className="plan-fig" data-plan="2" onClick={() => openLightbox(PLAN_OFFSET + 2)}>
              <div className="plan-fig-img">
                <img src="/manawa/a001.png" alt="Planta 76,27 m² — 2 suítes com lavabo, Torre A, Manawa Residencial" />
              </div>
              <figcaption>
                <div className="pf-m">76,27 m²</div>
                <div className="pf-d">2 suítes · lavabo · 1 vaga — Torre A</div>
                <span className="pf-zoom"><IconExpand /> Ampliar planta</span>
              </figcaption>
            </figure>
            <figure className="plan-fig" data-plan="3" onClick={() => openLightbox(PLAN_OFFSET + 3)}>
              <div className="plan-fig-img">
                <img src="/manawa/a004.png" alt="Planta 65,96 m² — 2 dormitórios com suíte, Torre B, Manawa Residencial" />
              </div>
              <figcaption>
                <div className="pf-m">65,96 m²</div>
                <div className="pf-d">2 dormitórios · 1 suíte · 1 vaga — Torre B</div>
                <span className="pf-zoom"><IconExpand /> Ampliar planta</span>
              </figcaption>
            </figure>
          </div>
          <div className="plan-cta-bar reveal">
            <div>
              <h3>Receba a tabela completa de unidades</h3>
              <p>Plantas detalhadas, disponibilidade e condições do Manawa Residencial direto com um corretor.</p>
            </div>
            <div className="plan-cta-actions">
              <a href="#contato" className="btn btn-gold">Solicitar tabela</a>
              <a href={WA_HREF} className="btn btn-line" target="_blank" rel="noopener">WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ OBRA ============ */}
      <section className="section obra" id="obra">
        <div className="wrap">
          <div className="obra-grid">
            <div className="reveal">
              <span className="eyebrow">Andamento da obra</span>
              <h2 className="section-title" style={{ margin: '16px 0 14px' }}>
                Obras em<br /><span className="accent">andamento</span>.
              </h2>
              <p className="lead" style={{ marginBottom: '34px' }}>
                Projeto aprovado e registrado. Acompanhe a evolução do seu futuro lar com total transparência.
              </p>
              <div className="timeline">
                <div className="tl-item">
                  <div className="tl-dot done"></div>
                  <div className="tl-body"><b>Registro de Incorporação R3</b><span>Registrado em 13 de maio de 2024.</span></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot done"></div>
                  <div className="tl-body"><b>Projeto aprovado na Prefeitura</b><span>Alvará de Execução de Obra SAEPRO nº 151/2024 — Jundiaí.</span></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot done"></div>
                  <div className="tl-body"><b>Obras em execução</b><span>Construção em alvenaria estrutural, em andamento no canteiro.</span></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot"></div>
                  <div className="tl-body"><b>Entrega</b><span>Consulte a previsão atualizada com a nossa equipe.</span></div>
                </div>
              </div>
              <div className="obra-stamp">
                <span className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green-deep)' }}></span>Obras em andamento
              </div>
            </div>
            <div className="obra-photos reveal" id="obraPhotos">
              {OBRA.map((o, i) => (
                <figure key={i} onClick={() => openLightbox(OBRA_OFFSET + i)}>
                  <FallbackImg src={o.u} alt={o.c} ph={o.c} />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZACAO ============ */}
      <section className="section local" id="localizacao">
        <div className="wrap">
          <div className="local-grid reveal">
            <div className="local-info">
              <span className="eyebrow">Localização</span>
              <h2>No coração de<br />Jundiaí.</h2>
              <div className="addr">
                <span className="ic"><IconPin /></span>
                <div>
                  <b>Empreendimento</b>
                  <span>Rua Aristides Mariotti, 336<br />Recanto Quarto Centenário · Jundiaí / SP · 13211-740</span>
                </div>
              </div>
              <div className="addr">
                <span className="ic"><IconKey /></span>
                <div>
                  <b>Decorado &amp; Plantão de Vendas</b>
                  <span>Rua Olívio Boa, 270 · Parque da Represa<br />Jundiaí / SP</span>
                </div>
              </div>
              <a
                href="https://maps.google.com/maps?q=R.%20Aristides%20Mariotti%2C%20336%20-%20Recanto%20Quarto%20Centenario%2C%20Jundia%C3%AD%20-%20SP%2C%2013211-740"
                target="_blank"
                rel="noopener"
                className="btn btn-gold"
                style={{ marginTop: '14px' }}
              >
                Ver rotas no mapa
              </a>
            </div>
            <div className="local-map">
              <iframe
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa Manawa Residencial"
                src="https://maps.google.com/maps?q=R.%20Aristides%20Mariotti%2C%20336%20-%20Recanto%20Quarto%20Centenario%2C%20Jundia%C3%AD%20-%20SP%2C%2013211-740&t=m&z=15&output=embed&iwloc=near"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROVA SOCIAL ============ */}
      <section className="section builder">
        <div className="wrap builder-grid">
          <div className="builder-txt reveal">
            <span className="eyebrow">Quem constrói</span>
            <h2 className="section-title">
              Realização<br /><span className="accent">MacLucer</span>.
            </h2>
            <p>
              O Manawa Residencial é realização da MacLucer Empreendimentos, construtora com forte
              atuação em Jundiaí e região, reconhecida pela qualidade e pelo compromisso com cada entrega.
            </p>
            <p>
              A comercialização conta com atendimento próximo, transparente e dedicado a encontrar
              o imóvel ideal para a sua família.
            </p>
            <div className="builder-stats">
              <div className="s"><div className="n">158</div><div className="l">Unidades em 2 torres</div></div>
              <div className="s"><div className="n">+15</div><div className="l">Itens de lazer</div></div>
              <div className="s"><div className="n">6.490 m²</div><div className="l">Área do terreno</div></div>
            </div>
          </div>
          <div className="builder-img reveal">
            <FallbackImg
              src="https://maclucer.com.br/wp-content/uploads/2024/11/1243.1-Mac-Lucer_pagina-empreendimento_Manawa_familia-1024x683.jpg"
              alt="Família no Manawa Residencial"
              ph="Família · Manawa"
            />
          </div>
        </div>
      </section>

      {/* ============ CONTATO ============ */}
      <section className="section contact" id="contato">
        <div className="wrap contact-grid">
          <div className="contact-txt reveal">
            <span className="eyebrow">Fale com a JAPI</span>
            <h2>Agende sua visita<br />ao decorado.</h2>
            <p>
              Preencha o formulário e nossa equipe entra em contato com plantas, condições e
              disponibilidade de unidades do Manawa Residencial.
            </p>
            <ul className="contact-perks">
              <li><span className="ic"><IconCheck /></span> Atendimento exclusivo e sem compromisso</li>
              <li><span className="ic"><IconCheck /></span> Plantas e tabela de unidades disponíveis</li>
              <li><span className="ic"><IconCheck /></span> Visita guiada ao decorado em Jundiaí</li>
            </ul>
          </div>
          <div className="form-card reveal">
            <form id="leadForm" noValidate onSubmit={onSubmit} style={{ display: formSent ? 'none' : undefined }}>
              <h3>Quero conhecer o Manawa</h3>
              <p className="fsub">Resposta rápida pela nossa equipe.</p>
              <div className={'field' + (errNome ? ' err' : '')}>
                <label htmlFor="nome">Nome completo</label>
                <input ref={nomeRef} type="text" id="nome" name="nome" placeholder="Seu nome" required />
              </div>
              <div className="row2">
                <div className={'field' + (errTel ? ' err' : '')}>
                  <label htmlFor="tel">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    id="tel"
                    name="tel"
                    placeholder="(11) 90000-0000"
                    required
                    value={tel}
                    onChange={onTelInput}
                  />
                </div>
                <div className={'field' + (errEmail ? ' err' : '')}>
                  <label htmlFor="email">E-mail</label>
                  <input ref={emailRef} type="email" id="email" name="email" placeholder="voce@email.com" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="interesse">Tenho interesse em</label>
                <select ref={interesseRef} id="interesse" name="interesse" defaultValue="2 dormitórios (65 m²)">
                  <option value="2 dormitórios (65 m²)">2 dormitórios — 65 m²</option>
                  <option value="3 dormitórios">3 dormitórios — a partir de 84 m²</option>
                  <option value="3 dormitórios ampliado (102 m²)">3 dormitórios ampliado — 102 m²</option>
                  <option value="Ainda estou decidindo">Ainda estou decidindo</option>
                </select>
              </div>
              <label className="consent">
                <input ref={consentRef} type="checkbox" id="consent" required />
                <span>
                  Estou ciente das condições de tratamento dos meus dados pessoais e coleta de cookies,
                  conforme a Política de Privacidade.
                </span>
              </label>
              <button type="submit" className="btn btn-gold">Enviar e falar com a equipe</button>
              <p className="form-note">Ao enviar, você será direcionado ao nosso WhatsApp com a mensagem pronta.</p>
            </form>
            <div className="form-ok" id="formOk" style={{ display: formSent ? 'block' : undefined }}>
              <div className="check"><IconCheckBig /></div>
              <h3>Recebido! 🎉</h3>
              <p>Estamos te direcionando ao WhatsApp para concluir o atendimento.</p>
              <a href={okHref} className="btn btn-wa" target="_blank" rel="noopener">Abrir WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <p>
                Atendimento dedicado para encontrar o imóvel ideal da sua família em Jundiaí e
                região. Comercialização do Manawa Residencial, realização MacLucer.
              </p>
            </div>
            <div className="foot-col">
              <h4>Empreendimento</h4>
              <a href="#diferenciais">O empreendimento</a>
              <a href="#lazer">Lazer completo</a>
              <a href="#plantas">Plantas</a>
              <a href="#obra">Andamento da obra</a>
              <a href="#localizacao">Localização</a>
            </div>
            <div className="foot-col">
              <h4>Atendimento</h4>
              <a href={WA_HREF} target="_blank" rel="noopener">WhatsApp: (11) 92614-3393</a>
              <a href="#contato">Agendar visita ao decorado</a>
              <p>Rua Aristides Mariotti, 336<br />Recanto Quarto Centenário<br />Jundiaí / SP</p>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Manawa Residencial. Todos os direitos reservados. Imagens meramente ilustrativas.</span>
            <div className="cob">
              <span>Realização</span> <strong style={{ color: '#fff' }}>MacLucer Empreendimentos</strong>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a className="wa-float" href={WA_HREF} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <span className="ico"><IconWa /></span>
        <span className="lbl">Fale com a JAPI</span>
      </a>

      {/* Lightbox */}
      <div
        className={'lightbox' + (lbOpen ? ' open' : '')}
        id="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) setLbOpen(false);
        }}
      >
        <button className="lb-close" id="lbClose" aria-label="Fechar" onClick={() => setLbOpen(false)}>×</button>
        <button className="lb-nav prev" id="lbPrev" aria-label="Anterior" onClick={() => step(-1)}>‹</button>
        <img id="lbImg" alt={LB_ITEMS[lbCur].cap} src={LB_ITEMS[lbCur].src} referrerPolicy="no-referrer" />
        <div className="lb-cap" id="lbCap">{LB_ITEMS[lbCur].cap}</div>
        <button className="lb-nav next" id="lbNext" aria-label="Próxima" onClick={() => step(1)}>›</button>
      </div>
    </>
  );
}
