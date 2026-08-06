'use client';

/**
 * Gran Ville Santo Angelo — porte 1:1 de gran-ville-santo-angelo/index.html
 * (formato CSS-class, HTML estático + <style> + a046.js) para React/Next.
 *
 * Estratégia de porte:
 *  - O markup do <body> é renderizado como JSX literal (class -> className,
 *    for -> htmlFor, atributos self-closing, comentários {/* *​/}).
 *  - O CSS dos blocos <style> vive em gran-ville-santo-angelo.css (importado
 *    no page.tsx), com @font-face reescritos para /fonts/gran-ville-santo-angelo/.
 *  - a046.js é reimplementado fielmente num único useEffect que opera sobre o
 *    DOM já montado (mesma abordagem imperativa do script original), com
 *    cleanup dos listeners globais. Comportamento idêntico ao estático.
 *
 * Imagens locais aNNN.jpg/png -> /gran-ville-santo-angelo/aNNN.ext.
 * Referências "img/..." (og/data-lb) mantidas EXATAS conforme original.
 */

import { useEffect } from 'react';
import { sendLead } from '@/lib/lead';

const IMG = '/gran-ville-santo-angelo';

export default function GranVilleSantoAngelo() {
  useEffect(() => {
    const WA = '5511926143393';
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    // acumula funções de cleanup para listeners globais
    const cleanups: Array<() => void> = [];
    const onWin = (
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: boolean | AddEventListenerOptions,
    ) => {
      window.addEventListener(type, fn, opts);
      cleanups.push(() => window.removeEventListener(type, fn, opts));
    };
    const onDoc = (
      type: string,
      fn: EventListenerOrEventListenerObject,
      opts?: boolean | AddEventListenerOptions,
    ) => {
      document.addEventListener(type, fn, opts);
      cleanups.push(() => document.removeEventListener(type, fn, opts));
    };

    /* ---------- Header scroll state ---------- */
    const header = document.querySelector('.header');
    const fab = document.querySelector('.fab');
    function onScroll() {
      const y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 60);
      if (fab) fab.classList.toggle('show', y > 700);
    }
    onWin('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    const burger = document.querySelector('.burger');
    if (burger) {
      const onBurger = () => {
        document.body.classList.toggle('menu-open');
      };
      burger.addEventListener('click', onBurger);
      cleanups.push(() => burger.removeEventListener('click', onBurger));
      document.querySelectorAll('.mobile-menu a').forEach((a) => {
        const onA = () => {
          document.body.classList.remove('menu-open');
        };
        a.addEventListener('click', onA);
        cleanups.push(() => a.removeEventListener('click', onA));
      });
    }

    /* ---------- Reveal on scroll (robusto + failsafe) ---------- */
    const revealEls = document.querySelectorAll('.reveal,.reveal-img');
    function reveal(el: Element) {
      el.classList.add('in');
    }
    let onScrollReveal: (() => void) | null = null;
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: '0px 0px -6% 0px' },
      );
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) {
          reveal(el);
        } else io.observe(el);
      });
      const scrollReveal = function () {
        let pending = false;
        revealEls.forEach((el) => {
          if (el.classList.contains('in')) return;
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.98 && r.bottom > 0) {
            reveal(el);
          } else pending = true;
        });
        if (!pending && onScrollReveal) {
          window.removeEventListener('scroll', onScrollReveal);
        }
      };
      let srTick = false;
      onScrollReveal = function () {
        if (!srTick) {
          requestAnimationFrame(function () {
            scrollReveal();
            srTick = false;
          });
          srTick = true;
        }
      };
      onWin('scroll', onScrollReveal, { passive: true });
      onWin('load', scrollReveal);
      const srTimeout = setTimeout(scrollReveal, 400);
      cleanups.push(() => clearTimeout(srTimeout));
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach(reveal);
    }

    /* ---------- Number counters ---------- */
    function animateCount(el: Element) {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const dur = 1700;
      let t0: number | null = null;
      function fmt(v: number) {
        const s = v.toFixed(dec);
        const parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return parts.join(',');
      }
      function step(ts: number) {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * e);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target);
      }
      if (reduce) {
        el.textContent = fmt(target);
        return;
      }
      requestAnimationFrame(step);
    }
    const counters = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animateCount(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      counters.forEach((c) => {
        cio.observe(c);
      });
      cleanups.push(() => cio.disconnect());
    } else {
      counters.forEach(animateCount);
    }

    /* ---------- Gallery filter ---------- */
    const filterBtns = document.querySelectorAll('.filterbar button');
    const gcards = document.querySelectorAll('.gallery .gcard');
    function applyFilter(cat: string | null) {
      gcards.forEach((card) => {
        const match = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.classList.toggle('hide', !match);
      });
    }
    filterBtns.forEach((b) => {
      const onB = () => {
        filterBtns.forEach((x) => {
          x.classList.remove('active');
        });
        b.classList.add('active');
        applyFilter(b.getAttribute('data-filter'));
      };
      b.addEventListener('click', onB);
      cleanups.push(() => b.removeEventListener('click', onB));
    });
    // stagger-in gallery cards
    if ('IntersectionObserver' in window && !reduce) {
      const gio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = Array.prototype.indexOf.call(gcards, e.target);
              (e.target as HTMLElement).style.transitionDelay =
                (idx % 6) * 0.07 + 's';
              e.target.classList.add('in');
              gio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 },
      );
      gcards.forEach((c) => {
        gio.observe(c);
      });
      cleanups.push(() => gio.disconnect());
    } else {
      gcards.forEach((c) => {
        c.classList.add('in');
      });
    }

    /* ---------- Lightbox ---------- */
    const lb = document.querySelector('.lightbox');
    if (lb) {
      const lbImg = lb.querySelector('img') as HTMLImageElement | null;
      const lbCapT = lb.querySelector('.cap-t');
      const lbCapS = lb.querySelector('.cap-s');
      const items: Array<{ src: string; t: string; s: string }> = [];
      let current = 0;
      document.querySelectorAll('[data-lb]').forEach((el) => {
        items.push({
          src: el.getAttribute('data-lb') || '',
          t: el.getAttribute('data-lb-t') || '',
          s: el.getAttribute('data-lb-s') || '',
        });
        const i = items.length - 1;
        const onEl = () => {
          openLB(i);
        };
        el.addEventListener('click', onEl);
        cleanups.push(() => el.removeEventListener('click', onEl));
      });
      function show(i: number) {
        current = (i + items.length) % items.length;
        const it = items[current];
        if (lbImg) lbImg.src = it.src;
        if (lbCapT) lbCapT.textContent = it.t;
        if (lbCapS) lbCapS.textContent = it.s;
      }
      function openLB(i: number) {
        show(i);
        lb!.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeLB() {
        lb!.classList.remove('open');
        document.body.style.overflow = '';
      }
      const closeBtn = lb.querySelector('.lb-close');
      const prevBtn = lb.querySelector('.lb-nav.prev');
      const nextBtn = lb.querySelector('.lb-nav.next');
      const onClose = () => closeLB();
      const onPrev = () => show(current - 1);
      const onNext = () => show(current + 1);
      const onLbClick = (e: Event) => {
        if (e.target === lb) closeLB();
      };
      closeBtn?.addEventListener('click', onClose);
      prevBtn?.addEventListener('click', onPrev);
      nextBtn?.addEventListener('click', onNext);
      lb.addEventListener('click', onLbClick);
      cleanups.push(() => {
        closeBtn?.removeEventListener('click', onClose);
        prevBtn?.removeEventListener('click', onPrev);
        nextBtn?.removeEventListener('click', onNext);
        lb.removeEventListener('click', onLbClick);
      });
      const onKey = (ev: Event) => {
        const e = ev as KeyboardEvent;
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
      };
      onDoc('keydown', onKey);
    }

    /* ---------- Accordion ---------- */
    document.querySelectorAll('.acc__q').forEach((q) => {
      const onQ = () => {
        const item = q.closest('.acc__item');
        if (!item) return;
        const ans = item.querySelector('.acc__a') as HTMLElement | null;
        const open = item.classList.contains('open');
        const acc = item.closest('.acc');
        if (acc) {
          acc.querySelectorAll('.acc__item.open').forEach((o) => {
            if (o !== item) {
              o.classList.remove('open');
              const oa = o.querySelector('.acc__a') as HTMLElement | null;
              if (oa) oa.style.maxHeight = '';
            }
          });
        }
        if (open) {
          item.classList.remove('open');
          if (ans) ans.style.maxHeight = '';
        } else {
          item.classList.add('open');
          if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      };
      q.addEventListener('click', onQ);
      cleanups.push(() => q.removeEventListener('click', onQ));
    });

    /* ---------- Form ---------- */
    const form = document.querySelector('.lead-form');
    if (form) {
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const nomeEl = form.querySelector('[name="nome"]') as HTMLInputElement;
        const telEl = form.querySelector(
          '[name="telefone"]',
        ) as HTMLInputElement;
        const emailEl = form.querySelector(
          '[name="email"]',
        ) as HTMLInputElement;
        const nome = nomeEl.value.trim();
        const tel = telEl.value.trim();
        const email = emailEl.value.trim();
        if (!nome || !tel) {
          return;
        }
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_gran-ville-santo-angelo',
          interest: 'Gran Ville Santo Angelo',
        });
        const msg =
          'Olá! Tenho interesse no Gran Ville Santo Angelo.%0A%0ANome: ' +
          encodeURIComponent(nome) +
          '%0AWhatsApp: ' +
          encodeURIComponent(tel) +
          (email ? '%0AE-mail: ' + encodeURIComponent(email) : '');
        const url = 'https://wa.me/' + WA + '?text=' + msg;
        const ok = form.parentNode
          ? (form.parentNode as HTMLElement).querySelector('.form__ok')
          : null;
        (form as HTMLElement).style.display = 'none';
        if (ok) {
          ok.classList.add('show');
          const link = ok.querySelector('.ok-wa') as HTMLAnchorElement | null;
          if (link) link.href = url;
        }
        window.open(url, '_blank');
      };
      form.addEventListener('submit', onSubmit);
      cleanups.push(() => form.removeEventListener('submit', onSubmit));
    }

    /* ---------- Magnetic buttons (subtle) ---------- */
    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      document.querySelectorAll('.btn').forEach((btn) => {
        const el = btn as HTMLElement;
        const onMove = (ev: Event) => {
          const e = ev as MouseEvent;
          const r = el.getBoundingClientRect();
          const mx = e.clientX - r.left - r.width / 2;
          const my = e.clientY - r.top - r.height / 2;
          el.style.transform =
            'translate(' + mx * 0.12 + 'px,' + (my * 0.18 - 2) + 'px)';
        };
        const onLeave = () => {
          el.style.transform = '';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        });
      });
    }

    /* ---------- Parallax (light) ---------- */
    if (!reduce) {
      const plxEls = document.querySelectorAll('[data-plx]');
      let ticking = false;
      function plx() {
        plxEls.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-plx') || '') || 0.15;
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2 - window.innerHeight / 2;
          (el as HTMLElement).style.transform =
            'translateY(' + center * -speed + 'px)';
        });
        ticking = false;
      }
      const onPlxScroll = () => {
        if (!ticking) {
          requestAnimationFrame(plx);
          ticking = true;
        }
      };
      onWin('scroll', onPlxScroll, { passive: true });
      plx();
    }

    /* ---------- Carrossel (esporte) ---------- */
    document.querySelectorAll('[data-carousel]').forEach((root) => {
      const track = root.querySelector('.carousel__track') as HTMLElement;
      if (!track) return;
      const slides = Array.prototype.slice.call(
        track.children,
      ) as HTMLElement[];
      const prev = root.querySelector(
        '.carousel__btn.prev',
      ) as HTMLButtonElement | null;
      const next = root.querySelector(
        '.carousel__btn.next',
      ) as HTMLButtonElement | null;
      const dotsWrap = root.querySelector(
        '.carousel__dots',
      ) as HTMLElement | null;
      let index = 0;
      function perView() {
        return window.innerWidth >= 1040
          ? 3
          : window.innerWidth >= 640
            ? 2
            : 1;
      }
      function maxIndex() {
        return Math.max(0, slides.length - perView());
      }
      function build() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIndex(); i++) {
          const d = document.createElement('button');
          d.className = 'carousel__dot' + (i === index ? ' active' : '');
          d.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
          (function (n) {
            d.addEventListener('click', function () {
              go(n);
            });
          })(i);
          dotsWrap.appendChild(d);
        }
      }
      function go(i: number) {
        index = Math.max(0, Math.min(i, maxIndex()));
        const slideW = slides[0].getBoundingClientRect().width;
        const gap =
          parseFloat(
            getComputedStyle(track).columnGap ||
              getComputedStyle(track).gap ||
              '0',
          ) || 20;
        track.style.transform =
          'translateX(' + -(slideW + gap) * index + 'px)';
        if (dotsWrap) {
          Array.prototype.forEach.call(
            dotsWrap.children,
            function (d: Element, n: number) {
              d.classList.toggle('active', n === index);
            },
          );
        }
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index === maxIndex();
      }
      if (prev)
        prev.addEventListener('click', function () {
          go(index - 1);
        });
      if (next)
        next.addEventListener('click', function () {
          go(index + 1);
        });
      let rt: ReturnType<typeof setTimeout>;
      const onResize = function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          build();
          go(Math.min(index, maxIndex()));
        }, 150);
      };
      onWin('resize', onResize);
      // swipe
      let sx = 0;
      let dragging = false;
      track.addEventListener(
        'touchstart',
        function (e) {
          sx = (e as TouchEvent).touches[0].clientX;
          dragging = true;
        },
        { passive: true },
      );
      track.addEventListener('touchend', function (e) {
        if (!dragging) return;
        dragging = false;
        const dx = (e as TouchEvent).changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) {
          go(index + (dx < 0 ? 1 : -1));
        }
      });
      build();
      go(0);
    });

    /* ---------- Active nav highlight ---------- */
    const navLinks = document.querySelectorAll(".nav a[href^='#']");
    const sections: Array<{ link: Element; sec: Element }> = [];
    navLinks.forEach((l) => {
      const id = (l.getAttribute('href') || '').slice(1);
      const sec = document.getElementById(id);
      if (sec) sections.push({ link: l, sec: sec });
    });
    if ('IntersectionObserver' in window && sections.length) {
      const nio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              navLinks.forEach((l) => {
                (l as HTMLElement).style.opacity = '0.92';
              });
              const match = sections.find((s) => s.sec === e.target);
              if (match) (match.link as HTMLElement).style.opacity = '1';
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      sections.forEach((s) => {
        nio.observe(s.sec);
      });
      cleanups.push(() => nio.disconnect());
    }

    return () => {
      cleanups.forEach((fn) => fn());
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* ====================== HEADER ====================== */}
      <header className="header">
        <div className="wrap header__in">
          <a
            className="brand"
            href="#inicio"
            aria-label="Gran Ville Santo Angelo — início"
          >
            <img
              className="brand__logo brand__logo--cream"
              src={`${IMG}/a001.png`}
              alt="Gran Ville Santo Angelo"
              width={743}
              height={604}
            />
            <img
              className="brand__logo brand__logo--color"
              src={`${IMG}/a009.png`}
              alt=""
              aria-hidden="true"
              width={743}
              height={604}
            />
          </a>
          <nav className="nav" aria-label="Navegação principal">
            <a href="#essencia">Essência</a>
            <a href="#localizacao">Localização</a>
            <a href="#projeto">O Projeto</a>
            <a href="#clube">Clube</a>
            <a href="#casas">Casas</a>
            <a href="#gp">A GP</a>
          </nav>
          <div className="header__cta">
            <a
              className="mini-wa"
              href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Gran%20Ville%20Santo%20Angelo."
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3Z"></path>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3Z"></path>
              </svg>
              WhatsApp
            </a>
            <button className="burger" aria-label="Abrir menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" aria-hidden="true">
        <img
          className="mobile-menu__logo"
          src={`${IMG}/a001.png`}
          alt="Gran Ville Santo Angelo"
        />
        <a href="#essencia">Essência</a>
        <a href="#localizacao">Localização</a>
        <a href="#projeto">O Projeto</a>
        <a href="#clube">Clube</a>
        <a href="#casas">Casas</a>
        <a href="#gp">A GP</a>
        <a href="#faq">Dúvidas</a>
      </div>

      {/* ====================== HERO ====================== */}
      <section className="hero" id="inicio">
        <div className="hero__bg">
          <img
            src={`${IMG}/a038.jpg`}
            alt="Perspectiva ilustrada da portaria do Gran Ville Santo Angelo"
            fetchPriority="high"
          />
        </div>
        <div className="hero__content">
          <div className="wrap">
            <span className="hero__kicker">
              Gran Ville Santo Angelo — Itupeva · SP
            </span>
            <h1 className="hero__title">
              Acalente sua alma,
              <br />
              aconchegue sua <em>natureza</em>.
            </h1>
            <p className="hero__lede">
              O novo bairro planejado da GP, em uma região privilegiada —
              abraçando a essência da Mata Atlântica.
            </p>
            <div className="hero__cta">
              <a className="btn lg" href="#contato">
                <span>
                  Quero conhecer{' '}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </span>
              </a>
              <a className="btn glass lg" href="#clube">
                <span>Conhecer o clube</span>
              </a>
            </div>
          </div>
        </div>
        <div className="hero__bar">
          <div className="wrap hero__bar-in">
            <div className="hfact">
              <span className="hfact__n">
                450<i>mil m²</i>
              </span>
              <span className="hfact__l">Área total</span>
            </div>
            <div className="hfact">
              <span className="hfact__n">395</span>
              <span className="hfact__l">Lotes residenciais</span>
            </div>
            <div className="hfact">
              <span className="hfact__n">
                200<i>mil m²</i>
              </span>
              <span className="hfact__l">Mata Atlântica preservada</span>
            </div>
            <div className="hfact">
              <span className="hfact__n">
                360<i>m²</i>
              </span>
              <span className="hfact__l">Lotes a partir de</span>
            </div>
          </div>
        </div>
        <div className="scrollcue">
          <span>Role</span>
          <span className="bar"></span>
        </div>
      </section>

      {/* ====================== ESSÊNCIA / MANIFESTO ====================== */}
      <section className="section manifesto" id="essencia">
        <div className="wrap">
          <div className="manifesto__grid">
            <div className="manifesto__txt reveal">
              <span className="eyebrow">A flor · O convite</span>
              <p className="manifesto__big" style={{ marginTop: '1.4rem' }}>
                Uma flor inspirada no cerrado, um convite à sua família, aos
                seus afetos e à sua <em>vida</em>. Abraçando a essência da Mata
                Atlântica, prestamos homenagem à terra que chamaremos de lar.
              </p>
              <p
                className="muted"
                style={{ marginTop: '1.6rem', maxWidth: '48ch' }}
              >
                Contemplando as espécies nativas e o ecossistema para nos
                inspirar a viver bem — com tons terrosos e esverdeados que trazem
                os elementos da natureza viva para dentro do empreendimento.
              </p>
              <div className="tag-row">
                <span className="tag">Mata Atlântica</span>
                <span className="tag">Novo urbanismo</span>
                <span className="tag">Paisagismo nativo</span>
                <span className="tag">Sustentável</span>
              </div>
            </div>
            <div className="convite-stack">
              <div className="manifesto__media reveal-img" data-plx="0.05">
                <img
                  src={`${IMG}/a042.jpg`}
                  alt="Caminho na Mata Atlântica preservada do empreendimento"
                />
              </div>
              <div className="c2 reveal d2">
                <img
                  src={`${IMG}/a006.jpg`}
                  alt="Bem-estar e contato com a natureza no Gran Ville Santo Angelo"
                />
              </div>
              <div className="flower-badge">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <g fill="#A9542F">
                    <path d="M50 12c5 9 5 20 0 29-5-9-5-20 0-29Z"></path>
                    <path d="M50 88c-5-9-5-20 0-29 5 9 5 20 0 29Z"></path>
                    <path d="M12 50c9-5 20-5 29 0-9 5-20 5-29 0Z"></path>
                    <path d="M88 50c-9 5-20 5-29 0 9-5 20-5 29 0Z"></path>
                    <path d="M23 23c10 1 19 6 24 15-11-1-20-6-24-15Z"></path>
                    <path d="M77 77c-10-1-19-6-24-15 11 1 20 6 24 15Z"></path>
                    <path d="M77 23c-1 10-6 19-15 24 1-11 6-20 15-24Z"></path>
                    <path d="M23 77c1-10 6-19 15-24-1 11-6 20-15 24Z"></path>
                  </g>
                  <circle cx="50" cy="50" r="6" fill="#B5883F"></circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== LOCALIZAÇÃO ====================== */}
      <section className="section loc" id="localizacao">
        <div className="wrap">
          <div className="loc__head">
            <div className="reveal">
              <span className="eyebrow">Localização · Itupeva-SP</span>
              <h2 className="h2" style={{ marginTop: '1.1rem' }}>
                O acolhimento do interior,
                <br />a{' '}
                <span style={{ color: 'var(--terra-soft)' }}>proximidade</span>{' '}
                da capital.
              </h2>
            </div>
            <div className="reveal d1">
              <p className="muted">
                Itupeva tornou-se o refúgio de quem deseja mais tranquilidade e,
                ao mesmo tempo, ter próximos os benefícios de uma metrópole.
                Vizinha a Jundiaí — uma das melhores cidades do Brasil para se
                viver, com escolas de alto padrão, shoppings e um dos maiores
                IDHs do país.
              </p>
            </div>
          </div>
          <div className="loc__grid">
            <div className="loc__map reveal">
              <img
                className="loc__fallback"
                src={`${IMG}/a044.jpg`}
                alt="Mapa de localização do Gran Ville Santo Angelo em Itupeva-SP"
              />
              <iframe
                src="https://www.google.com/maps?q=Rodovia+Mario+Tonolli,+415+-+Itupeva+-+SP&z=14&output=embed"
                title="Mapa de localização do Gran Ville Santo Angelo em Itupeva-SP"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
              <a
                className="loc__maplink"
                href="https://www.google.com/maps/search/?api=1&query=Rodovia+Mario+Tonolli,+415+-+Itupeva+-+SP"
                target="_blank"
                rel="noopener"
              >
                Abrir no Google Maps{' '}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M7 17 17 7M9 7h8v8"></path>
                </svg>
              </a>
            </div>
            <div className="dist-list reveal d1">
              <div className="dist">
                <span className="dist__city">Jundiaí</span>
                <span className="dist__km">
                  <b>24 km</b> · 35 min
                </span>
              </div>
              <div className="dist">
                <span className="dist__city">Campinas</span>
                <span className="dist__km">
                  <b>53 km</b> · 56 min
                </span>
              </div>
              <div className="dist">
                <span className="dist__city">São Paulo</span>
                <span className="dist__km">
                  <b>76 km</b> · 1h33
                </span>
              </div>
              <div className="dist">
                <span className="dist__city">Acesso</span>
                <span className="dist__km">Rod. Mario Tonolli</span>
              </div>
            </div>
          </div>
          <div className="serra reveal">
            <div>
              <span className="eyebrow">Vida Completa Serra Azul</span>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  lineHeight: 1.3,
                  margin: '.8rem 0 0',
                  maxWidth: '24ch',
                }}
              >
                O maior complexo turístico da região, a poucos minutos.
              </p>
            </div>
            <div className="serra__chips">
              <span className="tag">Parque aquático Wet&apos;n Wild</span>
              <span className="tag">Parque temático Hopi Hari</span>
              <span className="tag">Shopping Serra Azul</span>
              <span className="tag">Outlet Premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== O PROJETO / NÚMEROS ====================== */}
      <section className="section stats" id="projeto">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">O Projeto</span>
            <h2 className="h2">
              Um empreendimento que amplia tudo o que você sonhava sobre o{' '}
              <span style={{ color: 'var(--terra)' }}>viver</span>.
            </h2>
            <p className="lead">
              Arquitetura contemporânea e as tendências do novo urbanismo são a
              base da concepção do Gran Ville Santo Angelo — integrando o
              empreendimento ao seu entorno e à natureza.
            </p>
          </div>

          <div className="stats__grid reveal">
            <div className="stat">
              <div className="stat__tick"></div>
              <div className="stat__num">
                <span data-count="450">0</span>
                <span className="u"> mil m²</span>
              </div>
              <div className="stat__lbl">Área total do empreendimento</div>
            </div>
            <div className="stat">
              <div className="stat__tick"></div>
              <div className="stat__num">
                <span data-count="200">0</span>
                <span className="u"> mil m²</span>
              </div>
              <div className="stat__lbl">Mata Atlântica preservada</div>
            </div>
            <div className="stat">
              <div className="stat__tick"></div>
              <div className="stat__num">
                <span data-count="395">0</span>
              </div>
              <div className="stat__lbl">Lotes residenciais</div>
            </div>
            <div className="stat">
              <div className="stat__tick"></div>
              <div className="stat__num">
                <span data-count="22">0</span>
              </div>
              <div className="stat__lbl">Lotes comerciais</div>
            </div>
          </div>

          <div className="diffs">
            <div className="diff reveal">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M3 21V8l9-5 9 5v13"></path>
                  <path d="M3 21h18M9 21v-6h6v6"></path>
                </svg>
              </div>
              <div>
                <h4>Área de lazer ampla</h4>
                <p>
                  Clube privativo completo e complexo esportivo integrados ao
                  bairro.
                </p>
              </div>
            </div>
            <div className="diff reveal d1">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                </svg>
              </div>
              <div>
                <h4>Loteamento com acesso controlado</h4>
                <p>
                  Totalmente murado, com duas portarias e monitoramento por
                  CFTV.
                </p>
              </div>
            </div>
            <div className="diff reveal">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M12 2v20M5 9l7-7 7 7"></path>
                  <circle cx="12" cy="14" r="3"></circle>
                </svg>
              </div>
              <div>
                <h4>Primeiro bairro de Itupeva com gás Comgás</h4>
                <p>Pioneiro na região a contar com gás canalizado.</p>
              </div>
            </div>
            <div className="diff reveal d1">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M12 22c4-3 7-7 7-12a7 7 0 0 0-14 0c0 5 3 9 7 12Z"></path>
                  <path d="M12 13c2 0 3-1 3-3M12 13c-2 0-3-1-3-3"></path>
                </svg>
              </div>
              <div>
                <h4>Soluções paisagísticas inovadoras</h4>
                <p>
                  Espécies nativas e revitalização do córrego em todo o
                  empreendimento.
                </p>
              </div>
            </div>
            <div className="diff reveal">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"></path>
                  <circle cx="12" cy="19" r="1.2" fill="currentColor"></circle>
                </svg>
              </div>
              <div>
                <h4>Infraestrutura completa</h4>
                <p>
                  Inclusive rede de fibra óptica com internet de alta
                  velocidade.
                </p>
              </div>
            </div>
            <div className="diff reveal d1">
              <div className="diff__ic">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M3 21h18M6 21V11l6-4 6 4v10"></path>
                  <path d="M10 21v-5h4v5"></path>
                </svg>
              </div>
              <div>
                <h4>Lotes a partir de 360 m²</h4>
                <p>
                  Opções residenciais e comerciais para morar, trabalhar e
                  desfrutar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== ARQUITETURA (split) ====================== */}
      <section
        className="section"
        id="arquitetura"
        style={{ background: 'var(--paper)' }}
      >
        <div className="wrap">
          <div className="split">
            <div className="split__media reveal-img" data-plx="0.05">
              <img
                src={`${IMG}/a008.jpg`}
                alt="Arquitetura com madeira, tijolos e pedras, integrada à natureza"
              />
            </div>
            <div className="split__body reveal d1">
              <span className="eyebrow">Arquitetura</span>
              <h2 className="h2" style={{ margin: '1rem 0 .6rem' }}>
                Naturalmente bela.
              </h2>
              <p className="lead">
                As estruturas seguem as cores e tonalidades da natureza — tons
                terrosos e esverdeados, em busca do equilíbrio entre as
                construções e o seu redor.
              </p>
              <p className="muted">
                A arquitetura valoriza a luz natural e as aberturas para a
                amplitude dos ambientes. Madeira, tijolos e pedras compõem uma
                expressão estética mais fluida e humana.
              </p>
              <div className="tag-row">
                <span className="tag">Madeira</span>
                <span className="tag">Tijolos</span>
                <span className="tag">Pedras</span>
                <span className="tag">Luz natural</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 'clamp(48px,6vw,84px)' }}>
            <span className="eyebrow reveal">Plantas humanizadas</span>
            <p
              className="lead reveal"
              style={{ marginTop: '.8rem', maxWidth: '52ch' }}
            >
              Estudos de implantação das casas-referência nos lotes — clique para
              ampliar.
            </p>
            <div className="plantas reveal">
              <div
                className="planta"
                data-lb="img/planta-1.jpg"
                data-lb-t="Casa Pôr do Sol"
                data-lb-s="Planta humanizada"
              >
                <img
                  src={`${IMG}/a004.jpg`}
                  alt="Planta humanizada da Casa Pôr do Sol"
                />
                <span className="planta__l">Casa Pôr do Sol</span>
              </div>
              <div
                className="planta"
                data-lb="img/planta-2.jpg"
                data-lb-t="Casa Suspensa"
                data-lb-s="Planta humanizada"
              >
                <img
                  src={`${IMG}/a005.jpg`}
                  alt="Planta humanizada da Casa Suspensa"
                />
                <span className="planta__l">Casa Suspensa</span>
              </div>
              <div
                className="planta"
                data-lb="img/planta-3.jpg"
                data-lb-t="Casa Jardim"
                data-lb-s="Planta humanizada"
              >
                <img
                  src={`${IMG}/a003.jpg`}
                  alt="Planta humanizada da Casa Jardim"
                />
                <span className="planta__l">Casa Jardim</span>
              </div>
              <div
                className="planta"
                data-lb="img/planta-4.jpg"
                data-lb-t="Casa Cristal"
                data-lb-s="Planta humanizada"
              >
                <img
                  src={`${IMG}/a002.jpg`}
                  alt="Planta humanizada da Casa Cristal"
                />
                <span className="planta__l">Casa Cristal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== PAISAGISMO (split rev) ====================== */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="wrap">
          <div className="split rev">
            <div className="reveal-img" data-plx="0.04">
              <div className="media-cluster">
                <div className="mc tall">
                  <img
                    src={`${IMG}/a043.jpg`}
                    alt="Caminhos de passeio com paisagismo de espécies nativas"
                  />
                </div>
                <div className="mc sm">
                  <img
                    src={`${IMG}/a032.jpg`}
                    alt="Revitalização do córrego e suas margens"
                  />
                </div>
                <div className="mc sm">
                  <img
                    src={`${IMG}/a000.jpg`}
                    alt="Mata Atlântica preservada no empreendimento"
                  />
                </div>
              </div>
            </div>
            <div className="split__body reveal d1">
              <span className="eyebrow">Paisagismo</span>
              <h2 className="h2" style={{ margin: '1rem 0 .6rem' }}>
                Preserva,
                <br />
                valoriza, encanta.
              </h2>
              <p className="lead">
                O paisagismo apoia-se em boas práticas sustentáveis e ecológicas,
                com espécies nativas regionais e de reserva de Mata Atlântica.
              </p>
              <p className="muted">
                Inclui o projeto especial de revitalização do córrego e suas
                margens, aumentando a biodiversidade local.
              </p>
              <div className="tag-row">
                <span className="tag">Jardins de chuva</span>
                <span className="tag">Passagens de fauna</span>
                <span className="tag">Caminhos de passeio</span>
                <span className="tag">Calçadas permeáveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== MASTERPLAN ====================== */}
      <section className="section plan" id="masterplan">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Implantação</span>
            <h2 className="h2">
              Mapa de{' '}
              <span style={{ color: 'var(--terra)' }}>implantação</span>
            </h2>
            <p className="lead">
              Um projeto que conecta os espaços e a natureza, valoriza a
              mobilidade urbana e pensa no dia a dia da família. Tudo está perto.
              E é rápido de chegar.
            </p>
          </div>
          <div className="plan__grid">
            <div className="plan__map reveal-img">
              <img
                src={`${IMG}/a020.jpg`}
                alt="Mapa de implantação do Gran Ville Santo Angelo"
              />
            </div>
            <div className="plan__legend reveal d1">
              <div className="legend-item">
                <span className="n">01</span>
                <span className="t">Portaria</span>
              </div>
              <div className="legend-item">
                <span className="n">02</span>
                <span className="t">Academia</span>
              </div>
              <div className="legend-item">
                <span className="n">03</span>
                <span className="t">Vestiário</span>
              </div>
              <div className="legend-item">
                <span className="n">04</span>
                <span className="t">SPA</span>
              </div>
              <div className="legend-item">
                <span className="n">05</span>
                <span className="t">Piscina</span>
              </div>
              <div className="legend-item">
                <span className="n">06</span>
                <span className="t">Complexo recreativo</span>
              </div>
              <div className="legend-item">
                <span className="n">07</span>
                <span className="t">Complexo esportivo + pet place</span>
              </div>
              <div className="legend-item">
                <span className="n">08</span>
                <span className="t">Quadra poliesportiva</span>
              </div>
              <div className="legend-item">
                <span className="n">09</span>
                <span className="t">Quadra de beach tennis / volley</span>
              </div>
              <div className="legend-item">
                <span className="n">10</span>
                <span className="t">Salão de festas</span>
              </div>
              <div className="legend-item">
                <span className="n">11</span>
                <span className="t">Complexo lúdico contemplativo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== CLUBE / GALLERY ====================== */}
      <section className="section club" id="clube">
        <div className="wrap">
          <div className="sec-head reveal" style={{ maxWidth: 'none' }}>
            <span className="eyebrow">Clube privativo</span>
            <h2 className="h2" style={{ maxWidth: '18ch' }}>
              Piscinas, fitness, saunas e saúde a serviço do seu{' '}
              <span style={{ color: 'var(--terra-soft)' }}>bem-estar</span>.
            </h2>
            <div className="filterbar" role="tablist" aria-label="Filtrar lazer">
              <button className="active" data-filter="all">
                Todos
              </button>
              <button data-filter="agua">Águas &amp; Spa</button>
              <button data-filter="fitness">Fitness</button>
              <button data-filter="convivio">Convívio</button>
              <button data-filter="familia">Família</button>
            </div>
          </div>

          <div className="gallery">
            <div
              className="gcard"
              data-cat="agua"
              data-lb="img/pool-1.jpg"
              data-lb-t="Piscinas"
              data-lb-s="Clube privativo"
            >
              <img
                src={`${IMG}/a014.jpg`}
                alt="Perspectiva ilustrada da piscina do clube privativo"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Águas &amp; Spa</div>
                <div className="gt">Piscinas</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="agua"
              data-lb="img/pool-2.jpg"
              data-lb-t="Solário &amp; lazer"
              data-lb-s="Clube privativo"
            >
              <img
                src={`${IMG}/a024.jpg`}
                alt="Perspectiva da área de piscina e solário"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Águas &amp; Spa</div>
                <div className="gt">Solário</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="fitness"
              data-lb="img/gym.jpg"
              data-lb-t="Academia completa"
              data-lb-s="Fitness"
            >
              <img
                src={`${IMG}/a012.jpg`}
                alt="Perspectiva ilustrada da academia completa"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Fitness</div>
                <div className="gt">Academia completa</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="agua"
              data-lb="img/spa.jpg"
              data-lb-t="Spa"
              data-lb-s="Para respirar e relaxar"
            >
              <img src={`${IMG}/a011.jpg`} alt="Perspectiva ilustrada do spa" />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Águas &amp; Spa</div>
                <div className="gt">Spa</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="agua"
              data-lb="img/sauna.jpg"
              data-lb-t="Saunas seca &amp; molhada"
              data-lb-s="Bem-estar"
            >
              <img src={`${IMG}/a029.jpg`} alt="Perspectiva ilustrada da sauna" />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Águas &amp; Spa</div>
                <div className="gt">Saunas</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="convivio"
              data-lb="img/salao-festas.jpg"
              data-lb-t="Salão de festas"
              data-lb-s="Grandes comemorações"
            >
              <img
                src={`${IMG}/a021.jpg`}
                alt="Perspectiva ilustrada do salão de festas"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Convívio</div>
                <div className="gt">Salão de festas</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="convivio"
              data-lb="img/salao-dining.jpg"
              data-lb-t="Espaço gourmet"
              data-lb-s="Convívio"
            >
              <img
                src={`${IMG}/a007.jpg`}
                alt="Perspectiva interna do salão de festas"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Convívio</div>
                <div className="gt">Espaço gourmet</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="convivio"
              data-lb="img/quiosque.jpg"
              data-lb-t="Quiosques"
              data-lb-s="Churrasqueira &amp; forno de pizza"
            >
              <img
                src={`${IMG}/a040.jpg`}
                alt="Perspectiva dos quiosques com churrasqueira"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Convívio</div>
                <div className="gt">Quiosques</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="convivio"
              data-lb="img/automercado.jpg"
              data-lb-t="Automercado"
              data-lb-s="Conveniência no bairro"
            >
              <img
                src={`${IMG}/a035.jpg`}
                alt="Perspectiva ilustrada do automercado"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Convívio</div>
                <div className="gt">Automercado</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="familia"
              data-lb="img/playground.jpg"
              data-lb-t="Playground"
              data-lb-s="Complexo lúdico"
            >
              <img
                src={`${IMG}/a041.jpg`}
                alt="Perspectiva ilustrada do playground"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Família</div>
                <div className="gt">Playground</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="familia"
              data-lb="img/petplace.jpg"
              data-lb-t="Pet place"
              data-lb-s="Para o seu melhor amigo"
            >
              <img
                src={`${IMG}/a037.jpg`}
                alt="Perspectiva ilustrada do pet place"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Família</div>
                <div className="gt">Pet place</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="familia"
              data-lb="img/horta.jpg"
              data-lb-t="Horta coletiva"
              data-lb-s="Plantar, regar e colher"
            >
              <img src={`${IMG}/a016.jpg`} alt="Horta coletiva Santo Angelo" />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Família</div>
                <div className="gt">Horta coletiva</div>
              </div>
            </div>
            <div
              className="gcard"
              data-cat="fitness"
              data-lb="img/deck-academia.jpg"
              data-lb-t="Deck &amp; fitness ao ar livre"
              data-lb-s="Fitness"
            >
              <img
                src={`${IMG}/a036.jpg`}
                alt="Perspectiva do deck e academia ao ar livre"
              />
              <div className="gcard__plus">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <div className="gcard__ov">
                <div className="gs">Fitness</div>
                <div className="gt">Deck ao ar livre</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== ESPORTE ====================== */}
      <section className="section sport" id="esporte">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Complexo esportivo</span>
            <h2 className="h2">
              Para despertar o{' '}
              <span style={{ color: 'var(--terra)' }}>atleta</span> que vive em
              você.
            </h2>
          </div>
        </div>
        <div className="wrap">
          <div className="carousel reveal" data-carousel="">
            <div className="carousel__viewport">
              <div className="carousel__track">
                <div className="scard">
                  <img src={`${IMG}/a030.jpg`} alt="Quadra poliesportiva" />
                  <div className="scard__c">
                    <span className="n">02 UNIDADES</span>
                    <h3>Quadras poliesportivas</h3>
                  </div>
                </div>
                <div className="scard">
                  <img
                    src={`${IMG}/a033.jpg`}
                    alt="Campo de futebol society com grama sintética"
                  />
                  <div className="scard__c">
                    <span className="n">GRAMA SINTÉTICA</span>
                    <h3>Campo de futebol society</h3>
                  </div>
                </div>
                <div className="scard">
                  <img
                    src={`${IMG}/a019.jpg`}
                    alt="Quadras de areia para beach tennis e volley"
                  />
                  <div className="scard__c">
                    <span className="n">02 UNIDADES</span>
                    <h3>Quadras de areia</h3>
                  </div>
                </div>
                <div className="scard">
                  <img
                    src={`${IMG}/a039.jpg`}
                    alt="Vista aérea do complexo esportivo"
                  />
                  <div className="scard__c">
                    <span className="n">BEACH TENNIS · VOLLEY</span>
                    <h3>Complexo esportivo</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel__nav">
              <div className="carousel__dots"></div>
              <div className="carousel__btns">
                <button className="carousel__btn prev" aria-label="Anterior">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                </button>
                <button className="carousel__btn next" aria-label="Próxima">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== CASAS ====================== */}
      <section className="section casas" id="casas">
        <div className="wrap">
          <div className="sec-head reveal" style={{ maxWidth: 'none' }}>
            <span className="eyebrow">Projetos de casas</span>
            <h2 className="h2" style={{ maxWidth: '20ch' }}>
              Seis projetos assinados, prontos para inspirar o seu{' '}
              <span style={{ color: 'var(--terra-soft)' }}>lar</span>.
            </h2>
            <p className="lead muted" style={{ maxWidth: '54ch' }}>
              Referências de arquitetura desenvolvidas por escritórios
              convidados para os lotes do Gran Ville Santo Angelo.
            </p>
          </div>
          <div className="casas__grid">
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a015.jpg`}
                alt="Casa Pôr do Sol — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a025.jpg`}
                alt="Casa Pôr do Sol — área de piscina"
              />
              <span className="casa__lote">Lote 04 · Quadra M</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 01</span>
                <h3 className="casa__t">Casa Pôr do Sol</h3>
                <span className="casa__arq">
                  Fabiana Pelegrini · Engenharia e Urbanismo
                </span>
              </div>
            </article>
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a028.jpg`}
                alt="Casa Suspensa — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a022.jpg`}
                alt="Casa Suspensa — área de piscina"
              />
              <span className="casa__lote">Lote 03 · Quadra M</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 02</span>
                <h3 className="casa__t">Casa Suspensa</h3>
                <span className="casa__arq">GRBX Arquitetos · Gustavo Arbex</span>
              </div>
            </article>
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a023.jpg`}
                alt="Casa Luz — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a018.jpg`}
                alt="Casa Luz — área de piscina"
              />
              <span className="casa__lote">Lote 16 · Quadra H</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 03</span>
                <h3 className="casa__t">Casa Luz</h3>
                <span className="casa__arq">
                  Maltarollo Arquitetura · M. Santana e J. Maltarollo
                </span>
              </div>
            </article>
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a026.jpg`}
                alt="Casa Jardim — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a031.jpg`}
                alt="Casa Jardim — área de piscina"
              />
              <span className="casa__lote">Lote 31 · Quadra E</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 04</span>
                <h3 className="casa__t">Casa Jardim</h3>
                <span className="casa__arq">
                  Konstrui Arquitetura · Rafaela Marques
                </span>
              </div>
            </article>
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a034.jpg`}
                alt="Casa Cristal — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a027.jpg`}
                alt="Casa Cristal — área de piscina"
              />
              <span className="casa__lote">Lote 26 · Quadra R</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 05</span>
                <h3 className="casa__t">Casa Cristal</h3>
                <span className="casa__arq">Tania Valeria Arquitetura</span>
              </div>
            </article>
            <article className="casa">
              <img
                className="main"
                src={`${IMG}/a013.jpg`}
                alt="Casa Valentina — projeto de referência"
              />
              <img
                className="alt"
                src={`${IMG}/a017.jpg`}
                alt="Casa Valentina — área de piscina"
              />
              <span className="casa__lote">Lotes 15 e 16 · Quadra N</span>
              <div className="casa__c">
                <span className="casa__n">Projeto 06</span>
                <h3 className="casa__t">Casa Valentina</h3>
                <span className="casa__arq">
                  Mari Arquitetura e Interiores · Maria Luiza
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ====================== SOBRE A GP ====================== */}
      <section className="section gp" id="gp">
        <div className="wrap">
          <div className="gp__grid">
            <div className="reveal-img">
              <div className="gp__media">
                <img
                  src={`${IMG}/a010.jpg`}
                  alt="Foto real de empreendimento entregue pela GP Desenvolvimento Urbano"
                />
                <span className="cap">Foto real · Gran Ville São Venâncio</span>
              </div>
            </div>
            <div className="reveal d1">
              <span className="eyebrow">Somos a GP Desenvolvimento Urbano</span>
              <h2 className="h2" style={{ margin: '1.1rem 0 .8rem' }}>
                Tradição em urbanização nacional.
              </h2>
              <p className="muted">
                Com mais de 39 anos, desempenhamos um papel fundamental no
                desenvolvimento urbano inteligente, sustentável e alinhado às
                tendências globais. Somos referência em projetos planejados na
                região metropolitana de São Paulo — e chegamos a Itupeva há mais
                de 10 anos, em 2012, com o Gran Ville São Venâncio.
              </p>
              <div className="gp__stats">
                <div className="gs">
                  <div className="n">+39</div>
                  <div className="l">Anos de história</div>
                </div>
                <div className="gs">
                  <div className="n">+19 mil</div>
                  <div className="l">Unidades entregues</div>
                </div>
                <div className="gs">
                  <div className="n">+69</div>
                  <div className="l">Empreendimentos</div>
                </div>
              </div>
              <div className="gp__values tag-row">
                <span className="tag">Transparência nas negociações</span>
                <span className="tag">Desenvolvimento para a região</span>
                <span className="tag">+20 milhões de m² urbanizados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== FAQ ====================== */}
      <section className="section faq" id="faq">
        <div className="wrap">
          <div className="faq__grid">
            <div className="reveal">
              <span className="eyebrow">Dúvidas frequentes</span>
              <h2 className="h2" style={{ marginTop: '1rem' }}>
                Tudo o que você precisa saber.
              </h2>
              <p className="muted" style={{ marginTop: '1.2rem' }}>
                Não encontrou sua resposta? Fale com a nossa Central de Vendas
                pelo WhatsApp.
              </p>
              <a
                className="btn wa"
                style={{ marginTop: '.6rem' }}
                href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20Gran%20Ville%20Santo%20Angelo."
                target="_blank"
                rel="noopener"
              >
                <span>Tirar dúvida no WhatsApp</span>
              </a>
            </div>
            <div className="acc reveal d1">
              <div className="acc__item">
                <button className="acc__q">
                  Onde fica o Gran Ville Santo Angelo?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    Em Itupeva-SP, com acesso pela Rodovia Mario Tonolli. A
                    Central de Vendas fica na Rodovia Mario Tonolli, 415. Jundiaí
                    está a 24 km (35 min), Campinas a 53 km e São Paulo a 76 km.
                  </p>
                </div>
              </div>
              <div className="acc__item">
                <button className="acc__q">
                  Quais são os tamanhos e tipos de lotes?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    São lotes residenciais e comerciais a partir de 360 m². No
                    total, o empreendimento conta com 395 lotes residenciais e 22
                    lotes comerciais.
                  </p>
                </div>
              </div>
              <div className="acc__item">
                <button className="acc__q">
                  O empreendimento é aprovado e regularizado?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    Sim. Loteamento com controle de acesso aprovado e registrado
                    conforme a Lei 6766/79, aprovado pelo GRAPROHAB (certificado
                    n°017/2023) e pela CETESB, com alvará de loteamento
                    n°1.460/2023. Todos os atos estão registrados na Matrícula
                    n°192.201 do 1º Oficial de Registro de Imóveis de
                    Jundiaí-SP.
                  </p>
                </div>
              </div>
              <div className="acc__item">
                <button className="acc__q">
                  Quais são os itens de lazer?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    Clube privativo com piscinas, academia completa, spa, saunas
                    seca e molhada, salão de festas, quiosques com churrasqueira e
                    forno de pizza, playground, pet place, automercado e horta
                    coletiva. Além de um complexo esportivo com 2 quadras
                    poliesportivas, 2 quadras de areia (beach tennis/volley) e
                    campo de futebol society.
                  </p>
                </div>
              </div>
              <div className="acc__item">
                <button className="acc__q">
                  Como funciona a segurança?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    Condomínio totalmente murado, com duas portarias, sistema de
                    controle de acesso automatizado e monitoramento por CFTV, além
                    de rede de fibra óptica com internet de alta velocidade.
                  </p>
                </div>
              </div>
              <div className="acc__item">
                <button className="acc__q">
                  Quem é a incorporadora?
                  <span className="acc__ic"></span>
                </button>
                <div className="acc__a">
                  <p>
                    A GP Desenvolvimento Urbano, com mais de 39 anos de tradição
                    em urbanização, mais de 19 mil unidades entregues e mais de 69
                    empreendimentos construídos. Presente em Itupeva desde 2012.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== CONTATO ====================== */}
      <section className="section contact" id="contato">
        <div className="contact__bg">
          <img src={`${IMG}/a045.jpg`} alt="" />
        </div>
        <div className="wrap">
          <div className="contact__grid">
            <div className="contact__info reveal">
              <span className="eyebrow">Fale com a gente</span>
              <h2
                className="h2"
                style={{ margin: '1.1rem 0 .8rem', color: 'var(--paper)' }}
              >
                Venha viver o
                <br />
                Gran Ville Santo Angelo.
              </h2>
              <p className="lead">
                Agende uma visita à Central de Vendas e conheça de perto o novo
                bairro planejado de Itupeva. Consulte condições.
              </p>
              <div className="contact__chan">
                <div className="chan">
                  <span className="chan__ic">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3Z"></path>
                    </svg>
                  </span>
                  <div>
                    <div className="chan__l">WhatsApp · Central de Vendas</div>
                    <a
                      className="chan__v"
                      href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Gran%20Ville%20Santo%20Angelo."
                      target="_blank"
                      rel="noopener"
                    >
                      (11) 92614-3393
                    </a>
                  </div>
                </div>
                <div className="chan">
                  <span className="chan__ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                    >
                      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"></path>
                      <circle cx="12" cy="10" r="2.5"></circle>
                    </svg>
                  </span>
                  <div>
                    <div className="chan__l">Central de Vendas</div>
                    <div className="chan__v">
                      Rod. Mario Tonolli, 415 — Itupeva-SP
                    </div>
                  </div>
                </div>
                <div className="chan">
                  <span className="chan__ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                    >
                      <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6"></path>
                    </svg>
                  </span>
                  <div>
                    <div className="chan__l">Realização de vendas</div>
                    <div className="chan__v">Lotus Brokers</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal d1" style={{ position: 'relative' }}>
              <div className="form">
                <form className="lead-form" noValidate>
                  <h3>Receba mais informações</h3>
                  <p className="sub">
                    Preencha e fale agora com um consultor pelo WhatsApp.
                  </p>
                  <div className="field">
                    <label htmlFor="f-nome">Nome completo</label>
                    <input
                      id="f-nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-tel">WhatsApp</label>
                    <input
                      id="f-tel"
                      name="telefone"
                      type="tel"
                      placeholder="(11) 90000-0000"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-email">E-mail</label>
                    <input
                      id="f-email"
                      name="email"
                      type="email"
                      placeholder="voce@email.com"
                    />
                  </div>
                  <button className="btn lg" type="submit">
                    <span>
                      Quero saber mais{' '}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M5 12h14M13 6l6 6-6 6"></path>
                      </svg>
                    </span>
                  </button>
                  <p className="form__legal">
                    Ao enviar, você concorda em ser contactado pela equipe de
                    vendas. Seus dados não são compartilhados com terceiros.
                  </p>
                </form>
                <div className="form__ok">
                  <div className="ok-ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3>Recebemos seu contato!</h3>
                  <p className="sub">
                    Estamos te direcionando ao WhatsApp da Central de Vendas.
                  </p>
                  <a
                    className="btn wa ok-wa"
                    href="https://wa.me/5511926143393"
                    target="_blank"
                    rel="noopener"
                  >
                    <span>Abrir WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div>
              <a
                className="brand"
                href="#inicio"
                aria-label="Gran Ville Santo Angelo"
              >
                <img
                  className="footer__logo"
                  src={`${IMG}/a001.png`}
                  alt="Gran Ville Santo Angelo"
                  width={743}
                  height={604}
                />
              </a>
              <p
                className="muted"
                style={{
                  color: 'rgba(245,240,231,.6)',
                  marginTop: '1.5rem',
                  maxWidth: '38ch',
                }}
              >
                O novo bairro planejado de Itupeva. Um empreendimento GP
                Desenvolvimento Urbano.
              </p>
            </div>
            <div className="footer__col">
              <h5>Navegação</h5>
              <a href="#essencia">Essência</a>
              <a href="#localizacao">Localização</a>
              <a href="#projeto">O Projeto</a>
              <a href="#clube">Clube</a>
              <a href="#casas">Casas</a>
              <a href="#gp">A GP</a>
            </div>
            <div className="footer__col">
              <h5>Contato</h5>
              <a
                href="https://wa.me/5511926143393"
                target="_blank"
                rel="noopener"
              >
                WhatsApp (11) 92614-3393
              </a>
              <a href="#contato">Central de Vendas</a>
              <a href="#contato">Agende sua visita</a>
              <span
                style={{
                  display: 'block',
                  padding: '.4rem 0',
                  fontSize: '.92rem',
                  color: 'rgba(245,240,231,.55)',
                }}
              >
                Rod. Mario Tonolli, 415
                <br />
                Itupeva — SP
              </span>
            </div>
          </div>
          <p className="footer__legal">
            Gran Ville Santo Ângelo, loteamento com controle de acesso aprovado e
            registrado conforme Lei 6766/79, aprovado pelo GRAPROHAB conforme
            certificado de aprovação n°017/2023, protocolo GRAPROHAB n°18.073,
            aprovado pela CETESB conforme TCRA n°13.202/2023, processo
            CETESB/SIMA n°3600376/2022, alvará de loteamento n°1.460/2023, Decreto
            de aprovação n°3.630 de 29/06/2023, todos emitidos pela Prefeitura
            Municipal de Itupeva, todos os atos de aprovação registrados na
            Matrícula n°192.201 do Primeiro Oficial de Registro de Imóveis de
            Jundiaí-SP. Imagens e perspectivas meramente ilustrativas. As
            metragens e itens de lazer referem-se ao projeto aprovado e podem
            sofrer alterações. Consulte condições comerciais.
          </p>
          <div className="footer__bot">
            <span>
              © 2026 Gran Ville Santo Angelo · GP Desenvolvimento Urbano
            </span>
            <span className="imob">
              Realização de vendas · <b>Lotus Brokers</b>
            </span>
          </div>
        </div>
      </footer>

      {/* ====================== FLOATING WHATSAPP ====================== */}
      <a
        className="fab"
        href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Gran%20Ville%20Santo%20Angelo."
        target="_blank"
        rel="noopener"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3Zm5.5-5.9c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z"></path>
        </svg>
        <span className="fab__txt">Falar no WhatsApp</span>
      </a>

      {/* ====================== LIGHTBOX ====================== */}
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Visualizador de imagens"
      >
        <button className="lb-close" aria-label="Fechar">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 6l12 12M18 6L6 18"></path>
          </svg>
        </button>
        <button className="lb-nav prev" aria-label="Anterior">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 18l-6-6 6-6"></path>
          </svg>
        </button>
        <button className="lb-nav next" aria-label="Próxima">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </button>
        <div className="lightbox__img">
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            alt="Imagem ampliada"
          />
          <div className="lightbox__cap">
            <span className="cap-t"></span>
            <small className="cap-s"></small>
          </div>
        </div>
      </div>
    </>
  );
}
