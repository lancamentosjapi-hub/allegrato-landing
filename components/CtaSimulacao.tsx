'use client';

import { useState, type CSSProperties } from 'react';
import AtendimentoChat from './AtendimentoChat';

/**
 * Botão único de simulação das landings: "Faça uma simulação sem custos".
 *
 * Substitui os simuladores próprios de cada empreendimento. O caso que motivou
 * a troca foi o Allegrato, que trazia um cálculo de parcela na página: slider
 * de valor, Tabela Price a 8,16% a.a., 80% financiado em 360 meses. O número
 * saía preciso na tela e desatualizado na vida real — juros mudam, FGTS e
 * subsídio não entravam na conta, e nada disso sobrevive à análise de crédito.
 * Um valor errado na tela vira expectativa quebrada no atendimento.
 *
 * No lugar, o botão abre a LIA, que é onde a simulação de verdade acontece com
 * dados da pessoa. Fluxo: empreendimento → botão → LIA.
 *
 * Componente compartilhado de propósito: enquanto cada landing tinha o seu, o
 * site acumulou doze variações de texto para a mesma ação ("Quero a simulação
 * oficial", "Quero simular meu financiamento", "Faça uma simulação de
 * financiamento pelo programa..."). Aqui é um rótulo só, num arquivo só.
 */

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1,
  padding: '15px 26px',
  borderRadius: 40,
  border: 'none',
  cursor: 'pointer',
  transition: 'background .2s, transform .2s',
};

export default function CtaSimulacao({
  /** Cor do botão. O padrão é o dourado da Lotus; landings de paleta muito
   *  distinta podem passar a sua sem precisar de outro componente. */
  cor = '#b18a4a',
  corHover = '#cdab6e',
  corTexto = '#15241c',
  /** Alinhamento do bloco, para encaixar em seções centralizadas. */
  style,
}: {
  cor?: string;
  corHover?: string;
  corTexto?: string;
  style?: CSSProperties;
}) {
  const [aberto, setAberto] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div data-cta-simulacao="" style={style}>
      <button
        type="button"
        onClick={() => setAberto(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...base,
          background: hover ? corHover : cor,
          color: corTexto,
          transform: hover ? 'translateY(-1px)' : 'none',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h4" />
        </svg>
        Faça uma simulação sem custos
      </button>

      {aberto && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            zIndex: 96,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <AtendimentoChat onClose={() => setAberto(false)} />
        </div>
      )}
    </div>
  );
}
