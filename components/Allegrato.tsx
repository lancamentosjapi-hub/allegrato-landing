'use client';

/**
 * Allegrato Residencial — porte 1:1 de "Allegrato Landing - Wix.html" (mecanismo
 * dc-runtime) para React. CSS em app/allegrato/allegrato.css, assets em public/allegrato.
 *
 * Comportamentos portados do a019.js: header sólido/on-dark, reveal on scroll,
 * lightbox com dois grupos (lazer e plantas), simulador de parcela e formulário
 * com máscara de telefone + handoff para o WhatsApp.
 *
 * Diferenças conscientes em relação ao fonte:
 *  - O hack de resolução do hero via blob do bundler saiu: em Next o asset tem
 *    caminho estável (/allegrato/a012.jpg), então o <img> aponta direto.
 *  - O lightbox usa o src real do <img> de cada tile; o `data-img` do fonte
 *    apontava para caminhos relativos que não existem fora do bundle.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseStyle, useReveal, waHref } from '@/lib/dc-runtime';
import { sendLead } from '@/lib/lead';
import CtaSimulacao from './CtaSimulacao';

// TODO(Lotus): número de vendas real — o fonte marcava este como PLACEHOLDER.
const WA_NUMBER = '5511926143393';
const WA_MSG =
  'Olá! Tenho interesse no Allegrato Residencial (Medeiros, Jundiaí). Gostaria de saber mais sobre valores e condições.';
const waUrl = (extra?: string) => waHref(WA_NUMBER, extra ? `${WA_MSG} ${extra}` : WA_MSG);
const waDefault = waUrl();

type LbItem = { src: string; cap: string };

/** Máscara de telefone BR, idêntica à do fonte. */
function maskFone(raw: string) {
  const v = raw.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 0) return `(${v}`;
  return '';
}


