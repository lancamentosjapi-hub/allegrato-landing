'use client';

/**
 * AutenJundiai — porte 1:1 de auten-jundiai/index.html (formato CSS-class, NÃO dc-runtime).
 * Visual e comportamento idênticos ao estático. Todo o markup do <body> vira JSX literal;
 * o CSS (2 blocos <style>) vive em app/auten-jundiai/auten-jundiai.css (escopado em .auten-root).
 *
 * O <script src="a027.js"> é reimplementado aqui em um único useEffect que opera sobre o DOM
 * já renderizado (querySelectors dentro do root), reproduzindo fielmente:
 *  - deep-links de WhatsApp (.js-wpp) e envio de formulários (.js-lead)
 *  - estado 'scrolled' do header, reveal on scroll ([data-reveal])
 *  - embed lazy do YouTube (.js-video)
 *  - tabs de tipologias (renderiza a coluna .tipo-info e troca a planta com fade)
 *  - fachada dia↔noite (crossfade automático + toggle manual + abre no lightbox)
 *  - lightbox com navegação por grupo (lazer, interiores, implantação, planta)
 *
 * Manter o efeito operando sobre o DOM (em vez de reescrever tudo em estado React) é a forma
 * mais fiel e de menor risco: o markup e as classes são idênticos ao estático, então o mesmo
 * script produz exatamente o mesmo comportamento.
 */

import { useEffect, useRef } from 'react';
import { sendLead } from '@/lib/lead';

/* >>> CONFIGURE AQUI <<< — troque pelo WhatsApp da sua imobiliária */
const WPP_NUMBER = '5511926143393'; // formato internacional, somente dígitos

/* Tipologias (dados reais do manual) — valores EXATOS do a027.js */
const TIPOS = [
  {
    kicker: 'Torre 02 · final 3 e 4',
    area: '128,51 m²',
    torre: '24 unidades · 2 opções de planta',
    specs: [
      { l: 'Suítes', v: '3' },
      { l: 'Vagas', v: '3' },
      { l: 'Sala estar/jantar', v: '22 m²' },
      { l: 'Varanda gourmet', v: '12 m²' },
    ],
    feats: [
      'Opção inicial do empreendimento',
      'Suíte master com closet e banheiro com duas cubas',
      'Opção 2: 2 suítes, suíte master com closet amplo e banheiros Sr. e Sra., sala ampliada',
      'Bike box exclusivo por unidade',
    ],
  },
  {
    kicker: 'Torre 02 · final 1 e 2',
    area: '131,14 m²',
    torre: '24 unidades · 2 opções de planta',
    specs: [
      { l: 'Suítes', v: '3' },
      { l: 'Vagas', v: '3' },
      { l: 'Sala estar/jantar', v: '22 m²' },
      { l: 'Varanda gourmet', v: '12 m²' },
    ],
    feats: [
      'Opção com maior espaço interno',
      'Suíte master com closet e banheiro com duas cubas',
      'Opção 2: 2 suítes, suíte master ampliada com banheiros Sr. e Sra. e sala ampliada com varanda integrada',
      'Bike box exclusivo por unidade',
    ],
  },
  {
    kicker: 'Torre 01 · elevador privativo',
    area: '188,62 m²',
    torre: '24 unidades · 2 opções de planta',
    specs: [
      { l: 'Suítes', v: '4' },
      { l: 'Vagas', v: '4' },
      { l: 'Sala estar/jantar', v: '28 m²' },
      { l: 'Varanda gourmet', v: '20 m²' },
    ],
    feats: [
      'Elevador privativo',
      'Sala multiuso na cozinha (despensa ou adega) de 4,20 m²',
      'Suíte master com closet mais amplo e banheiro com duas cubas',
      'Opção 2: 3 suítes, suíte master com banheiro ampliado, sala ampliada e sugestão de adega',
    ],
  },
  {
    kicker: 'Torre 02 · cobertura',
    area: '264,54 m²',
    torre: 'Apenas 02 unidades · penthouse',
    specs: [
      { l: 'Suítes', v: '3' },
      { l: 'Vagas', v: '3' },
      { l: 'Terraço', v: '116 m²' },
      { l: 'Elevador', v: 'privativo' },
    ],
    feats: [
      'Cobertura com terraço de 116 m²',
      'Piscina privativa (2,90 × 4,00 × 0,85 m), churrasqueira e lavabo externo',
      'Suíte master com closet e banheiro com duas cubas',
      'Apenas 02 unidades em todo o empreendimento',
    ],
  },
];

const plantaCaps = [
  'Planta ilustrativa · 128,51 m² · Opção 1',
  'Planta ilustrativa · 131,14 m² · sala ampliada com varanda integrada',
  'Planta ilustrativa · 188,62 m² · 4 suítes com elevador privativo',
  'Planta ilustrativa · 264,54 m² · penthouse com terraço e piscina privativa',
];
const plantaAlts = [
  'Planta da residência suspensa de 128,51 m² com 3 suítes',
  'Planta da residência suspensa de 131,14 m² com 3 suítes e varanda integrada',
  'Planta da residência suspensa de 188,62 m² com 4 suítes e elevador privativo',
  'Planta da penthouse de 264,54 m² com terraço e piscina privativa',
];

const IMG = (n: string) => `/auten-jundiai/${n}`;

