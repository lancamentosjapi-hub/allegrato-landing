'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useState, type CSSProperties } from 'react';
import { footerLegalLine } from '@/lib/site';

/**
 * Bloco institucional do rodapé, com a mesma estrutura do rodapé da home,
 * para as landings de empreendimento.
 *
 * Por que ENTRA no <footer> existente em vez de substituí-lo: o rodapé de cada
 * landing carrega o aviso legal do empreendimento — memorial descritivo, número
 * da matrícula, registro de incorporação, CRECI da construtora. Trocar aquele
 * rodapé pelo da home apagaria texto com valor jurídico. Então o bloco é
 * acrescentado ao que já existe: a landing mantém o aviso dela e ganha a
 * estrutura institucional (marca, links, políticas, redes, copyright).
 *
 * Por que portal e não edição em cada componente: são 23 rodapés com marcação
 * própria. Mudar um link ou um texto aqui vale para as 28 de uma vez.
 *
 * Cores: o padrão é `transparent` com brancos translúcidos e o dourado da
 * Lotus. Assim o bloco assenta sobre o fundo do rodapé de cada empreendimento
 * sem precisar conhecer a paleta de nenhum deles — a "adaptação de cor" sai de
 * graça. O prop `tema` existe para o caso de uma landing pedir outra coisa.
 *
 * Se a página não tiver <footer>, nada é renderizado.
 */

export type TemaRodape = {
  /** Fundo do bloco. `transparent` herda a cor do rodapé que o hospeda. */
  fundo: string;
  /** Cor base do texto corrido. */
  texto: string;
  /** Cor de títulos de coluna, hover de link e ícone social. */
  destaque: string;
  /** Divisórias e contorno dos ícones. */
  borda: string;
};

const TEMA_PADRAO: TemaRodape = {
  fundo: 'transparent',
  texto: 'rgba(255,255,255,.62)',
  destaque: '#cdab6e',
  borda: 'rgba(255,255,255,.16)',
};

const COLUNAS: { titulo: string; links: { rotulo: string; href: string }[] }[] = [
  {
    titulo: 'A Lotus',
    links: [
      { rotulo: 'Sobre nós', href: '/lotus-sobre' },
      { rotulo: 'Corretores', href: '/lotus-corretores' },
      { rotulo: 'Seja um corretor', href: '/lotus-recrutamento' },
    ],
  },
  {
    titulo: 'Serviços',
    links: [
      { rotulo: 'Lançamentos', href: '/lotus-lancamentos' },
      { rotulo: 'Comprar & alugar', href: '/lotus-busca' },
      { rotulo: 'Anunciar imóvel', href: '/lotus-anunciar' },
      { rotulo: 'Bairros', href: '/lotus-bairro' },
      { rotulo: 'Blog', href: '/lotus-blog' },
    ],
  },
  {
    titulo: 'Políticas',
    links: [
      { rotulo: 'Privacidade (LGPD)', href: '/lotus-privacidade' },
      { rotulo: 'Termos de uso', href: '/lotus-termos' },
      { rotulo: 'Cookies', href: '/lotus-cookies' },
    ],
  },
];

const REDES = [
  { nome: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61587132887416&locale=pt_BR', d: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z' },
  { nome: 'YouTube', href: 'https://www.youtube.com/@LotusBrokersImobili%C3%A1ria', d: 'M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z' },
  { nome: 'Instagram', href: 'https://www.instagram.com/lotusbrokers_/', d: null },
  { nome: 'TikTok', href: 'https://www.tiktok.com/@lotusbrokers', d: 'M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z' },
];

/**
 * A que distância da borda começa o conteúdo do rodapé da landing.
 *
 * O bloco institucional é filho direto do <footer>, mas o padding horizontal de
 * quase todas as landings mora num container INTERNO. O bloco ficava fora dele
 * e encostava na borda da tela enquanto o resto do rodapé respeitava o recuo —
 * medido no Odeon a 375px: o conteúdo da própria página em x=28, o bloco em
 * x=0, com a linha de CRECI e CNPJ colada na borda.
 *
 * Medido em vez de fixo porque cada landing usa o seu (20, 24, 28px, e clamp()
 * em várias). A referência é o primeiro texto do rodapé que não pertence ao
 * bloco.
 */
