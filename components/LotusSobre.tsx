'use client';
import { footerLegalLine } from '@/lib/site';
import { SQUADS } from '@/lib/squads';

/**
 * LotusSobre — porte 1:1 de lotus-sobre/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (mesmas de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *
 * O fonte NÃO tem data-reveal: componentDidMount só implementa (1) handler de teclado
 * para o lightbox e (2) contador de estatísticas (rAF + IntersectionObserver .4).
 */

import Link from 'next/link';
import LotusHeader from './LotusHeader';
import React, {
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
 * Split no PRIMEIRO ":" de cada declaração (valores como gradientes e data: URIs
 * contêm ":" internos). camelCase nas propriedades; -webkit- -> Webkit; --custom mantém.
 */
function parseStyle(css: string): CSSProperties {
  const out: Record<string, string> = {};
  if (!css) return out as CSSProperties;
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
 */
/** Iniciais (até 2) a partir do nome — fallback de avatar quando não há foto. */
function initialsOf(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function ImageSlot({
  src,
  id,
  style,
  alt = '',
  initials,
}: {
  src?: string;
  id?: string;
  style?: CSSProperties;
  alt?: string;
  /** Nome para gerar iniciais quando não há `src` (avatar-fallback). */
  initials?: string;
}) {
  const fallbackInitials = !src ? initialsOf(initials) : '';
  return (
    <div
      id={id}
      style={{
        display: 'block',
        background: 'linear-gradient(135deg,#1d3a2c,#3f6249)',
        ...style,
      }}
    >
      {!src && fallbackInitials && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(247,242,232,.9)',
            fontFamily: "'Fraunces',serif",
            fontSize: 'clamp(12px, 40%, 34px)',
          }}
        >
          {fallbackInitials}
        </span>
      )}
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
 * Aplica cor e peso aos trechos de `realce` dentro de um parágrafo.
 *
 * Divide o texto pelos trechos pedidos, em vez de trocar por HTML: nada de
 * dangerouslySetInnerHTML e nenhum risco de quebrar acentuação ou tags. Trecho
 * que não for encontrado simplesmente não realça — o parágrafo sai inteiro.
 */
function comRealce(texto: string, realce?: string[]) {
  if (!realce || realce.length === 0) return texto;
  const encontrados = realce.filter((r) => texto.includes(r));
  if (encontrados.length === 0) return texto;

  // Divide preservando os separadores, para reconstruir o parágrafo na ordem.
  const escapado = encontrados.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const partes = texto.split(new RegExp('(' + escapado.join('|') + ')'));

  return partes.map((p, i) =>
    encontrados.includes(p) ? (
      <strong key={i} style={{ color: '#e0cfa8', fontWeight: 500 }}>
        {p}
      </strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    )
  );
}

/* Textura de ruído (SVG) idêntica ao estático — usada como background-image. */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511926143393';

/** Endereço do escritório — fonte única do mapa, do texto e do "Como chegar". */
const ENDERECO_ESCRITORIO = {
  linha1: 'Av. José Luiz Sereno, 655 · sala 5',
  linha2: 'Jardim Ermida II · Jundiaí · SP',
  busca: 'Avenida José Luiz Sereno, 655, Jardim Ermida II, Jundiaí, SP',
};

// Manifesto da Lotus. `destaque` = as frases que ganham o corpo serifado maior;
// `ritmo` = a enumeração curta ("São recomeços. São despedidas."), que respira
// em bloco próprio em vez de virar mais um parágrafo corrido.
type BlocoManifesto =
  /** Par de frases em oposição: a segunda é a virada. Abre e fecha o manifesto. */
  | { tipo: 'abertura' | 'fecho'; texto: string; contraponto: string }
  | { tipo: 'destaque'; texto: string; realce?: string[] }
  | { tipo: 'texto'; texto: string; realce?: string[] }
  | { tipo: 'ritmo'; abertura: string; itens: string[]; fecho: string };

// `realce` marca os trechos que ganham cor e peso dentro do parágrafo. São
// buscados literalmente no texto, então cada um precisa aparecer igualzinho —
// se um realce não casar, o parágrafo sai inteiro, sem destaque, e nunca
// quebrado. Poucos por bloco: destacar tudo é não destacar nada.
const manifesto: BlocoManifesto[] = [
  {
    tipo: 'abertura',
    texto: 'Há decisões que mudam um endereço.',
    contraponto: 'E há decisões que mudam uma vida.',
  },
  {
    tipo: 'texto',
    texto:
      'Comprar ou vender um imóvel não é apenas uma transação. É escolher onde uma família vai construir memórias. É transformar escolhas conscientes em patrimônio. É encerrar um ciclo para permitir que outro floresça.',
    realce: ['construir memórias', 'patrimônio', 'outro floresça'],
  },
  {
    tipo: 'texto',
    texto: 'Estas são decisões grandes demais para serem conduzidas com pressa, pressão ou improviso.',
    realce: ['grandes demais'],
  },
  {
    tipo: 'ritmo',
    abertura: 'Acreditamos que imóveis nunca são apenas imóveis.',
    itens: ['São recomeços.', 'São despedidas.', 'São conquistas.'],
    fecho: 'São a materialização de anos de trabalho, sonhos e coragem.',
  },
  {
    tipo: 'texto',
    texto:
      'Acreditamos que excelência é estar presente nos momentos que realmente importam. Para nós, cada imóvel possui um endereço, mas cada cliente possui uma história.',
    realce: ['cada imóvel possui um endereço, mas cada cliente possui uma história'],
  },
  {
    tipo: 'texto',
    texto:
      'Por isso, não tratamos pessoas como números ou oportunidades. Tratamos cada jornada com o respeito de quem compreende o peso financeiro e emocional de uma decisão imobiliária. Colocamos a escuta, a compreensão, a orientação e o cuidado no centro de cada atendimento.',
    realce: ['a escuta, a compreensão, a orientação e o cuidado'],
  },
  {
    tipo: 'texto',
    texto:
      'Nosso papel é interpretar desejos, esclarecer riscos, revelar possibilidades e conduzir cada cliente a uma decisão da qual continuará se orgulhando no futuro.',
    realce: ['continuará se orgulhando no futuro'],
  },
  {
    tipo: 'texto',
    texto:
      'O verdadeiro alto padrão não está apenas no valor do imóvel. Está na qualidade da condução, na atenção aos detalhes e na segurança sentida durante toda a jornada.',
    realce: ['O verdadeiro alto padrão'],
  },
  {
    tipo: 'destaque',
    texto:
      'Como a flor que nos dá nome, acreditamos que grandes transformações podem nascer mesmo em meio à complexidade.',
    realce: ['grandes transformações'],
  },
  { tipo: 'destaque', texto: 'Somos apaixonados por fazer grandes decisões florescerem.', realce: ['florescerem'] },
  {
    tipo: 'texto',
    texto:
      'Uma imobiliária que não deseja apenas intermediar imóveis, mas elevar o padrão de como compradores e vendedores são tratados.',
    realce: ['elevar o padrão'],
  },
  { tipo: 'fecho', texto: 'Porque imóveis representam patrimônio.', contraponto: 'Mas as decisões tomadas ao redor deles representam vidas.' },
];

// As 7 Pétalas da Lótus.
const valores = [
  { nome: 'Confiança', texto: 'Toda relação começa pela credibilidade e é fortalecida pela transparência.' },
  { nome: 'Estratégia', texto: 'Cada decisão imobiliária merece análise, conhecimento e planejamento.' },
  { nome: 'Excelência', texto: 'A busca constante pela qualidade em cada detalhe e em cada atendimento.' },
  { nome: 'Compromisso', texto: 'Estar presente antes, durante e depois da negociação.' },
  { nome: 'Relacionamento', texto: 'Queremos ser a primeira escolha em cada novo capítulo da vida dos nossos clientes.' },
  { nome: 'Evolução', texto: 'Aprender continuamente para entregar soluções cada vez melhores.' },
  { nome: 'Legado', texto: 'Construir uma empresa que seja lembrada não pelos imóveis que vendeu, mas pela confiança que conquistou.' },
];

const pilares = [
  { num: '01', title: 'Especialista do bairro', text: 'Você é atendido por quem conhece a região de verdade, a rua, a escola, o preço justo daquele metro quadrado. Nada de generalista de tudo.' },
  { num: '02', title: 'Processo transparente', text: 'Método claro, boletim de acompanhamento e avaliação com dado (não com achismo). Você sempre sabe em que pé está a sua negociação.' },
  { num: '03', title: 'Cuidado que respeita seu tempo', text: 'Sem catálogo jogado no WhatsApp. A gente filtra, organiza e só te apresenta o que faz sentido para o seu momento.' },
  { num: '04', title: 'Pós-chave de verdade', text: 'A relação não acaba na assinatura. A gente continua por perto, porque cliente bem cuidado vira o próximo capítulo (e a próxima indicação).' },
];

// Dois squads. O corretor de cada card saiu junto com os nomes fictícios:
// eram placeholders com CRECI 000001-F..000004-F, e escolher quais dois manter
// significaria republicar dado inventado. Para voltar a exibir um responsável,
// basta acrescentar o nome real e reativar o bloco no `.map` abaixo.

// `foto` é opcional: só o fundador tem imagem real por enquanto. Os demais
// continuam sendo nomes fictícios de placeholder (ver IMAGENS-FALTANDO.md) e
// caem no avatar de iniciais.
// Ficam fora da grade os perfis com CRECI placeholder. Os cinco abaixo, de
// `000001-F` a `000005-F`, são pessoas fictícias e ficam filtrados (o `.filter`
// no render); os dados permanecem para referência de layout.
const ehCreciPlaceholder = (creci?: string) => !!creci && /CRECI\s*0{4,}/.test(creci);

// `creci` é opcional: sem número informado, a linha some do card em vez de
// exibir um travessão solto.
const corretores: { name: string; role: string; creci?: string; slot: string; foto?: string }[] = [
  { name: 'Erick Ferrigatti', role: 'Fundador · Marketing e Estratégia', slot: 'corr-1', foto: '/corretores/erick-ferrigatti.jpg' },
  { name: 'Mariana Mamede', role: 'Broker', slot: 'corr-mariana', foto: '/corretores/mariana-mamede.jpg' },
  { name: 'Marina Tavares', role: 'Alto Padrão · Eloy Chaves', creci: 'CRECI 000001-F', slot: 'corr-2' },
  { name: 'Rafael Nunes', role: 'Lançamentos · Itupeva', creci: 'CRECI 000002-F', slot: 'corr-3' },
  { name: 'Juliana Prado', role: 'Popular · Jundiaí', creci: 'CRECI 000003-F', slot: 'corr-4' },
  { name: 'André Salem', role: 'Comercial', creci: 'CRECI 000004-F', slot: 'corr-5' },
  { name: 'Beatriz Lima', role: 'Lançamentos · Vinhedo', creci: 'CRECI 000005-F', slot: 'corr-6' },
];

const faqData = [
  { q: 'Quem é a Lotus Brokers?', a: 'Uma imobiliária moderna de Jundiaí e Itupeva, com equipe de corretores segmentada por especialidade e por bairro. Atende lançamentos e revenda com atendimento humano e processo transparente.' },
  { q: 'A Lotus é uma imobiliária nova?', a: 'Marca nova, time consolidado. A operação atua há mais de uma década na região e renasceu como Lotus, a mesma gente que já conhece cada bairro.' },
  { q: 'O que torna o atendimento de vocês diferente?', a: 'Você fala com um especialista do seu bairro, não com um corretor que tenta dar conta de tudo. A estrutura cuida do repetitivo; o corretor cuida de você, do primeiro contato ao pós-chave.' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusSobre({
  whatsapp = WHATSAPP_DEFAULT,
}: {
  whatsapp?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState(0);

  // waLink — replica exata da lógica do renderVals().
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Oi! Vim pela página A Lotus e quero conhecer melhor o time de vocês.');

  // Derivados de render (renderVals()).
  const faqs = faqData.map((f, i) => ({
    q: f.q,
    a: f.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((cur) => (cur === i ? -1 : i)),
  }));

  return (
    <div ref={rootRef}>
      {/* HEADER */}
      <LotusHeader active="sobre" maxWidth={1200} whatsapp={whatsapp} />

      {/* HERO */}
      <section style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;')}>
        <ImageSlot id="sobre-hero" src="/gran-ville-santo-angelo/a038.jpg" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;opacity:.4;')} />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.7),rgba(21,36,28,.92));')}></div>
        <div style={parseStyle('position:relative;max-width:1000px;margin:0 auto;padding:120px 32px;text-align:center;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#cdab6e;margin-bottom:26px;')}>A Lotus</div>
          <h1 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(40px,6vw,72px);line-height:1.02;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 28px;')}>Quem é a Lotus.<br /><em style={parseStyle('font-style:italic;color:#cdab6e;')}>Especialistas que te chamam pelo nome.</em></h1>
          <p style={parseStyle('font-size:clamp(17px,1.8vw,21px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;max-width:680px;margin:0 auto;')}>Uma imobiliária de Jundiaí e Itupeva construída em torno de uma ideia simples: devolver ao cliente um corretor inteiro, presente, que conhece o bairro e leva o seu imóvel a sério como se fosse o dele.</p>
        </div>
      </section>

      {/* MANIFESTO */}
      <section style={parseStyle('background:#15241c;padding:110px 32px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        {/* 68ch é a medida em que uma linha ainda se lê sem esforço. O texto do
            manifesto é longo: sem esse limite ele vira parede. */}
        <div style={parseStyle('max-width:68ch;margin:0 auto;position:relative;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#b18a4a;margin-bottom:44px;text-align:center;')}>Manifesto</div>

          {/* Um ritmo só: abertura grande, corpo tranquilo, dois picos e o
              fecho. O espaçamento entre blocos é maior que o de dentro deles,
              para o olho agrupar as ideias sozinho. */}
          <div style={parseStyle('display:flex;flex-direction:column;gap:34px;')}>
            {manifesto.map((b, i) => {
              if (b.tipo === 'abertura' || b.tipo === 'fecho') {
                const abre = b.tipo === 'abertura';
                return (
                  <div key={i} style={parseStyle(abre ? 'text-align:center;margin-bottom:10px;' : 'text-align:center;margin-top:18px;padding-top:38px;border-top:1px solid rgba(205,171,110,.22);')}>
                    <p style={parseStyle(`font-family:'Fraunces',serif;font-weight:300;font-size:clamp(${abre ? '26px,3.4vw,40px' : '22px,2.8vw,32px'});line-height:1.16;letter-spacing:-.01em;color:rgba(247,242,232,.72);margin:0;`)}>{b.texto}</p>
                    {/* O contraponto é a virada da frase: ganha a cor e o peso. */}
                    <p style={parseStyle(`font-family:'Fraunces',serif;font-weight:400;font-size:clamp(${abre ? '28px,3.8vw,46px' : '24px,3.1vw,36px'});line-height:1.16;letter-spacing:-.01em;color:#e0cfa8;margin:6px 0 0;`)}>{b.contraponto}</p>
                  </div>
                );
              }
              if (b.tipo === 'ritmo') {
                return (
                  <div key={i} style={parseStyle('padding:6px 0 6px 22px;border-left:2px solid rgba(205,171,110,.35);')}>
                    <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.7;margin:0 0 14px;')}>{b.abertura}</p>
                    {/* A enumeração é o coração do texto: serifada, dourada e em
                        linhas próprias, para ser lida em três batidas. */}
                    {b.itens.map((item, j) => (
                      <p key={j} style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(21px,2.3vw,26px);color:#cdab6e;line-height:1.42;margin:0;")}>{item}</p>
                    ))}
                    <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.7;margin:14px 0 0;')}>{b.fecho}</p>
                  </div>
                );
              }
              if (b.tipo === 'destaque') {
                return (
                  <p key={i} style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(21px,2.5vw,28px);line-height:1.32;color:#f7f2e8;margin:0;text-align:center;")}>{comRealce(b.texto, b.realce)}</p>
                );
              }
              if (b.tipo === 'texto') {
                return (
                  <p key={i} style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.75;margin:0;')}>{comRealce(b.texto, b.realce)}</p>
                );
              }
              return null;
            })}

            <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(24px,3vw,34px);line-height:1.2;color:#cdab6e;margin:26px 0 0;text-align:center;")}>Grandes escolhas têm endereço.</p>
          </div>
        </div>
      </section>

      {/* VALORES, AS 7 PÉTALAS */}
      <section style={parseStyle('background:#ece2cf;padding:110px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Valores</div>
            <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0;')}>As 7 Pétalas da Lótus.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;')}>
            {valores.map((v, i) => (
              <div key={i} style={parseStyle('background:#f7f2e8;border-radius:18px;padding:32px 30px;')}>
                <div style={parseStyle('font-size:22px;line-height:1;margin-bottom:14px;')} aria-hidden="true">🌿</div>
                <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 10px;')}>{v.nome}</h3>
                <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO TRABALHAMOS */}
      <section style={parseStyle('background:#f7f2e8;padding:110px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Como a gente trabalha</div>
            <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0;')}>Quatro promessas que a gente cumpre.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;')}>
            {/* hint-placeholder-count="4" */}
            {pilares.map((p, i) => (
              <div key={i} style={parseStyle('background:#fff;border-radius:18px;padding:34px 30px;box-shadow:0 18px 44px -32px rgba(21,36,28,.32);')}>
                <div style={parseStyle('font-family:\'Fraunces\',serif;font-size:38px;font-weight:300;color:#cdab6e;line-height:1;margin-bottom:18px;')}>{p.num}</div>
                <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 10px;')}>{p.title}</h3>
                <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SQUADS + FUNDADOR */}
      <section style={parseStyle('background:#ece2cf;padding:110px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:48px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>A equipe</div>
            <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0 0 16px;')}>Especialistas, não generalistas.</h2>
            <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>A gente organiza o time em squads, cada um domina o seu terreno. Você nunca cai no corretor que tenta dar conta de tudo.</p>
          </div>
          {/* fundador */}
          {/* `align-items:start` (não `center`): com a bio real o texto passou a
              ~360px de altura contra 150px da foto, e centralizar deixava o
              retrato flutuando no meio, longe do nome. Alinhado ao topo, ele
              acompanha o "Fundador / Erick Ferrigatti". */}
          <div data-retrato-grid="" style={parseStyle('display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:start;background:#1d3a2c;border-radius:22px;padding:36px;margin-bottom:24px;')}>
            <div style={parseStyle('width:180px;height:180px;border-radius:50%;background:#3f6249;overflow:hidden;position:relative;flex-shrink:0;')}><ImageSlot id="sobre-fundador" src="/corretores/erick-ferrigatti.jpg" alt="Erick Ferrigatti" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} initials="Erick Ferrigatti" /></div>
            <div>
              <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Fundador</div>
              <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:400;font-size:clamp(24px,2.6vw,30px);color:#f7f2e8;margin:0 0 10px;')}>Erick Ferrigatti</h3>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.8);font-weight:300;line-height:1.6;margin:0 0 14px;max-width:620px;')}>Há 15 anos no mercado imobiliário, já atuei desde o operacional administrativo, correspondente bancário, recrutador, marketing, treinamentos, planejamento e hoje atuo como diretor de marketing e estratégia da imobiliária. Estudei Engenharia na Unicamp e sou formado em Publicidade com pós-graduação em Gestão de Negócios.</p>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.8);font-weight:300;line-height:1.6;margin:0;max-width:620px;')}>Tive a oportunidade de aprender com o mercado imobiliário dentro e fora do país, e retornei como sócio da imobiliária em 2020, quando iniciamos a metodologia de exclusivos que hoje nos fez crescer em 7x, saindo de 8 para mais de 30 corretores atualmente e estruturando o que é o mais importante na minha visão: o local perfeito para corretores que desejam atuar com excelência, contando com treinamentos, mentorias e um suporte contínuo nas áreas essenciais para seu trabalho como marketing, jurídico, administrativo e muito mais.</p>
            </div>
          </div>
          {/* squads grid */}
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1px;background:rgba(21,36,28,.12);border-radius:18px;overflow:hidden;')}>
            {SQUADS.map((s, i) => (
              <div key={i} style={parseStyle('background:#f7f2e8;padding:32px 28px;')}>
                <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#b18a4a;margin-bottom:12px;')}>Squad</div>
                <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:400;font-size:21px;color:#15241c;margin:0 0 8px;')}>{s.nome}</h3>
                <p style={parseStyle('font-size:14px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>{s.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOSSA REGIÃO */}
      <section style={parseStyle('background:#15241c;padding:100px 32px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1000px;margin:0 auto;position:relative;text-align:center;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:20px;')}>Nossa região</div>
          <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(28px,3.6vw,46px);color:#f7f2e8;line-height:1.08;letter-spacing:-.02em;margin:0 0 22px;')}>Daqui. De verdade.</h2>
          <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.7;max-width:680px;margin:0 auto 36px;')}>Jundiaí e Itupeva são o nosso chão e a gente também atende Vinhedo, Valinhos e Indaiatuba. Serra do Japi, vinhedos, condomínios e ruas arborizadas: a gente conhece a região pelo que ela tem de vivido, não só pelo que cabe num anúncio.</p>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;justify-content:center;')}>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.22);color:#f7f2e8;font-size:14px;padding:9px 18px;border-radius:30px;transition:all .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.18);border-color:#cdab6e')}>Jundiaí</Hoverable>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.22);color:#f7f2e8;font-size:14px;padding:9px 18px;border-radius:30px;transition:all .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.18);border-color:#cdab6e')}>Itupeva</Hoverable>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.22);color:#f7f2e8;font-size:14px;padding:9px 18px;border-radius:30px;transition:all .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.18);border-color:#cdab6e')}>Vinhedo</Hoverable>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.22);color:#f7f2e8;font-size:14px;padding:9px 18px;border-radius:30px;transition:all .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.18);border-color:#cdab6e')}>Valinhos</Hoverable>
            <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('background:rgba(247,242,232,.1);border:1px solid rgba(247,242,232,.22);color:#f7f2e8;font-size:14px;padding:9px 18px;border-radius:30px;transition:all .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.18);border-color:#cdab6e')}>Indaiatuba</Hoverable>
          </div>
        </div>
      </section>

      {/* GEO / FAQ */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Perguntas frequentes</div>
            <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 22px;')}>Quem é a Lotus, em uma resposta.</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Em resumo</div>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>A Lotus Brokers é uma imobiliária moderna de Jundiaí e Itupeva, com equipe de corretores segmentada por especialidade e por bairro. Atende lançamentos e revenda com atendimento humano e processo transparente, de R$ 500 mil a R$ 5 milhões.</p>
            </div>
          </div>
          <div>
            {/* hint-placeholder-count="3" */}
            {faqs.map((f, i) => (
              <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:22px 0;text-align:left;')}>
                  <span style={parseStyle('font-size:16.5px;font-weight:500;color:#15241c;')}>{f.q}</span>
                  <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{f.sign}</span>
                </button>
                {f.open && (
                  <>
                    <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 22px;')}>{f.a}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORRETORES */}
      <section id="corretores" style={parseStyle('background:#f7f2e8;padding:110px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:48px;')}>
            <div style={parseStyle('max-width:640px;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Nossos corretores</div>
              <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0;')}>Gente que conhece cada esquina e te chama pelo nome.</h2>
            </div>
            <Link href="/lotus-home#corretores" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;white-space:nowrap;')}>Ver na página inicial <span>→</span></Link>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:22px;')}>
            {corretores.filter((c) => !ehCreciPlaceholder(c.creci)).map((c, i) => (
              <div key={i} style={parseStyle('background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px -32px rgba(21,36,28,.32);')}>
                <div style={parseStyle('position:relative;aspect-ratio:1/1;background:#1d3a2c;')}><ImageSlot id={c.slot} src={c.foto} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={c.name} initials={c.name} /></div>
                <div style={parseStyle('padding:18px;')}>
                  <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:7px;')}>{c.role}</div>
                  <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:400;font-size:19px;color:#15241c;margin:0 0 4px;line-height:1.05;')}>{c.name}</h3>
                  {c.creci && <div style={parseStyle('font-size:12px;color:#8aa593;')}>{c.creci}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOSSO ESCRITÓRIO + MAPA */}
      <section style={parseStyle('background:#ece2cf;padding:110px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:48px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Venha tomar um café</div>
            <h2 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0 0 16px;')}>Nosso escritório em Jundiaí.</h2>
            <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>A porta está aberta. Passe para conhecer o time, conversar sobre o seu momento e tomar um café, sem compromisso.</p>
          </div>
          {/* A galeria de fotos do escritório saiu: eram slots vazios (só um
              render de landing no destaque). No lugar, o mapa ocupa a largura
              toda, com o endereço real ao lado. */}
          <div data-escritorio-grid="" style={parseStyle('display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:stretch;')}>
            <div style={parseStyle('position:relative;min-height:420px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 16px 40px -32px rgba(21,36,28,.4);')}>
              <iframe title="Mapa do escritório Lotus Brokers" src={`https://www.google.com/maps?q=${encodeURIComponent(ENDERECO_ESCRITORIO.busca)}&z=17&output=embed`} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;border:0;')} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen></iframe>
            </div>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:28px 26px;display:flex;flex-direction:column;justify-content:center;')}>
              <div style={parseStyle('display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.8" style={parseStyle('flex-shrink:0;margin-top:2px;')}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <div>
                  <div style={parseStyle('font-size:15px;font-weight:600;color:#f7f2e8;line-height:1.45;')}>{ENDERECO_ESCRITORIO.linha1}</div>
                  <div style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.7);line-height:1.5;margin-top:2px;')}>{ENDERECO_ESCRITORIO.linha2}</div>
                </div>
              </div>
              <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;')}>
                <Hoverable as="a" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO_ESCRITORIO.busca)}`} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:7px;background:#b18a4a;color:#15241c;font-weight:600;font-size:13.5px;padding:10px 18px;border-radius:30px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Como chegar <span>→</span></Hoverable>
                <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:7px;background:transparent;border:1px solid rgba(247,242,232,.3);color:#f7f2e8;font-weight:600;font-size:13.5px;padding:10px 18px;border-radius:30px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.1)')}>Agendar visita</Hoverable>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA DUPLO */}
      <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
        <div style={parseStyle('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:24px;')}>
          <Hoverable as="a" href="https://wa.me/5511926143393?text=Oi!%20Vim%20pelo%20site%20da%20Lotus%20e%20quero%20falar%20com%20um%20especialista%20do%20meu%20bairro." target="_blank" rel="noopener" baseStyle={parseStyle('background:#1d3a2c;border-radius:20px;padding:44px 40px;display:flex;flex-direction:column;transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
            <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(24px,2.8vw,32px);color:#f7f2e8;margin:0 0 12px;line-height:1.1;')}>Quer vender com a gente?</h3>
            <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.75);font-weight:300;line-height:1.55;margin:0 0 22px;')}>Avaliação justa e um especialista do seu bairro do anúncio à chave.</p>
            <span style={parseStyle('margin-top:auto;color:#cdab6e;font-weight:600;font-size:15px;')}>Anunciar meu imóvel →</span>
          </Hoverable>
          <Hoverable as="a" href="/lotus-busca" target="_top" baseStyle={parseStyle('background:#fff;border-radius:20px;padding:44px 40px;display:flex;flex-direction:column;box-shadow:0 18px 44px -32px rgba(21,36,28,.3);transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
            <h3 style={parseStyle('font-family:\'Fraunces\',serif;font-weight:300;font-size:clamp(24px,2.8vw,32px);color:#15241c;margin:0 0 12px;line-height:1.1;')}>Procurando um imóvel?</h3>
            <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 22px;')}>Comece pela conversa: descreva o que procura e a gente encontra.</p>
            <span style={parseStyle('margin-top:auto;color:#b18a4a;font-weight:600;font-size:15px;')}>Explorar imóveis →</span>
          </Hoverable>
        </div>
      </section>

      {/* FOOTER */}
      <footer data-rodape-portal="" style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1200px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:40px;padding-bottom:48px;border-bottom:1px solid rgba(247,242,232,.12);')}>
            <div>
              <div style={parseStyle('display:flex;align-items:center;gap:12px;margin-bottom:18px;')}>
                <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
              </div>
              <p style={parseStyle('font-family:\'Fraunces\',serif;font-style:italic;font-weight:300;font-size:19px;color:rgba(247,242,232,.85);line-height:1.35;max-width:300px;margin:0 0 18px;')}>Grandes escolhas têm endereço.</p>
              <p style={parseStyle('font-size:13.5px;color:rgba(247,242,232,.55);line-height:1.6;margin:0;')}>Consultoria imobiliária para compra, venda, locação e investimento em imóveis de médio e alto padrão em Jundiaí, Itupeva e região.</p>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>A Lotus</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="/lotus-sobre" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Sobre nós</Hoverable>
                <Hoverable as="a" href="/lotus-corretores" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Corretores</Hoverable>
                <Hoverable as="a" href="/lotus-recrutamento" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Seja um corretor</Hoverable>
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
                <Hoverable as="a" href="/lotus-home#blog" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Blog</Hoverable>
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

      {/* WHATSAPP FLOAT */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
