'use client';

/**
 * Best View Residence (Swiss Park, Campinas) — porte 1:1 de "Best View Residence -
 * Site.html" (mecanismo dc-runtime) para React.
 * CSS em app/best-view-residence/best-view-residence.css, assets em
 * public/best-view-residence.
 *
 * O `renderVals()` do fonte vira os valores derivados abaixo: abas de planta,
 * grade de lazer com lightbox, ficha técnica, FAQ, contadores animados e
 * formulário com handoff para o WhatsApp.
 *
 * As imagens vinham de `window.__resources` (ids resolvidos pelo bundle); aqui
 * cada id vira o caminho estável do asset em public/ (ver ext_resources).
 */

import React, { useEffect, useState, type CSSProperties } from 'react';
import { Hoverable, parseStyle, waHref } from '@/lib/dc-runtime';
import { sendLead } from '@/lib/lead';

const WA_NUMBER = '5511926143393';
const wa = (msg: string) => waHref(WA_NUMBER, msg);

/** ids do window.__resources -> asset publicado (mapa do __bundler/ext_resources). */
const IMG: Record<string, string> = {
  'p04-0.jpg': '/best-view-residence/a002.jpg',
  'p07-0.jpg': '/best-view-residence/a014.jpg',
  'p08-0.jpg': '/best-view-residence/a007.jpg',
  'p08-1.jpg': '/best-view-residence/a021.jpg',
  'p08-2.jpg': '/best-view-residence/a020.jpg',
  'p09-0.jpg': '/best-view-residence/a008.jpg',
  'p09-1.jpg': '/best-view-residence/a010.jpg',
  'p09-2.jpg': '/best-view-residence/a016.jpg',
  'p10-0.jpg': '/best-view-residence/a011.jpg',
  'p10-1.jpg': '/best-view-residence/a009.jpg',
  'p10-2.jpg': '/best-view-residence/a015.jpg',
  'p11-1.jpg': '/best-view-residence/a019.jpg',
  'p12-0.jpg': '/best-view-residence/a005.jpg',
  'p13-0.png': '/best-view-residence/a017.png',
  'p14-0.png': '/best-view-residence/a013.png',
  'p15-0.png': '/best-view-residence/a018.png',
  'p16-0.png': '/best-view-residence/a022.png',
  'p17-0.jpg': '/best-view-residence/a012.jpg',
};

type PlanKey = '62' | '66' | '78' | 'garden';
type Plan = {
  label: string;
  dorms: string;
  area: string;
  sub: string;
  img: string;
  alt: string;
  feats: string[];
};

const PLANOS: Record<PlanKey, Plan> = {
  '62': {
    label: '2 dorms. · 62 m²', dorms: '2 DORMITÓRIOS', area: '62 m²', sub: 'COM SUÍTE · 2 VAGAS COBERTAS',
    img: IMG['p13-0.png'],
    alt: 'Planta do apartamento de 62,25 m² com 2 dormitórios, suíte, varanda, sala de estar e jantar e cozinha',
    feats: ['62,25 m² de área privativa', 'Suíte + dormitório 2', 'Varanda integrada à sala', '100 unidades desta tipologia', 'Opção Garden: 62,25 m² + 18,68 m²'],
  },
  '66': {
    label: '2 dorms. · 66 m²', dorms: '2 DORMITÓRIOS', area: '66 m²', sub: 'COM SUÍTE · 2 VAGAS COBERTAS',
    img: IMG['p14-0.png'],
    alt: 'Planta do apartamento de 66,25 m² com 2 dormitórios, suíte, varanda, sala de estar e jantar e cozinha',
    feats: ['66,25 m² de área privativa', 'Suíte + dormitório 2', 'Living ampliado com varanda', '24 unidades desta tipologia', 'Opção Garden: 66,25 m² + 23,15 m²'],
  },
  '78': {
    label: '3 dorms. · 78 m²', dorms: '3 DORMITÓRIOS', area: '78 m²', sub: 'COM SUÍTE · 2 VAGAS COBERTAS',
    img: IMG['p15-0.png'],
    alt: 'Planta do apartamento de 78,15 m² com 3 dormitórios, suíte, varanda, sala de estar e jantar e cozinha',
    feats: ['78,15 m² de área privativa', 'Suíte + 2 dormitórios', 'Varanda nivelada com os ambientes', '80 unidades desta tipologia', 'Opção Garden: 78,15 m² + 31,60 m²'],
  },
  garden: {
    label: 'Garden · até 89,4 m²', dorms: '2 DORMITÓRIOS GARDEN', area: '89,4 m²', sub: 'COM SUÍTE · 2 VAGAS COBERTAS',
    img: IMG['p16-0.png'],
    alt: 'Planta do apartamento garden de 89,4 m² com 2 dormitórios, suíte, varanda coberta e garden privativo',
    feats: ['Garden privativo no térreo', 'Varanda coberta + área externa', 'Gardens também nas tipologias de 62, 66 e 78 m²', 'Unidades de 1 dorm. Garden: 46,75 m² + 18,65 m²'],
  },
};

const TAB_BASE =
  'font-family: Montserrat, sans-serif; cursor: pointer; font-size: 13.5px; letter-spacing: .05em; padding: 13px 24px; border-radius: 999px; transition: all .18s ease;';
const TAB_ON = 'background: #A2A37E; color: #241819; border: 1px solid #A2A37E; font-weight: 800;';
const TAB_OFF =
  'background: transparent; color: #CFC5A9; border: 1px solid rgba(162,163,126,.45); font-weight: 600;';

type LazerCard = { t: string; src: string; alt: string; span: string };
const LAZER: LazerCard[] = [
  { t: 'Piscinas com prainha e solarium', src: IMG['p07-0.jpg'], alt: 'Perspectiva artística das piscinas adulto com prainha e infantil do Best View', span: 'grid-column: span 4; grid-row: span 2;' },
  { t: 'Academia', src: IMG['p08-0.jpg'], alt: 'Perspectiva artística da academia fitness', span: 'grid-column: span 2;' },
  { t: 'Salão de festas', src: IMG['p08-1.jpg'], alt: 'Perspectiva artística do salão de festas', span: 'grid-column: span 2;' },
  { t: 'Churrasqueira bar com chopeira', src: IMG['p08-2.jpg'], alt: 'Perspectiva artística da churrasqueira bar com chopeira e deck', span: 'grid-column: span 2;' },
  { t: 'Boulevard central', src: IMG['p12-0.jpg'], alt: 'Perspectiva artística do boulevard central entre as torres', span: 'grid-column: span 2;' },
  { t: 'Pergolado e espelho d’água', src: IMG['p11-1.jpg'], alt: 'Perspectiva artística do pergolado com espelho d’água', span: 'grid-column: span 2;' },
  { t: 'Coworking', src: IMG['p10-0.jpg'], alt: 'Perspectiva artística do coworking', span: 'grid-column: span 2;' },
  { t: 'Playground', src: IMG['p09-0.jpg'], alt: 'Perspectiva artística do playground', span: 'grid-column: span 2;' },
  { t: 'Quadra recreativa', src: IMG['p09-1.jpg'], alt: 'Perspectiva artística da quadra recreativa', span: 'grid-column: span 2;' },
  { t: 'Brinquedoteca', src: IMG['p09-2.jpg'], alt: 'Perspectiva artística da brinquedoteca', span: 'grid-column: span 2;' },
  { t: 'Espaço pet', src: IMG['p10-2.jpg'], alt: 'Perspectiva artística do espaço pet', span: 'grid-column: span 3;' },
  { t: 'Lavanderia', src: IMG['p10-1.jpg'], alt: 'Perspectiva artística da lavanderia compartilhada', span: 'grid-column: span 3;' },
];

const LAZER_CHIPS = [
  'Gazebos', 'Piscina infantil', 'Solarium', 'Horta dos aromas', 'Praça linear', 'Portaria',
  'Sala delivery', 'Churrasqueira gourmet c/ forno', 'Deck churrasqueiras', 'Sala administrativa',
  'Estacionamento p/ visitantes',
];

