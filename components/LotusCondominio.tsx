'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusCondominio — porte 1:1 de lotus-condominio/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (iguais às de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *
 * O <script data-dc-script> deste fonte NÃO tem componentDidMount/observers/carrosséis:
 * só state { openFaq, leadDone }, rootRef e renderVals(). Portanto o único comportamento
 * imperativo é o toggle da FAQ e o submit do formulário de lead — ambos setState.
 * Não há elementos data-reveal / data-count no markup: nada de IntersectionObserver a portar.
 * O banner de cookies (script global fora do <x-dc>) segue a mesma convenção de LotusHome:
 * não é portado aqui (é preocupação global do layout, não do Component dc).
 */

import Link from 'next/link';
import LotusHeader from './LotusHeader';
import React, {
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { CondominioRow, CondominioCard } from '@/lib/condominios';

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

/* ------------------------------------------------------------------ */
/* Props / dados estáticos (valores exatos do fonte)                  */
/* ------------------------------------------------------------------ */

// data-props do dc-runtime: whatsapp default "5511926143393".
const WHATSAPP_DEFAULT = '5511926143393';

// Fallbacks quando o campo do banco vier nulo/vazio (mantém o layout coerente).
const FALLBACK_CIDADE = 'Jundiaí e Itupeva';

/* ---- Derivação dos itens de lazer/estrutura a partir das infra_* ---- */
// Mapa infra_<coluna> -> rótulo legível. Só entra na lista quando a coluna é true.
const INFRA_LABELS: Record<string, string> = {
  infra_piscina: 'Piscina',
  infra_academia: 'Academia',
  infra_playground: 'Playground',
  infra_salao_festas: 'Salão de festas',
  infra_churrasqueira: 'Churrasqueira',
  infra_quadra_poliesportiva: 'Quadra poliesportiva',
  infra_portaria_24h: 'Portaria 24h',
  infra_espaco_gourmet: 'Espaço gourmet',
  infra_brinquedoteca: 'Brinquedoteca',
  infra_sauna_seca: 'Sauna',
  infra_salao_jogos: 'Salão de jogos',
  infra_bicicletario: 'Bicicletário',
  infra_espaco_pet: 'Espaço pet',
  infra_wifi: 'Wi-Fi nas áreas comuns',
};

function infraItens(data: CondominioRow): string[] {
  return Object.entries(INFRA_LABELS)
    .filter(([key]) => data[key as `infra_${string}`] === true)
    .map(([, label]) => label);
}

// "75 a 100 m²" (faixa) ou "75 m²" (único) ou "" quando não há metragens.
function metragensLabel(metragens: number[] | null): string {
  if (!metragens || metragens.length === 0) return '';
  const min = Math.min(...metragens);
  const max = Math.max(...metragens);
  return min === max ? `${min} m²` : `${min} a ${max} m²`;
}

function primeiraFrase(texto: string): string {
  const m = texto.match(/[^.!?]+[.!?]/);
  return (m ? m[0] : texto).trim();
}

// faqData genérico adaptado ao condomínio (perguntas com o nome; respostas curtas).
function buildFaq(data: CondominioRow) {
  const nome = data.nome;
  const cidade = data.cidade || FALLBACK_CIDADE;
  const lazer = infraItens(data);
  const lazerTexto = lazer.length ? lazer.slice(0, 5).join(', ') : 'áreas de lazer e convivência';
  return [
    {
      q: `Vale a pena morar no ${nome}?`,
      a: `O ${nome} é procurado por famílias em ${cidade} pela combinação de segurança, estrutura de lazer e qualidade de vida. A Lotus conhece o condomínio por dentro e ajuda você a avaliar se ele faz sentido para o seu momento.`,
    },
    {
      q: `O que tem de lazer no ${nome}?`,
      a: lazer.length
        ? `Entre a estrutura de lazer e convivência do condomínio estão: ${lazerTexto}.`
        : `O condomínio conta com áreas de lazer e convivência. Fale com o especialista da Lotus para conhecer a estrutura completa e o que está disponível hoje.`,
    },
    {
      q: `Quais tipos de imóvel existem no ${nome}?`,
      a: `As unidades variam em metragem e configuração. A Lotus tem especialistas que conhecem cada tipo de unidade do condomínio e o que está disponível para compra no momento.`,
    },
    {
      q: 'O condomínio é seguro?',
      a: data.infra_portaria_24h === true
        ? 'Sim. Conta com portaria 24h e controle de acesso — um dos motivos da procura por famílias com crianças.'
        : 'A segurança é um dos pontos avaliados por quem procura o condomínio. Fale com o especialista da Lotus para detalhes sobre portaria e controle de acesso.',
    },
  ];
}

// guide editorial genérico adaptado ao condomínio.
function buildGuide(data: CondominioRow) {
  const cidade = data.cidade || FALLBACK_CIDADE;
  const lazer = infraItens(data);
  const lazerTexto = lazer.length ? lazer.slice(0, 5).join(', ') : 'piscina, quadras e espaço gourmet';
  return [
    {
      num: '1',
      title: 'Segurança que dá tranquilidade',
      text: 'Condomínio fechado com controle de acesso — o tipo de lugar onde a família vive com mais tranquilidade no dia a dia.',
    },
    {
      num: '2',
      title: 'Lazer dentro de casa',
      text: `Estrutura de lazer e convivência para o fim de semana acontecer dentro do condomínio: ${lazerTexto}.`,
    },
    {
      num: '3',
      title: 'Qualidade de vida',
      text: `Ambiente planejado, áreas de convívio e a rotina mais leve de quem mora em condomínio em ${cidade}.`,
    },
    {
      num: '4',
      title: 'Variedade de unidades',
      text: 'Unidades em diferentes metragens e configurações — a Lotus ajuda você a encontrar a que combina com o seu momento.',
    },
    {
      num: '5',
      title: 'Localização e conveniência',
      text: `Boa localização em ${cidade}, com comércio, escolas e serviços do dia a dia ao alcance.`,
    },
  ];
}

// imoveis: sem fonte por condomínio no escopo atual — vitrine genérica na paleta
// (títulos/preços neutros, sem cravar dados de um imóvel específico).
// ponytail: vitrine estática; trocar por busca real de imóveis do condomínio quando existir a lib.
const imoveis = [
  { slot: 'cond-im-1', img: '/forest-houses/a002.jpg', tag: 'Revenda', title: 'Casa à venda', specs: 'Consulte metragem e vagas' },
  { slot: 'cond-im-2', img: '/vistta-castanho/a007.jpg', tag: 'Revenda', title: 'Apartamento à venda', specs: 'Consulte metragem e vagas' },
  { slot: 'cond-im-3', img: '/gran-ville-santo-angelo/a038.jpg', tag: 'Revenda', title: 'Unidade disponível', specs: 'Consulte metragem e vagas' },
  { slot: 'cond-im-4', img: '/auten-jundiai/a023.jpg', tag: 'Lançamento', title: 'Unidade disponível', specs: 'Consulte metragem e vagas' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusCondominio({
  data,
  relacionados,
  whatsapp = WHATSAPP_DEFAULT,
}: {
  data: CondominioRow;
  relacionados: CondominioCard[];
  whatsapp?: string;
}) {
  // state do Component dc: { openFaq: 0, leadDone: false }
  const [openFaq, setOpenFaq] = useState(0);
  const [leadDone, setLeadDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* ---- Valores derivados do condomínio (banco) ---- */
  const nome = data.nome;
  const cidade = data.cidade || FALLBACK_CIDADE;
  const metragens = metragensLabel(data.metragens_disponiveis);
  const lazerItens = infraItens(data);
  const tipoLabel = data.tipo || 'Condomínio';
  const numUnidades =
    typeof data.num_blocos_torres === 'number' && data.num_blocos_torres > 0
      ? String(data.num_blocos_torres)
      : null;

  // Fotos do banco (capa primeiro). Sem fotos => slots caem no placeholder do ImageSlot.
  const fotos = data.fotos ?? [];
  const fotoCapa = (fotos.find((f) => f.isCapa) ?? fotos[0])?.url;
  const galeria = fotos.map((f) => f.url); // ordem do banco
  const fotoAt = (i: number): string | undefined => galeria[i];

  const descricao =
    data.descricao_site?.trim() ||
    `O ${nome} é um condomínio em ${cidade}, procurado por famílias pela estrutura, segurança e qualidade de vida. A Lotus conhece o condomínio por dentro e acompanha você na compra.`;
  const tldr = primeiraFrase(descricao);

  const faqData = buildFaq(data);
  const guide = buildGuide(data);

  const mapaQuery = encodeURIComponent(`${nome}, ${cidade}, SP`);

  // Mini-stats do hero: só entram os campos que existem no banco (nada inventado).
  const stats: { value: string; label: string }[] = [
    { value: tipoLabel, label: 'tipo de condomínio' },
  ];
  if (numUnidades) stats.push({ value: numUnidades, label: 'blocos / torres' });
  if (metragens) stats.push({ value: metragens, label: 'metragens disponíveis' });
  if (data.ano_construcao) stats.push({ value: String(data.ano_construcao), label: 'ano de construção' });
  if (data.construtora) stats.push({ value: data.construtora, label: 'construtora' });
  if (data.infra_portaria_24h === true) stats.push({ value: '24h', label: 'portaria e segurança' });

  // waLink — lógica exata do renderVals(), agora com o nome do condomínio.
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent(`Quero saber sobre imóveis no ${nome}, ${cidade}.`);

  // faqs derivados (open/sign/toggle) — igual ao map do renderVals().
  const faqs = faqData.map((f, i) => ({
    q: f.q,
    a: f.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((prev) => (prev === i ? -1 : i)),
  }));

  const leadNotDone = !leadDone;

  const submitLead = (e: FormEvent<HTMLFormElement>) => {
    if (e && e.preventDefault) e.preventDefault();
    setLeadDone(true);
  };

  return (
    <div ref={rootRef}>
      {/* HEADER */}
      <LotusHeader active="bairros" whatsapp={whatsapp} />

      {/* BREADCRUMB */}
      <div style={parseStyle('max-width:1200px;margin:0 auto;padding:18px 32px 0;font-size:13px;color:#8aa593;')}>
        <Hoverable as="a" target="_top" href="/lotus-condominio" baseStyle={parseStyle('color:#3f6249;')} hoverStyle={parseStyle('color:#b18a4a')}>Condomínios</Hoverable> › <a target="_top" href="/lotus-home" style={parseStyle('color:#3f6249;')}>{cidade}</a> › <span style={parseStyle('color:#15241c;')}>{nome}</span>
      </div>

      {/* HERO */}
      <section style={parseStyle('max-width:1200px;margin:16px auto 0;padding:0 32px;')}>
        <div style={parseStyle('position:relative;border-radius:22px;overflow:hidden;height:clamp(320px,42vw,460px);background:#1d3a2c;')}>
          <ImageSlot id="cond-hero" src={fotoCapa} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`Foto do condomínio ${nome}`} />
          <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.25) 0%,rgba(21,36,28,.2) 40%,rgba(21,36,28,.88) 100%);')}></div>
          <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:clamp(28px,4vw,48px);')}>
            <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>{tipoLabel} · {cidade}</div>
            <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,5.2vw,64px);line-height:1.02;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 14px;")}>Morar no {nome}</h1>
            <p style={parseStyle('font-size:clamp(15px,1.6vw,19px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.5;max-width:620px;margin:0;')}>{tldr}</p>
          </div>
        </div>
        {/* mini stats */}
        <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:18px;')}>
          {stats.slice(0, 4).map((s, i) => (
            <div key={i} style={parseStyle('background:#fff;border-radius:14px;padding:20px 22px;box-shadow:0 14px 36px -30px rgba(21,36,28,.4);')}>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:26px;color:#1d3a2c;")}>{s.value}</div>
              <div style={parseStyle('font-size:13px;color:#8aa593;margin-top:3px;')}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GEO / TL;DR + FAQ */}
      <section style={parseStyle('max-width:1200px;margin:0 auto;padding:72px 32px;display:grid;grid-template-columns:1fr 1.05fr;gap:48px;align-items:start;')}>
        <div>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Resumo do condomínio</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 20px;")}>{nome} em poucas linhas.</h2>
          <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
            <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>TL;DR</div>
            <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>{descricao}</p>
          </div>
        </div>
        <div>
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
      </section>

      {/* O QUE OFERECE (guia) */}
      <section style={parseStyle('background:#ece2cf;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1080px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;max-width:620px;margin:0 auto 56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>O que o condomínio oferece</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.4vw,44px);color:#15241c;margin:0;")}>Como é viver no {nome}.</h2>
          </div>
          <div style={parseStyle('display:flex;flex-direction:column;gap:18px;')}>
            {guide.map((g, i) => (
              <div key={i} style={parseStyle('display:grid;grid-template-columns:64px 1fr;gap:24px;background:#f7f2e8;border-radius:18px;padding:30px 32px;align-items:start;')}>
                <div style={parseStyle('width:54px;height:54px;border-radius:14px;background:#1d3a2c;display:flex;align-items:center;justify-content:center;')}><span style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#cdab6e;")}>{g.num}</span></div>
                <div>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:22px;color:#15241c;margin:0 0 10px;")}>{g.title}</h3>
                  <p style={parseStyle('font-size:15.5px;color:#3f6249;font-weight:300;line-height:1.65;margin:0;')}>{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:600px;margin-bottom:40px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Galeria</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0;")}>Por dentro do condomínio.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:12px;height:clamp(320px,42vw,500px);border-radius:20px;overflow:hidden;')}>
            <div style={parseStyle('grid-row:span 2;position:relative;background:#1d3a2c;')}><ImageSlot id="cond-g1" src={fotoAt(0)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${nome} — foto 1`} /></div>
            <div style={parseStyle('position:relative;background:#3f6249;')}><ImageSlot id="cond-g2" src={fotoAt(1)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${nome} — foto 2`} /></div>
            <div style={parseStyle('position:relative;background:#3f6249;')}><ImageSlot id="cond-g3" src={fotoAt(2)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${nome} — foto 3`} /></div>
            <div style={parseStyle('position:relative;background:#3f6249;')}><ImageSlot id="cond-g4" src={fotoAt(3)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${nome} — foto 4`} /></div>
            <div style={parseStyle('position:relative;background:#3f6249;')}><ImageSlot id="cond-g5" src={fotoAt(4)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={`${nome} — foto 5`} /></div>
          </div>
        </div>
      </section>

      {/* IMÓVEIS NO CONDOMÍNIO */}
      <section style={parseStyle('background:#ece2cf;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:36px;')}>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,40px);color:#15241c;margin:0;")}>Imóveis no {nome}</h2>
            <a target="_top" href="/lotus-busca" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Ver todos no condomínio <span>→</span></a>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px;')}>
            {imoveis.map((m, i) => (
              <Hoverable key={i} as="a" target="_top" href="/lotus-imovel" baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -30px rgba(21,36,28,.34);transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
                <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}>
                  <ImageSlot id={m.slot} src={m.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={m.title} />
                  <span style={parseStyle('position:absolute;top:12px;left:12px;background:rgba(29,58,44,.82);color:#f7f2e8;font-size:11px;font-weight:600;padding:5px 11px;border-radius:30px;')}>{m.tag}</span>
                </div>
                <div style={parseStyle('padding:18px;')}>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;")}>{m.title}</div>
                  <div style={parseStyle('font-size:12.5px;color:#3f6249;margin-top:6px;')}>{m.specs}</div>
                </div>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={parseStyle('background:#1d3a2c;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:stretch;')}>
          <div style={parseStyle('position:relative;border-radius:18px;overflow:hidden;min-height:360px;background:#e7e4d7;')}>
            <svg viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')}>
              <rect width="400" height="360" fill="#e7e4d7"></rect>
              <path d="M-20 90 L180 50 L420 120" stroke="#d8d2bf" strokeWidth="13" fill="none"></path>
              <path d="M70 -20 L120 200 L90 380" stroke="#d8d2bf" strokeWidth="11" fill="none"></path>
              <path d="M-20 250 L200 210 L420 260" stroke="#d8d2bf" strokeWidth="15" fill="none"></path>
              <circle cx="300" cy="100" r="55" fill="#cdd9c6" opacity=".55"></circle>
            </svg>
            <div style={parseStyle('position:absolute;left:50%;top:48%;transform:translate(-50%,-100%);background:#1d3a2c;color:#f7f2e8;border:2px solid #f7f2e8;border-radius:30px;padding:6px 13px;font-size:12.5px;font-weight:700;')}>{nome}</div>
            <div style={parseStyle('position:absolute;bottom:12px;left:12px;background:rgba(247,242,232,.9);border-radius:8px;padding:6px 10px;font-size:11.5px;color:#3f6249;')}>Localização aproximada</div>
          </div>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>Lazer e estrutura</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.6vw,32px);color:#f7f2e8;margin:0 0 22px;")}>Tudo o que importa, dentro do condomínio.</h2>
            {lazerItens.length > 0 ? (
              <div style={parseStyle('display:flex;flex-direction:column;gap:2px;margin-bottom:26px;')}>
                {lazerItens.map((item, i) => (
                  <div key={i} style={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid rgba(247,242,232,.12);')}>
                    <span style={parseStyle('font-size:14.5px;color:rgba(247,242,232,.85);')}>{item}</span>
                    <span style={parseStyle("font-family:'Fraunces',serif;font-size:18px;color:#cdab6e;white-space:nowrap;")}>✓</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.8);font-weight:300;line-height:1.6;margin:0 0 26px;')}>Localização privilegiada em {cidade}. Fale com o especialista da Lotus para conhecer a estrutura de lazer e o entorno do condomínio.</p>
            )}
            <a target="_top" href="/lotus-bairro" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#cdab6e;font-weight:600;font-size:14.5px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Conhecer a região de {cidade} <span>→</span></a>
          </div>
        </div>
      </section>

      {/* ESPECIALISTA — desativado: "Rafael Nunes" e o CRECI 000002-F são
          placeholders de pessoa fictícia. Seção preservada para reativação
          quando houver um corretor real responsável pelo condomínio. */}
      {false && (
      <section style={parseStyle('background:#3f6249;padding:80px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:980px;margin:0 auto;position:relative;display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center;')}>
          <div style={parseStyle('width:130px;height:130px;border-radius:50%;background:#1d3a2c;overflow:hidden;position:relative;flex-shrink:0;')}><ImageSlot id="cond-especialista" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Rafael" /></div>
          <div>
            <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Especialista do condomínio</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.8vw,34px);color:#f7f2e8;margin:0 0 10px;line-height:1.1;")}>Rafael Nunes conhece o {nome} por dentro.</h2>
            <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.8);font-weight:300;line-height:1.55;margin:0 0 20px;max-width:560px;')}>Especialista em condomínios de {cidade}, CRECI 000002-F. Sabe quais unidades têm as melhores posições e o que está disponível agora — antes de ir aos portais.</p>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Falar com o Rafael <span>→</span></Hoverable>
          </div>
        </div>
      </section>
      )}

      {/* AVALIAÇÃO / CAPTAÇÃO */}
      <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
        <div style={parseStyle('max-width:880px;margin:0 auto;text-align:center;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.4vw,42px);color:#15241c;margin:0 0 16px;line-height:1.08;")}>Tem um imóvel no {nome}? Descubra quanto vale.</h2>
          <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;max-width:560px;margin:0 auto 30px;')}>Avaliação gratuita por quem conhece o condomínio de verdade — sem custo e sem compromisso.</p>
          <Hoverable as="a" target="_top" href="/lotus-anunciar" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Avaliar meu imóvel <span>→</span></Hoverable>
        </div>
      </section>

      {/* FORM INTERESSE */}
      <section style={parseStyle('background:#1d3a2c;padding:90px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:680px;margin:0 auto;position:relative;text-align:center;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>Interesse no {nome}</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.8vw,44px);color:#f7f2e8;line-height:1.05;margin:0 0 14px;")}>Quer conhecer o {nome}?</h2>
          <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;margin:0 0 34px;')}>Deixe seu contato e o especialista do condomínio chama você no WhatsApp para mostrar as melhores unidades disponíveis.</p>
          <div style={parseStyle('background:#f7f2e8;border-radius:22px;padding:clamp(28px,4vw,40px);text-align:left;')}>
            {leadDone && (
              <>
                <div style={parseStyle('text-align:center;padding:24px 0;')}>
                  <div style={parseStyle('width:60px;height:60px;border-radius:50%;background:#1d3a2c;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"></path></svg></div>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#1d3a2c;margin-bottom:10px;")}>Recebido! 🌿</div>
                  <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>O especialista do {nome} vai te chamar no WhatsApp em breve.</p>
                </div>
              </>
            )}
            {leadNotDone && (
              <>
                <form onSubmit={submitLead} style={parseStyle('display:flex;flex-direction:column;gap:13px;')}>
                  <input type="text" required placeholder="Seu nome" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:13px 14px;border-radius:11px;outline:none;')} />
                  <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                    <input type="email" required placeholder="E-mail" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:13px 14px;border-radius:11px;outline:none;')} />
                    <input type="text" required placeholder="Telefone / WhatsApp" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:13px 14px;border-radius:11px;outline:none;')} />
                  </div>
                  <label style={parseStyle('display:flex;align-items:flex-start;gap:9px;font-size:12px;color:#3f6249;line-height:1.45;cursor:pointer;')}>
                    <input type="checkbox" required style={parseStyle('margin-top:2px;width:16px;height:16px;accent-color:#1d3a2c;')} />
                    Autorizo a Lotus a entrar em contato sobre o {nome} e concordo com a Política de Privacidade (LGPD).
                  </label>
                  <Hoverable as="button" type="submit" baseStyle={parseStyle('margin-top:6px;background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:16px;border:none;border-radius:12px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>Tenho interesse</Hoverable>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CONDOMÍNIOS RELACIONADOS */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(22px,2.6vw,32px);color:#15241c;margin:0 0 28px;")}>Condomínios parecidos na região</h2>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;')}>
            {relacionados.map((r) => (
              <Hoverable key={r.id} as="a" href={`/lotus-condominio/${r.id}`} baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 36px -32px rgba(21,36,28,.32);transition:transform .25s ease;')} hoverStyle={parseStyle('transform:translateY(-3px)')}>
                <div style={parseStyle('position:relative;aspect-ratio:16/10;background:#1d3a2c;')}><ImageSlot id={`cond-rel-${r.id}`} src={r.capa ?? undefined} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={r.nome} /></div>
                <div style={parseStyle('padding:16px 18px;')}>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-size:18px;color:#15241c;margin:0 0 4px;line-height:1.1;")}>{r.nome}</h3>
                  <div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{r.bairro ? `${r.bairro}, ${r.cidade ?? ''}` : (r.cidade ?? '')}</div>
                </div>
              </Hoverable>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="mapa" style={parseStyle('background:#1d3a2c;padding:72px 32px;')}>
        <div style={parseStyle('max-width:1180px;margin:0 auto;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>No mapa</div>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.6vw,32px);color:#f7f2e8;margin:0 0 24px;")}>{nome} no mapa</h2>
          <div style={parseStyle('position:relative;border-radius:18px;overflow:hidden;min-height:380px;background:#e7e4d7;')}>
            <iframe title={`${nome} no mapa`} src={`https://www.google.com/maps?q=${mapaQuery}&z=14&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;border:0;')} allowFullScreen></iframe>
          </div>
        </div>
      </section>
      <footer style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1280px;margin:0 auto;position:relative;')}>
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
                <Hoverable as="a" target="_top" href="/lotus-recrutamento" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Seja um corretor</Hoverable>
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
              <Hoverable as="a" href="https://www.facebook.com/lotusbrokers" target="_blank" rel="noopener" aria-label="Facebook" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.youtube.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="YouTube" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z"></path></svg></Hoverable>
              <Hoverable as="a" href="https://www.instagram.com/lotusbrokers" target="_blank" rel="noopener" aria-label="Instagram" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg></Hoverable>
              <Hoverable as="a" href="https://www.tiktok.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="TikTok" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z"></path></svg></Hoverable>
            </div>
          </div>
        </div>
      </footer>

      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
