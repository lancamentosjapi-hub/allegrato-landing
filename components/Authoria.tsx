'use client';

/**
 * Authoria by Tebas — porte 1:1 de authoria/index.html (formato CSS-class, NÃO dc-runtime).
 *
 * Estratégia de porte:
 *  - O markup do <body> vira JSX literal (class-> className, atributos data-* preservados,
 *    style="..." -> objeto, self-closing, comentários {/* *\/}). Textos/imagens/links EXATOS.
 *  - O CSS (dois blocos <style>) vive em app/authoria/authoria.css (importado na page).
 *  - As fontes aNNN.woff2 estão em /public/fonts/authoria/ (referenciadas pelo CSS).
 *  - As imagens aNNN.jpg/png estão em /public/authoria/ (src reescrito de "aNNN.ext" -> "/authoria/aNNN.ext").
 *  - Toda a interatividade de a028.js é reimplementada FIEL num único useEffect (client):
 *    starfield x2, header scrolled + parallax + whatsapp reveal, reveal/counters scan-based,
 *    plantas tabs, lazer filters + lightbox, plan zoom, carrossel interiores, FAQ, lead form
 *    -> WhatsApp, smooth anchors, e o painel de "tweaks" (protocolo host edit-mode).
 *
 * O JS original manipula o DOM via document.getElementById/querySelectorAll globais; como o
 * componente monta a árvore inteira, o effect reusa exatamente essas queries (mesmo comportamento).
 */

import { useEffect } from 'react';
import { sendLead } from '@/lib/lead';

