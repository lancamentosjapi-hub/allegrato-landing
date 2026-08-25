'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { readConsent, writeConsent, type ConsentValue } from '@/lib/consent';

// Banner de consentimento portado do <script> inline do estático lotus-cookies/index.html.
// Exibe só quando não há cookie "lotus_consent"; a gravação + Consent Mode v2
// ficam em lib/consent.ts (compartilhado com components/Analytics.tsx).

const box: CSSProperties = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 16,
  zIndex: 9999,
  maxWidth: 560,
  margin: '0 auto',
  background: '#15241c',
  color: '#f7f2e8',
  border: '1px solid rgba(205,171,110,.4)',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: '0 18px 50px -20px rgba(0,0,0,.5)',
  fontFamily: 'system-ui,-apple-system,sans-serif',
};

const acceptBtn: CSSProperties = {
  background: '#b18a4a',
  color: '#15241c',
  fontWeight: 700,
  fontSize: 13.5,
  border: 'none',
  padding: '10px 18px',
  borderRadius: 30,
  cursor: 'pointer',
};

const rejectBtn: CSSProperties = {
  background: 'transparent',
  color: '#f7f2e8',
  fontWeight: 600,
  fontSize: 13.5,
  border: '1px solid rgba(247,242,232,.3)',
  padding: '10px 18px',
  borderRadius: 30,
  cursor: 'pointer',
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  /**
   * Publica a altura do banner em --lt-banner-h enquanto ele está na tela.
   *
   * O banner é fixed, ocupa a largura toda no rodapé e vive na camada 9999;
   * os CTAs flutuantes ficam em bottom:24px na camada 95. Medido num aparelho
   * de 390px, o banner ia de y=585 a y=784 e os botões de y=722 a y=776: o
   * banner cobria os dois por inteiro, e não havia como alcançá-los até
   * aceitar os cookies.
   *
   * A altura vai para uma variável em vez de um valor fixo porque o banner
   * muda de altura conforme a largura da tela (151px a 390px, 199px a 360px).
   * Quem consome é [data-flutuantes] em styles/base.css.
   */
  useEffect(() => {
    const raiz = document.documentElement;
    if (!visible) {
      raiz.style.removeProperty('--lt-banner-h');
      return;
    }
    const medir = () => {
      const h = caixaRef.current?.offsetHeight ?? 0;
      raiz.style.setProperty('--lt-banner-h', `${h + 12}px`);
    };
    medir();
    const obs = new ResizeObserver(medir);
    if (caixaRef.current) obs.observe(caixaRef.current);
    window.addEventListener('resize', medir);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', medir);
      raiz.style.removeProperty('--lt-banner-h');
    };
  }, [visible]);

  function setConsent(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div id="lotus-cookie" ref={caixaRef} role="dialog" aria-label="Aviso de cookies" style={box}>
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 13.5,
          lineHeight: 1.5,
          color: 'rgba(247,242,232,.85)',
        }}
      >
        Usamos cookies para melhorar sua experiência e entender o uso do site.
        Aceite todos ou recuse os não-essenciais.{' '}
        <Link
          href="/lotus-cookies"
          style={{ color: '#cdab6e', textDecoration: 'underline' }}
        >
          Política de Cookies
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          id="lotus-cookie-accept"
          type="button"
          style={acceptBtn}
          onClick={() => setConsent('all')}
        >
          Aceitar todos
        </button>
        <button
          id="lotus-cookie-reject"
          type="button"
          style={rejectBtn}
          onClick={() => setConsent('essential')}
        >
          Recusar não-essenciais
        </button>
      </div>
    </div>
  );
}
