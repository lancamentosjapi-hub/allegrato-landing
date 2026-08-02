'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusBusca — porte 1:1 de lotus-busca (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Os imóveis vêm do banco
 * (prop `imoveis`, buscada no servidor em app/lotus-busca/page.tsx via
 * getImoveisBusca) — só imóveis reais aprovados. A filtragem/ordenação/mapa
 * continuam no cliente sobre esses dados.
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo + <img> quando há src)
 *  - highlight()          -> manipulação imperativa de DOM via rootRef (fiel ao dc-runtime)
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import LotusHeader from './LotusHeader';
import type { ImovelBusca } from '@/lib/imoveis';

// Chat do Atendimento Rápido — chunk só carrega quando o usuário abre o widget.
const AtendimentoChat = dynamic(() => import('./AtendimentoChat'), { ssr: false });

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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
/* Dados estáticos (valores EXATOS do fonte)                          */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511926143393';

// Imóveis reais do banco (aprovados). O shape vem de lib/imoveis (ImovelBusca);
// aliás `Property` mantido para não renomear todos os usos internos.
type Property = ImovelBusca;

type Chip = { id: string; kind: string; val: any; label: string };

/* Estilos de segmento comprar/alugar (strings literais do fonte). */
const segOn = 'border:none;border-radius:30px;padding:8px 18px;font-size:13.5px;font-weight:600;cursor:pointer;background:#1d3a2c;color:#f7f2e8;';
const segOff = 'border:none;border-radius:30px;padding:8px 18px;font-size:13.5px;font-weight:600;cursor:pointer;background:transparent;color:#3f6249;';

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusBusca({
  whatsapp = WHATSAPP_DEFAULT,
  imoveis = [],
}: {
  whatsapp?: string;
  /** Imóveis reais aprovados (vêm do servidor em app/lotus-busca/page.tsx). */
  imoveis?: ImovelBusca[];
} = {}) {
  // state (espelha o `state` do dc-runtime)
  const [finalidade, setFinalidade] = useState<'comprar' | 'alugar'>('comprar');
  const [chips, setChips] = useState<Chip[]>([]);
  const [sortKey, setSortKey] = useState('rel');
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liaOpen, setLiaOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedDone, setSavedDone] = useState(false);
  const [mapMobile, setMapMobile] = useState(false);

  // refs
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // waLink — lógica exata do script.
  const waLink = 'https://wa.me/' + String(whatsapp ?? WHATSAPP_DEFAULT);

  /* -------- highlight(): manipulação imperativa (pin + card) via rootRef -------- */
  const highlight = (id: string, on: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    const pin = root.querySelector<HTMLElement>('#pin-' + id);
    if (pin) {
      pin.style.transform = 'translate(-50%,-100%) scale(' + (on ? 1.16 : 1) + ')';
      pin.style.background = on ? '#15241c' : '#1d3a2c';
      pin.style.zIndex = on ? '6' : '1';
    }
    const card = root.querySelector<HTMLElement>('#card-' + id);
    if (card) {
      card.style.boxShadow = on ? '0 26px 54px -28px rgba(21,36,28,.5)' : '';
      card.style.transform = on ? 'translateY(-3px)' : '';
    }
  };

  /* -------- chips helpers -------- */
  const addChip = (kind: string, val: any, label: string) => {
    setChips((s) => [...s.filter((c) => c.kind !== kind), { id: kind, kind, val, label }]);
  };
  const removeChip = (id: string) => {
    setChips((s) => s.filter((c) => c.id !== id));
  };

  /* -------- parseAndSearch(): interpreta a busca conversacional -------- */
  const parseAndSearch = () => {
    const q = ((searchRef.current && searchRef.current.value) || '').toLowerCase();
    if (!q.trim()) return;
    const newChips: Chip[] = [];
    let fin = finalidade;
    if (/alug|locaç/.test(q)) fin = 'alugar';
    const beds = q.match(/(\d+)\s*(suíte|suite|dorm|quarto)/);
    if (beds) newChips.push({ id: 'beds', kind: 'beds', val: parseInt(beds[1], 10), label: beds[1] + '+ dorm.' });
    const pm = q.match(/(\d+[.,]?\d*)\s*(mi|milh)/);
    if (pm) {
      const v = Math.round(parseFloat(pm[1].replace(',', '.')) * 1000000);
      newChips.push({ id: 'priceMax', kind: 'priceMax', val: v, label: 'até ' + pm[0].replace('milhões', 'mi').replace('milhão', 'mi') });
    } else {
      const pk = q.match(/(\d+)\s*mil/);
      if (pk) {
        const v = parseInt(pk[1], 10) * 1000;
        newChips.push({ id: 'priceMax', kind: 'priceMax', val: v, label: 'até R$ ' + pk[1] + ' mil' });
      }
    }
    const locs = ['serra do japi', 'eloy chaves', 'anhangabaú', 'anhangabau', 'malota', 'medeiros', 'reserva da serra', 'itupeva', 'vinhedo', 'caxambu', 'centro'];
    const found = locs.find((l) => q.includes(l));
    if (found) newChips.push({ id: 'loc', kind: 'loc', val: found.replace('anhangabau', 'anhangabaú').replace('serra do japi', 'serra'), label: found.charAt(0).toUpperCase() + found.slice(1) });
    const types: Array<[string, string]> = [['casa', 'Casa'], ['apart', 'Apartamento'], ['apê', 'Apartamento'], ['ape ', 'Apartamento'], ['cobertura', 'Cobertura'], ['terreno', 'Terreno'], ['comercial', 'Comercial'], ['sala', 'Comercial'], ['loja', 'Comercial']];
    const t = types.find((p) => q.includes(p[0]));
    if (t) newChips.push({ id: 'type', kind: 'type', val: t[1], label: t[1] });
    setChips(newChips);
    setFinalidade(fin);
    setSelectedId(null);
  };

  /* -------- componentDidMount: exibe botão "Mapa" no mobile -------- */
  useEffect(() => {
    const btn = rootRef.current && rootRef.current.querySelector<HTMLElement>('[data-mapbtn]');
    if (btn && window.matchMedia('(max-width:900px)').matches) btn.style.display = 'inline-flex';
  }, []);

  /* -------- derivados de estado (render context) -------- */
  const get = (k: string) => {
    const c = chips.find((x) => x.kind === k);
    return c ? c.val : 'any';
  };

  let list = imoveis.filter((r) => r.fin === finalidade);
  chips.forEach((c) => {
    if (c.kind === 'beds') list = list.filter((r) => r.beds >= c.val);
    else if (c.kind === 'priceMax') list = list.filter((r) => r.priceNum <= c.val);
    else if (c.kind === 'type') list = list.filter((r) => r.type === c.val);
    else if (c.kind === 'loc') list = list.filter((r) => (r.neighborhood + ' ' + r.city).toLowerCase().includes(c.val));
  });
  list = [...list];
  if (sortKey === 'priceAsc') list.sort((a, b) => a.priceNum - b.priceNum);
  else if (sortKey === 'priceDesc') list.sort((a, b) => b.priceNum - a.priceNum);
  else if (sortKey === 'recent') list.sort((a, b) => b.recent - a.recent);

  const mkSpecs = (r: Property) =>
    (r.beds ? r.beds + (r.beds > 1 ? ' dorms' : ' dorm') + ' · ' : '') +
    r.area +
    ' m²' +
    (r.vagas ? ' · ' + r.vagas + (r.vagas > 1 ? ' vagas' : ' vaga') : '');

  const resultsView = list.map((r) => ({
    ...r,
    href: '/lotus-imovel/' + r.codigo,
    specs: mkSpecs(r),
    fav: !!favs[r.id],
    notFav: !favs[r.id],
    onEnter: () => highlight(r.id, true),
    onLeave: () => highlight(r.id, false),
    toggleFav: (e: React.MouseEvent) => {
      // Card virou <a>: impede que favoritar dispare a navegação.
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setFavs((s) => ({ ...s, [r.id]: !s[r.id] }));
    },
    selectPin: () => setSelectedId(r.id),
  }));

  const selRaw = imoveis.find((r) => r.id === selectedId);
  const selected = selRaw ? { ...selRaw, specs: mkSpecs(selRaw) } : null;
  const favCount = Object.values(favs).filter(Boolean).length;

  const finCompraStyle = finalidade === 'comprar' ? segOn : segOff;
  const finAlugaStyle = finalidade === 'alugar' ? segOn : segOff;

  const vCity = (() => {
    const c = chips.find((x) => x.kind === 'loc');
    return c ? c.val : 'any';
  })();
  const vType = get('type');
  const vBeds = String(get('beds'));
  const vPrice = String(get('priceMax'));

  const onCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    v === 'any' ? removeChip('loc') : addChip('loc', v, v.charAt(0).toUpperCase() + v.slice(1));
  };
  const onType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    v === 'any' ? removeChip('type') : addChip('type', v, v);
  };
  const onBeds = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    v === 'any' ? removeChip('beds') : addChip('beds', parseInt(v, 10), v + '+ dorm.');
  };
  const onPrice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    v === 'any' ? removeChip('priceMax') : addChip('priceMax', parseInt(v, 10), 'até R$ ' + parseInt(v, 10) / 1000000 + ' mi');
  };

  const hasChips = chips.length > 0;
  const chipsView = chips.map((c) => ({ label: c.label, remove: () => removeChip(c.id) }));
  const clearChips = () => {
    setChips([]);
    setSelectedId(null);
  };

  const count = list.length;
  const hasResults = list.length > 0;
  const noResults = list.length === 0;

  const setCompra = () => {
    setFinalidade('comprar');
    setSelectedId(null);
  };
  const setAluga = () => {
    setFinalidade('alugar');
    setSelectedId(null);
  };
  const onSort = (e: React.ChangeEvent<HTMLSelectElement>) => setSortKey(e.target.value);
  const closeSelected = () => setSelectedId(null);

  const toggleSaved = () => {
    setSavedOpen((s) => !s);
    setSavedDone(false);
  };
  const savedForm = !savedDone;
  const submitSaved = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavedDone(true);
  };

  const toggleLia = () => setLiaOpen((s) => !s);

  const mapOnMobile = mapMobile ? '1' : '0';
  const showMapMobile = () => setMapMobile((s) => !s);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') parseAndSearch();
  };

  return (
    <div ref={rootRef} style={parseStyle('min-height:100vh;display:flex;flex-direction:column;')}>
      {/* ===== TOPBAR (brand + nav) ===== */}
      <LotusHeader
        active="comprar"
        whatsapp={whatsapp}
        maxWidth={1480}
        rightSlot={
          <div style={parseStyle('display:flex;align-items:center;gap:14px;')}>
            <button onClick={toggleSaved} style={parseStyle('display:inline-flex;align-items:center;gap:7px;background:none;border:none;color:rgba(247,242,232,.85);font-size:14px;font-weight:500;cursor:pointer;')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
              Favoritos <span style={parseStyle('background:#b18a4a;color:#15241c;font-size:11px;font-weight:700;border-radius:20px;padding:1px 7px;')}>{favCount}</span>
            </button>
            <Hoverable as="a" href={waLink} target="_blank" rel="noopener" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:7px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14px;padding:9px 17px;border-radius:40px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Falar agora</Hoverable>
          </div>
        }
      />

      {/* ===== SEARCH + FILTERS (sticky) ===== */}
      <div style={parseStyle('position:sticky;top:64px;z-index:50;background:#f7f2e8;border-bottom:1px solid rgba(21,36,28,.1);box-shadow:0 8px 24px -20px rgba(21,36,28,.4);')}>
        <div style={parseStyle('max-width:1480px;margin:0 auto;padding:18px 32px;')}>
          {/* conversational */}
          <div style={parseStyle('display:flex;align-items:center;gap:10px;background:#fff;border:1px solid rgba(21,36,28,.14);border-radius:14px;padding:7px 7px 7px 18px;box-shadow:0 12px 30px -24px rgba(21,36,28,.4);')}>
            <svg width="20" height="20" viewBox="0 0 32 32" style={parseStyle('flex-shrink:0;')}><path d="M16 4C19 9 19 15 16 20 13 15 13 9 16 4Z" fill="#cdab6e"></path><path d="M25 9C21 11 17.8 14 16 20 20.5 19 23.8 15.6 25 9Z" fill="#8aa593"></path></svg>
            <input ref={searchRef} type="text" placeholder="Descreva o imóvel que você procura — ex.: casa com 4 suítes perto da Serra do Japi até R$ 2,5 mi" style={parseStyle('flex:1;border:none;outline:none;background:transparent;font-size:15.5px;color:#15241c;padding:9px 0;')} onKeyDown={onSearchKey} />
            <Hoverable as="button" onClick={parseAndSearch} baseStyle={parseStyle('flex-shrink:0;display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:11px 20px;border:none;border-radius:10px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#a07a3c')}>
              Buscar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
            </Hoverable>
          </div>

          {/* filters row */}
          <div style={parseStyle('display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:14px;')}>
            <div style={parseStyle('display:inline-flex;background:#ece2cf;border-radius:30px;padding:3px;')}>
              <button onClick={setCompra} style={parseStyle(finCompraStyle)}>Comprar</button>
              <button onClick={setAluga} style={parseStyle(finAlugaStyle)}>Alugar</button>
            </div>
            <select onChange={onCity} value={vCity} style={parseStyle('border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:13.5px;padding:9px 32px 9px 13px;border-radius:30px;cursor:pointer;')}>
              <option value="any">Cidade</option><option value="jundiaí">Jundiaí</option><option value="itupeva">Itupeva</option><option value="vinhedo">Vinhedo</option>
            </select>
            <select onChange={onType} value={vType} style={parseStyle('border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:13.5px;padding:9px 32px 9px 13px;border-radius:30px;cursor:pointer;')}>
              <option value="any">Tipo</option><option value="Casa">Casa</option><option value="Apartamento">Apartamento</option><option value="Cobertura">Cobertura</option><option value="Terreno">Terreno</option><option value="Comercial">Comercial</option>
            </select>
            <select onChange={onBeds} value={vBeds} style={parseStyle('border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:13.5px;padding:9px 32px 9px 13px;border-radius:30px;cursor:pointer;')}>
              <option value="any">Dormitórios</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
            </select>
            <select onChange={onPrice} value={vPrice} style={parseStyle('border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:13.5px;padding:9px 32px 9px 13px;border-radius:30px;cursor:pointer;')}>
              <option value="any">Preço</option><option value="500000">Até R$ 500 mil</option><option value="1000000">Até R$ 1 mi</option><option value="2000000">Até R$ 2 mi</option><option value="3000000">Até R$ 3 mi</option>
            </select>
            <span style={parseStyle('font-size:13px;color:#8aa593;margin-left:4px;')}>refine com filtros ↑</span>
          </div>

          {/* active chips */}
          {hasChips && (
            <div style={parseStyle('display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:12px;')}>
              <span style={parseStyle('font-size:12.5px;color:#3f6249;font-weight:500;')}>Da sua busca:</span>
              {chipsView.map((c, i) => (
                <button key={i} onClick={c.remove} style={parseStyle('display:inline-flex;align-items:center;gap:7px;background:#1d3a2c;color:#f7f2e8;font-size:12.5px;font-weight:500;padding:6px 10px 6px 13px;border:none;border-radius:30px;cursor:pointer;white-space:nowrap;')}>{c.label} <span style={parseStyle('font-size:14px;opacity:.8;')}>✕</span></button>
              ))}
              <button onClick={clearChips} style={parseStyle('background:none;border:none;color:#b18a4a;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:underline;')}>Limpar</button>
            </div>
          )}
        </div>
      </div>

      {/* ===== SPLIT VIEW ===== */}
      <div data-split="" style={parseStyle('flex:1;max-width:1480px;width:100%;margin:0 auto;padding:0 32px;display:grid;grid-template-columns:1fr 0.82fr;gap:0;')}>

        {/* LEFT: results */}
        <div data-listcol="" data-mobile-off={mapOnMobile} style={parseStyle('padding:24px 28px 24px 0;')}>
          <div style={parseStyle('display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;')}>
            <div>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:22px;color:#15241c;line-height:1.1;")}>{count} imóveis selecionados</div>
              <div style={parseStyle('font-size:13.5px;color:#8aa593;margin-top:3px;')}>em Jundiaí, Itupeva e região · curados pelo especialista do bairro</div>
            </div>
            <div style={parseStyle('display:flex;align-items:center;gap:8px;')}>
              <span style={parseStyle('font-size:13px;color:#3f6249;')}>Ordenar:</span>
              <select onChange={onSort} value={sortKey} style={parseStyle('border:1px solid rgba(21,36,28,.16);background:#fff;color:#15241c;font-size:13.5px;padding:9px 32px 9px 13px;border-radius:10px;cursor:pointer;')}>
                <option value="rel">Relevância</option><option value="priceAsc">Menor preço</option><option value="priceDesc">Maior preço</option><option value="recent">Mais recentes</option>
              </select>
              <button onClick={showMapMobile} data-mapbtn="" style={parseStyle('display:none;align-items:center;gap:6px;background:#1d3a2c;color:#f7f2e8;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;')}>Mapa</button>
            </div>
          </div>

          {hasResults && (
            <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;')}>
              {resultsView.map((r) => (
                <Hoverable
                  key={r.id}
                  as="a"
                  href={r.href}
                  target="_top"
                  aria-label={'Ver ' + r.type + ' em ' + r.neighborhood + ', ' + r.city + ' — ' + r.price}
                  id={'card-' + r.id}
                  onMouseEnter={r.onEnter}
                  onMouseLeave={r.onLeave}
                  baseStyle={parseStyle('position:relative;display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 36px -28px rgba(21,36,28,.36);transition:transform .25s ease, box-shadow .25s ease;cursor:pointer;')}
                  hoverStyle={parseStyle('transform:translateY(-3px);box-shadow:0 26px 54px -30px rgba(21,36,28,.46)')}
                >
                  <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}>
                    <ImageSlot id={r.slot} src={r.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={r.type + ' · ' + r.neighborhood} />
                    {r.badge && (
                      <span style={parseStyle('position:absolute;top:12px;left:12px;background:#b18a4a;color:#15241c;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 10px;border-radius:30px;')}>{r.badge}</span>
                    )}
                    <button type="button" onClick={r.toggleFav} aria-label="Favoritar" style={parseStyle('position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:rgba(247,242,232,.92);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;')}>
                      {r.fav && (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#b18a4a" stroke="#b18a4a" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
                      )}
                      {r.notFav && (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3f6249" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>
                      )}
                    </button>
                  </div>
                  <div style={parseStyle('padding:16px 18px 20px;display:flex;flex-direction:column;flex:1;')}>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-size:21px;color:#1d3a2c;font-weight:400;line-height:1;")}>{r.price}</div>
                    <div style={parseStyle('font-size:13px;font-weight:600;color:#15241c;margin-top:7px;')}>{r.type} · {r.neighborhood} <span style={parseStyle('color:#8aa593;font-weight:400;')}>· {r.city}</span></div>
                    <div style={parseStyle('font-size:13px;color:#3f6249;margin-top:4px;')}>{r.specs}</div>
                    <div style={parseStyle('font-size:12.5px;color:#8aa593;margin-top:10px;line-height:1.45;')}>{r.desc}</div>
                  </div>
                </Hoverable>
              ))}
            </div>
          )}

          {/* empty state / wishlist */}
          {noResults && (
            <div style={parseStyle('background:#1d3a2c;border-radius:20px;padding:48px 40px;text-align:center;')}>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:26px;color:#f7f2e8;margin-bottom:10px;")}>Nenhum imóvel nesse filtro — ainda.</div>
              <p style={parseStyle('font-size:15px;color:rgba(247,242,232,.72);font-weight:300;max-width:440px;margin:0 auto 22px;')}>Descreva o imóvel dos seus sonhos e a gente caça pra você — inclusive fora do catálogo.</p>
              <button onClick={clearChips} style={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:12px 24px;border:none;border-radius:40px;cursor:pointer;')}>Limpar filtros</button>
            </div>
          )}

          {/* wishlist band */}
          <div style={parseStyle('margin-top:28px;background:#ece2cf;border-radius:18px;padding:28px 30px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;')}>
            <div style={parseStyle('max-width:520px;')}>
              <div style={parseStyle("font-family:'Fraunces',serif;font-size:21px;color:#15241c;line-height:1.1;margin-bottom:6px;")}>Não achou o imóvel certo?</div>
              <p style={parseStyle('font-size:14px;color:#3f6249;font-weight:300;margin:0;')}>Salve esta busca e a gente te avisa quando entrar algo no seu critério — ou descreve o sonho que um especialista caça pra você.</p>
            </div>
            <Hoverable as="button" onClick={toggleSaved} baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:13px 24px;border:none;border-radius:40px;cursor:pointer;white-space:nowrap;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Salvar esta busca <span>→</span></Hoverable>
          </div>
        </div>

        {/* RIGHT: map */}
        <div data-mapcol="" data-mobile-on={mapOnMobile} style={parseStyle('position:relative;')}>
          <div style={parseStyle('position:sticky;top:188px;height:calc(100vh - 208px);min-height:480px;padding:24px 0;')}>
            <div style={parseStyle('position:relative;width:100%;height:100%;border-radius:18px;overflow:hidden;background:#e7e4d7;box-shadow:0 18px 50px -34px rgba(21,36,28,.5);')}>
              {/* stylized map */}
              <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')}>
                <rect width="400" height="600" fill="#e7e4d7"></rect>
                <path d="M-20 120 L180 60 L420 160" stroke="#d8d2bf" strokeWidth="14" fill="none"></path>
                <path d="M60 -20 L120 240 L90 620" stroke="#d8d2bf" strokeWidth="12" fill="none"></path>
                <path d="M-20 420 L200 360 L420 440" stroke="#d8d2bf" strokeWidth="16" fill="none"></path>
                <path d="M300 -20 L260 300 L330 620" stroke="#d8d2bf" strokeWidth="10" fill="none"></path>
                <path d="M-20 260 L420 300" stroke="#ddd8c6" strokeWidth="7" fill="none"></path>
                <path d="M120 240 C 200 200 240 260 320 230" stroke="#bcd0bf" strokeWidth="22" fill="none" opacity=".7"></path>
                <circle cx="320" cy="120" r="60" fill="#cdd9c6" opacity=".55"></circle>
                <circle cx="80" cy="470" r="48" fill="#cdd9c6" opacity=".5"></circle>
                <path d="M-20 540 L120 500 L260 560 L420 520" stroke="#bcc9d6" strokeWidth="9" fill="none" opacity=".7"></path>
              </svg>
              <div style={parseStyle('position:absolute;top:14px;left:14px;background:rgba(247,242,232,.92);backdrop-filter:blur(4px);border-radius:10px;padding:7px 12px;font-size:12px;font-weight:600;color:#3f6249;')}>Serra do Japi · região</div>
              <div style={parseStyle('position:absolute;top:14px;right:14px;display:flex;flex-direction:column;gap:6px;')}>
                <div style={parseStyle('width:34px;height:34px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;color:#3f6249;box-shadow:0 4px 12px -6px rgba(21,36,28,.5);')}>+</div>
                <div style={parseStyle('width:34px;height:34px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;color:#3f6249;box-shadow:0 4px 12px -6px rgba(21,36,28,.5);')}>−</div>
              </div>
              <button style={parseStyle('position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:#1d3a2c;color:#f7f2e8;border:none;border-radius:40px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 10px 24px -12px rgba(21,36,28,.6);')}>Buscar nesta área</button>

              {/* price pins */}
              {resultsView.map((r) => (
                <button key={r.id} id={'pin-' + r.id} onMouseEnter={r.onEnter} onMouseLeave={r.onLeave} onClick={r.selectPin} style={parseStyle('position:absolute;left:' + r.x + ';top:' + r.y + ';transform:translate(-50%,-100%);background:#1d3a2c;color:#f7f2e8;border:2px solid #f7f2e8;border-radius:30px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 6px 16px -8px rgba(21,36,28,.7);transition:transform .18s ease, background .18s ease;z-index:1;')}>{r.pinLabel}</button>
              ))}

              {/* mini-card */}
              {selected && (
                <div style={parseStyle('position:absolute;left:50%;bottom:64px;transform:translateX(-50%);width:280px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 22px 50px -22px rgba(21,36,28,.6);')}>
                  <div style={parseStyle('position:relative;height:120px;background:#1d3a2c;')}>
                    <ImageSlot id={selected.slot} src={selected.img} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={selected.neighborhood} />
                    <button onClick={closeSelected} style={parseStyle('position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(247,242,232,.92);border:none;cursor:pointer;font-size:15px;color:#15241c;line-height:1;')}>✕</button>
                  </div>
                  <div style={parseStyle('padding:14px 16px 16px;')}>
                    <div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;")}>{selected.price}</div>
                    <div style={parseStyle('font-size:12.5px;font-weight:600;color:#15241c;margin-top:5px;')}>{selected.type} · {selected.neighborhood}</div>
                    <div style={parseStyle('font-size:12.5px;color:#3f6249;margin-top:3px;')}>{selected.specs}</div>
                    <a href="#" style={parseStyle('display:inline-flex;align-items:center;gap:6px;margin-top:12px;color:#b18a4a;font-weight:600;font-size:13px;')}>Ver imóvel <span>→</span></a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER (slim) ===== */}
      <footer style={parseStyle('background:#15241c;padding:40px 32px;margin-top:24px;')}>
        <div style={parseStyle('max-width:1480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;')}>
          <div style={parseStyle('display:flex;align-items:center;gap:11px;')}>
            <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5C20.5 9 20.5 16 16 22.5 11.5 16 11.5 9 16 2.5Z" fill="#cdab6e"></path><path d="M27.5 8.5C22.5 11 18.2 15 16 22.5 22 21.2 26.3 16.8 27.5 8.5Z" fill="#8aa593"></path><path d="M4.5 8.5C9.5 11 13.8 15 16 22.5 10 21.2 5.7 16.8 4.5 8.5Z" fill="#cdab6e" opacity=".85"></path></svg>
            <span style={parseStyle("font-family:'Fraunces',serif;font-style:italic;font-size:15px;color:rgba(247,242,232,.8);")}>O imóvel é só o palco. O cliente é a história.</span>
          </div>
          <div style={parseStyle('font-size:12.5px;color:rgba(247,242,232,.5);')}>{footerLegalLine()}</div>
        </div>
      </footer>

      {/* ===== SAVED SEARCH TOAST ===== */}
      {savedOpen && (
        <div style={parseStyle('position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:80;background:#1d3a2c;color:#f7f2e8;border-radius:16px;box-shadow:0 24px 60px -22px rgba(21,36,28,.6);padding:20px 24px;width:340px;max-width:calc(100vw - 40px);')}>
          <div style={parseStyle('display:flex;align-items:flex-start;justify-content:space-between;gap:12px;')}>
            <div style={parseStyle('font-size:15px;font-weight:600;')}>Salvar esta busca</div>
            <button onClick={toggleSaved} style={parseStyle('background:none;border:none;color:rgba(247,242,232,.7);font-size:18px;cursor:pointer;line-height:1;')}>×</button>
          </div>
          <p style={parseStyle('font-size:13px;color:rgba(247,242,232,.7);font-weight:300;margin:8px 0 14px;')}>Deixe seu WhatsApp e a gente te avisa quando entrar um imóvel no seu critério.</p>
          {savedDone && (
            <div style={parseStyle('background:rgba(205,171,110,.16);border:1px solid rgba(205,171,110,.4);border-radius:10px;padding:12px;font-size:13.5px;color:#cdab6e;text-align:center;')}>Pronto! Busca salva 🌿 Você será avisado primeiro.</div>
          )}
          {savedForm && (
            <form onSubmit={submitSaved} style={parseStyle('display:flex;gap:8px;')}>
              <input type="text" required placeholder="(11) 99999-9999" style={parseStyle('flex:1;border:1px solid rgba(247,242,232,.25);background:rgba(247,242,232,.06);outline:none;color:#f7f2e8;font-size:14px;padding:11px 13px;border-radius:10px;')} />
              <button type="submit" style={parseStyle('background:#b18a4a;color:#15241c;font-weight:600;font-size:14px;padding:11px 16px;border:none;border-radius:10px;cursor:pointer;')}>Salvar</button>
            </form>
          )}
          <p style={parseStyle('font-size:11px;color:rgba(247,242,232,.45);margin:10px 0 0;')}>Ao salvar você concorda com a Política de Privacidade (LGPD).</p>
        </div>
      )}

      {/* ===== CONCIERGE + WHATSAPP ===== */}
      <div style={parseStyle('position:fixed;right:22px;bottom:22px;z-index:75;display:flex;flex-direction:column;align-items:flex-end;gap:12px;')}>
        {liaOpen && <AtendimentoChat onClose={() => setLiaOpen(false)} />}
        <div style={parseStyle('display:flex;gap:11px;align-items:center;')}>
          <a href={waLink} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('width:50px;height:50px;border-radius:50%;background:#25543b;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px -10px rgba(21,36,28,.6);')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z"></path></svg>
          </a>
          <button onClick={toggleLia} aria-label="Atendimento" style={parseStyle('height:50px;padding:0 20px 0 16px;border-radius:40px;background:#b18a4a;border:none;cursor:pointer;display:flex;align-items:center;gap:9px;box-shadow:0 12px 30px -10px rgba(21,36,28,.6);')}>
            <svg width="18" height="18" viewBox="0 0 32 32"><path d="M16 4C19 9 19 15 16 20 13 15 13 9 16 4Z" fill="#15241c"></path><path d="M25 9C21 11 17.8 14 16 20 20.5 19 23.8 15.6 25 9Z" fill="#1d3a2c"></path></svg>
            <span style={parseStyle('font-size:14px;font-weight:600;color:#15241c;')}>Atendimento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
