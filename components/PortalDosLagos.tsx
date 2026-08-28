'use client';

/**
 * PortalDosLagos — porte 1:1 de portal-dos-lagos (Wix/dc-runtime empacotado) para React/Next.
 * Visual e comportamento idênticos ao estático. Todo o CSS vive em
 * app/portal-dos-lagos/portal-dos-lagos.css (classes/:root/@font-face literais).
 * Este componente reproduz fielmente o script "Portal dos Lagos — interactions":
 *  - ano no rodapé (#yr)
 *  - nav .scrolled ao rolar > 40
 *  - menu mobile (abrir/fechar, fecha ao clicar nos links)
 *  - reveal via IntersectionObserver (.reveal -> .in)
 *  - FAQ accordion (um aberto por vez, maxHeight animado)
 *  - links data-wa (WhatsApp) com href/target/rel
 *  - barra mobile (#mbar) escondida enquanto o hero está visível
 *  - formulário -> WhatsApp (mensagem formatada, tela de sucesso)
 *  - lightbox da galeria (.amen-gallery figure[data-full])
 *
 * Imagens e fontes foram extraídas do bundle e servidas de /portal-dos-lagos e
 * /fonts/portal-dos-lagos. Os data-full do lightbox são mantidos LITERAIS (img/real-*.jpg),
 * exatamente como no fonte original.
 */

import React, { useEffect } from 'react';
import { sendLead } from '@/lib/lead';

