'use client';

/**
 * ResortPrime — porte 1:1 de resort-prime/index.html (formato CSS-class, NAO dc-runtime).
 * Visual e comportamento identicos ao estatico. Textos/imagens/links exatos.
 *
 * Convencoes de porte:
 *  - class= -> className= ; markup <style> do <head> foi para app/resort-prime/resort-prime.css.
 *  - Imagens locais aNNN.* -> /resort-prime/aNNN.* (public/resort-prime/).
 *  - Imagens CDN externas (nenhuma nesta pagina) seriam mantidas literais.
 *  - Interatividade de a027.js (header sticky, menu mobile, reveal, mascara de
 *    telefone, forms->WhatsApp, lightbox) reimplementada 1:1 num unico useEffect
 *    que opera sobre o DOM montado, escopado ao rootRef (nao vaza pra fora da rota).
 */

import { useEffect, useRef } from 'react';
import { sendLead } from '@/lib/lead';

export default function ResortPrime() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const WA_NUMBER = '5511926143393'; // +55 11 92614-3393

    const cleanups: Array<() => void> = [];
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];

    /* ---------- Sticky header ---------- */
    const header = root.querySelector('.header') as HTMLElement | null;
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
    onScroll();

    /* ---------- Mobile menu ---------- */
    const burger = root.querySelector('.burger') as HTMLElement | null;
    const mmenu = root.querySelector('.mobile-menu') as HTMLElement | null;
    const mclose = root.querySelector('.mobile-menu__close') as HTMLElement | null;
    function openM() {
      if (mmenu) mmenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeM() {
      if (mmenu) mmenu.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (burger) {
      burger.addEventListener('click', openM);
      cleanups.push(() => burger.removeEventListener('click', openM));
    }
    if (mclose) {
      mclose.addEventListener('click', closeM);
      cleanups.push(() => mclose.removeEventListener('click', closeM));
    }
    root.querySelectorAll('.mobile-menu a').forEach((a) => {
      a.addEventListener('click', closeM);
      cleanups.push(() => a.removeEventListener('click', closeM));
    });

    /* ---------- Reveal on scroll (robusto, sem depender de IO) ---------- */
    const reveals = Array.prototype.slice.call(
      root.querySelectorAll('.reveal'),
    ) as HTMLElement[];
    function checkReveal() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = 0; i < reveals.length; i++) {
        const el = reveals[i];
        if (el.classList.contains('in')) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
      }
    }
    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal);
    cleanups.push(() => window.removeEventListener('scroll', checkReveal));
    cleanups.push(() => window.removeEventListener('resize', checkReveal));
    checkReveal();
    // failsafe: garante layout final correto mesmo em iframes com transicao congelada
    timeouts.push(setTimeout(checkReveal, 300));
    timeouts.push(
      setTimeout(function () {
        reveals.forEach(function (el) {
          el.classList.add('in');
          el.style.transition = 'none';
          el.style.transform = 'none';
        });
      }, 1800),
    );

    /* ---------- Phone mask (BR) ---------- */
    function maskPhone(v: string) {
      v = v.replace(/\D/g, '').slice(0, 11);
      if (v.length <= 2) return v.length ? '(' + v : v;
      if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
      if (v.length <= 10)
        return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
      return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    }
    root.querySelectorAll('input[data-phone]').forEach((inpEl) => {
      const inp = inpEl as HTMLInputElement;
      const handler = function () {
        inp.value = maskPhone(inp.value);
      };
      inp.addEventListener('input', handler);
      cleanups.push(() => inp.removeEventListener('input', handler));
    });

    /* ---------- Forms: validacao + WhatsApp ---------- */
    root.querySelectorAll('form[data-ok]').forEach((formEl) => {
      const form = formEl as HTMLFormElement;
      const submitHandler = function (ev: Event) {
        ev.preventDefault();
        let ok = true;
        form.querySelectorAll('[data-required]').forEach((inpEl) => {
          const inp = inpEl as HTMLInputElement;
          const fieldEl = inp.closest('.field');
          const val = inp.value.trim();
          let valid = true;
          if (!val) valid = false;
          if (
            inp.type === 'email' &&
            val &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          )
            valid = false;
          if (
            inp.hasAttribute('data-phone') &&
            val.replace(/\D/g, '').length < 10
          )
            valid = false;
          if (!valid) {
            if (fieldEl) fieldEl.classList.add('invalid');
            ok = false;
          } else if (fieldEl) fieldEl.classList.remove('invalid');
        });
        if (!ok) return;

        const nome =
          (form.querySelector('[name=nome]') as HTMLInputElement | null)?.value ||
          '';
        const email =
          (form.querySelector('[name=email]') as HTMLInputElement | null)
            ?.value || '';
        const tel =
          (form.querySelector('[name=telefone]') as HTMLInputElement | null)
            ?.value || '';
        const unidadeEl = form.querySelector(
          '[name=unidade]',
        ) as HTMLInputElement | null;
        const unidade = unidadeEl ? unidadeEl.value : '';

        sendLead({
          name: nome,
          phone: tel,
          email,
          source: 'landing_resort-prime',
          interest: 'Resort Prime Santa Angela',
        });

        let msg =
          'Olá! Tenho interesse no Resort Prime Santa Angela e gostaria de agendar uma visita.%0A%0A' +
          '*Nome:* ' +
          encodeURIComponent(nome) +
          '%0A' +
          '*E-mail:* ' +
          encodeURIComponent(email) +
          '%0A' +
          '*Telefone:* ' +
          encodeURIComponent(tel);
        if (unidade) msg += '%0A*Tipo de unidade:* ' + encodeURIComponent(unidade);

        const okBox = form.getAttribute('data-ok')
          ? (root.querySelector(
              '#' + form.getAttribute('data-ok'),
            ) as HTMLElement | null)
          : null;
        if (okBox) {
          form.style.display = 'none';
          okBox.style.display = 'block';
        }
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + msg, '_blank');
      };
      form.addEventListener('submit', submitHandler);
      cleanups.push(() => form.removeEventListener('submit', submitHandler));

      form.querySelectorAll('input, select').forEach((inpEl) => {
        const inp = inpEl as HTMLElement;
        const inputHandler = function () {
          const f = inp.closest('.field');
          if (f) f.classList.remove('invalid');
        };
        inp.addEventListener('input', inputHandler);
        cleanups.push(() => inp.removeEventListener('input', inputHandler));
      });
    });

    /* ---------- Lightbox galeria ---------- */
    const lb = root.querySelector('#lightbox') as HTMLElement | null;
    const lbImg = lb ? (lb.querySelector('img') as HTMLImageElement | null) : null;
    const lbCap = lb
      ? (lb.querySelector('.lightbox__cap') as HTMLElement | null)
      : null;
    const items = Array.prototype.slice.call(
      root.querySelectorAll('[data-lb]'),
    ) as HTMLElement[];
    let idx = 0;
    function showLb(i: number) {
      if (i < 0) i = items.length - 1;
      if (i >= items.length) i = 0;
      idx = i;
      const el = items[idx];
      if (lbImg) lbImg.src = el.getAttribute('data-lb') || '';
      if (lbCap) lbCap.textContent = el.getAttribute('data-cap') || '';
    }
    items.forEach((el, i) => {
      const handler = function () {
        showLb(i);
        if (lb) lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      };
      el.addEventListener('click', handler);
      cleanups.push(() => el.removeEventListener('click', handler));
    });
    if (lb) {
      const closeBtn = lb.querySelector('.lightbox__close') as HTMLElement | null;
      const nextBtn = lb.querySelector('.next') as HTMLElement | null;
      const prevBtn = lb.querySelector('.prev') as HTMLElement | null;
      const closeHandler = function () {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      };
      const nextHandler = function (e: Event) {
        e.stopPropagation();
        showLb(idx + 1);
      };
      const prevHandler = function (e: Event) {
        e.stopPropagation();
        showLb(idx - 1);
      };
      const bgHandler = function (e: MouseEvent) {
        if (e.target === lb) {
          lb.classList.remove('open');
          document.body.style.overflow = '';
        }
      };
      const keyHandler = function (e: KeyboardEvent) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') {
          lb.classList.remove('open');
          document.body.style.overflow = '';
        }
        if (e.key === 'ArrowRight') showLb(idx + 1);
        if (e.key === 'ArrowLeft') showLb(idx - 1);
      };
      if (closeBtn) {
        closeBtn.addEventListener('click', closeHandler);
        cleanups.push(() => closeBtn.removeEventListener('click', closeHandler));
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', nextHandler);
        cleanups.push(() => nextBtn.removeEventListener('click', nextHandler));
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', prevHandler);
        cleanups.push(() => prevBtn.removeEventListener('click', prevHandler));
      }
      lb.addEventListener('click', bgHandler);
      cleanups.push(() => lb.removeEventListener('click', bgHandler));
      document.addEventListener('keydown', keyHandler);
      cleanups.push(() => document.removeEventListener('keydown', keyHandler));
    }

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      cleanups.forEach((fn) => fn());
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="rp-root" ref={rootRef}>
      {/* ===================== Header ===================== */}
      <header className="header" data-screen-label="Header">
        <div className="wrap header__row">
          <a href="#topo" className="logo-img" aria-label="Resort Prime Santa Angela">
            <img className="l-white" src="/resort-prime/a003.png" alt="Resort Prime" />
            <img className="l-dark" src="/resort-prime/a001.png" alt="Resort Prime" />
          </a>
          <nav className="nav">
            <a href="#localizacao">Localização</a>
            <a href="#lazer">Lazer</a>
            <a href="#fitness">Fitness</a>
            <a href="#club">Club Prime</a>
            <a href="#plantas">Plantas</a>
            <a href="#diferenciais">Diferenciais</a>
          </nav>
          <div className="header__cta">
            <a
              href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Resort%20Prime%20Santa%20Angela."
              target="_blank"
              rel="noopener"
              className="btn btn-wa"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.405z"></path>
              </svg>
              WhatsApp
            </a>
            <a href="#agende" className="btn btn-primary">Agende sua visita</a>
            <button className="burger" aria-label="Abrir menu"><span></span></button>
          </div>
        </div>
      </header>

      {/* ===================== Menu mobile ===================== */}
      <div className="mobile-menu" id="mobile-menu">
        <div className="mobile-menu__top">
          <span className="logo-img"><img src="/resort-prime/a003.png" alt="Resort Prime" /></span>
          <button className="mobile-menu__close" aria-label="Fechar">×</button>
        </div>
        <nav>
          <a href="#localizacao">Localização</a>
          <a href="#lazer">Lazer</a>
          <a href="#fitness">Fitness</a>
          <a href="#club">Club Prime</a>
          <a href="#plantas">Plantas</a>
          <a href="#diferenciais">Diferenciais</a>
        </nav>
        <a href="#agende" className="btn btn-primary btn-block">Agende sua visita</a>
      </div>

      {/* ===================== Hero ===================== */}
      <section className="hero" id="topo" data-screen-label="Hero">
        <div className="hero__bg">
          <img src="/resort-prime/a012.jpg" alt="Piscina do Resort Prime Santa Angela ao pôr do sol" />
        </div>
        <div className="wrap hero__inner">
          <div className="hero__copy">
            <span className="hero__loc reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Engordadouro · Jundiaí / SP
            </span>
            <h1 className="reveal d1">Viva o estilo de vida Resort,<span className="script">todos os dias.</span></h1>
            <p className="hero__lead reveal d2">Um verdadeiro refúgio onde cada detalhe foi pensado para a sua família sentir o conforto de um resort de verdade — lazer, bem-estar e exclusividade, o ano inteiro.</p>
            <div className="hero__pills reveal d3">
              <span className="hero__pill"><b>4</b> Torres</span>
              <span className="hero__pill"><b>618</b> Unidades</span>
              <span className="hero__pill"><b>68 a 112</b> m²</span>
              <span className="hero__pill"><b>+20</b> itens de lazer</span>
            </div>
          </div>

          {/* Form de lead */}
          <div className="lead-card reveal d2" id="form-hero">
            <h3>Agende sua visita</h3>
            <p className="sub">Conheça o decorado e o lazer completo. Retornamos pelo WhatsApp.</p>
            <form id="lead-form" data-ok="form-hero-ok" noValidate>
              <div className="field">
                <label htmlFor="h-nome">Nome</label>
                <input id="h-nome" name="nome" type="text" placeholder="Seu nome completo" data-required="" />
                <span className="err">Informe seu nome.</span>
              </div>
              <div className="field">
                <label htmlFor="h-email">E-mail</label>
                <input id="h-email" name="email" type="email" placeholder="voce@email.com" data-required="" />
                <span className="err">Informe um e-mail válido.</span>
              </div>
              <div className="field">
                <label htmlFor="h-tel">Telefone / WhatsApp</label>
                <input id="h-tel" name="telefone" type="tel" placeholder="(11) 90000-0000" data-required="" data-phone="" />
                <span className="err">Informe um telefone válido.</span>
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.405z"></path></svg>
                Falar no WhatsApp
              </button>
              <p className="legal">Ao enviar, você concorda em receber contato sobre o empreendimento.</p>
            </form>
            <div className="form-ok" id="form-hero-ok" style={{ display: 'none' }}>
              <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg></div>
              <h3>Quase lá!</h3>
              <p>Abrimos o WhatsApp para você concluir o agendamento. Em breve nosso time retorna.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Stats ===================== */}
      <section className="stats">
        <div className="wrap stats__grid">
          <div className="stat reveal"><div className="stat__n">4</div><div className="stat__l">Torres</div></div>
          <div className="stat reveal d1"><div className="stat__n">618</div><div className="stat__l">Unidades</div></div>
          <div className="stat reveal d2"><div className="stat__n">68<span className="u">–</span>112<span className="u"> m²</span></div><div className="stat__l">Plantas</div></div>
          <div className="stat reveal d3"><div className="stat__n">+20</div><div className="stat__l">Itens de lazer</div></div>
        </div>
      </section>

      {/* ===================== Localização ===================== */}
      <section className="section section--cream" id="localizacao" data-screen-label="Localização">
        <div className="wrap loc">
          <div className="loc__media reveal">
            <img src="/resort-prime/a009.jpg" alt="Vista aérea do Resort Prime Santa Angela no bairro Engordadouro" />
            <div className="loc__addr">
              <span className="pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
              <div><b>Av. Caetano Gornati</b><span>Engordadouro — Jundiaí / SP</span></div>
            </div>
          </div>
          <div className="loc__copy">
            <span className="eyebrow reveal">Seu novo endereço</span>
            <h2 className="reveal d1">No melhor do Engordadouro, em Jundiaí</h2>
            <p className="reveal d2" style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '18px' }}>Uma região em crescimento que combina tranquilidade e contato com a natureza, sem perder o acesso à infraestrutura urbana — qualidade de vida para toda a família.</p>
            <ul className="loc__list">
              <li className="reveal d2"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20h10M10 20V9l5-4 5 4v11M3 20V13l4-3"></path></svg></span><div><b>Parque Engordadouro</b><span>Áreas verdes e lazer ao ar livre pertinho de casa.</span></div></li>
              <li className="reveal d3"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M2 17h20M7 21h10"></path></svg></span><div><b>Anhanguera e Bandeirantes</b><span>Fácil acesso às principais rodovias da região.</span></div></li>
              <li className="reveal d4"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg></span><div><b>Escolas e comércio pujante</b><span>Bairro seguro e completo para o dia a dia.</span></div></li>
            </ul>
            <iframe className="map-embed reveal" title="Mapa — Av. Caetano Gornati, Engordadouro, Jundiaí" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Av.%20Caetano%20Gornati%2C%20Engordadouro%2C%20Jundia%C3%AD%20-%20SP&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>
          </div>
        </div>
      </section>

      {/* ===================== Lazer ===================== */}
      <section className="section section--sand" id="lazer" data-screen-label="Lazer">
        <div className="wrap">
          <div className="shead center reveal">
            <span className="eyebrow center">Lazer de resort no seu dia a dia</span>
            <h2>Completo, moderno e pensado para conviver</h2>
            <p>Espaços projetados para promover interação, movimento e momentos em família — a comodidade de um resort, com organização e segurança o ano inteiro.</p>
          </div>

          <div className="gallery reveal d1">
            <div className="gcell g-w2 g-h2" data-lb="images/pool-day.jpg" data-cap="Piscina adulto e infantil">
              <img src="/resort-prime/a020.jpg" alt="Piscina do Resort Prime" />
              <span className="gcell__cap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-2 5-2 4 2 6 2 4-2 5-2 4 2 4 2M2 18s3-2 5-2 4 2 6 2 4-2 5-2 4 2 4 2"></path></svg>Piscina adulto e infantil</span>
            </div>
            <div className="gcell" data-lb="images/court-sport.jpg" data-cap="Quadra poliesportiva">
              <img src="/resort-prime/a018.jpg" alt="Quadra poliesportiva" />
              <span className="gcell__cap">Quadra poliesportiva</span>
            </div>
            <div className="gcell" data-lb="images/beach-tennis.jpg" data-cap="Quadra de Beach Tennis">
              <img src="/resort-prime/a008.jpg" alt="Quadra de Beach Tennis" />
              <span className="gcell__cap">Beach Tennis</span>
            </div>
            <div className="gcell g-w2" data-lb="images/walking-track.jpg" data-cap="Pista de caminhada">
              <img src="/resort-prime/a016.jpg" alt="Pista de caminhada" />
              <span className="gcell__cap">Pista de caminhada</span>
            </div>
            <div className="gcell" data-lb="images/playground.jpg" data-cap="Playground">
              <img src="/resort-prime/a011.jpg" alt="Playground" />
              <span className="gcell__cap">Playground</span>
            </div>
            <div className="gcell" data-lb="images/pet.jpg" data-cap="Espaço Pet">
              <img src="/resort-prime/a015.jpg" alt="Espaço Pet" />
              <span className="gcell__cap">Espaço Pet</span>
            </div>
            <div className="gcell g-w2" data-lb="images/pool-gourmet-play.jpg" data-cap="Espaço gourmet e convivência">
              <img src="/resort-prime/a017.jpg" alt="Espaço gourmet e piscina" />
              <span className="gcell__cap">Espaço gourmet &amp; convivência</span>
            </div>
            <div className="gcell" data-lb="images/fitness-ext.jpg" data-cap="Fitness externo">
              <img src="/resort-prime/a014.jpg" alt="Fitness externo" />
              <span className="gcell__cap">Fitness externo</span>
            </div>
            <div className="gcell" data-lb="images/kids-play.jpg" data-cap="Brinquedoteca">
              <img src="/resort-prime/a006.jpg" alt="Brinquedoteca" />
              <span className="gcell__cap">Brinquedoteca</span>
            </div>
          </div>

          <div className="amen reveal d2">
            <h3>Tudo o que a sua família precisa para curtir o ano inteiro</h3>
            <div className="chips">
              <span className="chip">Fitness Externo</span>
              <span className="chip">Piscina Adulto e Infantil</span>
              <span className="chip">Piscina Coberta Aquecida</span>
              <span className="chip">Pista de Caminhada · raia 20m</span>
              <span className="chip">Quadra de Beach Tennis</span>
              <span className="chip">Quadra Poliesportiva</span>
              <span className="chip">Salão de Festas</span>
              <span className="chip">Churrasqueira e Chopeira</span>
              <span className="chip">Brinquedoteca</span>
              <span className="chip">Playground</span>
              <span className="chip">Espaço Teen</span>
              <span className="chip">Espaço Baby</span>
              <span className="chip">Espaço Pet</span>
              <span className="chip">Espaço Pilates</span>
              <span className="chip">Espaço Horta</span>
              <span className="chip">Espaço Beleza</span>
              <span className="chip">Coworking</span>
              <span className="chip">Espaço Delivery</span>
              <span className="chip">Club Prime</span>
              <span className="chip">Academia Céltica</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Fitness / Céltica ===================== */}
      <section className="section section--dark" id="fitness" data-screen-label="Fitness">
        <div className="wrap split">
          <div className="split__media reveal">
            <div className="media-stack">
              <img className="m1" src="/resort-prime/a005.jpg" alt="Academia do Resort Prime" data-lb="images/gym.jpg" data-cap="Academia Céltica" />
              <img src="/resort-prime/a004.jpg" alt="Espaço pilates e yoga" data-lb="images/pilates.jpg" data-cap="Espaço Pilates e Yoga" />
              <img src="/resort-prime/a002.jpg" alt="Piscina coberta aquecida" data-lb="images/indoor-pool.jpg" data-cap="Piscina coberta aquecida" />
            </div>
          </div>
          <div className="split__copy">
            <span className="celtica-badge reveal"><span className="dot"></span>Parceria exclusiva</span>
            <span className="eyebrow reveal d1" style={{ color: 'var(--terra-soft)' }}>Saúde e relaxamento integrados</span>
            <h2 className="reveal d1">O 1º condomínio em Jundiaí com a Academia Céltica</h2>
            <p className="reveal d2" style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', marginTop: '16px' }}>Um Complexo Fitness completo: academia moderna, espaço beleza, áreas de pilates e yoga, piscina coberta aquecida e vestiários acessíveis. E mais — a renomada academia Céltica, exclusiva e customizada, dentro do condomínio.</p>
            <ul className="benefits reveal d2">
              <li><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg></span><span><b style={{ fontFamily: 'var(--ff-head)' }}>Profissional dedicado</b> — 50 horas semanais à disposição.</span></li>
              <li><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg></span><span>Treinos individualizados para os usuários da academia.</span></li>
              <li><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg></span><span>Metodologias de uma Equipe Técnica Multidisciplinar.</span></li>
              <li><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg></span><span>Qualificação trimestral dos equipamentos com laudos.</span></li>
              <li style={{ borderBottom: 'none' }}><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg></span><span>Protocolos personalizados de qualidade de vida e performance.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== Club Prime ===================== */}
      <section className="section section--cream" id="club" data-screen-label="Club Prime">
        <div className="wrap split split--rev">
          <div className="split__media reveal">
            <div className="media-stack">
              <img className="m1" src="/resort-prime/a013.jpg" alt="Club Prime — piscina privativa" data-lb="images/club-pool.jpg" data-cap="Club Prime — Piscina privativa" />
              <img src="/resort-prime/a022.jpg" alt="Club Prime — área gourmet" data-lb="images/gourmet-pool.jpg" data-cap="Club Prime — Espaço Gourmet" />
              <img src="/resort-prime/a017.jpg" alt="Club Prime — lazer" data-lb="images/pool-gourmet-play.jpg" data-cap="Club Prime — Lazer e convivência" />
            </div>
          </div>
          <div className="split__copy">
            <span className="eyebrow reveal">Planejado para a família</span>
            <h2 className="reveal d1">Club Prime: um clube privativo só seu</h2>
            <p className="reveal d2" style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '16px' }}>Receba amigos e familiares em um espaço exclusivo, dedicado a você e a quem você ama. Mais do que um ambiente, um lugar para desfrutar de bons momentos com todo o conforto.</p>
            <div className="feature-pills reveal d2">
              <div className="fp"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-2 5-2 4 2 6 2 4-2 5-2 4 2 4 2"></path><path d="M2 18s3-2 5-2 4 2 6 2 4-2 5-2 4 2 4 2"></path></svg></span><b>Piscina</b><span>Privativa</span></div>
              <div className="fp"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 11v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"></path></svg></span><b>Espaço Gourmet</b><span>Para receber</span></div>
              <div className="fp"><span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 0 0-5 5c0 3 5 8 5 8s5-5 5-8a5 5 0 0 0-5-5Z"></path><path d="M4 20h16"></path></svg></span><b>Spa</b><span>Relaxamento</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Plantas ===================== */}
      <section className="section section--sand" id="plantas" data-screen-label="Plantas">
        <div className="wrap">
          <div className="plans-top">
            <div className="plans-top__copy">
              <span className="eyebrow reveal">Torres e plantas</span>
              <h2 className="reveal d1">Projetado para atender você e toda a família</h2>
              <p className="reveal d2" style={{ color: 'var(--muted)', fontSize: '1.05rem', marginTop: '16px' }}>Apartamentos de 68 a 112m², com pé-direito de 2,70m, distribuídos em 4 torres com 4 elevadores cada. Acabamentos de primeira linha e plantas que se adaptam ao seu jeito de morar.</p>
              <a href="#agende" className="btn btn-primary reveal d2" style={{ marginTop: '24px' }}>Quero ver as plantas disponíveis</a>
            </div>
            <div className="plans-top__media reveal d1">
              <img src="/resort-prime/a007.jpg" alt="Apartamento decorado do Resort Prime Santa Angela" data-lb="images/decor-dining.jpg" data-cap="Apartamento decorado — perspectiva ilustrada" />
            </div>
          </div>

          <div className="plan-grid">
            <div className="plan-figure reveal" data-lb="images/plan-94.png" data-cap="Planta — 94 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a024.png" alt="Planta humanizada do apartamento de 94 m²" /></div>
              <div className="plan-figure__cap"><span className="m">94<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres A e B</span></div>
            </div>
            <div className="plan-figure reveal d1" data-lb="images/plan-101.png" data-cap="Planta — 101 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a025.png" alt="Planta humanizada do apartamento de 101 m²" /></div>
              <div className="plan-figure__cap"><span className="m">101<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres A e B</span></div>
            </div>
            <div className="plan-figure reveal d2" data-lb="images/plan-109.png" data-cap="Planta — 109 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a023.png" alt="Planta humanizada do apartamento de 109 m²" /></div>
              <div className="plan-figure__cap"><span className="m">109<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres A e B</span></div>
            </div>
            <div className="plan-figure reveal" data-lb="images/plan-112.png" data-cap="Planta — 112 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a026.png" alt="Planta humanizada do apartamento de 112 m²" /></div>
              <div className="plan-figure__cap"><span className="m">112<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres A e B</span></div>
            </div>
            <div className="plan-figure reveal d1" data-lb="images/plan-68.png" data-cap="Planta — 68 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a019.png" alt="Planta humanizada do apartamento de 68 m²" /></div>
              <div className="plan-figure__cap"><span className="m">68<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres C e D</span></div>
            </div>
            <div className="plan-figure reveal d2" data-lb="images/plan-110.png" data-cap="Planta — 110 m²">
              <div className="plan-figure__img"><img src="/resort-prime/a021.png" alt="Planta humanizada do apartamento de 110 m²" /></div>
              <div className="plan-figure__cap"><span className="m">110<sup>m²</sup></span><span className="z"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"></path></svg>Torres C e D</span></div>
            </div>
          </div>
          <p className="reveal" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem', marginTop: '22px' }}>Plantas humanizadas — imagens meramente ilustrativas. Clique para ampliar.</p>
        </div>
      </section>

      {/* ===================== Diferenciais ===================== */}
      <section className="section section--cream" id="diferenciais" data-screen-label="Diferenciais">
        <div className="wrap">
          <div className="shead center reveal">
            <span className="eyebrow center">Diferenciais Prime</span>
            <h2>Tecnologia e conforto em cada detalhe</h2>
            <p>Um ambiente onde inovação e bem-estar se encontram — pensado para a praticidade do seu dia a dia.</p>
          </div>

          <div className="diff-grid">
            <div className="diff-card reveal">
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14 0M2 8.82a16 16 0 0 1 20 0M8.5 16.43a6 6 0 0 1 7 0M12 20h.01"></path></svg></div>
              <h3>Fibra Óptica Multisserviços</h3>
              <p>Em parceria com a Pombonet, rede subterrânea para banda larga, TV e interfonia. Modem óptico configurado e pronto para uso.</p>
            </div>
            <div className="diff-card reveal d1">
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path></svg></div>
              <h3>Sistema Vedaporta</h3>
              <p>Mais um benefício Santa Angela: veda a porta fechada contra insetos, poeira, água e luz — com maior eficiência térmica e acústica.</p>
            </div>
            <div className="diff-card reveal d2">
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13M9 13l12-2"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
              <h3>Automação Full Control</h3>
              <p>Iluminação automatizada instalada e funcionando. Programe luzes e ambientes — inclusive por comando de voz — com o conceito de casa inteligente.</p>
            </div>
          </div>

          <div className="diff-extra">
            <div className="de reveal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Pé-direito de 2,70m</div>
            <div className="de reveal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Esquadrias de alumínio pretas sob medida</div>
            <div className="de reveal d1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Bancadas em mármore travertino</div>
            <div className="de reveal d1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Pias em granito verde ubatuba</div>
            <div className="de reveal d2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Ralo linear nos banheiros e varanda</div>
            <div className="de reveal d2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Infraestrutura para Wi-Fi nos aptos</div>
            <div className="de reveal d3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Medidores individualizados de água</div>
            <div className="de reveal d3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"></path></svg>Microgeração de energia fotovoltaica</div>
          </div>
        </div>
      </section>

      {/* ===================== CTA final ===================== */}
      <section className="cta" id="agende" data-screen-label="Agende">
        <div className="cta__bg"><img src="/resort-prime/a010.jpg" alt="Fachada do Resort Prime Santa Angela" /></div>
        <div className="wrap cta__inner">
          <div className="cta__copy">
            <span className="eyebrow reveal" style={{ color: 'var(--terra-soft)' }}>Projeto Prime · Lazer de Resort</span>
            <h2 className="reveal d1">A palavra Resort também te fará sentir <span className="script">em casa.</span></h2>
            <p className="reveal d2">Agende uma visita e conheça de perto o decorado, o lazer completo e tudo o que o Resort Prime Santa Angela preparou para a sua família.</p>
            <div className="cta__contacts reveal d2">
              <a className="cta__contact" href="https://wa.me/5511926143393" target="_blank" rel="noopener">
                <span className="ic"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.405z"></path></svg></span>
                <span><small>WhatsApp</small><b>+55 11 92614-3393</b></span>
              </a>
            </div>
          </div>

          <div className="lead-card reveal d1" id="form-cta">
            <h3>Receba o atendimento Prime</h3>
            <p className="sub">Preencha e fale agora com um especialista.</p>
            <form id="lead-form-2" data-ok="form-cta-ok" noValidate>
              <div className="field">
                <label htmlFor="c-nome">Nome</label>
                <input id="c-nome" name="nome" type="text" placeholder="Seu nome completo" data-required="" />
                <span className="err">Informe seu nome.</span>
              </div>
              <div className="field">
                <label htmlFor="c-email">E-mail</label>
                <input id="c-email" name="email" type="email" placeholder="voce@email.com" data-required="" />
                <span className="err">Informe um e-mail válido.</span>
              </div>
              <div className="field">
                <label htmlFor="c-tel">Telefone / WhatsApp</label>
                <input id="c-tel" name="telefone" type="tel" placeholder="(11) 90000-0000" data-required="" data-phone="" />
                <span className="err">Informe um telefone válido.</span>
              </div>
              <button type="submit" className="btn btn-wa btn-block">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.405z"></path></svg>
                Agende sua visita
              </button>
              <p className="legal">Retornamos pelo WhatsApp informado. Atendimento Santa Angela Construtora.</p>
            </form>
            <div className="form-ok" id="form-cta-ok" style={{ display: 'none' }}>
              <div className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"></path></svg></div>
              <h3>Recebido!</h3>
              <p>Abrimos o WhatsApp para concluir. Nosso time entra em contato em breve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Footer ===================== */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__top">
            <div>
              <span className="logo-img"><img src="/resort-prime/a000.png" alt="Santa Angela Construtora" /></span>
              <p style={{ marginTop: '16px' }}>Resort Prime Santa Angela — o lugar onde sua família encontra o equilíbrio perfeito entre lazer, conforto e exclusividade, todos os dias.</p>
            </div>
            <div>
              <h4>Navegue</h4>
              <ul className="footer__links">
                <li><a href="#localizacao">Localização</a></li>
                <li><a href="#lazer">Lazer</a></li>
                <li><a href="#fitness">Complexo Fitness</a></li>
                <li><a href="#club">Club Prime</a></li>
                <li><a href="#plantas">Plantas</a></li>
              </ul>
            </div>
            <div>
              <h4>Atendimento</h4>
              <ul className="footer__links">
                <li><a href="https://wa.me/5511926143393" target="_blank" rel="noopener">WhatsApp: +55 11 92614-3393</a></li>
                <li>Av. Caetano Gornati</li>
                <li>Engordadouro — Jundiaí / SP</li>
                <li><a href="https://santaangelaconstrutora.com.br" target="_blank" rel="noopener">santaangelaconstrutora.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__legal">
            <p>Imagens e perspectivas meramente ilustrativas. As informações constantes no Memorial de Incorporação e nos futuros Instrumentos de Compra e Venda prevalecerão sobre as divulgadas neste material. As tonalidades de cores, formas e texturas podem sofrer alterações. Móveis e utensílios são sugestões de decoração e não fazem parte do contrato de aquisição. A vegetação apresenta porte adulto de referência e será entregue conforme o Projeto Paisagístico. Material preliminar, sujeito a alteração sem aviso prévio.</p>
            <p>Registro do Imóvel: Incorporação registrada na matrícula 171.488 no 1º Cartório de Registro de Imóveis de Jundiaí-SP, em 16/11/21.</p>
          </div>
          <div className="footer__bar">
            <span>© 2025 Lotus Brokers. Todos os direitos reservados.</span>
            <span>Resort Prime Santa Angela · Jundiaí / SP</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <a className="wa-float" href="https://wa.me/5511926143393?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Resort%20Prime%20Santa%20Angela." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.405zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
      </a>

      {/* Lightbox */}
      <div className="lightbox" id="lightbox">
        <button className="lightbox__close" aria-label="Fechar">×</button>
        <button className="lightbox__nav prev" aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"></path></svg></button>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="Imagem ampliada" />
        <button className="lightbox__nav next" aria-label="Próxima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"></path></svg></button>
        <span className="lightbox__cap"></span>
      </div>
    </div>
  );
}
