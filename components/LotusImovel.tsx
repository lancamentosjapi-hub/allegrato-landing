'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusImovel — porte 1:1 de lotus-imovel/index.html (mecanismo dc-runtime) para React,
 * agora PARAMETRIZADO por imóvel (prop `data`) lido do Supabase pela rota
 * /lotus-imovel/[codigo]. Visual e comportamento idênticos ao estático.
 *
 * Convenções de porte (mesmas de LotusHome / LotusCondominio):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *  - keydown do lightbox / sliders / toggles -> useEffect / useState
 *
 * Dados vêm de `data: ImovelRow`. Onde o banco não tem informação, o texto é
 * genérico e honesto (nada de preço/distância/metragem inventados).
 */

import Link from 'next/link';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { formatValor, type ImovelRow, type ImovelCard } from '@/lib/imoveis';
import LotusHeader from './LotusHeader';

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
/* Dados / derivações do imóvel                                        */
/* ------------------------------------------------------------------ */

// data-props default do <script data-props="{...whatsapp:{default:'5511926143393'}}">
const WHATSAPP_DEFAULT = '5511926143393';

const FALLBACK_CIDADE = 'Jundiaí e Itupeva';

// Título do imóvel: usa data.titulo; se vazio, monta de tipo + quartos/suítes + bairro.
function buildTitulo(data: ImovelRow): string {
  if (data.titulo?.trim()) return data.titulo.trim();
  const tipo = data.tipo || data.tipo_simplificado || 'Imóvel';
  const q = data.suites || data.quartos;
  const comodo = data.suites ? 'suítes' : 'dormitórios';
  const partes = [tipo];
  if (q) partes.push(`de ${q} ${comodo}`);
  if (data.bairro) partes.push(`em ${data.bairro}`);
  return partes.join(' ');
}

// Local "Bairro · Cidade" (o que existir), para tags/labels curtas.
function localCurto(data: ImovelRow): string {
  const cidade = data.cidade || FALLBACK_CIDADE;
  return data.bairro ? `${data.bairro} · ${cidade}` : cidade;
}

