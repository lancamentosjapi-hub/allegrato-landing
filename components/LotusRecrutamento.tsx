'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusRecrutamento — porte 1:1 de lotus-recrutamento/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (mesmas de LotusHome / LotusBairro / LotusAnunciar):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *
 * O fonte NÃO tem data-reveal / contadores / carrosséis — nenhuma lógica de reveal é inventada.
 * Comportamentos imperativos portados: submitForm (setState + scrollIntoview no #candidatar),
 * toggle de FAQ (openFaq) e o banner de cookies (script vanilla no fim do <body> do fonte).
 */

import Link from 'next/link';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Converte uma string CSS ("a:b;c:d") em objeto React.CSSProperties.
 * camelCase nas propriedades; preserva valores EXATOS (cores, px, gradientes).
 * Split cuidadoso: separa apenas no PRIMEIRO ":" de cada declaração (valores
 * como gradientes e data: URIs contêm ":" internos). -webkit- -> Webkit; --custom mantém.
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
  // client-side instantânea + prefetch, sem full reload/tela branca.
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

/**
 * Banner de cookies — porte fiel do <div id="lotus-cookie"> + <script> vanilla do fim do
 * <body> do fonte. Mostra o banner só quando não há o cookie "lotus_consent"; ao aceitar/recusar
 * grava o cookie (max-age 180 dias) e empurra o evento pro dataLayer.
 */
function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (document.cookie.indexOf('lotus_consent=') === -1) {
        setVisible(true);
      }
    } catch {
      /* noop — mesmo try/catch defensivo do fonte */
    }
  }, []);

  const setConsent = (v: string) => {
    try {
      document.cookie =
        'lotus_consent=' + v + ';path=/;max-age=15552000;SameSite=Lax';
      setVisible(false);
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: 'cookie_consent', consent: v });
    } catch {
      /* noop */
    }
  };

  return (
    <div
      id="lotus-cookie"
      role="dialog"
      aria-label="Aviso de cookies"
      style={{
        ...parseStyle(
          'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#15241c;color:#f7f2e8;border:1px solid rgba(205,171,110,.4);border-radius:14px;padding:18px 20px;box-shadow:0 18px 50px -20px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;'
        ),
        display: visible ? 'block' : 'none',
      }}
    >
      <p style={parseStyle('margin:0 0 12px;font-size:13.5px;line-height:1.5;color:rgba(247,242,232,.85);')}>
        Usamos cookies para melhorar sua experiência e entender o uso do site. Aceite todos ou recuse os não-essenciais. <a href="../lotus-cookies/" style={parseStyle('color:#cdab6e;text-decoration:underline;')}>Política de Cookies</a>.
      </p>
      <div style={parseStyle('display:flex;gap:10px;flex-wrap:wrap;')}>
        <button id="lotus-cookie-accept" type="button" onClick={() => setConsent('all')} style={parseStyle('background:#b18a4a;color:#15241c;font-weight:700;font-size:13.5px;border:none;padding:10px 18px;border-radius:30px;cursor:pointer;')}>Aceitar todos</button>
        <button id="lotus-cookie-reject" type="button" onClick={() => setConsent('essential')} style={parseStyle('background:transparent;color:#f7f2e8;font-weight:600;font-size:13.5px;border:1px solid rgba(247,242,232,.3);padding:10px 18px;border-radius:30px;cursor:pointer;')}>Recusar não-essenciais</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte — renderVals do <script>) */
/* ------------------------------------------------------------------ */

// data-props default do <script data-props="{...whatsapp:{default:'5511926143393'}}">
const WHATSAPP_DEFAULT = '5511926143393';

// ID do vídeo de recrutamento no YouTube. Vazio = a seção inteira não é
// renderizada. Preencher só quando houver vídeo real — antes disso o embed
// ficava no ar com um placeholder.
const VIDEO_RECRUTAMENTO = '';

