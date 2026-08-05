'use client';

/**
 * Odeon Residencial (Portal do Paraíso II) — porte 1:1 de "Odeon Residencial -
 * Landing Page.html" (mecanismo dc-runtime) para React.
 * CSS em app/odeon/odeon.css, assets em public/odeon.
 *
 * O `renderVals()` do fonte vira os valores derivados abaixo: abas de planta,
 * filtro do decorado, carrossel com thumbs, lightbox e formulário.
 *
 * Diferença consciente: o fonte lia o número do WhatsApp de `props.whatsapp`,
 * que vinha vazio (gerava wa.me sem destino). Aqui usa o número do portal.
 */

import React, { useEffect, useState, type CSSProperties } from 'react';
import { Hoverable, parseStyle, waHref } from '@/lib/dc-runtime';

const WA_NUMBER = '5511926143393';
const buildWhats = (text?: string) =>
  waHref(WA_NUMBER, text || 'Olá! Tenho interesse no Odeon Residencial em Jundiaí.');

const LAZER_LISTA = [
  'Piscina coberta com hidro', 'Piscina adulto e infantil', 'Sauna e sala de descanso',
  'Academia com pilates', 'Sala de yoga', 'Sportbar', 'Coworking',
  'Churrasqueira com chopeira', 'Salão de festas com chopeira', 'Brinquedoteca',
  'Playground', 'Quadra recreativa', 'Praça Odeon', 'Espaço Pet',
];

const DIF_TEXTOS = [
  'Piso porcelanato e azulejo até o teto nas áreas frias',
  'Integração entre cozinha e varanda gourmet com exaustão para churrasqueira',
  'Aquecimento a gás na pia da cozinha e nos chuveiros ³',
  'Ponto de gás para cozinha em ilha',
  'Pia da cozinha entregue com cuba dupla',
  'Bancadas estendidas dos banheiros em prime branco',
  'Possibilidade de ar condicionado na sala e dormitórios ²',
  'Possibilidade de automação ¹',
  'Possibilidade de alteração do lavabo para escritório',
  'Possibilidade de alteração do dormitório para sala ampliada',
  'Janela persiana da suíte com dimensões diferenciadas',
  'Áreas de lazer decoradas e equipadas',
];

const PLANTAS = {
  '95': {
    img: '/odeon/a009.jpg',
    alt: 'Planta do apartamento de 95,85 m² — apto. + box: 100 m²',
    area: '95,85',
    sub: 'Apto. + box: 100 m²',
    features: [
      'Suíte + dormitório + sala ampliada ou 3º dormitório',
      'Varanda gourmet integrada à cozinha',
      'Sala de estar e jantar integradas',
      'Dois banheiros + banho da suíte',
      'Cozinha com bancada e cuba dupla',
    ],
  },
  '112': {
    img: '/odeon/a003.jpg',
    alt: 'Planta do apartamento de 112,3 m² — apto. + box: 116 m²',
    area: '112,3',
    sub: 'Apto. + box: 116 m²',
    features: [
      'Suíte com closet + 2 dormitórios',
      'Lavabo com opção de escritório',
      'Varanda gourmet ampla integrada à cozinha',
      'Sala de estar e jantar integradas',
      'Cozinha com ilha e cuba dupla',
    ],
  },
} as const;