export default function Allegrato() {
  const [lb, setLb] = useState<{ items: LbItem[]; i: number } | null>(null);
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [fone, setFone] = useState('');
  const nomeRef = useRef<HTMLInputElement>(null);
  const foneRef = useRef<HTMLInputElement>(null);
  const interesseRef = useRef<HTMLSelectElement>(null);


  /* Header: sólido ao rolar, claro enquanto o hero estiver visível. */
  useEffect(() => {
    const header = document.getElementById('header');
    const hero = document.getElementById('hero');
    if (!header || !hero) return;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('solid', y > 40);
      header.classList.toggle('on-dark', y < hero.offsetHeight - 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useReveal('.reveal', 'in', 0.12);

  /* Lightbox por delegação: os grupos (.tile e .plan-open) são markup estático,
     então um listener só evita espalhar onClick por 10 elementos. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('.tile, .plan-open');
      if (!el) return;
      const selector = el.classList.contains('tile') ? '.tile' : '.plan-open';
      const group = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const items: LbItem[] = group.map((g) => ({
        src: g.querySelector('img')?.getAttribute('src') || '',
        cap: g.getAttribute('data-cap') || '',
      }));
      setLb({ items, i: group.indexOf(el) });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const closeLb = useCallback(() => setLb(null), []);
  const stepLb = useCallback(
    (d: number) => setLb((s) => (s ? { ...s, i: (s.i + d + s.items.length) % s.items.length } : s)),
    [],
  );

  useEffect(() => {
    if (!lb) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') stepLb(1);
      if (e.key === 'ArrowLeft') stepLb(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [lb, closeLb, stepLb]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = nomeRef.current?.value.trim() || '';
    const telDigits = fone.replace(/\D/g, '');
    if (!nome) {
      nomeRef.current?.focus();
      return;
    }
    if (telDigits.length < 10) {
      foneRef.current?.focus();
      return;
    }
    const interesse = interesseRef.current?.value || '';
    const extra = `Meu nome é ${nome}.${interesse ? ` Tenho interesse em: ${interesse}.` : ''}`;
    sendLead({
      name: nome,
      phone: fone,
      source: 'landing_allegrato',
      interest: 'Allegrato Residencial',
      message: interesse,
    });
    const url = waUrl(extra);
    setSentUrl(url);
    window.open(url, '_blank', 'noopener');
  };

  const lbItem = lb ? lb.items[lb.i] : null;

  return (
    <>
      {/* ============ HEADER ============ */}
      <header className="site-header on-dark" id="header">
        <a href="#top" aria-label="Allegrato Residencial">
          <img className="logo" src="/allegrato/a001.png" alt="Allegrato Residencial" />
        </a>
        <nav className="nav">
          <a href="#lazer">
            Lazer
          </a>
          <a href="#localizacao">
            Localização
          </a>
          <a href="#plantas">
            Plantas
          </a>
          <a href="#diferenciais">
            Diferenciais
          </a>
          <a href="#investir">
            Por que agora
          </a>
        </nav>
        <div className="header-cta">
          <a href="#contato" className="btn btn-ghost">
            Lista VIP
          </a>
          <a className="btn btn-primary wa-link" href={waDefault} target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2">
              </path>
            </svg>
            WhatsApp
          </a>
        </div>
        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Menu"
          onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span>
          </span>
          <span>
          </span>
          <span>
          </span>
        </button>
      </header>
      <a id="top">
      </a>
      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img id="heroImg" src="/allegrato/a012.jpg" alt="Lazer do Allegrato Residencial ao entardecer" />
        </div>
        <div className="hero-inner">
          <span className="eyebrow">
            Lançamento · Bairro Medeiros, Jundiaí/SP
          </span>
          <h1 id="heroHeadline">
            Conquiste agora seu lugar.
          </h1>
          <p className="hero-sub">
            O apartamento mais completo do Medeiros para você sair do aluguel pagando pouco, lazer com tudo pronto e a segurança da construtora nº 1 de Jundiaí.
          </p>
          <div className="price-pill">
            <span>
              A partir de
            </span>
            <b>
              R$ 350 mil
            </b>
            <span className="dot">
            </span>
            <span>
              tabela de pré-lançamento sujeita a ajustes
            </span>
          </div>
          <div className="hero-cta">
            <a className="btn btn-wa wa-link" href={waDefault} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2">
                </path>
              </svg>
              Falar no WhatsApp
            </a>
            <a className="btn btn-light" href="#contato">
              Quero condições de pré-lançamento
            </a>
          </div>
          <div className="hero-stats">
            <div className="st">
              <b>
                566
              </b>
              <span>
                apartamentos
              </span>
            </div>
            <div className="st">
              <b>
                4
              </b>
              <span>
                torres
              </span>
            </div>
            <div className="st">
              <b>
                24
              </b>
              <span>
                itens de lazer
              </span>
            </div>
            <div className="st">
              <b>
                55–65 m²
              </b>
              <span>
                2 dormitórios
              </span>
            </div>
          </div>
        </div>
        <div className="scroll-cue">
          <span>
            Explore
          </span>
          <span className="ln">
          </span>
        </div>
      </section>
      {/* ============ MANIFESTO ============ */}
      <section className="manifesto block">
        <div className="wrap">
          <div className="col-l reveal">
            <span className="eyebrow">
              Mais do que morar
            </span>
            <h2>
              Viver melhor{' '}
              <em>
                todos os dias.
              </em>
            </h2>
            <div className="kv-row">
              <div className="kv">
                <b>
                  16 mil m²
                </b>
                <span>
                  de terreno
                </span>
              </div>
              <div className="kv">
                <b>
                  5.347 m²
                </b>
                <span>
                  de área permeável
                </span>
              </div>
              <div className="kv">
                <b>
                  jun/2026
                </b>
                <span>
                  lançamento
                </span>
              </div>
            </div>
          </div>
          <div className="col-r reveal d1">
            <p className="lead">
              No bairro do Medeiros, praticidade e qualidade de vida caminham juntas. O Allegrato foi pensado para quem busca mais bem-estar e tempo de qualidade no dia a dia.
            </p>
            <p className="muted">
              Com espaços planejados para diferentes momentos da rotina, o empreendimento une convivência, conforto e uma atmosfera que valoriza a vida dentro do condomínio, um verdadeiro condomínio-clube com a infraestrutura essencial já na primeira fase.
            </p>
          </div>
        </div>
      </section>
      {/* ============ AMENITIES ============ */}
      <section className="amenities block" id="lazer">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              Áreas de lazer · Perspectivas artísticas
            </span>
            <h2>
              A experiência de morar além do apartamento.
            </h2>
            <p className="lead">
              Áreas pensadas para reunir pessoas, mover o corpo e aproveitar melhor o tempo, entregues decoradas e equipadas, prontas para usar desde o primeiro dia.
            </p>
          </div>
          <div className="gal">
            <div className="tile big c-8 reveal" data-img="assets/piscinas-aerea.jpg" data-cap="Piscinas adulto e infantil">
              <img src="/allegrato/a013.jpg" alt="Piscinas adulto e infantil" />
              <div className="cap">
                <div>
                  <div className="t">
                    Piscinas adulto & infantil
                  </div>
                  <div className="s">
                    com deck, espreguiçadeiras e paisagismo
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile big c-4 reveal d1" data-img="assets/espaco-pet.jpg" data-cap="Espaço Pet">
              <img src="/allegrato/a014.jpg" alt="Espaço Pet" />
              <div className="cap">
                <div>
                  <div className="t">
                    Espaço Pet
                  </div>
                  <div className="s">
                    lugar para o melhor amigo
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile med c-4 reveal" data-img="assets/quadra-playground.jpg" data-cap="Playground & Quadra">
              <img src="/allegrato/a010.jpg" alt="Playground e quadra" />
              <div className="cap">
                <div>
                  <div className="t">
                    Playground
                  </div>
                  <div className="s">
                    para a criançada brincar
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile med c-4 reveal d1" data-img="assets/pista-caminhada.jpg" data-cap="Pista de caminhada">
              <img src="/allegrato/a011.jpg" alt="Pista de caminhada" />
              <div className="cap">
                <div>
                  <div className="t">
                    Pista de caminhada
                  </div>
                  <div className="s">
                    rotina ativa entre o verde
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile med c-4 reveal d2" data-img="assets/piscina-por-do-sol.jpg" data-cap="Piscina ao entardecer">
              <img src="/allegrato/a006.jpg" alt="Piscina ao entardecer" />
              <div className="cap">
                <div>
                  <div className="t">
                    Piscina
                  </div>
                  <div className="s">
                    fim de tarde em casa
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile med c-7 reveal" data-img="assets/gourmet-salao.jpg" data-cap="Salão de Festas & Espaço Gourmet">
              <img src="/allegrato/a005.jpg" alt="Salão de festas e espaço gourmet" />
              <div className="cap">
                <div>
                  <div className="t">
                    Salão de Festas & Gourmet
                  </div>
                  <div className="s">
                    para reunir quem você ama
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="tile med c-5 reveal d1" data-img="assets/quadra.jpg" data-cap="Quadra recreativa">
              <img src="/allegrato/a009.jpg" alt="Quadra recreativa" />
              <div className="cap">
                <div>
                  <div className="t">
                    Quadra recreativa
                  </div>
                  <div className="s">
                    esporte a poucos passos
                  </div>
                </div>
                <div className="plus">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14">
                    </path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="amen-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9">
              </circle>
              <path d="M12 8v5M12 16h.01">
              </path>
            </svg>
            {' '}Academia, brinquedoteca, coworking, espaço teen, lavanderia e minimercado completam os 24 itens de lazer. Entrega por fases.
          </div>
        </div>
      </section>
      {/* ============ DIFFERENTIALS ============ */}
      <section className="diff block" id="diferenciais">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              Por que o Allegrato
            </span>
            <h2>
              Diferenciais que viram economia de verdade.
            </h2>
            <p className="lead">
              Não é só o que você vê, é o que você economiza todo mês. Tecnologia e entrega pensadas para um condomínio mais barato.
            </p>
          </div>
          <div className="diff-grid">
            <div className="dcard reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6">
                  </path>
                </svg>
              </div>
              <h3>
                Áreas comuns decoradas
              </h3>
              <p>
                Todo o lazer é entregue equipado e mobiliado (enxoval pronto). O que na maioria dos lançamentos vira rateio extra na taxa de condomínio, aqui já vem incluso.
              </p>
              <span className="tag">
                Menos rateio · uso desde o 1º dia
              </span>
            </div>
            <div className="dcard reveal d1">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7z">
                  </path>
                </svg>
              </div>
              <h3>
                Condomínio mais inteligente
              </h3>
              <p>
                Elevadores regenerativos, rede elétrica subterrânea, sensores de presença e LED nas áreas comuns. Tecnologia que reduz a conta de energia do condomínio.
              </p>
              <span className="tag">
                Elevador regenerativo · sensores
              </span>
            </div>
            <div className="dcard reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2">
                  </rect>
                  <path d="M3 9h18M9 21V9">
                  </path>
                </svg>
              </div>
              <h3>
                Plantas com layout flexível
              </h3>
              <p>
                Paredes estratégicas permitem personalizar a divisão dos ambientes. Vários finais com home office multifuncional e opções de 2 suítes + lavabo.
              </p>
              <span className="tag">
                Personalize do seu jeito
              </span>
            </div>
            <div className="dcard reveal d1">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 17h14M5 17V9l7-4 7 4v8M9 17v-4h6v4">
                  </path>
                  <circle cx="8" cy="20" r="1.5">
                  </circle>
                  <circle cx="16" cy="20" r="1.5">
                  </circle>
                </svg>
              </div>
              <h3>
                Garagem já na 1ª fase
              </h3>
              <p>
                Edifício-garagem de 6 níveis entregue logo no início. Comprou unidade sem vaga? Você pode adquirir uma vaga autônoma desde já.
              </p>
              <span className="tag">
                669 vagas · vaga autônoma
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* ============ LOCATION ============ */}
      <section className="loc block" id="localizacao">
        <div className="wrap">
          <div className="col-l reveal">
            <div className="loc-map">
              <iframe title="Mapa - Allegrato Residencial, Av. Juvenal Arantes 1240, Jundiaí/SP" src="https://www.google.com/maps?q=Avenida%20Juvenal%20Arantes%2C%201240%2C%20Jundia%C3%AD%20-%20SP&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen>
              </iframe>
              <a className="map-cta" href="https://www.google.com/maps/search/?api=1&query=Avenida%20Juvenal%20Arantes%2C%201240%2C%20Jundia%C3%AD%20-%20SP" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z">
                  </path>
                  <circle cx="12" cy="10" r="2.5">
                  </circle>
                </svg>
                Abrir no Google Maps
              </a>
            </div>
          </div>
          <div className="col-r reveal d1">
            <span className="eyebrow">
              Localização · Medeiros, Jundiaí
            </span>
            <h2 style={parseStyle('font-size:clamp(2rem,4vw,3.1rem);margin-top:.4em')}>
              Perto de tudo o que importa.
            </h2>
            <p style={parseStyle('margin-top:1rem')} className="lead">
              Um dos principais vetores de expansão de Jundiaí, com acesso rápido às rodovias, serviços e polos de trabalho da região.
            </p>
            <div className="times">
              <div className="time">
                <div className="min">
                  10
                  <small>
                    min
                  </small>
                </div>
                <div className="pl">
                  Rod. Anhanguera
                </div>
              </div>
              <div className="time">
                <div className="min">
                  10
                  <small>
                    min
                  </small>
                </div>
                <div className="pl">
                  Rod. dos Bandeirantes
                </div>
              </div>
              <div className="time">
                <div className="min">
                  15
                  <small>
                    min
                  </small>
                </div>
                <div className="pl">
                  Centro de Jundiaí
                </div>
              </div>
              <div className="time">
                <div className="min">
                  15
                  <small>
                    min
                  </small>
                </div>
                <div className="pl">
                  Distrito Industrial
                </div>
              </div>
            </div>
            <div className="conv">
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z">
                  </path>
                </svg>
                Boulevard Medeiros
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z">
                  </path>
                  <path d="M3 6h18">
                  </path>
                </svg>
                Mercados & padarias
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z">
                  </path>
                  <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5">
                  </path>
                </svg>
                Colégios fund. ao médio
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z">
                  </path>
                </svg>
                Restaurantes & pet shops
              </span>
              <span className="chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h4l3 8 4-16 3 8h4">
                  </path>
                </svg>
                Academias & saúde
              </span>
            </div>
            <div className="addr">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z">
                  </path>
                  <circle cx="12" cy="10" r="2.5">
                  </circle>
                </svg>
              </div>
              <div>
                <b>
                  Av. Juvenal Arantes, 1240
                </b>
                {' '}· Bairro Medeiros, Jundiaí/SP
                <br />
                <span style={parseStyle('font-size:.85rem')} className="muted">
                  A ~50 min da capital · próximo à Serra do Japi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ PLANS ============ */}
      <section className="plans block" id="plantas">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              Plantas & Tipologias
            </span>
            <h2>
              Plantas pensadas para diferentes formas de viver.
            </h2>
            <p className="lead">
              9 modelos de 55 a 65 m² privativos, com ambientes sociais integrados, cozinha funcional e varanda. Confira as principais tipologias.
            </p>
          </div>
          <div className="plan-grid">
            <div className="plan reveal">
              <div className="pv plan-open" data-img="assets/planta-2dorm.png" data-cap="Tipo 2 dormitórios · Torre B/C/D · 56,11 m²">
                <span className="badge hot">
                  Mais procurada
                </span>
                <img className="planimg" src="/allegrato/a007.png" alt="Planta do apartamento de 2 dormitórios, 56 m²" loading="lazy" />
                <span className="zoom">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7">
                    </circle>
                    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6">
                    </path>
                  </svg>
                  Ampliar planta
                </span>
              </div>
              <div className="pbody">
                <h3>
                  2 dormitórios
                </h3>
                <div className="area">
                  56,11 m² · Torre B/C/D
                </div>
                <ul>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Sala de estar e jantar integradas
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Cozinha linear e varanda funcional
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Sem vaga vinculada, entrada menor
                  </li>
                </ul>
                <div className="pfoot">
                  <span className="vol">
                    276 unidades
                  </span>
                  <a className="wa-link" href={waDefault} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6">
                      </path>
                    </svg>
                    Ver disponibilidade
                  </a>
                </div>
              </div>
            </div>
            <div className="plan reveal d1">
              <div className="pv plan-open" data-img="assets/planta-homeoffice.png" data-cap="Tipo decorado · Torre A · Final 07 · 64,62 m²">
                <span className="badge">
                  Decorado
                </span>
                <img className="planimg" src="/allegrato/a003.png" alt="Planta do apartamento decorado com home office, 64 m²" loading="lazy" />
                <span className="zoom">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7">
                    </circle>
                    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6">
                    </path>
                  </svg>
                  Ampliar planta
                </span>
              </div>
              <div className="pbody">
                <h3>
                  2 dorms + home office
                </h3>
                <div className="area">
                  64,62 m² · apartamento decorado
                </div>
                <ul>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Home office multifuncional
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Setorização íntima x social
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Planta do apartamento decorado
                  </li>
                </ul>
                <div className="pfoot">
                  <span className="vol">
                    Torre A · Final 07
                  </span>
                  <a className="wa-link" href={waDefault} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6">
                      </path>
                    </svg>
                    Ver disponibilidade
                  </a>
                </div>
              </div>
            </div>
            <div className="plan reveal d2">
              <div className="pv plan-open" data-img="assets/planta-2suites.png" data-cap="Tipo 2 suítes · Torre A · Final 03 · 63,75 m²">
                <span className="badge">
                  Topo da linha
                </span>
                <img className="planimg" src="/allegrato/a004.png" alt="Planta do apartamento com 2 suítes e lavabo, 63 m²" loading="lazy" />
                <span className="zoom">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7">
                    </circle>
                    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6">
                    </path>
                  </svg>
                  Ampliar planta
                </span>
              </div>
              <div className="pbody">
                <h3>
                  2 suítes + lavabo
                </h3>
                <div className="area">
                  63,75 m² · Torre A
                </div>
                <ul>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Duas suítes, diferenciação rara
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Lavabo social
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5">
                      </path>
                    </svg>
                    Vaga de garagem coberta
                  </li>
                </ul>
                <div className="pfoot">
                  <span className="vol">
                    Finais 3 e 4 · Torre A
                  </span>
                  <a className="wa-link" href={waDefault} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6">
                      </path>
                    </svg>
                    Ver disponibilidade
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ INVEST / SIMULATOR ============ */}
      <section className="invest block" id="investir">
        <div className="wrap">
          <div className="col-l reveal">
            <span className="eyebrow">
              Minha Casa Minha Vida · Faixa 3
            </span>
            <h2>
              A parcela pode ser menor que o seu aluguel.
            </h2>
            <p className="lead">
              Com renda familiar até R$ 9.600 e juros a partir de 8,16% ao ano, comprar na planta significa parcelas menores agora. Simule uma estimativa:
            </p>
            <div style={parseStyle('margin-top:30px')} className="simbox">
              {/* O simulador de parcela que ficava aqui foi removido: ele
                  calculava Tabela Price a 8,16% a.a. sobre 80% do valor em 360
                  meses e mostrava um numero exato na tela, sem FGTS, sem
                  subsidio e sem analise de credito. Numero preciso e errado
                  vira expectativa quebrada no atendimento. A simulacao passa a
                  ser feita pela LIA, com os dados da pessoa. */}
              <p className="sim-note" style={parseStyle('margin-bottom:18px')}>
                A simulacao considera renda, FGTS, subsidio do Minha Casa Minha Vida e o banco escolhido. Fazemos com voce, sem custo e sem compromisso.
              </p>
              <CtaSimulacao />
            </div>
          </div>
          <div className="col-r reveal d1">
            <span className="eyebrow">
              Por que comprar agora
            </span>
            <h2 style={parseStyle('font-size:clamp(1.8rem,3.4vw,2.6rem)')}>
              O preço de lançamento é o menor da vida do imóvel.
            </h2>
            <p style={parseStyle('margin-top:1rem')} className="lead">
              Histórico de valorização de lançamentos da Santa Angela no Medeiros, do preço de lançamento ao valor atual:
            </p>
            <div className="val-list">
              <div className="val-row">
                <div className="nm">
                  Maxx Santa Angela
                  <small>
                    entrega 2023
                  </small>
                </div>
                <div className="val-bar">
                  <i style={parseStyle('--w:100%')}>
                  </i>
                </div>
                <div className="pc">
                  +76%
                </div>
              </div>
              <div className="val-row">
                <div className="nm">
                  Torres de Ozanam
                  <small>
                    entrega 2022
                  </small>
                </div>
                <div className="val-bar">
                  <i style={parseStyle('--w:75%')}>
                  </i>
                </div>
                <div className="pc">
                  +57%
                </div>
              </div>
              <div className="val-row">
                <div className="nm">
                  Altos da Avenida
                  <small>
                    entrega 2024
                  </small>
                </div>
                <div className="val-bar">
                  <i style={parseStyle('--w:73%')}>
                  </i>
                </div>
                <div className="pc">
                  +56%
                </div>
              </div>
              <div className="val-row">
                <div className="nm">
                  Resort Prime
                  <small>
                    entrega 2025
                  </small>
                </div>
                <div className="val-bar">
                  <i style={parseStyle('--w:43%')}>
                  </i>
                </div>
                <div className="pc">
                  +33%
                </div>
              </div>
            </div>
            <p className="val-disc">
              Fonte: desempenho passado de empreendimentos da Santa Angela. Rentabilidade passada não garante rentabilidade futura, informação apresentada como contexto de mercado, nunca como promessa de ganho.
            </p>
          </div>
        </div>
      </section>
      {/* ============ TRUST ============ */}
      <section className="trust block">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow center">
              Segurança & Confiança
            </span>
            <h2>
              A tranquilidade de comprar com a nº 1 de Jundiaí.
            </h2>
          </div>
          <div className="trust-grid">
            <div className="tcard reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
                  </path>
                  <path d="m9 12 2 2 4-4">
                  </path>
                </svg>
              </div>
              <h3>
                Patrimônio de Afetação
              </h3>
              <p>
                O dinheiro dos compradores só pode ser usado nesta obra, protegido mesmo em caso de problema da incorporadora.
              </p>
            </div>
            <div className="tcard reveal d1">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 11l3 3L22 4">
                  </path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11">
                  </path>
                </svg>
              </div>
              <h3>
                Aprovação total
              </h3>
              <p>
                Prefeitura de Jundiaí (Alvará SAEPRO1318/2025) e GRAPROHAB (nº 230/2024). Incorporação registrada na matrícula.
              </p>
            </div>
            <div className="tcard reveal d2">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5">
                  </path>
                </svg>
              </div>
              <h3>
                40+ anos de história
              </h3>
              <p>
                Santa Angela: mais de 20 empreendimentos entregues em Jundiaí e prêmios Master Imobiliário.
              </p>
            </div>
            <div className="tcard reveal d3">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z">
                  </path>
                  <path d="M14 2v6h6M9 13l2 2 4-4">
                  </path>
                </svg>
              </div>
              <h3>
                Matrícula limpa
              </h3>
              <p>
                Matrícula nº 187.994 (1º RI de Jundiaí), sem hipotecas, penhoras ou ações.
              </p>
            </div>
          </div>
          <div className="certs reveal">
            <span className="cert">
              PBQP-H nível A
            </span>
            <span className="cert">
              ISO 9001:2015
            </span>
            <span className="cert">
              NBR 15575 · Desempenho
            </span>
            <span className="cert">
              NBR 9050 · Acessibilidade
            </span>
            <span className="cert">
              NBR 16071 · Playground
            </span>
          </div>
        </div>
      </section>
      {/* ============ LEAD CTA ============ */}
      <section className="lead-cta block" id="contato">
        <div className="bg">
          <img src="/allegrato/a008.jpg" alt="" />
        </div>
        <div className="wrap">
          <div className="col-l reveal">
            <span className="eyebrow">
              Lista VIP de pré-lançamento
            </span>
            <h2>
              Existe um momento que muda tudo. É agora.
            </h2>
            <p className="lead">
              Garanta as melhores unidades e as condições de pré-lançamento antes de todo mundo. Um corretor especialista entra em contato com você.
            </p>
            <ul className="cta-points">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5">
                  </path>
                </svg>
                Prioridade na escolha das melhores unidades
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5">
                  </path>
                </svg>
                Simulação MCMV / CAIXA feita na hora
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5">
                  </path>
                </svg>
                Visita ao decorado agendada com um especialista
              </li>
            </ul>
          </div>
          <div className="col-r reveal d1">
            <div className="form-card">
              <div id="formView" style={sentUrl ? { display: 'none' } : undefined}>
                <h3>
                  Quero condições de pré-lançamento
                </h3>
                <p className="fc-sub">
                  Preencha e fale com um especialista pelo WhatsApp.
                </p>
                <form id="leadForm" noValidate onSubmit={onSubmit}>
                  <div className="field">
                    <label htmlFor="nome">
                      Nome
                    </label>
                    <input ref={nomeRef} type="text" id="nome" name="nome" placeholder="Seu nome completo" required />
                  </div>
                  <div className="field">
                    <label htmlFor="fone">
                      WhatsApp
                    </label>
                    <input
                      ref={foneRef}
                      type="tel"
                      id="fone"
                      name="fone"
                      placeholder="(11) 90000-0000"
                      required
                      value={fone}
                      onChange={(e) => setFone(maskFone(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="interesse">
                      Tipologia de interesse{' '}
                      <span style={parseStyle('font-weight:400')} className="muted">
                        (opcional)
                      </span>
                    </label>
                    <select ref={interesseRef} id="interesse" name="interesse">
                      <option value="">
                        Tanto faz / quero ajuda para escolher
                      </option>
                      <option>
                        2 dormitórios (55 m²)
                      </option>
                      <option>
                        2 dorms + home office (56 m²)
                      </option>
                      <option>
                        2 suítes + lavabo (63 m²)
                      </option>
                      <option>
                        Investimento / renda
                      </option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Quero falar com um especialista
                  </button>
                  <div className="or">
                    ou
                  </div>
                  <a style={parseStyle('width:100%')} className="btn btn-wa wa-link" href={waDefault} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2">
                      </path>
                    </svg>
                    Chamar agora no WhatsApp
                  </a>
                  <p className="privacy">
                    Ao enviar, você concorda em ser contatado sobre o Allegrato Residencial. Seus dados não são compartilhados com terceiros.
                  </p>
                </form>
              </div>
              <div style={sentUrl ? undefined : parseStyle('display:none')} id="successView" className="form-success">
                <div className="ck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5">
                    </path>
                  </svg>
                </div>
                <h3>
                  Recebemos seu contato!
                </h3>
                <p className="muted">
                  Estamos te levando para o WhatsApp para falar com um especialista agora mesmo. Se não abrir automaticamente, toque no botão abaixo.
                </p>
                <a style={parseStyle('margin-top:18px')} className="btn btn-wa wa-link" href={sentUrl || waDefault} target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2">
                    </path>
                  </svg>
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ FOOTER ============ */}
      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div>
              <img className="alle" src="/allegrato/a001.png" alt="Allegrato Residencial" />
              <p>
                Av. Juvenal Arantes, 1240, Bairro Medeiros, Jundiaí/SP.
                <br />
                Empreendimento Minha Casa Minha Vida da Santa Angela Construtora.
              </p>
              <div className="sa">
                <span style={parseStyle('font-size:.82rem')} className="muted">
                  Realização
                </span>
                <img src="/allegrato/a002.png" alt="Santa Angela Construtora" />
              </div>
            </div>
            <div>
              <h4>
                O empreendimento
              </h4>
              <ul>
                <li>
                  <a href="#lazer">
                    Áreas de lazer
                  </a>
                </li>
                <li>
                  <a href="#plantas">
                    Plantas e tipologias
                  </a>
                </li>
                <li>
                  <a href="#localizacao">
                    Localização
                  </a>
                </li>
                <li>
                  <a href="#diferenciais">
                    Diferenciais
                  </a>
                </li>
                <li>
                  <a href="#investir">
                    Minha Casa Minha Vida
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
                  <a className="wa-link" href={waDefault} target="_blank" rel="noopener">
                    WhatsApp de vendas
                  </a>
                </li>
                <li>
                  <a href="#contato">
                    Lista VIP de pré-lançamento
                  </a>
                </li>
                <li>
                  <a href="#contato">
                    Agendar visita com a equipe
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <p className="foot-legal">
              Imagens meramente ilustrativas. As perspectivas artísticas e plantas podem sofrer alterações sem aviso prévio. Mobiliário, decoração e paisagismo de áreas comuns conforme memorial descritivo e faseamento de entrega. Itens de lazer entregues por fases. Incorporação registrada sob matrícula nº 187.994 no 1º Oficial de Registro de Imóveis de Jundiaí/SP. Valores e condições sujeitos a análise de crédito e disponibilidade. © 2026 Santa Angela Construtora.
            </p>
            <span style={parseStyle('font-size:.78rem')} className="muted">
              SPE 27, Santa Angela Empreendimento Imobiliário Ltda.
            </span>
          </div>
        </div>
      </footer>
      {/* sticky whatsapp */}
      <a className="wa-float wa-link" href={waDefault} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2">
          </path>
        </svg>
        <span className="txt">
          Fale conosco
        </span>
      </a>
      {/* lightbox */}
      <div
        className={'lb' + (lb ? ' open' : '')}
        id="lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLb();
        }}
      >
        <button className="x" id="lbClose" aria-label="Fechar" onClick={closeLb}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12">
            </path>
          </svg>
        </button>
        <button
          className="nav-btn prev"
          id="lbPrev"
          aria-label="Anterior"
          onClick={(e) => {
            e.stopPropagation();
            stepLb(-1);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6">
            </path>
          </svg>
        </button>
        <img id="lbImg" src={lbItem?.src || undefined} alt={lbItem?.cap || ''} />
        <button
          className="nav-btn next"
          id="lbNext"
          aria-label="Próximo"
          onClick={(e) => {
            e.stopPropagation();
            stepLb(1);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6">
            </path>
          </svg>
        </button>
        <div className="cap" id="lbCap">
          {lbItem?.cap || ''}
        </div>
      </div>
    </>
  );
}