// this.VAGAS do Component
const VAGAS = [
  { title: 'Corretor de imóveis com ou sem experiência', squad: 'Corretagem', city: 'Jundiaí · Itupeva', type: 'Treinamento completo', href: '#candidatar' },
  { title: 'Vagas administrativas', squad: 'Adm · Financeiro · Marketing', city: 'Jundiaí', type: 'CLT / PJ', href: '#outras-vagas' },
];

const ofertas = [
  { icon: '60%', title: 'Comissão até 60%', text: 'Tabela transparente, sem letra miúda. Você sabe exatamente quanto ganha em cada negócio e ganha de verdade.' },
  { icon: 'U', title: 'Universidade Lotus', text: 'Formação contínua e certificação por segmento. Você evolui toda semana, não só quando dá tempo.' },
  { icon: '★', title: 'Mentoria com broker', text: 'Acompanhamento de quem já formou referências da região. Alguém do seu lado, não só cobrando meta.' },
  { icon: '◎', title: 'Estrutura + estúdio', text: 'Time de marketing, fotógrafo e estúdio de vídeo prontos pra te fazer voar. Você foca no relacionamento.' },
  { icon: '↗', title: 'Carreira por especialidade', text: 'Você vira a referência do seu bairro ou squad, não mais um nome perdido numa lista de corretores.' },
  { icon: '◐', title: 'PDI mensal + cultura', text: 'Plano de desenvolvimento individual todo mês, numa equipe que se respeita e cresce junto.' },
];

const jornada = [
  { step: '1', tag: 'Você se candidata', title: 'Candidatura', text: 'Preenche o formulário aqui embaixo. Sem mistério, sem indicação obrigatória, só você e o seu potencial.' },
  { step: '2', tag: '4 etapas', title: 'Processo seletivo', text: 'Conversa inicial, fit cultural, case prático e papo com a liderança. A gente quer te conhecer de verdade.' },
  { step: '3', tag: 'D+7 a D+90', title: 'Onboarding de 90 dias', text: 'Trilha estruturada com marcos em D+7, D+15, D+30, D+60 e D+90, você não é jogado na água sozinho.' },
  { step: '4', tag: 'O primeiro marco', title: 'Sua 1ª venda', text: 'Com método, mentoria e estrutura, sua primeira venda vem mais rápido do que você imagina.' },
  { step: '5', tag: 'O destino', title: 'Especialista-âncora do bairro', text: 'Você vira a referência da sua região, o nome que as famílias procuram quando pensam em comprar ou vender.' },
];

const depo = [
  { slot: 'recru-d1', name: 'Bruno Salgado', role: 'Squad Lançamentos · 2 anos na Lotus', text: 'Eu vivia correndo atrás de lead e me sentindo um vendedor qualquer. Aqui virei referência em Itupeva. A estrutura mudou o meu jogo.' },
  { slot: 'recru-d2', name: 'Letícia Arruda', role: 'Squad Alto Padrão · 1 ano na Lotus', text: 'A mentoria e o estúdio de conteúdo me colocaram num outro nível. Fechei em 1 ano o que não fechei em 4 na imobiliária antiga.' },
  { slot: 'recru-d3', name: 'Marcos V.', role: 'Squad Popular · 3 anos na Lotus', text: 'O que me ganhou foi a cultura: gente que se ajuda de verdade. Comissão justa e transparente. Não saio daqui por nada.' },
];