// Fotos do decorado: ids do `window.__resources` resolvidos pelo ext_resources
// do bundle (ver scratchpad/odeon/resources.json).
const GALERIA: Array<{ src: string; label: string; unidade: string; un: string }> = [
  { src: '/odeon/a012.jpg', label: 'Sala de estar', unidade: '95,85 m²', un: '95' },
  { src: '/odeon/a017.jpg', label: 'Sala de jantar', unidade: '95,85 m²', un: '95' },
  { src: '/odeon/a014.jpg', label: 'Suíte', unidade: '95,85 m²', un: '95' },
  { src: '/odeon/a015.jpg', label: 'Dormitório', unidade: '95,85 m²', un: '95' },
  { src: '/odeon/a020.jpg', label: 'Varanda gourmet', unidade: '95,85 m²', un: '95' },
  { src: '/odeon/a016.jpg', label: 'Cozinha e living', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a018.jpg', label: 'Sala de estar', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a019.jpg', label: 'Sala de jantar', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a004.jpg', label: 'Cozinha', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a006.jpg', label: 'Suíte', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a013.jpg', label: 'Dormitório', unidade: '112,3 m²', un: '112' },
  { src: '/odeon/a007.jpg', label: 'Varanda gourmet', unidade: '112,3 m²', un: '112' },
];

const PLANTAS_LB = [
  { src: PLANTAS['95'].img, alt: PLANTAS['95'].alt },
  { src: PLANTAS['112'].img, alt: PLANTAS['112'].alt },
];

const navLinkStyle: CSSProperties = {
  color: '#2E3B4E',
  textDecoration: 'none',
  fontSize: '14.5px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  transition: 'color .25s',
};

const thumbWrapStyle: CSSProperties = {
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  flex: '0 0 auto',
};

type LbItem = { src: string; alt: string };

export default function Odeon() {
  const [scrolled, setScrolled] = useState(false);
  const [planta, setPlanta] = useState<'95' | '112'>('95');
  const [filtro, setFiltro] = useState<'todos' | '95' | '112'>('todos');
  const [carIndexRaw, setCarIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ list: LbItem[]; index: number } | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [interesse, setInteresse] = useState('Tenho interesse no Odeon');
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Reveal do fonte: esconde só o que está fora da viewport (fail-safe), com
     revelação forçada em 2,5 s caso o IO nunca dispare. */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!els.length) return;
    const reveal = (el: HTMLElement) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    };
    if (typeof IntersectionObserver !== 'function') {
      els.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    );
    const timers: number[] = [];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) continue;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition =
        'opacity .9s cubic-bezier(.2,.6,.2,1), transform .9s cubic-bezier(.2,.6,.2,1)';
      io.observe(el);
      timers.push(window.setTimeout(() => reveal(el), 2500));
    }
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const dark = scrolled;
  const headerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    background: dark ? 'rgba(244,240,233,.92)' : 'transparent',
    backdropFilter: dark ? 'blur(14px)' : 'none',
    borderBottom: dark ? '1px solid rgba(46,59,78,.12)' : '1px solid transparent',
    transition: 'background .35s, border-color .35s',
  };
  const logoMainStyle: CSSProperties = {
    color: '#2E3B4E',
    fontSize: '26px',
    fontWeight: 300,
    letterSpacing: '0.42em',
    transition: 'color .35s',
  };
  const logoSubStyle: CSSProperties = {
    color: '#C08A4E',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.3em',
    marginTop: '6px',
    transition: 'color .35s',
  };

  const diferenciais = DIF_TEXTOS.map((texto, i) => ({
    num: String(i + 1).padStart(2, '0'),
    texto,
  }));

  const P = PLANTAS[planta];
  const plantaArea = P.area;
  const plantaSubtitulo = P.sub;
  const plantaFeatures = P.features;
  const planta95Ativa = planta === '95';
  const planta112Ativa = planta === '112';
  const verPlanta95 = () => setPlanta('95');
  const verPlanta112 = () => setPlanta('112');

  const filtroTodosAtivo = filtro === 'todos';
  const filtroTodosInativo = !filtroTodosAtivo;
  const filtro95Ativo = filtro === '95';
  const filtro95Inativo = !filtro95Ativo;
  const filtro112Ativo = filtro === '112';
  const filtro112Inativo = !filtro112Ativo;
  const filtrarTodos = () => {
    setFiltro('todos');
    setCarIndex(0);
  };
  const filtrar95 = () => {
    setFiltro('95');
    setCarIndex(0);
  };
  const filtrar112 = () => {
    setFiltro('112');
    setCarIndex(0);
  };

  const visiveis = GALERIA.filter((g) => filtro === 'todos' || g.un === filtro).map((g) => ({
    ...g,
    alt: `Foto do decorado de ${g.unidade} — ${g.label}`,
  }));
  const carIndex = Math.min(carIndexRaw, visiveis.length - 1);
  const carItem = visiveis[carIndex];
  const galeriaVisivel = visiveis.map((g, i) => ({
    ...g,
    ativa: i === carIndex,
    inativa: i !== carIndex,
    thumbWrapStyle,
    selecionar: () => setCarIndex(i),
  }));
  const carMove = (d: number) => setCarIndex((carIndex + d + visiveis.length) % visiveis.length);

  const abrirLb = (list: LbItem[], index: number) => setLightbox({ list, index });
  const lbMove = (d: number, e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    setLightbox((lb) =>
      lb ? { list: lb.list, index: (lb.index + d + lb.list.length) % lb.list.length } : lb,
    );
  };

  const marquee = LAZER_LISTA.concat(['Jundiaí · SP', 'Varanda gourmet', '95,85 m²', '112,3 m²']);
  const marqueeDupla = marquee.concat(marquee);
  const lazerLista = LAZER_LISTA;

  const carouselImgNode = carItem ? (
    <img
      key={carItem.src}
      src={carItem.src}
      alt={carItem.alt}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        animation: 'odn-fadeup .5s ease both',
      }}
    />
  ) : null;
  const carLabel = carItem ? carItem.label : '';
  const carUnidade = carItem ? carItem.unidade : '';
  const carContador = carItem ? `${carIndex + 1} / ${visiveis.length}` : '';
  const carAnterior = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    carMove(-1);
  };
  const carProxima = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    carMove(1);
  };
  const carTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0]?.clientX ?? null);
  const swipe = (e: React.TouchEvent, move: (d: number) => void) => {
    if (touchX == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
    setTouchX(null);
    if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1);
  };
  const carTouchEnd = (e: React.TouchEvent) => swipe(e, carMove);
  const lbTouchEnd = (e: React.TouchEvent) => swipe(e, (d) => lbMove(d, e));

  const abrirCarrosselLightbox = () =>
    abrirLb(visiveis.map((g) => ({ src: g.src, alt: g.alt })), carIndex);
  const abrirPlantaLightbox = () => abrirLb(PLANTAS_LB, planta === '95' ? 0 : 1);
  const lightboxAberto = !!lightbox;
  const lightboxImgNode = lightbox ? (
    <img
      key={lightbox.list[lightbox.index].src}
      src={lightbox.list[lightbox.index].src}
      alt={lightbox.list[lightbox.index].alt}
      style={{
        width: '100%',
        maxHeight: '78vh',
        objectFit: 'contain',
        borderRadius: '3px',
        boxShadow: '0 40px 80px rgba(0,0,0,.5)',
      }}
    />
  ) : null;
  const lightboxAlt = lightbox ? lightbox.list[lightbox.index].alt : '';
  const lightboxContador = lightbox ? `${lightbox.index + 1} / ${lightbox.list.length}` : '';
  const lbAnterior = (e: React.SyntheticEvent) => lbMove(-1, e);
  const lbProxima = (e: React.SyntheticEvent) => lbMove(1, e);
  const fecharLightbox = () => setLightbox(null);

  const formNome = nome;
  const formTelefone = telefone;
  const formInteresse = interesse;
  const setNomeEv = (e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value);
  const setTelefoneEv = (e: React.ChangeEvent<HTMLInputElement>) => setTelefone(e.target.value);
  const setInteresseEv = (e: React.ChangeEvent<HTMLSelectElement>) => setInteresse(e.target.value);
  const enviarForm = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = `Olá! Sou ${nome} (${telefone}). ${interesse} — Odeon Residencial, Jundiaí.`;
    window.open(buildWhats(txt), '_blank', 'noopener');
  };
  const ctaClick = () => {};
  const whatsHref = buildWhats();

  return (
    <>
      <div style={parseStyle("font-family: 'Hanken Grotesk', sans-serif; color: #22293A; background: #F4F0E9; overflow-x: clip;")}>
        {/* ============ HEADER ============ */}
        <header style={headerStyle} data-screen-label="Header">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px; height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 24px;')}>
            <a style={parseStyle('text-decoration: none; display: flex; flex-direction: column; line-height: 1;')} href="#topo">
              <span style={logoMainStyle}>
                ODEON
              </span>
              <span style={logoSubStyle}>
                PORTAL DO PARAÍSO II · JUNDIAÍ
              </span>
            </a>
            <nav style={parseStyle('display: flex; align-items: center; gap: 30px;')}>
              <Hoverable as="a" baseStyle={navLinkStyle} hoverStyle={{ color: '#C08A4E' }} href="#lazer">
                Lazer
              </Hoverable>
              <Hoverable as="a" baseStyle={navLinkStyle} hoverStyle={{ color: '#C08A4E' }} href="#diferenciais">
                Diferenciais
              </Hoverable>
              <Hoverable as="a" baseStyle={navLinkStyle} hoverStyle={{ color: '#C08A4E' }} href="#plantas">
                Plantas
              </Hoverable>
              <Hoverable as="a" baseStyle={navLinkStyle} hoverStyle={{ color: '#C08A4E' }} href="#decorado">
                Decorado
              </Hoverable>
              <Hoverable as="a" baseStyle={navLinkStyle} hoverStyle={{ color: '#C08A4E' }} href="#localizacao">
                Localização
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('background: #C08A4E; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 12px 22px; border-radius: 2px; transition: background .25s;')} hoverStyle={{ background: '#2E3B4E' }} href="#contato" onClick={ctaClick}>
                Agendar visita
              </Hoverable>
            </nav>
          </div>
        </header>
        {/* ============ HERO ============ */}
        <section style={parseStyle('position: relative; min-height: 100svh; background: #F4F0E9; display: flex; flex-direction: column; overflow: hidden;')} id="topo" data-screen-label="Hero">
          <div style={parseStyle('max-width: 1080px; margin: 0 auto; box-sizing: border-box; width: 100%; padding: 118px 28px 0; text-align: center; animation: odn-fadeup .9s .15s cubic-bezier(.2,.6,.2,1) both;')}>
            <p style={parseStyle('margin: 0 0 18px; color: #C08A4E; font-size: 12.5px; font-weight: 700; letter-spacing: 0.34em; text-transform: uppercase;')}>
              Jundiaí · SP — Portal do Paraíso II
            </p>
            <h1 style={parseStyle('margin: 0; color: #2E3B4E; font-size: clamp(44px, 5.6vw, 84px); font-weight: 300; line-height: 1.02; letter-spacing: -0.015em; text-wrap: balance;')}>
              Relaxe, respire e{' '}
              <em style={parseStyle('font-style: normal; font-weight: 600; color: #C08A4E;')}>
                contemple.
              </em>
            </h1>
            <p style={parseStyle('margin: 18px auto 0; color: #5A6272; font-size: clamp(16px, 1.4vw, 19px); font-weight: 300; line-height: 1.6; max-width: 620px;')}>
              Odeon Residencial. Apartamentos de{' '}
              <strong style={parseStyle('font-weight: 600; color: #2E3B4E;')}>
                95,85 m²
              </strong>
              {' '}e{' '}
              <strong style={parseStyle('font-weight: 600; color: #2E3B4E;')}>
                112,3 m²
              </strong>
              {' '}com varanda gourmet integrada e 14 áreas de lazer decoradas e equipadas.
            </p>
          </div>
          <div style={parseStyle('position: relative; z-index: 2; max-width: 1020px; margin: 34px auto -66px; width: calc(100% - 56px); background: rgba(255,255,255,.94); backdrop-filter: blur(8px); border-radius: 3px; box-shadow: 0 30px 60px rgba(30,39,56,.18); display: grid; grid-template-columns: repeat(4, 1fr); animation: odn-fadeup .9s .45s cubic-bezier(.2,.6,.2,1) both;')}>
            <div style={parseStyle('padding: 26px 28px; border-right: 1px solid #ECE5D8;')}>
              <div style={parseStyle('color: #2E3B4E; font-size: clamp(22px, 2vw, 28px); font-weight: 300;')}>
                95–112{' '}
                <span style={parseStyle('font-size: 14px; color: #C08A4E;')}>
                  m²
                </span>
              </div>
              <div style={parseStyle('color: #8A8F9B; font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 5px;')}>
                Duas plantas
              </div>
            </div>
            <div style={parseStyle('padding: 26px 28px; border-right: 1px solid #ECE5D8;')}>
              <div style={parseStyle('color: #2E3B4E; font-size: clamp(22px, 2vw, 28px); font-weight: 300;')}>
                Até 3{' '}
                <span style={parseStyle('font-size: 14px; color: #C08A4E;')}>
                  dorms
                </span>
              </div>
              <div style={parseStyle('color: #8A8F9B; font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 5px;')}>
                Com suíte
              </div>
            </div>
            <div style={parseStyle('padding: 26px 28px; border-right: 1px solid #ECE5D8;')}>
              <div style={parseStyle('color: #2E3B4E; font-size: clamp(22px, 2vw, 28px); font-weight: 300;')}>
                14{' '}
                <span style={parseStyle('font-size: 14px; color: #C08A4E;')}>
                  espaços
                </span>
              </div>
              <div style={parseStyle('color: #8A8F9B; font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 5px;')}>
                Lazer equipado
              </div>
            </div>
            <div style={parseStyle('padding: 26px 28px;')}>
              <div style={parseStyle('color: #2E3B4E; font-size: clamp(22px, 2vw, 28px); font-weight: 300;')}>
                Gourmet
              </div>
              <div style={parseStyle('color: #8A8F9B; font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 5px;')}>
                Varanda integrada
              </div>
            </div>
          </div>
          <div style={parseStyle('position: relative; flex: 1; min-height: clamp(420px, 54svh, 640px); overflow: hidden;')}>
            <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 62%; animation: odn-heroken 2.8s cubic-bezier(.2,.6,.2,1) both;')} src="/odeon/a008.jpg" alt="Perspectiva artística do lounge externo do Odeon Residencial ao entardecer" />
            <div style={parseStyle('position: absolute; inset: 0; background: linear-gradient(180deg, rgba(30,39,56,0) 55%, rgba(30,39,56,.55) 100%);')}>
            </div>
            <div style={parseStyle('position: absolute; left: 0; right: 0; bottom: 48px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; animation: odn-fadeup .9s .6s cubic-bezier(.2,.6,.2,1) both;')}>
              <Hoverable as="a" baseStyle={parseStyle('background: #C08A4E; color: #fff; text-decoration: none; font-size: 14.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 17px 34px; border-radius: 2px; box-shadow: 0 14px 34px rgba(0,0,0,.3); transition: transform .25s, background .25s;')} hoverStyle={{ background: '#B07A3E', transform: 'translateY(-2px)' }} href="#contato" onClick={ctaClick}>
                Quero conhecer
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('border: 1px solid rgba(255,255,255,.65); color: #fff; background: rgba(30,39,56,.25); backdrop-filter: blur(6px); text-decoration: none; font-size: 14.5px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 17px 34px; border-radius: 2px; transition: border-color .25s, background .25s;')} hoverStyle={{ background: 'rgba(30,39,56,.5)', borderColor: '#fff' }} href="#plantas">
                Ver plantas
              </Hoverable>
            </div>
            <p style={parseStyle('position: absolute; right: 20px; bottom: 14px; margin: 0; color: rgba(255,255,255,.6); font-size: 11px;')}>
              Perspectiva artística do lounge externo
            </p>
          </div>
        </section>
        {/* ============ MARQUEE ============ */}
        <div style={parseStyle('background: #2E3B4E; border-top: 1px solid rgba(255,255,255,.08); overflow: hidden; padding: 18px 0;')} aria-hidden="true">
          <div style={parseStyle('display: flex; width: max-content; animation: odn-marquee 42s linear infinite;')}>
            {marqueeDupla.map((mi, i) => (<React.Fragment key={i}>
              <span style={parseStyle('display: flex; align-items: center; gap: 26px; padding-right: 26px; white-space: nowrap;')}>
                <span style={parseStyle('color: #C99B5F; font-size: 12px;')}>
                  ◆
                </span>
                <span style={parseStyle('color: rgba(255,255,255,.75); font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 500;')}>
                  {mi}
                </span>
              </span>
            </React.Fragment>))}
          </div>
        </div>
        {/* ============ LAZER ============ */}
        <section style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 110px 28px 90px;')} id="lazer" data-screen-label="Lazer">
          <div style={parseStyle('display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px; align-items: end; margin-bottom: 54px;')} data-reveal="true">
            <div>
              <p style={parseStyle('margin: 0 0 12px; color: #C08A4E; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                Áreas de lazer
              </p>
              <h2 style={parseStyle('margin: 0; font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.08; color: #22293A; letter-spacing: -0.01em; text-wrap: balance;')}>
                14 espaços decorados{' '}
                <em style={parseStyle('font-style: normal; font-weight: 600;')}>
                  e equipados
                </em>
                , prontos para viver.
              </h2>
            </div>
            <p style={parseStyle('margin: 0; color: #5A6272; font-size: 17px; font-weight: 300; line-height: 1.7;')}>
              Do mergulho na piscina coberta com hidro ao happy hour no sportbar — tudo entregue decorado e equipado, sem custo extra de implantação para os moradores.
            </p>
          </div>
          <div style={parseStyle('display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px;')}>
            <Hoverable as="figure" baseStyle={parseStyle('grid-column: span 7; margin: 0; position: relative; overflow: hidden; border-radius: 3px; aspect-ratio: 16/10;')} hoverStyle={{}} data-reveal="true">
              <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a005.jpg" alt="Piscina coberta com hidro do Odeon Residencial" loading="lazy" />
              <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 26px 20px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 16px; font-weight: 500; letter-spacing: 0.04em;')}>
                Piscina coberta com hidro{' '}
                <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                  Perspectiva artística
                </span>
              </figcaption>
            </Hoverable>
            <figure style={parseStyle('grid-column: span 5; margin: 0; position: relative; overflow: hidden; border-radius: 3px; aspect-ratio: auto;')} data-reveal="true">
              <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a001.jpg" alt="Academia com pilates do Odeon Residencial" loading="lazy" />
              <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 26px 20px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 16px; font-weight: 500; letter-spacing: 0.04em;')}>
                Academia com pilates{' '}
                <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                  Perspectiva artística
                </span>
              </figcaption>
            </figure>
            <figure style={parseStyle('grid-column: span 5; margin: 0; position: relative; overflow: hidden; border-radius: 3px;')} data-reveal="true">
              <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a002.jpg" alt="Brinquedoteca do Odeon Residencial" loading="lazy" />
              <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 26px 20px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 16px; font-weight: 500; letter-spacing: 0.04em;')}>
                Brinquedoteca{' '}
                <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                  Perspectiva artística
                </span>
              </figcaption>
            </figure>
            <div style={parseStyle('grid-column: span 7; background: #2E3B4E; border-radius: 3px; padding: 42px 44px; display: flex; flex-direction: column; justify-content: center;')} data-reveal="true">
              <p style={parseStyle('margin: 0 0 22px; color: #E4C79B; font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase;')}>
                Lazer completo
              </p>
              <ul style={parseStyle('margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px;')}>
                {lazerLista.map((item, i) => (<React.Fragment key={i}>
                  <li style={parseStyle('color: rgba(255,255,255,.88); font-size: 15px; font-weight: 300; display: flex; align-items: baseline; gap: 10px; line-height: 1.4;')}>
                    <span style={parseStyle('color: #C99B5F; font-size: 10px;')}>
                      ◆
                    </span>
                    {item}
                  </li>
                </React.Fragment>))}
              </ul>
            </div>
          </div>
        </section>
        {/* ============ DIFERENCIAIS ============ */}
        <section style={parseStyle('background: #fff; padding: 110px 0;')} id="diferenciais" data-screen-label="Diferenciais">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('max-width: 680px; margin-bottom: 56px;')} data-reveal="true">
              <p style={parseStyle('margin: 0 0 12px; color: #C08A4E; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                Diferenciais dos apartamentos
              </p>
              <h2 style={parseStyle('margin: 0; font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.08; color: #22293A; letter-spacing: -0.01em; text-wrap: balance;')}>
                Acabamento pensado{' '}
                <em style={parseStyle('font-style: normal; font-weight: 600;')}>
                  no seu dia a dia.
                </em>
              </h2>
            </div>
            <div style={parseStyle('display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 22px;')}>
              <figure style={parseStyle('margin: 0; position: relative; overflow: hidden; border-radius: 3px; aspect-ratio: 4/3;')} data-reveal="true">
                <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a007.jpg" alt="Varanda gourmet integrada à cozinha — decorado de 112,3 m²" loading="lazy" />
                <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 22px 18px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 15px; font-weight: 500;')}>
                  Varanda gourmet integrada{' '}
                  <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                    Foto do decorado de 112,3 m²
                  </span>
                </figcaption>
              </figure>
              <figure style={parseStyle('margin: 0; position: relative; overflow: hidden; border-radius: 3px; aspect-ratio: 4/3;')} data-reveal="true">
                <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a004.jpg" alt="Cozinha com ilha e cuba dupla — decorado de 112,3 m²" loading="lazy" />
                <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 22px 18px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 15px; font-weight: 500;')}>
                  Cozinha com ilha e cuba dupla{' '}
                  <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                    Foto do decorado de 112,3 m²
                  </span>
                </figcaption>
              </figure>
              <figure style={parseStyle('margin: 0; position: relative; overflow: hidden; border-radius: 3px; aspect-ratio: 4/3;')} data-reveal="true">
                <Hoverable as="img" baseStyle={parseStyle('width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.045)' }} src="/odeon/a006.jpg" alt="Suíte com closet — decorado de 112,3 m²" loading="lazy" />
                <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 22px 18px; background: linear-gradient(transparent, rgba(30,39,56,.78)); color: #fff; font-size: 15px; font-weight: 500;')}>
                  Suíte com closet{' '}
                  <span style={parseStyle('display: block; font-size: 11px; font-weight: 400; color: rgba(255,255,255,.6); margin-top: 4px;')}>
                    Foto do decorado de 112,3 m²
                  </span>
                </figcaption>
              </figure>
            </div>
            <div style={parseStyle('display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E8E1D4; border: 1px solid #E8E1D4;')}>
              {diferenciais.map((dif, i) => (<React.Fragment key={i}>
                <Hoverable as="div" baseStyle={parseStyle('background: #fff; padding: 30px 28px; transition: background .3s;')} hoverStyle={{ background: '#FAF7F1' }} data-reveal="true">
                  <div style={parseStyle('color: #C08A4E; font-size: 13px; font-weight: 600; letter-spacing: 0.14em; margin-bottom: 10px;')}>
                    {dif.num}
                  </div>
                  <div style={parseStyle('color: #22293A; font-size: 16.5px; font-weight: 500; line-height: 1.5;')}>
                    {dif.texto}
                  </div>
                </Hoverable>
              </React.Fragment>))}
            </div>
            <p style={parseStyle('margin: 26px 0 0; color: #9AA0AC; font-size: 12px; line-height: 1.7; max-width: 980px;')} data-reveal="true">
              ¹ Quadro e eletrodutos preparados para receber infraestrutura que deve ser contratada por conta do cliente. Sugestão de automação: iluminação, cortinas, persianas, ar condicionado e televisão. ² Carga elétrica e eletrodutos na varanda preparados para receber infraestrutura que deve ser contratada por conta do cliente. ³ Equipamento aquecedor não incluso. Consulte Memorial Descritivo.
            </p>
          </div>
        </section>
        {/* ============ PLANTAS ============ */}
        <section style={parseStyle('background: #2E3B4E; padding: 110px 0; color: #fff;')} id="plantas" data-screen-label="Plantas">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap; margin-bottom: 48px;')} data-reveal="true">
              <div>
                <p style={parseStyle('margin: 0 0 12px; color: #E4C79B; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                  Plantas
                </p>
                <h2 style={parseStyle('margin: 0; font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.08; letter-spacing: -0.01em;')}>
                  Escolha o tamanho{' '}
                  <em style={parseStyle('font-style: normal; font-weight: 600;')}>
                    da sua vida.
                  </em>
                </h2>
              </div>
              <div style={parseStyle('display: flex; gap: 10px;')}>
                {planta95Ativa && (<>
                  <button style={parseStyle("border: 1px solid #C08A4E; background: #C08A4E; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.06em; padding: 13px 26px; border-radius: 2px; cursor: pointer; transition: all .25s;")} onClick={verPlanta95}>
                    95,85 m²
                  </button>
                </>)}
                {planta112Ativa && (<>
                  <Hoverable as="button" baseStyle={parseStyle("border: 1px solid rgba(255,255,255,.35); background: transparent; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.06em; padding: 13px 26px; border-radius: 2px; cursor: pointer; transition: all .25s;")} hoverStyle={{ borderColor: '#C08A4E' }} onClick={verPlanta95}>
                    95,85 m²
                  </Hoverable>
                </>)}
                {planta95Ativa && (<>
                  <Hoverable as="button" baseStyle={parseStyle("border: 1px solid rgba(255,255,255,.35); background: transparent; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.06em; padding: 13px 26px; border-radius: 2px; cursor: pointer; transition: all .25s;")} hoverStyle={{ borderColor: '#C08A4E' }} onClick={verPlanta112}>
                    112,3 m²
                  </Hoverable>
                </>)}
                {planta112Ativa && (<>
                  <button style={parseStyle("border: 1px solid #C08A4E; background: #C08A4E; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.06em; padding: 13px 26px; border-radius: 2px; cursor: pointer; transition: all .25s;")} onClick={verPlanta112}>
                    112,3 m²
                  </button>
                </>)}
              </div>
            </div>
            <div style={parseStyle('display: grid; grid-template-columns: 1.35fr 1fr; gap: 48px; align-items: center;')}>
              <figure style={parseStyle('margin: 0; background: #fff; border-radius: 3px; padding: 18px; position: relative; cursor: zoom-in;')} data-reveal="true" onClick={abrirPlantaLightbox} role="button" aria-label="Ampliar planta">
                {planta95Ativa && (<>
                  <img style={parseStyle('width: 100%; display: block; border-radius: 2px;')} src="/odeon/a009.jpg" alt="Planta do apartamento de 95,85 m² do Odeon Residencial" />
                </>)}
                {planta112Ativa && (<>
                  <img style={parseStyle('width: 100%; display: block; border-radius: 2px;')} src="/odeon/a003.jpg" alt="Planta do apartamento de 112,3 m² do Odeon Residencial" />
                </>)}
                <span style={parseStyle('position: absolute; right: 26px; bottom: 26px; background: #2E3B4E; color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 9px 16px; border-radius: 999px; display: inline-flex; align-items: center; gap: 8px;')}>
                  ⤢ Ampliar planta
                </span>
              </figure>
              <div data-reveal="true">
                <div style={parseStyle('font-size: clamp(48px, 5vw, 72px); font-weight: 300; line-height: 1; color: #fff;')}>
                  {plantaArea}
                  <span style={parseStyle('font-size: 22px; color: #E4C79B; font-weight: 400;')}>
                    m²
                  </span>
                </div>
                <div style={parseStyle('color: rgba(255,255,255,.65); font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; margin: 10px 0 28px;')}>
                  {plantaSubtitulo}
                </div>
                <ul style={parseStyle('margin: 0 0 34px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px;')}>
                  {plantaFeatures.map((pf, i) => (<React.Fragment key={i}>
                    <li style={parseStyle('display: flex; gap: 12px; align-items: baseline; color: rgba(255,255,255,.88); font-size: 16.5px; font-weight: 300; line-height: 1.5; border-bottom: 1px solid rgba(255,255,255,.12); padding-bottom: 14px;')}>
                      <span style={parseStyle('color: #C99B5F; font-size: 10px;')}>
                        ◆
                      </span>
                      {pf}
                    </li>
                  </React.Fragment>))}
                </ul>
                <Hoverable as="a" baseStyle={parseStyle('display: inline-block; background: #C08A4E; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px 30px; border-radius: 2px; transition: background .25s;')} hoverStyle={{ background: '#B07A3E' }} href="#contato" onClick={ctaClick}>
                  Quero esta planta
                </Hoverable>
              </div>
            </div>
            <p style={parseStyle('margin: 22px 0 0; color: rgba(255,255,255,.4); font-size: 11.5px; line-height: 1.6;')}>
              Ilustração artística. Móveis, utensílios e itens de decoração são meramente ilustrativos e não fazem parte do Memorial Descritivo.
            </p>
          </div>
        </section>
        {/* ============ DECORADO / GALERIA ============ */}
        <section style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 110px 28px;')} id="decorado" data-screen-label="Decorado">
          <div style={parseStyle('display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap; margin-bottom: 44px;')} data-reveal="true">
            <div style={parseStyle('max-width: 620px;')}>
              <p style={parseStyle('margin: 0 0 12px; color: #C08A4E; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                Apartamentos decorados
              </p>
              <h2 style={parseStyle('margin: 0; font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.08; color: #22293A; letter-spacing: -0.01em;')}>
                Visite sem sair{' '}
                <em style={parseStyle('font-style: normal; font-weight: 600;')}>
                  de casa.
                </em>
              </h2>
            </div>
            <div style={parseStyle('display: flex; gap: 8px;')}>
              {filtroTodosAtivo && (<>
                <button style={parseStyle("border: 1px solid #2E3B4E; background: #2E3B4E; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} onClick={filtrarTodos}>
                  Todos
                </button>
              </>)}
              {filtroTodosInativo && (<>
                <Hoverable as="button" baseStyle={parseStyle("border: 1px solid #D8D0BF; background: #fff; color: #5A6272; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} hoverStyle={{ borderColor: '#2E3B4E', color: '#2E3B4E' }} onClick={filtrarTodos}>
                  Todos
                </Hoverable>
              </>)}
              {filtro95Ativo && (<>
                <button style={parseStyle("border: 1px solid #2E3B4E; background: #2E3B4E; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} onClick={filtrar95}>
                  95,85 m²
                </button>
              </>)}
              {filtro95Inativo && (<>
                <Hoverable as="button" baseStyle={parseStyle("border: 1px solid #D8D0BF; background: #fff; color: #5A6272; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} hoverStyle={{ borderColor: '#2E3B4E', color: '#2E3B4E' }} onClick={filtrar95}>
                  95,85 m²
                </Hoverable>
              </>)}
              {filtro112Ativo && (<>
                <button style={parseStyle("border: 1px solid #2E3B4E; background: #2E3B4E; color: #fff; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} onClick={filtrar112}>
                  112,3 m²
                </button>
              </>)}
              {filtro112Inativo && (<>
                <Hoverable as="button" baseStyle={parseStyle("border: 1px solid #D8D0BF; background: #fff; color: #5A6272; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; transition: all .25s;")} hoverStyle={{ borderColor: '#2E3B4E', color: '#2E3B4E' }} onClick={filtrar112}>
                  112,3 m²
                </Hoverable>
              </>)}
            </div>
          </div>
          <div style={parseStyle('position: relative;')} data-reveal="true">
            <div style={parseStyle('position: relative; overflow: hidden; border-radius: 4px; aspect-ratio: 16/8.6; cursor: zoom-in; background: #E8E1D4;')} onClick={abrirCarrosselLightbox} onTouchStart={carTouchStart} onTouchEnd={carTouchEnd} role="button" aria-label="Ampliar foto do decorado">
              {carouselImgNode}
              <div style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 28px 22px; background: linear-gradient(transparent, rgba(30,39,56,.8)); display: flex; align-items: baseline; justify-content: space-between; gap: 18px;')}>
                <div style={parseStyle('color: #fff; font-size: 19px; font-weight: 500;')}>
                  {carLabel}{' '}
                  <span style={parseStyle('color: rgba(255,255,255,.65); font-weight: 400; font-size: 15px;')}>
                    · Decorado {carUnidade}
                  </span>
                </div>
                <div style={parseStyle('display: flex; align-items: baseline; gap: 18px; white-space: nowrap;')}>
                  <span style={parseStyle('color: rgba(255,255,255,.7); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;')}>
                    Clique para ampliar
                  </span>
                  <span style={parseStyle('color: #E4C79B; font-size: 14px; font-weight: 600; letter-spacing: 0.1em;')}>
                    {carContador}
                  </span>
                </div>
              </div>
            </div>
            <Hoverable as="button" baseStyle={parseStyle('position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(255,255,255,.5); background: rgba(30,39,56,.45); backdrop-filter: blur(6px); color: #fff; font-size: 20px; cursor: pointer; transition: background .25s;')} hoverStyle={{ background: '#C08A4E', borderColor: '#C08A4E' }} onClick={carAnterior} aria-label="Foto anterior">
              ←
            </Hoverable>
            <Hoverable as="button" baseStyle={parseStyle('position: absolute; right: 18px; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(255,255,255,.5); background: rgba(30,39,56,.45); backdrop-filter: blur(6px); color: #fff; font-size: 20px; cursor: pointer; transition: background .25s;')} hoverStyle={{ background: '#C08A4E', borderColor: '#C08A4E' }} onClick={carProxima} aria-label="Próxima foto">
              →
            </Hoverable>
          </div>
          <div style={parseStyle('display: flex; gap: 10px; margin-top: 14px; overflow-x: auto; padding-bottom: 6px;')}>
            {galeriaVisivel.map((g, i) => (<React.Fragment key={i}>
              <button style={g.thumbWrapStyle} onClick={g.selecionar} aria-label={g.alt}>
                {g.ativa && (<>
                  <img style={parseStyle('width: 118px; height: 78px; object-fit: cover; display: block; border-radius: 2px; outline: 3px solid #C08A4E; outline-offset: -3px;')} src={g.src} alt="" loading="lazy" />
                </>)}
                {g.inativa && (<>
                  <Hoverable as="img" baseStyle={parseStyle('width: 118px; height: 78px; object-fit: cover; display: block; border-radius: 2px; opacity: .55; transition: opacity .25s;')} hoverStyle={{ opacity: '1' }} src={g.src} alt="" loading="lazy" />
                </>)}
              </button>
            </React.Fragment>))}
          </div>
          <p style={parseStyle('margin: 16px 0 0; color: #9AA0AC; font-size: 12px;')}>
            Fotos reais dos apartamentos decorados de 95,85 m² e 112,3 m². Arraste ou use as setas para navegar; clique na foto para ampliar.
          </p>
        </section>
        {/* LIGHTBOX */}
        {lightboxAberto && (<>
          <div style={parseStyle('position: fixed; inset: 0; z-index: 90; background: rgba(20,26,38,.92); display: flex; align-items: center; justify-content: center; padding: 40px; cursor: zoom-out; backdrop-filter: blur(4px);')} onClick={fecharLightbox} onTouchStart={carTouchStart} onTouchEnd={lbTouchEnd}>
            <figure style={parseStyle('margin: 0; max-width: min(1100px, 92vw);')}>
              {lightboxImgNode}
              <figcaption style={parseStyle('color: rgba(255,255,255,.8); font-size: 14px; text-align: center; margin-top: 14px;')}>
                {lightboxAlt}
              </figcaption>
            </figure>
            <button style={parseStyle('position: absolute; top: 24px; right: 28px; background: none; border: 1px solid rgba(255,255,255,.35); color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 18px; cursor: pointer;')} onClick={fecharLightbox} aria-label="Fechar">
              ✕
            </button>
            <Hoverable as="button" baseStyle={parseStyle('position: absolute; left: 24px; top: 50%; transform: translateY(-50%); width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(255,255,255,.4); background: rgba(255,255,255,.08); color: #fff; font-size: 20px; cursor: pointer; transition: background .25s;')} hoverStyle={{ background: '#C08A4E', borderColor: '#C08A4E' }} onClick={lbAnterior} aria-label="Imagem anterior">
              ←
            </Hoverable>
            <Hoverable as="button" baseStyle={parseStyle('position: absolute; right: 24px; top: 50%; transform: translateY(-50%); width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(255,255,255,.4); background: rgba(255,255,255,.08); color: #fff; font-size: 20px; cursor: pointer; transition: background .25s;')} hoverStyle={{ background: '#C08A4E', borderColor: '#C08A4E' }} onClick={lbProxima} aria-label="Próxima imagem">
              →
            </Hoverable>
            <div style={parseStyle('position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); color: #E4C79B; font-size: 14px; font-weight: 600; letter-spacing: 0.14em;')}>
              {lightboxContador}
            </div>
          </div>
        </>)}
        {/* ============ LOCALIZAÇÃO ============ */}
        <section style={parseStyle('background: #fff; padding: 110px 0;')} id="localizacao" data-screen-label="Localização">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('display: grid; grid-template-columns: .9fr 1.1fr; gap: 56px; align-items: center;')}>
              <div data-reveal="true">
                <p style={parseStyle('margin: 0 0 12px; color: #C08A4E; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                  Localização
                </p>
                <h2 style={parseStyle('margin: 0 0 22px; font-size: clamp(34px, 4vw, 54px); font-weight: 300; line-height: 1.08; color: #22293A; letter-spacing: -0.01em;')}>
                  Jundiaí, entre a serra{' '}
                  <em style={parseStyle('font-style: normal; font-weight: 600;')}>
                    e a cidade.
                  </em>
                </h2>
                <p style={parseStyle('margin: 0 0 30px; color: #5A6272; font-size: 17px; font-weight: 300; line-height: 1.75;')}>
                  O Odeon nasce no Portal do Paraíso II, cercado pelo verde da região e a poucos minutos da infraestrutura consolidada de Jundiaí — uma das cidades com melhor qualidade de vida do interior paulista.
                </p>
                <Hoverable as="a" baseStyle={parseStyle('display: inline-block; background: #2E3B4E; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px 30px; border-radius: 2px; transition: background .25s;')} hoverStyle={{ background: '#C08A4E' }} href="#contato" onClick={ctaClick}>
                  Como chegar
                </Hoverable>
              </div>
              <div style={parseStyle('display: grid; gap: 16px;')} data-reveal="true">
                <figure style={parseStyle('margin: 0; position: relative; overflow: hidden; border-radius: 3px;')}>
                  <Hoverable as="img" baseStyle={parseStyle('width: 100%; display: block; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.04)' }} src="/odeon/a011.jpg" alt="Foto aérea da região do Odeon em Jundiaí" loading="lazy" />
                  <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 36px 20px 16px; background: linear-gradient(transparent, rgba(30,39,56,.7)); color: #fff; font-size: 14px; font-weight: 500;')}>
                    Foto aérea do local
                  </figcaption>
                </figure>
                <figure style={parseStyle('margin: 0; position: relative; overflow: hidden; border-radius: 3px;')}>
                  <Hoverable as="img" baseStyle={parseStyle('width: 100%; display: block; transition: transform .8s cubic-bezier(.2,.6,.2,1);')} hoverStyle={{ transform: 'scale(1.04)' }} src="/odeon/a010.jpg" alt="Foto aérea de Jundiaí, com a serra ao fundo" loading="lazy" />
                  <figcaption style={parseStyle('position: absolute; left: 0; right: 0; bottom: 0; padding: 36px 20px 16px; background: linear-gradient(transparent, rgba(30,39,56,.7)); color: #fff; font-size: 14px; font-weight: 500;')}>
                    Jundiaí vista do alto
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>
        {/* ============ CONTATO ============ */}
        <section style={parseStyle('background: linear-gradient(160deg, #2E3B4E 0%, #22293A 100%); padding: 110px 0; color: #fff;')} id="contato" data-screen-label="Contato">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;')}>
            <div data-reveal="true">
              <p style={parseStyle('margin: 0 0 12px; color: #E4C79B; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;')}>
                Corretores especialistas
              </p>
              <h2 style={parseStyle('margin: 0 0 20px; font-size: clamp(34px, 4vw, 56px); font-weight: 300; line-height: 1.08; letter-spacing: -0.01em;')}>
                Fale agora com{' '}
                <em style={parseStyle('font-style: normal; font-weight: 600; color: #E4C79B;')}>
                  um especialista.
                </em>
              </h2>
              <p style={parseStyle('margin: 0 0 34px; color: rgba(255,255,255,.75); font-size: 17px; font-weight: 300; line-height: 1.7; max-width: 460px;')}>
                Atendimento especializado e sem compromisso. Receba a tabela de valores, condições de pagamento e agende sua visita ao decorado.
              </p>
              <ul style={parseStyle('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px;')}>
                <li style={parseStyle('display: flex; gap: 12px; align-items: baseline; color: rgba(255,255,255,.85); font-size: 16px; font-weight: 300;')}>
                  <span style={parseStyle('color: #C99B5F; font-size: 10px;')}>
                    ◆
                  </span>
                  Tabela de valores e condições atualizadas
                </li>
                <li style={parseStyle('display: flex; gap: 12px; align-items: baseline; color: rgba(255,255,255,.85); font-size: 16px; font-weight: 300;')}>
                  <span style={parseStyle('color: #C99B5F; font-size: 10px;')}>
                    ◆
                  </span>
                  Visita ao apartamento decorado
                </li>
                <li style={parseStyle('display: flex; gap: 12px; align-items: baseline; color: rgba(255,255,255,.85); font-size: 16px; font-weight: 300;')}>
                  <span style={parseStyle('color: #C99B5F; font-size: 10px;')}>
                    ◆
                  </span>
                  Simulação de financiamento
                </li>
              </ul>
            </div>
            <form style={parseStyle('background: #fff; border-radius: 4px; padding: 40px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 40px 80px rgba(0,0,0,.35);')} data-reveal="true" onSubmit={enviarForm}>
              <div style={parseStyle('color: #22293A; font-size: 22px; font-weight: 600; margin-bottom: 2px;')}>
                Receba mais informações
              </div>
              <div style={parseStyle('color: #8A8F9B; font-size: 13.5px; margin-top: -8px;')}>
                Resposta rápida pelo WhatsApp.
              </div>
              <input style={parseStyle("border: 1px solid #DDD6C8; border-radius: 3px; padding: 15px 16px; font-size: 15px; font-family: 'Hanken Grotesk', sans-serif; color: #22293A; outline: none; background: #FBFAF7;")} required value={formNome} onChange={setNomeEv} placeholder="Seu nome" onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C08A4E';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#DDD6C8';
                }} />
              <input style={parseStyle("border: 1px solid #DDD6C8; border-radius: 3px; padding: 15px 16px; font-size: 15px; font-family: 'Hanken Grotesk', sans-serif; color: #22293A; outline: none; background: #FBFAF7;")} required value={formTelefone} onChange={setTelefoneEv} placeholder="WhatsApp com DDD" inputMode="tel" onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C08A4E';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#DDD6C8';
                }} />
              <select style={parseStyle("border: 1px solid #DDD6C8; border-radius: 3px; padding: 15px 12px; font-size: 15px; font-family: 'Hanken Grotesk', sans-serif; color: #22293A; outline: none; background: #FBFAF7;")} value={formInteresse} onChange={setInteresseEv}>
                <option value="Tenho interesse no Odeon">
                  Tenho interesse geral
                </option>
                <option value="Quero a planta de 95,85 m²">
                  Planta de 95,85 m²
                </option>
                <option value="Quero a planta de 112,3 m²">
                  Planta de 112,3 m²
                </option>
                <option value="Quero agendar visita ao decorado">
                  Agendar visita ao decorado
                </option>
              </select>
              <Hoverable as="button" baseStyle={parseStyle("background: #C08A4E; color: #fff; border: none; border-radius: 3px; padding: 17px; font-size: 15px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; font-family: 'Hanken Grotesk', sans-serif; transition: background .25s, transform .25s;")} hoverStyle={{ background: '#B07A3E', transform: 'translateY(-1px)' }} type="submit">
                Falar no WhatsApp
              </Hoverable>
              <p style={parseStyle('margin: 0; color: #9AA0AC; font-size: 11.5px; line-height: 1.5;')}>
                Ao enviar, você concorda em ser contatado sobre o Odeon Residencial. CRECI 55261.
              </p>
            </form>
          </div>
        </section>
        {/* ============ FOOTER ============ */}
        <footer style={parseStyle('background: #1C2330; padding: 56px 0 40px; color: rgba(255,255,255,.6);')} data-screen-label="Footer">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 34px; margin-bottom: 26px;')}>
              <div style={parseStyle('display: flex; flex-direction: column; line-height: 1;')}>
                <span style={parseStyle('color: #fff; font-size: 30px; font-weight: 300; letter-spacing: 0.42em;')}>
                  ODEON
                </span>
                <span style={parseStyle('color: #C99B5F; font-size: 10px; font-weight: 600; letter-spacing: 0.34em; margin-top: 8px;')}>
                  PORTAL DO PARAÍSO II · JUNDIAÍ
                </span>
              </div>
              <div style={parseStyle('display: flex; gap: 44px; flex-wrap: wrap; font-size: 14px;')}>
                <Hoverable as="a" baseStyle={parseStyle('color: rgba(255,255,255,.7); text-decoration: none;')} hoverStyle={{ color: '#E4C79B' }} href="#lazer">
                  Lazer
                </Hoverable>
                <Hoverable as="a" baseStyle={parseStyle('color: rgba(255,255,255,.7); text-decoration: none;')} hoverStyle={{ color: '#E4C79B' }} href="#plantas">
                  Plantas
                </Hoverable>
                <Hoverable as="a" baseStyle={parseStyle('color: rgba(255,255,255,.7); text-decoration: none;')} hoverStyle={{ color: '#E4C79B' }} href="#decorado">
                  Decorado
                </Hoverable>
                <Hoverable as="a" baseStyle={parseStyle('color: rgba(255,255,255,.7); text-decoration: none;')} hoverStyle={{ color: '#E4C79B' }} href="#contato">
                  Contato
                </Hoverable>
              </div>
            </div>
            <p style={parseStyle('margin: 0; font-size: 11.5px; line-height: 1.8; color: rgba(255,255,255,.45); max-width: 1050px;')}>
              Projeto aprovado pela Prefeitura Municipal de Jundiaí no dia 27/08/2021 sob o número 34.675-7/2019. Alvará de execução de obra particular nº 166/2021. Memorial de Incorporação registrado sob R.02 na matrícula 171.939, do 1º Oficial de Registro de Imóveis da Comarca de Jundiaí/SP. Todas as imagens deste material são meramente ilustrativas e estão sujeitas a adequações. As perspectivas retratam o projeto paisagístico com vegetação em fase adulta, estágio que será alcançado com a ação do tempo. CRECI 55261.
            </p>
          </div>
        </footer>
        {/* WhatsApp flutuante */}
        <Hoverable as="a" baseStyle={parseStyle('position: fixed; right: 26px; bottom: 26px; z-index: 80; width: 60px; height: 60px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,.3); transition: transform .25s;')} hoverStyle={{ transform: 'scale(1.08)' }} href={whatsHref} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29z">
            </path>
          </svg>
        </Hoverable>
      </div>
    </>
  );
}
