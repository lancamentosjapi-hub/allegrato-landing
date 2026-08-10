'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Botão flutuante de volta para /lotus-lancamentos, para as landings de
 * empreendimento.
 *
 * Fica no canto INFERIOR ESQUERDO: as landings já têm o botão de WhatsApp
 * fixo à direita, e o cabeçalho de cada uma é um design próprio (vieram de
 * exportações diferentes), então não há um lugar comum no topo onde encaixar
 * sem mexer em 22 layouts distintos.
 *
 * Componente único de propósito: mudar o texto, o destino ou a posição do
 * botão passa a ser uma edição só, não vinte e duas.
 */
export default function VoltarParaLancamentos() {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href="/lotus-lancamentos"
      aria-label="Voltar para os lançamentos"
      style={{
        position: 'fixed',
        left: 22,
        bottom: 22,
        zIndex: 75,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: hover ? '#1d3a2c' : 'rgba(21,36,28,.92)',
        color: '#f7f2e8',
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        fontSize: 14,
        fontWeight: 600,
        padding: '12px 18px',
        borderRadius: 40,
        border: '1px solid rgba(205,171,110,.45)',
        boxShadow: '0 14px 34px -10px rgba(21,36,28,.6)',
        backdropFilter: 'blur(4px)',
        transition: 'background .2s, transform .2s',
        transform: hover ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>←</span>
      Lançamentos
    </Link>
  );
}
