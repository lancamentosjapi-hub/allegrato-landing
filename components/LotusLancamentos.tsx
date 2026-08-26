'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusLancamentos — porte 1:1 de lotus-lancamentos/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch do Supabase numa fase futura).
 *
 * Convenções de porte (mesmas de LotusBairro / LotusHome):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *
 * O <script data-dc-script> do fonte só tem: state, EMP (dados), renderVals. O
 * stageStyle do fonte foi removido junto com o badge de estágio dos cards — o
 * `stage` continua alimentando só o filtro do topo.
 * NÃO há data-reveal, IntersectionObserver, componentDidMount/WillUnmount nem timers —
 * todo o comportamento é state React (filtros, ordenação, accordion FAQ, submit de forms).
 */

import React, {
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { empsFallback, EMP_IMG, type EmpItem } from '@/lib/lancamentos-list-fallback';
import Link from 'next/link';
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
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

// data-props default do <script data-props="{...whatsapp:{default:'5511926143393'}}">
const WHATSAPP_DEFAULT = '5511926143393';

// type Emp, EMP e IMG (fallback estático) vivem em @/lib/lancamentos-list-fallback
// para serem compartilhados com o Server Component que faz o merge com o Supabase.

// motivos do renderVals (valores exatos).
const motivos = [
  { num: '01', title: 'Condições de lançamento', text: 'As primeiras fases podem oferecer condições comerciais mais atrativas. A Lotus compara preço por metro quadrado, fluxo de pagamento e imóveis equivalentes antes de recomendar uma escolha.' },
  { num: '02', title: 'Fluxo de pagamento', text: 'Entrada e parcelas durante a obra podem distribuir o investimento ao longo do tempo. Analisamos as condições para entender se o fluxo é compatível com o seu planejamento.' },
  { num: '03', title: 'Potencial de valorização', text: 'Localização, demanda, qualidade do projeto e estágio da obra podem influenciar a valorização. Potencial não é promessa: exige análise e estratégia.' },
  { num: '04', title: 'Mais opções de escolha', text: 'Nas primeiras fases, costuma haver maior variedade de plantas, andares, posições solares e vistas. A melhor unidade é aquela que combina esses fatores com o seu objetivo.' },
];

// faqs (perguntas/respostas) do renderVals — open/sign/toggle derivados do state openFaq.
const faqData = [
  { q: 'Por que comprar na planta?', a: 'Porque pode oferecer condições comerciais diferenciadas, maior variedade de unidades e potencial de valorização ao longo da obra. Esses benefícios variam conforme o empreendimento e precisam ser analisados caso a caso.' },
  { q: 'É seguro comprar na planta?', a: 'Sim, desde que a construtora seja sólida e o registro de incorporação esteja em ordem. A Lotus avalia o histórico da construtora e a documentação antes de recomendar.' },
  { q: 'Quanto preciso de entrada?', a: 'Varia por empreendimento, mas em geral a entrada é parcelada durante a obra, o que dilui bastante o esforço inicial frente a um imóvel pronto.' },
  { q: 'Posso financiar um lançamento?', a: 'Sim. Durante a obra você paga direto à construtora e, na entrega (ou perto dela), pode financiar o saldo pelo banco. A Lotus acompanha a simulação.' },
];

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusLancamentos({ emps: empsProp }: { emps?: EmpItem[] } = {}) {
  // Fonte do filtro/ordenação: itens do Supabase (mergeados na page) quando houver;
  // senão o fallback estático. Mesmo padrão de `devs` em LotusHome.
  const emps = empsProp && empsProp.length > 0 ? empsProp : empsFallback;

  // state = { fCity, fStage, fType, fPrice, sortKey, openFaq: 0, leadDone, newsDone }
  const [fCity, setFCity] = useState('any');
  const [fStage, setFStage] = useState('any');
  const [fType, setFType] = useState('any');
  const [fPrice, setFPrice] = useState('any');
  const [fBuilder, setFBuilder] = useState('any');
  const [sortKey, setSortKey] = useState('rel');
  const [openFaq, setOpenFaq] = useState(0);
  const [leadDone, setLeadDone] = useState(false);
  const [newsDone, setNewsDone] = useState(false);

  // waLink: mesma lógica exata do renderVals.
  const waLink =
    'https://wa.me/' +
    String(WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Quero ver os lançamentos selecionados pela Lotus.');

  // Filtro + ordenação (renderVals).
  let list = emps.filter(
    (e) =>
      (fCity === 'any' || e.city === fCity) &&
      (fStage === 'any' || e.stage === fStage) &&
      (fType === 'any' || e.type === fType) &&
      (fPrice === 'any' || e.priceNum <= parseInt(fPrice, 10)) &&
      (fBuilder === 'any' || e.builder === fBuilder),
  );
  if (sortKey === 'priceAsc') list = [...list].sort((a, b) => a.priceNum - b.priceNum);
  else if (sortKey === 'priceDesc') list = [...list].sort((a, b) => b.priceNum - a.priceNum);

  const view = list.map((e) => ({ ...e, img: e.img ?? EMP_IMG[e.id] }));

  const hasFilter =
    fCity !== 'any' || fStage !== 'any' || fType !== 'any' || fPrice !== 'any' || fBuilder !== 'any';

  // Opcoes vindas dos proprios lancamentos, e nao de lista escrita a mao: se o
  // dashboard cadastrar uma construtora nova, ela aparece aqui sozinha. Nome
  // vazio fica de fora, para nao virar uma opcao em branco.
  const construtoras = [...new Set(emps.map((e) => e.builder ?? '').filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
  const count = list.length;
  const hasResults = list.length > 0;
  const noResults = list.length === 0;

  const clearFilters = () => {
    setFCity('any');
    setFStage('any');
    setFType('any');
    setFPrice('any');
    setFBuilder('any');
    setSortKey('rel');
  };

  const submitLead = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setLeadDone(true);
  };
  const submitNews = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setNewsDone(true);
  };

  // faqs derivados (open/sign/toggle) do state openFaq.
  const faqs = faqData.map((x, i) => ({
    q: x.q,
    a: x.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((prev) => (prev === i ? -1 : i)),
  }));

  const leadNotDone = !leadDone;
  const newsNotDone = !newsDone;

  return (
    <div>
      {/* HEADER */}
      <LotusHeader active="lancamentos" cta="Falar com um consultor" />

      {/* HERO */}
      <section style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;')}>
        <ImageSlot id="lanc-hero" src="/assets/doppio-capa.jpg" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;opacity:.32;')} alt="Foto aérea de empreendimentos / região" />
        <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,rgba(21,36,28,.7),rgba(21,36,28,.92));')}></div>
        <div style={parseStyle('position:relative;max-width:980px;margin:0 auto;padding:100px 32px;text-align:center;')}>
          <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#cdab6e;margin-bottom:24px;')}>Lançamentos em Jundiaí e região</div>
          {/* Duas linhas fixas em vez de quebra por acaso da largura: a primeira
              carrega a ideia (a escolha), a segunda o momento (antes da chave).
              A cor separa as duas, branco e bege. */}
          <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(38px,5.4vw,68px);line-height:1.03;letter-spacing:-.02em;color:#fff;margin:0 0 22px;")}>
            <span style={parseStyle('display:block;')}>Grandes escolhas</span>
            {/* Bege entre o #ece2cf (fundo bege do site) e o #cdab6e (dourado).
                O #ece2cf tinha só 1.28x de contraste contra o branco da linha
                de cima: as duas liam como a mesma cor e a separação sumia. */}
            <span style={parseStyle('display:block;color:#e0cfa8;')}>começam antes da chave.</span>
          </h1>
          <p style={parseStyle('font-size:clamp(16px,1.7vw,20px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;max-width:620px;margin:0 auto;')}>Pré-lançamentos, imóveis em obras e prontos para morar, selecionados com critério pela Lotus. Compare localização, planta, condições e estágio da obra para escolher com clareza o melhor momento de avançar.</p>
        </div>
      </section>

      {/* POR QUE LANÇAMENTO */}
      <section style={parseStyle('background:#ece2cf;padding:90px 32px;')}>
        <div style={parseStyle('max-width:1200px;margin:0 auto;')}>
          <div style={parseStyle('max-width:640px;margin-bottom:48px;')}>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Antes de comprar na planta</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(28px,3.6vw,44px);color:#15241c;line-height:1.06;margin:0 0 16px;")}>Um lançamento é uma oportunidade, quando bem escolhido.</h2>
            <p style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>Comprar na planta pode oferecer condições diferenciadas, menores custos, mais opções de unidade e potencial de valorização. Mas uma boa escolha depende do preço, da construtora, do projeto e do seu objetivo.</p>
          </div>
          <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;')}>
            {/* hint-placeholder-count="4" */}
            {motivos.map((m, i) => (
              <div key={i} style={parseStyle('background:#f7f2e8;border-radius:18px;padding:32px 28px;')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:34px;font-weight:300;color:#cdab6e;line-height:1;margin-bottom:16px;")}>{m.num}</div>
                <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:20px;color:#15241c;margin:0 0 9px;")}>{m.title}</h3>
                <p style={parseStyle('font-size:14.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;')}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTROS + GRID */}
      <section style={parseStyle('background:#f7f2e8;padding:70px 32px 100px;')}>
        <div style={parseStyle('max-width:1280px;margin:0 auto;')}>
          {/* filtros */}
          <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:14px;')}>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;align-items:center;')}>
              <select className="lt-field" value={fCity} onChange={(e) => setFCity(e.target.value)}>
                <option value="any">Todas as cidades</option><option value="Jundiaí">Jundiaí</option><option value="Itupeva">Itupeva</option><option value="Vinhedo">Vinhedo</option>
              </select>
              <select className="lt-field" value={fStage} onChange={(e) => setFStage(e.target.value)}>
                <option value="any">Todos os estágios</option><option value="Pré-lançamento">Pré-lançamento</option><option value="Em obras">Em obras</option><option value="Pronto">Pronto para morar</option>
              </select>
              <select className="lt-field" value={fType} onChange={(e) => setFType(e.target.value)}>
                <option value="any">Todas as tipologias</option><option value="2 dorms">2 dormitórios</option><option value="3 dorms">3 dormitórios</option><option value="4 dorms">4 dorms / cobertura</option>
              </select>
              <select className="lt-field" value={fPrice} onChange={(e) => setFPrice(e.target.value)}>
                <option value="any">Qualquer valor</option><option value="600000">Até R$ 600 mil</option><option value="900000">Até R$ 900 mil</option><option value="1500000">Até R$ 1,5 mi</option><option value="9999999">Acima de R$ 1,5 mi</option>
              </select>
              {/* Construtora: unico filtro com opcoes dinamicas. Some por
                  inteiro quando nenhum lancamento publicado tem construtora
                  preenchida, em vez de exibir um seletor de uma opcao so. */}
              {construtoras.length > 0 && (
                <select
                  className="lt-field"
                  aria-label="Filtrar por construtora"
                  value={fBuilder}
                  onChange={(e) => setFBuilder(e.target.value)}
                >
                  <option value="any">Todas as construtoras</option>
                  {construtoras.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <select className="lt-field" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="rel">Ordenar: relevância</option><option value="priceAsc">Menor preço</option><option value="priceDesc">Maior preço</option>
            </select>
          </div>
          <div style={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:26px;flex-wrap:wrap;')}>
            <div style={parseStyle('font-size:13.5px;color:#8aa593;')}>{count} empreendimentos encontrados</div>
            {hasFilter && (
              <>
                <button onClick={clearFilters} style={parseStyle('background:none;border:none;color:#b18a4a;font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;')}>Limpar filtros</button>
              </>
            )}
          </div>

          {/* grid */}
          {hasResults && (
            <>
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:24px;')}>
                {/* hint-placeholder-count="6" */}
                {view.map((e, i) => (
                  <Hoverable as="a" key={i} href={e.href ?? waLink} target={e.href ? '_top' : '_blank'} rel="noopener" baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px -32px rgba(21,36,28,.34);transition:transform .3s ease, box-shadow .3s ease;')} hoverStyle={parseStyle('transform:translateY(-5px);box-shadow:0 30px 60px -34px rgba(21,36,28,.5)')}>
                    <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}>
                      <ImageSlot id={e.slot} src={e.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={e.name} />
                      {e.exclusive && (
                        <>
                          <span style={parseStyle('position:absolute;top:12px;right:12px;background:#b18a4a;color:#15241c;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 10px;border-radius:30px;')}>Lotus Listing</span>
                        </>
                      )}
                    </div>
                    <div style={parseStyle('padding:20px;display:flex;flex-direction:column;flex:1;')}>
                      <div style={parseStyle('display:flex;align-items:center;gap:6px;font-size:12.5px;color:#8aa593;margin-bottom:8px;')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8aa593" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {e.neighborhood} · {e.city}
                      </div>
                      <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:23px;color:#15241c;margin:0 0 6px;line-height:1.05;")}>{e.name}</h3>
                      <div style={parseStyle('font-size:13.5px;color:#3f6249;margin-bottom:16px;')}>{e.specs}</div>
                      <div style={parseStyle('margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;border-top:1px solid rgba(21,36,28,.08);padding-top:16px;')}>
                        {/* Sem preço cadastrado, o rótulo "A partir de" some junto:
                            exibir os dois virava "a partir de Consultar valor".
                            "Valor sob consulta" é mais largo que o texto anterior e
                            quebra em duas linhas nos cards de CTA longo ("Ver este
                            empreendimento"). Deixamos quebrar: forçar uma linha só
                            (nowrap) estoura o card, que é overflow:hidden, e corta o
                            texto no mobile. Encurtar o CTA resolve, depende da Lotus. */}
                        <div>
                          {e.price && <div style={parseStyle('font-size:11.5px;color:#8aa593;')}>A partir de</div>}
                          <div style={parseStyle("font-family:'Fraunces',serif;font-size:20px;color:#1d3a2c;")}>{e.price ?? 'Valor sob consulta'}</div>
                        </div>
                        <span style={parseStyle('color:#b18a4a;font-weight:600;font-size:14px;')}>{e.href ? 'Ver este empreendimento →' : 'Falar sobre este →'}</span>
                      </div>
                    </div>
                  </Hoverable>
                ))}
              </div>
            </>
          )}
          {noResults && (
            <>
              <div style={parseStyle('background:#ece2cf;border-radius:20px;padding:56px 40px;text-align:center;')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#15241c;margin-bottom:10px;")}>Nenhum lançamento nesse filtro.</div>
                <p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;max-width:420px;margin:0 auto 22px;')}>Conta pra gente o que você procura, temos lançamentos chegando que ainda nem foram divulgados.</p>
                <button onClick={clearFilters} style={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border:none;border-radius:40px;cursor:pointer;')}>Limpar filtros</button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SQUAD LANÇAMENTOS */}
      <section style={parseStyle('background:#15241c;padding:90px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:980px;margin:0 auto;position:relative;display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center;')} data-retrato-grid="">
          <div style={parseStyle('width:130px;height:130px;border-radius:50%;background:#3f6249;overflow:hidden;position:relative;flex-shrink:0;')}><ImageSlot id="lanc-corretor" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Rafael" /></div>
          <div>
            <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Squad Lançamentos</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.8vw,34px);color:#f7f2e8;line-height:1.1;margin:0 0 12px;")}>Conhecer a planta é só o começo.</h2>
            <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.8);font-weight:300;line-height:1.6;margin:0 0 20px;max-width:560px;')}>Antes de recomendar um lançamento, nossos especialistas analisam a incorporadora, o projeto, a localização, a unidade, o fluxo de pagamento e o potencial de cada escolha. Você recebe contexto para decidir e apoio para negociar a melhor condição possível.</p>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:13px 24px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Falar com o especialista <span>→</span></Hoverable>
          </div>
        </div>
      </section>

      {/* GEO / FAQ */}
      <section style={parseStyle('background:#f7f2e8;padding:100px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1.1fr;gap:48px;align-items:start;')}>
          <div>
            <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Dúvidas sobre lançamentos</div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3vw,38px);color:#15241c;line-height:1.08;margin:0 0 22px;")}>Comprar na planta faz sentido para você?</h2>
            <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;')}>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>Em resumo</div>
              <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>Pode fazer sentido quando o empreendimento, a condição de pagamento e o horizonte da compra estão alinhados ao seu objetivo. A Lotus ajuda você a comparar vantagens, riscos e alternativas antes de avançar.</p>
            </div>
          </div>
          <div>
            {/* hint-placeholder-count="4" */}
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

      {/* FORM OPORTUNIDADES */}
      <section style={parseStyle('background:#3f6249;padding:100px 32px;position:relative;overflow:hidden;')}>
        <div style={parseStyle("position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");")}></div>
        <div style={parseStyle('max-width:680px;margin:0 auto;position:relative;text-align:center;')}>
          <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4vw,46px);color:#f7f2e8;line-height:1.05;margin:0 0 16px;")}>Quer descobrir quais lançamentos fazem sentido para você?</h2>
          <p style={parseStyle('font-size:17px;color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;margin:0 0 36px;')}>Conte seu momento. Um especialista do Squad Lançamentos apresentará opções alinhadas ao seu objetivo, perfil e planejamento em Jundiaí e região.</p>
          <div style={parseStyle('background:#1d3a2c;border-radius:22px;padding:clamp(28px,4vw,40px);text-align:left;')}>
            {leadDone && (
              <>
                <div style={parseStyle('text-align:center;padding:24px 0;')}>
                  <div style={parseStyle('width:60px;height:60px;border-radius:50%;background:#3f6249;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;')}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"></path></svg></div>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:24px;color:#f7f2e8;margin-bottom:10px;")}>Recebido! 🌿</div>
                  <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;margin:0;')}>Um especialista vai te chamar com as melhores oportunidades da região.</p>
                </div>
              </>
            )}
            {leadNotDone && (
              <>
                <form onSubmit={submitLead} style={parseStyle('display:flex;flex-direction:column;gap:13px;')}>
                  <input className="lt-field" type="text" required placeholder="Seu nome" style={parseStyle('width:100%;border:1px solid rgba(247,242,232,.2);background:rgba(247,242,232,.06);color:#f7f2e8;border-radius:11px;')} />
                  <div style={parseStyle('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
                    <input className="lt-field" type="email" required placeholder="E-mail" style={parseStyle('width:100%;border:1px solid rgba(247,242,232,.2);background:rgba(247,242,232,.06);color:#f7f2e8;border-radius:11px;')} />
                    <input className="lt-field" type="text" required placeholder="Telefone / WhatsApp" style={parseStyle('width:100%;border:1px solid rgba(247,242,232,.2);background:rgba(247,242,232,.06);color:#f7f2e8;border-radius:11px;')} />
                  </div>
                  <label style={parseStyle('display:flex;align-items:flex-start;gap:9px;font-size:12px;color:rgba(247,242,232,.7);line-height:1.45;cursor:pointer;')}>
                    <input type="checkbox" required style={parseStyle('margin-top:2px;width:16px;height:16px;accent-color:#b18a4a;')} />
                    Autorizo a Lotus a entrar em contato e concordo com a Política de Privacidade (LGPD).
                  </label>
                  <button type="submit" style={parseStyle('margin-top:6px;background:#b18a4a;color:#15241c;font-weight:600;font-size:16px;padding:16px;border:none;border-radius:12px;cursor:pointer;transition:background .2s;')}>Quero saber das oportunidades</button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
        <div style={parseStyle('max-width:1000px;margin:0 auto;background:#f7f2e8;border-radius:22px;padding:clamp(32px,4vw,52px);display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center;box-shadow:0 18px 50px -38px rgba(21,36,28,.4);')}>
          <div>
            <div style={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#ece2cf;border-radius:30px;padding:7px 14px;font-size:12px;font-weight:600;color:#3f6249;margin-bottom:18px;')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b18a4a" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>
              Newsletter de oportunidades
            </div>
            <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.2vw,38px);color:#15241c;line-height:1.08;margin:0 0 12px;")}>Acompanhe o mercado antes de decidir.</h2>
            <p style={parseStyle('font-size:16px;color:#3f6249;font-weight:300;line-height:1.55;margin:0;')}>Receba novos lançamentos, atualizações de obras e oportunidades selecionadas em Jundiaí e região. Informação relevante, sem excesso de mensagens.</p>
          </div>
          <div>
            {newsDone && (
              <>
                <div style={parseStyle('background:#1d3a2c;border-radius:14px;padding:24px;text-align:center;')}><div style={parseStyle("font-family:'Fraunces',serif;font-size:20px;color:#cdab6e;margin-bottom:6px;")}>Inscrição confirmada! 🌿</div><p style={parseStyle('font-size:14px;color:rgba(247,242,232,.8);font-weight:300;margin:0;')}>Você vai receber as próximas oportunidades em primeira mão.</p></div>
              </>
            )}
            {newsNotDone && (
              <>
                <form onSubmit={submitNews} style={parseStyle('display:flex;flex-direction:column;gap:11px;')}>
                  <input type="email" required placeholder="Seu melhor e-mail" style={parseStyle('width:100%;border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:15px;padding:14px;border-radius:11px;outline:none;')} />
                  <button type="submit" style={parseStyle('background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:15px;padding:14px;border:none;border-radius:11px;cursor:pointer;transition:background .2s;')}>Inscrever na newsletter</button>
                  <p style={parseStyle('font-size:11.5px;color:#8aa593;margin:2px 0 0;line-height:1.4;')}>Ao inscrever, você concorda com a Política de Privacidade (LGPD). Cancele quando quiser.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer data-rodape-portal="" style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
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
                <a target="_top" href="/lotus-lancamentos" style={parseStyle('color:#cdab6e;')}>Lançamentos</a>
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

      {/* WhatsApp flutuante */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