export default function AutenJundiai() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];

    /* ---------- WhatsApp deep-links ---------- */
    function wppLink(msg?: string | null) {
      return (
        'https://wa.me/' +
        WPP_NUMBER +
        '?text=' +
        encodeURIComponent(msg || 'Olá! Quero informações sobre o Auten Jundiaí.')
      );
    }
    root.querySelectorAll<HTMLAnchorElement>('.js-wpp').forEach((el) => {
      el.setAttribute('href', wppLink(el.dataset.msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    /* ---------- Lead forms → abrem WhatsApp com os dados ---------- */
    root.querySelectorAll<HTMLFormElement>('.js-lead').forEach((form) => {
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const data = new FormData(form);
        const nome = (data.get('nome') || '').toString().trim();
        const tel = (data.get('tel') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const tipo = (data.get('tipo') || '').toString().trim();
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_auten-jundiai',
          interest: 'Auten Jundiaí',
          message: tipo,
        });
        let msg = 'Olá! Tenho interesse no Auten Jundiaí.';
        if (nome) msg += ' Meu nome é ' + nome + '.';
        if (tipo) msg += ' Interesse: ' + tipo + '.';
        if (tel) msg += ' Meu WhatsApp: ' + tel + '.';
        if (email) msg += ' Meu e-mail: ' + email + '.';
        msg += ' Podem me enviar o material e as condições?';
        window.open(wppLink(msg), '_blank', 'noopener');
      };
      form.addEventListener('submit', onSubmit);
      cleanups.push(() => form.removeEventListener('submit', onSubmit));
    });

    /* ---------- Header scroll state ---------- */
    const header = root.querySelector<HTMLElement>('#header');
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /* ---------- Reveal on scroll (rect-based, robust) ---------- */
    const revealEls = Array.prototype.slice.call(
      root.querySelectorAll('[data-reveal]'),
    ) as HTMLElement[];
    function checkReveal(instant: boolean) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = revealEls.length - 1; i >= 0; i--) {
        const el = revealEls[i];
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -40) {
          if (instant) {
            el.style.transition = 'none';
            el.classList.add('in');
            requestAnimationFrame(function () {
              el.style.transition = '';
            });
          } else {
            el.classList.add('in');
          }
          revealEls.splice(i, 1);
        }
      }
    }
    const onRevealScroll = () => checkReveal(false);
    const onRevealResize = () => checkReveal(false);
    window.addEventListener('scroll', onRevealScroll, { passive: true });
    window.addEventListener('resize', onRevealResize, { passive: true });
    checkReveal(true); // initial: above-the-fold appears instantly
    requestAnimationFrame(function () {
      checkReveal(true);
    });
    const onLoad = () => checkReveal(false);
    window.addEventListener('load', onLoad);
    /* failsafe: reveal everything still hidden */
    const failsafe = window.setTimeout(function () {
      root
        .querySelectorAll('[data-reveal]:not(.in)')
        .forEach(function (el) {
          el.classList.add('in');
        });
    }, 1000);
    cleanups.push(() => {
      window.removeEventListener('scroll', onRevealScroll);
      window.removeEventListener('resize', onRevealResize);
      window.removeEventListener('load', onLoad);
      window.clearTimeout(failsafe);
    });

    /* ---------- Lazy YouTube embed ---------- */
    root.querySelectorAll<HTMLElement>('.js-video').forEach((box) => {
      const onClick = () => {
        if (box.classList.contains('playing')) return;
        const id = box.dataset.yt;
        const iframe = document.createElement('iframe');
        iframe.src =
          'https://www.youtube-nocookie.com/embed/' +
          id +
          '?autoplay=1&rel=0&modestbranding=1';
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        );
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('title', 'Vídeo Auten Jundiaí');
        box.appendChild(iframe);
        box.classList.add('playing');
      };
      box.addEventListener('click', onClick);
      cleanups.push(() => box.removeEventListener('click', onClick));
    });

    /* ---------- Tipologias ---------- */
    const infoEl = root.querySelector<HTMLElement>('.js-tipo-info');
    const plantaEl = root.querySelector<HTMLImageElement>('.js-planta');
    const plantaCapEl = root.querySelector<HTMLElement>('.js-planta-cap');
    const plantaZoomEl = root.querySelector<HTMLElement>('.js-planta-zoom');
    let currentTipo = 0;
    const plantaImgs = (function () {
      const els = root.querySelectorAll<HTMLImageElement>('#planta-sources img');
      if (els && els.length === 4) {
        return Array.prototype.map.call(els, function (im: HTMLImageElement) {
          return im.src;
        }) as string[];
      }
      return [
        'assets/opt/planta-128.jpg',
        'assets/opt/planta-131.jpg',
        'assets/opt/planta-188.jpg',
        'assets/opt/planta-264.jpg',
      ];
    })();

    function esc(s: string) {
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    function renderTipo(i: number) {
      const t = TIPOS[i];
      if (infoEl) {
        infoEl.innerHTML =
          '<div class="kicker">' +
          esc(t.kicker) +
          '</div>' +
          '<h3>' +
          esc(t.area) +
          '</h3>' +
          '<div class="torre">' +
          esc(t.torre) +
          '</div>' +
          '<div class="spec">' +
          t.specs
            .map(function (s) {
              return (
                '<div><div class="sl">' +
                esc(s.l) +
                '</div><div class="sv">' +
                esc(s.v) +
                '</div></div>'
              );
            })
            .join('') +
          '</div>' +
          '<ul class="tipo-feats">' +
          t.feats
            .map(function (f) {
              return '<li>' + esc(f) + '</li>';
            })
            .join('') +
          '</ul>';
      }
      if (plantaEl) {
        plantaEl.style.opacity = '0';
        const src = plantaImgs[i];
        const pre = new Image();
        pre.onload = function () {
          plantaEl.src = src;
          plantaEl.alt = plantaAlts[i];
          plantaEl.style.opacity = '1';
        };
        pre.src = src;
      }
      if (plantaCapEl) {
        plantaCapEl.textContent = plantaCaps[i];
      }
      currentTipo = i;
    }

    /* ---------- Lightbox ---------- */
    const lightbox = root.querySelector<HTMLElement>('#lightbox');
    const lightboxImg = root.querySelector<HTMLImageElement>('#lightbox-img');
    const lightboxCap = root.querySelector<HTMLElement>('#lightbox-cap');
    const lightboxCount = root.querySelector<HTMLElement>('#lightbox-count');
    const lbPrev = root.querySelector<HTMLButtonElement>('#lightbox-prev');
    const lbNext = root.querySelector<HTMLButtonElement>('#lightbox-next');
    type LbItem = { src: string; alt?: string; cap?: string };
    let lbItems: LbItem[] = [];
    let lbIndex = 0;

    function renderLb() {
      const it = lbItems[lbIndex];
      if (!it) return;
      if (lightboxImg) {
        lightboxImg.src = it.src;
        lightboxImg.alt = it.alt || 'Imagem ampliada do Auten Jundiaí';
      }
      if (lightboxCap) lightboxCap.textContent = it.cap || '';
      const multi = lbItems.length > 1;
      if (lbPrev) lbPrev.hidden = !multi;
      if (lbNext) lbNext.hidden = !multi;
      if (lightboxCount)
        lightboxCount.textContent = multi
          ? lbIndex + 1 + ' / ' + lbItems.length
          : '';
    }
    function openLightboxGroup(items: LbItem[], idx?: number) {
      lbItems = items;
      lbIndex = idx || 0;
      renderLb();
      if (lightbox) {
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';
    }
    function openLightboxSrc(src: string, alt?: string, cap?: string) {
      openLightboxGroup([{ src: src, alt: alt, cap: cap }], 0);
    }
    function lbStep(dir: number) {
      if (lbItems.length < 2) return;
      lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
      renderLb();
    }
    function openLightbox() {
      openLightboxSrc(
        plantaImgs[currentTipo],
        plantaAlts[currentTipo],
        plantaCaps[currentTipo],
      );
    }
    function closeLightbox() {
      if (lightbox) {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    }
    if (plantaZoomEl) {
      plantaZoomEl.addEventListener('click', openLightbox);
      cleanups.push(() =>
        plantaZoomEl.removeEventListener('click', openLightbox),
      );
    }
    const lbClose = root.querySelector<HTMLButtonElement>('#lightbox-close');
    if (lbClose) {
      lbClose.addEventListener('click', closeLightbox);
      cleanups.push(() => lbClose.removeEventListener('click', closeLightbox));
    }
    if (lbPrev) {
      const h = (e: Event) => {
        e.stopPropagation();
        lbStep(-1);
      };
      lbPrev.addEventListener('click', h);
      cleanups.push(() => lbPrev.removeEventListener('click', h));
    }
    if (lbNext) {
      const h = (e: Event) => {
        e.stopPropagation();
        lbStep(1);
      };
      lbNext.addEventListener('click', h);
      cleanups.push(() => lbNext.removeEventListener('click', h));
    }
    if (lightbox) {
      const h = (e: Event) => {
        const target = e.target as HTMLElement;
        if (
          target === lightbox ||
          target.classList.contains('lightbox-inner')
        )
          closeLightbox();
      };
      lightbox.addEventListener('click', h);
      cleanups.push(() => lightbox.removeEventListener('click', h));
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') lbStep(1);
      else if (e.key === 'ArrowLeft') lbStep(-1);
    };
    document.addEventListener('keydown', onKeydown);
    cleanups.push(() => document.removeEventListener('keydown', onKeydown));

    /* ---------- Tornar imagens da galeria clicáveis ---------- */
    function capFromFigure(fig: Element | null) {
      if (!fig) return '';
      const t = fig.querySelector('.cap .t, .video-cap .t');
      const s = fig.querySelector('.cap .s, .video-cap .s');
      const tt = t ? (t.textContent || '').trim() : '';
      const ss = s ? (s.textContent || '').trim() : '';
      return tt + (ss ? ' · ' + ss : '');
    }
    function buildGroup(selector: string): LbItem[] {
      return Array.prototype.map.call(
        root!.querySelectorAll(selector),
        function (box: HTMLElement) {
          const img = box.querySelector('img') as HTMLImageElement;
          return {
            src: img.currentSrc || img.src,
            alt: img.alt,
            cap: capFromFigure(box) || img.alt,
          };
        },
      ) as LbItem[];
    }
    (['.lazer-gallery .lz', '.int-grid .int'] as const).forEach(function (sel) {
      const boxes = root.querySelectorAll<HTMLElement>(sel);
      boxes.forEach(function (box, i) {
        const h = () => {
          const group = buildGroup(sel);
          openLightboxGroup(group, i);
        };
        box.addEventListener('click', h);
        cleanups.push(() => box.removeEventListener('click', h));
      });
    });
    const implantFrame = root.querySelector<HTMLElement>('.implant-frame');
    if (implantFrame) {
      const h = () => {
        const img = implantFrame.querySelector('img') as HTMLImageElement;
        const cap = root.querySelector('.implant-cap');
        openLightboxSrc(
          img.currentSrc || img.src,
          img.alt,
          cap ? (cap.textContent || '').trim() : img.alt,
        );
      };
      implantFrame.addEventListener('click', h);
      cleanups.push(() => implantFrame.removeEventListener('click', h));
    }

    /* ---------- Façade dia ↔ noite ---------- */
    (function () {
      const fa = root.querySelector<HTMLElement>('.js-facade');
      if (!fa) return;
      const btnDay = fa.querySelector<HTMLButtonElement>('.js-fa-day')!;
      const btnNight = fa.querySelector<HTMLButtonElement>('.js-fa-night')!;
      const dayImg = fa.querySelector<HTMLImageElement>('.fa-day')!;
      const nightImg = fa.querySelector<HTMLImageElement>('.fa-night')!;
      let auto = true;
      function setMode(night: boolean) {
        fa!.classList.toggle('is-night', night);
        btnNight.classList.toggle('active', night);
        btnDay.classList.toggle('active', !night);
        btnNight.setAttribute('aria-pressed', night ? 'true' : 'false');
        btnDay.setAttribute('aria-pressed', night ? 'false' : 'true');
      }
      const onDay = () => {
        auto = false;
        setMode(false);
      };
      const onNight = () => {
        auto = false;
        setMode(true);
      };
      btnDay.addEventListener('click', onDay);
      btnNight.addEventListener('click', onNight);
      cleanups.push(() => btnDay.removeEventListener('click', onDay));
      cleanups.push(() => btnNight.removeEventListener('click', onNight));
      // abrir no lightbox ao clicar na imagem (não nos botões) — mostra as duas vistas
      [dayImg, nightImg].forEach(function (img) {
        const h = () => {
          const items: LbItem[] = [
            {
              src: dayImg.currentSrc || dayImg.src,
              alt: dayImg.alt,
              cap: 'Perspectiva ilustrada da fachada, Vista 1',
            },
            {
              src: nightImg.currentSrc || nightImg.src,
              alt: nightImg.alt,
              cap: 'Perspectiva ilustrada da fachada, Vista 2',
            },
          ];
          const isNight = fa!.classList.contains('is-night');
          openLightboxGroup(items, isNight ? 1 : 0);
        };
        img.addEventListener('click', h);
        cleanups.push(() => img.removeEventListener('click', h));
      });
      // crossfade automático dia -> noite (fade suave, roda para todos)
      const loop = window.setInterval(function () {
        if (!auto) return;
        setMode(!fa!.classList.contains('is-night'));
      }, 4500);
      cleanups.push(() => window.clearInterval(loop));
    })();

    /* ---------- Tabs de tipologias ---------- */
    root.querySelectorAll<HTMLElement>('.js-tabs .tipo-tab').forEach((tab) => {
      const h = () => {
        root
          .querySelectorAll('.js-tabs .tipo-tab')
          .forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderTipo(parseInt(tab.dataset.tipo || '0', 10));
      };
      tab.addEventListener('click', h);
      cleanups.push(() => tab.removeEventListener('click', h));
    });
    renderTipo(0);

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="auten-root" ref={rootRef}>
      {/* ============ HEADER ============ */}
      <header className="site-header" id="header">
        <a href="#topo" className="brand-lockup" aria-label="Auten Jundiaí, início">
          <img className="logo-white" src={IMG('a006.png')} alt="Auten Jundiaí" />
          <img className="logo-color" src={IMG('a001.png')} alt="Auten Jundiaí" />
        </a>
        <nav className="nav" aria-label="Navegação principal">
          <div className="nav-links">
            <a href="#empreendimento">O empreendimento</a>
            <a href="#video">Vídeo</a>
            <a href="#lazer">Lazer</a>
            <a href="#plantas">Plantas</a>
            <a href="#localizacao">Localização</a>
          </div>
          <a href="#contato" className="btn btn-ghost">Receber material</a>
          <a
            className="btn btn-wpp js-wpp"
            href="#"
            data-msg="Olá! Vi a página do Auten Jundiaí e gostaria de mais informações."
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"></path></svg>
            WhatsApp
          </a>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <main id="topo">
        <section className="hero" aria-label="Auten Jundiaí">
          <div className="hero-bg"><img src={IMG('a023.jpg')} alt="Fachada do Auten Jundiaí, com as duas torres e brises de madeira" fetchPriority="high" /></div>
          <div className="hero-scrim"></div>
          <div className="hero-texture"></div>
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-head" data-reveal="">
                <div className="hero-loc"><span className="dot"></span><span>Anhangabaú · Jundiaí / SP</span></div>
                <h1>Auten<br /><em>Jundiaí</em></h1>
                <p className="hero-tag">Um projeto que nasceu para ser um marco na sua vida.</p>
                <div className="hero-stats">
                  <div className="stat"><div className="n">74</div><div className="l">unidades exclusivas</div></div>
                  <div className="stat"><div className="n">4</div><div className="l">até 4 suítes e 4 vagas</div></div>
                  <div className="stat"><div className="n">+20</div><div className="l">itens de lazer</div></div>
                  <div className="stat"><div className="n">128–264</div><div className="l">m² de área privativa</div></div>
                </div>
                <div className="hero-cta">
                  <a className="btn btn-light js-wpp" href="#" data-msg="Olá! Quero conhecer o Auten Jundiaí. Pode me enviar valores e condições?">Falar com um especialista</a>
                  <a className="btn btn-ghost" href="#empreendimento" style={{ color: '#f0e3d3' }}>Conhecer o projeto</a>
                </div>
              </div>

              {/* LEAD FORM */}
              <div className="lead-card" id="contato" data-reveal="">
                <h3>Receba o material completo</h3>
                <p className="sub">Book, plantas e condições exclusivas no seu WhatsApp.</p>
                <form className="js-lead">
                  <div className="field">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" name="nome" type="text" placeholder="Seu nome" required />
                  </div>
                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" name="email" type="email" placeholder="voce@email.com" required />
                  </div>
                  <div className="lead-row">
                    <div className="field">
                      <label htmlFor="tel">WhatsApp</label>
                      <input id="tel" name="tel" type="tel" placeholder="(11) 90000-0000" required />
                    </div>
                    <div className="field">
                      <label htmlFor="tipo">Interesse</label>
                      <select id="tipo" name="tipo">
                        <option>3 suítes</option>
                        <option>4 suítes</option>
                        <option>Penthouse</option>
                        <option>Investimento</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-wpp" style={{ justifyContent: 'center' }}>Quero receber agora</button>
                  <p className="legal">Ao enviar, você concorda em ser contatado por nossos consultores. Seus dados estão protegidos.</p>
                </form>
              </div>
            </div>
          </div>
          <a href="#empreendimento" className="scroll-cue" aria-label="Rolar para baixo"><span>Explorar</span><span className="bar"></span></a>
        </section>
      </main>

      {/* ============ STRIP ============ */}
      <div className="strip" aria-hidden="true">
        <div className="marquee">
          <span>Fachada assinada por Ronaldo Rezende</span><span>Piscina aquecida com raia de 25 m</span><span>Até 4 vagas cobertas</span><span>Portaria 24h com clausura</span><span>+20 itens de lazer</span><span>Apenas 74 unidades</span>
          <span>Fachada assinada por Ronaldo Rezende</span><span>Piscina aquecida com raia de 25 m</span><span>Até 4 vagas cobertas</span><span>Portaria 24h com clausura</span><span>+20 itens de lazer</span><span>Apenas 74 unidades</span>
        </div>
      </div>

      {/* ============ SOBRE ============ */}
      <section className="section about" id="empreendimento">
        <div className="wrap about-grid">
          <div className="about-copy" data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">O empreendimento</span></div>
            <h2 className="display">Uma identidade única no horizonte de Jundiaí.</h2>
            <p>Com uma fachada autêntica e moderna, projetada especialmente para este projeto por <strong>Ronaldo Rezende</strong>, o Auten Jundiaí redefine o horizonte da cidade e cria uma identidade única no cenário urbano.</p>
            <p>Todo o empreendimento foi concebido com assinatura nos projetos arquitetônico, de interiores e de paisagismo, uma entrega de alto nível que oferece uma experiência completa de viver bem. Com apenas <strong>74 unidades</strong>, o projeto foi pensado para proporcionar mais privacidade, tranquilidade e valorização do imóvel.</p>
            <div className="signatures">
              <div className="sig"><div className="role">Arquitetura</div><div className="name">Fernando Rivaben &amp; Nivaldo Callegari</div></div>
              <div className="sig"><div className="role">Fachada</div><div className="name">Ronaldo Rezende</div></div>
              <div className="sig"><div className="role">Paisagismo</div><div className="name">Alexandre Furcolin</div></div>
              <div className="sig"><div className="role">Interiores</div><div className="name">Bohrer Arquitetos</div></div>
            </div>
          </div>
          <div className="facade-slot" data-reveal="">
            <div className="facade-anim js-facade">
              <img className="fa-img fa-day" src={IMG('a023.jpg')} alt="Fachada do Auten Jundiaí durante o dia" loading="lazy" />
              <img className="fa-img fa-night" src={IMG('a020.jpg')} alt="Fachada noturna iluminada do Auten Jundiaí com paisagismo e entrada social" loading="lazy" />
              <div className="facade-toggle" role="group" aria-label="Alternar vistas da fachada">
                <button type="button" className="ft-btn js-fa-day active" aria-pressed="true">Vista 1</button>
                <button type="button" className="ft-btn js-fa-night" aria-pressed="false">Vista 2</button>
              </div>
              <span className="facade-tag">Perspectiva ilustrada da fachada</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VÍDEO ============ */}
      <section className="section video" id="video">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Tour em vídeo</span></div>
            <h2 className="display" style={{ maxWidth: '20ch' }}>Conheça o Auten Jundiaí por dentro.</h2>
          </div>
          <div className="video-frame js-video" data-yt="PNTlc1Rxq7E" data-reveal="">
            <img src={IMG('a000.jpg')} alt="Vídeo de apresentação do Auten Jundiaí" loading="lazy" />
            <div className="scrim"></div>
            <button className="play" aria-label="Reproduzir vídeo">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            </button>
            <div className="video-cap"><div className="t">Apresentação do empreendimento</div><div className="s">Toque para assistir</div></div>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section className="section diff">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Por que o Auten</span></div>
            <h2 className="display" style={{ maxWidth: '16ch' }}>Diferenciais que sustentam cada decisão.</h2>
          </div>
          <div className="diff-grid">
            <div className="diff-card" data-reveal="">
              <div className="diff-num">01</div>
              <h3>Exclusividade real</h3>
              <p>Apenas 74 unidades em um condomínio fechado vertical, mais privacidade, tranquilidade e valorização do imóvel.</p>
            </div>
            <div className="diff-card" data-reveal="">
              <div className="diff-num">02</div>
              <h3>Lazer premium</h3>
              <p>Mais de 20 opções de lazer cuidadosamente projetadas para cada momento do dia, dentro do próprio condomínio.</p>
            </div>
            <div className="diff-card" data-reveal="">
              <div className="diff-num">03</div>
              <h3>Fachada assinada</h3>
              <p>Design de fachada autêntico e imponente criado por Ronaldo Rezende, transmitindo status e elegância em cada detalhe.</p>
            </div>
            <div className="diff-card" data-reveal="">
              <div className="diff-num">04</div>
              <h3>Segurança 24h</h3>
              <p>Portaria 24 horas com clausura e controle total de acesso, além de fechaduras digitais nas portas dos apartamentos.</p>
            </div>
            <div className="diff-card" data-reveal="">
              <div className="diff-num">05</div>
              <h3>Plantas personalizáveis</h3>
              <p>Estrutura convencional que permite personalizar a planta do apartamento de acordo com o seu estilo de vida.</p>
            </div>
            <div className="diff-card" data-reveal="">
              <div className="diff-num">06</div>
              <h3>Até 4 vagas</h3>
              <p>Único empreendimento da região nessas metragens com até 4 vagas de garagem, 100% cobertas e demarcadas por apartamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section className="section lazer" id="lazer">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule" style={{ background: 'var(--gold)' }}></span><span className="overline">Lazer completo</span></div>
            <h2 className="display">Mais de 20 experiências dentro de casa.</h2>
            <p className="lede" style={{ marginTop: '20px' }}>Espaços projetados para cada momento do dia, criando o cenário ideal para o morador aproveitar ao máximo o seu estilo de vida.</p>
          </div>

          <div className="lazer-gallery">
            <figure className="lz lz-a" data-reveal="">
              <img src={IMG('a002.jpg')} alt="Complexo de piscinas aquecidas do Auten Jundiaí com deck de madeira e paisagismo" loading="lazy" />
              <figcaption className="cap"><div className="t">Complexo de piscinas</div><div className="s">Piscina adulto aquecida com raia de 25 m</div></figcaption>
            </figure>
            <figure className="lz lz-b" data-reveal="">
              <img src={IMG('a007.jpg')} alt="Family Club do Auten Jundiaí com lounge, bar e área de convívio" loading="lazy" />
              <figcaption className="cap"><div className="t">Family Club</div><div className="s">Convívio, lounge e bar</div></figcaption>
            </figure>
            <figure className="lz lz-c" data-reveal="">
              <img src={IMG('a019.jpg')} alt="Fire place do Auten Jundiaí com lareira e estar externo" loading="lazy" />
              <figcaption className="cap"><div className="t">Fire place</div><div className="s">Estar externo ao ar livre</div></figcaption>
            </figure>
            <figure className="lz lz-d" data-reveal="">
              <img src={IMG('a003.jpg')} alt="Salão de festas do Auten Jundiaí com cozinha independente" loading="lazy" />
              <figcaption className="cap"><div className="t">Salão de festas</div><div className="s">Capacidade para 45 pessoas, com cozinha e lavabo</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a005.jpg')} alt="Espaço wellness com sala de yoga" loading="lazy" />
              <figcaption className="cap"><div className="t">Espaço wellness</div><div className="s">Sala de yoga e massagem</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a010.jpg')} alt="Academia do Auten Jundiaí equipada" loading="lazy" />
              <figcaption className="cap"><div className="t">Fitness</div><div className="s">Equipado e integrado ao paisagismo</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a026.jpg')} alt="Coworking do Auten Jundiaí" loading="lazy" />
              <figcaption className="cap"><div className="t">Coworking</div><div className="s">Ambiente para home office</div></figcaption>
            </figure>
            <figure className="lz lz-w6" data-reveal="">
              <img src={IMG('a018.jpg')} alt="Praça central com espelho d'água e pergolado" loading="lazy" />
              <figcaption className="cap"><div className="t">Praça central</div><div className="s">Espelho d&apos;água e paisagismo assinado</div></figcaption>
            </figure>
            <figure className="lz lz-w6" data-reveal="">
              <img src={IMG('a013.jpg')} alt="Quadra recreativa do Auten Jundiaí" loading="lazy" />
              <figcaption className="cap"><div className="t">Quadra recreativa</div><div className="s">Esporte e lazer ao ar livre</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a012.jpg')} alt="Playground do Auten Jundiaí" loading="lazy" />
              <figcaption className="cap"><div className="t">Playground</div><div className="s">Diversão para as crianças</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a004.jpg')} alt="Sala de jogos do Auten Jundiaí" loading="lazy" />
              <figcaption className="cap"><div className="t">Sala de jogos</div><div className="s">Bilhar, games e convívio</div></figcaption>
            </figure>
            <figure className="lz lz-w4" data-reveal="">
              <img src={IMG('a016.jpg')} alt="Pet care do Auten Jundiaí" loading="lazy" />
              <figcaption className="cap"><div className="t">Pet care</div><div className="s">Cuidado e banho para os pets</div></figcaption>
            </figure>
          </div>

          <ul className="amen-list" aria-label="Itens de lazer">
            <li>Family Club</li>
            <li>Salão de festas</li>
            <li>Espaço gourmet</li>
            <li>Espaço wellness</li>
            <li>Fitness</li>
            <li>Fitness outdoor</li>
            <li>Fire place</li>
            <li>Coworking</li>
            <li>Sala de jogos</li>
            <li>Quadra recreativa</li>
            <li>Playground</li>
            <li>Brinquedoteca</li>
            <li>Pet care</li>
            <li>Pet place</li>
            <li>Bike care</li>
            <li>Espaço delivery</li>
            <li>Redário</li>
            <li>Piscina adulto aquecida</li>
            <li>Piscina infantil aquecida</li>
            <li>Solário</li>
            <li>Praça central</li>
            <li>Praça teen</li>
            <li>Espaço para minimercado 24h</li>
            <li>Lobby &amp; living externo</li>
          </ul>
        </div>
      </section>

      {/* ============ INTERIORES ============ */}
      <section className="section interiors" id="interiores">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Por dentro</span></div>
            <h2 className="display" style={{ maxWidth: '18ch' }}>Ambientes integrados, luz natural e alto padrão.</h2>
            <p className="lede" style={{ marginTop: '20px' }}>Plantas modernas com ambientes integrados, varanda gourmet com churrasqueira e acabamentos escolhidos com rigor, do mármore das suítes ao porcelanato 90×90.</p>
          </div>
          <div className="int-grid">
            <figure className="int int-wide" data-reveal="">
              <img src={IMG('a011.jpg')} alt="Living ampliado e integrado de apartamento do Auten Jundiaí" loading="lazy" />
              <div className="ovl"></div>
              <figcaption className="cap"><div className="t">Living ampliado</div><div className="s">Ambientes integrados com iluminação natural</div></figcaption>
            </figure>
            <figure className="int int-tall" data-reveal="">
              <img src={IMG('a009.jpg')} alt="Suíte master com closet do Auten Jundiaí" loading="lazy" />
              <div className="ovl"></div>
              <figcaption className="cap"><div className="t">Suíte master</div><div className="s">Closet e banheiro com duas cubas</div></figcaption>
            </figure>
            <figure className="int int-half" data-reveal="">
              <img src={IMG('a008.jpg')} alt="Cozinha de apartamento do Auten Jundiaí" loading="lazy" />
              <div className="ovl"></div>
              <figcaption className="cap"><div className="t">Cozinha</div><div className="s">Infraestrutura para lava-louças e ar-condicionado</div></figcaption>
            </figure>
            <figure className="int int-half" data-reveal="">
              <img src={IMG('a014.jpg')} alt="Varanda gourmet com churrasqueira do Auten Jundiaí" loading="lazy" />
              <div className="ovl"></div>
              <figcaption className="cap"><div className="t">Varanda gourmet</div><div className="s">Churrasqueira a carvão e bancada de apoio</div></figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ IMPLANTAÇÃO ============ */}
      <section className="section implant">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Implantação · Pavimento térreo</span></div>
            <h2 className="display" style={{ maxWidth: '18ch' }}>Cada espaço pensado para o seu dia a dia.</h2>
          </div>
          <div className="implant-frame" data-reveal="">
            <img src={IMG('a017.jpg')} alt="Implantação do pavimento térreo do Auten Jundiaí com a localização das 27 áreas comuns" loading="lazy" />
          </div>
          <p className="implant-cap">Implantação ilustrativa do pavimento térreo. Imagem meramente ilustrativa.</p>
        </div>
      </section>

      {/* ============ PLANTAS ============ */}
      <section className="section tipos" id="plantas">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Plantas &amp; tipologias</span></div>
            <h2 className="display" style={{ maxWidth: '16ch' }}>Quatro tipologias, infinitas possibilidades.</h2>
          </div>

          <div className="tipo-tabs js-tabs" data-reveal="">
            <button className="tipo-tab active" data-tipo="0">3 suítes<span className="m2">128 m²</span></button>
            <button className="tipo-tab" data-tipo="1">3 suítes<span className="m2">131 m²</span></button>
            <button className="tipo-tab" data-tipo="2">4 suítes<span className="m2">188 m²</span></button>
            <button className="tipo-tab" data-tipo="3">Penthouse<span className="m2">264 m²</span></button>
          </div>

          <div className="tipo-panel" data-reveal="">
            <div className="tipo-planta">
              <button className="planta-card js-planta-zoom" type="button" aria-label="Ampliar planta">
                <img className="js-planta" src={IMG('a025.jpg')} alt="Planta da residência suspensa de 128,51 m² com 3 suítes" loading="lazy" />
                <span className="zoom-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"></path></svg> Ampliar planta</span>
              </button>
              <div className="planta-cap js-planta-cap">Planta ilustrativa · 128,51 m² · Opção 1</div>
            </div>
            <div className="tipo-info js-tipo-info">
              {/* preenchido via JS */}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section className="section local" id="localizacao">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Localização</span></div>
            <h2 className="display" style={{ maxWidth: '20ch' }}>No coração do Anhangabaú, perto de tudo.</h2>
          </div>
          <figure className="local-aerial" data-reveal="">
            <img src={IMG('a024.jpg')} alt="Vista aérea de Jundiaí mostrando a implantação do Auten Jundiaí no bairro Anhangabaú" loading="lazy" />
            <figcaption className="tagline"><span className="big">Entre São Paulo e Campinas, no bairro nobre do Anhangabaú.</span></figcaption>
          </figure>
          <div className="local-grid">
            <div className="addr-card" data-reveal="">
              <div className="overline">Endereço</div>
              <h3>Rua Ida Luchesi Gomes de Camargo, 177</h3>
              <p className="full">Anhangabaú, Jundiaí / SP</p>
              <p className="hl">Bairro nobre, a 3 minutos da Rua do Retiro, com fácil acesso às principais rodovias que conectam Jundiaí a São Paulo.</p>
              <a className="btn btn-light js-wpp" href="#" data-msg="Olá! Quero saber mais sobre a localização do Auten Jundiaí.">Falar com um consultor</a>
            </div>
            <div className="poi-list" data-reveal="">
              <div className="poi"><span className="name">Av. Jundiaí</span><span className="time">1<small>min</small></span></div>
              <div className="poi"><span className="name">Hoken Sushi</span><span className="time">2<small>min</small></span></div>
              <div className="poi"><span className="name">Empório Dom Olívio</span><span className="time">3<small>min</small></span></div>
              <div className="poi"><span className="name">Parque do Colégio</span><span className="time">3<small>min</small></span></div>
              <div className="poi"><span className="name">Rua do Retiro</span><span className="time">3<small>min</small></span></div>
              <div className="poi"><span className="name">Av. 9 de Julho</span><span className="time">4<small>min</small></span></div>
              <div className="poi"><span className="name">Red House International School</span><span className="time">4<small>min</small></span></div>
              <div className="poi"><span className="name">Farmácia Drogasil</span><span className="time">4<small>min</small></span></div>
              <div className="poi"><span className="name">Maple Bear</span><span className="time">5<small>min</small></span></div>
              <div className="poi"><span className="name">Shopping Paineiras</span><span className="time">6<small>min</small></span></div>
              <div className="poi"><span className="name">Jundiaí Shopping</span><span className="time">7<small>min</small></span></div>
              <div className="poi"><span className="name">Clube Jundiaiense</span><span className="time">10<small>min</small></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONSTRUTORA ============ */}
      <section className="section builder">
        <div className="wrap builder-grid">
          <div className="builder-copy" data-reveal="">
            <div className="eyebrow-row"><span className="rule"></span><span className="overline">Quem constrói</span></div>
            <h2 className="display">Auten Incorporadora &amp; Grupo Cataguá.</h2>
            <p>A Auten faz parte do Grupo Cataguá Soluções Imobiliárias, que desde 1986 atua no mercado da construção civil. Com quase 40 anos de trajetória, é referência em desenvolvimento imobiliário no interior paulista.</p>
            <p>Criada em 2022, a Auten destaca-se ao pensar no alto padrão de ponta a ponta, do método construtivo aos acabamentos, louças e metais, escolhidos com rigor para proporcionar sofisticação e durabilidade.</p>
            <div className="builder-tags">
              <span className="tag">Terrace Serra do Japi · Jundiaí</span>
              <span className="tag">Auten Paulínia · Paulínia</span>
            </div>
          </div>
          <div className="builder-stats" data-reveal="">
            <div className="bstat"><div className="n">+40</div><div className="l">anos de mercado</div></div>
            <div className="bstat"><div className="n">+50</div><div className="l">municípios com presença</div></div>
            <div className="bstat"><div className="n">+16 mil</div><div className="l">chaves entregues</div></div>
            <div className="bstat"><div className="n">55 mil</div><div className="l">vidas transformadas</div></div>
          </div>
        </div>
      </section>

      {/* ============ FICHA TÉCNICA ============ */}
      <section className="section ficha" id="ficha">
        <div className="wrap">
          <div data-reveal="">
            <div className="eyebrow-row"><span className="rule" style={{ background: 'var(--gold)' }}></span><span className="overline">Ficha técnica</span></div>
            <h2 className="display">Os números do projeto.</h2>
          </div>
          <div className="ficha-grid">
            <div className="ficha-cell" data-reveal=""><div className="fl">Endereço</div><div className="fv"><strong>Rua Ida Luchesi Gomes de Camargo, 177</strong><br />Anhangabaú, Jundiaí / SP</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Área do terreno</div><div className="fv"><strong>5.083,50 m²</strong></div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Total de unidades</div><div className="fv"><strong>74 unidades</strong> · 02 penthouses</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Torre 01</div><div className="fv"><strong>Térreo + 12</strong><br />24 residências suspensas · 2 por andar</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Torre 02</div><div className="fv"><strong>Térreo + 13</strong><br />48 residências suspensas · 4 por andar</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Vagas</div><div className="fv"><strong>269 vagas</strong> · 100% cobertas<br />Torre 1: 4/unid. · Torre 2: 3/unid.</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Pé-direito sob laje</div><div className="fv"><strong>2,70 m</strong> · sala e dormitórios</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Elevadores</div><div className="fv">Torre 1: <strong>2 privativos</strong> + serviço<br />Torre 2: 2 sociais + serviço</div></div>
            <div className="ficha-cell" data-reveal=""><div className="fl">Tipologias</div><div className="fv"><strong>128,51 · 131,14 · 188,62 · 264,54 m²</strong></div></div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section final">
        <div className="wrap">
          <div data-reveal="">
            <h2>Seu marco<br />começa <em>aqui</em>.</h2>
            <p>Fale agora com um de nossos especialistas e receba o book completo, plantas e as melhores condições do Auten Jundiaí.</p>
          </div>
          <div className="final-form" data-reveal="">
            <form className="js-lead">
              <div className="lead-row">
                <div className="field"><label htmlFor="n2">Nome</label><input id="n2" name="nome" type="text" placeholder="Seu nome" required /></div>
                <div className="field"><label htmlFor="e2">E-mail</label><input id="e2" name="email" type="email" placeholder="voce@email.com" required /></div>
              </div>
              <div className="field"><label htmlFor="t2">WhatsApp</label><input id="t2" name="tel" type="tel" placeholder="(11) 90000-0000" required /></div>
              <button type="submit" className="btn btn-wpp" style={{ width: '100%', justifyContent: 'center' }}>Quero falar com um especialista</button>
            </form>
            <p className="or" style={{ textAlign: 'center' }}>ou chame direto no <a className="js-wpp" style={{ color: 'var(--brand)', fontWeight: 600 }} href="#" data-msg="Olá! Quero falar sobre o Auten Jundiaí.">WhatsApp →</a></p>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div>
              <div className="brand-lockup" style={{ marginBottom: '18px' }}>
                <img src={IMG('a006.png')} alt="Auten Jundiaí" style={{ height: '34px', width: 'auto', display: 'block' }} />
              </div>
              <p style={{ maxWidth: '34ch', color: '#b9a892' }}>Residências suspensas de alto padrão no Anhangabaú, Jundiaí/SP. Até 4 suítes, até 4 vagas e mais de 20 itens de lazer.</p>
            </div>
            <div>
              <h4>Navegação</h4>
              <a href="#empreendimento">O empreendimento</a>
              <a href="#lazer">Lazer</a>
              <a href="#plantas">Plantas &amp; tipologias</a>
              <a href="#localizacao">Localização</a>
              <a href="#ficha">Ficha técnica</a>
            </div>
            <div>
              <h4>Atendimento</h4>
              <a className="js-wpp" href="#" data-msg="Olá! Quero informações sobre o Auten Jundiaí.">WhatsApp de vendas</a>
              <a href="#contato">Receber material</a>
              <p style={{ marginTop: '14px', color: '#8a7a66' }}><strong style={{ color: '#b9a892' }}>Lotus Brokers</strong><br />CRECI 21829-J<br />(11) 92614-3393<br />contato@lotusbrokers.com.br</p>
            </div>
          </div>
          <p className="legal">O &quot;Auten Jundiaí&quot; é um empreendimento imobiliário aprovado pela Prefeitura Municipal de Jundiaí/SP, através da Lei nº 9.321 de 2019, pelo Processo de Aprovação SAEPRO 2025/355. A incorporação imobiliária encontra-se devidamente registrada sob o R. 8 na matrícula nº 42.826, do 1º Cartório de Registro de Imóveis da Comarca de Jundiaí/SP, em conformidade com a Lei nº 4.591/64. Todas as imagens deste material são meramente ilustrativas, podendo sofrer alterações durante a compatibilização técnica. A vegetação que compõe o paisagismo é ilustrativa e representa o porte adulto de referência das espécies. O projeto será executado de acordo com o memorial descritivo.</p>
          <div className="copyr">
            <span>© 2026 Auten Incorporadora, Grupo Cataguá Soluções Imobiliárias.</span>
            <span>Material de divulgação · Página desenvolvida por Lotus Brokers.</span>
          </div>
        </div>
      </footer>

      <a className="float-wpp js-wpp" href="#" data-msg="Olá! Vi a página do Auten Jundiaí e gostaria de mais informações." aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z"></path></svg>
      </a>

      {/* ============ LIGHTBOX ============ */}
      <div className="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Imagem ampliada">
        <button className="lightbox-close" id="lightbox-close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"></path></svg>
        </button>
        <button className="lightbox-nav lb-prev" id="lightbox-prev" aria-label="Anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
        <button className="lightbox-nav lb-next" id="lightbox-next" aria-label="Próxima">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"></path></svg>
        </button>
        <figure className="lightbox-inner">
          <img id="lightbox-img" alt="Imagem ampliada do Auten Jundiaí" />
          <figcaption id="lightbox-cap"></figcaption>
          <div className="lightbox-count" id="lightbox-count"></div>
        </figure>
      </div>

      {/* imagens das plantas (pré-carregadas p/ navegação e exportação standalone) */}
      <div id="planta-sources" hidden aria-hidden="true">
        <img src={IMG('a025.jpg')} alt="" />
        <img src={IMG('a021.jpg')} alt="" />
        <img src={IMG('a022.jpg')} alt="" />
        <img src={IMG('a015.jpg')} alt="" />
      </div>
    </div>
  );
}
