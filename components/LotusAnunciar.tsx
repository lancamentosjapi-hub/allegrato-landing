'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusAnunciar — porte 1:1 de lotus-anunciar/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte (idênticas às de LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *
 * O fonte NÃO tem elementos data-reveal (sem IntersectionObserver de entrada).
 * Único comportamento imperativo: contador data-count (data-stats) via rAF + IO threshold .4.
 */

import Link from 'next/link';
import LotusHeader from './LotusHeader';
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
 * Split no PRIMEIRO ":" de cada declaração (gradientes/data: URIs contêm ":" internos).
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
      : rawProp
          .replace(/^-webkit-/, 'Webkit-')
          .replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
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
 * src, a imagem cobrindo (object-fit:cover). Gradiente idêntico ao estático.
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

// data-props do fonte: { whatsapp: { default: '5511926143393' } }
const WHATSAPP_DEFAULT = '5511926143393';

// Constantes de precificação/comparáveis do renderVals() (valores exatos).
const M2: Record<string, number> = {
  'Eloy Chaves': 7500,
  'Anhangabaú': 6800,
  Malota: 7000,
  Medeiros: 6500,
  'Centro Jundiaí': 6000,
  Itupeva: 5500,
  Vinhedo: 7200,
  Outro: 6500,
};
const TIPO_F: Record<string, number> = {
  Casa: 1.0,
  Apartamento: 1.0,
  'Casa em condomínio': 1.06,
  Terreno: 0.55,
  Comercial: 0.95,
};
const EST_F: Record<string, number> = {
  Novo: 1.08,
  Bom: 1.0,
  Reformar: 0.88,
};
const COMPS: Record<string, number> = {
  'Eloy Chaves': 14,
  'Anhangabaú': 11,
  Malota: 9,
  Medeiros: 10,
  'Centro Jundiaí': 13,
  Itupeva: 8,
  Vinhedo: 7,
  Outro: 6,
};

const metodo = [
  { num: '1', title: 'Avaliação com dado (ACM)', text: 'Análise Comparativa de Mercado com 3 imóveis reais do seu bairro, preço justo, não chute.' },
  { num: '2', title: 'Marketing premium', text: 'Fotografia profissional, tour 3D e drone. Seu imóvel aparece bem em todos os canais certos.' },
  { num: '3', title: 'Visitas qualificadas', text: 'Só leva à sua porta quem tem perfil real de compra. Seu tempo (e o do imóvel) é respeitado.' },
  { num: '4', title: 'Relatório mensal', text: 'Você recebe o status do seu imóvel todo mês (visitas, propostas e ajustes), sem precisar perguntar.' },
  { num: '5', title: 'Negociação por especialista', text: 'Quem conhece o mercado negocia por você, defendendo o melhor preço com argumento e dado.' },
  { num: '6', title: 'Pós-venda de verdade', text: 'Documentação, cartório e financiamento acompanhados até a chave passar de mão. Sem você se perder.' },
];

const comum = [
  'Atendido por agentes que nunca visitaram o imóvel',
  'Anúncio genérico em vários portais e silêncio',
  'Alto risco de golpe ou falhas na negociação',
  'Você correndo atrás de notícia',
  'Média nacional de 460 dias para vender',
];

const exclusiva = [
  'Gestor especialista no seu imóvel',
  'Plano premium de divulgação',
  'Ações de marketing semanais',
  'Relatórios mensais',
  'Comunicação mensal com você',
  'Média de 72 dias para vender',
];

const depo = [
  { initial: 'S', name: 'Sandra M.', where: 'vendeu em Eloy Chaves', text: 'Vendi em 41 dias, acima do que eu esperava. O boletim semanal me deixou tranquila, eu sempre sabia o que estava acontecendo.' },
  { initial: 'C', name: 'Carlos e Vera', where: 'venderam no Anhangabaú', text: 'As fotos e o tour fizeram diferença real. Só apareceu gente séria pra visitar. Negociação redonda, sem dor de cabeça.' },
  { initial: 'J', name: 'João P.', where: 'vendeu em Itupeva', text: 'Tinha tentado sozinho por meses. Com a Lotus, em duas semanas já tinha proposta. Especialista que conhece o bairro faz toda a diferença.' },
];

