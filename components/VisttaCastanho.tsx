'use client';

/**
 * VisttaCastanho — porte 1:1 de vistta-castanho/index.html (CSS-class, NÃO dc-runtime) para React.
 * Visual e comportamento idênticos ao estático.
 *
 * O markup usa classes CSS literais (ver app/vistta-castanho/vistta-castanho.css).
 * O <script src="a011.js"> é reimplementado fielmente em um único useEffect (manipulação
 * imperativa de DOM por classe/atributo, exatamente como o original):
 *  - header .scrolled (y>40) + .wa-float .show (y>600)
 *  - mobile menu (burger + links fecham; body overflow lock)
 *  - reveal + counters via scroll check (getBoundingClientRect)
 *  - parallax [data-parallax]
 *  - select .filled on change
 *  - video lazy embed (Vimeo)
 *  - forms -> WhatsApp (mensagem exata)
 *  - lightbox gallery (data-full/data-cap, teclado)
 *  - active nav link on scroll
 *
 * Imagens locais: /vistta-castanho/aNNN.* (URLs exatas do fonte). Mapa e Vimeo mantidos.
 */

import { useEffect } from 'react';
import { sendLead } from '@/lib/lead';

const WA_NUMBER = '5511926143393';
function waLink(msg: string) {
  return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
}