export default function Authoria() {
  useEffect(() => {
    'use strict';

    /* ---------- CONFIG (edite o telefone aqui) ---------- */
    const CONFIG = {
      whatsapp: '5511926143393',
      waMsg: 'Olá! Tenho interesse no Authoria by Tebas e gostaria de agendar uma visita.',
    };
    const waLink = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.waMsg);
    const waEl = document.getElementById('wa') as HTMLAnchorElement | null;
    if (waEl) waEl.href = waLink;
    const waFooter = document.getElementById('waFooter') as HTMLAnchorElement | null;
    if (waFooter) waFooter.href = waLink;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- HELPERS ---------- */
    function debounce(fn: (...a: any[]) => void, ms: number) {
      let t: any;
      return function (this: any, ...a: any[]) {
        clearTimeout(t);
        const c = this;
        t = setTimeout(function () {
          fn.apply(c, a);
        }, ms);
      };
    }

    /* ============================================================
       STARFIELD
       ============================================================ */
    function Starfield(canvas: HTMLCanvasElement, opts?: { density?: number }) {
      opts = opts || {};
      const ctx = canvas.getContext('2d')!;
      let stars: any[] = [];
      const shooters: any[] = [];
      let w = 0,
        h = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const density = opts.density || 0.00018;
      function resize() {
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.floor(w * h * density);
        stars = [];
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.3 + 0.2,
            a: Math.random() * 0.6 + 0.2,
            tw: Math.random() * 0.02 + 0.004,
            ph: Math.random() * Math.PI * 2,
            hue: Math.random() < 0.12 ? 'gold' : Math.random() < 0.2 ? 'blue' : 'white',
          });
        }
      }
      function spawnShooter() {
        if (prefersReduced) return;
        const fromLeft = Math.random() < 0.5;
        shooters.push({
          x: fromLeft ? -20 : w + 20,
          y: Math.random() * h * 0.5,
          vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 3),
          vy: 1.4 + Math.random() * 1.2,
          life: 0,
          max: 60 + Math.random() * 30,
        });
      }
      let last = 0;
      function frame(t: number) {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.ph += s.tw;
          const alpha = s.a * (0.55 + 0.45 * Math.sin(s.ph));
          ctx.beginPath();
          ctx.globalAlpha = alpha;
          if (s.hue === 'gold') ctx.fillStyle = '#e7cd8f';
          else if (s.hue === 'blue') ctx.fillStyle = '#9fbce8';
          else ctx.fillStyle = '#ffffff';
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (let j = shooters.length - 1; j >= 0; j--) {
          const sh = shooters[j];
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life++;
          const op = Math.sin((sh.life / sh.max) * Math.PI);
          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 6, sh.y - sh.vy * 6);
          grad.addColorStop(0, 'rgba(231,205,143,' + op * 0.9 + ')');
          grad.addColorStop(1, 'rgba(231,205,143,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * 6, sh.y - sh.vy * 6);
          ctx.stroke();
          if (sh.life > sh.max) shooters.splice(j, 1);
        }
        if (t - last > 4200 && Math.random() < 0.4) {
          spawnShooter();
          last = t;
        }
        raf = requestAnimationFrame(frame);
      }
      let raf: number;
      resize();
      const onResize = debounce(resize, 200);
      window.addEventListener('resize', onResize);
      raf = requestAnimationFrame(frame);
      return {
        resize,
        stop() {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', onResize);
        },
      };
    }

    const skyFields: Array<{ stop: () => void }> = [];
    const sky = document.getElementById('sky') as HTMLCanvasElement | null;
    if (sky) skyFields.push(Starfield(sky, { density: 0.0002 }));
    const sky2 = document.getElementById('sky2') as HTMLCanvasElement | null;
    if (sky2) skyFields.push(Starfield(sky2, { density: 0.00012 }));

    /* ============================================================
       HEADER + MOBILE MENU
       ============================================================ */
    const hdr = document.getElementById('hdr')!;
    function onScroll() {
      if (window.scrollY > 40) hdr.classList.add('scrolled');
      else hdr.classList.remove('scrolled');
      const y = window.scrollY;
      const px = document.querySelectorAll('[data-parallax]');
      for (let i = 0; i < px.length; i++) {
        const f = parseFloat(px[i].getAttribute('data-parallax') || '0');
        (px[i] as HTMLElement).style.transform = 'translateY(' + y * f + 'px)';
      }
      if (waEl) {
        if (y > 600) waEl.classList.add('show');
        else waEl.classList.remove('show');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerHandler = function () {
      document.body.classList.toggle('menu-open');
    };
    const mobileLinkHandler = function () {
      document.body.classList.remove('menu-open');
    };
    if (burger) {
      burger.addEventListener('click', burgerHandler);
      mobileMenu!.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', mobileLinkHandler);
      });
    }

    /* ============================================================
       REVEAL + COUNTERS (scan-based)
       ============================================================ */
    function inView(el: Element, pad?: number) {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight - (pad || 0) && r.bottom > -60;
    }
    function animateCounter(el: HTMLElement) {
      const to = parseFloat(el.getAttribute('data-to') || '0');
      const dur = 1500,
        t0 = performance.now();
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1),
          eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * to).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = to.toLocaleString('pt-BR');
      }
      requestAnimationFrame(step);
    }
    function scanReveal() {
      const pad = window.innerHeight * 0.06;
      const instant = document.visibilityState !== 'visible';
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) {
        if (inView(el, pad)) {
          if (instant) (el as HTMLElement).style.transition = 'none';
          el.classList.add('in');
        }
      });
      document.querySelectorAll('.num:not([data-done])').forEach(function (el) {
        if (inView(el, pad)) {
          el.setAttribute('data-done', '1');
          if (instant)
            el.textContent = parseFloat(el.getAttribute('data-to') || '0').toLocaleString('pt-BR');
          else animateCounter(el as HTMLElement);
        }
      });
      let shown = 0;
      document.querySelectorAll('.tile:not(.tin)').forEach(function (el) {
        if (inView(el, pad)) {
          const d = (shown % 6) * 70;
          shown++;
          (el as HTMLElement).style.transition = instant
            ? 'none'
            : 'opacity .8s var(--ease) ' + d + 'ms, transform .9s var(--ease) ' + d + 'ms';
          el.classList.add('tin');
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'none';
        }
      });
    }
    let scanQueued = false;
    function scanThrottled() {
      if (scanQueued) return;
      scanQueued = true;
      requestAnimationFrame(function () {
        scanQueued = false;
        scanReveal();
      });
    }
    window.addEventListener('scroll', scanThrottled, { passive: true });
    window.addEventListener('resize', scanReveal);
    window.addEventListener('load', scanReveal);
    const onVisibility = function () {
      if (!document.hidden) scanReveal();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const scanTimers = [120, 500, 1200].map((ms) => setTimeout(scanReveal, ms));
    scanReveal();

    /* ============================================================
       PLANTAS TABS
       ============================================================ */
    document.querySelectorAll('.plan-tabs button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.plan-tabs button').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        const id = btn.getAttribute('data-tab')!;
        document.querySelectorAll('.plan-panel').forEach(function (p) {
          p.classList.remove('active');
        });
        document.getElementById(id)!.classList.add('active');
      });
    });

    /* ============================================================
       LAZER GALLERY
       ============================================================ */
    const grid = document.getElementById('lazerGrid');
    if (grid) {
      grid.style.gridAutoFlow = 'dense';
      if (!prefersReduced) {
        grid.querySelectorAll('.tile').forEach(function (el) {
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.transform = 'translateY(24px)';
        });
      }
      if (typeof scanReveal === 'function') scanReveal();

      document.querySelectorAll('#lazerFilters button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('#lazerFilters button').forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');
          const f = btn.getAttribute('data-f');
          grid.querySelectorAll('.tile').forEach(function (tile) {
            const show = f === 'all' || tile.getAttribute('data-cat') === f;
            tile.classList.toggle('hide', !show);
          });
        });
      });

      const tileEls = ([] as Element[]).slice.call(grid.querySelectorAll('.tile'));
      tileEls.forEach(function (tile, i) {
        tile.addEventListener('click', function () {
          openLbFromEls(tileEls, i);
        });
      });
    }

    /* ============================================================
       LIGHTBOX (DOM-driven)
       ============================================================ */
    let lbEls: Element[] = [],
      lbIndex = 0;
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML =
      '<button class="lb-close" aria-label="Fechar">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Anterior">&#8249;</button>' +
      '<button class="lb-nav lb-next" aria-label="Próximo">&#8250;</button>' +
      '<div class="lb-stage"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /><div class="lb-meta"><div class="c"></div><div class="n"></div></div></div>';
    document.body.appendChild(lb);
    function elData(el: Element) {
      const im = el.querySelector('img');
      return {
        src: im ? im.src : '',
        n: el.getAttribute('data-n') || '',
        cl: el.getAttribute('data-c') || '',
      };
    }
    function openLbFromEls(els: Element[], i: number) {
      lbEls = els;
      lbIndex = i;
      renderLb();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    function renderLb() {
      const d = elData(lbEls[lbIndex]);
      (lb.querySelector('img') as HTMLImageElement).src = d.src;
      lb.querySelector('.lb-meta .c')!.textContent = d.cl;
      lb.querySelector('.lb-meta .n')!.textContent = d.n;
    }
    function navLb(d: number) {
      lbIndex = (lbIndex + d + lbEls.length) % lbEls.length;
      renderLb();
    }
    lb.querySelector('.lb-close')!.addEventListener('click', closeLb);
    lb.querySelector('.lb-prev')!.addEventListener('click', function () {
      navLb(-1);
    });
    lb.querySelector('.lb-next')!.addEventListener('click', function () {
      navLb(1);
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLb();
    });
    const onKeydown = function (e: KeyboardEvent) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') navLb(-1);
      else if (e.key === 'ArrowRight') navLb(1);
    };
    document.addEventListener('keydown', onKeydown);

    /* ============================================================
       PLAN ZOOM + INTERIORS CAROUSEL
       ============================================================ */
    const planFigs = ([] as Element[]).slice.call(
      document.querySelectorAll('.plan-img[data-plan]'),
    );
    planFigs.forEach(function (fig, i) {
      fig.addEventListener('click', function () {
        openLbFromEls(planFigs, i);
      });
    });

    const carTrack = document.getElementById('carTrack');
    let carUpdate: (() => void) | null = null;
    let carTimer: any;
    if (carTrack) {
      const slideEls = ([] as Element[]).slice.call(carTrack.querySelectorAll('.car-slide'));
      slideEls.forEach(function (s, i) {
        s.addEventListener('click', function () {
          openLbFromEls(slideEls, i);
        });
      });
      const carPrev = document.getElementById('carPrev') as HTMLButtonElement | null,
        carNext = document.getElementById('carNext') as HTMLButtonElement | null;
      function carStep() {
        const first = carTrack!.querySelector('.car-slide');
        return first ? first.getBoundingClientRect().width + 16 : 360;
      }
      carUpdate = function () {
        if (carPrev) carPrev.disabled = carTrack!.scrollLeft < 8;
        if (carNext)
          carNext.disabled =
            carTrack!.scrollLeft > carTrack!.scrollWidth - carTrack!.clientWidth - 8;
      };
      if (carPrev)
        carPrev.addEventListener('click', function () {
          carTrack!.scrollBy({ left: -carStep(), behavior: 'smooth' });
        });
      if (carNext)
        carNext.addEventListener('click', function () {
          carTrack!.scrollBy({ left: carStep(), behavior: 'smooth' });
        });
      carTrack.addEventListener(
        'scroll',
        function () {
          requestAnimationFrame(carUpdate!);
        },
        { passive: true },
      );
      carTimer = setTimeout(carUpdate, 250);
    }

    /* ============================================================
       FAQ
       ============================================================ */
    document.querySelectorAll('.faq-item').forEach(function (item) {
      const q = item.querySelector('.faq-q')!;
      const a = item.querySelector('.faq-a') as HTMLElement;
      q.addEventListener('click', function () {
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (it) {
          it.classList.remove('open');
          (it.querySelector('.faq-a') as HTMLElement).style.maxHeight = '';
        });
        if (!open) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });

    /* ============================================================
       LEAD FORM
       ============================================================ */
    const form = document.getElementById('leadForm') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        const data = {
          nome: (form as any).nome.value,
          telefone: (form as any).telefone.value,
          email: (form as any).email.value,
          tipologia: (form as any).tipologia.value,
        };
        sendLead({
          name: data.nome,
          phone: data.telefone,
          email: data.email,
          source: 'landing_authoria',
          interest: 'Authoria by Tebas',
          message: data.tipologia,
        });
        const msg =
          'Olá! Quero agendar uma visita ao Authoria by Tebas.%0A' +
          '%0ANome: ' +
          encodeURIComponent(data.nome) +
          '%0ATelefone: ' +
          encodeURIComponent(data.telefone) +
          (data.email ? '%0AE-mail: ' + encodeURIComponent(data.email) : '') +
          (data.tipologia ? '%0AInteresse: ' + encodeURIComponent(data.tipologia) : '');
        const sendUrl = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + msg;
        document.getElementById('formOk')!.classList.add('show');
        form.style.display = 'none';
        setTimeout(function () {
          window.open(sendUrl, '_blank');
        }, 600);
      });
    }

    /* ============================================================
       SMOOTH ANCHORS (with header offset)
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const id = a.getAttribute('href')!;
        if (id === '#' || id === '#top') {
          return;
        }
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });

    /* ============================================================
       TWEAKS (host edit-mode protocol)
       ============================================================ */
    const TWEAK_DEFAULTS: any = {
      accent: '#c2a35f',
      headingFont: 'Cormorant Garamond',
      animIntensity: 1,
      ctaText: 'Agende sua visita',
    };
    const tweaks: any = Object.assign({}, TWEAK_DEFAULTS);

    function applyTweaks() {
      const root = document.documentElement;
      root.style.setProperty('--accent', tweaks.accent);
      const ink = tweaks.accent.toLowerCase() === '#d4866a' ? '#2a1810' : '#1a1407';
      root.style.setProperty('--accent-ink', ink);
      root.style.setProperty('--serif', "'" + tweaks.headingFont + "', 'Times New Roman', serif");
      root.style.setProperty('--anim', tweaks.animIntensity);
      document.querySelectorAll('[data-cta]').forEach(function (el) {
        if (el.children.length === 0) el.textContent = tweaks.ctaText;
      });
    }
    applyTweaks();

    function setTweak(key: string, val: any) {
      tweaks[key] = val;
      applyTweaks();
      try {
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
      } catch (e) {}
    }

    const panel = document.createElement('div');
    panel.id = 'tweaksPanel';
    panel.style.cssText =
      'position:fixed;top:80px;right:20px;z-index:200;width:288px;background:rgba(10,17,32,.96);backdrop-filter:blur(14px);border:1px solid rgba(244,238,227,.16);border-radius:10px;padding:18px 18px 20px;color:#f4eee3;font-family:var(--sans);box-shadow:0 30px 80px -20px rgba(0,0,0,.7);display:none';

    function twSection(label: string) {
      return (
        '<div style="font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#79808f;margin-bottom:9px">' +
        label +
        '</div>'
      );
    }
    function twSwatch(color: string, label: string) {
      return (
        '<button class="tw-sw" data-v="' +
        color +
        '" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px 4px;border-radius:7px;border:1px solid rgba(244,238,227,.12);background:transparent">' +
        '<span style="width:26px;height:26px;border-radius:50%;background:' +
        color +
        '"></span>' +
        '<span style="font-size:11px;color:#b9c1d2">' +
        label +
        '</span></button>'
      );
    }
    function twSeg(v: string, label: string) {
      return (
        '<button class="tw-font" data-v="' +
        v +
        "\" style=\"flex:1;height:38px;border-radius:6px;border:1px solid rgba(244,238,227,.12);background:transparent;color:#b9c1d2;font-size:12.5px;font-family:'" +
        v +
        '\',serif">' +
        label +
        '</button>'
      );
    }
    function twSeg2(v: string, label: string) {
      return (
        '<button class="tw-anim" data-v="' +
        v +
        '" style="flex:1;height:36px;border-radius:6px;border:1px solid rgba(244,238,227,.12);background:transparent;color:#b9c1d2;font-size:12px">' +
        label +
        '</button>'
      );
    }

    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
      '<span style="font-family:var(--serif);font-size:19px;letter-spacing:.04em">Tweaks</span>' +
      '<button id="twClose" style="color:#b9c1d2;font-size:20px;line-height:1;width:26px;height:26px;border-radius:50%;border:1px solid rgba(244,238,227,.16)">&times;</button></div>' +
      twSection('Cor de destaque') +
      '<div id="twAccent" style="display:flex;gap:10px;margin-bottom:18px">' +
      twSwatch('#c2a35f', 'Ouro') +
      twSwatch('#d4866a', 'Coral') +
      '</div>' +
      twSection('Fonte dos títulos') +
      '<div id="twFont" style="display:flex;gap:6px;margin-bottom:18px">' +
      twSeg('Cormorant Garamond', 'Cormorant') +
      twSeg('Marcellus', 'Marcellus') +
      '</div>' +
      twSection('Intensidade das animações') +
      '<div id="twAnim" style="display:flex;gap:6px;margin-bottom:18px">' +
      twSeg2('0.6', 'Sutil') +
      twSeg2('1', 'Padrão') +
      twSeg2('1.4', 'Amplo') +
      '</div>' +
      twSection('Texto do botão (CTA)') +
      '<input id="twCta" type="text" value="' +
      TWEAK_DEFAULTS.ctaText +
      '" style="width:100%;height:42px;background:rgba(6,9,15,.5);border:1px solid rgba(244,238,227,.16);border-radius:6px;padding:0 12px;color:#f4eee3;font-family:var(--sans);font-size:14px" />';
    const tweaksRoot = document.getElementById('tweaks-root');
    if (tweaksRoot) tweaksRoot.appendChild(panel);

    function markActive(sel: string, _attr: string, val: any) {
      panel.querySelectorAll(sel).forEach(function (b) {
        const el = b as HTMLElement;
        const on = el.getAttribute('data-v') === String(val);
        el.style.borderColor = on ? tweaks.accent : 'rgba(244,238,227,.12)';
        el.style.color =
          on && el.classList.contains('tw-font')
            ? '#f4eee3'
            : on && el.classList.contains('tw-anim')
              ? '#f4eee3'
              : el.style.color;
        if (on && (el.classList.contains('tw-anim') || el.classList.contains('tw-font')))
          el.style.background = 'rgba(244,238,227,.06)';
        else if (el.classList.contains('tw-anim') || el.classList.contains('tw-font'))
          el.style.background = 'transparent';
      });
    }
    function refreshActives() {
      markActive('.tw-sw', 'accent', tweaks.accent);
      markActive('.tw-font', 'headingFont', tweaks.headingFont);
      markActive('.tw-anim', 'animIntensity', tweaks.animIntensity);
    }

    panel.querySelectorAll('.tw-sw').forEach(function (b) {
      b.addEventListener('click', function () {
        setTweak('accent', b.getAttribute('data-v'));
        refreshActives();
      });
    });
    panel.querySelectorAll('.tw-font').forEach(function (b) {
      b.addEventListener('click', function () {
        setTweak('headingFont', b.getAttribute('data-v'));
        refreshActives();
      });
    });
    panel.querySelectorAll('.tw-anim').forEach(function (b) {
      b.addEventListener('click', function () {
        setTweak('animIntensity', parseFloat(b.getAttribute('data-v') || '0'));
        refreshActives();
      });
    });
    (panel.querySelector('#twCta') as HTMLInputElement).addEventListener('input', function (e) {
      setTweak('ctaText', (e.target as HTMLInputElement).value);
    });
    panel.querySelector('#twClose')!.addEventListener('click', function () {
      panel.style.display = 'none';
      try {
        window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
      } catch (e) {}
    });
    refreshActives();

    const onMessage = function (e: MessageEvent) {
      const t = e && e.data && e.data.type;
      if (t === '__activate_edit_mode') {
        panel.style.display = 'block';
        refreshActives();
      } else if (t === '__deactivate_edit_mode') {
        panel.style.display = 'none';
      }
    };
    window.addEventListener('message', onMessage);
    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch (e) {}

    /* ============================================================
       CLEANUP
       ============================================================ */
    return () => {
      skyFields.forEach((s) => s.stop());
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', scanThrottled);
      window.removeEventListener('resize', scanReveal);
      window.removeEventListener('load', scanReveal);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('message', onMessage);
      scanTimers.forEach((t) => clearTimeout(t));
      if (carTimer) clearTimeout(carTimer);
      lb.remove();
      panel.remove();
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    };
  }, []);

  return (
    <>
      {/* ====================== HEADER ====================== */}
      <header className="hdr" id="hdr">
        <a className="hdr-logo" href="#top" aria-label="Authoria by Tebas">
          <img src="/authoria/a003.png" alt="Authoria by Tebas" className="hdr-logo-img" />
        </a>
        <nav className="hdr-nav" aria-label="Navegação principal">
          <a href="#conceito">Conceito</a>
          <a href="#plantas">Plantas</a>
          <a href="#lazer">Lazer</a>
          <a href="#localizacao">Localização</a>
          <a href="#ficha">Ficha técnica</a>
        </nav>
        <div className="hdr-cta">
          <a href="#contato" className="btn btn-solid" data-cta="">
            Agende sua visita
          </a>
          <button className="hdr-burger" id="burger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <nav className="mobile-menu" id="mobileMenu" aria-label="Menu mobile">
        <a href="#conceito">Conceito</a>
        <a href="#plantas">Plantas</a>
        <a href="#lazer">Lazer</a>
        <a href="#localizacao">Localização</a>
        <a href="#ficha">Ficha técnica</a>
        <a href="#contato" className="script" style={{ color: 'var(--accent)', fontSize: '38px' }}>
          Agende sua visita
        </a>
      </nav>

      {/* ====================== HERO ====================== */}
      <main id="top">
        <section className="hero" id="hero">
          <div className="hero-sky">
            <canvas id="sky"></canvas>
          </div>
          <div className="hero-glow"></div>
          <div className="hero-facade" data-parallax="0.12"></div>
          <div className="hero-vign"></div>

          <div className="hero-inner wrap">
            <span className="hero-badge" data-reveal="">
              <span className="dot"></span> Lançamento · Jundiaí — SP
            </span>
            <div className="hero-logo-wrap" data-reveal="" style={{ '--rd': '.08s' } as React.CSSProperties}>
              <img src="/authoria/a003.png" alt="Authoria by Tebas" className="hero-logo-img" />
            </div>
            <p className="hero-tagline lede" data-reveal="" style={{ '--rd': '.16s' } as React.CSSProperties}>
              Quando você muda, o mundo muda também. Um encontro raro entre exclusividade, natureza e
              arquitetura.
            </p>
            <div className="hero-specs" data-reveal="" style={{ '--rd': '.22s' } as React.CSSProperties}>
              <div className="sp">
                <b>3 e 4</b>
                <span>Suítes</span>
              </div>
              <div className="sp">
                <b>137—211</b>
                <span>m² privativos</span>
              </div>
              <div className="sp">
                <b>4</b>
                <span>Torres exclusivas</span>
              </div>
            </div>
            <div className="hero-actions" data-reveal="" style={{ '--rd': '.28s' } as React.CSSProperties}>
              <a href="#contato" className="btn btn-solid" data-cta="">
                Agende sua visita
              </a>
              <a href="#lazer" className="btn btn-ghost">
                Conheça o lazer
              </a>
            </div>
          </div>

          <div className="hero-scroll">
            <span>Role</span>
            <span className="ln"></span>
          </div>
        </section>

        {/* ====================== STAT STRIPE ====================== */}
        <section className="on-dark stripe">
          <div className="stripe-grid">
            <div className="st" data-reveal="">
              <b>
                <span className="num" data-to="7571">
                  0
                </span>
                <span className="dec">,50</span>
              </b>
              <span>m² de terreno</span>
            </div>
            <div className="st" data-reveal="" style={{ '--rd': '.08s' } as React.CSSProperties}>
              <b>
                <span className="num" data-to="102">
                  0
                </span>
              </b>
              <span>Apartamentos</span>
            </div>
            <div className="st" data-reveal="" style={{ '--rd': '.16s' } as React.CSSProperties}>
              <b>
                <span className="num" data-to="37">
                  0
                </span>
                <span className="u">+</span>
              </b>
              <span>Itens de lazer</span>
            </div>
            <div className="st" data-reveal="" style={{ '--rd': '.24s' } as React.CSSProperties}>
              <b>
                Ago<span className="u">/26</span>
              </b>
              <span>Previsão de entrega</span>
            </div>
          </div>
        </section>

        {/* ====================== CONCEITO / MANIFESTO ====================== */}
        <section className="sec on-cream" id="conceito">
          <div className="wrap">
            <div className="man-grid">
              <div>
                <span className="eyebrow" data-reveal="">
                  O conceito
                </span>
                <h2
                  className="man-quote"
                  data-reveal=""
                  style={{ '--rd': '.06s', marginTop: '26px' } as React.CSSProperties}
                >
                  Alto padrão <em>elevado</em> ao estado da arte.
                </h2>
                <div className="man-body" data-reveal="" style={{ '--rd': '.14s' } as React.CSSProperties}>
                  <p className="lede">
                    Authoria nasce de um propósito: ser o autor da própria história. Aqui, arquitetura,
                    paisagismo e bem-estar se encontram para criar um endereço onde cada detalhe foi
                    pensado para a plenitude de viver.
                  </p>
                  <p className="lede">
                    Em um terreno de 7.571,50 m², quatro torres se distribuem entre praças, jardins e
                    espelhos d&apos;água assinados por Benedito Abbud, com arquitetura HOCH e fachada
                    Chiro Arquitetura.
                  </p>
                  <div className="hero-actions" style={{ marginTop: '30px' }}>
                    <a href="#plantas" className="btn btn-ghost on-light">
                      Ver plantas
                    </a>
                  </div>
                </div>
              </div>
              <div className="man-figure" data-reveal="" style={{ '--rd': '.1s' } as React.CSSProperties}>
                <img
                  src="/authoria/a002.jpg"
                  alt="Perspectiva ilustrada da fachada do Authoria by Tebas"
                  loading="lazy"
                />
                <span className="cap">Perspectiva ilustrada da fachada</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== ASSINATURAS ====================== */}
        <section className="sec on-cream" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <span className="eyebrow" data-reveal="">
              Assinaturas que elevam o projeto
            </span>
            <div
              className="signs"
              data-reveal=""
              style={{ '--rd': '.08s', marginTop: '30px' } as React.CSSProperties}
            >
              <div className="sg">
                <span>Incorporação &amp; Construção</span>
                <b>Tebas</b>
              </div>
              <div className="sg">
                <span>Arquitetura</span>
                <b>HOCH Arquitetura</b>
              </div>
              <div className="sg">
                <span>Paisagismo</span>
                <b>Benedito Abbud</b>
              </div>
              <div className="sg">
                <span>Decoração</span>
                <b>Quitete e Faria</b>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== PLANTAS ====================== */}
        <section className="sec on-dark" id="plantas">
          <div className="wrap">
            <div className="plan-head">
              <div>
                <span className="eyebrow" data-reveal="">
                  As plantas
                </span>
                <h2
                  className="h-section"
                  data-reveal=""
                  style={{ '--rd': '.06s', marginTop: '22px' } as React.CSSProperties}
                >
                  Espaço para viver
                  <br />
                  em amplitude.
                </h2>
              </div>
              <div
                className="plan-tabs"
                data-reveal=""
                style={{ '--rd': '.12s' } as React.CSSProperties}
                role="tablist"
              >
                <button className="active" data-tab="p137" role="tab">
                  137,39 m² · 3 suítes
                </button>
                <button data-tab="p211" role="tab">
                  211,91 m² · 4 suítes
                </button>
              </div>
            </div>

            {/* 137 */}
            <div className="plan-panel active" id="p137">
              <div className="plan-bar" data-reveal="">
                <div className="plan-bar-id">
                  <span className="tag">Torres A e D · Final 1</span>
                  <h3>
                    137,39 <i>m² · 3 suítes</i>
                  </h3>
                </div>
                <div className="plan-chips">
                  <div className="chip">
                    <b>3</b>
                    <span>Suítes</span>
                  </div>
                  <div className="chip">
                    <b>2</b>
                    <span>Vagas</span>
                  </div>
                  <div className="chip">
                    <b>4</b>
                    <span>Aptos / andar</span>
                  </div>
                  <div className="chip">
                    <b>Opc.</b>
                    <span>Living ampliado</span>
                  </div>
                </div>
              </div>
              <figure
                className="plan-img"
                data-reveal=""
                style={{ '--rd': '.06s' } as React.CSSProperties}
                data-plan="0"
                data-n="137,39 m² · 3 suítes"
                data-c="Planta humanizada"
              >
                <img
                  src="/authoria/a023.png"
                  alt="Planta do apartamento de 137,39 m² com 3 suítes"
                  loading="lazy"
                />
                <span className="plan-zoom" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="7" cy="7" r="5"></circle>
                    <path d="M10.8 10.8l4 4M7 5v4M5 7h4"></path>
                  </svg>
                </span>
              </figure>
            </div>

            {/* 211 */}
            <div className="plan-panel" id="p211">
              <div className="plan-bar" data-reveal="">
                <div className="plan-bar-id">
                  <span className="tag">Torres B e C · 2 aptos. por andar</span>
                  <h3>
                    211,91 <i>m² · 4 suítes</i>
                  </h3>
                </div>
                <div className="plan-chips">
                  <div className="chip">
                    <b>4</b>
                    <span>Suítes</span>
                  </div>
                  <div className="chip">
                    <b>3</b>
                    <span>Vagas · 1 box</span>
                  </div>
                  <div className="chip">
                    <b>2</b>
                    <span>Aptos / andar</span>
                  </div>
                  <div className="chip">
                    <b>Opc.</b>
                    <span>3 suítes ampl.</span>
                  </div>
                </div>
              </div>
              <figure
                className="plan-img"
                data-reveal=""
                style={{ '--rd': '.06s' } as React.CSSProperties}
                data-plan="1"
                data-n="211,91 m² · 4 suítes"
                data-c="Planta humanizada"
              >
                <img
                  src="/authoria/a025.png"
                  alt="Planta do apartamento de 211,91 m² com 4 suítes"
                  loading="lazy"
                />
                <span className="plan-zoom" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="7" cy="7" r="5"></circle>
                    <path d="M10.8 10.8l4 4M7 5v4M5 7h4"></path>
                  </svg>
                </span>
              </figure>
            </div>

            {/* Interiores carousel ("roleta") */}
            <div className="interiors" data-reveal="">
              <div className="interiors-head">
                <div>
                  <span className="eyebrow">Interiores &amp; ambientes decorados</span>
                  <h3>Detalhes que você vai querer ver de perto.</h3>
                </div>
                <div className="car-nav">
                  <button className="car-btn" id="carPrev" aria-label="Imagem anterior">
                    ‹
                  </button>
                  <button className="car-btn" id="carNext" aria-label="Próxima imagem">
                    ›
                  </button>
                </div>
              </div>
              <div className="car-track" id="carTrack">
                <figure className="car-slide" data-n="Living integrado · 4 suítes" data-c="Decorado">
                  <img
                    src="/authoria/a001.jpg"
                    alt="Perspectiva ilustrada — Living integrado · 4 suítes"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Decorado</span>
                    <span className="n">Living integrado · 4 suítes</span>
                  </figcaption>
                </figure>
                <figure className="car-slide" data-n="Living &amp; jantar · 3 suítes" data-c="Decorado">
                  <img
                    src="/authoria/a011.jpg"
                    alt="Perspectiva ilustrada — Living &amp; jantar · 3 suítes"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Decorado</span>
                    <span className="n">Living &amp; jantar · 3 suítes</span>
                  </figcaption>
                </figure>
                <figure className="car-slide" data-n="Varanda gourmet" data-c="Ambiente">
                  <img
                    src="/authoria/a000.jpg"
                    alt="Perspectiva ilustrada — Varanda gourmet"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Ambiente</span>
                    <span className="n">Varanda gourmet</span>
                  </figcaption>
                </figure>
                <figure className="car-slide" data-n="Hall de entrada" data-c="Ambiente">
                  <img
                    src="/authoria/a024.jpg"
                    alt="Perspectiva ilustrada — Hall de entrada"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Ambiente</span>
                    <span className="n">Hall de entrada</span>
                  </figcaption>
                </figure>
                <figure className="car-slide" data-n="Lounge social" data-c="Ambiente">
                  <img
                    src="/authoria/a014.jpg"
                    alt="Perspectiva ilustrada — Lounge social"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Ambiente</span>
                    <span className="n">Lounge social</span>
                  </figcaption>
                </figure>
                <figure className="car-slide" data-n="Vaga box privativa" data-c="Detalhe">
                  <img
                    src="/authoria/a027.jpg"
                    alt="Perspectiva ilustrada — Vaga box privativa"
                    loading="lazy"
                  />
                  <span className="plus">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M6.5 1v11M1 6.5h11"></path>
                    </svg>
                  </span>
                  <figcaption className="car-cap">
                    <span className="c">Detalhe</span>
                    <span className="n">Vaga box privativa</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== LAZER ====================== */}
        <section className="sec on-space" id="lazer">
          <div className="wrap">
            <div className="lazer-head">
              <div>
                <span className="eyebrow" data-reveal="">
                  O clube dentro de casa
                </span>
                <h2
                  className="h-section"
                  data-reveal=""
                  style={{ '--rd': '.06s', marginTop: '22px' } as React.CSSProperties}
                >
                  Experiência elevada
                  <br />
                  ao estado de plenitude.
                </h2>
              </div>
              <div
                className="lazer-filters"
                data-reveal=""
                style={{ '--rd': '.12s' } as React.CSSProperties}
                id="lazerFilters"
              >
                <button className="active" data-f="all">
                  Tudo
                </button>
                <button data-f="agua">Águas</button>
                <button data-f="bem">Bem-estar</button>
                <button data-f="esporte">Esporte</button>
                <button data-f="social">Social</button>
                <button data-f="kids">Família</button>
                <button data-f="trab">Trabalho</button>
              </div>
            </div>

            <div className="lazer-grid" id="lazerGrid">
              <figure className="tile s-6 r-2" data-cat="agua" data-n="Piscinas adulto &amp; infantil" data-c="Águas">
                <img src="/authoria/a005.jpg" alt="Perspectiva ilustrada — Piscinas adulto &amp; infantil" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Águas</span>
                  <span className="n">Piscinas adulto &amp; infantil</span>
                </figcaption>
              </figure>
              <figure className="tile s-3 r-2" data-cat="agua" data-n="Piscina coberta" data-c="Águas">
                <img src="/authoria/a020.jpg" alt="Perspectiva ilustrada — Piscina coberta" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Águas</span>
                  <span className="n">Piscina coberta</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="social" data-n="Gourmet" data-c="Social">
                <img src="/authoria/a000.jpg" alt="Perspectiva ilustrada — Gourmet" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Social</span>
                  <span className="n">Gourmet</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="esporte" data-n="Beach tennis" data-c="Esporte">
                <img src="/authoria/a021.jpg" alt="Perspectiva ilustrada — Beach tennis" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Esporte</span>
                  <span className="n">Beach tennis</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="esporte" data-n="Fitness" data-c="Esporte">
                <img src="/authoria/a015.jpg" alt="Perspectiva ilustrada — Fitness" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Esporte</span>
                  <span className="n">Fitness</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="bem" data-n="Yoga &amp; pilates" data-c="Bem-estar">
                <img src="/authoria/a017.jpg" alt="Perspectiva ilustrada — Yoga &amp; pilates" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Bem-estar</span>
                  <span className="n">Yoga &amp; pilates</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="agua" data-n="SPA &amp; relaxamento" data-c="Águas">
                <img src="/authoria/a018.jpg" alt="Perspectiva ilustrada — SPA &amp; relaxamento" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Águas</span>
                  <span className="n">SPA &amp; relaxamento</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="bem" data-n="Sauna" data-c="Bem-estar">
                <img src="/authoria/a010.jpg" alt="Perspectiva ilustrada — Sauna" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Bem-estar</span>
                  <span className="n">Sauna</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="bem" data-n="Beauty" data-c="Bem-estar">
                <img src="/authoria/a022.jpg" alt="Perspectiva ilustrada — Beauty" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Bem-estar</span>
                  <span className="n">Beauty</span>
                </figcaption>
              </figure>
              <figure className="tile s-6 r-2" data-cat="social" data-n="Salão de festas" data-c="Social">
                <img src="/authoria/a012.jpg" alt="Perspectiva ilustrada — Salão de festas" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Social</span>
                  <span className="n">Salão de festas</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="bem" data-n="Espaço massagem" data-c="Bem-estar">
                <img src="/authoria/a008.jpg" alt="Perspectiva ilustrada — Espaço massagem" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Bem-estar</span>
                  <span className="n">Espaço massagem</span>
                </figcaption>
              </figure>
              <figure className="tile s-3" data-cat="social" data-n="Praça zen" data-c="Social">
                <img src="/authoria/a026.jpg" alt="Perspectiva ilustrada — Praça zen" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Social</span>
                  <span className="n">Praça zen</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="kids" data-n="Brinquedoteca" data-c="Família">
                <img src="/authoria/a016.jpg" alt="Perspectiva ilustrada — Brinquedoteca" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Família</span>
                  <span className="n">Brinquedoteca</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="kids" data-n="Playground" data-c="Família">
                <img src="/authoria/a019.jpg" alt="Perspectiva ilustrada — Playground" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Família</span>
                  <span className="n">Playground</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="kids" data-n="Lazer juvenil" data-c="Família">
                <img src="/authoria/a006.jpg" alt="Perspectiva ilustrada — Lazer juvenil" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Família</span>
                  <span className="n">Lazer juvenil</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="trab" data-n="Coworking" data-c="Trabalho">
                <img src="/authoria/a004.jpg" alt="Perspectiva ilustrada — Coworking" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Trabalho</span>
                  <span className="n">Coworking</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="social" data-n="Praça central" data-c="Social">
                <img src="/authoria/a013.jpg" alt="Perspectiva ilustrada — Praça central" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Social</span>
                  <span className="n">Praça central</span>
                </figcaption>
              </figure>
              <figure className="tile s-4" data-cat="trab" data-n="Mini market" data-c="Trabalho">
                <img src="/authoria/a007.jpg" alt="Perspectiva ilustrada — Mini market" loading="lazy" />
                <span className="plus">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M6.5 1v11M1 6.5h11"></path>
                  </svg>
                </span>
                <figcaption className="tile-cap">
                  <span className="c">Trabalho</span>
                  <span className="n">Mini market</span>
                </figcaption>
              </figure>
            </div>
            <p className="lazer-note" data-reveal="">
              Perspectivas ilustradas. As áreas comuns serão entregues equipadas e decoradas conforme
              Memorial Descritivo.
            </p>
          </div>
        </section>

        {/* ====================== LOCALIZACAO ====================== */}
        <section className="sec on-dark" id="localizacao">
          <div className="wrap">
            <div className="loc-grid">
              <div data-reveal="">
                <span className="eyebrow">Onde tudo acontece</span>
                <h2 className="h-section" style={{ marginTop: '22px' }}>
                  Jardim Santa Teresa,
                  <br />
                  Jundiaí.
                </h2>
                <p
                  className="lede"
                  style={{ color: 'var(--t-dim)', marginTop: '24px', maxWidth: '480px' }}
                >
                  Entre a serenidade da natureza e a conveniência da cidade, em um dos endereços mais
                  valorizados de Jundiaí, com área de preservação em frente ao empreendimento.
                </p>
                <ul className="loc-pins">
                  <li>
                    <span className="d">01</span>
                    <span className="p">Acesso rápido à Rodovia Anhanguera e Av. Jundiaí</span>
                  </li>
                  <li>
                    <span className="d">02</span>
                    <span className="p">Próximo ao Parque da Uva e ao Bolão</span>
                  </li>
                  <li>
                    <span className="d">03</span>
                    <span className="p">Área de preservação em frente ao terreno</span>
                  </li>
                </ul>
                <div className="loc-addr">
                  <span className="lab">Endereço do empreendimento</span>
                  <div className="val">Rua Ernesto Rappa — Jardim Santa Teresa, Jundiaí/SP</div>
                </div>
              </div>
              <div className="loc-figure" data-reveal="" style={{ '--rd': '.1s' } as React.CSSProperties}>
                <img
                  src="/authoria/a009.jpg"
                  alt="Foto aérea da região de Jundiaí onde está o Authoria by Tebas"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginTop: 'clamp(60px,8vw,110px)' }}>
              <span
                className="eyebrow center"
                data-reveal=""
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                Linha do tempo da obra
              </span>
              <div className="tl" data-reveal="" style={{ '--rd': '.08s' } as React.CSSProperties}>
                <div className="node done">
                  <div className="dt">Jul/23</div>
                  <div className="lb2">Início das obras</div>
                </div>
                <div className="node done">
                  <div className="dt">2024</div>
                  <div className="lb2">Estrutura das torres</div>
                </div>
                <div className="node done">
                  <div className="dt">2025</div>
                  <div className="lb2">Acabamentos &amp; lazer</div>
                </div>
                <div className="node now">
                  <div className="dt">Ago/26</div>
                  <div className="lb2">Previsão de entrega</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== FICHA TÉCNICA ====================== */}
        <section className="sec on-cream" id="ficha">
          <div className="wrap">
            <span className="eyebrow" data-reveal="">
              Ficha técnica
            </span>
            <h2
              className="h-section"
              data-reveal=""
              style={{ '--rd': '.06s', margin: '22px 0 44px', color: 'var(--t-dark)' } as React.CSSProperties}
            >
              Cada número, um cuidado.
            </h2>
            <div className="ficha-grid" data-reveal="" style={{ '--rd': '.1s' } as React.CSSProperties}>
              <div className="fc">
                <div className="k">Terreno</div>
                <div className="v">7.571,50 m²</div>
              </div>
              <div className="fc">
                <div className="k">Torres</div>
                <div className="v">4 torres</div>
              </div>
              <div className="fc">
                <div className="k">Pavimentos</div>
                <div className="v">1 subsolo + térreo + 8 andares</div>
              </div>
              <div className="fc">
                <div className="k">Apartamentos</div>
                <div className="v">102 unidades</div>
              </div>
              <div className="fc">
                <div className="k">Elevadores</div>
                <div className="v">3 por torre</div>
              </div>
              <div className="fc">
                <div className="k">Tipologias</div>
                <div className="v">
                  3 suítes · 137,39 m²
                  <br />4 suítes · 211,91 m²
                </div>
              </div>
              <div className="fc">
                <div className="k">Vagas</div>
                <div className="v">2 a 3 vagas privativas</div>
              </div>
              <div className="fc">
                <div className="k">Início das obras</div>
                <div className="v">Julho / 2023</div>
              </div>
              <div className="fc">
                <div className="k">Previsão de entrega</div>
                <div className="v">Agosto / 2026</div>
              </div>
            </div>
            <p
              data-reveal=""
              style={{ marginTop: '24px', fontSize: '13px', color: 'var(--t-muted)', maxWidth: '760px' }}
            >
              Torres A e D com 4 apartamentos por andar + 3 gardens em cada torre. Torres B e C com 2
              apartamentos por andar. Sistema construtivo em estrutura convencional na garagem e térreo,
              com alvenaria estrutural nos pavimentos tipo.
            </p>
          </div>
        </section>

        {/* ====================== FAQ ====================== */}
        <section className="sec on-dark">
          <div className="wrap">
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <span
                className="eyebrow center"
                data-reveal=""
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                Perguntas frequentes
              </span>
              <h2
                className="h-section"
                data-reveal=""
                style={{ '--rd': '.06s', marginTop: '20px' } as React.CSSProperties}
              >
                Tudo que você precisa saber.
              </h2>
            </div>
            <div className="faq" id="faq">
              <div className="faq-item">
                <button className="faq-q">
                  Onde fica o Authoria by Tebas?<span className="ic"></span>
                </button>
                <div className="faq-a">
                  <p>
                    Na Rua Ernesto Rappa, Jardim Santa Teresa, em Jundiaí/SP, com acesso rápido à Rodovia
                    Anhanguera e área de preservação em frente.
                  </p>
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-q">
                  Quais são as tipologias e metragens?<span className="ic"></span>
                </button>
                <div className="faq-a">
                  <p>
                    Apartamentos de 3 suítes com 137,39 m² (2 vagas) e de 4 suítes com 211,91 m² (3
                    vagas, sendo uma box). Há também opções de planta com living ampliado e gardens no
                    térreo.
                  </p>
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-q">
                  Quando é a previsão de entrega?<span className="ic"></span>
                </button>
                <div className="faq-a">
                  <p>As obras tiveram início em julho de 2023 e a previsão de entrega é agosto de 2026.</p>
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-q">
                  Quais itens de lazer o condomínio oferece?<span className="ic"></span>
                </button>
                <div className="faq-a">
                  <p>
                    São mais de 37 itens, incluindo piscinas adulto e infantil com deck molhado, piscina
                    coberta com SPA, sauna, fitness com área externa, sala de yoga/pilates, quadra de
                    beach tennis, coworking, gourmet, salão de festas, brinquedoteca, beauty, pet care,
                    bicicletário e muito mais.
                  </p>
                </div>
              </div>
              <div className="faq-item">
                <button className="faq-q">
                  Como agendar uma visita ao decorado?<span className="ic"></span>
                </button>
                <div className="faq-a">
                  <p>
                    Preencha o formulário nesta página ou fale com um consultor da Lotus Brokers pelo
                    WhatsApp. Há apartamentos decorados disponíveis para visita no showroom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================== CONVERSAO ====================== */}
        <section className="sec cta-band" id="contato">
          <div className="cta-sky">
            <canvas id="sky2"></canvas>
          </div>
          <div className="wrap">
            <div className="cta-grid">
              <div className="cta-copy" data-reveal="">
                <span className="eyebrow">Conheça o showroom</span>
                <h2 style={{ marginTop: '20px' }}>
                  Visite os decorados<span className="script">&amp; surpreenda-se</span>
                </h2>
                <p>
                  Agende uma visita agora mesmo e venha conhecer o Authoria by Tebas com um consultor da
                  Lotus Brokers. Recebemos você no melhor horário.
                </p>
                <div className="cta-show">
                  <span className="lab">Showroom</span>
                  <div className="val">Rua Ernesto Rappa, 232</div>
                  <div className="sub">Jardim Santa Teresa · Jundiaí/SP</div>
                </div>
              </div>

              <div className="form-card" data-reveal="" style={{ '--rd': '.1s' } as React.CSSProperties}>
                <form id="leadForm" noValidate>
                  <h3>Agende sua visita</h3>
                  <p className="fsub">Preencha e nossa equipe entra em contato.</p>
                  <div className="field">
                    <input type="text" name="nome" placeholder="Nome completo" required autoComplete="name" />
                  </div>
                  <div className="field two">
                    <input type="tel" name="telefone" placeholder="WhatsApp / Telefone" required autoComplete="tel" />
                    <input type="email" name="email" placeholder="E-mail" autoComplete="email" />
                  </div>
                  <div className="field">
                    <select name="tipologia">
                      <option value="">Tipologia de interesse</option>
                      <option>3 suítes · 137,39 m²</option>
                      <option>4 suítes · 211,91 m²</option>
                      <option>Ainda não sei</option>
                    </select>
                  </div>
                  <div className="consent">
                    <input type="checkbox" id="consent" required />
                    <label htmlFor="consent">
                      Autorizo o contato e o tratamento dos meus dados conforme a Política de
                      Privacidade.
                    </label>
                  </div>
                  <button type="submit" className="btn btn-solid">
                    Quero agendar minha visita
                  </button>
                </form>
                <div className="form-ok" id="formOk">
                  <div className="chk">✓</div>
                  <h3>Recebemos seu contato!</h3>
                  <p className="fsub" style={{ marginBottom: 0 }}>
                    Em breve um de nossos consultores fala com você.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="ft">
        <div className="wrap">
          <div className="ft-top">
            <div className="ft-logo">
              <img src="/authoria/a003.png" alt="Authoria by Tebas" className="ft-logo-img" />
              <p>
                Um encontro raro entre exclusividade, natureza e arquitetura. Realização e construção
                Tebas. Vendas e atendimento exclusivos{' '}
                <strong style={{ color: 'var(--t-dim)', fontWeight: 500 }}>Lotus Brokers</strong>.
              </p>
            </div>
            <div className="ft-col">
              <h4>Navegação</h4>
              <a href="#conceito">Conceito</a>
              <a href="#plantas">Plantas</a>
              <a href="#lazer">Lazer</a>
              <a href="#localizacao">Localização</a>
              <a href="#ficha">Ficha técnica</a>
            </div>
            <div className="ft-col">
              <h4>Showroom</h4>
              <p>
                Rua Ernesto Rappa, 232
                <br />
                Jardim Santa Teresa — Jundiaí/SP
              </p>
              <a href="#contato" data-cta="">
                Agende sua visita
              </a>
              <a href="#" id="waFooter">
                Fale no WhatsApp
              </a>
            </div>
          </div>
          <div className="ft-legal">
            <p>
              Authoria by Tebas — Incorporação registrada conforme R.04, Matrícula 179.898, do 2º
              Oficial de Registro de Imóveis, Títulos e Documentos e Civil de Pessoas Jurídicas da
              Comarca de Jundiaí, em 18 de abril de 2023. Imagens preliminares e perspectivas
              ilustradas, sujeitas a alterações sem aviso prévio. O paisagismo retratado reflete o porte
              adulto da vegetação. As áreas comuns serão entregues equipadas e decoradas conforme o
              Memorial Descritivo. O empreendimento só poderá ser comercializado após registro no
              cartório competente.
            </p>
          </div>
          <div className="ft-base">
            <span>© 2026 · Authoria by Tebas</span>
            <span>Realização e Construção: Tebas · Vendas: Lotus Brokers</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a className="wa" id="wa" href="#" aria-label="WhatsApp">
        <span className="pulse"></span>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.737-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path>
        </svg>
      </a>

      <div id="tweaks-root"></div>
    </>
  );
}