function recuoDoRodape(rodape: HTMLElement, bloco: HTMLElement): number {
  // A referência é a borda do PRÓPRIO bloco, não a do <footer>: em parte das
  // landings o rodapé já tem padding, e descontar a borda dele somava esse
  // padding duas vezes — no Vigóre o bloco ia para x=102 contra os 51px do
  // conteúdo da página. Como padding não desloca a border-box, medir daqui dá
  // o mesmo número antes e depois de aplicar, sem oscilar no resize.
  const borda = bloco.getBoundingClientRect().left;
  for (const el of rodape.querySelectorAll<HTMLElement>('*')) {
    if (bloco.contains(el) || el.children.length > 0) continue;
    if ((el.textContent ?? '').trim().length < 3) continue;
    const recuo = el.getBoundingClientRect().left - borda;
    // Texto centralizado ou fora do fluxo daria um número sem sentido.
    if (recuo > 0 && recuo < 120) return Math.round(recuo);
  }
  return 0;
}

export default function RodapeLotus({ tema = TEMA_PADRAO }: { tema?: TemaRodape }) {
  const [rodape, setRodape] = useState<HTMLElement | null>(null);
  const [recuo, setRecuo] = useState(0);

  useEffect(() => {
    setRodape(document.querySelector('footer'));
  }, []);

  // Só dá para medir depois que o bloco está na página. Remede ao
  // redimensionar porque boa parte das landings usa clamp() no padding.
  useEffect(() => {
    if (!rodape) return;
    const medir = () => {
      const bloco = rodape.querySelector<HTMLElement>('[data-rodape-lotus]');
      if (bloco) setRecuo(recuoDoRodape(rodape, bloco));
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [rodape]);

  if (!rodape) return null;

  const tituloColuna: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: tema.destaque,
    marginBottom: 16,
  };

  return createPortal(
    <div
      data-rodape-lotus=""
      style={{
        background: tema.fundo,
        borderTop: `1px solid ${tema.borda}`,
        marginTop: 34,
        paddingTop: 34,
        paddingLeft: recuo,
        paddingRight: recuo,
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
        color: tema.texto,
      }}
    >
      <div
        data-rodape-lotus-grid=""
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 36,
          paddingBottom: 30,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <img
            src="/logo-lotus-dourado.png"
            alt="Lotus Brokers"
            style={{ height: 34, width: 'auto', display: 'block', marginBottom: 18 }}
          />
          <p
            style={{
              fontFamily: "'Fraunces',serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 19,
              color: 'rgba(255,255,255,.86)',
              lineHeight: 1.35,
              maxWidth: 300,
              margin: '0 0 16px',
            }}
          >
            Grandes escolhas têm endereço.
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 340 }}>
            Consultoria imobiliária para compra, venda, locação e investimento em imóveis de médio e
            alto padrão em Jundiaí, Itupeva e região.
          </p>
          {/* CTA de volta para a listagem. Mora aqui, e não numa faixa própria,
              para o rodapé não ter duas divisórias seguidas. */}
          <BotaoVoltar destaque={tema.destaque} />
        </div>

        {COLUNAS.map((col) => (
          <div key={col.titulo} style={{ minWidth: 0 }}>
            <div style={tituloColuna}>{col.titulo}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14.5 }}>
              {col.links.map((l) => (
                <LinkRodape key={l.href} href={l.href} destaque={tema.destaque} cor={tema.texto}>
                  {l.rotulo}
                </LinkRodape>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        data-rodape-lotus-base=""
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          borderTop: `1px solid ${tema.borda}`,
          paddingTop: 22,
          paddingBottom: 8,
          fontSize: 12.5,
          lineHeight: 1.6,
        }}
      >
        <div style={{ minWidth: 0 }}>{footerLegalLine()}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {REDES.map((r) => (
            <IconeRede key={r.nome} rede={r} tema={tema} />
          ))}
        </div>
      </div>
    </div>,
    rodape
  );
}

function BotaoVoltar({ destaque }: { destaque: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href="/lotus-lancamentos"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: hover ? destaque : '#b18a4a',
        color: '#15241c',
        fontSize: 14.5,
        fontWeight: 600,
        lineHeight: 1,
        padding: '13px 22px',
        borderRadius: 40,
        transition: 'background .2s, transform .2s',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </svg>
      Ver todos os lançamentos
    </Link>
  );
}

function LinkRodape({
  href,
  children,
  destaque,
  cor,
}: {
  href: string;
  children: React.ReactNode;
  destaque: string;
  cor: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      style={{ color: hover ? destaque : cor, transition: 'color .2s' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

function IconeRede({ rede, tema }: { rede: (typeof REDES)[number]; tema: TemaRodape }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={rede.href}
      target="_blank"
      rel="noopener"
      aria-label={rede.nome}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: `1px solid ${hover ? tema.destaque : tema.borda}`,
        background: hover ? tema.destaque : 'transparent',
        color: hover ? '#15241c' : tema.texto,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background .2s, color .2s, border-color .2s',
        flexShrink: 0,
      }}
    >
      {rede.d ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={rede.d} />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )}
    </a>
  );
}
