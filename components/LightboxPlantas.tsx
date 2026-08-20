'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';

/**
 * Lightbox único das PLANTAS, compartilhado por todas as landings.
 *
 * Motivo de existir: a auditoria de 18/08/2026 mediu as 28 landings em Chrome
 * e achou três problemas distintos.
 *
 * - Em Avalon, Jardins do Horto, SKY Videiras e Oásis a planta não abria de
 *   jeito nenhum: 9 imagens sem qualquer comportamento de clique.
 * - Das 21 landings que já tinham lightbox próprio, só 3 fechavam com Esc.
 * - 11 delas deixavam a página rolando por trás do modal aberto.
 *
 * As 21 implementações não compartilham formato de estado nem de fechamento,
 * então normalizar cada uma seriam 21 edições distintas e 21 chances de
 * regressão. Em vez disso este componente ASSUME o clique nas plantas: captura
 * o evento na fase de captura e impede que o handler da página rode, de modo
 * que toda planta do site abre no mesmo modal, com o mesmo comportamento.
 *
 * O lightbox próprio de cada landing continua servindo as galerias de fotos,
 * que não são escopo desta auditoria e seguem funcionando como antes.
 *
 * Identificação da planta: alt mencionando planta/tipologia/implantação, ou
 * imagem dentro de uma seção cujo id traz esses termos. Foi a heurística usada
 * na auditoria, e é a mesma que a verificação relê depois.
 */

const SELETOR_SECAO = '[id*="planta" i], [id*="tipologia" i]';
const RE_ALT = /planta|tipologia|implanta/i;

function ehPlanta(img: HTMLImageElement): boolean {
  if (RE_ALT.test(img.alt || '')) return true;
  return Boolean(img.closest(SELETOR_SECAO));
}

export default function LightboxPlantas() {
  const [aberta, setAberta] = useState<{ src: string; alt: string } | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  const fechar = useCallback(() => setAberta(null), []);

  // Captura o clique antes de a página tratá-lo. Sem a fase de captura, o
  // lightbox da própria landing abriria junto e teríamos dois modais.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const alvo = e.target as HTMLElement | null;
      const img = alvo?.closest?.('img') as HTMLImageElement | null;
      if (!img || !ehPlanta(img)) return;
      e.preventDefault();
      e.stopPropagation();
      setAberta({ src: img.currentSrc || img.src, alt: img.alt || 'Planta do empreendimento' });
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Cursor de zoom nas plantas: sinaliza que são clicáveis. Feito em JS e não
  // em CSS porque o seletor depende do alt, que CSS não alcança.
  useEffect(() => {
    const aplicar = () => {
      document.querySelectorAll('img').forEach((img) => {
        if (ehPlanta(img as HTMLImageElement)) (img as HTMLImageElement).style.cursor = 'zoom-in';
      });
    };
    aplicar();
    const obs = new MutationObserver(aplicar);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // Esc fecha e a página para de rolar por trás.
  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', onKey);
    };
  }, [aberta, fechar]);

  if (!montado || !aberta) return null;

  return createPortal(
    <div
      data-lightbox-plantas=""
      role="dialog"
      aria-modal="true"
      aria-label={aberta.alt}
      onClick={fechar}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 4vw, 40px)',
        background: 'rgba(10,14,12,.94)',
        backdropFilter: 'blur(3px)',
        cursor: 'zoom-out',
        animation: 'ltPlantaEntra .22s ease-out',
      }}
    >
      <style>{`
        @keyframes ltPlantaEntra { from { opacity: 0 } to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          [data-lightbox-plantas] { animation: none !important }
        }
      `}</style>

      <button
        type="button"
        aria-label="Fechar"
        onClick={fechar}
        style={{
          position: 'absolute',
          top: 'calc(14px + env(safe-area-inset-top, 0px))',
          right: 14,
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.32)',
          background: 'rgba(0,0,0,.42)',
          color: '#fff',
          fontSize: 26,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxHeight: '100%' }}>
        <img
          src={aberta.src}
          alt={aberta.alt}
          // Clique na imagem não fecha: só o fundo e o X. Numa planta a pessoa
          // quer aproximar o rosto da tela, e fechar no toque atrapalharia.
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'block',
            maxWidth: 'min(1600px, 96vw)',
            maxHeight: '84vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: 6,
            background: '#fff',
            cursor: 'default',
            boxShadow: '0 30px 90px rgba(0,0,0,.55)',
          }}
        />
        <figcaption
          style={{
            color: 'rgba(255,255,255,.82)',
            fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
            fontSize: 14,
            textAlign: 'center',
            maxWidth: '90vw',
          }}
        >
          {aberta.alt}
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}
