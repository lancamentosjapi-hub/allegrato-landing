'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusBlog — porte 1:1 de lotus-blog (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (valores exatos do script).
 *
 * Convenções de porte (idênticas às de LotusHome.tsx):
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *  - {{ expr }}           -> {expr}
 *
 * Estado do dc-runtime: { view:'index', artId:null, cat:'all', newsDone:false }.
 * renderVals() do fonte vira derivações diretas no corpo do componente.
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
/* Helpers (idênticos aos de LotusHome.tsx)                            */
/* ------------------------------------------------------------------ */

/** Converte "a:b;c:d" em React.CSSProperties. Split no PRIMEIRO ":" de cada decl;
 *  camelCase; -webkit->Webkit; --custom mantido; preserva gradientes/data: URIs. */
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
      ? rawProp
      : rawProp.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[prop] = value;
  }
  return out as CSSProperties;
}

/** style-hover do dc-runtime: aplica hoverStyle no mouseenter, remove no mouseleave. */
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

/** image-slot do dc-runtime: gradiente de fundo + <img> cobrindo quando há src. */
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

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores EXATOS do script dc-runtime)              */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511926143393';

const CATS = [
  { id: 'all', label: 'Todos' },
  { id: 'Cidade', label: 'Cidade' },
  { id: 'Mercado', label: 'Mercado' },
  { id: 'Guia', label: 'Guias' },
  { id: 'Região', label: 'Região' },
];

import { POSTS, type Post } from '@/lib/blog-posts';

/* Estilos de chip (strings literais do fonte). */
const chipOn =
  'border:none;border-radius:30px;padding:10px 18px;font-size:13.5px;font-weight:600;cursor:pointer;background:#1d3a2c;color:#f7f2e8;transition:all .2s;';
const chipOff =
  'border:1px solid rgba(21,36,28,.16);border-radius:30px;padding:10px 18px;font-size:13.5px;font-weight:600;cursor:pointer;background:#fff;color:#3f6249;transition:all .2s;';