const faqBase = [
  { q: 'Quanto a Lotus cobra?', a: 'A comissão segue a tabela do CRECI-SP e só é cobrada quando o imóvel é vendido. Avaliação é gratuita e sem compromisso.' },
  { q: 'A avaliação é de graça?', a: 'Sim. A estimativa online é imediata e a avaliação presencial com o especialista também não tem custo.' },
  { q: 'Preciso dar exclusividade?', a: 'A Gestão Exclusiva rende mais (foco, marketing e boletim), mas a decisão é sua. O especialista explica as opções com transparência.' },
  { q: 'Quanto tempo leva para vender?', a: 'Depende do imóvel e do preço, mas com avaliação certa e marketing premium a venda costuma ser bem mais rápida que um anúncio genérico.' },
];

/* Lotus SVG (idêntico ao fonte, reutilizado no header e footer, tamanho variável). */
function LotusMark({ size }: { size: number }) {
  return (
    <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
  );
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusAnunciar({
  whatsapp = WHATSAPP_DEFAULT,
}: {
  whatsapp?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Estado do fonte: state = { step, done, areaError, f{...}, openFaq }
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [areaError, setAreaError] = useState(false);
  const [f, setF] = useState({
    bairro: 'Eloy Chaves',
    tipo: 'Casa',
    area: '',
    dorms: '3',
    vagas: '2',
    estado: 'Bom',
    nome: '',
    whats: '',
    email: '',
  });
  const [openFaq, setOpenFaq] = useState(0);

  // setF(key, val): atualiza f e limpa areaError (idêntico ao fonte).
  const setFVal = (key: keyof typeof f, val: string) => {
    setF((s) => ({ ...s, [key]: val }));
    setAreaError(false);
  };

  // fmt(n): arredonda p/ milhar e formata em pt-BR (idêntico ao fonte).
  const fmt = (n: number) => {
    const v = Math.round(n / 1000) * 1000;
    return 'R$ ' + v.toLocaleString('pt-BR');
  };

  // waLink: monta a URL do WhatsApp exatamente como o fonte.
  const waLink =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Quero avaliar meu imóvel com a Lotus.');

  // Estimativa (base/low/high/comps) — valores exatos do renderVals().
  const area = parseFloat(f.area) || 0;
  const base = area * (M2[f.bairro] || 6500) * (TIPO_F[f.tipo] || 1) * (EST_F[f.estado] || 1);
  const low = fmt(base * 0.92);
  const high = fmt(base * 1.08);
  const comps = COMPS[f.bairro] || 6;

  // Derivados de fase (sc-if do widget).
  const isStep1 = !done && step === 1;
  const isStep2 = !done && step === 2;
  const isStep3 = !done && step === 3;
  const isResult = done;
  const notResult = !done;
  const barOn = '#b18a4a';
  const barOff = 'rgba(21,36,28,.12)';
  const bar1 = step >= 1 || done ? barOn : barOff;
  const bar2 = step >= 2 || done ? barOn : barOff;
  const bar3 = step >= 3 || done ? barOn : barOff;

  // Ações do widget (idênticas ao fonte).
  const next = () => {
    if (step === 2 && (!parseFloat(f.area) || parseFloat(f.area) <= 0)) {
      setAreaError(true);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const submit = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setDone(true);
  };
  const restart = () => {
    setDone(false);
    setStep(1);
  };

  // FAQs derivadas (open/sign/toggle) — lógica exata do fonte.
  const faqs = faqBase.map((x, i) => ({
    q: x.q,
    a: x.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((cur) => (cur === i ? -1 : i)),
  }));

  // componentDidMount/WillUnmount: contador data-count (rAF + IO threshold .4).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wrap = root.querySelector<HTMLElement>('[data-stats]');
    if (!wrap) return;

    const run = () => {
      wrap.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const to = parseFloat(el.getAttribute('data-count') || '0');
        const suf = el.getAttribute('data-suffix') || '';
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1400);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(to * e)) + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };

    if (reduce || !('IntersectionObserver' in window)) {
      run();
      return;
    }
    wrap.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
    });
    const obs = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            run();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      {/*
        Estilos page-specific do fonte (2º <style> do <head>): .lt-field, seta do
        select e scrollbar oculta. Não existem no CSS global do portal; ficam aqui,
        com valores literais idênticos ao estático.
      */}
      <style>{`
        html{scrollbar-width:none;-ms-overflow-style:none}
        html::-webkit-scrollbar{display:none;width:0;height:0}
        .lt-field{width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:13px 14px;border-radius:11px;outline:none;}
        select.lt-field{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233f6249' stroke-width='2.4'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;cursor:pointer;}
      `}</style>

      {/* HEADER */}
      <LotusHeader maxWidth={1200} whatsapp={whatsapp} />

      {/* HERO + WIDGET */}
      <section id="topo" style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;scroll-margin-top:70px;')}>
        <ImageSlot id="anunciar-hero" src="/avela/a007.jpg" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;opacity:.28;')} alt="Foto de casa / proprietário" />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(120deg,rgba(21,36,28,.96) 0%,rgba(21,36,28,.82) 50%,rgba(21,36,28,.7) 100%);')}></div>
        <div style={parseStyle('position:relative;max-width:1200px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#cdab6e;margin-bottom:24px;')}>Vender com a Lotus</div>
            <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(36px,4.6vw,60px);line-height:1.04;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 22px;")}>Quanto vale o seu imóvel?<br /><em style={parseStyle('font-style:italic;color:#cdab6e;')}>Descubra em minutos.</em></h1>
            <p style={parseStyle('font-size:clamp(16px,1.6vw,19px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;max-width:480px;margin:0 0 28px;')}>Avaliação com dado real do mercado de Jundiaí e Itupeva e um especialista do seu bairro para vender pelo melhor preço, sem você passar por isso sozinho.</p>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:14px;align-items:center;')}>
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:transparent;border:1.5px solid rgba(247,242,232,.4);color:#f7f2e8;font-weight:600;font-size:15px;padding:13px 24px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.1)')}>Falar com um especialista</Hoverable>
              <div style={parseStyle('display:flex;align-items:center;gap:8px;font-size:13.5px;color:rgba(247,242,232,.7);')}><span style={parseStyle('width:7px;height:7px;border-radius:50%;background:#8aa593;')}></span>Avaliação gratuita e sem compromisso</div>
            </div>
          </div>

          {/* WIDGET */}
          <div style={parseStyle('background:#f7f2e8;border-radius:22px;box-shadow:0 30px 70px -30px rgba(0,0,0,.5);overflow:hidden;')}>
            <div style={parseStyle('background:#fff;padding:22px 26px;border-bottom:1px solid rgba(21,36,28,.08);')}>
              <div style={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:12px;')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:20px;color:#15241c;")}>Avaliação instantânea</div>
                {notResult && (
                  <>
                    <div style={parseStyle('font-size:12.5px;font-weight:600;color:#8aa593;')}>Passo {step} de 3</div>
                  </>
                )}
              </div>
              <div style={parseStyle('display:flex;gap:6px;margin-top:14px;')}>
                <div style={parseStyle(`height:5px;flex:1;border-radius:6px;background:${bar1};`)}></div>
                <div style={parseStyle(`height:5px;flex:1;border-radius:6px;background:${bar2};`)}></div>
                <div style={parseStyle(`height:5px;flex:1;border-radius:6px;background:${bar3};`)}></div>
              </div>
            </div>

            <div style={parseStyle('padding:26px;')}>
              {/* STEP 1 */}
              {isStep1 && (
                <>
                  <div style={parseStyle('display:flex;flex-direction:column;gap:16px;')}>
                    <div>
                      <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Onde fica o imóvel?</label>
                      <select className="lt-field" value={f.bairro} onChange={(e) => setFVal('bairro', e.target.value)}>
                        <option value="Eloy Chaves">Eloy Chaves · Jundiaí</option>
                        <option value="Anhangabaú">Anhangabaú · Jundiaí</option>
                        <option value="Malota">Malota · Jundiaí</option>
                        <option value="Medeiros">Medeiros · Jundiaí</option>
                        <option value="Centro Jundiaí">Centro · Jundiaí</option>
                        <option value="Itupeva">Itupeva</option>
                        <option value="Vinhedo">Vinhedo</option>
                        <option value="Outro">Outro bairro</option>
                      </select>
                    </div>
                    <div>
                      <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Tipo de imóvel</label>
                      <select className="lt-field" value={f.tipo} onChange={(e) => setFVal('tipo', e.target.value)}>
                        <option value="Casa">Casa</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Casa em condomínio">Casa em condomínio</option>
                        <option value="Terreno">Terreno</option>
                        <option value="Comercial">Comercial</option>
                      </select>
                    </div>
                    <Hoverable as="button" onClick={next} baseStyle={parseStyle('margin-top:6px;width:100%;background:#b18a4a;color:#15241c;font-weight:600;font-size:15.5px;padding:15px;border:none;border-radius:11px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>Continuar →</Hoverable>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {isStep2 && (
                <>
                  <div style={parseStyle('display:flex;flex-direction:column;gap:16px;')}>
                    <div>
                      <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Área (m²)</label>
                      <input className="lt-field" type="number" min="1" placeholder="Ex.: 180" value={f.area} onInput={(e) => setFVal('area', (e.target as HTMLInputElement).value)} />
                    </div>
                    <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                      <div>
                        <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Dormitórios</label>
                        <select className="lt-field" value={f.dorms} onChange={(e) => setFVal('dorms', e.target.value)}><option value="0">,</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4+</option></select>
                      </div>
                      <div>
                        <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Vagas</label>
                        <select className="lt-field" value={f.vagas} onChange={(e) => setFVal('vagas', e.target.value)}><option value="0">,</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select>
                      </div>
                    </div>
                    <div>
                      <label style={parseStyle('display:block;font-size:13px;font-weight:600;color:#3f6249;margin-bottom:7px;')}>Estado de conservação</label>
                      <select className="lt-field" value={f.estado} onChange={(e) => setFVal('estado', e.target.value)}><option value="Novo">Novo / reformado</option><option value="Bom">Bom estado</option><option value="Reformar">Precisa reformar</option></select>
                    </div>
                    <div style={parseStyle('display:flex;gap:10px;margin-top:6px;')}>
                      <button onClick={back} style={parseStyle('flex:0 0 auto;background:none;border:1px solid rgba(21,36,28,.18);color:#3f6249;font-weight:600;font-size:15px;padding:15px 20px;border-radius:11px;cursor:pointer;')}>←</button>
                      <Hoverable as="button" onClick={next} baseStyle={parseStyle('flex:1;background:#b18a4a;color:#15241c;font-weight:600;font-size:15.5px;padding:15px;border:none;border-radius:11px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>Continuar →</Hoverable>
                    </div>
                    {areaError && (
                      <>
                        <div style={parseStyle('font-size:12.5px;color:#b1492a;')}>Informe a área para continuar.</div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {isStep3 && (
                <>
                  <form onSubmit={submit} style={parseStyle('display:flex;flex-direction:column;gap:14px;')}>
                    <p style={parseStyle('font-size:14px;color:#3f6249;margin:0;')}>Quase lá! Deixe seu contato para ver a estimativa e receber a avaliação precisa.</p>
                    <input className="lt-field" type="text" required placeholder="Seu nome" value={f.nome} onInput={(e) => setFVal('nome', (e.target as HTMLInputElement).value)} />
                    <input className="lt-field" type="text" required placeholder="WhatsApp" value={f.whats} onInput={(e) => setFVal('whats', (e.target as HTMLInputElement).value)} />
                    <input className="lt-field" type="email" placeholder="E-mail (opcional)" value={f.email} onInput={(e) => setFVal('email', (e.target as HTMLInputElement).value)} />
                    <label style={parseStyle('display:flex;align-items:flex-start;gap:9px;font-size:12px;color:#3f6249;line-height:1.45;cursor:pointer;')}>
                      <input type="checkbox" required style={parseStyle('margin-top:2px;width:16px;height:16px;accent-color:#1d3a2c;')} />
                      Autorizo a Lotus a entrar em contato e concordo com a Política de Privacidade (LGPD).
                    </label>
                    <div style={parseStyle('display:flex;gap:10px;margin-top:4px;')}>
                      <button type="button" onClick={back} style={parseStyle('flex:0 0 auto;background:none;border:1px solid rgba(21,36,28,.18);color:#3f6249;font-weight:600;font-size:15px;padding:15px 20px;border-radius:11px;cursor:pointer;')}>←</button>
                      <Hoverable as="button" type="submit" baseStyle={parseStyle('flex:1;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:15.5px;padding:15px;border:none;border-radius:11px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Ver minha estimativa</Hoverable>
                    </div>
                  </form>
                </>
              )}

              {/* RESULT */}
              {isResult && (
                <>
                  <div style={parseStyle('text-align:center;')}>
                    <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#b18a4a;margin-bottom:10px;')}>Estimativa para {f.bairro}</div>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3vw,30px);color:#1d3a2c;line-height:1.2;")}>{low}</div>
                    <div style={parseStyle('font-size:13px;color:#8aa593;margin:4px 0;')}>até</div>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,38px);color:#1d3a2c;line-height:1.1;")}>{high}</div>
                    <p style={parseStyle('font-size:13.5px;color:#3f6249;margin:16px 0 0;line-height:1.5;')}>Com base em <strong>{comps} imóveis comparáveis</strong> em {f.bairro}. <strong style={parseStyle('color:#15241c;')}>Isto é apenas uma estimativa.</strong> Para uma avaliação realista do seu imóvel, fale com um corretor especialista, é de graça.</p>
                    <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:block;margin-top:20px;background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:15px;border-radius:11px;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>Quero uma avaliação precisa com especialista</Hoverable>
                    <button onClick={restart} style={parseStyle('margin-top:12px;background:none;border:none;color:#8aa593;font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;')}>Refazer estimativa</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MÉTODO */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:56px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Como a gente vende</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#15241c;line-height:1.06;letter-spacing:-.02em;margin:0;")}>Um método, do preço certo ao pós-venda.</h2>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;')}>
            {/* hint-placeholder-count:6 */}
            {metodo.map((m, i) => (
              <div key={i} style={parseStyle('background:#fff;border-radius:18px;padding:30px 28px;box-shadow:0 16px 40px -34px rgba(21,36,28,.3);')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:34px;font-weight:300;color:#cdab6e;line-height:1;margin-bottom:16px;")}>{m.num}</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:20px;color:#15241c;margin:0 0 8px;")}>{m.title}</h3>
                <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GESTÃO EXCLUSIVA */}
      <section style={parseStyle('background:#15241c;padding:100px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:1100px;margin:0 auto;position:relative;')}>
          <div style={parseStyle('text-align:center;max-width:640px;margin:0 auto 48px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Gestão Exclusiva</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#f7f2e8;line-height:1.08;margin:0 0 16px;")}>Você assina e dorme tranquilo.</h2>
            <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.6;margin:0;')}>Foco total no seu imóvel, plano de marketing premium, equipe especialista e comunicação semanal, sem você precisar perguntar.</p>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:20px;')}>
            <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.14);border-radius:18px;padding:32px;')}>
              <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(247,242,232,.5);margin-bottom:18px;')}>O jeito comum</div>
              {/* hint-placeholder-count:4 */}
              {comum.map((c, i) => (
                <div key={i} style={parseStyle('display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:rgba(247,242,232,.6);padding:8px 0;')}><span style={parseStyle('color:rgba(247,242,232,.4);')}>✕</span>{c}</div>
              ))}
            </div>
            <div style={parseStyle('background:#3f6249;border-radius:18px;padding:32px;box-shadow:0 24px 60px -34px rgba(0,0,0,.5);')}>
              <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Gestão Exclusiva Lotus</div>
              {/* hint-placeholder-count:4 */}
              {exclusiva.map((e, i) => (
                <div key={i} style={parseStyle('display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:#f7f2e8;padding:8px 0;')}><span style={parseStyle('color:#cdab6e;')}>✓</span>{e}</div>
              ))}
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:block;text-align:center;margin-top:22px;background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:14px;border-radius:11px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Quero a Gestão Exclusiva</Hoverable>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA / COMPARATIVO */}
      <section style={parseStyle('background:#3f6249;padding:80px 32px;')}>
        <div data-stats="" style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:36px;text-align:center;')}>
          <div><div style={parseStyle('font-size:13px;color:rgba(247,242,232,.6);margin-bottom:2px;')}>até</div><div data-count="80" data-suffix="%" style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(40px,5vw,62px);color:#f7f2e8;line-height:1;")}>80%</div><div style={parseStyle('font-size:14px;color:rgba(247,242,232,.78);margin-top:10px;')}>mais rápido que um anúncio genérico</div></div>
          <div><div style={parseStyle('font-size:13px;color:rgba(247,242,232,.6);margin-bottom:2px;')}>média de</div><div data-count="72" data-suffix=" dias" style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(40px,5vw,62px);color:#f7f2e8;line-height:1;")}>72 dias</div><div style={parseStyle('font-size:14px;color:rgba(247,242,232,.78);margin-top:10px;')}>para vender, a média nacional é 460 dias</div></div>
          <div><div style={parseStyle('font-size:13px;color:rgba(247,242,232,.6);margin-bottom:2px;')}>&nbsp;</div><div data-count="100" data-suffix="%" style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(40px,5vw,62px);color:#f7f2e8;line-height:1;")}>100%</div><div style={parseStyle('font-size:14px;color:rgba(247,242,232,.78);margin-top:10px;')}>visitas qualificadas, só quem tem perfil real</div></div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={parseStyle('background:#ece2cf;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;margin:0 0 44px;max-width:600px;line-height:1.08;")}>Proprietários que venderam com a gente.</h2>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;')}>
            {/* hint-placeholder-count:3 */}
            {depo.map((d, i) => (
              <div key={i} style={parseStyle('background:#fff;border-radius:18px;padding:30px;box-shadow:0 16px 40px -34px rgba(21,36,28,.3);')}>
                <div style={parseStyle('color:#b18a4a;font-size:17px;letter-spacing:3px;margin-bottom:14px;')}>★★★★★</div>
                <p style={parseStyle('font-size:15.5px;color:#15241c;font-weight:300;line-height:1.55;margin:0 0 18px;')}>“{d.text}”</p>
                <div style={parseStyle('display:flex;align-items:center;gap:11px;border-top:1px solid rgba(21,36,28,.08);padding-top:16px;')}>
                  <div style={parseStyle("width:40px;height:40px;border-radius:50%;background:#1d3a2c;display:flex;align-items:center;justify-content:center;color:#cdab6e;font-family:'Fraunces',serif;font-size:17px;")}>{d.initial}</div>
                  <div><div style={parseStyle('font-size:14px;font-weight:600;color:#15241c;')}>{d.name}</div><div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{d.where}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GEO / FAQ */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Dúvidas de quem vende</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 22px;")}>Como vender meu imóvel em Jundiaí?</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Em resumo</div>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>Para vender bem em Jundiaí ou Itupeva: comece por uma avaliação com dado de mercado, invista em marketing premium (fotos, tour, drone) e conte com um especialista do bairro que filtra visitas e negocia por você. Na Lotus, a avaliação é gratuita e a comissão só na venda.</p>
            </div>
          </div>
          <div>
            {/* hint-placeholder-count:4 */}
            {faqs.map((fq, i) => (
              <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                <button onClick={fq.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:22px 0;text-align:left;')}>
                  <span style={parseStyle('font-size:16.5px;font-weight:500;color:#15241c;')}>{fq.q}</span>
                  <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{fq.sign}</span>
                </button>
                {fq.open && (
                  <>
                    <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 22px;')}>{fq.a}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={parseStyle('background:#1d3a2c;padding:90px 32px;text-align:center;')}>
        <div style={parseStyle('max-width:760px;margin:0 auto;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,48px);color:#f7f2e8;line-height:1.06;margin:0 0 18px;")}>Comece pela avaliação. É grátis.</h2>
          <p style={parseStyle('font-size:18px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;max-width:520px;margin:0 auto 32px;')}>Descubra quanto vale o seu imóvel e converse com um especialista do seu bairro, sem custo e sem compromisso.</p>
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:14px;justify-content:center;')}>
            <Hoverable as="a" href="#topo" baseStyle={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Avaliar meu imóvel</Hoverable>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('background:transparent;border:1.5px solid rgba(247,242,232,.4);color:#f7f2e8;font-weight:600;font-size:16px;padding:15px 30px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:rgba(247,242,232,.1)')}>Falar no WhatsApp</Hoverable>
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
                <LotusMark size={28} />
              </div>
              <p style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:19px;color:rgba(247,242,232,.85);line-height:1.35;max-width:300px;margin:0 0 18px;")}>Grandes escolhas têm endereço.</p>
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
                <Link href="/lotus-anunciar" style={parseStyle('color:#cdab6e;')}>Anunciar imóvel</Link>
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

      {/* WhatsApp flutuante */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