// FAQ genérico adaptado ao bairro/tipo (nada de dados inventados por imóvel).
function buildFaq(data: ImovelRow) {
  const tipoLabel = (data.tipo || data.tipo_simplificado || 'imóvel').toLowerCase();
  const local = data.bairro || data.cidade || 'na região';
  return [
    {
      q: 'O imóvel aceita financiamento?',
      a: `A maioria dos imóveis aceita financiamento bancário. A Lotus acompanha a simulação e a aprovação com você — fale com o especialista para confirmar as condições deste ${tipoLabel}.`,
    },
    {
      q: 'Como agendar uma visita?',
      a: 'É só preencher o formulário ao lado ou chamar no WhatsApp — o especialista combina o melhor horário com você.',
    },
    {
      q: `Por que morar em ${local}?`,
      a: `${data.bairro ? `${data.bairro}` : 'A região'} é procurada por quem busca qualidade de vida perto do dia a dia. O especialista da Lotus conhece a região e ajuda a avaliar se este imóvel faz sentido para o seu momento.`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusImovel({
  data,
  relacionados,
  whatsapp = WHATSAPP_DEFAULT,
}: {
  data: ImovelRow;
  relacionados: ImovelCard[];
  whatsapp?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  /* ---- Valores derivados do imóvel (banco) ---- */
  const titulo = buildTitulo(data);
  const cidade = data.cidade || FALLBACK_CIDADE;
  const bairro = data.bairro || cidade;
  const tipoLabel = data.tipo || data.tipo_simplificado || 'Imóvel';

  // Valor: para locação usa valor_locacao; senão valor_venda. formatValor cobre null/0.
  const isLocacao = (data.finalidade || '').toLowerCase().includes('locac')
    || (data.finalidade || '').toLowerCase().includes('alug');
  const valorPrincipal = isLocacao
    ? (data.valor_locacao ?? data.valor_venda)
    : (data.valor_venda ?? data.valor_locacao);
  const valorFmtStr = formatValor(valorPrincipal ?? null);
  const valorSufixo = isLocacao && valorPrincipal ? '/mês' : '';

  // Custos recorrentes (só entram os que existem).
  const custosRecorrentes: string[] = [];
  if (data.valor_iptu) custosRecorrentes.push(`IPTU ${formatValor(data.valor_iptu)}/ano`);
  custosRecorrentes.push(
    data.valor_condominio ? `condomínio ${formatValor(data.valor_condominio)}/mês` : 'sem condomínio',
  );
  const subValor = custosRecorrentes.join(' · ');

  // Área para o texto/schema: prioriza area_util, cai para area_total ou metragem_m2.
  const areaPrincipal = data.area_util || data.area_total || data.metragem_m2 || null;

  // Stats do imóvel (só entram os campos preenchidos — nada inventado).
  const stats: { value: string; label: string }[] = [];
  if (data.quartos) stats.push({ value: String(data.quartos), label: 'dormitórios' });
  if (data.suites) stats.push({ value: String(data.suites), label: 'suítes' });
  if (data.banheiros) stats.push({ value: String(data.banheiros), label: 'banheiros' });
  if (data.vagas) stats.push({ value: String(data.vagas), label: 'vagas' });
  if (data.area_util) stats.push({ value: String(data.area_util), label: 'm² úteis' });
  if (data.area_total) stats.push({ value: String(data.area_total), label: 'm² terreno' });

  // Descrição: usa a do banco; se vazia, texto genérico curto e honesto.
  const descricao =
    data.descricao?.trim() ||
    `${titulo}. Fale com o especialista da Lotus para conhecer os detalhes, agendar uma visita e tirar suas dúvidas sobre este imóvel em ${bairro}.`;

  // Fotos do banco (capa primeiro). Sem fotos => slots caem no placeholder do ImageSlot.
  const fotosRaw = data.fotos ?? [];
  const capa = fotosRaw.find((f) => f.isCapa);
  const fotos = capa ? [capa, ...fotosRaw.filter((f) => f !== capa)] : fotosRaw;
  const numFotos = fotos.length;
  const fotoUrl = (i: number): string | undefined => fotos[i]?.url;
  const fotoLegenda = (i: number): string =>
    fotos[i]?.legenda || `${titulo} — foto ${i + 1}`;

  // Mosaico: sempre 5 slots (layout idêntico ao estático); slots sem foto ficam
  // no gradiente placeholder. Overlay "+N fotos" só quando há mais que 5.
  const gallerySlots = [0, 1, 2, 3, 4];
  const extraFotos = Math.max(0, numFotos - 5);

  // Lightbox percorre TODAS as fotos existentes (não fixo em 5). Sem fotos => desabilitado.
  const totalLightbox = Math.max(1, numFotos);

  const local = localCurto(data);
  const mapaBase = data.logradouro
    ? [data.logradouro, data.numero, bairro, cidade, data.estado || 'SP'].filter(Boolean).join(', ')
    : `${bairro}, ${cidade}, ${data.estado || 'SP'}`;
  const mapaQuery = encodeURIComponent(mapaBase);

  const faqData = buildFaq(data);

  // state = { saved, formDone, lightboxOpen, lightboxIndex, valor, entrada, prazo, taxa, openFaq }
  const [saved, setSaved] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Calculadora começa no valor de venda do imóvel (dentro dos limites do slider).
  const valorInicial = Math.min(5000000, Math.max(500000, data.valor_venda || 2450000));
  const [valor, setValor] = useState(valorInicial);
  const [entrada, setEntrada] = useState(20);
  const [prazo, setPrazo] = useState(30);
  const [taxa, setTaxa] = useState(10.5);
  const [openFaq, setOpenFaq] = useState(0);

  // fmt(n) do estático
  const fmt = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');

  // waLink montado como no renderVals do estático, agora com o imóvel/local reais.
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent(
      `Vim pela página do imóvel ${data.codigo_imovel} (${titulo}) e quero agendar uma visita.`,
    );

  // Cálculo da calculadora (Tabela Price) — idêntico ao renderVals.
  const financed = valor * (1 - entrada / 100);
  const i = taxa / 100 / 12;
  const n = prazo * 12;
  const parcela = i > 0 ? (financed * i) / (1 - Math.pow(1 + i, -n)) : financed / n;
  const renda = parcela / 0.3;

  // photosView do lightbox (uma por foto existente).
  const li = lightboxIndex;
  const photosView = fotos.map((f, idx) => ({
    lbId: 'imovel-foto-' + (idx + 1),
    src: f.url,
    label: f.legenda || `${titulo} — foto ${idx + 1}`,
    style:
      'position:absolute;inset:0;opacity:' +
      (idx === li ? '1' : '0') +
      ';transition:opacity .35s ease;pointer-events:' +
      (idx === li ? 'auto' : 'none') +
      ';',
  }));

  // faqs derivados (open / sign / toggle).
  const faqs = faqData.map((f, idx) => ({
    q: f.q,
    a: f.a,
    open: openFaq === idx,
    sign: openFaq === idx ? '–' : '+',
    toggle: () => setOpenFaq((prev) => (prev === idx ? -1 : idx)),
  }));

  // componentDidMount / componentWillUnmount: navegação por teclado no lightbox.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      else if (e.key === 'ArrowRight') setLightboxIndex((s) => (s + 1) % totalLightbox);
      else if (e.key === 'ArrowLeft') setLightboxIndex((s) => (s + totalLightbox - 1) % totalLightbox);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, totalLightbox]);

  // Handlers derivados (mesmos do render context do estático).
  const toggleSave = () => setSaved((s) => !s);
  const saveLabel = saved ? 'Salvo' : 'Salvar';
  const submitForm = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormDone(true);
  };
  const openLightbox = (idx: number) => {
    if (numFotos === 0) return; // sem fotos: não abre lightbox vazio
    setLightboxOpen(true);
    setLightboxIndex(Math.min(idx, numFotos - 1));
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextPhoto = () => setLightboxIndex((s) => (s + 1) % totalLightbox);
  const prevPhoto = () => setLightboxIndex((s) => (s + totalLightbox - 1) % totalLightbox);
  const lightboxCounter = li + 1 + ' / ' + totalLightbox;

  const valorFmt = fmt(valor);
  const entradaFmt = fmt((valor * entrada) / 100);
  const parcelaFmt = fmt(parcela);
  const financedFmt = fmt(financed);
  const rendaFmt = fmt(renda);

  return (
    <div ref={rootRef}>
      {/* HEADER */}
      <LotusHeader
        whatsapp={whatsapp}
        rightSlot={
          <div style={parseStyle('display:flex;align-items:center;gap:14px;')}>
            <button onClick={toggleSave} style={parseStyle('display:inline-flex;align-items:center;gap:7px;background:none;border:none;color:rgba(247,242,232,.85);font-size:14px;font-weight:500;cursor:pointer;')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#cdab6e' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
              {saveLabel}
            </button>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:7px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14px;padding:9px 17px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Falar com a LIA</Hoverable>
          </div>
        }
      />

      {/* BREADCRUMB + MEDIA TABS */}
      <div style={parseStyle('max-width:1280px;margin:0 auto;padding:18px 32px 0;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;')}>
        <div style={parseStyle('font-size:13px;color:#8aa593;')}>
          <Hoverable as="a" href="/lotus-busca" target="_top" baseStyle={parseStyle('color:#3f6249;')} hoverStyle={parseStyle('color:#b18a4a')}>Comprar</Hoverable> › <Link href="/lotus-busca" style={parseStyle('color:#3f6249;')}>{cidade}</Link> › <Link href="/lotus-busca" style={parseStyle('color:#3f6249;')}>{bairro}</Link> › <span style={parseStyle('color:#15241c;')}>{tipoLabel}</span>
        </div>
        <div style={parseStyle('display:flex;gap:6px;')}>
          <a href="#galeria" style={parseStyle('font-size:13px;font-weight:600;color:#1d3a2c;background:#ece2cf;padding:7px 14px;border-radius:30px;')}>Fotos</a>
          {(data.tour_virtual || data.link_video) && (
            <Hoverable as="a" href="#tour" baseStyle={parseStyle('font-size:13px;font-weight:600;color:#3f6249;padding:7px 14px;border-radius:30px;')} hoverStyle={parseStyle('background:#ece2cf')}>{data.tour_virtual ? 'Tour 3D' : 'Vídeo'}</Hoverable>
          )}
          <Hoverable as="a" href="#mapa" baseStyle={parseStyle('font-size:13px;font-weight:600;color:#3f6249;padding:7px 14px;border-radius:30px;')} hoverStyle={parseStyle('background:#ece2cf')}>Mapa</Hoverable>
        </div>
      </div>

      {/* GALLERY MOSAIC */}
      <section id="galeria" style={parseStyle('max-width:1280px;margin:16px auto 0;padding:0 32px;')}>
        <div style={parseStyle('position:relative;display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;height:clamp(340px,46vw,520px);border-radius:20px;overflow:hidden;')}>
          {gallerySlots.map((slot) => {
            const src = fotoUrl(slot);
            const first = slot === 0;
            const last = slot === 4;
            return (
              <button
                key={slot}
                onClick={() => openLightbox(slot)}
                style={parseStyle(
                  (first ? 'grid-row:span 2;' : '') +
                    'position:relative;border:none;padding:0;cursor:pointer;background:' +
                    (first ? '#1d3a2c' : '#3f6249') + ';',
                )}
              >
                <ImageSlot id={`imovel-foto-${slot + 1}`} src={src} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={fotoLegenda(slot)} />
                {first && (
                  <>
                    <span style={parseStyle('position:absolute;top:16px;left:16px;background:#b18a4a;color:#15241c;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:30px;')}>Lotus Listing</span>
                    <span style={parseStyle('position:absolute;bottom:16px;left:16px;background:rgba(29,58,44,.82);color:#f7f2e8;font-size:12px;font-weight:600;padding:6px 12px;border-radius:30px;')}>Disponível</span>
                  </>
                )}
                {last && extraFotos > 0 && (
                  <span style={parseStyle('position:absolute;inset:0;background:rgba(21,36,28,.55);display:flex;align-items:center;justify-content:center;color:#f7f2e8;font-weight:600;font-size:15px;')}>+ {extraFotos} foto{extraFotos > 1 ? 's' : ''}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* INFO + STICKY PANEL */}
      <section data-pdp-grid="" style={parseStyle('max-width:1280px;margin:0 auto;padding:40px 32px;display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:start;')}>
        {/* LEFT */}
        <div>
          <div style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,4vw,46px);color:#1d3a2c;line-height:1;")}>{valorFmtStr}{valorSufixo}</div>
          <div style={parseStyle('font-size:14px;color:#8aa593;margin-top:8px;')}>{subValor}</div>
          <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:clamp(22px,2.4vw,28px);color:#15241c;margin:18px 0 6px;line-height:1.1;")}>{titulo}</h1>
          <div style={parseStyle('font-size:14.5px;color:#3f6249;')}>{local}{data.codigo_imovel ? ` · cód. ${data.codigo_imovel}` : ''}</div>

          {stats.length > 0 && (
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:26px;margin:28px 0;padding:22px 0;border-top:1px solid rgba(21,36,28,.1);border-bottom:1px solid rgba(21,36,28,.1);')}>
              {stats.map((s, i2) => (
                <div key={i2}><div style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#1d3a2c;")}>{s.value}</div><div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{s.label}</div></div>
              ))}
            </div>
          )}

          <p style={parseStyle('font-size:16px;color:#15241c;font-weight:300;line-height:1.6;margin:28px 0 16px;white-space:pre-line;')}>{descricao}</p>
          <p style={parseStyle('font-size:16px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>Bem localizado em {bairro}, {cidade}. Fale com o especialista da Lotus para conhecer o entorno e o que está disponível agora.</p>
        </div>

        {/* STICKY PANEL */}
        <div data-sticky-panel="" style={parseStyle('position:sticky;top:88px;background:#fff;border-radius:20px;box-shadow:0 24px 60px -34px rgba(21,36,28,.45);overflow:hidden;')}>
          <div style={parseStyle('padding:24px 24px 20px;display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(21,36,28,.08);')}>
            <div style={parseStyle('width:56px;height:56px;border-radius:50%;background:#1d3a2c;flex-shrink:0;overflow:hidden;position:relative;')}><ImageSlot id="imovel-corretor" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Especialista Lotus" /></div>
            <div>
              <div style={parseStyle('font-size:15.5px;font-weight:600;color:#15241c;')}>Especialista Lotus</div>
              <div style={parseStyle('font-size:12.5px;color:#3f6249;')}>Especialista em {bairro}</div>
              {/* CRECI 000001-F e a nota 5,0 eram placeholders inventados;
                  removidos até haver dado real do corretor responsável. */}
            </div>
          </div>
          <div style={parseStyle('padding:20px 24px 24px;')}>
            <Hoverable as="a" href="#agendar" baseStyle={parseStyle('display:block;text-align:center;background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:14px;border-radius:11px;margin-bottom:10px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Agendar visita</Hoverable>
            <a href={waLink} target="_blank" rel="noopener" style={parseStyle('display:flex;align-items:center;justify-content:center;gap:8px;background:#25543b;color:#f7f2e8;font-weight:600;font-size:15px;padding:14px;border-radius:11px;margin-bottom:10px;')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
              Falar no WhatsApp
            </a>
            <div id="agendar" style={parseStyle('margin-top:16px;padding-top:18px;border-top:1px solid rgba(21,36,28,.08);')}>
              {formDone && (
                <>
                  <div style={parseStyle('background:#ece2cf;border-radius:12px;padding:18px;text-align:center;')}><div style={parseStyle("font-family:'Fraunces',serif;font-size:18px;color:#1d3a2c;margin-bottom:5px;")}>Recebido! 🌿</div><p style={parseStyle('font-size:13px;color:#3f6249;margin:0;')}>O especialista da Lotus vai te chamar no WhatsApp para combinar o melhor horário.</p></div>
                </>
              )}
              {!formDone && (
                <>
                  <form onSubmit={submitForm} style={parseStyle('display:flex;flex-direction:column;gap:9px;')}>
                    <input type="text" required placeholder="Seu nome" style={parseStyle('border:1px solid rgba(21,36,28,.16);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;')} />
                    <input type="text" required placeholder="WhatsApp" style={parseStyle('border:1px solid rgba(21,36,28,.16);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;')} />
                    <input type="date" style={parseStyle('border:1px solid rgba(21,36,28,.16);border-radius:9px;padding:11px 13px;font-size:14px;outline:none;color:#3f6249;')} />
                    <label style={parseStyle('display:flex;gap:8px;align-items:flex-start;font-size:11.5px;color:#3f6249;line-height:1.4;margin:2px 0;cursor:pointer;')}><input type="checkbox" required style={parseStyle('margin-top:2px;flex-shrink:0;')} /><span>Autorizo a Lotus a entrar em contato comigo, conforme a <a href="../lotus-privacidade/" target="_blank" rel="noopener" style={parseStyle('color:#b18a4a;text-decoration:underline;')}>Política de Privacidade</a>.</span></label>
                    <button type="submit" style={parseStyle('background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:13px;border:none;border-radius:10px;cursor:pointer;')}>Quero agendar a visita</button>
                    <p style={parseStyle('font-size:11px;color:#8aa593;margin:2px 0 0;line-height:1.4;')}>Você fala com gente que conhece esse imóvel e esse bairro. Ao enviar, concorda com a Política de Privacidade (LGPD).</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TOUR 3D / VÍDEO — só quando o imóvel tem tour_virtual ou link_video */}
      {(data.tour_virtual || data.link_video) && (
        <section id="tour" style={parseStyle('background:#15241c;padding:80px 32px;')}>
          <div style={parseStyle('max-width:1080px;margin:0 auto;text-align:center;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:16px;')}>{data.tour_virtual ? 'Tour 3D · Vídeo' : 'Vídeo'}</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#f7f2e8;margin:0 0 30px;")}>Conheça o imóvel sem sair de casa.</h2>
            <a href={data.tour_virtual || data.link_video || '#'} target="_blank" rel="noopener" style={parseStyle('display:block;position:relative;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#1d3a2c;')}>
              <ImageSlot id="imovel-tour" src={fotoUrl(0)} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Tour 3D / vídeo do imóvel" />
              <div style={parseStyle('position:absolute;inset:0;background:rgba(21,36,28,.35);display:flex;align-items:center;justify-content:center;')}>
                <div style={parseStyle('width:74px;height:74px;border-radius:50%;background:rgba(247,242,232,.92);display:flex;align-items:center;justify-content:center;')}><svg width="26" height="26" viewBox="0 0 24 24" fill="#1d3a2c"><path d="M8 5v14l11-7z"></path></svg></div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* LOCALIZAÇÃO + BAIRRO */}
      <section id="mapa" style={parseStyle('background:#1d3a2c;padding:80px 32px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:stretch;')}>
          <div style={parseStyle('position:relative;border-radius:18px;overflow:hidden;min-height:360px;background:#e7e4d7;')}><iframe title={`Mapa de ${bairro}, ${cidade}`} src={`https://www.google.com/maps?q=${mapaQuery}&z=14&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;border:0;')} allowFullScreen></iframe></div>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>No bairro</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.6vw,32px);color:#f7f2e8;margin:0 0 22px;")}>Bem localizado em {bairro}.</h2>
            <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.82);font-weight:300;line-height:1.65;margin:0 0 26px;max-width:480px;')}>{data.bairro ? `${data.bairro}, em ${cidade},` : cidade} reúne comércio, escolas e serviços do dia a dia por perto. O especialista da Lotus conhece a região e ajuda você a avaliar a localização deste imóvel.</p>
            <Link href="/lotus-bairro" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#cdab6e;font-weight:600;font-size:14.5px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Conhecer a região de {cidade} <span>→</span></Link>
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:980px;margin:0 auto;')}>
          <div style={parseStyle('text-align:center;margin-bottom:44px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:14px;')}>Simulador</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.4vw,42px);color:#15241c;margin:0 0 16px;")}>Quanto fica a parcela?</h2>
            <div style={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#ece2cf;border-radius:30px;padding:8px 16px;')}>
              <span style={parseStyle('width:7px;height:7px;border-radius:50%;background:#b18a4a;')}></span>
              <span style={parseStyle('font-size:13px;font-weight:600;color:#3f6249;')}>Cálculo pela Tabela Price · apenas uma estimativa para você ter uma base</span>
            </div>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:40px;background:#fff;border-radius:22px;padding:40px;box-shadow:0 24px 60px -38px rgba(21,36,28,.4);')}>
            <div style={parseStyle('display:flex;flex-direction:column;gap:26px;')}>
              <div>
                <div style={parseStyle('display:flex;justify-content:space-between;font-size:14px;color:#3f6249;margin-bottom:10px;')}><span>Valor do imóvel</span><strong style={parseStyle('color:#15241c;')}>{valorFmt}</strong></div>
                <input type="range" min="500000" max="5000000" step="50000" value={valor} onInput={(e) => setValor(parseInt((e.target as HTMLInputElement).value, 10))} onChange={(e) => setValor(parseInt(e.target.value, 10))} style={parseStyle('width:100%;')} />
              </div>
              <div>
                <div style={parseStyle('display:flex;justify-content:space-between;font-size:14px;color:#3f6249;margin-bottom:10px;')}><span>Entrada · {entrada}%</span><strong style={parseStyle('color:#15241c;')}>{entradaFmt}</strong></div>
                <input type="range" min="10" max="60" step="5" value={entrada} onInput={(e) => setEntrada(parseInt((e.target as HTMLInputElement).value, 10))} onChange={(e) => setEntrada(parseInt(e.target.value, 10))} style={parseStyle('width:100%;')} />
              </div>
              <div>
                <div style={parseStyle('display:flex;justify-content:space-between;font-size:14px;color:#3f6249;margin-bottom:10px;')}><span>Prazo</span><strong style={parseStyle('color:#15241c;')}>{prazo} anos</strong></div>
                <input type="range" min="5" max="35" step="5" value={prazo} onInput={(e) => setPrazo(parseInt((e.target as HTMLInputElement).value, 10))} onChange={(e) => setPrazo(parseInt(e.target.value, 10))} style={parseStyle('width:100%;')} />
              </div>
              <div>
                <div style={parseStyle('display:flex;justify-content:space-between;font-size:14px;color:#3f6249;margin-bottom:10px;')}><span>Taxa de juros (a.a.)</span><strong style={parseStyle('color:#15241c;')}>{taxa}%</strong></div>
                <input type="range" min="8" max="14" step="0.5" value={taxa} onInput={(e) => setTaxa(parseFloat((e.target as HTMLInputElement).value))} onChange={(e) => setTaxa(parseFloat(e.target.value))} style={parseStyle('width:100%;')} />
              </div>
            </div>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:32px;display:flex;flex-direction:column;justify-content:center;text-align:center;')}>
              <div style={parseStyle('font-size:13px;color:rgba(247,242,232,.7);margin-bottom:8px;')}>Parcela mensal estimada</div>
              <div style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,4.4vw,52px);color:#cdab6e;line-height:1;")}>{parcelaFmt}</div>
              <div style={parseStyle('height:1px;background:rgba(247,242,232,.14);margin:24px 0;')}></div>
              <div style={parseStyle('display:flex;justify-content:space-between;font-size:13.5px;color:rgba(247,242,232,.8);margin-bottom:10px;')}><span>Valor financiado</span><span>{financedFmt}</span></div>
              <div style={parseStyle('display:flex;justify-content:space-between;font-size:13.5px;color:rgba(247,242,232,.8);')}><span>Renda sugerida</span><span>{rendaFmt}</span></div>
              <a href={waLink} target="_blank" rel="noopener" style={parseStyle('margin-top:24px;display:flex;align-items:center;justify-content:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:13px;border-radius:11px;')}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>Falar com um corretor</a>
            </div>
          </div>
          <div style={parseStyle('display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid rgba(177,138,74,.35);border-radius:14px;padding:18px 22px;margin-top:20px;')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b18a4a" strokeWidth="1.8" style={parseStyle('flex-shrink:0;margin-top:1px;')}><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.5h.01"></path></svg>
            <p style={parseStyle('font-size:13.5px;color:#3f6249;font-weight:400;line-height:1.55;margin:0;')}><strong style={parseStyle('color:#15241c;')}>Isto é apenas uma simulação, sem valor de proposta ou compromisso</strong> — serve só para você ter uma base do valor da parcela, calculada pela <strong style={parseStyle('color:#15241c;')}>Tabela Price</strong>. As condições reais (taxa, prazo e aprovação) dependem de <strong style={parseStyle('color:#15241c;')}>análise de crédito</strong> do banco e variam por perfil. Para uma avaliação de verdade, <strong style={parseStyle('color:#15241c;')}>fale com um corretor da Lotus</strong> — a gente te acompanha do cálculo à aprovação.</p>
          </div>
        </div>
      </section>

      {/* SIMILARES */}
      {relacionados.length > 0 && (
        <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
          <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,36px);color:#15241c;margin:0 0 32px;")}>Imóveis parecidos em {cidade}</h2>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px;')}>
              {relacionados.map((s) => (
                <Hoverable key={s.codigo} as="a" href={`/lotus-imovel/${s.codigo}`} baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -30px rgba(21,36,28,.34);transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
                  <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}><ImageSlot id={`sim-${s.codigo}`} src={s.capa ?? undefined} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={s.titulo ?? 'Imóvel'} /></div>
                  <div style={parseStyle('padding:18px;')}>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;")}>{formatValor(s.valor)}</div>
                    <div style={parseStyle('font-size:13px;font-weight:600;color:#15241c;margin-top:6px;')}>{s.titulo ?? 'Imóvel disponível'}</div>
                    <div style={parseStyle('font-size:12.5px;color:#3f6249;margin-top:3px;')}>{s.bairro ? `${s.bairro}, ${s.cidade ?? ''}` : (s.cidade ?? '')}</div>
                  </div>
                </Hoverable>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GEO / FAQ */}
      <section style={parseStyle('background:#f7f2e8;padding:90px 32px;')}>
        <div style={parseStyle('max-width:980px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Resumo</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.8vw,34px);color:#15241c;margin:0 0 20px;line-height:1.1;")}>Este imóvel, em uma resposta.</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:24px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:10px;')}>TL;DR</div>
              <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.6;margin:0;')}>{tipoLabel}{areaPrincipal ? ` de ${areaPrincipal} m²` : ''} em {bairro}, {cidade}{valorPrincipal ? ` por ${valorFmtStr}${valorSufixo}` : ''}{data.suites ? ` — ${data.suites} suítes` : (data.quartos ? ` — ${data.quartos} dormitórios` : '')}{data.vagas ? `, ${data.vagas} vagas` : ''}. Fale com a Lotus para conhecer os detalhes.</p>
            </div>
          </div>
          <div>
            {faqs.map((f, i2) => (
              <div key={i2} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:22px 0;text-align:left;')}>
                  <span style={parseStyle('font-size:16.5px;font-weight:500;color:#15241c;')}>{f.q}</span>
                  <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{f.sign}</span>
                </button>
                {f.open && (
                  <><p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 22px;')}>{f.a}</p></>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={parseStyle('background:#15241c;padding:80px 32px 40px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
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
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding-top:28px;font-size:13px;color:rgba(247,242,232,.5);')}>
            <div>{footerLegalLine()}</div>
            <div style={parseStyle('display:flex;gap:12px;align-items:center;')}>
              <Hoverable as="a" href="https://www.facebook.com/lotusbrokers" target="_blank" rel="noopener" aria-label="Facebook" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z"></path></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.youtube.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="YouTube" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3-.4-4.3a2.6 2.6 0 0 0-1.8-1.9C18 5.4 12 5.4 12 5.4s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.7C2 9 2 12 2 12s0 3 .4 4.3a2.6 2.6 0 0 0 1.8 1.9c1.8.4 7.8.4 7.8.4s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.9C22 15 22 12 22 12zm-12 2.6V9.4l5 2.6-5 2.6z"></path></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.instagram.com/lotusbrokers" target="_blank" rel="noopener" aria-label="Instagram" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg>
              </Hoverable>
              <Hoverable as="a" href="https://www.tiktok.com/@lotusbrokers" target="_blank" rel="noopener" aria-label="TikTok" baseStyle={parseStyle('width:40px;height:40px;border-radius:50%;border:1px solid rgba(247,242,232,.25);display:flex;align-items:center;justify-content:center;color:rgba(247,242,232,.8);transition:all .2s;')} hoverStyle={parseStyle('color:#15241c;background:#cdab6e;border-color:#cdab6e')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.5-1v5.8c0 3.3-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5 14.7c0-3 2.3-5.3 5.4-5.1v2.7c-.4-.1-.8-.2-1.2-.1-1.3.2-2.1 1.2-2 2.6.1 1.3 1.1 2.1 2.4 2 .1 0 .2 0 .3-.1 1.1-.3 1.6-1.1 1.6-2.4V3H16z"></path></svg>
              </Hoverable>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE FIXED BAR */}
      <div data-mobilebar="" style={parseStyle('display:none;position:fixed;left:0;right:0;bottom:0;z-index:70;background:#fff;border-top:1px solid rgba(21,36,28,.12);box-shadow:0 -8px 24px -16px rgba(21,36,28,.4);padding:12px 18px;align-items:center;justify-content:space-between;gap:14px;')}>
        <div><div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;line-height:1;")}>{valorFmtStr}{valorSufixo}</div><div style={parseStyle('font-size:11px;color:#8aa593;')}>{local}</div></div>
        <div style={parseStyle('display:flex;gap:8px;')}>
          <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('width:46px;height:46px;border-radius:11px;background:#25543b;display:flex;align-items:center;justify-content:center;')}><svg width="22" height="22" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"></path></svg></a>
          <a href="#agendar" style={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:0 22px;border-radius:11px;display:flex;align-items:center;')}>Agendar visita</a>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <>
          <div style={parseStyle('position:fixed;inset:0;z-index:100;background:rgba(10,18,14,.94);display:flex;align-items:center;justify-content:center;')}>
            <button onClick={closeLightbox} aria-label="Fechar" style={parseStyle('position:absolute;top:22px;right:24px;width:44px;height:44px;border-radius:50%;background:rgba(247,242,232,.14);border:none;color:#f7f2e8;font-size:24px;cursor:pointer;')}>✕</button>
            <button onClick={prevPhoto} aria-label="Anterior" style={parseStyle('position:absolute;left:24px;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:50%;background:rgba(247,242,232,.14);border:none;color:#f7f2e8;font-size:26px;cursor:pointer;')}>‹</button>
            <button onClick={nextPhoto} aria-label="Próxima" style={parseStyle('position:absolute;right:24px;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:50%;background:rgba(247,242,232,.14);border:none;color:#f7f2e8;font-size:26px;cursor:pointer;')}>›</button>
            <div style={parseStyle('width:min(86vw,1100px);aspect-ratio:3/2;position:relative;border-radius:12px;overflow:hidden;')}>
              {photosView.map((p, i2) => (
                <div key={i2} style={parseStyle(p.style)}><ImageSlot id={p.lbId} src={p.src} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={p.label} /></div>
              ))}
            </div>
            <div style={parseStyle('position:absolute;bottom:26px;left:50%;transform:translateX(-50%);background:rgba(247,242,232,.14);color:#f7f2e8;font-size:13px;padding:7px 16px;border-radius:30px;')}>{lightboxCounter}</div>
          </div>
        </>
      )}
    </div>
  );
}