export default function PortalDosLagos() {
  useEffect(() => {
    const WA = '5511926143393';
    const $ = <T extends Element = Element>(s: string, c?: Element | Document): T | null =>
      (c || document).querySelector<T>(s);
    const $$ = <T extends Element = Element>(s: string, c?: Element | Document): T[] =>
      Array.prototype.slice.call((c || document).querySelectorAll(s)) as T[];

    /* year */
    const yr = $('#yr');
    if (yr) yr.textContent = String(new Date().getFullYear());

    /* nav scrolled state */
    const nav = $('#nav');
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* mobile menu */
    const mmenu = $('#mmenu');
    function openMenu() {
      if (!mmenu) return;
      mmenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      if (!mmenu) return;
      mmenu.classList.remove('open');
      document.body.style.overflow = '';
    }
    const burger = $('#burger');
    const mclose = $('#mclose');
    burger?.addEventListener('click', openMenu);
    mclose?.addEventListener('click', closeMenu);
    const mmenuLinks = $$('#mmenu nav a');
    mmenuLinks.forEach((a) => a.addEventListener('click', closeMenu));

    /* reveal on scroll */
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io!.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      $$('.reveal').forEach((el) => {
        if (!el.classList.contains('in')) io!.observe(el);
      });
    } else {
      $$('.reveal').forEach((el) => el.classList.add('in'));
    }

    /* FAQ accordion */
    const faqHandlers: Array<{ q: Element; fn: () => void }> = [];
    $$('.faq-item').forEach((item) => {
      const q = $('.faq-q', item);
      const a = $<HTMLElement>('.faq-a', item);
      if (!q || !a) return;
      const fn = () => {
        const open = item.classList.contains('open');
        $$('.faq-item.open').forEach((o) => {
          o.classList.remove('open');
          const oa = $<HTMLElement>('.faq-a', o);
          if (oa) oa.style.maxHeight = '';
        });
        if (!open) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      };
      q.addEventListener('click', fn);
      faqHandlers.push({ q, fn });
    });

    /* WhatsApp links */
    function waURL(msg?: string) {
      return 'https://wa.me/' + WA + (msg ? '?text=' + encodeURIComponent(msg) : '');
    }
    const defaultMsg =
      'Olá! Vim pelo site do Portal dos Lagos e gostaria de receber mais informações e valores.';
    $$('[data-wa]').forEach((el) => {
      el.setAttribute('href', waURL(defaultMsg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    /* show mobile bar after hero */
    const mbar = $<HTMLElement>('#mbar');
    const hero = $('#hero');
    let hio: IntersectionObserver | undefined;
    if (mbar && hero && 'IntersectionObserver' in window) {
      hio = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            mbar.style.transform = e.isIntersecting ? 'translateY(120%)' : 'translateY(0)';
          });
        },
        { threshold: 0.15 }
      );
      hio.observe(hero);
      mbar.style.transition = 'transform .4s';
    }

    /* lead form -> WhatsApp */
    const form = $<HTMLFormElement>('#leadForm');
    const ok = $('#formOk');
    let formHandler: ((ev: Event) => void) | undefined;
    if (form) {
      formHandler = (ev: Event) => {
        ev.preventDefault();
        const nome = $<HTMLInputElement>('#nome')!.value.trim();
        const tel = $<HTMLInputElement>('#tel')!.value.trim();
        const email = $<HTMLInputElement>('#email')!.value.trim();
        const inter = $<HTMLSelectElement>('#interesse')!.value;
        if (!nome) {
          $<HTMLInputElement>('#nome')!.focus();
          return;
        }
        if (!tel) {
          $<HTMLInputElement>('#tel')!.focus();
          return;
        }
        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_portal-dos-lagos',
          interest: 'Portal dos Lagos',
          message: inter,
        });
        const msg =
          '*Novo contato, Portal dos Lagos*\n\n' +
          '👤 Nome: ' + nome + '\n' +
          '📱 Telefone: ' + tel + '\n' +
          (email ? '✉️ E-mail: ' + email + '\n' : '') +
          '⭐ Interesse: ' + inter + '\n\n' +
          'Enviado pelo site do Portal dos Lagos.';
        const url = waURL(msg);
        const link = $('#okLink');
        if (link) link.setAttribute('href', url);
        form.style.display = 'none';
        ok?.classList.add('show');
        window.open(url, '_blank');
      };
      form.addEventListener('submit', formHandler);
    }

    /* lightbox gallery */
    const figs = $$('.amen-gallery figure[data-full]');
    const lb = $('#lb');
    const lbImg = $<HTMLImageElement>('#lbImg');
    const lbCap = $('#lbCap');
    let cur = 0;
    function showLB(i: number) {
      if (i < 0) i = figs.length - 1;
      if (i >= figs.length) i = 0;
      cur = i;
      const f = figs[i];
      if (lbImg) {
        // data-full veio do HTML estático com caminho relativo (img/real-*.jpg);
        // no Next isso resolveria contra a rota atual → 404. Prefixa com a base
        // da landing quando não for absoluto (mesmo tratamento de Vistta/Terrace).
        const full = f.getAttribute('data-full') || '';
        lbImg.src =
          full && !full.startsWith('/') && !/^https?:/.test(full)
            ? '/portal-dos-lagos/' + full
            : full;
        lbImg.alt = f.getAttribute('data-cap') || '';
      }
      if (lbCap) lbCap.textContent = f.getAttribute('data-cap') || '';
    }
    const figHandlers: Array<{ f: Element; fn: () => void }> = [];
    figs.forEach((f, i) => {
      const fn = () => {
        showLB(i);
        lb?.classList.add('open');
        document.body.style.overflow = 'hidden';
      };
      f.addEventListener('click', fn);
      figHandlers.push({ f, fn });
    });
    function closeLB() {
      lb?.classList.remove('open');
      document.body.style.overflow = '';
    }
    const lbClose = $('#lbClose');
    const lbPrev = $('#lbPrev');
    const lbNext = $('#lbNext');
    const onClose = () => closeLB();
    const onPrev = () => showLB(cur - 1);
    const onNext = () => showLB(cur + 1);
    lbClose?.addEventListener('click', onClose);
    lbPrev?.addEventListener('click', onPrev);
    lbNext?.addEventListener('click', onNext);
    const onLbClick = (e: Event) => {
      if (e.target === lb) closeLB();
    };
    lb?.addEventListener('click', onLbClick);
    const onKeydown = (e: KeyboardEvent) => {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') showLB(cur - 1);
      if (e.key === 'ArrowRight') showLB(cur + 1);
    };
    document.addEventListener('keydown', onKeydown);

    /* cleanup */
    return () => {
      window.removeEventListener('scroll', onScroll);
      burger?.removeEventListener('click', openMenu);
      mclose?.removeEventListener('click', closeMenu);
      mmenuLinks.forEach((a) => a.removeEventListener('click', closeMenu));
      io?.disconnect();
      hio?.disconnect();
      faqHandlers.forEach(({ q, fn }) => q.removeEventListener('click', fn));
      if (form && formHandler) form.removeEventListener('submit', formHandler);
      figHandlers.forEach(({ f, fn }) => f.removeEventListener('click', fn));
      lbClose?.removeEventListener('click', onClose);
      lbPrev?.removeEventListener('click', onPrev);
      lbNext?.removeEventListener('click', onNext);
      lb?.removeEventListener('click', onLbClick);
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* ============ NAV ============ */}
      <header className="nav" id="nav">
        {/* O logo da Imobiliária Japi saiu daqui e a marca virou texto, porque o
            que existia era a marca da imobiliária e não a do empreendimento. Com o
            logo próprio enviado pela Lotus em 28/08/2026, a marca volta a ser
            imagem. É a versão negativa: o nav é transparente sobre o hero escuro e
            fica rgba(9,27,32,.9) ao rolar, então é branco nos dois estados. */}
        <a className="nav__brand" href="#top" aria-label="Portal dos Lagos">
          <img
            className="nav__logo"
            src="/portal-dos-lagos/logo.png"
            alt="Portal dos Lagos"
            width={774}
            height={456}
          />
        </a>
        <nav className="nav__links">
          <a href="#localizacao">Localização</a>
          <a href="#lazer">Lazer</a>
          <a href="#diferenciais">Diferenciais</a>
          <a href="#galeria">Galeria</a>
          <a href="#realizacao">Quem realiza</a>
        </nav>
        <div className="nav__cta">
          <span className="nav__phone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"></path></svg>
            11 92614-3393
          </span>
          <a className="btn" href="#contato" data-cta="nav">Falar com consultor</a>
        </div>
        <button className="nav__burger" id="burger" aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
        </button>
      </header>

      {/* mobile menu */}
      <div className="mmenu" id="mmenu">
        <div className="mmenu__top">
          <span className="nav__brand">Portal dos Lagos</span>
          <button className="mmenu__close" id="mclose" aria-label="Fechar menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav>
          <a href="#localizacao">Localização</a>
          <a href="#lazer">Lazer &amp; Convivência</a>
          <a href="#diferenciais">Diferenciais</a>
          <a href="#galeria">Galeria</a>
          <a href="#realizacao">Quem realiza</a>
          <a href="#contato"><span className="script">fale conosco</span> Receber valores</a>
        </nav>
        <div className="mmenu__foot">
          <a className="btn btn--wa btn--block" href="#" data-wa="menu">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.41-3.15-.66-2.65-1.07-4.3-3.78-4.43-3.96-.13-.18-1.06-1.4-1.06-2.68 0-1.28.67-1.9.91-2.17.24-.26.52-.33.7-.33l.5.01c.16 0 .38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.1.18-.15.3-.29.46l-.43.5c-.14.14-.29.3-.12.58.16.27.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.27.14.43.11.59-.07.16-.18.69-.8.87-1.08.18-.27.36-.22.59-.13.24.09 1.52.72 1.78.85.27.13.44.2.5.31.07.11.07.62-.17 1.3Z"></path></svg>
            WhatsApp da Japi
          </a>
        </div>
      </div>

      <a id="top"></a>

      {/* ============ HERO ============ */}
      <section className="hero" id="hero">
        <div className="hero__bg" id="heroBg" style={{ backgroundImage: 'url("/portal-dos-lagos/a001.jpg")' }}></div>
        <div className="hero__inner">
          <div className="hero__lockup reveal in">
            <div className="lockup">
              <div className="lockup__mark">
                <svg viewBox="0 0 32 32" fill="none"><path d="M3 21 11 9.5 16 16 21 7.5 29 21Z" fill="#0c2429"></path><path d="M3.5 24.5C9 21.5 23 21.5 28.5 24.5" stroke="#0c2429" strokeWidth="1.6" strokeLinecap="round"></path></svg>
              </div>
              <div className="lockup__txt">
                <span className="lockup__name">PORTAL DOS LAGOS</span>
                <span className="lockup__sub">LOTEAMENTO RESIDENCIAL</span>
              </div>
            </div>
          </div>
          <p className="eyebrow on-dark reveal in" data-d="1">Jundiaí · SP {' '},{' '} Lançamento</p>
          <h1 className="reveal in" data-d="1" id="heroH1"><span className="script">Respire a leveza da vida</span> em um loteamento feito para você</h1>
          <p className="hero__sub reveal in" data-d="2">Um verdadeiro clube imerso na natureza, com lagos, áreas verdes e infraestrutura de alto padrão, a 45 minutos da capital paulista, no coração de Jundiaí.</p>
          <div className="hero__cta reveal in" data-d="3">
            <a className="btn btn--lg" href="#contato" data-cta="hero">Quero saber valores <span className="ar">→</span></a>
            <a className="btn btn--ghost btn--lg" href="#localizacao">Ver localização</a>
          </div>
          <div className="hero__trust reveal in" data-d="3">
            <span>Realização</span>
            {/* Só a Santa Angela no hero (recorte de a002.jpg). O lockup com as
                três construtoras segue na seção REALIZAÇÃO, mais abaixo. */}
            <img src="/portal-dos-lagos/santa-angela.jpg" alt="Santa Angela Construtora" />
          </div>
        </div>
        <a className="hero__scroll" href="#destaques" aria-label="Rolar">
          <span className="mouse"></span>
          Explore
        </a>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats" id="destaques">
        <div className="stats__grid">
          <div className="stat reveal"><div className="stat__n">45<small> min</small></div><div className="stat__l">da capital paulista, no eixo SP–Campinas</div></div>
          <div className="stat reveal" data-d="1"><div className="stat__n">+17</div><div className="stat__l">itens de lazer em um clube completo</div></div>
          <div className="stat reveal" data-d="2"><div className="stat__n">24h</div><div className="stat__l">portaria blindada nível IIIA e monitoramento</div></div>
          <div className="stat reveal" data-d="3"><div className="stat__n">100%</div><div className="stat__l">energia elétrica subterrânea e infra premium</div></div>
        </div>
      </section>

      {/* ============ INTRO / EMPREENDIMENTO ============ */}
      <section className="section" id="empreendimento">
        <div className="wrap split">
          <div className="copy reveal">
            <p className="eyebrow">O empreendimento</p>
            <h2 className="h-sec"><span className="script">Um clube</span> para viver todos os dias</h2>
            <p className="lede">No Portal dos Lagos, cada espaço e cada caminho levam a um lugar único, projetado para encantar. Quadras, piscina, campo, academia ao ar livre e pet place compõem um verdadeiro clube imerso em uma área repleta de natureza.</p>
            <p style={{ marginTop: '16px', color: 'var(--ink-soft)' }}>Árvores e palmeiras exóticas surpreendem com diferentes cores e texturas, enquanto trilhas e praças desenham formas orgânicas, dando ao passeio um tom de descobertas e novas sensações.</p>
            <div className="ticks">
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Lotes para você construir o projeto dos seus sonhos</div>
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Natureza, lagos e paisagismo assinado em todo o entorno</div>
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Segurança e tecnologia de ponta na entrada e nas áreas comuns</div>
            </div>
            <a className="btn" href="#lazer" style={{ marginTop: '30px' }}>Conhecer a estrutura <span className="ar">→</span></a>
          </div>
          <div className="split__media frame-stack reveal" data-d="1">
            <img src="/portal-dos-lagos/a003.jpg" alt="Espaço fitness do Portal dos Lagos" />
            <img className="f2" src="/portal-dos-lagos/a004.jpg" alt="Salão de festas" />
            <span className="tag">Obra entregue</span>
          </div>
        </div>
      </section>

      {/* ============ LOCALIZAÇÃO ============ */}
      <section className="section loc" id="localizacao">
        <div className="wrap">
          <div className="split split--rev">
            <div className="split__media reveal">
              <img src="/portal-dos-lagos/a005.jpg" alt="Portaria do Portal dos Lagos" style={{ aspectRatio: '3/3.4' }} />
              <span className="tag">Jundiaí · SP</span>
            </div>
            <div className="copy reveal" data-d="1">
              <p className="eyebrow">Localização</p>
              <h2 className="h-sec">Jundiaí, a cidade perfeita para <span className="script">qualidade de vida</span></h2>
              <p className="lede">A cidade fica a 45 minutos da capital paulista, no eixo entre São Paulo e Campinas, localização ideal para quem busca qualidade de vida sem perder as oportunidades da capital.</p>
              <p style={{ marginTop: '16px', color: 'var(--ink-soft)' }}>Mais do que uma boa localização, Jundiaí tem história para contar: a Rota da Uva é ideal para os amantes do bom vinho e da boa comida, e a cidade é cercada pela Serra do Japi, onde é possível conhecer de perto a exuberância da Mata Atlântica.</p>
              <div className="dist-grid">
                <div className="dist"><div className="dist__t">Rod. Anhanguera</div><div className="dist__v">22 min<small>aprox. 11,1 km</small></div></div>
                <div className="dist"><div className="dist__t">Rod. dos Bandeirantes</div><div className="dist__v">16 min<small>aprox. 8,6 km</small></div></div>
                <div className="dist"><div className="dist__t">Rod. João Cereser</div><div className="dist__v">12 min<small>aprox. 7 km</small></div></div>
                <div className="dist"><div className="dist__t">Rod. Eng. C. Cintra</div><div className="dist__v">19 min<small>aprox. 12,6 km</small></div></div>
              </div>
            </div>
          </div>
          <figure className="map-card reveal" data-d="1">
            <figcaption>Entorno do empreendimento · colégios, vinícolas e comércio próximos</figcaption>
            <img src="/portal-dos-lagos/a006.jpg" alt="Mapa de localização do Portal dos Lagos e pontos de interesse no entorno" />
          </figure>
        </div>
      </section>

      {/* ============ LAZER ============ */}
      <section className="section amen" id="lazer">
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '720px', marginInline: 'auto' }}>
            <p className="eyebrow center">Lazer &amp; Convivência</p>
            <h2 className="h-sec">Tudo o que a sua família precisa, <span className="script">do lado de casa</span></h2>
            <p className="lede mx-auto" style={{ marginTop: '14px' }}>Um clube com lazer para todas as idades, pensado para o conforto, o convívio e a presença do verde em cada detalhe.</p>
          </div>

          <div className="amen-gallery reveal" data-d="1">
            <figure className="g-a" data-full="img/real-salao3.jpg" data-cap="Salão de Festas">
              <img src="/portal-dos-lagos/a007.jpg" alt="Salão de festas" />
              <figcaption><span>Convívio</span>Salão de Festas</figcaption>
            </figure>
            <figure className="g-b" data-full="img/real-fitness.jpg" data-cap="Espaço Fitness">
              <img src="/portal-dos-lagos/a003.jpg" alt="Espaço fitness" />
              <figcaption><span>Bem-estar</span>Espaço Fitness</figcaption>
            </figure>
            <figure className="g-c" data-full="img/real-praca.jpg" data-cap="Praças e Jardins">
              <img src="/portal-dos-lagos/a008.jpg" alt="Praças e jardins" />
              <figcaption><span>Natureza</span>Praças &amp; Jardins</figcaption>
            </figure>
            <figure className="g-d" data-full="img/real-convivencia.jpg" data-cap="Áreas de Convivência">
              <img src="/portal-dos-lagos/a009.jpg" alt="Áreas de convivência" />
              <figcaption><span>Lazer</span>Convivência</figcaption>
            </figure>
            <figure className="g-d" data-full="img/real-salao2.jpg" data-cap="Salão · Lounge">
              <img src="/portal-dos-lagos/a010.jpg" alt="Lounge do salão de festas" />
              <figcaption><span>Eventos</span>Salão · Lounge</figcaption>
            </figure>
          </div>

          <div className="amen-list reveal" data-d="1">
            <div className="amen-list__head">
              <h3><span className="script">Estrutura completa</span> de lazer e convivência</h3>
            </div>
            <div className="chips">
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Salão de festas</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Piscina adulto e infantil</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Espaço fitness (yoga, pilates e academia)</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Fitness externo</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Playground Kids</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Playground baby</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Brinquedoteca</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Pet Place</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> 2 Churrasqueiras</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Espaço gourmet</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Praças</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Campo gramado</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Quadra de beach tênis c/ arquibancada</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Quadra de tênis</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Pista de caminhada</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Paraciclo</div>
              <div className="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Portaria 24h</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section className="section diff" id="diferenciais">
        <div className="diff__bg" style={{ backgroundImage: 'url("/portal-dos-lagos/a011.jpg")' }}></div>
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '760px', marginInline: 'auto' }}>
            <p className="eyebrow center on-dark">Diferenciais</p>
            <h2 className="h-sec">Infraestrutura e tecnologia <span className="script">de alto padrão</span></h2>
            <p className="lede mx-auto" style={{ color: 'rgba(255,255,255,.78)', marginTop: '14px' }}>Cada detalhe foi pensado para entregar segurança, conforto e valorização ao seu patrimônio.</p>
          </div>
          <div className="diff-grid reveal" data-d="1">
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"></path></svg></div><h4>Energia 100% subterrânea</h4><p>Rede elétrica subterrânea para mais segurança e uma paisagem livre de fios.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"></path></svg></div><h4>Portaria blindada nível IIIA</h4><p>Portaria climatizada, blindada e com monitoramento por câmeras 24 horas.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="9" r="3.2"></circle><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"></path></svg></div><h4>Controle de acesso inteligente</h4><p>Reconhecimento facial, tags e QR Code para uma entrada prática e segura.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12a7 7 0 0 1 14 0"></path><path d="M2 12a10 10 0 0 1 20 0"></path><circle cx="12" cy="13" r="2"></circle></svg></div><h4>Internet de ultra velocidade</h4><p>Infraestrutura para dados e conectividade de alta performance.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h4l3-3v14l-3-3H3z"></path><path d="M16 9a4 4 0 0 1 0 6"></path></svg></div><h4>Som no salão e gourmet</h4><p>Sistema de som integrado nas áreas de festa e convivência.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 16a5 5 0 0 1 1-9.5A6 6 0 0 1 17 7a4 4 0 0 1 1 8H6"></path><path d="M8 19h2M14 19h2"></path></svg></div><h4>Piscina climatizável</h4><p>Piscina adulto e infantil com infraestrutura para climatização.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="17" r="3"></circle><circle cx="18" cy="17" r="3"></circle><path d="M6 17 10 7h4l2 4h2"></path></svg></div><h4>Bike Sharing</h4><p>Sistema de bicicletas compartilhadas e paraciclo para o dia a dia.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9h18l-1.5 11h-15z"></path><path d="M3 9 5 4h14l2 5"></path><path d="M9 13v3M15 13v3"></path></svg></div><h4>Infra para mini mercado</h4><p>Estrutura prevista para a implantação de um mini mercado no condomínio.</p></div>
            <div className="diff-item"><div className="diff-item__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div><h4>Áreas comuns equipadas</h4><p>Espaços entregues equipados e decorados, prontos para usar.</p></div>
          </div>
          <div className="cert-strip reveal" data-d="2">
            <span>PBQP-H Nível A</span>
            <span>NBR 15575 Desempenho</span>
            <span>NBR 9050 Acessibilidade</span>
            <span>NBR 16071 Playground</span>
            <span>ISO 9001:2015</span>
          </div>
        </div>
      </section>

      {/* ============ PAISAGISMO / DECORAÇÃO ============ */}
      <section className="section credits">
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '680px', marginInline: 'auto' }}>
            <p className="eyebrow center">Assinaturas do projeto</p>
            <h2 className="h-sec">Paisagismo e decoração <span className="script">que encantam</span></h2>
          </div>
          <div className="cred-cards">
            <article className="cred reveal" data-d="1">
              <img src="/portal-dos-lagos/a008.jpg" alt="Paisagismo das praças e jardins" />
              <div className="cred__b">
                <p className="cred__role">Paisagismo</p>
                <p className="cred__name">Marcelo Novaes <b>Arquitetura Paisagística</b></p>
                <p>Caminhos percorrem todo o espaço, ligando áreas esportivas, de convívio e relaxamento. Árvores e palmeiras exóticas surpreendem com diferentes cores e texturas, desenhando formas orgânicas ao redor de praças e trilhas.</p>
              </div>
            </article>
            <article className="cred reveal" data-d="2">
              <img src="/portal-dos-lagos/a004.jpg" alt="Decoração das áreas comuns" />
              <div className="cred__b">
                <p className="cred__role">Decoração · Linha Paralela</p>
                <p className="cred__name">Caroline Barreto</p>
                <blockquote>“Ambientes aconchegantes e com personalidade, seguindo a mesma linguagem e paleta cromática em todas as áreas.”</blockquote>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ GALERIA ============ */}
      <section className="section amen" id="galeria" style={{ background: 'var(--cream)' }}>
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '680px', marginInline: 'auto' }}>
            <p className="eyebrow center">Galeria</p>
            <h2 className="h-sec">Perspectivas do <span className="script">Portal dos Lagos</span></h2>
            <p className="lede mx-auto" style={{ marginTop: '14px' }}>Imagens ilustrativas do empreendimento e de suas áreas de lazer.</p>
          </div>
          <div className="amen-gallery reveal" data-d="1" id="galGrid">
            <figure className="g-a" data-full="img/real-portaria-wide.jpg" data-cap="Portaria principal"><img src="/portal-dos-lagos/a012.jpg" alt="Portaria" /><figcaption><span>Acesso</span>Portaria principal</figcaption></figure>
            <figure className="g-c" data-full="img/real-fitness.jpg" data-cap="Espaço Fitness"><img src="/portal-dos-lagos/a003.jpg" alt="Espaço fitness" /><figcaption><span>Bem-estar</span>Espaço Fitness</figcaption></figure>
            <figure className="g-c" data-full="img/real-salao.jpg" data-cap="Salão de Festas"><img src="/portal-dos-lagos/a004.jpg" alt="Salão de festas" /><figcaption><span>Convívio</span>Salão de Festas</figcaption></figure>
            <figure className="g-d" data-full="img/real-convivencia.jpg" data-cap="Convivência"><img src="/portal-dos-lagos/a009.jpg" alt="Convivência" /><figcaption><span>Lazer</span>Convivência</figcaption></figure>
            <figure className="g-d" data-full="img/real-praca.jpg" data-cap="Praças e jardins"><img src="/portal-dos-lagos/a008.jpg" alt="Praças" /><figcaption><span>Natureza</span>Praças &amp; Jardins</figcaption></figure>
            <figure className="g-d" data-full="img/real-portaria-acesso.jpg" data-cap="Entrada do condomínio"><img src="/portal-dos-lagos/a005.jpg" alt="Entrada" /><figcaption><span>Chegada</span>Entrada do condomínio</figcaption></figure>
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="ctaband">
        <div className="ctaband__bg" style={{ backgroundImage: 'url("/portal-dos-lagos/a013.jpg")', backgroundPosition: 'center 58%' }}></div>
        <div className="wrap reveal">
          <h2><span className="script">O seu próximo capítulo</span> começa aqui</h2>
          <p>Garanta as melhores condições do lançamento. Fale agora com um consultor e receba valores, plantas e disponibilidade de lotes.</p>
          <div className="hero__cta">
            <a className="btn btn--lg" href="#contato" data-cta="band">Receber valores agora <span className="ar">→</span></a>
            <a className="btn btn--wa btn--lg" href="#" data-wa="band">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.41-3.15-.66-2.65-1.07-4.3-3.78-4.43-3.96-.13-.18-1.06-1.4-1.06-2.68 0-1.28.67-1.9.91-2.17.24-.26.52-.33.7-.33l.5.01c.16 0 .38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.1.18-.15.3-.29.46l-.43.5c-.14.14-.29.3-.12.58.16.27.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.27.14.43.11.59-.07.16-.18.69-.8.87-1.08.18-.27.36-.22.59-.13.24.09 1.52.72 1.78.85.27.13.44.2.5.31.07.11.07.62-.17 1.3Z"></path></svg>
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============ LEAD FORM ============ */}
      <section className="section lead" id="contato">
        <div className="wrap lead__grid">
          <div className="reveal">
            <p className="eyebrow on-dark">Fale com a Japi</p>
            <h2><span className="script">Receba valores</span> e condições</h2>
            <p className="lede" style={{ color: 'rgba(255,255,255,.82)', marginTop: '8px' }}>Preencha os dados e um consultor entra em contato pelo WhatsApp com todas as informações do Portal dos Lagos.</p>
            <div className="lead__list">
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Atendimento personalizado, sem compromisso</div>
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Tabela de valores, plantas e disponibilidade</div>
              <div className="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6 9 17l-5-5"></path></svg> Condições especiais de lançamento</div>
            </div>
          </div>
          <div className="form-card reveal" data-d="1">
            <form id="leadForm" noValidate>
              <h3>Quero conhecer o Portal dos Lagos</h3>
              <p className="sm">Resposta rápida via WhatsApp.</p>
              <div className="field">
                <label htmlFor="nome">Nome completo</label>
                <input id="nome" name="nome" type="text" autoComplete="name" placeholder="Seu nome" required />
              </div>
              <div className="field--row">
                <div className="field">
                  <label htmlFor="tel">WhatsApp / Telefone</label>
                  <input id="tel" name="tel" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" required />
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="interesse">Interesse</label>
                <select id="interesse" name="interesse">
                  <option>Quero saber valores e condições</option>
                  <option>Tenho interesse em um lote para construir</option>
                  <option>Quero agendar uma visita</option>
                  <option>Sou corretor(a) / parceria</option>
                </select>
              </div>
              <button className="btn btn--lg btn--block" type="submit">Enviar pelo WhatsApp
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '19px', height: '19px' }}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.41-3.15-.66-2.65-1.07-4.3-3.78-4.43-3.96-.13-.18-1.06-1.4-1.06-2.68 0-1.28.67-1.9.91-2.17.24-.26.52-.33.7-.33l.5.01c.16 0 .38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.1.18-.15.3-.29.46l-.43.5c-.14.14-.29.3-.12.58.16.27.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.27.14.43.11.59-.07.16-.18.69-.8.87-1.08.18-.27.36-.22.59-.13.24.09 1.52.72 1.78.85.27.13.44.2.5.31.07.11.07.62-.17 1.3Z"></path></svg>
              </button>
              <p className="form-note">Ao enviar, você abre uma conversa no WhatsApp. Não compartilhamos seus dados.</p>
            </form>
            <div className="form-ok" id="formOk">
              <div className="ok-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"></path></svg></div>
              <h3>Abrindo o WhatsApp…</h3>
              <p className="sm" style={{ marginTop: '8px' }}>Se o aplicativo não abrir automaticamente, <a id="okLink" href="#" style={{ color: 'var(--gold-deep)', fontWeight: 600 }}>clique aqui</a>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section faq">
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '620px', marginInline: 'auto' }}>
            <p className="eyebrow center">Dúvidas frequentes</p>
            <h2 className="h-sec">Perguntas <span className="script">e respostas</span></h2>
          </div>
          <div className="faq-list reveal" data-d="1">
            <div className="faq-item">
              <button className="faq-q">Onde fica o Portal dos Lagos? <span className="pm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg></span></button>
              <div className="faq-a"><div className="faq-a__in">Em Jundiaí/SP, a cerca de 45 minutos da capital paulista, no eixo entre São Paulo e Campinas, próximo à Serra do Japi e à Rota da Uva, com fácil acesso às principais rodovias da região.</div></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">É um loteamento fechado com portaria? <span className="pm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg></span></button>
              <div className="faq-a"><div className="faq-a__in">Sim. Conta com portaria blindada nível IIIA, climatizada, monitoramento por câmeras 24h e controle de acesso inteligente com reconhecimento facial, tags e QR Code.</div></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">Quais itens de lazer fazem parte do clube? <span className="pm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg></span></button>
              <div className="faq-a"><div className="faq-a__in">Piscina adulto e infantil, quadras de tênis e beach tênis, campo gramado, espaço fitness, salão de festas, espaço gourmet, churrasqueiras, brinquedoteca, pet place, praças, pista de caminhada e mais, são +17 itens de lazer.</div></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">Quem são as empresas responsáveis? <span className="pm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg></span></button>
              <div className="faq-a"><div className="faq-a__in">Realização de Santa Angela Construtora, Capital Empreendimentos e Participações e Mac Lucer Empreendimentos, com paisagismo de Marcelo Novaes e decoração de Caroline Barreto (Linha Paralela).</div></div>
            </div>
            <div className="faq-item">
              <button className="faq-q">Como recebo valores e condições? <span className="pm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg></span></button>
              <div className="faq-a"><div className="faq-a__in">Preencha o formulário desta página ou fale com um consultor pelo WhatsApp. Os valores são informados sob consulta, conforme a disponibilidade de lotes.</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ REALIZAÇÃO ============ */}
      <section className="section realiza" id="realizacao">
        <div className="wrap">
          <div className="center reveal" style={{ maxWidth: '640px', marginInline: 'auto' }}>
            <p className="eyebrow center">Quem realiza</p>
            <h2 className="h-sec">Tradição e qualidade <span className="script">comprovadas</span></h2>
          </div>
          <div className="realiza__logos reveal" data-d="1">
            <img src="/portal-dos-lagos/a002.jpg" alt="Santa Angela Construtora, Capital Empreendimentos e Mac Lucer" />
          </div>
          <div className="realiza__cards reveal" data-d="1">
            <div className="rc"><b>Santa Angela Construtora</b><p><span className="yr">+35 anos</span> presentes em Jundiaí, Americana e Itatiba. Certificações PBQP-H nível A e ISO 9001:2015.</p></div>
            <div className="rc"><b>Capital Empreendimentos</b><p><span className="yr">+35 anos</span> de atuação, com destaque no segmento de loteamentos residenciais e incorporação.</p></div>
            <div className="rc"><b>Mac Lucer Empreendimentos</b><p><span className="yr">+25 anos</span> no mercado. Empresa familiar reconhecida pela qualidade dos seus projetos.</p></div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div>
              <p style={{ maxWidth: '34ch' }}>Especialistas em empreendimentos de alto padrão na região de Jundiaí. Atendimento consultivo do primeiro contato à chave na mão.</p>
              <a className="footer__wa" href="#" data-wa="footer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.41-3.15-.66-2.65-1.07-4.3-3.78-4.43-3.96-.13-.18-1.06-1.4-1.06-2.68 0-1.28.67-1.9.91-2.17.24-.26.52-.33.7-.33l.5.01c.16 0 .38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.1.18-.15.3-.29.46l-.43.5c-.14.14-.29.3-.12.58.16.27.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.27.14.43.11.59-.07.16-.18.69-.8.87-1.08.18-.27.36-.22.59-.13.24.09 1.52.72 1.78.85.27.13.44.2.5.31.07.11.07.62-.17 1.3Z"></path></svg>
                +55 11 92614-3393
              </a>
            </div>
            <div className="footer__col">
              <h5>Navegação</h5>
              <a href="#localizacao">Localização</a>
              <a href="#lazer">Lazer &amp; Convivência</a>
              <a href="#diferenciais">Diferenciais</a>
              <a href="#galeria">Galeria</a>
              <a href="#realizacao">Quem realiza</a>
            </div>
            <div className="footer__col">
              <h5>O empreendimento</h5>
              <a href="#contato">Receber valores</a>
              <a href="#empreendimento">Sobre o clube</a>
              <a href="#contato">Agendar visita</a>
              <a href="#top">Topo da página</a>
            </div>
          </div>
          <p className="legal">
            As informações constantes no Memorial de Incorporação e nos futuros Instrumentos de Compra e Venda prevalecerão sobre as divulgadas neste material. Todas as imagens e perspectivas aqui contidas são meramente ilustrativas. As tonalidades das cores, formas e texturas podem sofrer alterações. A vegetação exposta é meramente ilustrativa e será entregue de acordo com o Projeto Paisagístico, podendo apresentar diferenças de tamanho e porte. Registro nº R3 feito no 1º Cartório de Registro de Imóveis de Jundiaí-SP, sobre matrícula nº 169.626 (protocolo nº 447.596).
          </p>
          <div className="legal__bar">
            <span>© <span id="yr"></span> Portal dos Lagos</span>
            <span>Realização: Santa Angela · Capital · Mac Lucer</span>
          </div>
        </div>
      </footer>

      {/* floating + sticky */}
      <button className="fab" id="fab" aria-label="WhatsApp" data-wa="fab"><span className="fab__pulse"></span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.41-3.15-.66-2.65-1.07-4.3-3.78-4.43-3.96-.13-.18-1.06-1.4-1.06-2.68 0-1.28.67-1.9.91-2.17.24-.26.52-.33.7-.33l.5.01c.16 0 .38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.1.18-.15.3-.29.46l-.43.5c-.14.14-.29.3-.12.58.16.27.74 1.21 1.58 1.96 1.09.97 2 1.27 2.28 1.42.27.14.43.11.59-.07.16-.18.69-.8.87-1.08.18-.27.36-.22.59-.13.24.09 1.52.72 1.78.85.27.13.44.2.5.31.07.11.07.62-.17 1.3Z"></path></svg>
      </button>

      <div className="mbar" id="mbar">
        <a className="btn" href="#contato" data-cta="mbar">Receber valores</a>
        <a className="btn btn--wa" href="#" data-wa="mbar" style={{ flex: '0 0 auto', padding: '14px 18px' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Z"></path></svg>
        </a>
      </div>

      {/* lightbox */}
      <div className="lb" id="lb">
        <button className="lb__close" id="lbClose" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>
        <button className="lb__nav prev" id="lbPrev" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18 9 12l6-6"></path></svg></button>
        <img id="lbImg" alt="" />
        <button className="lb__nav next" id="lbNext" aria-label="Próxima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"></path></svg></button>
        <div className="lb__cap" id="lbCap"></div>
      </div>
    </>
  );
}
