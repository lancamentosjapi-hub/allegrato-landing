'use client';
import { getBairro } from '@/lib/bairros';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusHome — porte 1:1 de lotus-home/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - data-reveal          -> atributo mantido; animação porta via useEffect (IntersectionObserver)
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 */

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { developmentsFallback, type DevelopmentCard } from '@/lib/developments';
import { POSTS } from './LotusBlog';
import { SQUADS } from '@/lib/squads';
import MobileMenu from './MobileMenu';

// Chat do Atendimento Rápido — chunk só carrega quando o usuário abre o widget.
const AtendimentoChat = dynamic(() => import('./AtendimentoChat'), { ssr: false });

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Converte uma string CSS ("a:b;c:d") em objeto React.CSSProperties.
 * camelCase nas propriedades; preserva valores EXATOS (cores, px, gradientes).
 * Split cuidadoso: separa apenas no PRIMEIRO ":" de cada declaração (valores
 * como gradientes e data: URIs contêm ":" internos).
 */
function parseStyle(css: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!css) return out;
  for (const decl of css.split(';')) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const rawProp = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!rawProp) continue;
    const prop = rawProp.startsWith('--')
      ? rawProp // custom property: mantém como está
      : rawProp.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[prop] = value;
  }
  return out as CSSProperties;
}

/**
 * Reproduz style-hover do dc-runtime: hoverStyle vira :hover.
 * Aplica hoverStyle (merge sobre baseStyle) no mouseenter e remove no mouseleave.
 */
type HoverableProps<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  baseStyle: CSSProperties;
  hoverStyle: CSSProperties;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'style' | 'children'>;

