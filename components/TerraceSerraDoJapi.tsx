'use client';

/**
 * TerraceSerraDoJapi — porte 1:1 de terrace-serra-do-japi/index.html (formato CSS-class,
 * NÃO dc-runtime) para React/Next. Visual e comportamento idênticos ao estático.
 *
 * Estratégia de porte:
 *  - O markup do <body> é transcrito diretamente para JSX (class->className, tags
 *    self-closing, atributos data-* preservados literalmente, style inline -> objeto).
 *  - A interatividade (a046.js) é reimplementada FIELMENTE dentro de um único useEffect
 *    que opera sobre o DOM real via refs/seletores — mesma lógica imperativa do original
 *    (nav condense, reveal IntersectionObserver, parallax do hero, counters, tabs,
 *    drawer mobile, form->WhatsApp, lightbox gallery, roleta/carrossel, ano no rodapé).
 *  - Imagens: <img> normal. Arquivos aNNN copiados para /public/terrace-serra-do-japi/.
 *    data-full (lightbox) mantém os caminhos EXATOS do original (web/renders, web/img).
 */

import React, { useEffect, useRef } from 'react';
import { sendLead } from '@/lib/lead';

export default function TerraceSerraDoJapi() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* ---- nav condense ---- */
    const nav = root.querySelector<HTMLElement>('.nav');
    const waFloat = root.querySelector<HTMLElement>('.wa-float');
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('scrolled', y > 60);
      if (waFloat) waFloat.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- scroll reveal ---- */
    const revEls = root.querySelectorAll<HTMLElement>('.reveal, .img-reveal');
    let io: IntersectionObserver | null = null;
    let revealFailsafe: ReturnType<typeof setTimeout> | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io!.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      revEls.forEach(function (el) {
        io!.observe(el);
      });
      /* failsafe: reveal anything still hidden (e.g. inside fixed-height iframe embeds) */
      revealFailsafe = setTimeout(function () {
        root!
          .querySelectorAll('.reveal:not(.in), .img-reveal:not(.in)')
          .forEach(function (el) {
            el.classList.add('in');
          });
      }, 900);
    } else {
      revEls.forEach(function (el) {
        el.classList.add('in');
      });
    }

    /* ---- hero parallax ---- */
    const heroImg = root.querySelector<HTMLImageElement>('.hero__media img');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let onHeroScroll: (() => void) | null = null;
    if (heroImg && !reduce) {
      let ticking = false;
      onHeroScroll = function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            const y = window.scrollY || 0;
            if (y < window.innerHeight) {
              heroImg.style.transform =
                'translate3d(0,' + y * 0.32 + 'px,0) scale(1.04)';
            }
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', onHeroScroll, { passive: true });
    }

    /* ---- subtle parallax on [data-parallax] images ---- */
    let onPxScroll: (() => void) | null = null;
    if (!reduce) {
      const pxEls = ([] as HTMLElement[]).slice.call(
        root.querySelectorAll('[data-parallax]')
      );
      if (pxEls.length) {
        let pTick = false;
        const px = function () {
          const vh = window.innerHeight;
          pxEls.forEach(function (el) {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            const prog = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
            const amt = parseFloat(el.getAttribute('data-parallax') || '') || 6;
            el.style.transform =
              'translate3d(0,' + prog * amt * -1 + '%,0) scale(1.08)';
          });
          pTick = false;
        };
        onPxScroll = function () {
          if (!pTick) {
            window.requestAnimationFrame(px);
            pTick = true;
          }
        };
        window.addEventListener('scroll', onPxScroll, { passive: true });
        px();
      }
    }

    /* ---- counters ---- */
    function animateCount(el: HTMLElement) {
      const target = parseFloat(el.getAttribute('data-count') || '');
      const dec = (parseInt(el.getAttribute('data-dec') || '0', 10) || 0) | 0;
      const dur = 1600;
      let start: number | null = null;
      function stepFn(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = dec
          ? val.toFixed(dec)
          : Math.round(val).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(stepFn);
        else
          el.textContent = dec
            ? target.toFixed(dec)
            : target.toLocaleString('pt-BR');
      }
      requestAnimationFrame(stepFn);
    }
    const counters = root.querySelectorAll<HTMLElement>('[data-count]');
    let cio: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              animateCount(e.target as HTMLElement);
              cio!.unobserve(e.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        cio!.observe(el);
      });
    } else {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
    }

    /* ---- generic tab groups (lazer + plantas) ---- */
    const tabHandlers: Array<{ tab: Element; fn: () => void }> = [];
    function wireTabs(scope: string) {
      const groups = root!.querySelectorAll(scope);
      groups.forEach(function (group) {
        const tabs = group.querySelectorAll('[data-tab]');
        const panelHost = root!.querySelector(
          group.getAttribute('data-panels') || ''
        );
        tabs.forEach(function (tab) {
          const fn = function () {
            const id = tab.getAttribute('data-tab');
            tabs.forEach(function (t) {
              t.classList.toggle('active', t === tab);
            });
            if (panelHost) {
              panelHost.querySelectorAll('[data-panel]').forEach(function (pnl) {
                pnl.classList.toggle(
                  'active',
                  pnl.getAttribute('data-panel') === id
                );
              });
            }
          };
          tab.addEventListener('click', fn);
          tabHandlers.push({ tab, fn });
        });
      });
    }
    wireTabs('[data-tabs]');

    /* ---- mobile drawer ---- */
    const burger = root.querySelector<HTMLElement>('.nav__burger');
    const drawer = root.querySelector<HTMLElement>('.drawer');
    const drawerCleanups: Array<() => void> = [];
    if (burger && drawer) {
      const openFn = function () {
        drawer.classList.add('open');
      };
      burger.addEventListener('click', openFn);
      drawerCleanups.push(() => burger.removeEventListener('click', openFn));
      const closeEl = drawer.querySelector('.drawer__close');
      if (closeEl) {
        const closeFn = function () {
          drawer.classList.remove('open');
        };
        closeEl.addEventListener('click', closeFn);
        drawerCleanups.push(() =>
          closeEl.removeEventListener('click', closeFn)
        );
      }
      drawer.querySelectorAll('a').forEach(function (a) {
        const fn = function () {
          drawer.classList.remove('open');
        };
        a.addEventListener('click', fn);
        drawerCleanups.push(() => a.removeEventListener('click', fn));
      });
    }

    /* ---- form -> whatsapp ---- */
    const form = root.querySelector<HTMLFormElement>('#lead-form');
    let onFormSubmit: ((ev: Event) => void) | null = null;
    if (form) {
      onFormSubmit = function (ev: Event) {
        ev.preventDefault();
        const f = form as unknown as {
          nome: HTMLInputElement;
          telefone: HTMLInputElement;
          email: HTMLInputElement;
        };
        const nome = (f.nome.value || '').trim();
        const tel = (f.telefone.value || '').trim();
        const email = (f.email.value || '').trim();
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_terrace-serra-do-japi',
          interest: 'Terrace Serra do Japi',
        });
        const msg =
          'Ola! Tenho interesse no Terrace Serra do Japi (Jundiai).%0A%0A' +
          'Nome: ' +
          encodeURIComponent(nome) +
          '%0ATelefone: ' +
          encodeURIComponent(tel) +
          '%0AE-mail: ' +
          encodeURIComponent(email) +
          '%0A%0AGostaria de receber valores e condicoes.';
        const url = 'https://wa.me/5511926143393?text=' + msg;
        const ok = root!.querySelector<HTMLElement>('.form-ok');
        const inner = root!.querySelector<HTMLElement>('#lead-form');
        if (ok && inner) {
          inner.style.display = 'none';
          ok.classList.add('show');
        }
        window.open(url, '_blank');
      };
      form.addEventListener('submit', onFormSubmit);
    }

    /* ---- lightbox gallery ---- */
    type LbItem = { el: Element; full: string; name: string; cat: string };
    const lbCleanups: Array<() => void> = [];
    let lb: HTMLDivElement | null = null;
    (function () {
      const galleries = ([] as Element[]).slice.call(
        root!.querySelectorAll('[data-gallery]')
      );
      if (!galleries.length) return;
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML =
        '<div class="lightbox__count"></div>' +
        '<button class="lightbox__close" aria-label="Fechar">&times;</button>' +
        '<button class="lightbox__nav prev" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button class="lightbox__nav next" aria-label="Próxima"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<div class="lightbox__stage"><img class="lightbox__img" alt=""><div class="lightbox__cap"><div class="nm"></div><div class="ct"></div></div></div>';
      document.body.appendChild(lb);
      const imgEl = lb.querySelector<HTMLImageElement>('.lightbox__img')!;
      const nmEl = lb.querySelector<HTMLElement>('.lightbox__cap .nm')!;
      const ctEl = lb.querySelector<HTMLElement>('.lightbox__cap .ct')!;
      const countEl = lb.querySelector<HTMLElement>('.lightbox__count')!;
      const prevBtn = lb.querySelector<HTMLElement>('.lightbox__nav.prev')!;
      const nextBtn = lb.querySelector<HTMLElement>('.lightbox__nav.next')!;
      let current: LbItem[] = [];
      let idx = 0;

      function show(i: number) {
        idx = (i + current.length) % current.length;
        const it = current[idx];
        imgEl.classList.remove('ready');
        const pre = new Image();
        pre.onload = function () {
          imgEl.src = it.full;
          imgEl.alt = it.name;
          requestAnimationFrame(function () {
            imgEl.classList.add('ready');
          });
        };
        pre.src = it.full;
        if (pre.complete) {
          imgEl.src = it.full;
          imgEl.classList.add('ready');
        }
        nmEl.textContent = it.name;
        ctEl.textContent = it.cat;
        countEl.textContent = idx + 1 + ' / ' + current.length;
        const multi = current.length > 1;
        prevBtn.style.display = multi ? '' : 'none';
        nextBtn.style.display = multi ? '' : 'none';
        countEl.style.display = multi ? '' : 'none';
      }
      function open(group: LbItem[], i: number) {
        current = group;
        lb!.classList.add('open');
        document.body.style.overflow = 'hidden';
        show(i);
      }
      function close() {
        lb!.classList.remove('open');
        document.body.style.overflow = '';
      }

      galleries.forEach(function (g) {
        const items: LbItem[] = ([] as Element[]).slice
          .call(g.querySelectorAll('[data-lb]'))
          .map(function (el: Element) {
            // data-full veio do HTML estático com caminho relativo (web/renders/...);
            // no Next resolveria contra a rota atual → 404. Prefixa com a base
            // da landing quando não for absoluto.
            const rawFull = el.getAttribute('data-full') || '';
            const full =
              rawFull && !rawFull.startsWith('/') && !/^https?:/.test(rawFull)
                ? '/terrace-serra-do-japi/' + rawFull
                : rawFull;
            return {
              el: el,
              full: full,
              name: el.getAttribute('data-name') || '',
              cat: el.getAttribute('data-cat') || '',
            };
          });
        items.forEach(function (it, i) {
          const fn = function () {
            open(items, i);
          };
          it.el.addEventListener('click', fn);
          lbCleanups.push(() => it.el.removeEventListener('click', fn));
        });
      });
      const closeBtn = lb.querySelector('.lightbox__close')!;
      const closeFn = () => close();
      closeBtn.addEventListener('click', closeFn);
      const prevFn = function () {
        show(idx - 1);
      };
      const nextFn = function () {
        show(idx + 1);
      };
      prevBtn.addEventListener('click', prevFn);
      nextBtn.addEventListener('click', nextFn);
      const lbClickFn = function (e: MouseEvent) {
        const t = e.target as HTMLElement;
        if (t === lb || t.classList.contains('lightbox__stage')) close();
      };
      lb.addEventListener('click', lbClickFn);
      const keyFn = function (e: KeyboardEvent) {
        if (!lb!.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
      };
      document.addEventListener('keydown', keyFn);
      let sx = 0;
      const touchStartFn = function (e: TouchEvent) {
        sx = e.touches[0].clientX;
      };
      const touchEndFn = function (e: TouchEvent) {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) show(dx > 0 ? idx - 1 : idx + 1);
      };
      lb.addEventListener('touchstart', touchStartFn, { passive: true });
      lb.addEventListener('touchend', touchEndFn, { passive: true });

      lbCleanups.push(() => document.removeEventListener('keydown', keyFn));
    })();

    /* ---- interiors carousel (roleta) ---- */
    const roletaCleanups: Array<() => void> = [];
    ([] as Element[]).slice
      .call(root.querySelectorAll('[data-roleta]'))
      .forEach(function (r: Element) {
        const track = r.querySelector<HTMLElement>('.roleta__track')!;
        const prev = r.querySelector<HTMLButtonElement>('.roleta__btn.prev');
        const next = r.querySelector<HTMLButtonElement>('.roleta__btn.next');
        function step() {
          const s = track.querySelector<HTMLElement>('.roleta__slide');
          return s ? s.offsetWidth + 22 : track.clientWidth * 0.8;
        }
        function upd() {
          if (prev) prev.disabled = track.scrollLeft <= 4;
          if (next)
            next.disabled =
              track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        }
        if (prev) {
          const fn = function () {
            track.scrollBy({ left: -step(), behavior: 'smooth' });
          };
          prev.addEventListener('click', fn);
          roletaCleanups.push(() => prev.removeEventListener('click', fn));
        }
        if (next) {
          const fn = function () {
            track.scrollBy({ left: step(), behavior: 'smooth' });
          };
          next.addEventListener('click', fn);
          roletaCleanups.push(() => next.removeEventListener('click', fn));
        }
        track.addEventListener('scroll', upd, { passive: true });
        window.addEventListener('resize', upd);
        roletaCleanups.push(() => track.removeEventListener('scroll', upd));
        roletaCleanups.push(() => window.removeEventListener('resize', upd));
        upd();
      });

    /* ---- year ---- */
    const yr = root.querySelector<HTMLElement>('#year');
    if (yr) yr.textContent = String(new Date().getFullYear());

    /* ---- cleanup ---- */
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (onHeroScroll) window.removeEventListener('scroll', onHeroScroll);
      if (onPxScroll) window.removeEventListener('scroll', onPxScroll);
      if (io) io.disconnect();
      if (cio) cio.disconnect();
      if (revealFailsafe) clearTimeout(revealFailsafe);
      tabHandlers.forEach(({ tab, fn }) =>
        tab.removeEventListener('click', fn)
      );
      drawerCleanups.forEach((fn) => fn());
      if (form && onFormSubmit) form.removeEventListener('submit', onFormSubmit);
      lbCleanups.forEach((fn) => fn());
      if (lb && lb.parentNode) lb.parentNode.removeChild(lb);
      roletaCleanups.forEach((fn) => fn());
      document.body.style.overflow = '';
    };
  }, []);

  const IMG = '/terrace-serra-do-japi';

  return (
    <div ref={rootRef}>
      {/* ============ NAV ============ */}
      <header className="nav" id="nav">
        <a className="nav__brand" href="#topo" aria-label="Terrace Serra do Japi">
          <img
            className="nav__logo nav__logo--white"
            src={`${IMG}/a010.png`}
            alt="Terrace Serra do Japi"
          />
          <img
            className="nav__logo nav__logo--dark"
            src={`${IMG}/a005.png`}
            alt=""
            aria-hidden="true"
          />
        </a>
        <nav className="nav__links" aria-label="Navegação principal">
          <a href="#localizacao">Localização</a>
          <a href="#empreendimento">Empreendimento</a>
          <a href="#lazer">Lazer</a>
          <a href="#plantas">Plantas</a>
          <a href="#assinaturas">Assinaturas</a>
        </nav>
        <a className="nav__cta" href="#contato">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Fale com um consultor
        </a>
        <button className="nav__burger" aria-label="Abrir menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div className="drawer" id="drawer">
        <button className="drawer__close" aria-label="Fechar menu">
          ×
        </button>
        <img
          src={`${IMG}/a010.png`}
          alt="Terrace Serra do Japi"
          style={{ height: '38px', width: 'auto', marginBottom: '30px' }}
        />
        <a href="#localizacao">Localização</a>
        <a href="#empreendimento">Empreendimento</a>
        <a href="#lazer">Lazer</a>
        <a href="#plantas">Plantas</a>
        <a href="#assinaturas">Assinaturas</a>
        <a href="#contato">Fale conosco</a>
      </div>

      {/* ============ HERO ============ */}
      <section className="hero" id="topo" data-screen-label="Hero">
        <div className="hero__media">
          <img
            src={`${IMG}/a026.jpg`}
            alt="Perspectiva ilustrada das três torres do Terrace Serra do Japi em Jundiaí"
          />
        </div>
        <div className="hero__scrim"></div>
        <div className="hero__inner container">
          <span className="eyebrow hero__eyebrow">
            Jardim das Samambaias · Jundiaí — SP
          </span>
          <h1 className="hero__title">
            Terrace<span className="ital">Serra do Japi</span>
          </h1>
          <p className="hero__sub">
            Residências suspensas de 157 a 203 m², com vista permanente para a
            Serra do Japi e um padrão de lazer que redefine o morar bem em
            Jundiaí.
          </p>
          <div className="hero__cta-row">
            <a className="btn" href="#contato">
              Quero conhecer
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
            <a className="btn btn-ghost invert" href="#empreendimento">
              Ver o empreendimento
            </a>
          </div>
          <div className="hero__stats">
            <div className="hero__stat reveal d1">
              <div className="num">
                157–203<small style={{ fontSize: '.4em' }}> m²</small>
              </div>
              <div className="lbl">Residências</div>
            </div>
            <div className="hero__stat reveal d2">
              <div className="num">3</div>
              <div className="lbl">Torres exclusivas</div>
            </div>
            <div className="hero__stat reveal d3">
              <div className="num">104</div>
              <div className="lbl">Unidades no total</div>
            </div>
            <div className="hero__stat reveal d4">
              <div className="num">+25</div>
              <div className="lbl">Itens de lazer</div>
            </div>
          </div>
        </div>
        <div className="hero__scroll">
          <span>Role</span>
          <span className="line"></span>
        </div>
      </section>

      {/* ============ INTRO / SERRA ============ */}
      <section className="pad bg-paper2" id="intro">
        <div className="container">
          <div className="split img-left">
            <figure className="media-fig">
              <div className="img-reveal media-tall">
                <img
                  src={`${IMG}/a024.jpg`}
                  alt="Vista aérea da Serra do Japi, exuberante remanescente de Mata Atlântica no interior de São Paulo"
                />
              </div>
              <figcaption>
                Serra do Japi — remanescente de Mata Atlântica · Imagem
                ilustrativa
              </figcaption>
            </figure>
            <div>
              <span className="eyebrow reveal">A Serra a os seus pés</span>
              <h2 className="h2 reveal d1">
                Um privilégio
                <br />
                chamado <span className="serif-accent">paisagem</span>
              </h2>
              <p className="lead reveal d2">
                A Serra do Japi é uma amostra da exuberante Mata Atlântica no
                interior de São Paulo. Sua rica biodiversidade encanta pela
                paisagem deslumbrante — e, daqui, ela é sua todos os dias.
              </p>
              <p className="reveal d3">
                Localizada entre Jundiaí, Cabreúva, Pirapora do Bom Jesus e
                Cajamar, está a apenas 60 km da capital. Uma localização
                privilegiada que garante fácil acesso, serviços e infraestrutura
                — sem abrir mão da tranquilidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section className="pad" id="localizacao" data-screen-label="Localização">
        <div className="container">
          <div className="split loc-split">
            <div>
              <span className="eyebrow reveal">Localização</span>
              <h2 className="h2 reveal d1">
                Qualidade de vida
                <br />
                tem nome: <span className="serif-accent">Jundiaí</span>
              </h2>
              <p className="lead reveal d2">
                Ano após ano, a cidade aparece entre as mais bem colocadas no
                ranking nacional das melhores cidades para se viver —
                conquistando o topo no último ano.
              </p>
              <p className="reveal d3">
                No bairro Jardim das Samambaias, um dos pontos mais nobres e
                valorizados de Jundiaí, você terá a poucos metros de casa uma
                rede completa de serviços e conveniência de alta qualidade. A 40
                km de Campinas e a 50 km da capital, com fácil acesso pelas
                rodovias Bandeirantes e Anhanguera.
              </p>
            </div>
            <figure className="media-fig reveal d2">
              <div className="img-reveal media-wide">
                <img
                  src={`${IMG}/a041.jpg`}
                  alt="Vista aérea da cidade de Jundiaí, interior de São Paulo"
                />
              </div>
              <figcaption>Jundiaí / SP · Imagem ilustrativa</figcaption>
            </figure>
          </div>

          <div className="loc-grid reveal">
            <div className="loc-item">
              <div className="t">
                1<small> min</small>
              </div>
              <div className="n">
                Oba Hortifruti · Hotel Serra de Jundiaí · Senna Pizzaria
              </div>
            </div>
            <div className="loc-item">
              <div className="t">
                2<small> min</small>
              </div>
              <div className="n">
                Supermercado Covabra · Maple Bear Jundiaí
              </div>
            </div>
            <div className="loc-item">
              <div className="t">
                3<small> min</small>
              </div>
              <div className="n">
                Pq. Comend. Antônio Carbonari · Vila Catá
              </div>
            </div>
            <div className="loc-item">
              <div className="t">
                5<small> min</small>
              </div>
              <div className="n">
                Carrefour Hipermercado · Grecco Cozinha Rústica
              </div>
            </div>
            <div className="loc-item">
              <div className="t">
                6<small> min</small>
              </div>
              <div className="n">Jundiaí Shopping · Tênis Clube Jundiaí</div>
            </div>
            <div className="loc-item">
              <div className="t">
                9<small> min</small>
              </div>
              <div className="n">
                Clube Jundiaiense · Beco Fino Centro Comercial
              </div>
            </div>
          </div>

          <div className="address-card reveal">
            <div>
              <div className="a-main">Av. Dr. Adilson Rodrigues, 151</div>
              <div className="a-sub">
                Jardim das Samambaias · Jundiaí / SP
              </div>
            </div>
            <a
              className="btn btn-ghost invert"
              href="https://www.google.com/maps/place/Av.+Dr.+Adilson+Rodrigues,+151+-+Jardim+das+Samambaias,+Jundia%C3%AD+-+SP"
              target="_blank"
              rel="noopener"
            >
              Ver no mapa
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ============ EMPREENDIMENTO ============ */}
      <section
        className="pad bg-slate"
        id="empreendimento"
        data-screen-label="Empreendimento"
      >
        <div className="container">
          <div className="split wide-img">
            <div>
              <span className="eyebrow reveal" style={{ color: '#d7989b' }}>
                O empreendimento
              </span>
              <h2 className="h2 reveal d1">
                Um imponente estilo
                <br />
                de vida merece
                <br />
                <span className="serif-accent" style={{ color: '#d7989b' }}>
                  Terrace Serra do Japi
                </span>
              </h2>
              <p className="lead reveal d2">
                São 3 modernas e imponentes torres projetadas para enaltecer
                seus momentos mais marcantes. Com uma grande área de
                preservação, o desenho garante que a vista para a Serra do Japi
                seja livre e permanente.
              </p>
              <p className="reveal d3" style={{ color: 'var(--txt-invert-soft)' }}>
                A estética, aliada à paisagem, oferece formas orgânicas e
                aconchegantes. Pavimento de lazer 7 metros acima do nível da
                rua, entregue equipado e decorado.
              </p>
            </div>
            <div className="emp-media reveal d2" data-gallery="empreendimento">
              <figure className="media-fig">
                <div
                  className="img-reveal media-wide"
                  data-lb=""
                  data-full="web/renders/fachada-2.jpg"
                  data-name="Entrada do Terrace Serra do Japi"
                  data-cat="O empreendimento"
                >
                  <img
                    src={`${IMG}/a040.jpg`}
                    alt="Perspectiva ilustrada da entrada e portaria do Terrace Serra do Japi"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <figcaption>Perspectiva ilustrada da entrada</figcaption>
              </figure>
              <div className="emp-media-grid">
                <div
                  className="img-reveal"
                  data-lb=""
                  data-full="web/renders/fachada-1.jpg"
                  data-name="As três torres"
                  data-cat="O empreendimento"
                >
                  <img
                    src={`${IMG}/a026.jpg`}
                    alt="Perspectiva ilustrada das três torres do Terrace Serra do Japi"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div
                  className="img-reveal"
                  data-lb=""
                  data-full="web/renders/fachada-detalhe.jpg"
                  data-name="Detalhe da fachada"
                  data-cat="O empreendimento"
                >
                  <img
                    src={`${IMG}/a032.jpg`}
                    alt="Perspectiva ilustrada do detalhe da fachada"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="towers">
            <div className="tower-card reveal d1">
              <div className="ix">Torre 1</div>
              <div className="area">
                157<small> m²</small>
              </div>
              <div className="meta">36 unidades · 2 gardens</div>
            </div>
            <div className="tower-card reveal d2">
              <div className="ix">Torre 2</div>
              <div className="area">
                203<small> m²</small>
              </div>
              <div className="meta">34 unidades</div>
            </div>
            <div className="tower-card reveal d3">
              <div className="ix">Torre 3</div>
              <div className="area">
                173<small> m²</small>
              </div>
              <div className="meta">34 unidades</div>
            </div>
          </div>

          <div className="stat-row" style={{ marginTop: '40px' }}>
            <div>
              <div className="num" data-count="104">
                0
              </div>
              <div className="lbl">
                Unidades no total · 2 aptos. por andar (17 andares)
              </div>
            </div>
            <div>
              <div className="num">
                <span data-count="7285">0</span> <span className="u">m²</span>
              </div>
              <div className="lbl">Área do terreno</div>
            </div>
            <div>
              <div className="num">
                3<span className="u"> a </span>4
              </div>
              <div className="lbl">Vagas de garagem por apartamento</div>
            </div>
          </div>

          <h3 className="h3 reveal" style={{ marginTop: '84px', color: '#fff' }}>
            Diferenciais do empreendimento
          </h3>
          <div className="diffs reveal d1">
            <span className="diff-chip">Piscina com raia de 25 m</span>
            <span className="diff-chip">Piscina infantil</span>
            <span className="diff-chip">Deck molhado com solarium</span>
            <span className="diff-chip">SPA (hidromassagem)</span>
            <span className="diff-chip">Sauna</span>
            <span className="diff-chip">Sala de massagem e repouso</span>
            <span className="diff-chip">Espaço fitness</span>
            <span className="diff-chip">Sala de pilates</span>
            <span className="diff-chip">Quadra de beach tennis</span>
            <span className="diff-chip">Quadra recreativa</span>
            <span className="diff-chip">Espaço gourmet</span>
            <span className="diff-chip">Salão de festas</span>
            <span className="diff-chip">Family club</span>
            <span className="diff-chip">Salão de jogos</span>
            <span className="diff-chip">Bar da piscina</span>
            <span className="diff-chip">Churrasqueira</span>
            <span className="diff-chip">Coworking</span>
            <span className="diff-chip">Mercado conveniência</span>
            <span className="diff-chip">Espaço delivery</span>
            <span className="diff-chip">Brinquedoteca</span>
            <span className="diff-chip">Playground</span>
            <span className="diff-chip">Pet activities</span>
            <span className="diff-chip">Bicicletário</span>
            <span className="diff-chip">
              Portaria com clausura e vidro blindado
            </span>
          </div>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section className="pad bg-ink" id="lazer" data-screen-label="Lazer">
        <div className="container">
          <div className="shead reveal">
            <span className="eyebrow" style={{ color: '#d7989b' }}>
              Lazer premium
            </span>
            <h2 className="h2">
              Uma experiência de lazer em família projetada para{' '}
              <span className="serif-accent" style={{ color: '#d7989b' }}>
                surpreender
              </span>
            </h2>
            <p className="lead">
              Cada ambiente foi pensado para um momento: cuidar do corpo,
              receber bem, relaxar e viver com a família. Explore por categoria.
            </p>
          </div>

          <div
            className="lazer-tabs reveal d1"
            data-tabs=""
            data-panels="#lazer-panels"
          >
            <button className="lazer-tab active" data-tab="saude">
              Saúde &amp; bem-estar
            </button>
            <button className="lazer-tab" data-tab="receber">
              Receber &amp; desfrutar
            </button>
            <button className="lazer-tab" data-tab="relaxar">
              Para relaxar
            </button>
            <button className="lazer-tab" data-tab="familia">
              Família &amp; praticidade
            </button>
          </div>

          <div id="lazer-panels">
            {/* Saúde */}
            <div className="lazer-panel active" data-panel="saude">
              <div className="lazer-grid" data-gallery="saude">
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/fitness.jpg"
                  data-name="Espaço Fitness"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a012.jpg`}
                    alt="Perspectiva ilustrada do espaço fitness"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Espaço Fitness</div>
                    <div className="ds">
                      Treine com uma vista extraordinária, conforto e
                      exclusividade.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/pilates.jpg"
                  data-name="Sala de Pilates"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a000.jpg`}
                    alt="Perspectiva ilustrada da sala de pilates"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Sala de Pilates</div>
                    <div className="ds">Equilíbrio, saúde e um corpo mais forte.</div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/piscina-1.jpg"
                  data-name="Piscina &amp; Vista para a Serra"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a035.jpg`}
                    alt="Perspectiva ilustrada da piscina com vista para a Serra do Japi"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Piscina &amp; Vista para a Serra</div>
                    <div className="ds">
                      Climatização a gás e vista permanente para a Serra do Japi.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/piscina-3.jpg"
                  data-name="Piscina com raia de 25 m"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a034.jpg`}
                    alt="Perspectiva ilustrada da piscina com raia de 25 metros"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Piscina com raia de 25 m</div>
                    <div className="ds">
                      Para nadar com a paisagem da serra ao fundo.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/beach.jpg"
                  data-name="Quadra de Beach Tennis"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a038.jpg`}
                    alt="Perspectiva ilustrada da quadra de beach tennis"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Quadra de Beach Tennis</div>
                    <div className="ds">
                      O esporte e a diversão da praia para a sua casa.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/quadra.jpg"
                  data-name="Quadra Recreativa"
                  data-cat="Saúde &amp; bem-estar"
                >
                  <img
                    src={`${IMG}/a044.jpg`}
                    alt="Perspectiva ilustrada da quadra recreativa"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Bem-estar</span>
                  <div className="amenity__txt">
                    <div className="nm">Quadra Recreativa</div>
                    <div className="ds">
                      Espaço para a atividade física e brincadeiras.
                    </div>
                  </div>
                </article>
              </div>
            </div>
            {/* Receber */}
            <div className="lazer-panel" data-panel="receber">
              <div className="lazer-grid" data-gallery="receber">
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/gourmet.jpg"
                  data-name="Espaço Gourmet"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a017.jpg`}
                    alt="Perspectiva ilustrada do espaço gourmet"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Espaço Gourmet</div>
                    <div className="ds">
                      Para degustar momentos em ótima companhia.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/festas.jpg"
                  data-name="Salão de Festas"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a030.jpg`}
                    alt="Perspectiva ilustrada do salão de festas"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Salão de Festas</div>
                    <div className="ds">Para você celebrar com estilo.</div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/family.jpg"
                  data-name="Family Club"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a031.jpg`}
                    alt="Perspectiva ilustrada do family club"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Family Club</div>
                    <div className="ds">
                      Espaço privativo ideal para comemorações informais.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/churrasqueira.jpg"
                  data-name="Churrasqueira"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a020.jpg`}
                    alt="Perspectiva ilustrada da churrasqueira"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Churrasqueira</div>
                    <div className="ds">
                      Saboreie essa paixão nacional com conforto.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/jogos.jpg"
                  data-name="Salão de Jogos"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a021.jpg`}
                    alt="Perspectiva ilustrada do salão de jogos"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Salão de Jogos</div>
                    <div className="ds">Aqui a diversão não tem limites.</div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/piscina-4.jpg"
                  data-name="Bar da Piscina"
                  data-cat="Receber &amp; desfrutar"
                >
                  <img
                    src={`${IMG}/a037.jpg`}
                    alt="Perspectiva ilustrada do bar da piscina"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Lazer</span>
                  <div className="amenity__txt">
                    <div className="nm">Bar da Piscina</div>
                    <div className="ds">
                      O lugar ideal para se divertir e curtir a vista.
                    </div>
                  </div>
                </article>
              </div>
            </div>
            {/* Relaxar */}
            <div className="lazer-panel" data-panel="relaxar">
              <div className="lazer-grid" data-gallery="relaxar">
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/sauna.jpg"
                  data-name="Sauna"
                  data-cat="Para relaxar"
                >
                  <img
                    src={`${IMG}/a036.jpg`}
                    alt="Perspectiva ilustrada da sauna"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Relaxar</span>
                  <div className="amenity__txt">
                    <div className="nm">Sauna</div>
                    <div className="ds">
                      Renove suas energias e sinta-se revigorado.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/massagem.jpg"
                  data-name="Salão de Massagem e Repouso"
                  data-cat="Para relaxar"
                >
                  <img
                    src={`${IMG}/a011.jpg`}
                    alt="Perspectiva ilustrada da sala de massagem e repouso"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Relaxar</span>
                  <div className="amenity__txt">
                    <div className="nm">Salão de Massagem e Repouso</div>
                    <div className="ds">
                      Um espaço feito para o seu autocuidado.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/piscina-2.jpg"
                  data-name="SPA com Hidromassagem"
                  data-cat="Para relaxar"
                >
                  <img
                    src={`${IMG}/a042.jpg`}
                    alt="Perspectiva ilustrada do SPA com hidromassagem"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Relaxar</span>
                  <div className="amenity__txt">
                    <div className="nm">SPA com Hidromassagem</div>
                    <div className="ds">
                      Bem-estar à sua disposição, com vista para a serra.
                    </div>
                  </div>
                </article>
              </div>
            </div>
            {/* Família & praticidade */}
            <div className="lazer-panel" data-panel="familia">
              <div className="lazer-grid" data-gallery="familia">
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/playground.jpg"
                  data-name="Playground"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a039.jpg`}
                    alt="Perspectiva ilustrada do playground"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Família</span>
                  <div className="amenity__txt">
                    <div className="nm">Playground</div>
                    <div className="ds">Segurança e diversão para o seu filho.</div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/brinquedoteca.jpg"
                  data-name="Brinquedoteca"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a029.jpg`}
                    alt="Perspectiva ilustrada da brinquedoteca"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Família</span>
                  <div className="amenity__txt">
                    <div className="nm">Brinquedoteca</div>
                    <div className="ds">
                      Porque a sua felicidade é ver o seu filho feliz.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/pet.jpg"
                  data-name="Pet Activities"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a043.jpg`}
                    alt="Perspectiva ilustrada do espaço pet activities"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Família</span>
                  <div className="amenity__txt">
                    <div className="nm">Pet Activities</div>
                    <div className="ds">
                      Um verdadeiro mimo para o seu bichinho de estimação.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/coworking.jpg"
                  data-name="Coworking"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a023.jpg`}
                    alt="Perspectiva ilustrada do coworking"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Conveniência</span>
                  <div className="amenity__txt">
                    <div className="nm">Coworking</div>
                    <div className="ds">
                      Estrutura completa para trabalhar de onde quiser.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/delivery.jpg"
                  data-name="Espaço Delivery"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a022.jpg`}
                    alt="Perspectiva ilustrada do espaço delivery"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Conveniência</span>
                  <div className="amenity__txt">
                    <div className="nm">Espaço Delivery</div>
                    <div className="ds">
                      Organização e segurança para o condomínio.
                    </div>
                  </div>
                </article>
                <article
                  className="amenity"
                  data-lb=""
                  data-full="web/renders/mercado.jpg"
                  data-name="Mercado Conveniência"
                  data-cat="Família &amp; praticidade"
                >
                  <img
                    src={`${IMG}/a025.jpg`}
                    alt="Perspectiva ilustrada do mercado conveniência"
                    loading="lazy"
                  />
                  <div className="amenity__veil"></div>
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                  <span className="amenity__tag">Conveniência</span>
                  <div className="amenity__txt">
                    <div className="nm">Mercado Conveniência</div>
                    <div className="ds">Praticidade a qualquer hora do dia.</div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section className="pad" id="plantas" data-screen-label="Plantas">
        <div className="container">
          <div className="shead reveal">
            <span className="eyebrow">Plantas &amp; tipologias</span>
            <h2 className="h2">
              Cada metragem com <span className="serif-accent">2 opções</span> de
              planta
            </h2>
            <p className="lead">
              Plantas racionais, confortáveis e de dimensões generosas — todas
              com ambientes abertos e integrados. Cada torre tem a sua metragem
              e oferece duas opções de planta, para o seu jeito de morar. Toque
              em uma planta para ampliar.
            </p>
          </div>

          <div
            className="plan-tabs reveal d1"
            data-tabs=""
            data-panels="#plan-panels"
          >
            <button className="plan-tab active" data-tab="t1">
              Torre 1 · 157 m²
            </button>
            <button className="plan-tab" data-tab="t2">
              Torre 2 · 203 m²
            </button>
            <button className="plan-tab" data-tab="t3">
              Torre 3 · 173 m²
            </button>
          </div>

          <div id="plan-panels">
            <div className="plan-panel active" data-panel="t1">
              <div className="plan-opts" data-gallery="plantas-t1">
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção A</span>
                    <span className="d">
                      157 m² privativos · 2 suítes e 2 dormitórios (1 home
                      office)
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p52_0.jpg"
                    data-name="Torre 1 · 157 m² — Opção A"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a014.jpg`}
                      alt="Planta da Torre 1, 157 m², opção A"
                    />
                  </div>
                </div>
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção B</span>
                    <span className="d">
                      157 m² privativos · 3 suítes e living ampliado
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p52_1.jpg"
                    data-name="Torre 1 · 157 m² — Opção B"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a008.jpg`}
                      alt="Planta da Torre 1, 157 m², opção B"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="plan-panel" data-panel="t2">
              <div className="plan-opts" data-gallery="plantas-t2">
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção A</span>
                    <span className="d">
                      203 m² privativos · 4 suítes, com varanda na suíte master
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p53_0.jpg"
                    data-name="Torre 2 · 203 m² — Opção A"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a015.jpg`}
                      alt="Planta da Torre 2, 203 m², opção A"
                    />
                  </div>
                </div>
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção B</span>
                    <span className="d">
                      203 m² privativos · 3 suítes com closet, living e banho
                      ampliados e varanda privativa na suíte master
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p53_1.jpg"
                    data-name="Torre 2 · 203 m² — Opção B"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a013.jpg`}
                      alt="Planta da Torre 2, 203 m², opção B"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="plan-panel" data-panel="t3">
              <div className="plan-opts" data-gallery="plantas-t3">
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção A</span>
                    <span className="d">
                      173 m² privativos · 4 dormitórios — 2 suítes e 2
                      dormitórios (1 home office)
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p54_0.jpg"
                    data-name="Torre 3 · 173 m² — Opção A"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a009.jpg`}
                      alt="Planta da Torre 3, 173 m², opção A"
                    />
                  </div>
                </div>
                <div className="plan-opt">
                  <div className="opt-label">
                    <span className="o">Opção B</span>
                    <span className="d">
                      173 m² privativos · 3 suítes e living ampliado
                    </span>
                  </div>
                  <div
                    className="plan-img"
                    data-lb=""
                    data-full="web/img/p54_1.jpg"
                    data-name="Torre 3 · 173 m² — Opção B"
                    data-cat="Plantas"
                  >
                    <img
                      src={`${IMG}/a003.jpg`}
                      alt="Planta da Torre 3, 173 m², opção B"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS DOS APTOS ============ */}
      <section
        className="pad bg-slate"
        id="diferenciais"
        data-screen-label="Diferenciais"
      >
        <div className="container">
          <div className="split img-left">
            <figure className="media-fig reveal">
              <div
                className="img-reveal media-tall"
                data-lb=""
                data-full="web/img/p55_2.jpg"
                data-name="Varanda gourmet"
                data-cat="Apartamentos"
              >
                <img
                  src={`${IMG}/a045.jpg`}
                  alt="Perspectiva ilustrada da varanda gourmet com vista"
                />
                <button className="amenity__zoom" aria-label="Ampliar">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                  </svg>
                </button>
              </div>
              <figcaption>Perspectiva ilustrada da varanda gourmet</figcaption>
            </figure>
            <div>
              <span className="eyebrow reveal" style={{ color: '#d7989b' }}>
                Por dentro
              </span>
              <h2 className="h2 reveal d1">
                Grandes diferenciais
                <br />
                fazem um{' '}
                <span className="serif-accent" style={{ color: '#d7989b' }}>
                  grande projeto
                </span>
              </h2>
              <p className="lead reveal d2">
                Living integrado e longitudinal, varanda ampla e pé-direito de
                até 2,70 m. Ambientes abertos, banhados de luz, com a Serra do
                Japi sempre à vista.
              </p>
              <p className="reveal d3" style={{ color: 'var(--txt-invert-soft)' }}>
                Acabamentos premium, infraestrutura completa de ar-condicionado
                e automação, e uma estrutura que permite flexibilização e
                personalização do seu lar.
              </p>
            </div>
          </div>

          <div className="roleta reveal" data-roleta="" data-gallery="interiores">
            <div className="roleta__head">
              <div>
                <span className="eyebrow" style={{ color: '#d7989b' }}>
                  Ambientes decorados
                </span>
                <h3 className="h3" style={{ color: '#fff', marginTop: '6px' }}>
                  Passeie pelos interiores
                </h3>
              </div>
              <div className="roleta__arrows">
                <button className="roleta__btn prev" aria-label="Anterior">
                  <svg viewBox="0 0 24 24">
                    <path d="M15 6l-6 6 6 6"></path>
                  </svg>
                </button>
                <button className="roleta__btn next" aria-label="Próxima">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 6l6 6-6 6"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="roleta__track">
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/living-1.jpg"
                  data-name="Living Integrado"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a018.jpg`}
                    alt="Perspectiva ilustrada do living integrado com vista"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Living Integrado</div>
                <div className="roleta__sub">
                  Sala, jantar e cozinha em um único ambiente, com vista.
                </div>
              </div>
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/living-2.jpg"
                  data-name="Living &amp; Varanda"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a027.jpg`}
                    alt="Perspectiva ilustrada do living com varanda"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Living &amp; Varanda</div>
                <div className="roleta__sub">
                  Integração total entre o interior e a varanda gourmet.
                </div>
              </div>
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/living-3.jpg"
                  data-name="Living Ampliado"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a033.jpg`}
                    alt="Perspectiva ilustrada do living ampliado"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Living Ampliado</div>
                <div className="roleta__sub">
                  Mais espaço para receber e viver bem.
                </div>
              </div>
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/living-4.jpg"
                  data-name="Cozinha Integrada"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a016.jpg`}
                    alt="Perspectiva ilustrada da cozinha integrada ao living"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Cozinha Integrada</div>
                <div className="roleta__sub">
                  Marcenaria sob medida e acabamentos premium.
                </div>
              </div>
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/suite-1.jpg"
                  data-name="Suíte Master"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a028.jpg`}
                    alt="Perspectiva ilustrada da suíte master com closet"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Suíte Master</div>
                <div className="roleta__sub">
                  Closet integrado e varanda privativa (opções).
                </div>
              </div>
              <div className="roleta__slide">
                <div
                  className="roleta__media"
                  data-lb=""
                  data-full="web/renders/suite-2.jpg"
                  data-name="Suíte com Closet"
                  data-cat="Apartamentos"
                >
                  <img
                    src={`${IMG}/a019.jpg`}
                    alt="Perspectiva ilustrada da suíte com closet"
                    loading="lazy"
                  />
                  <button className="amenity__zoom" aria-label="Ampliar">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                    </svg>
                  </button>
                </div>
                <div className="roleta__label">Suíte com Closet</div>
                <div className="roleta__sub">
                  Conforto e privacidade na área íntima.
                </div>
              </div>
            </div>
          </div>

          <div className="feat-grid">
            <div className="feat reveal d1">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 20h20M4 20V9l8-5 8 5v11M9 20v-6h6v6"></path>
              </svg>
              <div className="ft">Vista permanente</div>
              <div className="fd">
                Desenho do empreendimento garante vista livre para a Serra do
                Japi.
              </div>
            </div>
            <div className="feat reveal d2">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path>
              </svg>
              <div className="ft">Reconhecimento facial</div>
              <div className="fd">
                Hall e elevador social exclusivos com reconhecimento facial.
              </div>
            </div>
            <div className="feat reveal d3">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="6" y="3" width="12" height="18" rx="1.5"></rect>
                <path d="M10 7h4M12 17v.01"></path>
              </svg>
              <div className="ft">3 elevadores por torre</div>
              <div className="fd">
                2 sociais e 1 de serviço, com circulações independentes.
              </div>
            </div>
            <div className="feat reveal d1">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="3" y="6" width="18" height="12" rx="1.5"></rect>
                <path d="M3 10h18"></path>
              </svg>
              <div className="ft">Living longitudinal</div>
              <div className="fd">
                Living integrado e ampliado, com varanda ampla.
              </div>
            </div>
            <div className="feat reveal d2">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7"></path>
              </svg>
              <div className="ft">Suíte Master</div>
              <div className="fd">
                Banho amplo, cuba dupla, closet e varanda privativa (opções).
              </div>
            </div>
            <div className="feat reveal d3">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M5 21V7l7-4 7 4v14M9 21v-5h6v5"></path>
                <path d="M12 3v18"></path>
              </svg>
              <div className="ft">Mínimo 3 vagas</div>
              <div className="fd">
                De 3 a 4 vagas por apartamento, além de depósito privativo.
              </div>
            </div>
            <div className="feat reveal d1">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 2v20M2 12h20"></path>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
              <div className="ft">Infra completa</div>
              <div className="fd">
                Ar-condicionado, pontos USB, água quente e máquina de lavar
                louça.
              </div>
            </div>
            <div className="feat reveal d2">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M5 12h14M12 5v14" transform="rotate(45 12 12)"></path>
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              </svg>
              <div className="ft">Automação &amp; Wi-Fi</div>
              <div className="fd">
                Automação por wi-fi e assistente virtual. Caixilhos pretos.
              </div>
            </div>
            <div className="feat reveal d3">
              <svg className="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M4 6h16M4 12h16M4 18h10"></path>
              </svg>
              <div className="ft">Conforto acústico</div>
              <div className="fd">
                Janelas antirruído e laje com tratamento acústico na área
                íntima.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ASSINATURAS ============ */}
      <section
        className="pad bg-cream"
        id="assinaturas"
        data-screen-label="Assinaturas"
      >
        <div className="container">
          <div className="shead reveal">
            <span className="eyebrow">Assinaturas</span>
            <h2 className="h2">
              Exclusividade que ganha vida em{' '}
              <span className="serif-accent">cada detalhe</span>
            </h2>
            <p className="lead">
              Um time de referência nacional reuniu arquitetura, paisagismo e
              interiores para criar uma nova forma de viver em Jundiaí.
            </p>
          </div>

          <div className="team">
            <article className="member reveal d1">
              <div className="photo">
                <img
                  src={`${IMG}/a002.jpg`}
                  alt="Fernando Rivaben, arquiteto responsável pelas torres"
                />
              </div>
              <div className="role">Torres</div>
              <div className="nm">Fernando Rivaben</div>
              <div className="bio">
                Sócio-fundador da Rivaben Arquitetura, formado pela FAU
                PUC-Campinas (1981). São 30 anos e mais de 500 projetos no
                interior de São Paulo.
              </div>
            </article>
            <article className="member reveal d2">
              <div className="photo">
                <img
                  src={`${IMG}/a007.jpg`}
                  alt="Martha Gavião, arquiteta paisagista responsável pelo paisagismo"
                />
              </div>
              <div className="role">Paisagismo</div>
              <div className="nm">Martha Gavião</div>
              <div className="bio">
                Quase 40 anos de profissão. Formada pela PUC-Campinas, com
                mestrado pela FAU-USP na área de Paisagem e Ambiente.
              </div>
            </article>
            <article className="member reveal d3">
              <div className="photo">
                <img
                  src={`${IMG}/a001.jpg`}
                  alt="Nivaldo J. Callegari, arquiteto responsável pelo projeto arquitetônico"
                />
              </div>
              <div className="role">Projeto arquitetônico</div>
              <div className="nm">Nivaldo J. Callegari</div>
              <div className="bio">
                Arquiteto urbanista formado pela PUC (1984). Concretizou mais de
                5 milhões de m² em empreendimentos por todo o Brasil.
              </div>
            </article>
            <article className="member reveal d4">
              <div className="photo">
                <img
                  src={`${IMG}/a006.jpg`}
                  alt="Luiza e Thaisa Bohrer, responsáveis pela decoração das áreas comuns"
                />
              </div>
              <div className="role">Áreas comuns</div>
              <div className="nm">Bohrer Arquitetos</div>
              <div className="bio">
                Luiza e Thaisa Bohrer assinam a decoração, com estética
                atemporal e mobiliário sofisticado alinhados à proposta do
                empreendimento.
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ SOBRE A AUTEN ============ */}
      <section className="pad bg-ink" id="auten" data-screen-label="Auten">
        <div className="container">
          <div className="split wide-img">
            <div>
              <span className="eyebrow reveal" style={{ color: '#d7989b' }}>
                A incorporadora
              </span>
              <h2 className="h2 reveal d1">
                Auten: 37 anos
                <br />
                fazendo da exclusividade
                <br />
                um{' '}
                <span className="serif-accent" style={{ color: '#d7989b' }}>
                  novo padrão
                </span>
              </h2>
              <p className="lead reveal d2">
                Desenvolver projetos autênticos, com a tradição e a expertise de
                37 anos. A localização privilegiada é um dos nossos principais
                pilares — acreditamos que existe o lugar certo para colecionar
                as melhores memórias.
              </p>
              <p className="reveal d3" style={{ color: 'var(--txt-invert-soft)' }}>
                Para nós, a primeira impressão é a que fica. Cada empreendimento
                possui fachadas únicas, pensadas para tornar inesquecível a
                experiência de dar o primeiro passo rumo a uma nova forma de
                viver.
              </p>
              <div className="stat-row reveal d2">
                <div>
                  <div className="num">
                    <span data-count="37">0</span>
                  </div>
                  <div className="lbl">Anos de tradição e expertise</div>
                </div>
                <div>
                  <div className="num">
                    <span data-count="104">0</span>
                  </div>
                  <div className="lbl">
                    Residências exclusivas no Terrace Serra do Japi
                  </div>
                </div>
              </div>
            </div>
            <div className="auten-collage reveal d2">
              <figure className="ac-tall">
                <img
                  src={`${IMG}/a004.jpg`}
                  alt="Família aproveitando momentos em casa"
                />
              </figure>
              <figure className="ac-sm">
                <img
                  src={`${IMG}/a028.jpg`}
                  alt="Perspectiva ilustrada da suíte master"
                />
              </figure>
              <figure className="ac-sm">
                <img
                  src={`${IMG}/a018.jpg`}
                  alt="Perspectiva ilustrada do living integrado"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTATO / FORM ============ */}
      <section className="pad-sm bg-cream" id="contato" data-screen-label="Contato">
        <div className="container">
          <div className="cta-wrap reveal" data-gallery="cta">
            <div
              className="cta-media img-reveal"
              data-lb=""
              data-full="web/renders/piscina-1.jpg"
              data-name="Piscina com vista para a Serra do Japi"
              data-cat="Lazer"
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`${IMG}/a035.jpg`}
                alt="Perspectiva ilustrada da piscina com vista para a Serra do Japi"
              />
              <div className="cta-media__scrim"></div>
              <button
                className="amenity__zoom"
                aria-label="Ampliar"
                style={{ opacity: 1 }}
              >
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path>
                </svg>
              </button>
              <div className="cta-media__quote">
                <p>
                  Respire fundo. A sua vista permanente para a Serra do Japi
                  começa aqui.
                </p>
              </div>
            </div>
            <div className="cta-form">
              <span className="eyebrow">Agende sua visita</span>
              <h3 className="h3" style={{ marginBottom: '8px' }}>
                Fale com a Lotus Brokers
              </h3>
              <p style={{ marginBottom: '28px', color: 'var(--txt-soft)' }}>
                Receba o material completo, plantas e condições. Atendimento
                exclusivo e sem compromisso.
              </p>
              <form id="lead-form" noValidate>
                <div className="form-field">
                  <label htmlFor="nome">Nome completo</label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Como podemos chamar você?"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="telefone">Telefone / WhatsApp</label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(11) 9 0000-0000"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <p className="form-consent">
                  Ao enviar, você será direcionado ao nosso WhatsApp para um
                  atendimento personalizado.
                </p>
                <button type="submit" className="btn">
                  Quero conhecer o Terrace
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
                <div className="form-direct">
                  ou fale agora:{' '}
                  <a
                    href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Terrace%20Serra%20do%20Japi."
                    target="_blank"
                    rel="noopener"
                  >
                    +55 11 92614-3393
                  </a>
                </div>
              </form>
              <div className="form-ok">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <path d="M22 4 12 14.01l-3-3"></path>
                </svg>
                <h3 className="h3">Obrigado!</h3>
                <p style={{ color: 'var(--txt-soft)' }}>
                  Abrimos uma conversa no WhatsApp. Se a janela não abriu, fale
                  conosco pelo número acima.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer" id="rodape">
        <div className="container">
          <div className="footer__top">
            <div>
              <img
                className="footer__logo"
                src={`${IMG}/a010.png`}
                alt="Terrace Serra do Japi"
              />
              <p
                style={{
                  marginTop: '22px',
                  color: 'var(--txt-invert-soft)',
                  maxWidth: '38ch',
                }}
              >
                Residências de 157 a 203 m² com vista permanente para a Serra do
                Japi. Incorporação Auten.
              </p>
            </div>
            <div>
              <h4>Empreendimento</h4>
              <a href="#localizacao">Localização</a>
              <a href="#empreendimento">O empreendimento</a>
              <a href="#lazer">Lazer</a>
              <a href="#plantas">Plantas</a>
              <a href="#assinaturas">Assinaturas</a>
            </div>
            <div>
              <h4>Atendimento</h4>
              <a
                href="https://wa.me/5511926143393"
                target="_blank"
                rel="noopener"
              >
                WhatsApp · +55 11 92614-3393
              </a>
              <a
                href="https://www.google.com/maps/place/Av.+Dr.+Adilson+Rodrigues,+151+-+Jardim+das+Samambaias,+Jundia%C3%AD+-+SP"
                target="_blank"
                rel="noopener"
              >
                Av. Dr. Adilson Rodrigues, 151
              </a>
              <a href="#contato">Jardim das Samambaias · Jundiaí / SP</a>
              <a href="#contato" style={{ color: 'var(--rose)', marginTop: '8px' }}>
                Agende sua visita →
              </a>
            </div>
          </div>
          <p className="footer__legal">
            O Condomínio Terrace Serra do Japi é um projeto de construção
            aprovado pela Prefeitura Municipal de Jundiaí/SP, objeto da Aprovação
            de edifício n.º 2022/2043 expedida em 11 de maio de 2023, devidamente
            registrado no R15 da matrícula n.º 35.424 em 10 de julho de 2023, no
            2º Cartório de Registro de Imóveis de Jundiaí/SP. Todas as imagens
            deste material são meramente ilustrativas e sujeitas a alterações. O
            projeto será executado de acordo com o memorial descritivo, inclusive
            equipamentos, acabamentos e a decoração das áreas comuns. Projeto
            executivo em desenvolvimento, podendo sofrer alterações durante a
            compatibilização técnica. A vegetação que compõe o paisagismo é
            ilustrativa e representa o porte adulto de referência das espécies;
            na entrega, a vegetação apresentará diferença de tamanho, pois será
            entregue com o plantio de mudas nos termos do projeto. Lotus Brokers
            atua na intermediação imobiliária deste empreendimento.
          </p>
          <div className="footer__bottom">
            <span>
              © <span id="year">2026</span> Lotus Brokers · Incorporação Auten
            </span>
            <span>Terrace Serra do Japi · Jundiaí / SP</span>
          </div>
        </div>
      </footer>

      <a
        className="wa-float"
        href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Terrace%20Serra%20do%20Japi."
        target="_blank"
        rel="noopener"
        aria-label="Fale no WhatsApp"
      >
        <svg viewBox="0 0 32 32">
          <path d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.4 2 7.8L.5 31.5l7.9-2c2.3 1.2 4.9 1.9 7.6 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.5 16 .5zm0 28.3c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.9-13.1 13.1-13.1S29.1 8.8 29.1 16 23.2 28.8 16 28.8zm7.2-9.8c-.4-.2-2.3-1.2-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.2 2.6 4 6.4 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.3.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z"></path>
        </svg>
      </a>
    </div>
  );
}
