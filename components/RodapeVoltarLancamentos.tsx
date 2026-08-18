'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Faixa de retorno para /lotus-lancamentos, no fim das landings de
 * empreendimento.
 *
 * Fica DEPOIS do rodapé da landing, não dentro dele. Cada uma das 23 landings
 * tem rodapé próprio, com cor e estrutura diferentes (marrom no Castanheira,
 * azul-marinho no Santorini, verde no Vivarte). Injetar um botão dentro de cada
 * um seria 23 edições distintas, frágeis, e o botão herdaria a cor do
 * empreendimento em vez de parecer o que é: navegação do portal.
 *
 * Com a faixa na identidade da Lotus, o leitor entende que saiu do material do
 * empreendimento e voltou para o site, e mexer no texto ou no destino continua
 * sendo uma edição só.
 *
 * Complementa o [AtalhosLanding], que é o atalho flutuante para quem está no
 * meio da página; este atende quem rolou até o fim.
 */
export default function RodapeVoltarLancamentos() {
  const [hover, setHover] = useState(false);

  return (
    <section
      data-rodape-voltar=""
      style={{
        background: '#15241c',
        borderTop: '1px solid rgba(205,171,110,.28)',
        padding: '38px 24px calc(38px + env(safe-area-inset-bottom))',
      }}
    >
      <div
        data-rodape-voltar-grid=""
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <img
            src="/logo-lotus-dourado.png"
            alt="Lotus Brokers"
            style={{ height: 34, width: 'auto', display: 'block', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
              fontSize: 14,
              lineHeight: 1.45,
              color: 'rgba(247,242,232,.66)',
              minWidth: 0,
            }}
          >
            Quer comparar com outros empreendimentos?
          </span>
        </div>

        <Link
          href="/lotus-lancamentos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: hover ? '#cdab6e' : '#b18a4a',
            color: '#15241c',
            fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1,
            padding: '15px 26px',
            borderRadius: 40,
            transition: 'background .2s, transform .2s',
            transform: hover ? 'translateY(-1px)' : 'none',
            flexShrink: 0,
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m11 18-6-6 6-6" />
          </svg>
          Ver todos os lançamentos
        </Link>
      </div>
    </section>
  );
}