function Hoverable<T extends keyof React.JSX.IntrinsicElements = 'div'>({
  as,
  baseStyle,
  hoverStyle,
  children,
  ...rest
}: HoverableProps<T>) {
  const [hover, setHover] = useState(false);
  // Rota interna (href "/..." não-âncora) vira <Link> do Next: navegação
  // client-side instantânea + prefetch, sem full reload/tela branca. Links
  // externos, âncoras (#) e target=_blank continuam <a> normal.
  const rprops = rest as Record<string, unknown>;
  const href = typeof rprops.href === 'string' ? rprops.href : undefined;
  const isInternal =
    as === 'a' && href?.startsWith('/') && rprops.target !== '_blank';
  const Tag: React.ElementType = isInternal ? Link : (as || 'div');
  const { target: _t, ...linkRest } = rprops;
  const tagProps = isInternal ? linkRest : rest;
  return (
    <Tag
      {...tagProps}
      style={hover ? { ...baseStyle, ...hoverStyle } : baseStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Tag>
  );
}

/**
 * image-slot do dc-runtime: bloco com gradiente de fundo (fallback) e, quando há
 * src, a imagem cobrindo (object-fit:cover). Sem src => só o gradiente.
 * Gradiente idêntico ao do estático: linear-gradient(135deg,#1d3a2c,#3f6249).
 */
function ImageSlot({
  src,
  id,
  style,
  alt = '',
}: {
  src?: string;
  id?: string;
  style?: CSSProperties;
  alt?: string;
}) {
  return (
    <div
      id={id}
      style={{
        display: 'block',
        background: 'linear-gradient(135deg,#1d3a2c,#3f6249)',
        ...style,
      }}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511926143393';
const LIA_ENABLED_DEFAULT = true;
const BANNER_AUTO_DEFAULT = true;
const REVEAL_ANIM_DEFAULT = true;

const faqData = [
  {
    q: 'Qual a melhor imobiliária em Jundiaí e Itupeva?',
    a: 'A Lotus Brokers é uma imobiliária moderna da região, voltada para um atendimento de excelência: equipe segmentada por especialidade e corretores que conhecem cada bairro, de lançamentos a revenda.',
  },
  {
    q: 'A Lotus é uma imobiliária nova?',
    a: 'Marca nova, time consolidado. A operação atua há mais de uma década na região e renasceu como Lotus, com a mesma gente que já conhece cada esquina.',
  },
  {
    q: 'Como funciona o atendimento de vocês?',
    a: 'Você fala com um especialista do seu bairro, não com um corretor que dá conta de tudo. A estrutura cuida do repetitivo; o corretor cuida de você, com processo transparente do começo ao pós-chave.',
  },
];

const banners = [
  { slot: 'lotus-banner-1', eyebrow: 'Campanha do mês', title: 'Lançamentos com condições de pré-venda', text: 'Unidades selecionadas com tabela exclusiva por tempo limitado.', cta: 'Ver lançamentos', href: 'https://www.lotusbrokers.com.br/lotus-lancamentos', img: '/assets/doppio-capa.jpg' },
  { slot: 'lotus-banner-2', eyebrow: 'Serra do Japi', title: 'Casas em condomínio a partir de R$ 1,2 mi', text: 'Mais verde, mais privacidade, a 10 minutos do centro de Jundiaí.', cta: 'Explorar imóveis', href: 'https://www.lotusbrokers.com.br/lotus-busca', img: '/gran-ville-santo-angelo/a025.jpg' },
  { slot: 'lotus-banner-3', eyebrow: 'Quer vender?', title: 'Uma estratégia de venda à altura do seu imóvel', text: 'Receba uma análise completa de precificação e posicionamento, conduzida por especialistas que conhecem profundamente a região.', cta: 'Anunciar agora', href: 'https://www.lotusbrokers.com.br/lotus-anunciar', img: 'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png' },
];

const reviewsData = [
  { initial: 'C', name: 'Camila & Rodrigo', where: 'compraram em Eloy Chaves', text: 'A Lotus entendeu o que a gente queria melhor do que a gente mesmo. Visitou tudo com a gente e achou a casa certa em duas semanas.' },
  { initial: 'P', name: 'Patrícia Senra', where: 'vendeu no Anhangabaú', text: 'Avaliaram meu apê com honestidade, fotografaram lindo e venderam pelo valor que eu queria. Sem enrolação, do começo ao fim.' },
  { initial: 'E', name: 'Eduardo Lima', where: 'comprou na planta · Itupeva', text: 'Me explicaram cada detalhe da tabela e da construtora. Senti que tinha alguém do meu lado, não só vendendo.' },
  { initial: 'O', name: 'Família Okabe', where: 'alugou na Malota', text: 'Atendimento de gente que se importa. Responderam rápido, resolveram a papelada e ainda nos receberam pessoalmente.' },
  { initial: 'R', name: 'Renata Vasconcelos', where: 'comprou em Medeiros', text: 'Profissionais, presentes e muito humanos. Recomendo de olhos fechados pra quem quer comprar bem na região.' },
  { initial: 'T', name: 'Thiago Bertolino', where: 'investiu em Vinhedo', text: 'Conhecem a região como ninguém. Me trouxeram uma oportunidade que eu não tinha visto em portal nenhum.' },
];

const guias = [
  { tag: 'Comprar', title: 'Como comprar um imóvel em Jundiaí', desc: 'Da pré-aprovação à escritura: o passo a passo sem susto.', read: '8 min' },
  { tag: 'Financiamento', title: 'Como conseguir a aprovação do financiamento', desc: 'Renda, score e documentação, o que os bancos olham.', read: '7 min' },
  { tag: 'Alugar', title: 'Documentos necessários para alugar', desc: 'Fiador, seguro-fiança ou caução: qual escolher.', read: '5 min' },
  { tag: 'Vender', title: 'Quanto vale o meu imóvel? Como avaliar', desc: 'O que pesa no preço e como não deixar dinheiro na mesa.', read: '6 min' },
  { tag: 'Custos', title: 'ITBI, escritura e registro: o que pagar', desc: 'Todos os custos da compra, em uma conta só.', read: '4 min' },
  { tag: 'Região', title: 'Morar em Itupeva vale a pena?', desc: 'Serra, condomínios e rotina: o guia honesto da cidade.', read: '6 min' },
];

const possibilities = [
  'Apartamentos à venda', 'Apartamentos para alugar', 'Apartamentos novos', 'Coberturas à venda',
  'Casas à venda', 'Casas para alugar', 'Casas em condomínio', 'Sobrados à venda',
  'Terrenos à venda', 'Terrenos para alugar', 'Áreas à venda', 'Chácaras à venda',
  'Salas comerciais', 'Lojas para alugar', 'Galpões à venda', 'Galpões para alugar',
];

const popularBairros = [
  'Medeiros – Jundiaí', 'Eloy Chaves – Jundiaí', 'Jardim Bonfiglioli – Jundiaí', 'Vila Nambi – Jundiaí',
  'Centro – Jundiaí', 'Anhangabaú – Jundiaí', 'Malota – Jundiaí', 'Reserva Ermida – Jundiaí',
  'Jardim Ermida I – Jundiaí', 'Engordadouro – Jundiaí', 'Caxambu – Jundiaí', 'Ponte de São João – Jundiaí',
  'Centro – Itupeva', 'Residencial Phytus – Itupeva', 'Fazenda Grande – Jundiaí', 'Vinhedo',
];

const popularCondos = [
  'Atmosphera Natural Living – Jundiaí', 'Residencial Phytus – Itupeva', 'Chácara Primavera – Jundiaí', 'Reserva da Serra – Jundiaí',
  'Reserva Ermida – Jundiaí', 'Villagio Azzure – Itupeva', 'Residencial Pecan – Itupeva', 'Terras da Alvorada – Jundiaí',
  'Gran Ville São Venâncio – Itupeva', 'Terra Caxambu – Jundiaí', 'Morada da Serra – Jundiaí', 'Spazio Jabuticabeiras – Jundiaí',
  'Brisas Jundiaí – Jundiaí', 'Chronos Residencial – Jundiaí', 'Brisas da Mata – Jundiaí', 'Gran Park – Itupeva',
];

const popularCidades = [
  'Jundiaí', 'Itupeva', 'Itatiba', 'Cajamar', 'Atibaia', 'Cabreúva', 'Camanducaia', 'Campinas',
  'Campo Limpo Paulista', 'Jarinu', 'Louveira', 'Osasco', 'São Paulo', 'Valinhos', 'Vinhedo', 'Várzea Paulista',
];

// developmentsFallback + DevelopmentCard vivem em lib/developments.ts (módulo
// compartilhável, sem 'use client') para poderem ser importados pelo Server
// Component da rota, que faz o merge com o Supabase.

/**
 * Depoimentos desativados enquanto não houver avaliações reais, autorizadas e
 * verificáveis (exceção autorizada na atualização de copy). A seção, os dados e
 * o carrossel permanecem no arquivo — só não são renderizados. Para reativar,
 * troque para `true`; o ideal é ligar antes na origem real (avaliações do Perfil
 * da Empresa no Google) em vez de voltar com os textos atuais.
 */
const DEPOIMENTOS_ATIVOS = false;

/**
 * Perfis com CRECI placeholder (000000-F…) desativados: "Erick Santos" e os
 * dois corretores abaixo são pessoas fictícias, com CRECI e números inventados.
 * Os dados ficam no arquivo para referência de layout; a grade não é renderizada.
 * A seção mantém o título e o link para /lotus-corretores, onde estão os
 * corretores REAIS vindos do Supabase. Reativar só com nome e CRECI verificáveis.
 */
const PERFIS_PLACEHOLDER_ATIVOS = false;

/**
 * Cards de bairro da home.
 *
 * Nome, cidade e foto vêm de lib/bairros.ts, a mesma fonte do guia em
 * /lotus-bairro. Antes eram copiados à mão aqui, e foi exatamente isso que
 * deixou o Vianelo sem foto na home depois de a imagem ser publicada no guia:
 * a cópia daqui continuou vazia. É o mesmo problema que a lista de posts do
 * blog logo abaixo já teve e que já foi resolvido do mesmo jeito.
 *
 * Aqui ficam só os campos que são da home: o slot da imagem e a contagem.
 */
const CARDS_BAIRRO = [
  { bairroSlug: 'eloy-chaves', count: '34 imóveis', slot: 'lotus-bairro-eloy' },
  { bairroSlug: 'vianelo-bonfiglioli', count: '', slot: 'lotus-bairro-vianelo' },
  { bairroSlug: 'medeiros', count: '22 imóveis', slot: 'lotus-bairro-medeiros' },
  { bairroSlug: 'caxambu', count: '', slot: 'lotus-bairro-caxambu' },
];

const neighborhoodsJundiai = CARDS_BAIRRO.flatMap((c) => {
  const b = getBairro(c.bairroSlug);
  // Slug renomeado no guia não vira card em branco em silêncio: o sintoma
  // seria um cartão sem nome nem foto e ninguém saberia por quê.
  if (!b) {
    console.error('[home] card de bairro sem guia correspondente:', c.bairroSlug);
    return [];
  }
  return [{ ...c, name: b.nome, city: b.cidade, img: b.heroImg }];
});


// Destaques do blog — os três artigos mais recentes, vindos da mesma fonte que
// alimenta /lotus-blog. Manter uma lista própria aqui era o que fazia a home
// exibir títulos que já não existiam e nenhuma capa.
const posts = POSTS.slice(0, 3);

const brokers: Array<{ name: string; squad: string; area: string; creci: string; slot: string; img?: string }> = [
  { name: 'Marina Tavares', squad: 'Alto Padrão', area: 'Eloy Chaves', creci: 'CRECI 000001-F', slot: 'lotus-broker-marina' },
  { name: 'Rafael Nunes', squad: 'Lançamentos', area: 'Itupeva', creci: 'CRECI 000002-F', slot: 'lotus-broker-rafael' },
];

/* Estilos de tab/finalidade (strings literais do fonte, reusadas via parseStyle). */
const tabBase = 'flex:1;text-align:center;padding:15px 10px;font-size:14.5px;font-weight:600;border:none;cursor:pointer;transition:all .2s;background:transparent;';
const tabOn = tabBase + 'color:#15241c;box-shadow:inset 0 -2px 0 #b18a4a;';
const tabOff = tabBase + 'color:#8aa593;';
const finBase = 'padding:9px 20px;font-size:13.5px;font-weight:600;border-radius:30px;border:1px solid;cursor:pointer;transition:all .2s;';
const finOn = finBase + 'background:#1d3a2c;color:#f7f2e8;border-color:#1d3a2c;';
const finOff = finBase + 'background:transparent;color:#3f6249;border-color:rgba(21,36,28,.2);';

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusHome({
  whatsapp = WHATSAPP_DEFAULT,
  liaEnabled = LIA_ENABLED_DEFAULT,
  bannerAuto = BANNER_AUTO_DEFAULT,
  revealAnim = REVEAL_ANIM_DEFAULT,
  developments,
}: {
  whatsapp?: string;
  liaEnabled?: boolean;
  bannerAuto?: boolean;
  revealAnim?: boolean;
  // Empreendimentos vindos do Supabase (ISR). Ausente/vazio → usa o fallback estático.
  developments?: DevelopmentCard[];
} = {}) {
  // Fonte efetiva: Supabase se veio conteúdo apresentável; senão o array curado.
  const devs: DevelopmentCard[] =
    developments && developments.length > 0 ? developments : developmentsFallback;
  // state (espelha o `state` do dc-runtime)
  const [liaOpen, setLiaOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'filtros' | 'conversa'>('filtros');
  const [finalidade, setFinalidade] = useState<'comprar' | 'alugar'>('comprar');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  // refs
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const reviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // waLink — lógica exata do script.
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Oi! Vim pelo site da Lotus e quero falar com um especialista do meu bairro.');

  /* -------- reveal + header scroll + carrosséis + stats (componentDidMount) -------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // --- reveal (IntersectionObserver) ---
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io: IntersectionObserver | undefined;
    if (!(revealAnim ?? true) || reduce || !('IntersectionObserver' in window)) {
      els.forEach((e) => {
        e.style.opacity = '1';
        e.style.transform = 'none';
      });
    } else {
      els.forEach((e) => {
        e.style.opacity = '0';
        e.style.transform = 'translateY(28px)';
        e.style.transition =
          'opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
      });
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              (en.target as HTMLElement).style.opacity = '1';
              (en.target as HTMLElement).style.transform = 'none';
              io!.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
      );
      els.forEach((e) => io!.observe(e));
    }

    // rede de segurança do estático: força reveal visível após 1200ms
    const revealFallback = setTimeout(() => {
      root
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((e) => {
          e.style.opacity = '1';
          e.style.transform = 'none';
        });
    }, 1200);

    // --- header on-scroll ---
    const header = root.querySelector<HTMLElement>('[data-header]');
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 40) {
        header.style.background = 'rgba(21,36,28,.85)';
        header.style.boxShadow = '0 1px 0 rgba(247,242,232,.08)';
      } else {
        header.style.background = 'rgba(21,36,28,0)';
        header.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- banner timer (5500ms, % 3) ---
    let bannerTimer: ReturnType<typeof setInterval> | undefined;
    if (bannerAuto ?? true) {
      bannerTimer = setInterval(() => {
        setBannerIndex((i) => (i + 1) % 3);
      }, 5500);
    }

    // --- review timer (5000ms, % 6) ---
    reviewTimerRef.current = setInterval(() => {
      setReviewIndex((i) => (i + 1) % 6);
    }, 5000);

    // --- cleanup (componentWillUnmount) ---
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (io) io.disconnect();
      if (bannerTimer) clearInterval(bannerTimer);
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
      clearTimeout(revealFallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- goReview: reinicia o timer de reviews ao navegar manualmente -------- */
  const goReview = (i: number) => {
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    setReviewIndex(((i % 6) + 6) % 6);
    reviewTimerRef.current = setInterval(() => {
      setReviewIndex((s) => (s + 1) % 6);
    }, 5000);
  };

  /* -------- fill: preenche e foca o input de busca por conversa -------- */
  const fill = (text: string) => {
    if (searchRef.current) {
      searchRef.current.value = text;
      searchRef.current.focus();
    }
  };

  // Derivados de estado (render context)
  const tab = activeTab;
  const fin = finalidade;
  const bi = bannerIndex;
  const ri = reviewIndex;

  const bannersView = banners.map((b, i) => ({
    ...b,
    style:
      'position:absolute;inset:0;opacity:' +
      (i === bi ? '1' : '0') +
      ';transition:opacity .8s ease;pointer-events:' +
      (i === bi ? 'auto' : 'none') +
      ';',
  }));
  const bannerDots = banners.map((_b, i) => ({
    go: () => setBannerIndex(i),
    style:
      'width:' +
      (i === bi ? '26px' : '9px') +
      ';height:9px;border-radius:30px;border:none;cursor:pointer;transition:all .3s;padding:0;background:' +
      (i === bi ? '#cdab6e' : 'rgba(247,242,232,.45)') +
      ';',
  }));

  const reviewsView = reviewsData.map((r, i) => ({
    ...r,
    style:
      'position:absolute;inset:0;opacity:' +
      (i === ri ? '1' : '0') +
      ';transition:opacity .55s ease;pointer-events:' +
      (i === ri ? 'auto' : 'none') +
      ';display:flex;align-items:center;justify-content:center;',
  }));
  const reviewDots = reviewsData.map((_r, i) => ({
    go: () => goReview(i),
    style:
      'width:' +
      (i === ri ? '26px' : '9px') +
      ';height:9px;border-radius:30px;border:none;cursor:pointer;transition:all .3s;padding:0;background:' +
      (i === ri ? '#b18a4a' : 'rgba(21,36,28,.18)') +
      ';',
  }));

  const faqs = faqData.map((f, i) => ({
    q: f.q,
    a: f.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((s) => (s === i ? -1 : i)),
  }));

  return (
    <div ref={rootRef} style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* ============ HEADER ============ */}
      <header
        data-header=""
        style={parseStyle(
          'position:fixed;top:0;left:0;right:0;z-index:90;background:rgba(21,36,28,0);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:background .4s ease, box-shadow .4s ease;'
        )}
      >
        <div style={parseStyle('max-width:1280px;margin:0 auto;padding:18px 40px;display:flex;align-items:center;justify-content:space-between;gap:32px;')}>
          <a href="#topo" style={parseStyle('display:flex;align-items:center;gap:12px;')}>
            <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
          </a>
          <nav style={parseStyle('display:flex;align-items:center;gap:34px;font-size:15px;font-weight:500;color:rgba(247,242,232,.86);')}>
            <Hoverable as="a" href="/lotus-lancamentos" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Lançamentos</Hoverable>
            <Hoverable as="a" href="/lotus-busca" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Comprar</Hoverable>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
            <Hoverable as="a" href="/lotus-sobre" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>A Lotus</Hoverable>
            <Hoverable as="a" href="/lotus-corretores" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
            <Hoverable as="a" href="/lotus-faq" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Guias</Hoverable>
            <Hoverable as="a" href="/lotus-blog" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
          </nav>
          <div style={parseStyle('display:flex;align-items:center;gap:12px;')}>
            <Hoverable
              as="a"
              href={waLink}
              target="_blank"
              rel="noopener"
              baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:11px 20px;border-radius:40px;transition:transform .2s ease, background .2s ease;')}
              hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-1px)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
              Falar com um especialista
            </Hoverable>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section id="topo" style={parseStyle('position:relative;min-height:680px;display:flex;align-items:flex-start;background:#1d3a2c;overflow:visible;')}>
        {/* Hero = LCP da home: fetchPriority high para o browser priorizar o download. */}
        <img src="https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png" alt="Vista aérea de Jundiaí ao amanhecer, Lotus Brokers" fetchPriority="high" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;')} />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg, rgba(21,36,28,.55) 0%, rgba(21,36,28,.15) 38%, rgba(21,36,28,.78) 82%, rgba(21,36,28,.95) 100%);')}></div>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('position:relative;z-index:2;width:100%;max-width:1280px;margin:0 auto;padding:150px 40px 80px;')}>
          <div style={parseStyle('max-width:760px;')}>
            <div style={parseStyle('background:linear-gradient(135deg,rgba(11,22,16,.9),rgba(21,36,28,.6) 58%,rgba(21,36,28,.24));backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid rgba(205,171,110,.18);border-radius:24px;padding:38px 42px 34px;max-width:780px;box-shadow:0 36px 80px -44px rgba(0,0,0,.65);margin-bottom:40px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#cdab6e;margin-bottom:20px;')}>Jundiaí · Itupeva · Interior de São Paulo</div>
              <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(42px,6vw,78px);line-height:1.02;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 26px;")}>
                Grandes escolhas<br /><em style={parseStyle('font-style:italic;font-weight:300;color:#cdab6e;')}>têm endereço</em>
              </h1>
              <p style={parseStyle('font-size:clamp(17px,1.5vw,20px);line-height:1.5;color:rgba(247,242,232,.88);max-width:560px;margin:0;font-weight:300;')}>Consultoria imobiliária em Jundiaí e Itupeva para comprar, vender ou investir com estratégia, clareza e segurança. Especialistas em imóveis de médio e alto padrão, com conhecimento profundo da região e acompanhamento em cada etapa.</p>
            </div>

            {/* hero search (filtros / conversa) */}
            <div style={parseStyle('background:rgba(247,242,232,.97);border-radius:18px;box-shadow:0 24px 60px -24px rgba(21,36,28,.55);max-width:720px;overflow:hidden;')}>
              <div style={parseStyle('display:flex;border-bottom:1px solid rgba(21,36,28,.1);')}>
                <button onClick={() => setActiveTab('filtros')} style={parseStyle(tab === 'filtros' ? tabOn : tabOff)}>Buscar por filtros</button>
                <button onClick={() => setActiveTab('conversa')} style={parseStyle(tab === 'conversa' ? tabOn : tabOff)}>Descrever o que procuro</button>
              </div>
              {tab === 'filtros' && (
                <div style={parseStyle('padding:18px;')}>
                  <div style={parseStyle('display:flex;gap:8px;margin-bottom:14px;')}>
                    <button onClick={() => setFinalidade('comprar')} style={parseStyle(fin === 'comprar' ? finOn : finOff)}>Comprar</button>
                    <button onClick={() => setFinalidade('alugar')} style={parseStyle(fin === 'alugar' ? finOn : finOff)}>Alugar</button>
                  </div>
                  <div style={parseStyle('display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;')}>
                    <select aria-label="Tipo de imóvel" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.18);background:#fff;color:#15241c;font-size:14px;padding:13px 12px;border-radius:10px;outline:none;cursor:pointer;')}>
                      <option>Qualquer tipo</option><option>Apartamento</option><option>Casa</option><option>Casa em condomínio</option><option>Terreno</option><option>Comercial</option>
                    </select>
                    <select aria-label="Cidade" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.18);background:#fff;color:#15241c;font-size:14px;padding:13px 12px;border-radius:10px;outline:none;cursor:pointer;')}>
                      <option>Todas as cidades</option><option>Jundiaí</option><option>Itupeva</option><option>Vinhedo</option><option>Valinhos</option><option>Cabreúva</option>
                    </select>
                    <select aria-label="Bairro" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.18);background:#fff;color:#15241c;font-size:14px;padding:13px 12px;border-radius:10px;outline:none;cursor:pointer;')}>
                      <option>Todos os bairros</option><option>Eloy Chaves</option><option>Anhangabaú</option><option>Malota</option><option>Medeiros</option><option>Centro</option>
                    </select>
                    <select aria-label="Faixa de preço" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.18);background:#fff;color:#15241c;font-size:14px;padding:13px 12px;border-radius:10px;outline:none;cursor:pointer;')}>
                      <option>Qualquer valor</option><option>Até R$ 500 mil</option><option>R$ 500 mil – 1 mi</option><option>R$ 1 – 2 mi</option><option>R$ 2 – 3 mi</option><option>Acima de R$ 3 mi</option>
                    </select>
                  </div>
                  <Hoverable
                    as="button"
                    onClick={() => { window.top!.location.href = 'https://www.lotusbrokers.com.br/lotus-busca'; }}
                    baseStyle={parseStyle('width:100%;display:inline-flex;align-items:center;justify-content:center;gap:9px;background:#b18a4a;color:#15241c;font-weight:600;font-size:15.5px;padding:15px;border:none;border-radius:10px;cursor:pointer;transition:background .2s, transform .2s;')}
                    hoverStyle={parseStyle('background:#a07a3c;transform:translateY(-1px)')}
                  >
                    Ver imóveis selecionados
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
                  </Hoverable>
                </div>
              )}
              {tab === 'conversa' && (
                <div style={parseStyle('padding:18px;')}>
                  <label htmlFor="lotus-q" style={parseStyle('display:block;font-size:12.5px;font-weight:600;letter-spacing:.04em;color:#3f6249;padding:2px 0 8px;')}>Descreva o imóvel que você procura</label>
                  <div style={parseStyle('display:flex;align-items:center;gap:10px;background:#fff;border:1px solid rgba(21,36,28,.14);border-radius:12px;padding:6px 6px 6px 16px;')}>
                    <input id="lotus-q" ref={searchRef} type="text" placeholder="Ex.: casa com 4 suítes perto da Serra do Japi, até R$ 2,5 mi" style={parseStyle('flex:1;border:none;outline:none;background:transparent;font-size:15.5px;color:#15241c;padding:9px 0;')} />
                    <Hoverable
                      as="button"
                      onClick={() => { if (searchRef.current) searchRef.current.focus(); }}
                      baseStyle={parseStyle('flex-shrink:0;display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;transition:background .2s;')}
                      hoverStyle={parseStyle('background:#a07a3c')}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
                    </Hoverable>
                  </div>
                  <div style={parseStyle('display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center;')}>
                    <span style={parseStyle('font-size:12.5px;color:#8aa593;')}>Tente:</span>
                    <Hoverable as="button" onClick={() => fill('Casa com 4 suítes perto da Serra do Japi, até R$ 2,5 mi')} baseStyle={parseStyle('background:#ece2cf;border:none;color:#3f6249;font-size:12.5px;padding:6px 12px;border-radius:30px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#e3d7be')}>4 suítes na Serra do Japi</Hoverable>
                    <Hoverable as="button" onClick={() => fill('Apartamento de 3 dormitórios no Anhangabaú, Jundiaí')} baseStyle={parseStyle('background:#ece2cf;border:none;color:#3f6249;font-size:12.5px;padding:6px 12px;border-radius:30px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#e3d7be')}>Apê 3 dorms no Anhangabaú</Hoverable>
                    <Hoverable as="button" onClick={() => fill('Terreno em condomínio fechado em Itupeva')} baseStyle={parseStyle('background:#ece2cf;border:none;color:#3f6249;font-size:12.5px;padding:6px 12px;border-radius:30px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#e3d7be')}>Terreno em Itupeva</Hoverable>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BANNERS ROTATIVOS ============ */}
      <section style={parseStyle('background:#f7f2e8;padding:48px 40px 64px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div style={parseStyle('position:relative;border-radius:22px;overflow:hidden;background:#1d3a2c;box-shadow:0 24px 60px -34px rgba(21,36,28,.5);height:clamp(320px,30vw,380px);')}>
            {/* hint-placeholder-count: 3 */}
            {bannersView.map((b, i) => (
              <div key={i} style={parseStyle(b.style)}>
                <div data-banner-grid="" style={parseStyle('position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;')}>
                  <div style={parseStyle('position:relative;background:#1d3a2c;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(28px,4vw,56px);z-index:2;')}>
                    <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>{b.eyebrow}</div>
                    <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3.2vw,38px);line-height:1.08;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 12px;")}>{b.title}</h3>
                    <p style={parseStyle('font-size:clamp(14px,1.3vw,16.5px);color:rgba(247,242,232,.78);font-weight:300;line-height:1.5;margin:0 0 22px;max-width:380px;')}>{b.text}</p>
                    <Hoverable as="a" href={b.href} target="_top" baseStyle={parseStyle('align-self:flex-start;display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border-radius:40px;transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-2px)')}>{b.cta} <span>→</span></Hoverable>
                  </div>
                  <div style={parseStyle('position:relative;background:#15241c;')}>
                    <ImageSlot src={b.img} id={b.slot} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} />
                    <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(90deg,#1d3a2c 0%,rgba(29,58,44,.35) 24%,rgba(29,58,44,0) 60%);')}></div>
                  </div>
                </div>
              </div>
            ))}
            <Hoverable as="button" onClick={() => setBannerIndex((s) => (s + 2) % 3)} aria-label="Banner anterior" baseStyle={parseStyle('position:absolute;top:50%;left:18px;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(247,242,232,.15);backdrop-filter:blur(4px);border:1px solid rgba(247,242,232,.3);color:#f7f2e8;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:3;')} hoverStyle={parseStyle('background:rgba(247,242,232,.28)')}>‹</Hoverable>
            <Hoverable as="button" onClick={() => setBannerIndex((s) => (s + 1) % 3)} aria-label="Próximo banner" baseStyle={parseStyle('position:absolute;top:50%;right:18px;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(247,242,232,.15);backdrop-filter:blur(4px);border:1px solid rgba(247,242,232,.3);color:#f7f2e8;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:3;')} hoverStyle={parseStyle('background:rgba(247,242,232,.28)')}>›</Hoverable>
            <div style={parseStyle('position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:center;gap:8px;z-index:3;')}>
              {/* hint-placeholder-count: 3 */}
              {bannerDots.map((d, i) => (
                <button key={i} onClick={d.go} aria-label="Ir para o banner" style={parseStyle(d.style)}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ DOIS MOTORES ============ */}
      <section id="comprar" style={parseStyle('background:#f7f2e8;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('max-width:620px;margin-bottom:56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Por onde começar</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Dois caminhos. O mesmo cuidado em cada escolha.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:28px;')}>
            <Hoverable as="a" target="_top" href="/lotus-lancamentos" data-reveal="" baseStyle={parseStyle('position:relative;display:block;border-radius:20px;overflow:hidden;min-height:380px;background:#1d3a2c;box-shadow:0 24px 60px -30px rgba(21,36,28,.45);transition:transform .4s ease, box-shadow .4s ease;')} hoverStyle={parseStyle('transform:translateY(-4px);box-shadow:0 34px 70px -30px rgba(21,36,28,.55)')}>
              <ImageSlot src="/altos-da-avenida/a005.png" id="lotus-motor-a" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} />
              <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.1),rgba(21,36,28,.85));')}></div>
              <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:36px;')}>
                <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Lançamentos</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:30px;color:#f7f2e8;margin:0 0 10px;line-height:1.08;")}>Lançamentos selecionados, da planta à chave</h3>
                <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.78);margin:0 0 18px;font-weight:300;line-height:1.5;')}>Empreendimentos acompanhados pelo Squad Lançamentos, quem conhece cada planta e a negociação com a construtora.</p>
                <span style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#cdab6e;font-weight:600;font-size:15px;')}>Ver empreendimentos <span style={parseStyle('font-size:18px;')}>→</span></span>
              </div>
            </Hoverable>
            <Hoverable as="a" href="/lotus-busca" target="_top" data-reveal="" baseStyle={parseStyle('position:relative;display:block;border-radius:20px;overflow:hidden;min-height:380px;background:#3f6249;box-shadow:0 24px 60px -30px rgba(21,36,28,.45);transition:transform .4s ease, box-shadow .4s ease;')} hoverStyle={parseStyle('transform:translateY(-4px);box-shadow:0 34px 70px -30px rgba(21,36,28,.55)')}>
              <ImageSlot src="/gran-ville-santo-angelo/a025.jpg" id="lotus-motor-b" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} />
              <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.1),rgba(21,36,28,.85));')}></div>
              <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:36px;')}>
                <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Comprar &amp; alugar</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:30px;color:#f7f2e8;margin:0 0 10px;line-height:1.08;")}>Imóveis selecionados para o seu momento</h3>
                <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.78);margin:0 0 18px;font-weight:300;line-height:1.5;')}>Busca orientada, conhecimento regional e uma seleção coerente com o que realmente importa para você.</p>
                <span style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#cdab6e;font-weight:600;font-size:15px;')}>Explorar a busca <span style={parseStyle('font-size:18px;')}>→</span></span>
              </div>
            </Hoverable>
          </div>
        </div>
      </section>

      {/* ============ LANÇAMENTOS DESTAQUE ============ */}
      <section id="lancamentos" style={parseStyle('background:#ece2cf;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:52px;')}>
            <div style={parseStyle('max-width:620px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Lançamentos · Jundiaí e Itupeva</div>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Lançamentos selecionados por quem conhece cada planta, condição e potencial.</h2>
            </div>
            <Link href="/lotus-lancamentos" data-reveal-launches="" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;white-space:nowrap;')}>Ver todos os empreendimentos <span>→</span></Link>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:26px;')}>
            {/* hint-placeholder-count: 6 */}
            {devs.map((d, i) => (
              // Sem landing o card cai no WhatsApp, mesmo comportamento de
              // /lotus-lancamentos. Antes o href virava `undefined` e o card
              // continuava dizendo "Ver este empreendimento" sem levar a lugar nenhum.
              <Hoverable key={i} as="a" href={d.href ?? waLink} target={d.href ? '_top' : '_blank'} rel="noopener" data-reveal="" baseStyle={parseStyle('display:flex;flex-direction:column;background:#f7f2e8;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px -28px rgba(21,36,28,.35);transition:transform .35s ease, box-shadow .35s ease;')} hoverStyle={parseStyle('transform:translateY(-5px);box-shadow:0 30px 60px -30px rgba(21,36,28,.45)')}>
                <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}>
                  {d.img && <img src={d.img} alt={d.name} loading="lazy" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;')} />}
                  <div style={parseStyle('position:absolute;top:14px;left:14px;display:flex;gap:8px;')}>
                    <span style={parseStyle('background:rgba(21,36,28,.78);backdrop-filter:blur(4px);color:#f7f2e8;font-size:11.5px;font-weight:600;letter-spacing:.04em;padding:6px 11px;border-radius:30px;')}>{d.location}</span>
                  </div>
                  {d.exclusive && (
                    <span style={parseStyle('position:absolute;top:14px;right:14px;background:#b18a4a;color:#15241c;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 11px;border-radius:30px;')}>Lotus Listing</span>
                  )}
                </div>
                <div style={parseStyle('padding:22px 22px 26px;display:flex;flex-direction:column;flex:1;')}>
                  <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#3f6249;margin-bottom:8px;')}>{d.stage} · {d.builder}</div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:24px;line-height:1.05;letter-spacing:-.01em;margin:0 0 8px;color:#15241c;")}>{d.name}</h3>
                  <div style={parseStyle('font-size:14.5px;color:#3f6249;margin-bottom:18px;font-weight:400;')}>{d.specs}</div>
                  <div style={parseStyle('margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;')}>
                    <div>
                      <div style={parseStyle('font-size:12px;color:#8aa593;font-weight:500;')}>a partir de</div>
                      <div style={parseStyle("font-family:'Fraunces',serif;font-size:22px;color:#1d3a2c;font-weight:400;")}>{d.price}</div>
                    </div>
                    <span style={parseStyle('color:#b18a4a;font-weight:600;font-size:14px;white-space:nowrap;')}>{d.href ? 'Ver este empreendimento →' : 'Falar sobre este →'}</span>
                  </div>
                </div>
              </Hoverable>
            ))}
          </div>
          <div data-reveal="" style={parseStyle('display:flex;justify-content:center;margin-top:48px;')}>
            <Hoverable as="a" id="btn-vermais" data-reveal-launches="" href="/lotus-lancamentos" target="_top" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 32px;border-radius:40px;transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#15241c;transform:translateY(-2px)')}>Ver mais empreendimentos <span style={parseStyle('font-size:18px;')}>→</span></Hoverable>
          </div>
        </div>
      </section>

      {/* ============ COMO TRABALHAMOS / SQUADS ============ */}
      <section id="sobre" style={parseStyle('background:#1d3a2c;padding:120px 40px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1280px;margin:0 auto;position:relative;')}>
          <div data-reveal="" style={parseStyle('max-width:680px;margin-bottom:60px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Como a gente trabalha</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0 0 18px;color:#f7f2e8;")}>Especialistas para cada tipo de decisão.</h2>
            <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.7);font-weight:300;line-height:1.55;margin:0;')}>Cada jornada exige conhecimento específico. Por isso, nosso atendimento é organizado por especialidade, com consultores preparados para compreender o seu momento e conduzir cada etapa com profundidade.</p>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1px;background:rgba(247,242,232,.14);border-radius:18px;overflow:hidden;')}>
            {SQUADS.map((s, i) => (
              <div key={i} data-reveal="" style={parseStyle('background:#1d3a2c;padding:36px 30px;display:flex;flex-direction:column;')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:40px;font-weight:300;color:#cdab6e;line-height:1;margin-bottom:18px;")}>{s.num}</div>
                <h3 style={parseStyle('font-size:19px;font-weight:600;color:#f7f2e8;margin:0 0 10px;')}>Squad {s.nome}</h3>
                <p style={parseStyle('font-size:14.5px;color:rgba(247,242,232,.66);font-weight:300;line-height:1.5;margin:0;')}>{s.descricao}</p>
              </div>
            ))}
          </div>
          <div data-reveal="" style={parseStyle('margin-top:48px;display:flex;justify-content:center;')}>
            <Hoverable as="a" href="/lotus-sobre" target="_top" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:10px;background:#cdab6e;color:#15241c;font-weight:700;font-size:16px;padding:15px 32px;border-radius:40px;transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#b18a4a;transform:translateY(-2px)')}>Quem somos &amp; nossa equipe <span style={parseStyle('font-size:18px;')}>{'→'}</span></Hoverable>
          </div>
        </div>
      </section>

      {/* ============ BAIRROS ============ */}
      <section id="bairros" style={parseStyle('background:#f7f2e8;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('max-width:640px;margin-bottom:52px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Nossa região</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0 0 16px;color:#15241c;")}>Conhecimento local muda a qualidade da sua escolha.</h2>
            <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>Serra do Japi, vinhedos, condomínios. A gente conhece cada bairro pelo que ele tem de vivido, a padaria da esquina, a escola a 9 minutos, o sol da manhã na sala.</p>
          </div>
          <div data-reveal="" style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
            <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:26px;color:#15241c;margin:0;")}>Jundiaí</h3>
            <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.14);')}></span>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;margin-bottom:56px;')}>
            {/* hint-placeholder-count: 4 */}
            {neighborhoodsJundiai.map((n, i) => (
              <Hoverable key={i} as="a" href={`/lotus-bairro/${n.bairroSlug}`} target="_top" data-reveal="" baseStyle={parseStyle('position:relative;display:block;aspect-ratio:3/4;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -28px rgba(21,36,28,.4);transition:transform .35s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
                <ImageSlot id={n.slot} src={n.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={n.name} />
                <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,0) 40%,rgba(21,36,28,.85));')}></div>
                <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:20px;')}>
                  <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#cdab6e;margin-bottom:5px;')}>{n.city}</div>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:21px;font-weight:400;color:#f7f2e8;line-height:1.05;")}>{n.name}</div>
                  <div style={parseStyle('font-size:12.5px;color:rgba(247,242,232,.7);margin-top:5px;')}>{n.count}</div>
                </div>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CORRETORES / PROVA HUMANA ============ */}
      <section id="corretores" style={parseStyle('background:#ece2cf;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('max-width:640px;margin-bottom:52px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Os especialistas</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Gente que conhece cada esquina e te chama pelo nome.</h2>
          </div>
          {PERFIS_PLACEHOLDER_ATIVOS && (
          <div style={parseStyle('display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:24px;')}>
            {/* founder feature */}
            <div data-reveal="" style={parseStyle('grid-row:span 1;position:relative;border-radius:20px;overflow:hidden;min-height:440px;background:#1d3a2c;box-shadow:0 24px 60px -30px rgba(21,36,28,.45);')}>
              <ImageSlot id="lotus-founder" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Erick Santos, Fundador" />
              <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.15) 30%,rgba(21,36,28,.9));')}></div>
              <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:34px;')}>
                <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Fundador</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:30px;color:#f7f2e8;margin:0 0 8px;line-height:1.05;")}>Erick Santos</h3>
                <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.5;margin:0 0 16px;')}>Operador real do mercado imobiliário da região há mais de uma década. CRECI 000000-F.</p>
                <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:rgba(247,242,232,.12);border:1px solid rgba(247,242,232,.3);color:#f7f2e8;font-weight:600;font-size:14px;padding:10px 18px;border-radius:30px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.2)')}>Falar com Erick →</Hoverable>
              </div>
            </div>
            {/* hint-placeholder-count: 2 */}
            {brokers.map((b, i) => (
              <div key={i} data-reveal="" style={parseStyle('background:#f7f2e8;border-radius:20px;overflow:hidden;box-shadow:0 18px 44px -30px rgba(21,36,28,.35);display:flex;flex-direction:column;')}>
                <div style={parseStyle('position:relative;aspect-ratio:1/1;background:#3f6249;')}>
                  <ImageSlot src={b.img} id={b.slot} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={b.name} />
                </div>
                <div style={parseStyle('padding:22px;')}>
                  <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#b18a4a;margin-bottom:8px;')}>{b.squad}</div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0 0 5px;line-height:1.05;")}>{b.name}</h3>
                  <p style={parseStyle('font-size:13.5px;color:#3f6249;margin:0 0 4px;')}>Especialista em {b.area}</p>
                  <p style={parseStyle('font-size:12.5px;color:#8aa593;margin:0;')}>{b.creci}</p>
                </div>
              </div>
            ))}
          </div>
          )}
          <div data-reveal="" style={parseStyle('margin-top:38px;')}>
            <Link href="/lotus-corretores" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Conhecer todos os corretores <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
      {DEPOIMENTOS_ATIVOS && (
      <section id="depoimentos" style={parseStyle('background:#f7f2e8;padding:90px 40px 36px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:48px;')}>
            <div style={parseStyle('max-width:620px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Quem viveu, conta</div>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Grandes escolhas, contadas por quem viveu.</h2>
            </div>
          </div>

          <div style={parseStyle('position:relative;max-width:840px;margin:0 auto;')}>
            <div style={parseStyle('position:relative;min-height:290px;')}>
              {/* hint-placeholder-count: 6 */}
              {reviewsView.map((r, i) => (
                <div key={i} style={parseStyle(r.style)}>
                  <div style={parseStyle('width:100%;background:#fff;border-radius:24px;padding:48px clamp(28px,5vw,60px);box-shadow:0 28px 64px -36px rgba(21,36,28,.4);text-align:center;')}>
                    <div style={parseStyle('display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:22px;')}>
                      <span style={parseStyle('color:#b18a4a;font-size:19px;letter-spacing:4px;')}>★★★★★</span>
                      <svg width="22" height="22" viewBox="0 0 24 24" aria-label="Google"><path fill="#4285F4" d="M21.6 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1Z"></path><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"></path><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z"></path><path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1Z"></path></svg>
                    </div>
                    <p style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(20px,2.3vw,27px);line-height:1.34;letter-spacing:-.01em;color:#15241c;margin:0 0 28px;")}>“{r.text}”</p>
                    <div style={parseStyle('display:flex;align-items:center;justify-content:center;gap:12px;')}>
                      <div style={parseStyle("width:46px;height:46px;border-radius:50%;background:#1d3a2c;display:flex;align-items:center;justify-content:center;color:#cdab6e;font-family:'Fraunces',serif;font-size:19px;flex-shrink:0;")}>{r.initial}</div>
                      <div style={parseStyle('text-align:left;')}>
                        <div style={parseStyle('font-size:15px;font-weight:600;color:#15241c;')}>{r.name}</div>
                        <div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{r.where}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Hoverable as="button" onClick={() => goReview(ri - 1)} aria-label="Depoimento anterior" baseStyle={parseStyle('position:absolute;top:50%;left:-8px;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:#fff;border:1px solid rgba(21,36,28,.12);color:#1d3a2c;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px -18px rgba(21,36,28,.5);transition:all .2s;z-index:3;')} hoverStyle={parseStyle('background:#1d3a2c;color:#f7f2e8;border-color:#1d3a2c')}>‹</Hoverable>
            <Hoverable as="button" onClick={() => goReview(ri + 1)} aria-label="Próximo depoimento" baseStyle={parseStyle('position:absolute;top:50%;right:-8px;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:#fff;border:1px solid rgba(21,36,28,.12);color:#1d3a2c;font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px -18px rgba(21,36,28,.5);transition:all .2s;z-index:3;')} hoverStyle={parseStyle('background:#1d3a2c;color:#f7f2e8;border-color:#1d3a2c')}>›</Hoverable>
          </div>

          <div data-reveal="" style={parseStyle('margin-top:30px;display:flex;justify-content:center;gap:8px;')}>
            {/* hint-placeholder-count: 6 */}
            {reviewDots.map((d, i) => (
              <button key={i} onClick={d.go} aria-label="Ir para o depoimento" style={parseStyle(d.style)}></button>
            ))}
          </div>

          <div data-reveal="" style={parseStyle('margin-top:34px;text-align:center;')}>
          </div>
        </div>
      </section>
      )}

      {/* ============ BLOG ============ */}
      <section id="blog" style={parseStyle('background:#f7f2e8;padding:56px 40px 120px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:52px;')}>
            <div style={parseStyle('max-width:620px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Blog Lotus · em breve</div>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Conhecimento para grandes escolhas.</h2>
            </div>
            <Hoverable as="a" href="/lotus-blog" target="_top" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:700;font-size:15px;padding:13px 26px;border-radius:40px;white-space:nowrap;transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-2px)')}>Em breve <span style={parseStyle('font-size:17px;')}>→</span></Hoverable>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:26px;margin-bottom:64px;')}>
            {/* hint-placeholder-count: 3 */}
            {posts.map((p, i) => (
              <Hoverable key={i} as="a" data-reveal="" baseStyle={parseStyle('cursor:default;display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px -30px rgba(21,36,28,.32);transition:transform .35s ease, box-shadow .35s ease;')} hoverStyle={parseStyle('transform:translateY(-5px);box-shadow:0 30px 60px -32px rgba(21,36,28,.42)')}>
                <div style={parseStyle('position:relative;aspect-ratio:16/10;background:#3f6249;')}>
                  <ImageSlot id={p.slot} src={p.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={p.title} />
                  <span style={parseStyle('position:absolute;top:14px;left:14px;background:rgba(247,242,232,.94);color:#1d3a2c;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 11px;border-radius:30px;')}>{p.cat}</span>
                </div>
                <div style={parseStyle('padding:24px;display:flex;flex-direction:column;flex:1;')}>
                  <div style={parseStyle('font-size:12.5px;color:#8aa593;font-weight:500;margin-bottom:10px;')}>{p.date} · {p.read}</div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;line-height:1.12;letter-spacing:-.01em;margin:0 0 10px;color:#15241c;")}>{p.title}</h3>
                  <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.5;margin:0 0 18px;')}>{p.excerpt}</p>
                  <span style={parseStyle('margin-top:auto;color:#b18a4a;font-weight:600;font-size:14px;')}>Ler artigo →</span>
                </div>
              </Hoverable>
            ))}
          </div>

          {/* newsletter */}
          <div data-reveal="" style={parseStyle('position:relative;overflow:hidden;background:#1d3a2c;border-radius:24px;padding:56px 48px;display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;')}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
            <div style={parseStyle('position:relative;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>Newsletter Lotus</div>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,36px);line-height:1.1;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 14px;")}>Inscreva-se e receba informação de quem conhece o mercado, para decidir melhor.</h3>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.7);font-weight:300;line-height:1.55;margin:0;')}>Lançamentos antes de todo mundo, leitura de mercado de Jundiaí e Itupeva e dicas de quem vive a região. Sem spam, só o que importa.</p>
            </div>
            <div style={parseStyle('position:relative;')}>
              {subscribed && (
                <div style={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(205,171,110,.4);border-radius:16px;padding:28px;text-align:center;')}>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:22px;color:#cdab6e;margin-bottom:8px;")}>Inscrição confirmada 🌿</div>
                  <p style={parseStyle('font-size:14.5px;color:rgba(247,242,232,.8);font-weight:300;margin:0;')}>Pronto! Você vai receber as próximas notícias da Lotus no seu e-mail.</p>
                </div>
              )}
              {!subscribed && (
                <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} style={parseStyle('display:flex;flex-direction:column;gap:12px;')}>
                  <input ref={emailRef} type="email" required placeholder="seu@email.com" style={parseStyle('border:1px solid rgba(247,242,232,.25);background:rgba(247,242,232,.06);outline:none;color:#f7f2e8;font-size:16px;padding:16px 18px;border-radius:12px;')} />
                  <Hoverable as="button" type="submit" baseStyle={parseStyle('display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:16px 24px;border:none;border-radius:12px;cursor:pointer;transition:background .2s, transform .2s;')} hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-1px)')}>Quero me inscrever <span>→</span></Hoverable>
                  <p style={parseStyle('font-size:12px;color:rgba(247,242,232,.5);margin:2px 0 0;line-height:1.5;')}>Ao se inscrever você concorda com a nossa Política de Privacidade (LGPD). Cancele quando quiser.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUIAS PRÁTICOS ============ */}
      <section id="guias" style={parseStyle('background:#ece2cf;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:52px;')}>
            <div style={parseStyle('max-width:620px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Guias práticos · em breve</div>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);line-height:1.06;letter-spacing:-.02em;margin:0 0 16px;color:#15241c;")}>Boas decisões começam com boas perguntas.</h2>
              <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>Conteúdo direto pra você decidir com segurança, de quem faz isso todos os dias na região.</p>
            </div>
            <Link href="/lotus-faq" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;white-space:nowrap;')}>Em breve <span>→</span></Link>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px;')}>
            {/* hint-placeholder-count: 6 */}
            {guias.map((g, i) => (
              <Hoverable key={i} as="a" data-reveal="" baseStyle={parseStyle('cursor:default;display:flex;gap:20px;align-items:flex-start;background:#f7f2e8;border-radius:16px;padding:26px;box-shadow:0 16px 40px -32px rgba(21,36,28,.4);transition:transform .3s ease, box-shadow .3s ease;')} hoverStyle={parseStyle('transform:translateY(-3px);box-shadow:0 26px 54px -34px rgba(21,36,28,.5)')}>
                <div style={parseStyle('flex-shrink:0;width:48px;height:48px;border-radius:12px;background:#1d3a2c;display:flex;align-items:center;justify-content:center;')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"></path><path d="M4 4.5A2.5 2.5 0 0 0 6.5 7H20"></path><path d="M9 12h7M9 15.5h5"></path></svg>
                </div>
                <div style={parseStyle('flex:1;')}>
                  <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:8px;')}>{g.tag} · {g.read}</div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:19px;line-height:1.15;color:#15241c;margin:0 0 6px;")}>{g.title}</h3>
                  <p style={parseStyle('font-size:14px;color:#3f6249;font-weight:300;line-height:1.45;margin:0;')}>{g.desc}</p>
                </div>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ANUNCIAR CTA ============ */}
      <section id="anunciar" style={parseStyle('background:#3f6249;padding:110px 40px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div data-reveal="" style={parseStyle('max-width:880px;margin:0 auto;text-align:center;position:relative;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:20px;')}>Quer vender ou alugar?</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4.4vw,52px);line-height:1.05;letter-spacing:-.02em;margin:0 0 22px;color:#f7f2e8;")}>Seu imóvel merece uma estratégia à altura e um especialista para conduzi-la.</h2>
          <p style={parseStyle('font-size:18px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;max-width:600px;margin:0 auto 36px;')}>Avaliação responsável, apresentação cuidadosa, estratégia de divulgação e acompanhamento especializado do início ao fim.</p>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:14px;justify-content:center;')}>
            <Hoverable as="a" href="/lotus-anunciar" target="_top" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-2px)')}>Anunciar meu imóvel <span>→</span></Hoverable>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:transparent;border:1.5px solid rgba(247,242,232,.4);color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.1)')}>Falar no WhatsApp</Hoverable>
          </div>
        </div>
      </section>

      {/* ============ GEO / FAQ ============ */}
      <section style={parseStyle('background:#f7f2e8;padding:120px 40px;')}>
        <div style={parseStyle('max-width:1040px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:60px;align-items:start;')}>
          <div data-reveal="">
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Perguntas frequentes</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.4vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 24px;color:#15241c;")}>A Lotus, em poucas palavras.</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Em resumo</div>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.6;margin:0;')}>A Lotus Brokers é uma consultoria imobiliária de Jundiaí e Itupeva, especializada em compra, venda, locação e investimentos. Unimos conhecimento regional, estratégia e acompanhamento próximo e personalizado para conduzir cada decisão com clareza e segurança.</p>
            </div>
          </div>
          <div data-reveal="" style={parseStyle('display:flex;flex-direction:column;')}>
            {/* hint-placeholder-count: 3 */}
            {faqs.map((f, i) => (
              <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:24px 0;text-align:left;')}>
                  <span style={parseStyle('font-size:17.5px;font-weight:500;color:#15241c;line-height:1.3;')}>{f.q}</span>
                  <span style={parseStyle('flex-shrink:0;font-size:24px;color:#b18a4a;line-height:1;font-weight:300;')}>{f.sign}</span>
                </button>
                {f.open && (
                  <p style={parseStyle('font-size:15.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 24px;')}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3 CTA CARDS ============ */}
      <section style={parseStyle('background:#1d3a2c;padding:100px 40px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1280px;margin:0 auto;position:relative;')}>
          <div data-reveal="" style={parseStyle('text-align:center;max-width:620px;margin:0 auto 52px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>Como podemos ajudar</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#f7f2e8;")}>Seja qual for o seu momento, tem um especialista pra ele.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:26px;')}>
            <div data-reveal="" style={parseStyle('background:#f7f2e8;border-radius:20px;padding:42px 38px;box-shadow:0 18px 44px -30px rgba(0,0,0,.4);display:flex;flex-direction:column;')}>
              <div style={parseStyle('width:56px;height:56px;border-radius:14px;background:#ece2cf;display:flex;align-items:center;justify-content:center;margin-bottom:26px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d3a2c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5"></circle><path d="m10.8 12.2 9.2-9.2"></path><path d="m16 7 2.5 2.5"></path><path d="m18.5 4.5 2.5 2.5"></path></svg>
              </div>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:26px;line-height:1.08;color:#15241c;margin:0 0 14px;")}>Venda ou alugue com a Lotus</h3>
              <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 28px;')}>Avaliação sem custo e processo transparente, do anúncio à chave, com um especialista do seu bairro.</p>
              <Link href="/lotus-anunciar" style={parseStyle('margin-top:auto;display:inline-flex;align-items:center;justify-content:space-between;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:6px;')}>Anunciar meu imóvel <span style={parseStyle('font-size:18px;')}>→</span></Link>
            </div>
            <div data-reveal="" style={parseStyle('background:#f7f2e8;border-radius:20px;padding:42px 38px;box-shadow:0 18px 44px -30px rgba(0,0,0,.4);display:flex;flex-direction:column;')}>
              <div style={parseStyle('width:56px;height:56px;border-radius:14px;background:#ece2cf;display:flex;align-items:center;justify-content:center;margin-bottom:26px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d3a2c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path><path d="M9.5 21v-6h5v6"></path></svg>
              </div>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:26px;line-height:1.08;color:#15241c;margin:0 0 14px;")}>Procurando um novo lar?</h3>
              <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 28px;')}>Imóveis curados pelo especialista do bairro, com o valor certo pra sua família, sem catálogo de volume.</p>
              <Link href="/lotus-busca" style={parseStyle('margin-top:auto;display:inline-flex;align-items:center;justify-content:space-between;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:6px;')}>Ver imóveis <span style={parseStyle('font-size:18px;')}>→</span></Link>
            </div>
            <div data-reveal="" style={parseStyle('background:#f7f2e8;border-radius:20px;padding:42px 38px;box-shadow:0 18px 44px -30px rgba(0,0,0,.4);display:flex;flex-direction:column;')}>
              <div style={parseStyle('width:56px;height:56px;border-radius:14px;background:#ece2cf;display:flex;align-items:center;justify-content:center;margin-bottom:26px;')}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d3a2c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M2 22h20"></path><path d="M10 6h4M10 10h4M10 14h4M10 18h4"></path></svg>
              </div>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:26px;line-height:1.08;color:#15241c;margin:0 0 14px;")}>Quer alugar?</h3>
              <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 28px;')}>As melhores opções da região, com quem conhece cada rua. Conta pra gente o que você precisa.</p>
              <a href={waLink} target="_blank" rel="noopener" style={parseStyle('margin-top:auto;display:inline-flex;align-items:center;justify-content:space-between;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:6px;')}>Falar com um especialista <span style={parseStyle('font-size:18px;')}>→</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SEO LINKS ============ */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 40px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          <div data-reveal="" style={parseStyle('max-width:640px;margin-bottom:56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Explore a região</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);line-height:1.06;letter-spacing:-.02em;margin:0;color:#15241c;")}>Encontre por tipo, bairro, condomínio ou cidade.</h2>
          </div>

          <div data-reveal="" style={parseStyle('margin-bottom:48px;')}>
            <div style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0;")}>Possibilidades de imóveis</h3>
              <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.12);')}></span>
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px 24px;')}>
              {/* hint-placeholder-count: 16 */}
              {possibilities.map((x, i) => (
                <Hoverable key={i} as="a" href="#comprar" baseStyle={parseStyle('font-size:14.5px;color:#3f6249;transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>{x}</Hoverable>
              ))}
            </div>
          </div>

          <div data-reveal="" style={parseStyle('margin-bottom:48px;')}>
            <div style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0;")}>Bairros mais populares</h3>
              <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.12);')}></span>
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px 24px;')}>
              {/* hint-placeholder-count: 16 */}
              {popularBairros.map((x, i) => (
                <Hoverable key={i} as="a" href="#bairros" baseStyle={parseStyle('font-size:14.5px;color:#3f6249;transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>{x}</Hoverable>
              ))}
            </div>
          </div>

          <div data-reveal="" style={parseStyle('margin-bottom:48px;')}>
            <div style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0;")}>Condomínios mais populares</h3>
              <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.12);')}></span>
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px 24px;')}>
              {/* hint-placeholder-count: 16 */}
              {popularCondos.map((x, i) => (
                <Hoverable key={i} as="a" href="#lancamentos" baseStyle={parseStyle('font-size:14.5px;color:#3f6249;transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>{x}</Hoverable>
              ))}
            </div>
          </div>

          <div data-reveal="">
            <div style={parseStyle('display:flex;align-items:baseline;gap:14px;margin-bottom:22px;')}>
              <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0;")}>Cidades atendidas</h3>
              <span style={parseStyle('height:1px;flex:1;background:rgba(21,36,28,.12);')}></span>
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px 24px;')}>
              {/* hint-placeholder-count: 16 */}
              {popularCidades.map((x, i) => (
                <Hoverable key={i} as="a" href="#comprar" baseStyle={parseStyle('font-size:14.5px;color:#3f6249;transition:color .2s;')} hoverStyle={parseStyle('color:#b18a4a')}>{x}</Hoverable>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer data-rodape-portal="" style={parseStyle('background:#15241c;padding:80px 40px 40px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1280px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding-bottom:56px;border-bottom:1px solid rgba(247,242,232,.12);')}>
            <div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px;margin-bottom:20px;')}>
                <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
              </div>
              <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:19px;color:rgba(247,242,232,.85);line-height:1.35;max-width:300px;margin:0 0 20px;")}>Grandes escolhas têm endereço.</p>
              <p style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.55);line-height:1.6;margin:0;')}>Consultoria imobiliária para compra, venda, locação e investimento em imóveis de médio e alto padrão em Jundiaí, Itupeva e região.</p>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>A Lotus</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="#sobre" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Sobre nós</Hoverable>
                <Hoverable as="a" href="/lotus-corretores" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
                <Hoverable as="a" href="/lotus-sobre" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Seja um corretor</Hoverable>
                <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Contato</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Serviços</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="/lotus-lancamentos" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Lançamentos</Hoverable>
                <Hoverable as="a" href="/lotus-busca" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Comprar &amp; alugar</Hoverable>
                <Hoverable as="a" href="/lotus-anunciar" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Anunciar imóvel</Hoverable>
                <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
                <Hoverable as="a" href="/lotus-blog" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Políticas</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="../lotus-privacidade/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Privacidade (LGPD)</Hoverable>
                <Hoverable as="a" href="../lotus-termos/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Termos de uso</Hoverable>
                <Hoverable as="a" href="../lotus-cookies/" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Cookies</Hoverable>
              </div>
            </div>
          </div>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding-top:28px;font-size:13px;color:rgba(247,242,232,.5);')}>
            <div>{footerLegalLine()}</div>
            <div style={parseStyle('display:flex;gap:12px;align-items:center;')}>
              <Hoverable as="a" href="https://www.facebook.com/profile.php?id=61587132887416&locale=pt_BR" target="_blank" rel="noopener" aria-label="Facebook" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z"></path></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.youtube.com/@LotusBrokersImobili%C3%A1ria" target="_blank" rel="noopener" aria-label="YouTube" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z"></path></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.instagram.com/lotusbrokers_/" target="_blank" rel="noopener" aria-label="Instagram" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.tiktok.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="TikTok" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z"></path></svg>
              </Hoverable>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ FLOATING: LIA + WHATSAPP ============ */}
      {liaEnabled && (
        <div data-flutuantes="" style={parseStyle('position:fixed;right:24px;bottom:24px;z-index:95;display:flex;flex-direction:column;align-items:flex-end;gap:14px;')}>
          {liaOpen && <AtendimentoChat onClose={() => setLiaOpen(false)} />}
          <div style={parseStyle('display:flex;gap:12px;align-items:center;')}>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" baseStyle={parseStyle('width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);transition:transform .2s;')} hoverStyle={parseStyle('transform:translateY(-2px)')}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
            </Hoverable>
            <Hoverable as="button" onClick={() => setLiaOpen((s) => !s)} aria-label="Abrir atendimento Lotus" baseStyle={parseStyle('height:54px;padding:0 22px 0 18px;border-radius:40px;background:#b18a4a;border:none;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);transition:transform .2s, background .2s;')} hoverStyle={parseStyle('background:#cdab6e;transform:translateY(-2px)')}>
              <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5C20.5 9 20.5 16 16 22.5 11.5 16 11.5 9 16 2.5Z" fill="#15241c"></path><path d="M27.5 8.5C22.5 11 18.2 15 16 22.5 22 21.2 26.3 16.8 27.5 8.5Z" fill="#25543b"></path><path d="M4.5 8.5C9.5 11 13.8 15 16 22.5 10 21.2 5.7 16.8 4.5 8.5Z" fill="#15241c" opacity=".85"></path></svg>
              <span style={parseStyle('font-size:14.5px;font-weight:600;color:#15241c;')}>Atendimento</span>
            </Hoverable>
          </div>
        </div>
      )}
    </div>
  );
}
