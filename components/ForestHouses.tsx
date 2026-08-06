'use client';

/**
 * ForestHouses — porte 1:1 de forest-houses/index.html (formato CSS-class, sem dc-runtime).
 * Visual e comportamento idênticos ao estático.
 *
 * Estilos: todo o CSS literal vive em app/forest-houses/forest-houses.css (importado na page).
 * Interatividade: reimplementação fiel de forest-houses/a014.js + do <script> inline do <head>
 * (classe `js` em <html> + reveal de fallback) via um único useEffect.
 */

import React, { useEffect, useRef } from 'react';
import { sendLead } from '@/lib/lead';

export default function ForestHouses() {
  const rootRef = useRef<HTMLDivElement>(null);
  const yrRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // <script> inline do <head>: marca a página como js-enabled e revela como fallback.
    html.classList.add('js');
    const revealFallback = () => {
      const n = document.querySelectorAll('[data-reveal]:not(.in)');
      for (let i = 0; i < n.length; i++) n[i].classList.add('in');
    };
    const t1 = window.setTimeout(revealFallback, 900);
    const onLoad = () => window.setTimeout(revealFallback, 400);
    window.addEventListener('load', onLoad);

    const cleanups: Array<() => void> = [];

    /* ---------- Year ---------- */
    if (yrRef.current)
      yrRef.current.textContent = String(new Date().getFullYear());

    /* ---------- Reveal on scroll ---------- */
    const reveals = ([] as Element[]).slice.call(
      document.querySelectorAll('[data-reveal]'),
    );
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      reveals.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      reveals.forEach((el) => el.classList.add('in'));
    }

    /* ---------- Nav scroll state ---------- */
    const nav = document.getElementById('nav');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      // floating whatsapp appears after hero
      const wa = document.getElementById('waFloat');
      if (wa) {
        if (window.scrollY > window.innerHeight * 0.7) wa.classList.add('show');
        else wa.classList.remove('show');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /* ---------- Parallax ---------- */
    const parallaxEls = ([] as Element[]).slice.call(
      document.querySelectorAll('[data-parallax]'),
    ) as HTMLElement[];
    let ticking = false;
    function applyParallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const speed = parseFloat(el.getAttribute('data-parallax') || '') || 0.1;
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + -center * speed + 'px,0)';
      });
      ticking = false;
    }
    if (!reduce && parallaxEls.length) {
      const onParallaxScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(applyParallax);
          ticking = true;
        }
      };
      window.addEventListener('scroll', onParallaxScroll, { passive: true });
      window.addEventListener('resize', applyParallax);
      applyParallax();
      cleanups.push(() => {
        window.removeEventListener('scroll', onParallaxScroll);
        window.removeEventListener('resize', applyParallax);
      });
    }

    /* ---------- Counters ---------- */
    const counters = ([] as Element[]).slice.call(
      document.querySelectorAll('[data-count]'),
    ) as HTMLElement[];
    function fmt(n: number, sep: boolean) {
      if (!sep) return String(n);
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    function runCounter(el: HTMLElement) {
      const target = parseInt(el.getAttribute('data-count') || '', 10);
      const sep = el.hasAttribute('data-sep');
      if (reduce) {
        el.textContent = fmt(target, sep);
        return;
      }
      const dur = 1700;
      let start: number | null = null;
      function step(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased), sep);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              runCounter(e.target as HTMLElement);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 },
      );
      counters.forEach((el) => cio.observe(el));
      cleanups.push(() => cio.disconnect());
    } else {
      counters.forEach((el) => runCounter(el));
    }

    /* ---------- Mobile menu ---------- */
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (burger && menu) {
      const onBurger = () => {
        const open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      };
      const onMenuClick = (e: Event) => {
        if ((e.target as HTMLElement).tagName === 'A') {
          menu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      };
      burger.addEventListener('click', onBurger);
      menu.addEventListener('click', onMenuClick);
      cleanups.push(() => {
        burger.removeEventListener('click', onBurger);
        menu.removeEventListener('click', onMenuClick);
      });
    }

    /* ---------- Plantas tabs ---------- */
    const tabs = ([] as Element[]).slice.call(
      document.querySelectorAll('.plans__tabs button'),
    ) as HTMLElement[];
    const panels = ([] as Element[]).slice.call(
      document.querySelectorAll('.plans__panel'),
    ) as HTMLElement[];
    const tabHandlers: Array<[HTMLElement, () => void]> = [];
    tabs.forEach((btn) => {
      const onTab = () => {
        const key = btn.getAttribute('data-tab');
        tabs.forEach((b) => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        panels.forEach((p) => {
          p.classList.toggle('active', p.getAttribute('data-panel') === key);
        });
      };
      btn.addEventListener('click', onTab);
      tabHandlers.push([btn, onTab]);
    });
    cleanups.push(() => {
      tabHandlers.forEach(([btn, h]) => btn.removeEventListener('click', h));
    });

    /* ---------- Lightbox ---------- */
    const lb = document.getElementById('lightbox');
    const tiles = ([] as Element[]).slice.call(
      document.querySelectorAll('[data-img]'),
    ) as HTMLElement[];
    function openLB(src: string, cap: string) {
      if (!lb) return;
      lb.innerHTML =
        '<button class="lb__close" aria-label="Fechar">&times;</button>' +
        '<figure class="lb__fig"><img src="' +
        src +
        '" alt="' +
        (cap || '') +
        '" /><figcaption>' +
        (cap || '') +
        '</figcaption></figure>';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeLB() {
      if (!lb) return;
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        lb.innerHTML = '';
      }, 350);
    }
    const tileHandlers: Array<[HTMLElement, () => void]> = [];
    tiles.forEach((t) => {
      const onTile = () => {
        openLB(
          t.getAttribute('data-img') || '',
          t.getAttribute('data-cap') || '',
        );
      };
      t.addEventListener('click', onTile);
      tileHandlers.push([t, onTile]);
    });
    let onLbClick: ((e: MouseEvent) => void) | null = null;
    let onKeydown: ((e: KeyboardEvent) => void) | null = null;
    if (lb) {
      onLbClick = (e) => {
        if (
          e.target === lb ||
          (e.target as HTMLElement).classList.contains('lb__close')
        )
          closeLB();
      };
      onKeydown = (e) => {
        if (e.key === 'Escape' && lb.classList.contains('open')) closeLB();
      };
      lb.addEventListener('click', onLbClick);
      document.addEventListener('keydown', onKeydown);
    }
    cleanups.push(() => {
      tileHandlers.forEach(([t, h]) => t.removeEventListener('click', h));
      if (lb && onLbClick) lb.removeEventListener('click', onLbClick);
      if (onKeydown) document.removeEventListener('keydown', onKeydown);
    });

    /* ---------- Lead form -> WhatsApp ---------- */
    const form = document.getElementById('leadForm') as HTMLFormElement | null;
    if (form) {
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const f = form as unknown as {
          nome: HTMLInputElement;
          tel: HTMLInputElement;
          email: HTMLInputElement;
          interesse: HTMLSelectElement;
        };
        const nome = f.nome;
        const tel = f.tel;
        let valid = true;
        [nome, tel].forEach((field) => {
          const wrap = field.closest('.field');
          if (!field.value.trim()) {
            wrap?.classList.add('invalid');
            valid = false;
          } else wrap?.classList.remove('invalid');
        });
        if (!valid) return;
        sendLead({
          name: nome.value.trim(),
          phone: tel.value.trim(),
          email: f.email.value.trim(),
          source: 'landing_forest-houses',
          interest: 'Forest Houses',
          message: f.interesse.value,
        });
        let msg = 'Olá! Sou ' + nome.value.trim() + '.';
        msg += ' Tenho interesse no Forest Houses (' + f.interesse.value + ').';
        if (f.email.value.trim())
          msg += ' Meu e-mail: ' + f.email.value.trim() + '.';
        msg +=
          ' Meu telefone: ' +
          tel.value.trim() +
          '. Podem me enviar mais informações?';
        const url =
          'https://wa.me/5511926143393?text=' + encodeURIComponent(msg);
        document.getElementById('formOk')?.classList.add('show');
        form.style.display = 'none';
        window.open(url, '_blank');
      };
      form.addEventListener('submit', onSubmit);
      const inputHandlers: Array<[HTMLElement, () => void]> = [];
      ['nome', 'tel'].forEach((id) => {
        const el = (form as unknown as Record<string, HTMLInputElement>)[id];
        if (!el) return;
        const onInput = () => {
          if (el.value.trim()) el.closest('.field')?.classList.remove('invalid');
        };
        el.addEventListener('input', onInput);
        inputHandlers.push([el, onInput]);
      });
      cleanups.push(() => {
        form.removeEventListener('submit', onSubmit);
        inputHandlers.forEach(([el, h]) => el.removeEventListener('input', h));
      });
    }

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener('load', onLoad);
      cleanups.forEach((c) => c());
    };
  }, []);

  const zoomIco = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 8v6M8 11h6" />
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  return (
    <div ref={rootRef}>
      {/* ====================== NAV ====================== */}
      <header className="nav" id="nav" data-screen-label="Navegação">
        <div className="container nav__inner">
          <a href="#top" className="nav__brand" aria-label="Lotus Brokers — início">
            <span className="bmark">Japi</span>
            <span className="bsub">Lançamentos</span>
          </a>
          <nav className="nav__menu" id="menu" aria-label="Navegação principal">
            <a href="#conceito">Conceito</a>
            <a href="#tecnologia">Diferenciais</a>
            <a href="#fachadas">Galeria</a>
            <a href="#plantas">Plantas</a>
            <a href="#lazer">Lazer</a>
            <a href="#localizacao">Localização</a>
          </nav>
          <div className="nav__cta">
            <a href="tel:+5511926143393" className="nav__phone">
              <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" /></svg>
              (11) 92614-3393
            </a>
            <a href="#contato" className="btn btn--light">Agendar visita</a>
            <button className="nav__burger" id="burger" aria-label="Abrir menu" aria-expanded="false"><span /><span /><span /></button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ====================== HERO ====================== */}
        <section className="hero" data-screen-label="Hero" id="hero">
          <div className="hero__media" data-parallax="0.18">
            <img src="/forest-houses/a002.jpg" alt="Fachada das casas do Forest Houses ao entardecer, arquitetura moderna em branco e madeira" fetchPriority="high" />
          </div>
          <div className="container hero__inner">
            <p className="eyebrow hero__eyebrow" data-reveal="" style={{ '--d': '80ms' } as React.CSSProperties}>Casas em condomínio · Louveira / SP</p>
            <h1 className="display" data-reveal="" style={{ '--d': '180ms' } as React.CSSProperties}>Forest Houses<span className="accent">Viver é natural.</span></h1>
            <p className="hero__sub" data-reveal="" style={{ '--d': '320ms' } as React.CSSProperties}>Um estilo de vida moderno, conectado à natureza — a apenas 2 km do centro de Louveira. Natural, moderno e funcional.</p>
            <div className="hero__specs" data-reveal="" style={{ '--d': '440ms' } as React.CSSProperties}>
              <span className="hero__chip"><b>147 m²</b></span>
              <span className="hero__chip"><b>200 m²</b></span>
              <span className="hero__chip"><b>3 Suítes</b> com sacada</span>
            </div>
            <div className="hero__actions" data-reveal="" style={{ '--d': '560ms' } as React.CSSProperties}>
              <a href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Forest%20Houses%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." target="_blank" rel="noopener" className="btn btn--wa">
                <svg className="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.14L2 22l4.97-1.3A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 0 16.2 8 8 0 0 1-4.1-1.12l-.3-.18-2.95.77.79-2.87-.2-.3a8.1 8.1 0 0 1 6.76-12.5Zm-2.6 4.3c-.13-.3-.27-.3-.4-.31h-.34a.66.66 0 0 0-.48.22 2 2 0 0 0-.63 1.5c0 .88.64 1.73.73 1.85.09.12 1.25 1.98 3.1 2.7 1.53.6 1.84.48 2.18.45.34-.03 1.1-.45 1.26-.88.16-.44.16-.8.11-.89-.04-.08-.16-.13-.34-.22s-1.1-.54-1.26-.6c-.17-.06-.3-.09-.42.09-.12.18-.48.6-.59.72-.1.12-.22.13-.4.04a5 5 0 0 1-1.49-.92 5.6 5.6 0 0 1-1.03-1.28c-.1-.18-.01-.28.08-.37l.27-.32c.09-.1.12-.18.18-.3.06-.12.03-.22-.01-.31-.05-.09-.42-1.02-.58-1.4Z" /></svg>
                Falar no WhatsApp
              </a>
              <a href="#conceito" className="btn btn--ghost" style={{ '--fg': 'var(--sand)', borderColor: 'rgba(255,255,255,.3)' } as React.CSSProperties}>Explorar o empreendimento</a>
            </div>
          </div>
          <a href="#conceito" className="hero__scroll" aria-label="Rolar para baixo">Scroll<span className="bar" /></a>
        </section>

        {/* ====================== TICKER ====================== */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            <span>Natural</span><span>Moderno</span><span>Funcional</span><span>3 Suítes com sacada</span><span>Lazer completo</span><span>Áreas verdes</span>
            <span>Natural</span><span>Moderno</span><span>Funcional</span><span>3 Suítes com sacada</span><span>Lazer completo</span><span>Áreas verdes</span>
          </div>
        </div>

        {/* ====================== CONCEITO ====================== */}
        <section className="section intro" id="conceito" data-screen-label="Conceito">
          <div className="container intro__grid">
            <div className="intro__text">
              <p className="eyebrow" data-reveal="">O conceito</p>
              <div className="intro__words" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <span className="w">Natural,</span>
                <span className="w">moderno,</span>
                <span className="w"><b>funcional.</b></span>
              </div>
              <p className="lead" data-reveal="" style={{ '--d': '240ms', marginTop: '32px' } as React.CSSProperties}>Forest Houses nasce do encontro entre arquitetura contemporânea e o verde que o cerca. Volumes limpos, madeira natural e amplas sacadas desenham casas pensadas para integrar os ambientes — e a sua rotina — à paisagem.</p>
              <div data-reveal="" style={{ '--d': '360ms', marginTop: '36px' } as React.CSSProperties}>
                <a href="#fachadas" className="textlink">Ver fachadas e renders <span className="ar">→</span></a>
              </div>
            </div>
            <div className="intro__media">
              <div className="frame" data-reveal="">
                <img src="/forest-houses/a003.jpg" alt="Vista das casas do Forest Houses na rua interna do condomínio ao entardecer" loading="lazy" />
              </div>
              <div className="intro__badge" data-reveal="" style={{ '--d': '300ms' } as React.CSSProperties}>
                <div className="n">3</div>
                <div className="t">Suítes, todas com sacada — incluindo a suíte casal com closet</div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== TECNOLOGIA / DIFERENCIAIS ====================== */}
        <section className="section tech" id="tecnologia" data-screen-label="Diferenciais">
          <div className="container">
            <div className="tech__head">
              <div>
                <p className="eyebrow" data-reveal="">Diferenciais</p>
                <h2 className="h-xl" data-reveal="" style={{ '--d': '120ms', marginTop: '18px' } as React.CSSProperties}>Infraestrutura que pensa<br />à frente do seu tempo.</h2>
                <div className="tech__pills" data-reveal="" style={{ '--d': '220ms' } as React.CSSProperties}>
                  <span>Tecnologia</span><span>Economia</span><span>Conforto</span>
                </div>
              </div>
              <p className="lead" data-reveal="" style={{ '--d': '200ms' } as React.CSSProperties}>Cada casa entrega uma base completa de infraestrutura — do cabeamento à automação — para você morar com mais conforto, eficiência e tranquilidade desde o primeiro dia.</p>
            </div>

            <div className="tech__grid">
              <article className="tech__item" data-reveal="" style={{ '--d': '0ms' } as React.CSSProperties}>
                <span className="num">01</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 18h18M5 18V9m14 9V9M3 9l9-5 9 5M9 18v-4h6v4" /></svg>
                <div><h3>Fiação subterrânea</h3><p>Cabeamento sob o solo — sem postes ou fios aparentes na paisagem.</p></div>
              </article>
              <article className="tech__item" data-reveal="" style={{ '--d': '90ms' } as React.CSSProperties}>
                <span className="num">02</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9zM12 4v2M12 18v2M4 12h2M18 12h2" /></svg>
                <div><h3>Infraestrutura por automação</h3><p>Preparada para sistemas inteligentes de controle da residência.</p></div>
              </article>
              <article className="tech__item" data-reveal="" style={{ '--d': '180ms' } as React.CSSProperties}>
                <span className="num">03</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20v-9l8-5 8 5v9M4 20h16M9 20v-5h6v5M7 11h.01M17 11h.01" /></svg>
                <div><h3>Área gourmet com churrasqueira</h3><p>Espaço integrado para receber, na medida certa entre interior e quintal.</p></div>
              </article>
              <article className="tech__item" data-reveal="" style={{ '--d': '0ms' } as React.CSSProperties}>
                <span className="num">04</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 4l-3 8h4l-3 8M6 4h6M6 20h6" /></svg>
                <div><h3>Gás encanado</h3><p>Fornecimento contínuo e seguro, sem a troca de botijões.</p></div>
              </article>
              <article className="tech__item" data-reveal="" style={{ '--d': '90ms' } as React.CSSProperties}>
                <span className="num">05</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 7h7a4 4 0 0 1 4 4v2M7 4v6m4-6v6M5 10h8M16 21v-4m-2 2h4" /></svg>
                <div><h3>Ponto de carga elétrica</h3><p>Preparação para recarga de veículo elétrico na própria casa.</p></div>
              </article>
              <article className="tech__item" data-reveal="" style={{ '--d': '180ms' } as React.CSSProperties}>
                <span className="num">06</span>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8h18M3 12h18M6 16h2M11 16h2M16 16h2M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /></svg>
                <div><h3>Infraestrutura para ar-condicionado</h3><p>Pontos previstos para climatização nos principais ambientes.</p></div>
              </article>
            </div>

            <div className="tech__feature">
              <div data-reveal="">
                <p className="eyebrow">Tecnologia invisível</p>
                <h3 className="h-lg" style={{ marginTop: '16px', color: 'var(--sand)' }}>O que você não vê, valoriza o que você vive.</h3>
                <p className="lead" style={{ marginTop: '20px' }}>A fiação subterrânea e os pontos de carga elétrica são planejados desde o projeto — preservando a vista, a segurança e a estética do condomínio.</p>
              </div>
              <div className="frame" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <img src="/forest-houses/a013.jpg" alt="Ilustração técnica da fiação subterrânea e ponto de carga elétrica do Forest Houses" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================== FACHADAS / GALERIA ====================== */}
        <section className="section" id="fachadas" data-screen-label="Galeria de fachadas">
          <div className="container">
            <div className="gal__head">
              <div>
                <p className="eyebrow" data-reveal="">Galeria · Fachadas</p>
                <h2 className="h-xl" data-reveal="" style={{ '--d': '120ms', marginTop: '18px' } as React.CSSProperties}>Arquitetura que<br />conversa com a mata.</h2>
              </div>
              <p className="lead" data-reveal="" style={{ '--d': '200ms' } as React.CSSProperties}>Linhas horizontais, branco arquitetônico e madeira — perspectivas artísticas do condomínio.</p>
            </div>

            <div className="mosaic">
              <button className="tile r2" data-span="8" data-reveal="" data-img="/forest-houses/a000.jpg" data-cap="Fachada frontal" aria-label="Ampliar fachada frontal">
                <img src="/forest-houses/a000.jpg" alt="Fachada frontal das casas Forest Houses com garagem ao entardecer" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Tipo 1 · 147m²</span><span className="t">Fachada frontal</span></span>
              </button>
              <button className="tile" data-span="4" data-reveal="" style={{ '--d': '90ms' } as React.CSSProperties} data-img="/forest-houses/a001.jpg" data-cap="Fachada de fundo" aria-label="Ampliar fachada de fundo">
                <img src="/forest-houses/a001.jpg" alt="Fachada de fundo com sacadas amplas" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Sacadas</span><span className="t">Fachada de fundo</span></span>
              </button>
              <button className="tile" data-span="4" data-reveal="" style={{ '--d': '160ms' } as React.CSSProperties} data-img="/forest-houses/a009.jpg" data-cap="Perspectiva do condomínio" aria-label="Ampliar perspectiva aérea">
                <img src="/forest-houses/a009.jpg" alt="Perspectiva aérea do condomínio Forest Houses entre áreas verdes" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Vista aérea</span><span className="t">Implantação no verde</span></span>
              </button>
              <button className="tile" data-span="4" data-reveal="" data-img="/forest-houses/a007.jpg" data-cap="Ponto de carga elétrica na garagem" aria-label="Ampliar ponto de carga elétrica">
                <img src="/forest-houses/a007.jpg" alt="Morador carregando carro elétrico no ponto de recarga da garagem do Forest Houses" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Garagem</span><span className="t">Ponto de carga elétrica</span></span>
              </button>
              <button className="tile" data-span="4" data-reveal="" style={{ '--d': '90ms' } as React.CSSProperties} data-img="/forest-houses/a012.jpg" data-cap="Condomínio ao entardecer" aria-label="Ampliar vista aérea ao entardecer">
                <img src="/forest-houses/a012.jpg" alt="Vista aérea do condomínio Forest Houses ao entardecer" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Implantação</span><span className="t">Vista geral</span></span>
              </button>
              <button className="tile" data-span="4" data-reveal="" style={{ '--d': '160ms' } as React.CSSProperties} data-img="/forest-houses/a011.jpg" data-cap="Portaria" aria-label="Ampliar portaria">
                <img src="/forest-houses/a011.jpg" alt="Portaria do condomínio Forest Houses ao entardecer" loading="lazy" />
                <span className="zoom">{zoomIco}</span>
                <span className="tile__cap"><span className="k">Acesso · Segurança</span><span className="t">Portaria</span></span>
              </button>
            </div>
          </div>
        </section>

        {/* ====================== INTERIORES ====================== */}
        <section className="section interiors" id="interiores" data-screen-label="Interiores">
          <div className="container">
            <div className="interiors__lead">
              <div data-reveal="">
                <p className="eyebrow">Ambientes integrados</p>
                <h2 className="h-xl" style={{ marginTop: '18px' }}>Sala de estar e<br />jantar em um só<br />respiro.</h2>
                <p className="lead" style={{ marginTop: '22px' }}>Pé-direito generoso, iluminação linear e continuidade visual entre living, jantar e área gourmet. A casa abre para a sacada e deixa a luz natural conduzir o dia.</p>
                <div style={{ marginTop: '30px' }}><a href="#plantas" className="textlink">Conhecer as plantas <span className="ar">→</span></a></div>
              </div>
              <div className="frame" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <img src="/forest-houses/a005.jpg" alt="Sala de estar e jantar integradas do Forest Houses, com sofá branco e iluminação linear" loading="lazy" />
              </div>
            </div>

            <div className="interiors__tags" data-reveal="">
              <span>Living</span><span>Sala de jantar</span><span>Cozinha</span><span>Área gourmet</span><span>Sacada</span><span>Pé-direito amplo</span><span>Iluminação linear</span>
            </div>
          </div>
        </section>

        {/* ====================== PLANTAS ====================== */}
        <section className="section plans" id="plantas" data-screen-label="Plantas">
          <div className="container">
            <div className="plans__top">
              <div data-reveal="">
                <p className="eyebrow">Plantas</p>
                <h2 className="h-lg" style={{ marginTop: '14px' }}>Dois metragens, uma mesma generosidade.</h2>
              </div>
              <dl className="plans__specs" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <div><dt>Tipo 1</dt><dd>147 m²</dd></div>
                <div><dt>Tipo 2</dt><dd>200 m²</dd></div>
                <div><dt>Suítes</dt><dd>3 c/ sacada</dd></div>
                <div><dt>Pavimentos</dt><dd>Térreo + superior</dd></div>
              </dl>
            </div>

            <div className="plans__viewer-wrap" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div className="plans__tabs" role="tablist">
                <button className="active" data-tab="terreo" role="tab" aria-selected="true">Piso térreo</button>
                <button data-tab="superior" role="tab" aria-selected="false">Piso superior</button>
              </div>
              <div className="plans__viewer">
                <div className="plans__panel active" data-panel="terreo">
                  <button className="plan-fig" data-img="/forest-houses/a008.jpg" data-cap="Planta piso térreo — Tipo 1" aria-label="Ampliar planta do piso térreo">
                    <img src="/forest-houses/a008.jpg" alt="Planta do piso térreo da casa Tipo 1 do Forest Houses" loading="lazy" />
                    <span className="plan-zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 8v6M8 11h6" /><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg> Ampliar</span>
                  </button>
                  <div className="cap"><span>Planta piso térreo — Tipo 1</span><span>Clique para ampliar</span></div>
                </div>
                <div className="plans__panel" data-panel="superior">
                  <button className="plan-fig" data-img="/forest-houses/a006.jpg" data-cap="Planta piso superior — 3 suítes" aria-label="Ampliar planta do piso superior">
                    <img src="/forest-houses/a006.jpg" alt="Planta do piso superior com 3 suítes" loading="lazy" />
                    <span className="plan-zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 8v6M8 11h6" /><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg> Ampliar</span>
                  </button>
                  <div className="cap"><span>Planta piso superior — 3 suítes</span><span>Clique para ampliar</span></div>
                </div>
              </div>
            </div>

            <p className="plans__note" data-reveal="">Inclui área gourmet com churrasqueira, despensa, lavanderia e espaço para academia. Imagens ilustrativas.</p>
          </div>
        </section>

        {/* ====================== LAZER ====================== */}
        <section className="section lazer" id="lazer" data-screen-label="Lazer">
          <div className="container">
            <div className="lazer__head">
              <div>
                <p className="eyebrow" data-reveal="">Lazer</p>
                <h2 className="h-xl" data-reveal="" style={{ '--d': '120ms', marginTop: '18px' } as React.CSSProperties}>Completo por natureza.</h2>
              </div>
              <p className="lead" data-reveal="" style={{ '--d': '200ms' } as React.CSSProperties}>Mais de 30 mil m² dedicados ao convívio e ao verde — um clube a céu aberto, do beach tennis às piscinas, dentro de casa.</p>
            </div>

            <div className="lazer__stats">
              <div className="stat" data-reveal="">
                <div className="n"><span data-count="5919" data-sep="">0</span><span className="u">m²</span></div>
                <div className="t">Área de lazer</div>
              </div>
              <div className="stat" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <div className="n"><span data-count="1681" data-sep="">0</span><span className="u">m²</span></div>
                <div className="t">Paisagismo</div>
              </div>
              <div className="stat" data-reveal="" style={{ '--d': '240ms' } as React.CSSProperties}>
                <div className="n"><span data-count="22978" data-sep="">0</span><span className="u">m²</span></div>
                <div className="t">Áreas verdes</div>
              </div>
            </div>

            <div className="lazer__media">
              <div className="frame wide" data-reveal="">
                <img src="/forest-houses/a010.jpg" alt="Piscinas e área de lazer do Forest Houses ao entardecer" loading="lazy" />
              </div>
              <div className="frame" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
                <img src="/forest-houses/a004.jpg" alt="Brinquedoteca colorida do condomínio" loading="lazy" />
              </div>
              <div className="frame" data-reveal="" style={{ '--d': '220ms' } as React.CSSProperties}>
                <img src="/forest-houses/a011.jpg" alt="Acesso e portaria do condomínio" loading="lazy" />
              </div>
            </div>

            <div className="lazer__amen" data-reveal="">
              <span>Beach Tênis</span><span>Espaços Pet</span><span>Salão de Festas</span><span>Coworking</span><span>Piscina Adulto</span><span>Piscina Infantil</span><span>Churrasqueiras</span><span>Salão de Jogos</span><span>Academia</span><span>Vestiários</span><span>Playground</span><span>Área Gourmet</span><span>Brinquedoteca</span>
            </div>
          </div>
        </section>

        {/* ====================== LOCALIZAÇÃO ====================== */}
        <section className="section loc" id="localizacao" data-screen-label="Localização">
          <div className="container loc__grid">
            <div>
              <p className="eyebrow" data-reveal="">Localização</p>
              <h2 className="h-xl" data-reveal="" style={{ '--d': '120ms', marginTop: '18px' } as React.CSSProperties}>No coração de<br />Louveira, perto<br />de tudo.</h2>
              <p className="lead" data-reveal="" style={{ '--d': '200ms', marginTop: '22px' } as React.CSSProperties}>A 2 km do centro e conectado às principais cidades do interior e à capital pelas rodovias da região.</p>
              <div className="loc__list" data-reveal="" style={{ '--d': '280ms' } as React.CSSProperties}>
                <div className="dist">
                  <div className="km">2<span className="u">km</span></div>
                  <div className="place"><div className="p">Louveira — Centro</div><div className="s">Comércio, serviços e o dia a dia ao lado</div></div>
                  <div className="time">4 min</div>
                </div>
                <div className="dist">
                  <div className="km">15<span className="u">km</span></div>
                  <div className="place"><div className="p">Jundiaí</div><div className="s">Polo de compras, saúde e educação</div></div>
                  <div className="time">20 min</div>
                </div>
                <div className="dist">
                  <div className="km">28<span className="u">km</span></div>
                  <div className="place"><div className="p">Campinas</div><div className="s">Hub regional do interior paulista</div></div>
                  <div className="time">30 min</div>
                </div>
                <div className="dist">
                  <div className="km">60<span className="u">km</span></div>
                  <div className="place"><div className="p">São Paulo</div><div className="s">Capital, pela malha de rodovias</div></div>
                  <div className="time">50 min</div>
                </div>
              </div>
            </div>
            <div className="loc__map" data-reveal="">
              <iframe title="Mapa de Louveira / SP — Forest Houses" src="https://www.google.com/maps?q=Louveira,+S%C3%A3o+Paulo,+Brasil&z=13&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <a className="loc__maplink" href="https://www.google.com/maps/search/?api=1&query=Louveira+SP" target="_blank" rel="noopener">
                <span className="dot" /> Abrir no Google Maps →
              </a>
            </div>
          </div>
        </section>

        {/* ====================== CTA / FORM ====================== */}
        <section className="section cta" id="contato" data-screen-label="Contato">
          <div className="container cta__inner">
            <div>
              <p className="eyebrow" data-reveal="">Agende sua visita</p>
              <h2 className="h-xl" data-reveal="" style={{ '--d': '120ms', marginTop: '18px' } as React.CSSProperties}>Venha viver o<br />Forest Houses.</h2>
              <p className="lead" data-reveal="" style={{ '--d': '200ms' } as React.CSSProperties}>Fale com a Lotus Brokers e receba o material completo, valores e condições. Atendimento personalizado para você.</p>
              <div className="cta__contact" data-reveal="" style={{ '--d': '280ms' } as React.CSSProperties}>
                <a href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Forest%20Houses%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." target="_blank" rel="noopener">
                  <svg className="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.14L2 22l4.97-1.3A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 0 16.2 8 8 0 0 1-4.1-1.12l-.3-.18-2.95.77.79-2.87-.2-.3a8.1 8.1 0 0 1 6.76-12.5Z" /></svg>
                  (11) 92614-3393 · WhatsApp
                </a>
                <a href="tel:+5511926143393">
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" /></svg>
                  Ligar agora
                </a>
              </div>
            </div>

            <div className="form" data-reveal="" style={{ '--d': '120ms' } as React.CSSProperties}>
              <form id="leadForm" noValidate>
                <h3>Receba informações</h3>
                <p className="sm">Preencha e enviamos tudo pelo WhatsApp.</p>
                <div className="field"><label htmlFor="nome">Nome</label><input id="nome" name="nome" type="text" placeholder="Seu nome completo" required /></div>
                <div className="field"><label htmlFor="tel">Telefone / WhatsApp</label><input id="tel" name="tel" type="tel" placeholder="(11) 90000-0000" required /></div>
                <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" placeholder="voce@email.com" /></div>
                <div className="field"><label htmlFor="interesse">Tenho interesse em</label>
                  <select id="interesse" name="interesse" defaultValue="Casa de 147m²">
                    <option value="Casa de 147m²">Casa de 147 m²</option>
                    <option value="Casa de 200m²">Casa de 200 m²</option>
                    <option value="Ainda estou decidindo">Ainda estou decidindo</option>
                  </select>
                </div>
                <button type="submit" className="btn btn--wa" style={{ '--bg': 'var(--forest)', '--fg': 'var(--sand)' } as React.CSSProperties}>
                  <svg className="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.14L2 22l4.97-1.3A9.9 9.9 0 1 0 12.04 2Z" /></svg>
                  Enviar pelo WhatsApp
                </button>
                <p className="form__note">Ao enviar, você concorda em ser contatado pela Lotus Brokers sobre o Forest Houses.</p>
              </form>
              <div className="form__ok" id="formOk">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>
                <h3>Quase lá!</h3>
                <p className="sm" style={{ marginTop: '8px' }}>Abrimos o WhatsApp com sua mensagem. É só enviar para falar com nossa equipe.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="footer" data-screen-label="Rodapé">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="bmark">Forest Houses</div>
              <p>Casas em condomínio em Louveira/SP. Natural, moderno e funcional — um estilo de vida conectado à natureza.</p>
            </div>
            <div className="footer__col">
              <h4>Navegar</h4>
              <a href="#conceito">Conceito</a>
              <a href="#tecnologia">Diferenciais</a>
              <a href="#fachadas">Galeria</a>
              <a href="#plantas">Plantas</a>
              <a href="#lazer">Lazer</a>
              <a href="#localizacao">Localização</a>
            </div>
            <div className="footer__col">
              <h4>Contato — Lotus Brokers</h4>
              <a href="https://wa.me/5511926143393" target="_blank" rel="noopener">WhatsApp (11) 92614-3393</a>
              <a href="tel:+5511926143393">Ligar: (11) 92614-3393</a>
              <p>Louveira / SP</p>
              <a href="#contato">Agendar visita</a>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© <span id="yr" ref={yrRef}>2026</span> Lotus Brokers · Forest Houses</span>
            <span>Desenvolvido para a Lotus Brokers</span>
          </div>
          <p className="footer__disclaimer">Imagens meramente ilustrativas. Projeto sujeito a alterações sem aviso prévio. Os acabamentos e projetos serão definidos no memorial descritivo do produto. As perspectivas e renders têm caráter artístico e de demonstração.</p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Forest%20Houses." target="_blank" rel="noopener" className="wa-float" id="waFloat" aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.14L2 22l4.97-1.3A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 0 16.2 8 8 0 0 1-4.1-1.12l-.3-.18-2.95.77.79-2.87-.2-.3a8.1 8.1 0 0 1 6.76-12.5Zm4.7 10.3c-.04-.09-.16-.13-.34-.22s-1.1-.54-1.26-.6c-.17-.06-.3-.09-.42.09-.12.18-.48.6-.59.72-.1.12-.22.13-.4.04a5 5 0 0 1-1.49-.92 5.6 5.6 0 0 1-1.03-1.28c-.1-.18-.01-.28.08-.37l.27-.32c.09-.1.12-.18.18-.3.06-.12.03-.22-.01-.31-.05-.09-.42-1.02-.58-1.4-.13-.3-.27-.3-.4-.31h-.34a.66.66 0 0 0-.48.22 2 2 0 0 0-.63 1.5c0 .88.64 1.73.73 1.85.09.12 1.25 1.98 3.1 2.7 1.53.6 1.84.48 2.18.45.34-.03 1.1-.45 1.26-.88.16-.44.16-.8.11-.89Z" /></svg>
      </a>

      {/* Lightbox */}
      <div className="lightbox" id="lightbox" aria-hidden="true" />
    </div>
  );
}
