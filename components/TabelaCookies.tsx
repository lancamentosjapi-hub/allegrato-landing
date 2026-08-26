'use client';

import { useState } from 'react';
import { reabrirPreferencias } from '@/lib/consent';

/**
 * Tabela de cookies da Política de Cookies, e o botão que reabre as
 * preferências.
 *
 * O conteúdo saiu de uma AUDITORIA do código, não de um modelo genérico: só
 * entra cookie que o projeto realmente grava ou carrega. A tabela de referência
 * recebida trazia `lotus_session`, `_fbp`, `_fbc` e `_gcl_au`; nenhum deles
 * existe aqui, e declarar cookie inexistente numa política é declaração falsa
 * sobre tratamento de dados.
 *
 * `condicional` marca o que só passa a existir quando a variável de ambiente
 * correspondente está configurada E a pessoa aceitou os não-essenciais. A
 * coluna de retenção desses vem da documentação do próprio fornecedor, que é a
 * única fonte que temos: o portal não os grava, só carrega o script.
 *
 * No celular a tabela vira lista expansível: cinco colunas em 360px espremem
 * "Finalidade" a ponto de quebrar palavra por linha.
 */

type Cookie = {
  nome: string;
  categoria: 'Essencial' | 'Analytics';
  finalidade: string;
  retencao: string;
  parte: '1ª' | '3ª';
  condicional?: string;
};

const COOKIES: Cookie[] = [
  {
    nome: 'lotus_consent',
    categoria: 'Essencial',
    finalidade: 'Guarda a sua escolha de cookies (aceitar todos ou apenas essenciais), para não perguntarmos de novo a cada visita.',
    retencao: '180 dias',
    parte: '1ª',
  },
  {
    nome: '_ga, _ga_*',
    categoria: 'Analytics',
    finalidade: 'Google Analytics 4, carregado via Google Tag Manager. Mede páginas vistas e origem do acesso, de forma agregada.',
    retencao: '24 meses',
    parte: '3ª',
    condicional: 'Só existe se você aceitar os cookies não-essenciais.',
  },
  {
    nome: '_clck, _clsk',
    categoria: 'Analytics',
    finalidade: 'Microsoft Clarity. Registra como as páginas são usadas (rolagem, cliques) para encontrarmos pontos de dificuldade.',
    retencao: '_clck: 12 meses · _clsk: 1 dia',
    parte: '3ª',
    condicional: 'Só existe se você aceitar os cookies não-essenciais.',
  },
];

const corCategoria = (c: Cookie['categoria']) => (c === 'Essencial' ? '#3f6249' : '#b18a4a');

export default function TabelaCookies() {
  return (
    <>
      <BotaoPreferencias />
      <div data-cookies-tabela="" role="region" aria-label="Cookies utilizados pelo site">
        <table>
          <thead>
            <tr>
              <th scope="col">Cookie</th>
              <th scope="col">Categoria</th>
              <th scope="col">Finalidade</th>
              <th scope="col">Retenção</th>
              <th scope="col">Parte</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.nome}>
                <td><code>{c.nome}</code></td>
                <td style={{ color: corCategoria(c.categoria), fontWeight: 600 }}>{c.categoria}</td>
                <td>
                  {c.finalidade}
                  {c.condicional && <em style={{ display: 'block', marginTop: 4, opacity: 0.75 }}>{c.condicional}</em>}
                </td>
                <td>{c.retencao}</td>
                <td>{c.parte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-cookies-lista="">
        {COOKIES.map((c) => (
          <ItemCookie key={c.nome} cookie={c} />
        ))}
      </div>
    </>
  );
}

function ItemCookie({ cookie }: { cookie: Cookie }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="ck-item">
      <button type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
        <span>
          <code>{cookie.nome}</code>
          <small style={{ color: corCategoria(cookie.categoria) }}>{cookie.categoria}</small>
        </span>
        <span aria-hidden="true">{aberto ? '−' : '+'}</span>
      </button>
      {aberto && (
        <dl>
          <dt>Finalidade</dt>
          <dd>
            {cookie.finalidade}
            {cookie.condicional && <em style={{ display: 'block', marginTop: 4, opacity: 0.75 }}>{cookie.condicional}</em>}
          </dd>
          <dt>Retenção</dt>
          <dd>{cookie.retencao}</dd>
          <dt>Origem</dt>
          <dd>{cookie.parte === '1ª' ? '1ª parte (Lotus Brokers)' : '3ª parte'}</dd>
        </dl>
      )}
    </div>
  );
}

function BotaoPreferencias() {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={reabrirPreferencias}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: hover ? '#cdab6e' : '#b18a4a',
        color: '#15241c',
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1,
        padding: '14px 24px',
        borderRadius: 40,
        border: 'none',
        cursor: 'pointer',
        margin: '0 0 28px',
        transition: 'background .2s',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
      Abrir preferências de cookies
    </button>
  );
}