const DIF_APTO = [
  { t: 'Suíte em todas as unidades', s: 'Do 2 dorms. compacto ao 3 dorms.', icon: 'M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 20v-2h18v2M7 11V7.5A1.5 1.5 0 0 1 8.5 6h7A1.5 1.5 0 0 1 17 7.5V11' },
  { t: 'Varanda gourmet', s: 'Pontos de elétrica, gás, água e esgoto.', icon: 'M12 3c2.5 3.2 5 5.4 5 8.8A5 5 0 0 1 7 11.8C7 8.4 9.5 6.2 12 3zM12 21v-3' },
  { t: 'Persiana integrada', s: 'Janelas com modelo de persiana com blackout.', icon: 'M4 4h16v16H4zM4 9h16M4 14h16M4 19h9' },
  { t: 'Aquecimento a gás', s: 'Água quente no chuveiro e na cozinha.', icon: 'M12 4c3 3.8 6 6.3 6 9.8A6 6 0 0 1 6 13.8C6 10.3 9 7.8 12 4zM9.5 14.5a2.5 2.5 0 0 0 2.5 2.5' },
  { t: 'Preparação para ar-condicionado', s: 'Pontos na sala e nos dormitórios.', icon: 'M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2' },
  { t: 'Apartamento inteligente', s: 'Preparado para automação.', icon: 'M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 9h6v6H9z' },
  { t: 'Ambientes integrados', s: 'Varanda nivelada com os ambientes internos.', icon: 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3' },
  { t: 'Nicho no banheiro', s: 'Seu box mais organizado e prático.', icon: 'M4 4h16v16H4zM4 12h16M9 8h6' },
];

const DIF_CONDO = [
  { t: 'Recarga para carros elétricos', s: '4 vagas de uso comum com estação de 7.400 W.', icon: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z' },
  { t: '2 vagas cobertas por apto.', s: 'Em subsolo. 416 vagas no total.', icon: 'M5 17h14M5 17l1.6-5.2A2 2 0 0 1 8.5 10h7a2 2 0 0 1 1.9 1.8L19 17M5 17v3M19 17v3M8 14h.01M16 14h.01' },
  { t: 'Portaria blindada', s: 'Com célula de segurança para controle de pedestres.', icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z' },
  { t: 'Monitoramento por câmeras', s: 'Circuito de câmeras de segurança.', icon: 'M16 8l6-2v10l-6-2M2 6h14v12H2zM6 12h.01' },
  { t: 'Sala delivery', s: 'Recebimento de encomendas facilitado.', icon: 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8' },
  { t: 'Wi-Fi nas áreas de lazer', s: 'Infraestrutura preparada.', icon: 'M5 12.5a11 11 0 0 1 14 0M8.5 15.8a6.5 6.5 0 0 1 7 0M2 9.2a16 16 0 0 1 20 0M12 19.5h.01' },
  { t: '2 elevadores por torre', s: 'Em todas as 4 torres.', icon: 'M4 3h16v18H4zM9 9.5l3-3 3 3M9 14.5l3 3 3-3' },
  { t: 'Coleta seletiva', s: 'Espaço sinalizado para separação correta.', icon: 'M11 20A7 7 0 0 1 4 13c0-4 3.5-8 9.5-9.5C17 7 20 9.5 20 13.5A6.5 6.5 0 0 1 13.5 20H11zM5 20c3-5.5 6.5-8 11-9' },
];

const FICHA = [
  { k: 'TORRES', v: '4 torres — Blocos 1 e 2 (térreo + 6 pavimentos); Blocos 3 e 4 (térreo + 5). 8 unidades por pavimento.' },
  { k: 'UNIDADES', v: '208 no total: 80 de 3 dorms. (78,15 m²), 100 de 2 dorms. (62,25 m²), 24 de 2 dorms. (66,25 m²) e 4 de 1 dorm. Garden — além das versões Garden de cada tipologia.' },
  { k: 'VAGAS', v: '416 vagas — 2 cobertas em subsolo por apartamento (1 dorm.: 1 vaga coberta).' },
  { k: 'TERRENO', v: '17.150,76 m² de área de terreno.' },
  { k: 'ÁREA CONSTRUÍDA', v: '28.886,54 m².' },
  { k: 'SISTEMA CONSTRUTIVO', v: 'Alvenaria estrutural.' },
  { k: 'ARQUITETURA', v: 'Eliana Parrillo.' },
  { k: 'INTERIORES E LUMINOTÉCNICA', v: 'Érica Hidalgo.' },
  { k: 'PAISAGISMO', v: 'Thais Melato.' },
];

const FAQS = [
  { q: 'Onde fica o Best View Residence?', a: 'Na Av. Dermival Bernardes Siqueira, 3813, no Swiss Park, um dos melhores bairros de Campinas/SP — com localização estratégica e fácil acesso às conveniências da cidade.' },
  { q: 'Quais são as opções de apartamento?', a: 'Apartamentos de 2 dormitórios (62,25 m² e 66,25 m²) e 3 dormitórios (78,15 m²), todos com suíte, além de unidades Garden com área externa privativa (incluindo Garden de 89,4 m²). São 208 unidades em 4 torres.' },
  { q: 'Todas as unidades têm suíte?', a: 'Sim. Todas as unidades do Best View possuem suíte.' },
  { q: 'Quantas vagas de garagem tem cada apartamento?', a: 'Cada apartamento conta com 2 vagas cobertas em subsolo (exceto as unidades de 1 dormitório, com 1 vaga coberta). O condomínio ainda oferece estacionamento para visitantes e 4 vagas de uso comum com estação de recarga para carros elétricos de 7.400 W.' },
  { q: 'O que o lazer do condomínio oferece?', a: 'São 22 itens de lazer equipados e decorados*: piscinas adulto com prainha e infantil, solarium, academia, salão de festas, churrasqueira gourmet com forno, churrasqueira bar com chopeira, deck de churrasqueiras, coworking, brinquedoteca, playground, quadra recreativa, espaço pet, horta dos aromas, pergolado com espelho d’água, gazebos, praça linear, lavanderia e sala delivery, entre outros. *Consulte o memorial descritivo.' },
  { q: 'Quem é a construtora do Best View?', a: 'O Best View é uma realização da F A Oliva, empresa de Jundiaí (SP) fundada em 1955, com mais de 8 mil unidades entregues, mais de 110 torres construídas e mais de 3,5 milhões de m² construídos. A construção é da Urbitec Construções, braço construtivo da F A Oliva.' },
  { q: 'Os apartamentos são preparados para automação e ar-condicionado?', a: 'Sim. As unidades são preparadas para automação (apartamento inteligente) e possuem preparação para pontos de ar-condicionado na sala e nos dormitórios. Equipamentos e instalação são contratados pelo cliente.' },
  { q: 'Como falo com um consultor?', a: 'A Lotus Brokers atende pelo WhatsApp +55 11 92614-3393 ou pelo formulário desta página — resposta rápida, sem compromisso.' },
];

type LbState = { src: string; alt: string; t: string; bg?: string; sub?: string };

export default function BestViewResidence() {
  const [plan, setPlan] = useState<PlanKey>('62');
  const [lightbox, setLightbox] = useState<LbState | null>(null);
  const [sent, setSent] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [fone, setFone] = useState('');
  const [counts, setCounts] = useState({ cUnidades: 0, cTorres: 0, cEmpreend: 0, cM2: '0,0' });

  /* Contadores animados quando a faixa entra na tela (mesma curva do fonte). */
  useEffect(() => {
    const el = document.querySelector('[data-counters]');
    if (!el || typeof IntersectionObserver !== 'function') return;
    let counted = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (counted || !entries.some((e) => e.isIntersecting)) return;
        counted = true;
        const t0 = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          setCounts({
            cUnidades: Math.round(8 * e),
            cTorres: Math.round(110 * e),
            cEmpreend: Math.round(40 * e),
            cM2: (3.5 * e).toFixed(1).replace('.', ','),
          });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const p = PLANOS[plan];

  const heroSrc = IMG['p17-0.jpg'];
  const assinaturaHero = 'Permita-se novos horizontes';
  const waLink = wa(
    'Olá! Vi a página do Best View Residence (Swiss Park, Campinas) e quero mais informações.',
  );
  const waLinkPlan = wa(
    `Olá! Tenho interesse na planta ${p.label} do Best View Residence. Pode me enviar mais informações?`,
  );
  const waLinkForm = wa(
    `Olá! Quero saber mais sobre o Best View Residence.\nNome: ${nome}\nE-mail: ${email}\nTelefone: ${fone}`,
  );

  const planTabs = (Object.keys(PLANOS) as PlanKey[]).map((key) => ({
    label: PLANOS[key].label,
    selected: plan === key,
    select: () => setPlan(key),
    style: parseStyle(TAB_BASE + (plan === key ? TAB_ON : TAB_OFF)),
  }));

  const lazerCards = LAZER.map((c) => ({
    titulo: c.t,
    src: c.src,
    alt: c.alt,
    aria: `Ampliar imagem: ${c.t}`,
    open: () => setLightbox({ src: c.src, alt: c.alt, t: c.t }),
    figStyle: parseStyle(
      'position: relative; margin: 0; overflow: hidden; cursor: zoom-in; transition: transform .25s ease; ' +
        c.span,
    ) as CSSProperties,
  }));

  const lazerChips = LAZER_CHIPS;
  const planImg = p.img;
  const planImgAlt = p.alt;
  const planDorms = p.dorms;
  const planArea = p.area;
  const planSub = p.sub;
  const planFeatures = p.feats;
  const abrirPlanta = () =>
    setLightbox({
      src: p.img,
      alt: p.alt,
      t: `Planta ${p.label}`,
      bg: '#F4EFE7',
      sub: 'Ilustração artística',
    });

  const difApto = DIF_APTO;
  const difCondo = DIF_CONDO;
  const ficha = FICHA;
  const faqs = FAQS;

  const formPending = !sent;
  const formSent = sent;
  const fNome = nome;
  const fEmail = email;
  const fFone = fone;
  const setNomeEv = (e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value);
  const setEmailEv = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const setFoneEv = (e: React.ChangeEvent<HTMLInputElement>) => setFone(e.target.value);
  const enviarForm = (e: React.FormEvent) => {
    e.preventDefault();
    sendLead({
      name: fNome,
      phone: fFone,
      email: fEmail,
      source: 'landing_best-view-residence',
      interest: 'Best View Residence',
    });
    window.open(waLinkForm, '_blank', 'noopener');
    setSent(true);
  };

  const lightboxOpen = !!lightbox;
  const lightboxSrc = lightbox ? lightbox.src : '';
  const lightboxAlt = lightbox ? lightbox.alt : '';
  const lightboxTitulo = lightbox ? lightbox.t : '';
  const lightboxBg = lightbox?.bg || 'transparent';
  const lightboxSub = lightbox?.sub || 'Perspectiva artística';
  const fecharLightbox = () => setLightbox(null);

  const { cUnidades, cTorres, cEmpreend, cM2 } = counts;
  const showFloat = true;

  return (
    <>
      <div style={parseStyle('font-family: Montserrat, sans-serif; color: #F4EFE7; background: #241819; overflow-x: clip;')}>
        {/* grain overlay */}
        <div style={parseStyle("position: fixed; inset: 0; z-index: 60; pointer-events: none; opacity: .055; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');")} aria-hidden="true">
        </div>
        {/* ===================== HEADER ===================== */}
        <header style={parseStyle('position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: linear-gradient(180deg, rgba(30,20,21,.82), rgba(30,20,21,0)); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);')}>
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 18px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px;')}>
            <a style={parseStyle('text-decoration: none; color: #F4EFE7; display: flex; flex-direction: column; line-height: 1.1;')} href="#topo">
              <span style={parseStyle('font-weight: 300; font-size: 21px; letter-spacing: .34em;')}>
                LOTUS
              </span>
              <span style={parseStyle('font-weight: 600; font-size: 9px; letter-spacing: .46em; color: #A2A37E;')}>
                BROKERS
              </span>
            </a>
            <nav style={parseStyle('display: flex; gap: 30px; align-items: center;')} aria-label="Seções da página">
              <Hoverable as="a" baseStyle={parseStyle('color: #E9DFD4; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .06em; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: all .15s ease;')} hoverStyle={parseStyle('color: #E9D7A8; border-bottom: 1px solid #A2A37E;')} href="#empreendimento">
                O empreendimento
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('color: #E9DFD4; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .06em; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: all .15s ease;')} hoverStyle={parseStyle('color: #E9D7A8; border-bottom: 1px solid #A2A37E;')} href="#lazer">
                Lazer
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('color: #E9DFD4; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .06em; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: all .15s ease;')} hoverStyle={parseStyle('color: #E9D7A8; border-bottom: 1px solid #A2A37E;')} href="#plantas">
                Plantas
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('color: #E9DFD4; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .06em; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: all .15s ease;')} hoverStyle={parseStyle('color: #E9D7A8; border-bottom: 1px solid #A2A37E;')} href="#localizacao">
                Localização
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('color: #E9DFD4; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: .06em; border-bottom: 1px solid transparent; padding-bottom: 3px; transition: all .15s ease;')} hoverStyle={parseStyle('color: #E9D7A8; border-bottom: 1px solid #A2A37E;')} href="#faq">
                FAQ
              </Hoverable>
            </nav>
            <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 9px; background: #A2A37E; color: #241819; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: .04em; padding: 12px 22px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('background: #E9D7A8; transform: translateY(-1px);')} href={waLink} target="_blank" rel="noopener">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4Z">
                </path>
              </svg>
              {' '}Falar com um consultor{' '}
            </Hoverable>
          </div>
        </header>
        {/* ===================== HERO ===================== */}
        <section style={parseStyle('position: relative; min-height: 100vh; display: flex; align-items: flex-end; overflow: hidden; isolation: isolate;')} id="topo" data-screen-label="Hero">
          <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; animation: kenburns 16s cubic-bezier(.2,.6,.3,1) both;')} src={heroSrc} alt="Perspectiva artística aérea do Best View Residence ao pôr do sol, Swiss Park, Campinas" />
          <div style={parseStyle('position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, rgba(36,24,25,.62) 0%, rgba(36,24,25,.12) 40%, rgba(36,24,25,.55) 72%, rgba(36,24,25,.96) 100%);')} aria-hidden="true">
          </div>
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; width: 100%; padding: 150px 28px 84px;')}>
            <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #E9D7A8; animation: heroText 1s .2s cubic-bezier(.2,.7,.2,1) both;')}>
              <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
              </span>
              {' '}SWISS PARK · CAMPINAS/SP
            </p>
            <p style={parseStyle("margin: 0 0 4px; font-family: 'Style Script', cursive; font-size: clamp(34px, 4.6vw, 58px); color: #E9D7A8; animation: heroText 1s .35s cubic-bezier(.2,.7,.2,1) both;")}>
              {assinaturaHero}
            </p>
            <h1 style={parseStyle('margin: 0; font-weight: 900; font-size: clamp(52px, 8.4vw, 118px); line-height: .96; letter-spacing: .01em; animation: heroText 1s .5s cubic-bezier(.2,.7,.2,1) both;')}>
              BEST VIEW{' '}
              <span style={parseStyle('display: block; font-weight: 300; font-size: clamp(18px, 2.2vw, 30px); letter-spacing: .58em; color: #E9DFD4; margin-top: 10px;')}>
                RESIDENCE
              </span>
            </h1>
            <div style={parseStyle('display: flex; flex-wrap: wrap; align-items: center; gap: 0 34px; margin-top: 30px; animation: heroText 1s .65s cubic-bezier(.2,.7,.2,1) both;')}>
              <p style={parseStyle('margin: 8px 0; font-size: 15px; font-weight: 600; letter-spacing: .1em; color: #F4EFE7;')}>
                62 a 78 m²
              </p>
              <span style={parseStyle('width: 5px; height: 5px; border-radius: 50%; background: #A2A37E;')} aria-hidden="true">
              </span>
              <p style={parseStyle('margin: 8px 0; font-size: 15px; font-weight: 600; letter-spacing: .1em; color: #F4EFE7;')}>
                2 e 3 dorms. com suíte
              </p>
              <span style={parseStyle('width: 5px; height: 5px; border-radius: 50%; background: #A2A37E;')} aria-hidden="true">
              </span>
              <p style={parseStyle('margin: 8px 0; font-size: 15px; font-weight: 600; letter-spacing: .1em; color: #F4EFE7;')}>
                Apartamentos Garden
              </p>
              <span style={parseStyle('width: 5px; height: 5px; border-radius: 50%; background: #A2A37E;')} aria-hidden="true">
              </span>
              <p style={parseStyle('margin: 8px 0; font-size: 15px; font-weight: 600; letter-spacing: .1em; color: #F4EFE7;')}>
                2 vagas cobertas
              </p>
            </div>
            <div style={parseStyle('display: flex; flex-wrap: wrap; gap: 16px; margin-top: 34px; animation: heroText 1s .8s cubic-bezier(.2,.7,.2,1) both;')}>
              <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 10px; background: #A2A37E; color: #241819; text-decoration: none; font-weight: 800; font-size: 14px; letter-spacing: .05em; padding: 17px 34px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('background: #E9D7A8; transform: translateY(-2px);')} href={waLink} target="_blank" rel="noopener">
                Quero conhecer o Best View{' '}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6">
                  </path>
                </svg>
              </Hoverable>
              <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(233,215,168,.5); color: #E9D7A8; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: .05em; padding: 17px 34px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('border-color: #E9D7A8; background: rgba(233,215,168,.08);')} href="#empreendimento">
                Explorar o projeto
              </Hoverable>
            </div>
          </div>
          <div style={parseStyle('position: absolute; bottom: 22px; left: 50%; margin-left: -1px; width: 2px; height: 40px; overflow: hidden;')} aria-hidden="true">
            <span style={parseStyle('display: block; width: 2px; height: 100%; background: linear-gradient(#E9D7A8, transparent); animation: scrollCue 2.2s ease-in-out infinite;')}>
            </span>
          </div>
        </section>
        {/* ===================== FAIXA RESUMO ===================== */}
        <section style={parseStyle('background: #A2A37E; color: #241819;')} data-screen-label="Resumo" aria-label="Números do empreendimento">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 30px 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 22px;')}>
            <div style={parseStyle('display: flex; flex-direction: column; gap: 3px; border-left: 1px solid rgba(36,24,25,.28); padding-left: 18px;')}>
              <span style={parseStyle('font-weight: 900; font-size: 30px;')}>
                208
              </span>
              <span style={parseStyle('font-weight: 600; font-size: 12px; letter-spacing: .14em;')}>
                UNIDADES EM 4 TORRES
              </span>
            </div>
            <div style={parseStyle('display: flex; flex-direction: column; gap: 3px; border-left: 1px solid rgba(36,24,25,.28); padding-left: 18px;')}>
              <span style={parseStyle('font-weight: 900; font-size: 30px;')}>
                100%
              </span>
              <span style={parseStyle('font-weight: 600; font-size: 12px; letter-spacing: .14em;')}>
                DAS UNIDADES COM SUÍTE
              </span>
            </div>
            <div style={parseStyle('display: flex; flex-direction: column; gap: 3px; border-left: 1px solid rgba(36,24,25,.28); padding-left: 18px;')}>
              <span style={parseStyle('font-weight: 900; font-size: 30px;')}>
                22
              </span>
              <span style={parseStyle('font-weight: 600; font-size: 12px; letter-spacing: .14em;')}>
                ITENS DE LAZER
              </span>
            </div>
            <div style={parseStyle('display: flex; flex-direction: column; gap: 3px; border-left: 1px solid rgba(36,24,25,.28); padding-left: 18px;')}>
              <span style={parseStyle('font-weight: 900; font-size: 30px;')}>
                17.150 m²
              </span>
              <span style={parseStyle('font-weight: 600; font-size: 12px; letter-spacing: .14em;')}>
                DE TERRENO
              </span>
            </div>
          </div>
        </section>
        {/* ===================== SOBRE ===================== */}
        <section style={parseStyle('background: #2B1D1E; padding: 110px 0;')} id="empreendimento" data-screen-label="Sobre">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.1fr); gap: clamp(36px, 6vw, 90px); align-items: center;')}>
            <div style={parseStyle('animation: rvUp 1s cubic-bezier(.2,.7,.2,1) both; animation-timeline: view(); animation-range: entry 0% entry 45%;')}>
              <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
                <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
                </span>
                {' '}O EMPREENDIMENTO
              </p>
              <h2 style={parseStyle('margin: 0 0 8px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
                Onde morar se torna{' '}
                <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                  extraordinário
                </span>
              </h2>
              <p style={parseStyle('margin: 22px 0 0; font-size: 16px; line-height: 1.85; color: #D8CCC2; font-weight: 400;')}>
                Imagine um lugar onde o conforto, a conveniência e a tranquilidade se fundem para criar o lar dos seus sonhos. Uma vida repleta de tranquilidade e conforto é o que te espera no Best View — um verdadeiro refúgio urbano, com uma vista privilegiada.
              </p>
              <p style={parseStyle('margin: 16px 0 0; font-size: 16px; line-height: 1.85; color: #D8CCC2; font-weight: 400;')}>
                Aqui, você e sua família podem desfrutar de tudo o que torna o viver mais prazeroso. A verdadeira experiência de viver bem.
              </p>
              <div style={parseStyle('display: flex; gap: 30px; margin-top: 34px;')}>
                <div>
                  <p style={parseStyle('margin: 0; font-weight: 900; font-size: 26px; color: #E9D7A8;')}>
                    Eliana Parrillo
                  </p>
                  <p style={parseStyle('margin: 4px 0 0; font-size: 12px; letter-spacing: .12em; font-weight: 600; color: #A2A37E;')}>
                    PROJETO ARQUITETÔNICO
                  </p>
                </div>
                <div style={parseStyle('border-left: 1px solid rgba(162,163,126,.35); padding-left: 30px;')}>
                  <p style={parseStyle('margin: 0; font-weight: 900; font-size: 26px; color: #E9D7A8;')}>
                    Thais Melato
                  </p>
                  <p style={parseStyle('margin: 4px 0 0; font-size: 12px; letter-spacing: .12em; font-weight: 600; color: #A2A37E;')}>
                    PROJETO PAISAGÍSTICO
                  </p>
                </div>
              </div>
            </div>
            <figure style={parseStyle('margin: 0; position: relative; animation: rvIn 1.2s ease both; animation-timeline: view(); animation-range: entry 0% entry 50%;')}>
              <div style={parseStyle('position: absolute; top: -26px; right: -26px; bottom: 26px; left: 26px; background: rgba(162,163,126,.32); z-index: 0;')} aria-hidden="true">
              </div>
              <img style={parseStyle('position: relative; z-index: 1; width: 100%; display: block; object-fit: cover; aspect-ratio: 4/3; box-shadow: 0 40px 80px -30px rgba(0,0,0,.6);')} src="/best-view-residence/a002.jpg" alt="Perspectiva artística da fachada e portaria do Best View Residence ao anoitecer" />
              <figcaption style={parseStyle('position: relative; z-index: 1; margin-top: 10px; font-size: 11px; letter-spacing: .08em; color: #9b8b83;')}>
                Perspectiva artística da fachada e portaria
              </figcaption>
            </figure>
          </div>
        </section>
        {/* ===================== LAZER ===================== */}
        <section style={parseStyle('background: #241819; padding: 110px 0;')} id="lazer" data-screen-label="Lazer">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 50px; animation: rvUp 1s cubic-bezier(.2,.7,.2,1) both; animation-timeline: view(); animation-range: entry 0% entry 60%;')}>
              <div>
                <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
                  <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
                  </span>
                  {' '}22 ITENS DE LAZER
                </p>
                <h2 style={parseStyle('margin: 0; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
                  Lazer{' '}
                  <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                    inspirador
                  </span>
                </h2>
              </div>
              <p style={parseStyle('margin: 0; max-width: 440px; font-size: 15px; line-height: 1.8; color: #D8CCC2;')}>
                Explore áreas de lazer equipadas e decoradas*, que harmonizam com a paisagem ao redor. O equilíbrio perfeito entre o conforto e a natureza em cada espaço.
              </p>
            </div>
            <div style={parseStyle('display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 210px; gap: 14px;')}>
              {lazerCards.map((card, i) => (<React.Fragment key={i}>
                <Hoverable as="figure" baseStyle={card.figStyle} hoverStyle={parseStyle('transform: translateY(-3px);')} onClick={card.open} role="button" tabIndex={0} aria-label={card.aria}>
                  <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .8s cubic-bezier(.2,.7,.2,1);')} src={card.src} alt={card.alt} />
                  <span style={parseStyle('position: absolute; inset: 0; background: linear-gradient(180deg, rgba(36,24,25,0) 45%, rgba(36,24,25,.88) 100%);')} aria-hidden="true">
                  </span>
                  <figcaption style={parseStyle('position: absolute; left: 18px; right: 18px; bottom: 15px; display: flex; align-items: center; justify-content: space-between; gap: 10px;')}>
                    <span style={parseStyle('font-weight: 700; font-size: 15px; letter-spacing: .03em; color: #F4EFE7;')}>
                      {card.titulo}
                    </span>
                    <span style={parseStyle('width: 30px; height: 30px; flex: none; border-radius: 50%; border: 1px solid rgba(233,215,168,.6); display: grid; place-items: center; color: #E9D7A8; font-size: 15px; font-weight: 300;')} aria-hidden="true">
                      +
                    </span>
                  </figcaption>
                </Hoverable>
              </React.Fragment>))}
            </div>
            <div style={parseStyle('display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; animation: rvIn 1s ease both; animation-timeline: view(); animation-range: entry 0% entry 70%;')}>
              {lazerChips.map((chip, i) => (<React.Fragment key={i}>
                <span style={parseStyle('border: 1px solid rgba(162,163,126,.45); color: #CFC5A9; font-size: 13px; font-weight: 500; letter-spacing: .04em; padding: 9px 18px; border-radius: 999px;')}>
                  {chip}
                </span>
              </React.Fragment>))}
            </div>
            <p style={parseStyle('margin: 26px 0 0; font-size: 11px; letter-spacing: .06em; color: #9b8b83;')}>
              *Áreas de lazer equipadas e decoradas. Consulte o memorial descritivo. Imagens: perspectivas artísticas.
            </p>
          </div>
        </section>
        {/* ===================== PLANTAS ===================== */}
        <section style={parseStyle('background: #2B1D1E; padding: 110px 0;')} id="plantas" data-screen-label="Plantas">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
              <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
              </span>
              {' '}PLANTAS
            </p>
            <h2 style={parseStyle('margin: 0 0 40px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
              Um Best View do{' '}
              <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                seu jeito
              </span>
            </h2>
            <div style={parseStyle('display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 42px;')} role="tablist" aria-label="Escolha a planta">
              {planTabs.map((tab, i) => (<React.Fragment key={i}>
                <Hoverable as="button" baseStyle={tab.style} hoverStyle={parseStyle('border-color: #E9D7A8; color: #E9D7A8;')} role="tab" aria-selected={tab.selected} onClick={tab.select}>
                  {tab.label}
                </Hoverable>
              </React.Fragment>))}
            </div>
            <div style={parseStyle('display: grid; grid-template-columns: minmax(340px, 1.25fr) minmax(300px, 1fr); gap: clamp(32px, 5vw, 70px); align-items: center;')}>
              <Hoverable as="figure" baseStyle={parseStyle('margin: 0; position: relative; background: #F4EFE7; padding: clamp(18px, 3vw, 40px); box-shadow: 0 40px 80px -30px rgba(0,0,0,.55); cursor: zoom-in; transition: transform .2s ease;')} hoverStyle={parseStyle('transform: translateY(-3px);')} onClick={abrirPlanta} role="button" tabIndex={0} aria-label="Ampliar planta">
                <span style={parseStyle('position: absolute; top: 16px; right: 16px; display: inline-flex; align-items: center; gap: 8px; background: #362627; color: #E9D7A8; font-size: 11px; font-weight: 700; letter-spacing: .12em; padding: 9px 15px; border-radius: 999px;')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7">
                    </path>
                  </svg>
                  {' '}AMPLIAR{' '}
                </span>
                <img style={parseStyle('width: 100%; display: block;')} src={planImg} alt={planImgAlt} />
                <figcaption style={parseStyle('margin-top: 12px; font-size: 10.5px; letter-spacing: .05em; line-height: 1.6; color: #6b5a52;')}>
                  Ilustração artística. Móveis, utensílios e itens de decoração são meramente ilustrativos e não fazem parte do Memorial Descritivo.
                </figcaption>
              </Hoverable>
              <div>
                <p style={parseStyle('margin: 0; font-weight: 300; font-size: 15px; letter-spacing: .34em; color: #A2A37E;')}>
                  {planDorms}
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-weight: 900; font-size: clamp(58px, 6vw, 92px); line-height: 1; color: #E9D7A8;')}>
                  {planArea}
                </p>
                <p style={parseStyle('margin: 10px 0 0; font-weight: 600; font-size: 14px; letter-spacing: .14em; color: #F4EFE7;')}>
                  {planSub}
                </p>
                <ul style={parseStyle('list-style: none; margin: 30px 0 0; padding: 0; display: flex; flex-direction: column; gap: 0;')}>
                  {planFeatures.map((feat, i) => (<React.Fragment key={i}>
                    <li style={parseStyle('display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(162,163,126,.25); font-size: 15px; color: #D8CCC2;')}>
                      <span style={parseStyle('width: 6px; height: 6px; flex: none; background: #A2A37E; transform: rotate(45deg);')} aria-hidden="true">
                      </span>
                      {' '}{feat}
                    </li>
                  </React.Fragment>))}
                </ul>
                <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 10px; margin-top: 34px; background: #A2A37E; color: #241819; text-decoration: none; font-weight: 800; font-size: 14px; letter-spacing: .05em; padding: 16px 30px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('background: #E9D7A8; transform: translateY(-2px);')} href={waLinkPlan} target="_blank" rel="noopener">
                  Tenho interesse nesta planta{' '}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6">
                    </path>
                  </svg>
                </Hoverable>
              </div>
            </div>
          </div>
        </section>
        {/* ===================== DIFERENCIAIS ===================== */}
        <section style={parseStyle('background: #241819; padding: 110px 0;')} id="diferenciais" data-screen-label="Diferenciais">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
              <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
              </span>
              {' '}DIFERENCIAIS
            </p>
            <h2 style={parseStyle('margin: 0 0 50px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
              Pensado em cada{' '}
              <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                detalhe
              </span>
            </h2>
            <div style={parseStyle('display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 4vw, 60px);')}>
              <div style={parseStyle('animation: rvUp 1s cubic-bezier(.2,.7,.2,1) both; animation-timeline: view(); animation-range: entry 0% entry 45%;')}>
                <figure style={parseStyle('position: relative; margin: 0 0 22px; overflow: hidden; height: 220px;')}>
                  <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 30%;')} src="/best-view-residence/a001.jpg" alt="Perspectiva artística da fachada do Best View Residence" />
                  <span style={parseStyle('position: absolute; inset: 0; background: linear-gradient(180deg, rgba(36,24,25,.05) 40%, rgba(36,24,25,.85) 100%);')} aria-hidden="true">
                  </span>
                  <figcaption style={parseStyle('position: absolute; left: 20px; bottom: 16px; font-size: 13px; font-weight: 700; letter-spacing: .3em; color: #E9D7A8;')}>
                    NO SEU APARTAMENTO
                  </figcaption>
                </figure>
                <div style={parseStyle('display: grid; grid-template-columns: 1fr 1fr; gap: 14px;')}>
                  {difApto.map((d, i) => (<React.Fragment key={i}>
                    <Hoverable as="div" baseStyle={parseStyle('border: 1px solid rgba(162,163,126,.28); background: rgba(43,29,30,.6); padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all .2s ease;')} hoverStyle={parseStyle('border-color: rgba(233,215,168,.6); transform: translateY(-2px);')}>
                      <span style={parseStyle('width: 42px; height: 42px; flex: none; border-radius: 50%; border: 1px solid rgba(162,163,126,.5); display: grid; place-items: center; color: #A2A37E;')} aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d={d.icon}>
                          </path>
                        </svg>
                      </span>
                      <span style={parseStyle('font-weight: 700; font-size: 14.5px; color: #F4EFE7;')}>
                        {d.t}
                      </span>
                      <span style={parseStyle('font-size: 13px; line-height: 1.65; color: #C0B2A9;')}>
                        {d.s}
                      </span>
                    </Hoverable>
                  </React.Fragment>))}
                </div>
              </div>
              <div style={parseStyle('animation: rvUp 1s .12s cubic-bezier(.2,.7,.2,1) both; animation-timeline: view(); animation-range: entry 0% entry 45%;')}>
                <figure style={parseStyle('position: relative; margin: 0 0 22px; overflow: hidden; height: 220px;')}>
                  <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 65%;')} src="/best-view-residence/a005.jpg" alt="Perspectiva artística do boulevard central do condomínio" />
                  <span style={parseStyle('position: absolute; inset: 0; background: linear-gradient(180deg, rgba(36,24,25,.05) 40%, rgba(36,24,25,.85) 100%);')} aria-hidden="true">
                  </span>
                  <figcaption style={parseStyle('position: absolute; left: 20px; bottom: 16px; font-size: 13px; font-weight: 700; letter-spacing: .3em; color: #E9D7A8;')}>
                    NO CONDOMÍNIO
                  </figcaption>
                </figure>
                <div style={parseStyle('display: grid; grid-template-columns: 1fr 1fr; gap: 14px;')}>
                  {difCondo.map((d, i) => (<React.Fragment key={i}>
                    <Hoverable as="div" baseStyle={parseStyle('border: 1px solid rgba(162,163,126,.28); background: rgba(43,29,30,.6); padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all .2s ease;')} hoverStyle={parseStyle('border-color: rgba(233,215,168,.6); transform: translateY(-2px);')}>
                      <span style={parseStyle('width: 42px; height: 42px; flex: none; border-radius: 50%; border: 1px solid rgba(162,163,126,.5); display: grid; place-items: center; color: #A2A37E;')} aria-hidden="true">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d={d.icon}>
                          </path>
                        </svg>
                      </span>
                      <span style={parseStyle('font-weight: 700; font-size: 14.5px; color: #F4EFE7;')}>
                        {d.t}
                      </span>
                      <span style={parseStyle('font-size: 13px; line-height: 1.65; color: #C0B2A9;')}>
                        {d.s}
                      </span>
                    </Hoverable>
                  </React.Fragment>))}
                </div>
              </div>
            </div>
            <p style={parseStyle('margin: 26px 0 0; font-size: 11px; letter-spacing: .04em; line-height: 1.7; color: #9b8b83;')}>
              Aquecedor não incluso. Infraestrutura de ar-condicionado e automação preparada; equipamentos e instalação a serem contratados pelo cliente. Nicho em plástico na parede interna do box. *Consulte o Memorial Descritivo.
            </p>
          </div>
        </section>
        {/* ===================== LOCALIZAÇÃO ===================== */}
        <section style={parseStyle('position: relative; overflow: hidden; isolation: isolate; padding: 150px 0;')} id="localizacao" data-screen-label="Localização">
          <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2;')} src="/best-view-residence/a006.jpg" alt="Imagem aérea da região do Swiss Park, em Campinas" />
          <div style={parseStyle('position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(36,24,25,.95) 0%, rgba(36,24,25,.78) 46%, rgba(36,24,25,.25) 100%);')} aria-hidden="true">
          </div>
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('max-width: 560px; animation: rvUp 1s cubic-bezier(.2,.7,.2,1) both; animation-timeline: view(); animation-range: entry 0% entry 40%;')}>
              <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
                <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
                </span>
                {' '}LOCALIZAÇÃO
              </p>
              <h2 style={parseStyle('margin: 0 0 8px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
                Chegamos ao{' '}
                <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                  Swiss Park
                </span>
              </h2>
              <p style={parseStyle('margin: 20px 0 0; font-size: 16px; line-height: 1.85; color: #E4D9CF;')}>
                A F A Oliva traz a sua experiência para um dos melhores bairros de Campinas. O Swiss Park proporciona um estilo de vida com qualidade, bem-estar e sofisticação — localização estratégica, com fácil acesso a todas as conveniências da cidade.
              </p>
              <p style={parseStyle('margin: 16px 0 0; font-size: 16px; line-height: 1.85; color: #E4D9CF;')}>
                Um refúgio perfeito para quem busca equilíbrio entre conforto, modernidade e natureza. Segurança e praticidade para você e sua família.
              </p>
              <div style={parseStyle('margin-top: 34px; border-left: 2px solid #A2A37E; padding: 6px 0 6px 22px;')}>
                <p style={parseStyle('margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .2em; color: #A2A37E;')}>
                  ENDEREÇO
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-size: 18px; font-weight: 600; color: #F4EFE7;')}>
                  Av. Dermival Bernardes Siqueira, 3813
                  <br />
                  Swiss Park — Campinas/SP
                </p>
              </div>
              <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 10px; margin-top: 26px; border: 1px solid rgba(233,215,168,.5); color: #E9D7A8; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: .05em; padding: 15px 28px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('border-color: #E9D7A8; background: rgba(233,215,168,.08);')} href="https://www.google.com/maps/search/?api=1&query=Av.+Dermival+Bernardes+Siqueira,+3813,+Swiss+Park,+Campinas+-+SP" target="_blank" rel="noopener">
                Ver no Google Maps{' '}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8">
                  </path>
                </svg>
              </Hoverable>
            </div>
          </div>
        </section>
        {/* ===================== FICHA TÉCNICA ===================== */}
        <section style={parseStyle('background: #2B1D1E; padding: 110px 0;')} id="ficha" data-screen-label="Ficha técnica">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(340px, 1fr); gap: clamp(36px, 5vw, 80px); align-items: start;')}>
            <div>
              <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
                <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
                </span>
                {' '}FICHA TÉCNICA
              </p>
              <h2 style={parseStyle('margin: 0 0 34px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
                O projeto em{' '}
                <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                  números
                </span>
              </h2>
              <dl style={parseStyle('margin: 0; display: flex; flex-direction: column;')}>
                {ficha.map((row, i) => (<React.Fragment key={i}>
                  <div style={parseStyle('display: grid; grid-template-columns: 190px 1fr; gap: 18px; padding: 15px 0; border-bottom: 1px solid rgba(162,163,126,.22);')}>
                    <dt style={parseStyle('margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .14em; color: #A2A37E; padding-top: 2px;')}>
                      {row.k}
                    </dt>
                    <dd style={parseStyle('margin: 0; font-size: 14.5px; line-height: 1.65; color: #E4D9CF;')}>
                      {row.v}
                    </dd>
                  </div>
                </React.Fragment>))}
              </dl>
            </div>
            <figure style={parseStyle('margin: 0; position: sticky; top: 110px; animation: rvIn 1.2s ease both; animation-timeline: view(); animation-range: entry 0% entry 45%;')}>
              <img style={parseStyle('width: 100%; display: block; box-shadow: 0 40px 80px -30px rgba(0,0,0,.55);')} src="/best-view-residence/a004.jpg" alt="Ilustração artística da implantação do Best View Residence: 4 torres, lazer central e acesso pela Av. Dermival Bernardes Siqueira" />
              <figcaption style={parseStyle('margin-top: 10px; font-size: 11px; letter-spacing: .08em; color: #9b8b83;')}>
                Ilustração artística da implantação
              </figcaption>
            </figure>
          </div>
        </section>
        {/* ===================== F A OLIVA ===================== */}
        <section style={parseStyle('position: relative; overflow: hidden; isolation: isolate; padding: 130px 0;')} id="construtora" data-screen-label="Construtora">
          <img style={parseStyle('position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2;')} src="/best-view-residence/a003.jpg" alt="Perspectiva artística da fachada do Best View Residence vista da rua" />
          <div style={parseStyle('position: absolute; inset: 0; z-index: -1; background: rgba(30,20,21,.9);')} aria-hidden="true">
          </div>
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('max-width: 640px;')}>
              <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
                <span style={parseStyle('display: inline-block; width: 44px; height: 1px; background: #A2A37E;')} aria-hidden="true">
                </span>
                {' '}QUEM REALIZA
              </p>
              <h2 style={parseStyle('margin: 0 0 8px; font-weight: 800; font-size: clamp(32px, 3.6vw, 50px); line-height: 1.08;')}>
                F A Oliva, solidez{' '}
                <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                  desde 1955
                </span>
              </h2>
              <p style={parseStyle('margin: 20px 0 0; font-size: 16px; line-height: 1.85; color: #D8CCC2;')}>
                A F A Oliva é uma empresa de Jundiaí (SP), conhecida por seu padrão de qualidade. Fundada em 1955, nasceu do propósito de construir moradias de qualidade — e desde então participa da realização do sonho do imóvel próprio, com qualidade e pontualidade. A construção é realizada pela Urbitec Construções, seu braço construtivo.
              </p>
            </div>
            <div style={parseStyle('margin-top: 56px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 26px;')} data-counters="true">
              <div style={parseStyle('border-top: 2px solid #A2A37E; padding-top: 18px;')}>
                <p style={parseStyle('margin: 0; font-weight: 900; font-size: clamp(38px, 4vw, 56px); color: #E9D7A8; font-variant-numeric: tabular-nums;')}>
                  +{cUnidades} mil
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-size: 12px; font-weight: 600; letter-spacing: .18em; color: #CFC5A9;')}>
                  UNIDADES ENTREGUES
                </p>
              </div>
              <div style={parseStyle('border-top: 2px solid #A2A37E; padding-top: 18px;')}>
                <p style={parseStyle('margin: 0; font-weight: 900; font-size: clamp(38px, 4vw, 56px); color: #E9D7A8; font-variant-numeric: tabular-nums;')}>
                  +{cTorres}
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-size: 12px; font-weight: 600; letter-spacing: .18em; color: #CFC5A9;')}>
                  TORRES CONSTRUÍDAS
                </p>
              </div>
              <div style={parseStyle('border-top: 2px solid #A2A37E; padding-top: 18px;')}>
                <p style={parseStyle('margin: 0; font-weight: 900; font-size: clamp(38px, 4vw, 56px); color: #E9D7A8; font-variant-numeric: tabular-nums;')}>
                  +{cEmpreend}
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-size: 12px; font-weight: 600; letter-spacing: .18em; color: #CFC5A9;')}>
                  EMPREENDIMENTOS ENTREGUES
                </p>
              </div>
              <div style={parseStyle('border-top: 2px solid #A2A37E; padding-top: 18px;')}>
                <p style={parseStyle('margin: 0; font-weight: 900; font-size: clamp(38px, 4vw, 56px); color: #E9D7A8; font-variant-numeric: tabular-nums;')}>
                  +{cM2} mi
                </p>
                <p style={parseStyle('margin: 6px 0 0; font-size: 12px; font-weight: 600; letter-spacing: .18em; color: #CFC5A9;')}>
                  DE M² CONSTRUÍDOS
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ===================== FAQ ===================== */}
        <section style={parseStyle('background: #241819; padding: 110px 0;')} id="faq" data-screen-label="FAQ">
          <div style={parseStyle('max-width: 880px; margin: 0 auto; padding: 0 28px;')}>
            <p style={parseStyle('margin: 0 0 14px; display: flex; align-items: center; justify-content: center; gap: 14px; font-size: 12px; font-weight: 600; letter-spacing: .42em; color: #A2A37E;')}>
              PERGUNTAS FREQUENTES
            </p>
            <h2 style={parseStyle('margin: 0 0 46px; font-weight: 800; font-size: clamp(30px, 3.4vw, 46px); line-height: 1.1; text-align: center;')}>
              Tudo sobre o{' '}
              <span style={parseStyle("font-family: 'Style Script', cursive; font-weight: 400; color: #E9D7A8; font-size: 1.28em;")}>
                Best View
              </span>
            </h2>
            <div style={parseStyle('display: flex; flex-direction: column; gap: 12px;')}>
              {faqs.map((f, i) => (<React.Fragment key={i}>
                <details style={parseStyle('border: 1px solid rgba(162,163,126,.28); background: #2B1D1E; padding: 0 26px;')}>
                  <summary style={parseStyle('cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 0; font-weight: 700; font-size: 16px; color: #F4EFE7;')}>
                    {f.q}{' '}
                    <span style={parseStyle('flex: none; color: #E9D7A8; font-size: 22px; font-weight: 300; transition: transform .2s ease;')} className="faq-chevron" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p style={parseStyle('margin: 0; padding: 0 0 24px; font-size: 15px; line-height: 1.85; color: #C9BCB2;')}>
                    {f.a}
                  </p>
                </details>
              </React.Fragment>))}
            </div>
          </div>
        </section>
        {/* ===================== CONTATO ===================== */}
        <section style={parseStyle('background: linear-gradient(180deg, #2B1D1E 0%, #241819 100%); padding: 110px 0 120px;')} id="contato" data-screen-label="Contato">
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(340px, 1fr); gap: clamp(36px, 5vw, 80px); align-items: center;')}>
            <div>
              <p style={parseStyle("margin: 0 0 6px; font-family: 'Style Script', cursive; font-size: clamp(30px, 3.4vw, 46px); color: #E9D7A8;")}>
                Permita-se novos horizontes
              </p>
              <h2 style={parseStyle('margin: 0; font-weight: 800; font-size: clamp(32px, 3.8vw, 52px); line-height: 1.08;')}>
                Fale com a Lotus Brokers
              </h2>
              <p style={parseStyle('margin: 20px 0 0; font-size: 16px; line-height: 1.85; color: #D8CCC2;')}>
                Deixe seus dados e um consultor da Lotus Brokers entrará em contato para apresentar o Best View Residence — plantas, disponibilidade e condições, sem compromisso.
              </p>
              <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 12px; margin-top: 30px; color: #E9D7A8; text-decoration: none; font-weight: 700; font-size: 17px; letter-spacing: .02em; border-bottom: 1px solid rgba(233,215,168,.5); padding-bottom: 6px; transition: all .18s ease;')} hoverStyle={parseStyle('border-color: #E9D7A8;')} href={waLink} target="_blank" rel="noopener">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4Z">
                  </path>
                </svg>
                {' '}+55 11 92614-3393{' '}
              </Hoverable>
            </div>
            {formPending && (<>
              <form style={parseStyle('background: #F4EFE7; color: #362627; padding: clamp(28px, 4vw, 46px); display: flex; flex-direction: column; gap: 18px; box-shadow: 0 50px 100px -40px rgba(0,0,0,.7);')} onSubmit={enviarForm}>
                <p style={parseStyle('margin: 0 0 4px; font-size: 12px; font-weight: 700; letter-spacing: .3em; color: #8a8a63;')}>
                  ATENDIMENTO EXCLUSIVO
                </p>
                <label style={parseStyle('display: flex; flex-direction: column; gap: 7px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #362627;')}>
                  NOME
                  <input style={parseStyle('font-family: Montserrat, sans-serif; font-size: 15px; padding: 14px 16px; border: 1px solid #c9bfae; background: #fff; color: #362627; outline-color: #A2A37E;')} type="text" name="nome" required autoComplete="name" value={fNome} onChange={setNomeEv} placeholder="Seu nome completo" />
                </label>
                <label style={parseStyle('display: flex; flex-direction: column; gap: 7px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #362627;')}>
                  E-MAIL
                  <input style={parseStyle('font-family: Montserrat, sans-serif; font-size: 15px; padding: 14px 16px; border: 1px solid #c9bfae; background: #fff; color: #362627; outline-color: #A2A37E;')} type="email" name="email" required autoComplete="email" value={fEmail} onChange={setEmailEv} placeholder="voce@email.com" />
                </label>
                <label style={parseStyle('display: flex; flex-direction: column; gap: 7px; font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #362627;')}>
                  TELEFONE / WHATSAPP
                  <input style={parseStyle('font-family: Montserrat, sans-serif; font-size: 15px; padding: 14px 16px; border: 1px solid #c9bfae; background: #fff; color: #362627; outline-color: #A2A37E;')} type="tel" name="telefone" required autoComplete="tel" value={fFone} onChange={setFoneEv} placeholder="(11) 90000-0000" />
                </label>
                <Hoverable as="button" baseStyle={parseStyle('margin-top: 8px; font-family: Montserrat, sans-serif; background: #362627; color: #E9D7A8; border: none; cursor: pointer; font-weight: 800; font-size: 14px; letter-spacing: .08em; padding: 18px 20px; border-radius: 999px; transition: all .18s ease;')} hoverStyle={parseStyle('background: #241819; transform: translateY(-1px);')} type="submit">
                  QUERO SABER MAIS
                </Hoverable>
                <p style={parseStyle('margin: 0; font-size: 11px; line-height: 1.6; color: #8d7f76;')}>
                  Ao enviar, você será direcionado ao WhatsApp da Lotus Brokers com seus dados preenchidos. Nada é publicado ou compartilhado.
                </p>
              </form>
            </>)}
            {formSent && (<>
              <div style={parseStyle('background: #F4EFE7; color: #362627; padding: clamp(28px, 4vw, 46px); display: flex; flex-direction: column; align-items: flex-start; gap: 16px; box-shadow: 0 50px 100px -40px rgba(0,0,0,.7);')}>
                <span style={parseStyle('width: 54px; height: 54px; border-radius: 50%; background: #A2A37E; color: #241819; display: grid; place-items: center;')} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5 9.5 18 20 6.5">
                    </path>
                  </svg>
                </span>
                <h3 style={parseStyle('margin: 0; font-weight: 800; font-size: 26px;')}>
                  Recebemos seus dados, {fNome}.
                </h3>
                <p style={parseStyle('margin: 0; font-size: 15px; line-height: 1.8; color: #6b5a52;')}>
                  Abrimos uma conversa no WhatsApp da Lotus Brokers com a sua mensagem. Se a janela não abriu, toque no botão abaixo.
                </p>
                <Hoverable as="a" baseStyle={parseStyle('display: inline-flex; align-items: center; gap: 10px; background: #362627; color: #E9D7A8; text-decoration: none; font-weight: 800; font-size: 14px; letter-spacing: .06em; padding: 16px 28px; border-radius: 999px;')} hoverStyle={parseStyle('background: #241819;')} href={waLinkForm} target="_blank" rel="noopener">
                  Abrir WhatsApp
                </Hoverable>
              </div>
            </>)}
          </div>
        </section>
        {/* ===================== FOOTER ===================== */}
        <footer style={parseStyle('background: #1C1213; padding: 70px 0 40px; border-top: 1px solid rgba(162,163,126,.2);')}>
          <div style={parseStyle('max-width: 1240px; margin: 0 auto; padding: 0 28px;')}>
            <div style={parseStyle('display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; align-items: flex-start;')}>
              <div>
                <p style={parseStyle('margin: 0; display: flex; flex-direction: column; line-height: 1.1;')}>
                  <span style={parseStyle('font-weight: 300; font-size: 26px; letter-spacing: .34em; color: #F4EFE7;')}>
                    LOTUS
                  </span>
                  <span style={parseStyle('font-weight: 600; font-size: 10px; letter-spacing: .46em; color: #A2A37E;')}>
                    BROKERS
                  </span>
                </p>
                <p style={parseStyle('margin: 14px 0 0; font-size: 13px; color: #9b8b83;')}>
                  Negócios imobiliários · Atendimento exclusivo Best View Residence
                </p>
                <Hoverable as="a" baseStyle={parseStyle('display: inline-block; margin-top: 10px; color: #E9D7A8; text-decoration: none; font-weight: 600; font-size: 14px;')} hoverStyle={parseStyle('color: #F4EFE7;')} href={waLink} target="_blank" rel="noopener">
                  WhatsApp +55 11 92614-3393
                </Hoverable>
              </div>
              <div style={parseStyle('display: flex; gap: 60px;')}>
                <div>
                  <p style={parseStyle('margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .24em; color: #A2A37E;')}>
                    REALIZAÇÃO E CONSTRUÇÃO
                  </p>
                  <p style={parseStyle('margin: 0; font-size: 14px; color: #D8CCC2; line-height: 1.8;')}>
                    F A Oliva — desde 1955
                    <br />
                    Urbitec Construções
                  </p>
                </div>
                <div>
                  <p style={parseStyle('margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .24em; color: #A2A37E;')}>
                    ENDEREÇO
                  </p>
                  <p style={parseStyle('margin: 0; font-size: 14px; color: #D8CCC2; line-height: 1.8;')}>
                    Av. Dermival Bernardes Siqueira, 3813
                    <br />
                    Swiss Park — Campinas/SP
                  </p>
                </div>
              </div>
            </div>
            <p style={parseStyle('margin: 50px 0 0; padding-top: 26px; border-top: 1px solid rgba(162,163,126,.15); font-size: 10.5px; line-height: 1.8; color: #7d6f67; text-wrap: pretty;')}>
              Projeto protocolado na Prefeitura do Município de Campinas em 02/05/2023, sob o número 2019/11/17074. Todas as imagens deste material são meramente ilustrativas e estão sujeitas a adequações. As perspectivas retratam o projeto paisagístico com vegetação em fase adulta, estágio que será alcançado com a ação do tempo. Material para pesquisa de mercado. A comercialização será realizada após o registro da incorporação no Registro de Imóveis. Intermediação: Lotus Brokers — Negócios imobiliários.
            </p>
          </div>
        </footer>
        {/* ===================== WHATSAPP FLUTUANTE ===================== */}
        {showFloat && (<>
          <Hoverable as="a" baseStyle={parseStyle('position: fixed; right: 26px; bottom: 26px; z-index: 70; width: 60px; height: 60px; border-radius: 50%; background: #A2A37E; color: #241819; display: grid; place-items: center; box-shadow: 0 14px 34px -8px rgba(0,0,0,.6); animation: pulseRing 2.6s ease-out infinite; transition: transform .18s ease;')} hoverStyle={parseStyle('transform: scale(1.07); background: #E9D7A8;')} href={waLink} target="_blank" rel="noopener" aria-label="Falar com a Lotus Brokers no WhatsApp">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.7.9-.5 1.2.7 1.2 1.6 2 2.8 2.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4Z">
              </path>
            </svg>
          </Hoverable>
        </>)}
        {/* ===================== LIGHTBOX ===================== */}
        {lightboxOpen && (<>
          <div style={parseStyle('position: fixed; inset: 0; z-index: 80; background: rgba(20,13,14,.94); display: grid; place-items: center; padding: 40px; animation: rvIn .25s ease both; cursor: zoom-out;')} role="dialog" aria-modal="true" aria-label={lightboxTitulo} onClick={fecharLightbox}>
            <figure style={parseStyle('margin: 0; max-width: min(1100px, 92vw);')}>
              <img style={parseStyle('width: 100%; max-height: 78vh; object-fit: contain; display: block; box-shadow: 0 60px 120px -40px rgba(0,0,0,.8); background: {{ lightboxBg }};')} src={lightboxSrc} alt={lightboxAlt} />
              <figcaption style={parseStyle('display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 16px;')}>
                <span style={parseStyle('font-weight: 700; font-size: 17px; color: #F4EFE7;')}>
                  {lightboxTitulo}
                </span>
                <span style={parseStyle('font-size: 11px; letter-spacing: .08em; color: #9b8b83;')}>
                  {lightboxSub} · toque para fechar
                </span>
              </figcaption>
            </figure>
          </div>
        </>)}
      </div>
    </>
  );
}