export default function VisttaCastanho() {
  useEffect(() => {
    /* ---- Header scroll state + float WA ---- */
    const header = document.querySelector<HTMLElement>('.header');
    const waFloat = document.querySelector<HTMLElement>('.wa-float');
    function onScroll() {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      header?.classList.toggle('scrolled', y > 40);
      waFloat?.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- Mobile menu ---- */
    const burger = document.querySelector<HTMLElement>('.burger');
    const mobile = document.querySelector<HTMLElement>('.mobile-menu');
    function toggleMenu(force?: boolean) {
      const open = force !== undefined ? force : !mobile!.classList.contains('open');
      mobile!.classList.toggle('open', open);
      burger!.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    const onBurgerClick = () => toggleMenu();
    burger?.addEventListener('click', onBurgerClick);
    const mobileLinks = mobile
      ? Array.prototype.slice.call(mobile.querySelectorAll('a'))
      : [];
    const onMobileLinkClick = () => toggleMenu(false);
    mobileLinks.forEach((a: Element) => a.addEventListener('click', onMobileLinkClick));

    /* ---- Reveal + counters via scroll check (robust everywhere) ---- */
    const revealEls: Element[] = Array.prototype.slice.call(
      document.querySelectorAll('.reveal,.reveal-x,.clip-up')
    );
    const countEls: Element[] = Array.prototype.slice.call(
      document.querySelectorAll('[data-count]')
    );
    let revTicking = false;
    function checkReveals() {
      const vh = window.innerHeight;
      for (let i = revealEls.length - 1; i >= 0; i--) {
        const el = revealEls[i];
        const top = el.getBoundingClientRect().top;
        if (top < vh * 0.9) {
          el.classList.add('in');
          revealEls.splice(i, 1);
        }
      }
      for (let j = countEls.length - 1; j >= 0; j--) {
        const c = countEls[j];
        if (c.getBoundingClientRect().top < vh * 0.85) {
          animateCount(c);
          countEls.splice(j, 1);
        }
      }
      revTicking = false;
    }
    function reqReveals() {
      if (!revTicking) {
        revTicking = true;
        requestAnimationFrame(checkReveals);
      }
    }
    window.addEventListener('scroll', reqReveals, { passive: true });
    window.addEventListener('resize', reqReveals);
    checkReveals();
    const revealTimeout = setTimeout(checkReveals, 120);
    window.addEventListener('load', checkReveals);
    function animateCount(el: Element) {
      const target = parseFloat(el.getAttribute('data-count') || '0');
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const dur = 1600;
      let start: number | null = null;
      function step(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = formatNum(val, dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = formatNum(target, dec);
      }
      requestAnimationFrame(step);
    }
    function formatNum(v: number, dec: number) {
      const s = v.toFixed(dec);
      const parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return dec > 0 ? parts.join(',') : parts[0];
    }

    /* ---- Parallax (hero + fullbleed) ---- */
    const parallaxEls: { el: HTMLElement; speed: number }[] = [];
    document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      parallaxEls.push({ el, speed: parseFloat(el.getAttribute('data-parallax') || '0') });
    });
    let ticking = false;
    function parallaxUpdate() {
      parallaxEls.forEach((p) => {
        const rect = p.el.parentElement!.getBoundingClientRect();
        // Ancorado no topo: quando a seção está alinhada ao topo do viewport
        // (rect.top === 0) o offset é 0 — a imagem não "nasce deslocada" nem
        // sobe junto com o header fixo. Só desloca conforme a seção rola.
        // Clamp ±48px p/ não exceder a folga de 8% da imagem (evita mostrar borda).
        const raw = -rect.top * p.speed;
        const off = Math.max(-48, Math.min(48, raw));
        p.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    function reqParallax() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(parallaxUpdate);
      }
    }
    if (parallaxEls.length && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      window.addEventListener('scroll', reqParallax, { passive: true });
      window.addEventListener('resize', reqParallax);
      parallaxUpdate();
    }

    /* ---- Select filled state ---- */
    const selects = Array.prototype.slice.call(
      document.querySelectorAll<HTMLSelectElement>('select')
    );
    const selectHandlers: { s: HTMLSelectElement; h: () => void }[] = [];
    selects.forEach((s: HTMLSelectElement) => {
      const h = () => s.classList.toggle('filled', !!s.value);
      s.addEventListener('change', h);
      selectHandlers.push({ s, h });
    });

    /* ---- Video lazy embed ---- */
    const posters = Array.prototype.slice.call(
      document.querySelectorAll<HTMLElement>('.video-poster')
    );
    const posterHandlers: { poster: HTMLElement; h: () => void }[] = [];
    posters.forEach((poster: HTMLElement) => {
      const h = () => {
        const frame = poster.parentElement!;
        const iframe = document.createElement('iframe');
        iframe.src =
          'https://player.vimeo.com/video/1128979059?autoplay=1&title=0&byline=0&portrait=0&color=c2a05a';
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        frame.appendChild(iframe);
        poster.style.display = 'none';
      };
      poster.addEventListener('click', h);
      posterHandlers.push({ poster, h });
    });

    /* ---- Lead forms -> WhatsApp ---- */
    const forms = Array.prototype.slice.call(
      document.querySelectorAll<HTMLFormElement>('form[data-wa]')
    );
    const formHandlers: { form: HTMLFormElement; h: (ev: Event) => void }[] = [];
    forms.forEach((form: HTMLFormElement) => {
      const h = (ev: Event) => {
        ev.preventDefault();
        const data: Record<string, string> = {};
        form.querySelectorAll('input,select,textarea').forEach((f) => {
          const field = f as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (field.name) data[field.name] = field.value.trim();
        });
        sendLead({
          name: data.nome,
          phone: data.telefone,
          email: data.email,
          source: 'landing_vistta-castanho',
          interest: 'Vistta Castanho',
          message: [data.interesse, data.mensagem].filter(Boolean).join(' — '),
        });
        let msg =
          'Olá! Tenho interesse no *Vistta Castanho* (loteamento fechado no Castanho, Jundiaí).';
        msg += '\n\nNome: ' + (data.nome || '-');
        if (data.telefone) msg += '\nTelefone: ' + data.telefone;
        if (data.interesse) msg += '\nInteresse: ' + data.interesse;
        if (data.mensagem) msg += '\nMensagem: ' + data.mensagem;
        msg += '\n\nGostaria de falar com um corretor.';
        window.open(waLink(msg), '_blank');
        const btn = form.querySelector<HTMLElement>('button[type=submit]');
        if (btn) {
          const t = btn.innerHTML;
          btn.innerHTML = 'Abrindo WhatsApp…';
          setTimeout(() => {
            btn.innerHTML = t;
          }, 2500);
        }
      };
      form.addEventListener('submit', h);
      formHandlers.push({ form, h });
    });

    /* ---- Lightbox gallery ---- */
    const lb = document.querySelector<HTMLElement>('.lightbox');
    const lbImg = lb?.querySelector<HTMLImageElement>('img') || null;
    const lbCap = lb?.querySelector<HTMLElement>('.lb-cap') || null;
    const tiles: HTMLElement[] = Array.prototype.slice.call(
      document.querySelectorAll<HTMLElement>('.tile[data-full]')
    );
    let current = 0;
    function openLb(i: number) {
      current = i;
      const t = tiles[current];
      if (lbImg) {
        // data-full veio do HTML estático com caminho relativo (assets/img/...);
        // no Next isso resolveria contra a rota atual → 404. Prefixa com a base
        // da landing quando não for absoluto.
        const full = t.getAttribute('data-full') || '';
        lbImg.src =
          full && !full.startsWith('/') && !/^https?:/.test(full)
            ? '/vistta-castanho/' + full
            : full;
      }
      if (lbCap) lbCap.textContent = t.getAttribute('data-cap') || '';
      lb?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb?.classList.remove('open');
      document.body.style.overflow = '';
    }
    function nav(d: number) {
      current = (current + d + tiles.length) % tiles.length;
      openLb(current);
    }
    const tileHandlers: { t: HTMLElement; h: () => void }[] = [];
    tiles.forEach((t, i) => {
      const h = () => openLb(i);
      t.addEventListener('click', h);
      tileHandlers.push({ t, h });
    });
    const lbClose = lb?.querySelector<HTMLElement>('.lb-close') || null;
    const lbPrev = lb?.querySelector<HTMLElement>('.lb-prev') || null;
    const lbNext = lb?.querySelector<HTMLElement>('.lb-next') || null;
    const onLbClose = () => closeLb();
    const onLbPrev = (e: Event) => {
      e.stopPropagation();
      nav(-1);
    };
    const onLbNext = (e: Event) => {
      e.stopPropagation();
      nav(1);
    };
    const onLbBgClick = (e: Event) => {
      if (e.target === lb) closeLb();
    };
    lbClose?.addEventListener('click', onLbClose);
    lbPrev?.addEventListener('click', onLbPrev);
    lbNext?.addEventListener('click', onLbNext);
    lb?.addEventListener('click', onLbBgClick);
    const onKeydown = (e: KeyboardEvent) => {
      if (!lb?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'ArrowLeft') nav(-1);
    };
    document.addEventListener('keydown', onKeydown);

    /* ---- Active nav link on scroll ---- */
    const sections: HTMLElement[] = Array.prototype.slice.call(
      document.querySelectorAll<HTMLElement>('section[id]')
    );
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a');
    function updateActiveNav() {
      const mid = window.innerHeight * 0.4;
      let active: string | null = null;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) active = s.getAttribute('id');
      });
      navLinks.forEach((a) => {
        a.style.color =
          active && a.getAttribute('href') === '#' + active ? 'var(--text-cream)' : '';
      });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    /* ---- Cleanup ---- */
    return () => {
      window.removeEventListener('scroll', onScroll);
      burger?.removeEventListener('click', onBurgerClick);
      mobileLinks.forEach((a: Element) => a.removeEventListener('click', onMobileLinkClick));
      window.removeEventListener('scroll', reqReveals);
      window.removeEventListener('resize', reqReveals);
      window.removeEventListener('load', checkReveals);
      clearTimeout(revealTimeout);
      window.removeEventListener('scroll', reqParallax);
      window.removeEventListener('resize', reqParallax);
      selectHandlers.forEach(({ s, h }) => s.removeEventListener('change', h));
      posterHandlers.forEach(({ poster, h }) => poster.removeEventListener('click', h));
      formHandlers.forEach(({ form, h }) => form.removeEventListener('submit', h));
      tileHandlers.forEach(({ t, h }) => t.removeEventListener('click', h));
      lbClose?.removeEventListener('click', onLbClose);
      lbPrev?.removeEventListener('click', onLbPrev);
      lbNext?.removeEventListener('click', onLbNext);
      lb?.removeEventListener('click', onLbBgClick);
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('scroll', updateActiveNav);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* ===================== HEADER ===================== */}
      <header className="header">
        <div className="wrap nav">
          <a href="#inicio" className="brand" aria-label="Vistta Castanho">
            <span className="dev-name">
              <span className="b1">Vistta Castanho</span>
              <span className="b2">Castanho · Jundiaí</span>
            </span>
          </a>
          <nav className="nav-links" aria-label="Navegação principal">
            <a href="#empreendimento">O Empreendimento</a>
            <a href="#diferenciais">Diferenciais</a>
            <a href="#lazer">Lazer</a>
            <a href="#natureza">Natureza</a>
            <a href="#localizacao">Localização</a>
          </nav>
          <a href="#contato" className="btn btn-gold head-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 10.5a8 8 0 1 1-3.5-6.6L20 4"></path>
              <path d="M20 4v4h-4"></path>
            </svg>
            Quero saber mais
          </a>
          <button className="burger" aria-label="Abrir menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="mobile-menu">
        <a href="#empreendimento">O Empreendimento</a>
        <a href="#diferenciais">Diferenciais</a>
        <a href="#lazer">Lazer</a>
        <a href="#natureza">Natureza</a>
        <a href="#localizacao">Localização</a>
        <a href="#contato" className="btn btn-gold">
          Falar com corretor
        </a>
      </div>

      {/* ===================== HERO ===================== */}
      <section className="hero" id="inicio">
        <div className="hero-media" data-parallax="0.12">
          <img
            src="/vistta-castanho/a008.jpg"
            alt="Lago ao pôr do sol no loteamento Vistta Castanho em Jundiaí"
          />
        </div>
        <svg className="hero-grain" width="100%" height="100%">
          <filter id="n">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            ></feTurbulence>
          </filter>
          <rect width="100%" height="100%" filter="url(#n)" opacity="0.4"></rect>
        </svg>

        <div className="hero-inner wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow reveal">
                Loteamento Fechado · Castanho, Jundiaí — SP
              </span>
              <h1 className="display reveal d1">
                Vistta Castanho
                <span className="accent">um sonho do tamanho do seu</span>
              </h1>
              <p className="hero-sub reveal d2">
                Lotes <b>a partir de 126 m²</b> em meio à natureza, entre São Paulo e Campinas.
                Compacto nos espaços individuais, magnífico e completo em infraestrutura e lazer.
              </p>
              <div className="hero-cta reveal d3">
                <a href="#contato" className="btn btn-gold btn-lg">
                  Falar com um corretor
                </a>
                <a href="#empreendimento" className="btn btn-ghost btn-lg">
                  Conhecer o empreendimento
                </a>
              </div>
              <div className="hero-meta reveal d4">
                <div className="m">
                  <span className="v">126 m²</span>
                  <span className="l">Lotes a partir de</span>
                </div>
                <div className="div"></div>
                <div className="m">
                  <span className="v">
                    <span data-count="119945" data-dec="0">
                      119.945
                    </span>{' '}
                    m²
                  </span>
                  <span className="l">Área total</span>
                </div>
                <div className="div"></div>
                <div className="m">
                  <span className="v">24h</span>
                  <span className="l">Portaria inteligente</span>
                </div>
              </div>
            </div>

            <div className="hero-form reveal d3">
              <div className="lead-card">
                <h3>Receba o material completo</h3>
                <p className="sub">
                  Preencha e fale agora com um corretor exclusivo no WhatsApp.
                </p>
                <form data-wa="">
                  <div className="field">
                    <input type="text" name="nome" placeholder="Seu nome" required />
                  </div>
                  <div className="field">
                    <input
                      type="tel"
                      name="telefone"
                      placeholder="Seu WhatsApp / telefone"
                      required
                    />
                  </div>
                  <div className="field">
                    <select name="interesse" defaultValue="">
                      <option value="" disabled>
                        Tenho interesse em…
                      </option>
                      <option>Comprar para morar</option>
                      <option>Investir</option>
                      <option>Conhecer condições</option>
                      <option>Agendar visita ao plantão</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-gold btn-lg">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.1Z"></path>
                    </svg>
                    Falar no WhatsApp
                  </button>
                  <p className="legal">
                    Seus dados são usados apenas para contato sobre o Vistta Castanho.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <a href="#empreendimento" className="scroll-cue" aria-label="Rolar para baixo">
          <span>Explore</span>
          <span className="ln"></span>
        </a>
      </section>

      {/* ===================== STRIP ===================== */}
      <div className="strip" aria-hidden="true">
        <div className="marq">
          <div className="it">
            <span className="dot"></span>Loteamento fechado
          </div>
          <div className="it">
            <span className="dot"></span>Lotes a partir de 126 m²
          </div>
          <div className="it">
            <span className="dot"></span>Clube completo
          </div>
          <div className="it">
            <span className="dot"></span>Lago &amp; mirante
          </div>
          <div className="it">
            <span className="dot"></span>Portaria inteligente
          </div>
          <div className="it">
            <span className="dot"></span>Concierge &amp; mini mercado
          </div>
          <div className="it">
            <span className="dot"></span>Fibra óptica &amp; Wi-Fi
          </div>
          <div className="it">
            <span className="dot"></span>Castanho · Jundiaí — SP
          </div>
          <div className="it">
            <span className="dot"></span>Loteamento fechado
          </div>
          <div className="it">
            <span className="dot"></span>Lotes a partir de 126 m²
          </div>
          <div className="it">
            <span className="dot"></span>Clube completo
          </div>
          <div className="it">
            <span className="dot"></span>Lago &amp; mirante
          </div>
          <div className="it">
            <span className="dot"></span>Portaria inteligente
          </div>
          <div className="it">
            <span className="dot"></span>Concierge &amp; mini mercado
          </div>
          <div className="it">
            <span className="dot"></span>Fibra óptica &amp; Wi-Fi
          </div>
          <div className="it">
            <span className="dot"></span>Castanho · Jundiaí — SP
          </div>
        </div>
      </div>

      {/* ===================== EMPREENDIMENTO ===================== */}
      <section className="section light" id="empreendimento">
        <div className="wrap about-grid">
          <div className="about-copy">
            <span className="eyebrow lead reveal">O Empreendimento</span>
            <h2 className="display reveal d1">
              Compacto e completo,<span className="serif-italic"> do seu jeito</span>
            </h2>
            <p className="reveal d2">
              O Vistta Castanho é moderno e compacto nos espaços individuais, magnífico e completo
              em infraestrutura. Ideal para quem busca o máximo de privacidade, lazer e conveniência
              — para aproveitar a vida com mais qualidade, sem precisar sair do condomínio.
            </p>
            <blockquote className="quote reveal d2">
              “Oferecemos empreendimentos para pessoas que desejam aproveitar o que a vida tem de
              melhor. Cada novo projeto é criado com capricho em cada detalhe.”
            </blockquote>
            <p className="reveal d3">
              Localizado no bairro do Castanho, em Jundiaí, entre São Paulo e Campinas, com
              loteamento fechado, portaria inteligente e infraestrutura de clube a poucos metros do
              seu lar.
            </p>
            <a
              href="#contato"
              className="btn btn-dark btn-lg reveal d3"
              style={{ marginTop: '14px' }}
            >
              Quero conhecer de perto
            </a>
          </div>
          <div className="about-figure reveal d2">
            <div className="ph clip-up">
              <img
                src="/vistta-castanho/a007.jpg"
                alt="Vista aérea da região do Castanho em Jundiaí ao pôr do sol"
              />
            </div>
            <div className="badge">
              <div className="n">
                <span data-count="119945" data-dec="0">
                  119.945
                </span>
              </div>
              <div className="t">
                m² de área total · loteamento fechado com lotes a partir de 126 m²
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DIFERENCIAIS ===================== */}
      <section className="section dark-sec" id="diferenciais">
        <div className="wrap">
          <div className="sec-head center reveal">
            <span className="eyebrow center">Infraestrutura</span>
            <h2 className="display">Tudo o que importa, a poucos passos de casa</h2>
            <p>
              Um loteamento pensado para a vida acontecer com conveniência, segurança e natureza por
              perto.
            </p>
          </div>
          <div className="feat-grid">
            <article className="feat reveal d1">
              <span className="idx">01</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 21V9l9-6 9 6v12"></path>
                  <path d="M3 21h18M9 21v-6h6v6"></path>
                </svg>
              </div>
              <h3>Loteamento fechado</h3>
              <p>
                Lotes compactos a partir de 126 m², com privacidade e a tranquilidade de morar em um
                ambiente protegido.
              </p>
            </article>
            <article className="feat reveal d2">
              <span className="idx">02</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Portaria inteligente</h3>
              <p>
                Controle de acesso e monitoramento 24h, com infraestrutura de Wi-Fi na portaria e no
                clube.
              </p>
            </article>
            <article className="feat reveal d3">
              <span className="idx">03</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9h18M3 9l2-5h14l2 5M5 9v11h14V9"></path>
                  <path d="M9 13h6"></path>
                </svg>
              </div>
              <h3>Concierge &amp; mini mercado</h3>
              <p>
                Serviço de concierge e mini mercado interno para resolver o dia a dia sem sair de
                casa.
              </p>
            </article>
            <article className="feat reveal d1">
              <span className="idx">04</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z"></path>
                  <path d="M9 11a3 3 0 0 0 6 0"></path>
                </svg>
              </div>
              <h3>Clube interno completo</h3>
              <p>
                Piscina, academia equipada, churrasqueiras, brinquedoteca e salão de festas a poucos
                metros do seu lar.
              </p>
            </article>
            <article className="feat reveal d2">
              <span className="idx">05</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12.55a11 11 0 0 1 14 0M1.5 9a16 16 0 0 1 21 0M8.5 16a6 6 0 0 1 7 0"></path>
                  <circle cx="12" cy="20" r="1"></circle>
                </svg>
              </div>
              <h3>Fibra óptica &amp; Wi-Fi</h3>
              <p>
                Passagem de fibra óptica e Wi-Fi integrado nas áreas de lazer: conexão com a
                velocidade que você precisa.
              </p>
            </article>
            <article className="feat reveal d3">
              <span className="idx">06</span>
              <div className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"></path>
                  <path d="M9 3v15M15 6v15"></path>
                </svg>
              </div>
              <h3>Localização estratégica</h3>
              <p>
                No bairro do Castanho, em Jundiaí, entre São Paulo e Campinas — o melhor de duas
                grandes regiões.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===================== VIDEO ===================== */}
      <section className="video-sec" id="video">
        <div
          className="video-glow"
          style={{ backgroundImage: 'url("/vistta-castanho/a026.jpg")' }}
        ></div>
        <div className="wrap">
          <div className="sec-head center reveal" style={{ margin: '0 auto' }}>
            <span className="eyebrow center" style={{ color: 'var(--gold-2)' }}>
              O Filme
            </span>
            <h2 className="display" style={{ color: 'var(--cream)' }}>
              Uma vida extraordinária
              <br />
              começa por aqui
            </h2>
            <p style={{ color: 'var(--text-cream-mut)' }}>
              Pressione play e percorra o Vistta Castanho — do lago ao clube, da natureza à
              conveniência.
            </p>
          </div>
          <div className="video-frame reveal d1">
            <div className="video-poster">
              <img
                src="/vistta-castanho/a006.jpg"
                alt="Casal à beira do lago no Vistta Castanho ao pôr do sol"
              />
              <span className="play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LAZER GALLERY ===================== */}
      <section className="section light" id="lazer">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow lead">Lazer &amp; Clube</span>
            <h2 className="display">A vida é uma festa — e o clube é o seu cenário</h2>
            <p>
              Explore todas as possibilidades de lazer em meio à natureza, com estrutura completa e
              acessível para todas as idades.
            </p>
          </div>
          <div className="gal">
            <div
              className="tile t-w7 t-h2 big-mob reveal"
              data-full="assets/img/piscina.jpg"
              data-cap="Piscina com terraço &amp; fitness externo"
            >
              <img
                src="/vistta-castanho/a005.jpg"
                alt="Piscina com terraço no clube do Vistta Castanho"
              />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Piscina com terraço</div>
                <div className="d">
                  Academia equipada e fitness externo com vista para a piscina.
                </div>
              </div>
            </div>
            <div
              className="tile t-w5 reveal d1"
              data-full="assets/img/salao.jpg"
              data-cap="Salão de festas decorado e equipado"
            >
              <img
                src="/vistta-castanho/a000.jpg"
                alt="Salão de festas decorado e equipado do clube"
              />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Salão de festas</div>
                <div className="d">Decorado, equipado e com cozinha de apoio.</div>
              </div>
            </div>
            <div
              className="tile t-w5 reveal d2"
              data-full="assets/img/brinquedoteca.jpg"
              data-cap="Brinquedoteca iluminada e lúdica"
            >
              <img src="/vistta-castanho/a001.jpg" alt="Brinquedoteca iluminada e lúdica" />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Brinquedoteca</div>
                <div className="d">Iluminada e lúdica, com visão externa.</div>
              </div>
            </div>
            <div
              className="tile t-w7 reveal d1"
              data-full="assets/img/paisagismo.jpg"
              data-cap="Deck e paisagismo multiespécies à beira d'água"
            >
              <img
                src="/vistta-castanho/a010.jpg"
                alt="Deck de madeira e paisagismo florido à beira da água"
              />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Deck &amp; paisagismo</div>
                <div className="d">Pérgola e jardim multiespécies à beira da água.</div>
              </div>
            </div>
            <div
              className="tile t-w6 reveal d1"
              data-full="assets/img/pet.jpg"
              data-cap="Espaço pet: playground para cachorros e pracinha"
            >
              <img
                src="/vistta-castanho/a002.jpg"
                alt="Espaço pet com cachorro brincando na grama"
              />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Espaço pet</div>
                <div className="d">
                  Cuidado e carinho com os pet lovers: playground e pracinha.
                </div>
              </div>
            </div>
            <div
              className="tile t-w6 reveal d2"
              data-full="assets/img/portaria.jpg"
              data-cap="Portaria inteligente com controle de acesso"
            >
              <img
                src="/vistta-castanho/a009.jpg"
                alt="Portaria inteligente do loteamento Vistta Castanho"
              />
              <span className="plus">+</span>
              <div className="cap">
                <div className="t">Portaria inteligente</div>
                <div className="d">Controle de acesso e monitoramento na entrada.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== NATUREZA FULLBLEED ===================== */}
      <section className="fullbleed" id="natureza">
        <div className="bg" data-parallax="0.1">
          <img
            src="/vistta-castanho/a004.jpg"
            alt="Família à beira do lago no Vistta Castanho"
          />
        </div>
        <div className="wrap">
          <div className="nat-copy">
            <span className="eyebrow reveal">O Lago dos Sonhos</span>
            <h2 className="display reveal d1">Sua conexão com a natureza, à flor da pele</h2>
            <p className="reveal d2">
              Um projeto de paisagismo confortável e multiespécies, com arborização urbana que
              floresce em diferentes épocas do ano — primavera para sempre.
            </p>
            <div className="nat-list reveal d2">
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Mirante com vista para o lago</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Pista de caminhada ao redor do lago</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Paisagismo confortável e multiespécies</span>
              </div>
              <div className="row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Arborização urbana com espécies florindo o ano todo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LOCALIZACAO ===================== */}
      <section className="section light" id="localizacao">
        <div className="wrap loc-grid">
          <div className="loc-copy">
            <span className="eyebrow lead reveal">Localização</span>
            <h2 className="display reveal d1">
              No coração do Castanho,<span className="serif-italic"> em Jundiaí</span>
            </h2>
            <p className="reveal d2" style={{ color: 'var(--text-mut)' }}>
              Entre São Paulo e Campinas, o Vistta Castanho une a tranquilidade da natureza à
              facilidade de acesso a duas das maiores regiões do estado.
            </p>
            <div className="loc-points">
              <div className="p reveal d2">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z"></path>
                    <circle cx="12" cy="11" r="2.5"></circle>
                  </svg>
                </span>
                <div>
                  <h4>O Loteamento</h4>
                  <p>
                    Prolongamento da Avenida Benedito Chrispim, Avenida Marginal do Loteamento
                    Applausi Castanho — Castanho, Jundiaí — SP.
                  </p>
                </div>
              </div>
              <div className="p reveal d3">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                </span>
                <div>
                  <h4>Entre SP e Campinas</h4>
                  <p>
                    Posição estratégica que aproxima você do trabalho, das compras e do lazer das
                    duas cidades.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="loc-map reveal d2">
            <iframe
              title="Mapa — Castanho, Jundiaí — SP"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Castanho,+Jundia%C3%AD+-+SP&output=embed"
            ></iframe>
          </div>
        </div>
      </section>

      {/* ===================== CONTATO ===================== */}
      <section className="section contact" id="contato">
        <div className="glow" style={{ backgroundImage: 'url("/vistta-castanho/a026.jpg")' }}></div>
        <div className="wrap contact-grid">
          <div className="contact-copy">
            <span className="eyebrow lead reveal">Corretor Exclusivo</span>
            <h2 className="display reveal d1">
              Fale comigo
              <br />
              agora mesmo!
            </h2>
            <p className="big reveal d2">
              Tire suas dúvidas, receba o material completo e agende sua visita. Atendimento de
              qualidade, do começo ao fim.
            </p>
            <div className="contact-info">
              <div className="ci reveal d2">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.1Z"></path>
                </svg>
                <div>
                  <div className="lbl">WhatsApp</div>
                  <div className="val">+55 11 92614-3393</div>
                </div>
              </div>
              <div className="ci reveal d3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z"></path>
                  <circle cx="12" cy="11" r="2.5"></circle>
                </svg>
                <div>
                  <div className="lbl">Localização</div>
                  <div className="val">
                    Castanho, Jundiaí — SP · entre São Paulo e Campinas
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card reveal d2">
            <h3>Quero falar com um corretor</h3>
            <p className="sub">Resposta rápida e atendimento exclusivo.</p>
            <form data-wa="">
              <div className="form-row">
                <div className="field">
                  <input type="text" name="nome" placeholder="Nome completo" required />
                </div>
                <div className="field">
                  <input type="tel" name="telefone" placeholder="WhatsApp" required />
                </div>
              </div>
              <div className="field">
                <select name="interesse" defaultValue="">
                  <option value="" disabled>
                    Tenho interesse em…
                  </option>
                  <option>Comprar para morar</option>
                  <option>Investir</option>
                  <option>Conhecer condições</option>
                  <option>Agendar visita ao plantão</option>
                </select>
              </div>
              <div className="field">
                <textarea name="mensagem" rows={3} placeholder="Mensagem (opcional)"></textarea>
              </div>
              <button type="submit" className="btn btn-gold btn-lg">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.1Z"></path>
                </svg>
                Enviar pelo WhatsApp
              </button>
              <p className="legal">
                Ao enviar, você abre uma conversa no WhatsApp. Imagens meramente ilustrativas.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <p>
                Atendimento de qualidade na comercialização do Vistta Castanho, loteamento fechado
                no Castanho, em Jundiaí — SP.
              </p>
            </div>
            <div className="foot-col">
              <h5>Navegação</h5>
              <a href="#empreendimento">O Empreendimento</a>
              <a href="#diferenciais">Diferenciais</a>
              <a href="#lazer">Lazer &amp; Clube</a>
              <a href="#natureza">Natureza</a>
              <a href="#localizacao">Localização</a>
            </div>
            <div className="foot-col">
              <h5>Contato</h5>
              <a href="https://wa.me/5511926143393" target="_blank" rel="noopener">
                WhatsApp · +55 11 92614-3393
              </a>
              <p>
                Loteamento: Prol. Av. Benedito Chrispim
                <br />
                Castanho — Jundiaí — SP
              </p>
            </div>
          </div>
          <div className="foot-bottom">
            <p>
              © 2026 Vistta Castanho. Empreendimento Applausi Construtora. Imagens
              meramente ilustrativas.
            </p>
            <div className="socials">
              <a
                href="https://wa.me/5511926143393"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.1Z"></path>
                </svg>
              </a>
              <a href="#inicio" aria-label="Topo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 19V5M5 12l7-7 7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Float WhatsApp */}
      <a
        href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Vistta%20Castanho."
        className="wa-float"
        target="_blank"
        rel="noopener"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.9 5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.1Z"></path>
        </svg>
      </a>

      {/* Lightbox */}
      <div className="lightbox">
        <button className="lb-close" aria-label="Fechar">
          ×
        </button>
        <button className="lb-nav lb-prev" aria-label="Anterior">
          ‹
        </button>
        <img alt="Vistta Castanho" />
        <button className="lb-nav lb-next" aria-label="Próximo">
          ›
        </button>
        <div className="lb-cap"></div>
      </div>
    </>
  );
}
