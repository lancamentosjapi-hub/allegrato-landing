'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

/**
 * Botão de volta para /lotus-lancamentos, DENTRO do rodapé da landing.
 *
 * Entra por portal no <footer> da própria página em vez de ser editado à mão
 * nos 23 componentes. Cada landing tem rodapé próprio, com estrutura e cor
 * diferentes (marrom no Castanheira, azul-marinho no Santorini, verde no
 * Vivarte); injetar o botão no JSX de cada um seriam 23 edições distintas, e
 * qualquer mudança de texto ou destino voltaria a ser 23. Com o portal é um
 * arquivo só, e funciona seja qual for a marcação do rodapé.
 *
 * O visual é neutro de propósito: uma faixa com borda no topo e o botão
 * dourado da Lotus. Assim assenta sobre qualquer um dos fundos escuros usados
 * pelas landings sem precisar conhecer a paleta de cada uma.
 *
 * Se a página não tiver <footer>, nada é renderizado em vez de o botão cair
 * num lugar aleatório. Hoje todas têm; a guarda existe para uma landing futura
 * que chegue sem rodapé não ganhar um botão solto no meio da página.
 *
 * Complementa o [AtalhosLanding], que é o atalho flutuante para quem está no
 * meio da página; este atende quem rolou até o fim.
 */
export default function RodapeVoltarLancamentos() {
  const [rodape, setRodape] = useState<HTMLElement | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setRodape(document.querySelector('footer'));
  }, []);

  if (!rodape) return null;

  return createPortal(
    <div
      data-rodape-voltar=""
      style={{
        borderTop: '1px solid rgba(255,255,255,.14)',
        marginTop: 28,
        paddingTop: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
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
        Ver todos os lançamentos da Lotus
      </Link>
    </div>,
    rodape
  );
}