const faqData = [
  { q: 'Como ser corretor em Jundiaí?', a: 'Você precisa de registro no CRECI (ou estar em curso). Na Lotus, candidatos passam por processo seletivo de 4 etapas e onboarding de 90 dias com mentoria e estrutura de apoio.' },
  { q: 'A Lotus está contratando?', a: 'Sim. Mantemos vagas abertas por squad e cidade em Jundiaí e Itupeva, além de banco de talentos para quando não há vaga na sua especialidade.' },
  { q: 'Qual a comissão?', a: 'Comissão transparente de até 60%, conforme squad, performance e modelo de atuação. Os detalhes são apresentados no processo seletivo.' },
  { q: 'Preciso ter experiência?', a: 'Não necessariamente. Temos trilhas para quem está começando (inclusive trainee) e para quem já é experiente e quer subir de nível.' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusRecrutamento({
  whatsapp = WHATSAPP_DEFAULT,
}: {
  whatsapp?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // state = { formDone: false, openFaq: 0, vagaFilter: 'all' }
  const [formDone, setFormDone] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  // vagaFilter existe no state do fonte, mas nunca é lido no render — mantido por fidelidade.
  const [, setVagaFilter] = useState<'all' | string>('all');

  // renderVals(): const wa = 'https://wa.me/' + String(this.props.whatsapp ?? '5511926143393');
  const wa = 'https://wa.me/' + String(whatsapp ?? '5511926143393');
  const waLink = wa + '?text=' + encodeURIComponent('Quero ser corretor especialista na Lotus.');
  const waWork = wa + '?text=' + encodeURIComponent('Olá! Tenho interesse em outras vagas na Lotus (adm/financeiro/marketing).');

  const notDone = !formDone;

  // submitForm: (e) => { preventDefault; setState({formDone:true}); scrollIntoView('#candidatar') }
  const submitForm = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormDone(true);
    if (rootRef.current) {
      const el = rootRef.current.querySelector('#candidatar');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // vagasView: this.VAGAS
  const vagasView = VAGAS;

  // faqs: derivados do state (open/sign/toggle) exatamente como no renderVals.
  const faqs = faqData.map((x, i) => ({
    q: x.q,
    a: x.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((s) => (s === i ? -1 : i)),
  }));

  // vagaFilter é setado em lugar nenhum no fonte; referência única para não sinalizar unused.
  void setVagaFilter;

  return (
    <div ref={rootRef}>
      {/*
        Estilos page-specific do fonte (2º <style> do <head>): .lt-field e a seta do select.
        Não existem no CSS global do portal; ficam aqui, com valores literais idênticos ao estático.
      */}
      <style>{`
        .lt-field{width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:13px 14px;border-radius:11px;outline:none;}
        select.lt-field{appearance:none;-webkit-appearance:none;padding-right:34px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233f6249' stroke-width='2.4'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;cursor:pointer;}
      `}</style>

      {/* HEADER */}
      <header style={parseStyle('position:sticky;top:0;z-index:60;background:#15241c;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;gap:32px;')}>
          <a target="_top" href="/lotus-home" style={parseStyle('display:flex;align-items:center;gap:11px;')}>
            <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
          </a>
          <nav style={parseStyle('display:flex;align-items:center;gap:24px;font-size:14.5px;font-weight:500;color:rgba(247,242,232,.85);')}>
            <Hoverable as="a" target="_top" href="/lotus-lancamentos" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Lançamentos</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-busca" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Comprar</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-bairro" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-sobre" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>A Lotus</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-corretores" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-home#guias" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Guias</Hoverable>
            <Hoverable as="a" target="_top" href="/lotus-home#blog" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
          </nav>
          <Hoverable as="a" href="#candidatar" baseStyle={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14px;padding:9px 17px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Quero ser corretor</Hoverable>
        </div>
      </header>

      {/* HERO */}
      <section style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;')}>
        <ImageSlot id="recru-hero" src="/vigore/a18.jpg" alt="Foto do time / corretor em ação" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;opacity:.3;')} />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(120deg,rgba(21,36,28,.95) 0%,rgba(21,36,28,.8) 55%,rgba(21,36,28,.65) 100%);')}></div>
        <div style={parseStyle('position:relative;max-width:1100px;margin:0 auto;padding:110px 32px;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#cdab6e;margin-bottom:24px;')}>Carreira na Lotus</div>
          <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(38px,5.4vw,68px);line-height:1.02;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 22px;max-width:840px;")}>Pare de ser mais um. Vire o <em style={parseStyle('font-style:italic;color:#cdab6e;')}>especialista do seu bairro.</em></h1>
          <p style={parseStyle('font-size:clamp(16px,1.7vw,20px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;max-width:600px;margin:0 0 14px;')}>Mentoria de quem formou os melhores corretores da região, estrutura que te tira do braçal e comissão de verdade. Em Jundiaí e Itupeva.</p>
          <p style={parseStyle('font-size:clamp(15px,1.5vw,18px);color:#cdab6e;font-weight:400;line-height:1.5;max-width:600px;margin:0 0 32px;')}>Com ou sem experiência, a gente oferece treinamento completo para te transformar num corretor de ponta.</p>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:14px;')}>
            <Hoverable as="a" href="#candidatar" baseStyle={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Quero ser corretor</Hoverable>
            <Hoverable as="a" href="#outras-vagas" baseStyle={parseStyle('background:transparent;border:1.5px solid rgba(247,242,232,.4);color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.1)')}>Outras vagas (adm, financeiro, marketing)</Hoverable>
          </div>
        </div>
      </section>

      {/* O PROBLEMA */}
      <section style={parseStyle('background:#15241c;padding:90px 32px;')}>
        <div style={parseStyle('max-width:820px;margin:0 auto;text-align:center;')}>
          <p style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3.2vw,36px);line-height:1.25;color:#f7f2e8;margin:0 0 24px;")}>Você foi treinado para disputar lead no grupo de WhatsApp, vender qualquer coisa em qualquer lugar e correr atrás de portal. <em style={parseStyle('font-style:italic;color:#cdab6e;')}>Isso é ser commodity.</em></p>
          <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.7;margin:0 auto 28px;max-width:600px;')}>Sem estrutura, sem formação de verdade, sem foco. Preso ao operacional que devora o seu dia. Você merece mais do que isso.</p>
          <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(22px,2.8vw,30px);color:#cdab6e;margin:0;")}>Vendedor de imóveis é commodity. Especialista é escolha.</p>
        </div>
      </section>

      {/* VÍDEO DE RECRUTAMENTO, fora do ar.
          O embed apontava para dQw4w9WgXcQ, um placeholder que ficou publicado
          como "Vídeo de recrutamento Lotus Brokers". Para reativar: preencher
          VIDEO_RECRUTAMENTO com o ID do vídeo no YouTube. */}
      {VIDEO_RECRUTAMENTO && (
        <section style={parseStyle('background:#ece2cf;padding:90px 32px;')}>
          <div style={parseStyle('max-width:980px;margin:0 auto;')}>
            <div style={parseStyle('text-align:center;max-width:600px;margin:0 auto 40px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Conheça a Lotus por dentro</div>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0;")}>Veja como é fazer parte do time.</h2>
            </div>
            <div style={parseStyle('position:relative;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:#1d3a2c;box-shadow:0 24px 60px -34px rgba(21,36,28,.5);')}>
              <iframe src={`https://www.youtube.com/embed/${VIDEO_RECRUTAMENTO}`} title="Vídeo de recrutamento Lotus Brokers" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;border:0;')} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
          </div>
        </section>
      )}

      {/* O QUE A LOTUS OFERECE */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:52px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>O que você ganha</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0;")}>Tudo o que falta na imobiliária comum.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;')}>
            {ofertas.map((o, i) => (
              <div key={i} style={parseStyle('background:#fff;border-radius:18px;padding:32px 30px;box-shadow:0 16px 40px -34px rgba(21,36,28,.3);')}>
                <div style={parseStyle("width:50px;height:50px;border-radius:13px;background:#ece2cf;display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:#1d3a2c;font-family:'Fraunces',serif;font-size:20px;")}>{o.icon}</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 10px;")}>{o.title}</h3>
                <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (jornada) */}
      <section id="como-funciona" style={parseStyle('background:#ece2cf;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;max-width:620px;margin:0 auto 56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>A jornada</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0;")}>Tem método, não improviso.</h2>
          </div>
          <div style={parseStyle('display:flex;flex-direction:column;gap:0;')}>
            {jornada.map((j, i) => (
              <div key={i} style={parseStyle('display:grid;grid-template-columns:auto 1fr;gap:24px;')}>
                <div style={parseStyle('display:flex;flex-direction:column;align-items:center;')}>
                  <div style={parseStyle("width:48px;height:48px;border-radius:50%;background:#1d3a2c;display:flex;align-items:center;justify-content:center;color:#cdab6e;font-family:'Fraunces',serif;font-size:18px;flex-shrink:0;")}>{j.step}</div>
                  <div style={parseStyle('width:2px;flex:1;background:rgba(21,36,28,.14);margin:6px 0;')}></div>
                </div>
                <div style={parseStyle('padding-bottom:32px;')}>
                  <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:6px;')}>{j.tag}</div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 8px;")}>{j.title}</h3>
                  <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>{j.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={parseStyle('background:#1d3a2c;padding:90px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1200px;margin:0 auto;position:relative;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#f7f2e8;margin:0 0 44px;max-width:620px;line-height:1.08;")}>Quem trocou de vida na Lotus.</h2>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;')}>
            {depo.map((d, i) => (
              <div key={i} style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:18px;padding:30px;')}>
                <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.88);font-weight:300;line-height:1.6;margin:0 0 20px;')}>“{d.text}”</p>
                <div style={parseStyle('display:flex;align-items:center;gap:12px;border-top:1px solid rgba(247,242,232,.12);padding-top:18px;')}>
                  <div style={parseStyle('width:44px;height:44px;border-radius:50%;background:#3f6249;overflow:hidden;position:relative;flex-shrink:0;')}><ImageSlot id={d.slot} alt={d.name} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} /></div>
                  <div><div style={parseStyle('font-size:14.5px;font-weight:600;color:#f7f2e8;')}>{d.name}</div><div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{d.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VAGAS */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1100px;margin:0 auto;')}>
          <div style={parseStyle('margin-bottom:40px;max-width:560px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Vagas abertas</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0;")}>Seu próximo capítulo começa aqui.</h2>
          </div>
          <div style={parseStyle('display:flex;flex-direction:column;gap:14px;')}>
            {vagasView.map((v, i) => (
              <div key={i} style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 14px 36px -32px rgba(21,36,28,.3);')}>
                <div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 8px;")}>{v.title}</h3>
                  <div style={parseStyle('display:flex;flex-wrap:wrap;gap:8px;')}>
                    <span style={parseStyle('background:#ece2cf;color:#3f6249;font-size:12.5px;font-weight:600;padding:5px 12px;border-radius:30px;')}>{v.squad}</span>
                    <span style={parseStyle('background:#ece2cf;color:#3f6249;font-size:12.5px;font-weight:600;padding:5px 12px;border-radius:30px;')}>{v.city}</span>
                    <span style={parseStyle('background:#ece2cf;color:#3f6249;font-size:12.5px;font-weight:600;padding:5px 12px;border-radius:30px;')}>{v.type}</span>
                  </div>
                </div>
                <Hoverable as="a" href={v.href} baseStyle={parseStyle('background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:12px 24px;border-radius:40px;white-space:nowrap;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Candidatar-se →</Hoverable>
              </div>
            ))}
          </div>
          <div style={parseStyle('margin-top:24px;background:#ece2cf;border-radius:16px;padding:28px 30px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;')}>
            <div><div style={parseStyle("font-family:'Fraunces',serif;font-size:20px;color:#15241c;margin-bottom:4px;")}>Não achou a sua vaga?</div><p style={parseStyle('font-size:14px;color:#3f6249;margin:0;font-weight:300;')}>Entre para o banco de talentos, a gente te chama quando abrir.</p></div>
            <Hoverable as="a" href="#candidatar" baseStyle={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border-radius:40px;white-space:nowrap;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Entrar no banco de talentos</Hoverable>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="candidatar" style={parseStyle('background:#15241c;padding:100px 32px;position:relative;overflow:hidden;scroll-margin-top:70px;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:720px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('text-align:center;margin-bottom:40px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>Candidatura</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#f7f2e8;line-height:1.06;margin:0;")}>Conta pra gente quem você é.</h2>
          </div>
          <div style={parseStyle('background:#f7f2e8;border-radius:22px;padding:clamp(28px,4vw,44px);box-shadow:0 30px 70px -30px rgba(0,0,0,.5);')}>
            {formDone && (
              <>
                <div style={parseStyle('text-align:center;padding:30px 0;')}>
                  <div style={parseStyle('width:60px;height:60px;border-radius:50%;background:#1d3a2c;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"></path></svg></div>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:26px;color:#1d3a2c;margin-bottom:10px;")}>Candidatura recebida! 🌿</div>
                  <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;max-width:420px;margin:0 auto;')}>Nosso time vai analisar e te chamar no WhatsApp para os próximos passos. Bem-vindo à liga A da região.</p>
                </div>
              </>
            )}
            {notDone && (
              <>
                <form onSubmit={submitForm} style={parseStyle('display:flex;flex-direction:column;gap:14px;')}>
                  <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                    <input className="lt-field" type="text" required placeholder="Nome completo" />
                    <input className="lt-field" type="text" required placeholder="WhatsApp" />
                  </div>
                  <input className="lt-field" type="email" required placeholder="E-mail" />
                  <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                    <select className="lt-field"><option value="">Tem CRECI?</option><option>Tenho CRECI ativo</option><option>Estou em curso</option><option>Ainda não tenho</option></select>
                    <select className="lt-field"><option value="">Experiência</option><option>Sem experiência (quero aprender)</option><option>Até 2 anos</option><option>2 a 5 anos</option><option>Mais de 5 anos</option></select>
                  </div>
                  <input className="lt-field" type="text" placeholder="LinkedIn ou portfólio (opcional)" />
                  <label style={parseStyle('display:flex;align-items:center;gap:10px;background:#fff;border:1px dashed rgba(21,36,28,.25);border-radius:11px;padding:13px 14px;cursor:pointer;font-size:14px;color:#3f6249;')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3f6249" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5-5 5 5"></path><path d="M12 5v12"></path></svg>
                    Anexar currículo (opcional)
                    <input type="file" style={parseStyle('display:none;')} />
                  </label>
                  <label style={parseStyle('display:flex;align-items:flex-start;gap:9px;font-size:12px;color:#3f6249;line-height:1.45;cursor:pointer;')}>
                    <input type="checkbox" required style={parseStyle('margin-top:2px;width:16px;height:16px;accent-color:#1d3a2c;')} />
                    Autorizo a Lotus a tratar meus dados para o processo seletivo, conforme a Política de Privacidade (LGPD).
                  </label>
                  <Hoverable as="button" type="submit" baseStyle={parseStyle('margin-top:6px;background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:16px;border:none;border-radius:12px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>Enviar candidatura</Hoverable>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* OUTRAS VAGAS */}
      <section id="outras-vagas" style={parseStyle('background:#ece2cf;padding:90px 32px;scroll-margin-top:70px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;text-align:center;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Além da corretagem</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0 0 16px;")}>Outras vagas na Lotus.</h2>
          <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.6;max-width:580px;margin:0 auto 36px;')}>A Lotus também é feita de gente nos bastidores. Se você é de administração, financeiro, marketing, atendimento ou tecnologia e quer fazer parte do time, deixe seu contato.</p>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:40px;')}>
            <span style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:16px;font-weight:600;padding:14px 26px;border-radius:40px;')}>Administrativo</span>
            <span style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:16px;font-weight:600;padding:14px 26px;border-radius:40px;')}>Financeiro</span>
            <span style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:16px;font-weight:600;padding:14px 26px;border-radius:40px;')}>Marketing &amp; Conteúdo</span>
            <span style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:16px;font-weight:600;padding:14px 26px;border-radius:40px;')}>Atendimento</span>
            <span style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:16px;font-weight:600;padding:14px 26px;border-radius:40px;')}>Tecnologia</span>
          </div>
          <Hoverable as="a" href={waWork} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Enviar meu currículo <span>→</span></Hoverable>
        </div>
      </section>

      {/* GEO / FAQ */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Perguntas frequentes</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 22px;")}>Como ser corretor em Jundiaí?</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Em resumo</div>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>Para ser corretor em Jundiaí você precisa de registro no CRECI (ou estar em curso). Na Lotus, há processo seletivo de 4 etapas, onboarding de 90 dias com mentoria, estrutura de apoio com time de marketing e estúdio, e comissão transparente de até 60%.</p>
            </div>
          </div>
          <div>
            {faqs.map((f, i) => (
              <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:22px 0;text-align:left;')}>
                  <span style={parseStyle('font-size:16.5px;font-weight:500;color:#15241c;')}>{f.q}</span>
                  <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{f.sign}</span>
                </button>
                {f.open && (<><p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 22px;')}>{f.a}</p></>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer data-rodape-portal="" style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1200px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding-bottom:48px;border-bottom:1px solid rgba(247,242,232,.12);')}>
            <div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px;margin-bottom:18px;')}>
                <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
              </div>
              <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:19px;color:rgba(247,242,232,.85);line-height:1.35;max-width:300px;margin:0 0 18px;")}>Grandes escolhas têm endereço.</p>
              <p style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.55);line-height:1.6;margin:0;')}>Consultoria imobiliária para compra, venda, locação e investimento em imóveis de médio e alto padrão em Jundiaí, Itupeva e região.</p>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>A Lotus</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" target="_top" href="/lotus-sobre" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Sobre nós</Hoverable>
                <Hoverable as="a" target="_top" href="/lotus-corretores" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
                <a target="_top" href="/lotus-recrutamento" style={parseStyle('color:#cdab6e;')}>Seja um corretor</a>
                <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Contato</Hoverable>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Serviços</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" target="_top" href="/lotus-lancamentos" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Lançamentos</Hoverable>
                <Hoverable as="a" target="_top" href="/lotus-busca" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Comprar &amp; alugar</Hoverable>
                <Hoverable as="a" target="_top" href="/lotus-anunciar" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Anunciar imóvel</Hoverable>
                <Hoverable as="a" target="_top" href="/lotus-bairro" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
                <Hoverable as="a" target="_top" href="/lotus-home#blog" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
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
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding-top:26px;font-size:13px;color:rgba(247,242,232,.5);')}>
            <div>{footerLegalLine()}</div>
            <div style={parseStyle('display:flex;gap:12px;align-items:center;')}>
              <Hoverable as="a" href="https://www.facebook.com/profile.php?id=61587132887416&locale=pt_BR" target="_blank" rel="noopener" aria-label="Facebook" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.youtube.com/@LotusBrokersImobili%C3%A1ria" target="_blank" rel="noopener" aria-label="YouTube" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.instagram.com/lotusbrokers_/" target="_blank" rel="noopener" aria-label="Instagram" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg></Hoverable>
              <Hoverable as="a" href="https://www.tiktok.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="TikTok" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z"></path></svg></Hoverable>
            </div>
          </div>
        </div>
      </footer>

      {/* Banner de cookies (bloco fora do <x-dc> no fonte, portado fielmente) */}
      <CookieBanner />
    </div>
  );
}