/* Logo Lotus (reusada no header e footer). */
function LotusMark({ size }: { size: number }) {
  return (
    <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
  );
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

/**
 * `posts` chega pronto da rota, ja filtrado por data de publicacao.
 *
 * O filtro NAO roda aqui dentro de proposito: este e um componente de
 * cliente, e chamar new Date() durante a renderizacao faria o servidor e o
 * navegador calcularem a lista em instantes diferentes. Na virada de um dia
 * agendado isso da divergencia de hidratacao — a pagina do servidor com um
 * artigo a menos que a do cliente. Quem decide a hora e a rota, no servidor.
 *
 * O padrao POSTS existe para quem renderizar o componente solto (Storybook,
 * teste, pagina futura) nao receber uma tela vazia.
 */
export default function LotusBlog({
  whatsapp = WHATSAPP_DEFAULT,
  posts = POSTS,
}: {
  whatsapp?: string;
  posts?: Post[];
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [view, setView] = useState<'index' | 'article'>('index');
  const [artId, setArtId] = useState<string | null>(null);
  const [cat, setCat] = useState<string>('all');
  const [newsDone, setNewsDone] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement>(null);

  // waLink — lógica exata do script (sem ?text=).
  const waLink = 'https://wa.me/' + String(whatsapp ?? WHATSAPP_DEFAULT);

  /* -------- componentDidMount: injeta JSON-LD dos posts em #blog-posts-jsonld -------- */
  useEffect(() => {
    try {
      const months: Record<string, string> = { Jan: '01', Fev: '02', Mar: '03', Abr: '04', Mai: '05', Jun: '06', Jul: '07', Ago: '08', Set: '09', Out: '10', Nov: '11', Dez: '12' };
      const iso = (d: string) => {
        const p = d.split(' ');
        return (p[1] || '2026') + '-' + (months[p[0]] || '01') + '-01';
      };
      const data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'BlogPosting',
            headline: p.title,
            description: p.tldr,
            articleSection: p.cat,
            datePublished: iso(p.date),
            inLanguage: 'pt-BR',
            author: { '@type': 'Organization', name: 'Lotus Brokers' },
            publisher: { '@type': 'Organization', name: 'Lotus Brokers' },
            articleBody: p.body.join(' '),
          },
        })),
      };
      const el = document.getElementById('blog-posts-jsonld');
      if (el) el.textContent = JSON.stringify(data);
    } catch (e) {}
  }, []);

  /* -------- ações (renderVals do fonte) -------- */
  const openArt = (id: string) => {
    setView('article');
    setArtId(id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const backToIndex = () => {
    setView('index');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const submitNews = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setNewsDone(true);
  };

  // Derivados de estado (render context)
  const isIndex = view === 'index';
  const isArticle = view === 'article';

  const featuredRaw = posts[0];
  const featured = { ...featuredRaw, open: () => openArt(featuredRaw.id) };

  const rest = posts.filter((p) => (cat === 'all' ? p.id !== featuredRaw.id : p.cat === cat));
  const cats = CATS.map((c) => ({
    label: c.label,
    select: () => setCat(c.id),
    style: cat === c.id ? chipOn : chipOff,
  }));
  const postsView = rest.map((p) => ({ ...p, open: () => openArt(p.id) }));

  const artRaw = posts.find((p) => p.id === artId) || posts[0];
  const art = artRaw;
  const related = posts.filter((p) => p.id !== artRaw.id)
    .slice(0, 3)
    .map((r) => ({ ...r, open: () => openArt(r.id) }));

  const newsNotDone = !newsDone;

  return (
    <div ref={rootRef}>
      {/* JSON-LD preenchido pelo useEffect (equivale ao <script id="blog-posts-jsonld"> do helmet) */}
      <script type="application/ld+json" id="blog-posts-jsonld" />

      {/* HEADER */}
      <LotusHeader active="blog" whatsapp={whatsapp} />

      {/* ============ ÍNDICE ============ */}
      {isIndex && (
        <div>
          {/* hero */}
          <section style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;')}>
            <div style={{ ...parseStyle('position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;'), backgroundImage: NOISE_BG }}></div>
            <div style={parseStyle('position:relative;max-width:820px;margin:0 auto;padding:84px 32px;text-align:center;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#cdab6e;margin-bottom:22px;')}>Blog Lotus</div>
              <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(34px,5vw,60px);line-height:1.03;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 18px;")}>Nossa cidade, nosso mercado, <em style={parseStyle('font-style:italic;color:#cdab6e;')}>contado por quem vive aqui.</em></h1>
              <p style={parseStyle('font-size:clamp(15px,1.6vw,19px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.5;max-width:560px;margin:0 auto;')}>Notícias de Jundiaí e Itupeva, mercado imobiliário sem juridiquês e a vida na região da Serra do Japi.</p>
            </div>
          </section>

          {/* destaque */}
          <section style={parseStyle('max-width:1200px;margin:0 auto;padding:48px 32px 0;')}>
            <Hoverable
              onClick={featured.open}
              baseStyle={parseStyle('display:grid;grid-template-columns:1.3fr 1fr;gap:0;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px -38px rgba(21,36,28,.5);cursor:pointer;transition:transform .3s ease;')}
              hoverStyle={parseStyle('transform:translateY(-3px)')}
            >
              <div style={parseStyle('position:relative;min-height:320px;background:#1d3a2c;')}>
                <ImageSlot id={featured.slot} src={featured.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={featured.title} />
                <span style={parseStyle('position:absolute;top:16px;left:16px;background:#b18a4a;color:#15241c;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:6px 12px;border-radius:30px;')}>Destaque</span>
              </div>
              <div style={parseStyle('padding:clamp(28px,3.5vw,44px);display:flex;flex-direction:column;justify-content:center;')}>
                <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:12px;')}>{featured.cat} · {featured.date} · {featured.read}</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:clamp(24px,2.8vw,34px);color:#15241c;line-height:1.1;margin:0 0 14px;")}>{featured.title}</h2>
                <p style={parseStyle('font-size:15.5px;color:#3f6249;font-weight:300;line-height:1.6;margin:0 0 22px;')}>{featured.excerpt}</p>
                <span style={parseStyle('color:#b18a4a;font-weight:600;font-size:15px;')}>Ler artigo →</span>
              </div>
            </Hoverable>
          </section>

          {/* categorias + grid */}
          <section style={parseStyle('max-width:1200px;margin:0 auto;padding:44px 32px 90px;')}>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:9px;margin-bottom:32px;')}>
              {cats.map((c, i) => (
                <button key={i} onClick={c.select} style={parseStyle(c.style)}>{c.label}</button>
              ))}
            </div>
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;')}>
              {postsView.map((p, i) => (
                <Hoverable
                  key={i}
                  onClick={p.open}
                  baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px -32px rgba(21,36,28,.34);cursor:pointer;transition:transform .3s ease, box-shadow .3s ease;')}
                  hoverStyle={parseStyle('transform:translateY(-4px);box-shadow:0 28px 56px -34px rgba(21,36,28,.46)')}
                >
                  <div style={parseStyle('position:relative;aspect-ratio:16/10;background:#1d3a2c;')}>
                    <ImageSlot id={p.slot} src={p.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={p.title} />
                  </div>
                  <div style={parseStyle('padding:22px;display:flex;flex-direction:column;flex:1;')}>
                    <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:10px;')}>{p.cat} · {p.date} · {p.read}</div>
                    <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:21px;color:#15241c;line-height:1.15;margin:0 0 10px;")}>{p.title}</h3>
                    <p style={parseStyle('font-size:14px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 16px;')}>{p.excerpt}</p>
                    <span style={parseStyle('margin-top:auto;color:#b18a4a;font-weight:600;font-size:14px;')}>Ler artigo →</span>
                  </div>
                </Hoverable>
              ))}
            </div>
          </section>

          {/* newsletter */}
          <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
            <div style={parseStyle('max-width:1000px;margin:0 auto;background:#1d3a2c;border-radius:22px;padding:clamp(32px,4vw,52px);display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center;position:relative;overflow:hidden;')}>
              <div style={{ ...parseStyle('position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;'), backgroundImage: NOISE_BG }}></div>
              <div style={parseStyle('position:relative;')}>
                <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>Newsletter Lotus</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3vw,36px);color:#f7f2e8;line-height:1.08;margin:0 0 12px;")}>Receba as notícias da cidade e do mercado.</h2>
                <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;margin:0;')}>Um e-mail por semana com o que importa em Jundiaí e Itupeva. Sem spam.</p>
              </div>
              <div style={parseStyle('position:relative;')}>
                {newsDone && (
                  <div style={parseStyle('background:rgba(205,171,110,.16);border:1px solid rgba(205,171,110,.4);border-radius:12px;padding:20px;text-align:center;font-size:14.5px;color:#cdab6e;')}>Inscrição confirmada! 🌿 Até o próximo e-mail.</div>
                )}
                {newsNotDone && (
                  <form onSubmit={submitNews} style={parseStyle('display:flex;flex-direction:column;gap:10px;')}>
                    <input type="email" required placeholder="Seu melhor e-mail" style={parseStyle('width:100%;border:1px solid rgba(247,242,232,.25);background:rgba(247,242,232,.07);color:#f7f2e8;font-size:15px;padding:14px;border-radius:11px;outline:none;')} />
                    <Hoverable as="button" type="submit" baseStyle={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:14px;border:none;border-radius:11px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Quero receber</Hoverable>
                    <p style={parseStyle('font-size:11.5px;color:rgba(247,242,232,.55);margin:2px 0 0;line-height:1.4;')}>Ao inscrever, você concorda com a Política de Privacidade (LGPD). Cancele quando quiser.</p>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============ ARTIGO ============ */}
      {isArticle && (
        <div>
          <div style={parseStyle('max-width:820px;margin:0 auto;padding:18px 32px 0;font-size:13px;color:#8aa593;')}>
            <Hoverable as="button" onClick={backToIndex} baseStyle={parseStyle('background:none;border:none;color:#3f6249;font-size:13px;cursor:pointer;padding:0;')} hoverStyle={parseStyle('color:#b18a4a')}>Blog</Hoverable> › <span style={parseStyle('color:#15241c;')}>{art.title}</span>
          </div>
          <article style={parseStyle('max-width:820px;margin:0 auto;padding:28px 32px 80px;')}>
            <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b18a4a;margin-bottom:14px;')}>{art.cat} · {art.date} · {art.read}</div>
            <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(30px,4.4vw,52px);line-height:1.05;letter-spacing:-.02em;color:#15241c;margin:0 0 20px;")}>{art.title}</h1>
            <div style={parseStyle('display:flex;align-items:center;gap:12px;margin-bottom:30px;')}>
              <div style={parseStyle('width:42px;height:42px;border-radius:50%;background:#1d3a2c;overflow:hidden;position:relative;flex-shrink:0;')}>
                <ImageSlot id="blog-autor" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="Autor" />
              </div>
              <div>
                <div style={parseStyle('font-size:14px;font-weight:600;color:#15241c;')}>{art.author}</div>
                <div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{art.role}</div>
              </div>
            </div>
            <div style={parseStyle('position:relative;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#1d3a2c;margin-bottom:30px;')}>
              <ImageSlot id={art.slot} src={art.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={art.title} />
            </div>
            <div style={parseStyle('background:#1d3a2c;border-radius:14px;padding:20px 24px;margin-bottom:34px;')}>
              <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:8px;')}>Resumo</div>
              <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.6;margin:0;')}>{art.tldr}</p>
            </div>
            {art.body.map((bloco, i) =>
              typeof bloco === 'string' ? (
                <p key={i} style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.75;margin:0 0 22px;')}>{bloco}</p>
              ) : (
                <div key={i}>
                  {bloco.titulo &&
                    (bloco.nivel === 3 ? (
                      <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:20px;color:#15241c;margin:28px 0 12px;")}>{bloco.titulo}</h3>
                    ) : (
                      <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:clamp(22px,2.4vw,28px);color:#15241c;margin:36px 0 16px;")}>{bloco.titulo}</h2>
                    ))}
                  {bloco.itens && (
                    <ul style={parseStyle('margin:0 0 22px;padding-left:22px;display:grid;gap:9px;')}>
                      {bloco.itens.map((item, j) => (
                        <li key={j} style={parseStyle('font-size:17px;color:#3f6249;font-weight:300;line-height:1.6;')}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}
            <div style={parseStyle('margin-top:40px;background:#ece2cf;border-radius:18px;padding:28px 30px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;')}>
              <div style={parseStyle('max-width:440px;')}>
                <div style={parseStyle("font-family:'Fraunces',serif;font-size:20px;color:#15241c;margin-bottom:5px;")}>Quer conversar sobre isso com um especialista?</div>
                <p style={parseStyle('font-size:14px;color:#3f6249;font-weight:300;margin:0;')}>O time da Lotus vive esse mercado todos os dias, chama a gente.</p>
              </div>
              <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:13px 26px;border-radius:40px;white-space:nowrap;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Falar no WhatsApp</Hoverable>
            </div>
          </article>

          {/* relacionados */}
          <section style={parseStyle('background:#ece2cf;padding:70px 32px;')}>
            <div style={parseStyle('max-width:1100px;margin:0 auto;')}>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(22px,2.6vw,30px);color:#15241c;margin:0 0 26px;")}>Continue lendo</h2>
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;')}>
                {related.map((r, i) => (
                  <Hoverable
                    key={i}
                    onClick={r.open}
                    baseStyle={parseStyle('display:flex;gap:16px;align-items:center;background:#f7f2e8;border-radius:14px;padding:16px;cursor:pointer;transition:transform .25s ease;')}
                    hoverStyle={parseStyle('transform:translateY(-2px)')}
                  >
                    <div style={parseStyle('width:74px;height:60px;border-radius:10px;background:#1d3a2c;flex-shrink:0;overflow:hidden;position:relative;')}>
                      <ImageSlot id={r.slot} src={r.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt="post" />
                    </div>
                    <div>
                      <div style={parseStyle('font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#b18a4a;margin-bottom:4px;')}>{r.cat}</div>
                      <div style={parseStyle("font-family:'Fraunces',serif;font-size:15.5px;color:#15241c;line-height:1.15;")}>{r.title}</div>
                    </div>
                  </Hoverable>
                ))}
              </div>
              <div style={parseStyle('margin-top:30px;text-align:center;')}>
                <Hoverable as="button" onClick={backToIndex} baseStyle={parseStyle('background:none;border:1px solid rgba(21,36,28,.2);color:#1d3a2c;font-weight:600;font-size:14.5px;padding:12px 26px;border-radius:40px;cursor:pointer;')} hoverStyle={parseStyle('background:#f7f2e8')}>← Ver todos os artigos</Hoverable>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* FOOTER */}
      <footer data-rodape-portal="" style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={{ ...parseStyle('position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;'), backgroundImage: NOISE_BG }}></div>
        <div style={parseStyle('max-width:1280px;margin:0 auto;position:relative;')}>
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
                <Hoverable as="a" href="/lotus-anunciar" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Anunciar imóvel</Hoverable>
                <Hoverable as="a" href="/lotus-bairro" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Bairros</Hoverable>
                <Link href="/lotus-blog" style={parseStyle('color:#cdab6e;')}>Blog</Link>
              </div>
            </div>
            <div>
              <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#cdab6e;margin-bottom:18px;')}>Políticas</div>
              <div style={parseStyle('display:flex;flex-direction:column;gap:12px;font-size:14.5px;color:rgba(247,242,232,.72);')}>
                <Hoverable as="a" href="/lotus-privacidade" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Privacidade (LGPD)</Hoverable>
                <Hoverable as="a" href="/lotus-termos" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Termos de uso</Hoverable>
                <Hoverable as="a" href="/lotus-cookies" target="_top" baseStyle={parseStyle('transition:color .2s;')} hoverStyle={parseStyle('color:#cdab6e')}>Cookies</Hoverable>
              </div>
            </div>
          </div>
          <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;padding-top:26px;font-size:13px;color:rgba(247,242,232,.5);')}>
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

      {/* WhatsApp flutuante */}
      <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;width:54px;height:54px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(21,36,28,.6);')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
      </a>
    </div>
  );
}
