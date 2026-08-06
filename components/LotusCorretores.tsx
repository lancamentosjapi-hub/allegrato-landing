'use client';
import { footerLegalLine } from '@/lib/site';

/**
 * LotusCorretores — porte 1:1 de lotus-corretores/index.html (mecanismo dc-runtime) para React.
 * Visual e comportamento idênticos ao estático. Dados hard-coded (viram fetch numa fase futura).
 *
 * Convenções de porte:
 *  - style="css literal"  -> style={parseStyle('css literal')}
 *  - style-hover="css"    -> <Hoverable baseStyle={...} hoverStyle={parseStyle('css')}>
 *  - sc-for / sc-if       -> .map() / {cond && ...}
 *  - image-slot           -> <ImageSlot> (gradiente de fundo; sem src => só gradiente)
 *  - carrossel (setInterval 5s), filtros, toggle perfil, form, FAQ -> useState/useEffect
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
  // Uma foto que responde 404 (photo_url apontando para arquivo removido, ou
  // override local antes do arquivo subir) deixava um <img> quebrado no lugar
  // do avatar. Marcar o erro faz cair no mesmo fallback de iniciais do caso
  // "sem src".
  //
  // Guardamos QUAL src falhou, não um booleano: o painel de perfil reaproveita
  // a mesma instância de ImageSlot ao trocar de corretor, e um booleano ficaria
  // preso em `true`, escondendo a foto boa do corretor seguinte.
  const [srcComErro, setSrcComErro] = useState<string | null>(null);
  const falhou = !!src && srcComErro === src;
  const fallbackInitials = !src || falhou ? initialsOf(initials) : '';
  return (
    <div
      id={id}
      style={{
        display: 'block',
        background: 'linear-gradient(135deg,#1d3a2c,#3f6249)',
        ...style,
      }}
    >
      {src && !falhou ? (
        <img
          src={src}
          alt={alt}
          onError={() => setSrcComErro(src)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // As fotos são 4:5 (medida do painel de perfil), mas o card da
            // listagem é QUADRADO. Com o padrão `center`, o cover comia 12,5%
            // do topo e decepava a cabeça de quem tem enquadramento fechado.
            // Ancorar no topo joga todo o recorte para a base — que é peito,
            // não rosto — e alinha as cabeças na mesma altura entre os cards.
            objectPosition: 'center top',
          }}
        />
      ) : (
        fallbackInitials && (
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
              fontWeight: 400,
              fontSize: 'clamp(15px, 42%, 40px)',
              letterSpacing: '.02em',
            }}
          >
            {fallbackInitials}
          </span>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dados estáticos (valores exatos do fonte)                          */
/* ------------------------------------------------------------------ */

const WHATSAPP_DEFAULT = '5511926143393';
const GAL_LEN = 6;

type Broker = {
  id: string;
  name: string;
  first: string;
  squad: string;
  area: string;
  city: string;
  creci: string;
  rating: string;
  reviews: number;
  active: number;
  founder?: boolean;
  slot: string;
  /** Foto real (portal_brokers.photo_url). Sem foto => avatar de iniciais. */
  photoUrl?: string | null;
};

// Dados demo — usados só quando a página é renderizada sem brokers do banco
// (fallback de compat). Em produção os corretores vêm de getBrokers().
const BROKERS_FALLBACK: Broker[] = [
  { id: 'erick', name: 'Erick Santos', first: 'Erick', squad: 'Alto Padrão', area: 'Jundiaí', city: 'Jundiaí', creci: 'CRECI 000000-F', rating: '5,0', reviews: 64, active: 12, founder: true, slot: 'c-erick' },
  { id: 'marina', name: 'Marina Tavares', first: 'Marina', squad: 'Alto Padrão', area: 'Eloy Chaves', city: 'Jundiaí', creci: 'CRECI 000001-F', rating: '5,0', reviews: 48, active: 9, slot: 'c-marina' },
  { id: 'rafael', name: 'Rafael Nunes', first: 'Rafael', squad: 'Lançamentos', area: 'Itupeva', city: 'Itupeva', creci: 'CRECI 000002-F', rating: '4,9', reviews: 37, active: 15, slot: 'c-rafael' },
  { id: 'juliana', name: 'Juliana Prado', first: 'Juliana', squad: 'Popular', area: 'Medeiros', city: 'Jundiaí', creci: 'CRECI 000003-F', rating: '4,9', reviews: 52, active: 18, slot: 'c-juliana' },
  { id: 'andre', name: 'André Salem', first: 'André', squad: 'Comercial', area: 'Centro', city: 'Jundiaí', creci: 'CRECI 000004-F', rating: '4,8', reviews: 29, active: 11, slot: 'c-andre' },
  { id: 'beatriz', name: 'Beatriz Lima', first: 'Beatriz', squad: 'Lançamentos', area: 'Vinhedo', city: 'Vinhedo', creci: 'CRECI 000005-F', rating: '5,0', reviews: 33, active: 14, slot: 'c-beatriz' },
  { id: 'thiago', name: 'Thiago Berto', first: 'Thiago', squad: 'Alto Padrão', area: 'Malota', city: 'Jundiaí', creci: 'CRECI 000006-F', rating: '4,9', reviews: 41, active: 8, slot: 'c-thiago' },
  { id: 'carol', name: 'Carolina Reis', first: 'Carolina', squad: 'Popular', area: 'Anhangabaú', city: 'Jundiaí', creci: 'CRECI 000007-F', rating: '4,8', reviews: 45, active: 16, slot: 'c-carol' },
];

// Campos que ainda não existem em tenant_brokers ficam com placeholder até
// virem do banco (squad/area/creci/rating/reviews/active). Ver decisão de
// escopo: nome+foto reais, resto placeholder.
// CRECI real (só o número no banco) -> "CRECI <n>". Sem valor => placeholder.
function formatCreci(creci: string | null): string {
  const c = (creci ?? '').trim();
  if (!c) return 'CRECI —';
  return /creci/i.test(c) ? c : 'CRECI ' + c;
}

// "1 imóvel ativo" / "N imóveis ativos".
function imoveisAtivosLabel(n: number): string {
  return n === 1 ? '1 imóvel ativo' : `${n} imóveis ativos`;
}

function realToBroker(b: {
  id: string;
  name: string;
  photoUrl: string | null;
  creci: string | null;
  imoveisAtivos: number;
}): Broker {
  return {
    id: b.id,
    name: b.name,
    first: b.name.trim().split(/\s+/)[0] || b.name,
    squad: 'Especialista',
    area: 'Jundiaí e Itupeva',
    city: 'Jundiaí',
    creci: formatCreci(b.creci),
    rating: '5,0',
    reviews: 0,
    active: b.imoveisAtivos,
    slot: 'c-' + b.id,
    // O banco tem prioridade: o override local só entra quando photo_url é
    // nulo. Assim, publicar a foto no dashboard desativa o override sozinho.
    photoUrl: b.photoUrl ?? conteudoRealDe(b.name)?.foto ?? null,
  };
}

const galleryData = [
  { slot: 'gal-1', tag: 'Equipe', label: 'Nosso time completo, 2026' },
  { slot: 'gal-2', tag: 'Premiação', label: 'Top imobiliária da região' },
  { slot: 'gal-3', tag: 'Bastidores', label: 'Treinamento semanal de especialistas' },
  { slot: 'gal-4', tag: 'Evento', label: 'Convenção anual Lotus' },
  { slot: 'gal-5', tag: 'Conquista', label: 'Recorde de vendas no trimestre' },
  { slot: 'gal-6', tag: 'Comunidade', label: 'Ação social em Jundiaí' },
];

/**
 * Conteúdo REAL por corretor, enquanto o banco não tem onde guardá-lo.
 *
 * A view `portal_brokers` expõe só id/name/photo_url/creci/imoveis_ativos —
 * não há campo de bio. E `photo_url` vem nulo para quase todos. Estes overrides
 * preenchem essas lacunas SEM competir com o banco: quando o dashboard publicar
 * a foto real, `photo_url` passa a existir e vence o override (ver realToBroker).
 * Para migrar de vez, basta criar as colunas na view e apagar este bloco.
 *
 * Chave = nome em minúsculas, com acento. O id é UUID do Supabase e muda entre
 * ambientes, então não serve como chave estável em código.
 */
/**
 * Um bloco da bio. `string` é um parágrafo — é o caso da grande maioria, e por
 * isso continua sendo a forma mais curta de escrever. A variante em objeto
 * existe para currículos com seções (um subtítulo e, opcionalmente, uma lista);
 * sem ela, uma lista de competências viraria um parágrafo único ilegível.
 */
type BlocoBio = string | { titulo: string; itens?: string[] };

const CONTEUDO_REAL: Record<string, { bio?: BlocoBio[]; foto?: string }> = {
  'gabriele fávaro': {
    foto: '/corretores/gabriele-favaro.jpg',
    bio: [
      'Atuo no mercado imobiliário de alto padrão, assessorando clientes na compra, venda e intermediação de imóveis com uma abordagem estratégica, personalizada e pautada pela confiança.',
      'Acredito que um imóvel representa muito mais do que um patrimônio. Ele marca momentos importantes, acompanha novas fases da vida e materializa projetos que merecem ser conduzidos com segurança, sensibilidade e responsabilidade. Por isso, procuro compreender profundamente as necessidades e os objetivos de cada cliente, para que cada decisão seja tomada com tranquilidade e confiança.',
      'Além da minha atuação como corretora de imóveis, sou advogada, o que agrega uma visão jurídica e estratégica a todo o processo de negociação. Essa combinação me permite oferecer uma assessoria completa, unindo conhecimento técnico, segurança e atenção aos detalhes em cada etapa.',
      'Mais do que intermediar imóveis, meu propósito é construir relacionamentos sólidos e duradouros. Quero ser a profissional em quem meus clientes e suas famílias possam confiar hoje e nos próximos projetos de vida. É essa confiança, construída com ética, dedicação e transparência, que considero o maior patrimônio de uma carreira.',
    ],
  },
  // Sem acento em "Andre": a chave tem de bater com o nome como está no banco.
  'andre marcondes': {
    foto: '/corretores/andre-marcondes.jpg',
    bio: [
      'Coordenador de Equipes da Japi Lançamentos, ANDRÉ atua há sete anos no mercado imobiliário de Jundiaí e região, após 20 anos na TOTVS, onde analisou processos e desenhou soluções de ERP para empresas de diversos portes. É formado em Comunicação e em Gestão de Negócios, foi professor universitário por cinco anos e possui formação complementar em negociação, pelo Program on Negotiation (PON), da Harvard Law School. Sua atuação vai além da apresentação do empreendimento: passa pela análise do contrato, pelo enquadramento de financiamento e pelo impacto real da compra no orçamento do cliente.',
      '"Meu trabalho não termina quando o cliente escolhe o imóvel. Ele começa quando a gente senta para entender o contrato e o que aquela decisão significa no orçamento dele."',
    ],
  },
  // No banco o nome tem dois espaços entre "Alex" e "Xavier"; normalizarNome
  // colapsa isso, então a chave fica com espaço simples.
  'alex xavier da silva': {
    foto: '/corretores/alex-xavier.jpg',
    bio: [
      'Corretor de Imóveis | Gestor Comercial | Especialista em Crédito Imobiliário | Consultor de Ativos Imobiliários',
      'Profissional com mais de 16 anos de experiência no mercado imobiliário, atuando de forma estratégica nas áreas de intermediação de imóveis, gestão comercial, financiamento habitacional, desenvolvimento de equipes, crédito imobiliário e ativos provenientes de leilões judiciais e extrajudiciais.',
      'Iniciei minha trajetória no mercado em 2010 como corretor de imóveis de terceiros, evoluindo posteriormente para cargos de liderança como gerente comercial, responsável pela gestão de equipes, desenvolvimento de estratégias de vendas, treinamento de profissionais e expansão comercial.',
      'Entre 2013 e 2021 fui proprietário de duas imobiliárias na Zona Sul de São Paulo, conduzindo todas as áreas do negócio, incluindo gestão administrativa, comercial, captação de imóveis, prospecção de clientes, negociação, marketing, contratação e desenvolvimento de equipes de vendas.',
      'Entre 2018 e 2023 atuei como correspondente bancário, trabalhando com operações de crédito imobiliário junto ao Bradesco, Itaú e Caixa Econômica Federal. Possuo certificações CCA 300 e FEBRABAN 300, com ampla experiência em análise de crédito, enquadramento financeiro, financiamento habitacional e estruturação de operações imobiliárias.',
      'Posteriormente, integrei a equipe comercial da construtora Plano & Plano, atuando como Gerente de Vendas no segmento Minha Casa Minha Vida, onde me especializei no programa habitacional em todas as suas faixas de atendimento.',
      'Minha atuação envolveu a gestão de equipes comerciais, recrutamento e seleção de corretores, onboarding de novos profissionais, treinamentos técnicos e comerciais, reciclagem de equipes, acompanhamento de indicadores de desempenho (KPIs), desenvolvimento de dashboards gerenciais, geração e gestão de leads, planejamento estratégico e suporte integral às operações de vendas.',
      'Atualmente atuo como corretor de imóveis autônomo e também presto consultoria especializada para uma empresa portuguesa voltada ao mercado de investimentos imobiliários, sendo responsável por todas as etapas do processo de aquisição de imóveis em leilão.',
      'Nesse trabalho realizo estudos completos de viabilidade econômica, análise documental e jurídica, levantamento de custos de aquisição, regularização e reforma, avaliação de riscos, estimativa de retorno sobre investimento (ROI), condução dos processos de desocupação e regularização dos imóveis, além do planejamento comercial e da venda final dos ativos.',
      'Minha experiência reúne uma visão completa do mercado imobiliário, contemplando desde a prospecção e comercialização de imóveis até operações estruturadas de investimento, crédito imobiliário, gestão de equipes e análise financeira, permitindo atuar tanto no segmento residencial quanto em operações de maior complexidade envolvendo ativos imobiliários.',
      {
        titulo: 'Principais competências',
        itens: [
          'Intermediação e comercialização de imóveis',
          'Especialista em Crédito Imobiliário',
          'Especialista no Programa Minha Casa Minha Vida',
          'Gestão e formação de equipes comerciais',
          'Liderança de alta performance',
          'Recrutamento, seleção e onboarding de corretores',
          'Desenvolvimento de treinamentos comerciais e técnicos',
          'Planejamento estratégico de vendas',
          'Gestão de indicadores (KPIs) e dashboards',
          'Marketing imobiliário e geração de leads',
          'Análise de crédito e financiamento habitacional',
          'Estudo de viabilidade econômica de investimentos imobiliários',
          'Avaliação de ativos provenientes de leilões',
          'Levantamento de custos, análise de riscos e retorno sobre investimento (ROI)',
          'Regularização e desocupação de imóveis',
          'Negociação, relacionamento com clientes e fechamento de operações',
        ],
      },
      { titulo: 'Perfil Profissional' },
      'Profissional com perfil estratégico, visão de negócios e forte orientação para resultados, combinando experiência em vendas, gestão comercial, crédito imobiliário e investimentos em ativos imobiliários. Possuo sólida capacidade de estruturar operações, desenvolver equipes de alta performance, identificar oportunidades de mercado e conduzir negociações complexas, sempre com foco na geração de valor para clientes, parceiros e empresas.',
    ],
  },
  'fernanda souza': {
    foto: '/corretores/fernanda-souza.jpg',
    bio: [
      'Muito prazer, eu sou Fernanda Emília. 💙',
      'Sou formada em Direito e Gestão Comercial e encontrei no mercado imobiliário a oportunidade de unir estratégia, relacionamento e propósito: ajudar pessoas e investidores a fazerem escolhas seguras e inteligentes.',
      '❤️ Sou mãe da Duda e da Sofia, minhas maiores inspirações. É na minha família e na minha fé em Deus que encontro a força para enfrentar desafios e celebrar cada conquista.',
      'No dia a dia, sou conhecida por ser uma pessoa calma, analítica e focada, características que me permitem conduzir cada negociação com segurança, transparência e atenção aos detalhes.',
      'Também sou apaixonada por criar soluções. Gosto de enxergar oportunidades onde muitos enxergam apenas dificuldades, sempre buscando o melhor caminho para cada cliente.',
      '✈️ Fora do trabalho, amo viajar, conhecer novas culturas e me aventurar na cozinha. Meu lado "MasterChef" aparece sempre que tenho uma boa receita e pessoas especiais para reunir.',
      'Mais do que vender imóveis, minha missão é acompanhar sonhos, construir confiança e ajudar famílias e investidores a conquistarem patrimônio com segurança e valorização.',
      'Se você procura alguém que caminhe ao seu lado em cada etapa da compra do seu imóvel, será um prazer fazer parte dessa conquista.',
      '📍 Jundiaí e região.',
    ],
  },
  // Sem acento em "Flavia": é como o nome está gravado no banco.
  'flavia ceolin': {
    foto: '/corretores/flavia-ceolin.jpg',
    bio: [
      'Sou Flávia Ceolin, tenho 36 anos e sou corretora de imóveis em Jundiaí. Após construir uma carreira sólida de 15 anos no setor corporativo, decidi seguir minha paixão pelo mercado imobiliário, me especializei em lançamentos e tenho como objetivo ajudar famílias a conquistarem o sonho da casa própria.',
      'Meu compromisso é tornar todo o processo de compra mais seguro e tranquilo, orientando desde a escolha do imóvel até a conquista das chaves, sempre com dedicação, ética e confiança.',
    ],
  },
  'fábio gonçalves': {
    // Recorte com fundo transparente (.webp, alpha preservado): aparece sobre
    // o gradiente verde do ImageSlot, diferente das demais fotos, que trazem
    // fundo próprio. Foi assim que a foto veio.
    foto: '/corretores/fabio-goncalves.webp',
    bio: [
      'Sou consultor imobiliário especializado em conectar pessoas às melhores oportunidades do mercado, oferecendo um atendimento consultivo, transparente e focado em resultados.',
      'Minha atuação é baseada no profundo estudo do mercado imobiliário, planejamento financeiro, análise comparativa de mercado (ACM), estratégias de negociação, financiamento imobiliário e valorização patrimonial, permitindo orientar meus clientes com segurança em cada etapa da compra, venda ou investimento.',
      'Tenho como principal área de atuação a cidade de Jundiaí, acompanhando de perto seus condomínios, lançamentos, tendências de valorização e oportunidades de investimento.',
      'Acredito que um bom consultor imobiliário vai muito além de apresentar imóveis. Meu compromisso é compreender os objetivos de cada cliente, identificar as melhores oportunidades e conduzir todo o processo com ética, transparência, agilidade e responsabilidade.',
    ],
  },
  // No banco o nome vem com espaço sobrando no fim; normalizarNome faz o trim.
  'reginaldo barbosa faleiros': {
    foto: '/corretores/reginaldo-faleiros.jpg',
  },
  'humberto martinez': {
    foto: '/corretores/humberto-martinez.jpg',
    bio: [
      'Sou Humberto Martinez, corretor de imóveis em Jundiaí – SP, especializado em lançamentos e empreendimentos de médio e alto padrão. Acredito que comprar um imóvel é uma das decisões mais importantes da vida e, por isso, meu compromisso é oferecer um atendimento consultivo, exclusivo e totalmente personalizado em cada etapa dessa jornada.',
      'Com profundo conhecimento do mercado imobiliário da região, atuo de forma estratégica para apresentar as melhores oportunidades, sempre alinhadas ao perfil, aos objetivos e ao estilo de vida de cada cliente. Mais do que intermediar negociações, meu propósito é proporcionar segurança, transparência e tranquilidade para que cada decisão seja tomada com confiança.',
      'Entendo que um imóvel representa muito mais do que um patrimônio. Ele traduz conquistas, sonhos, qualidade de vida e legado. Por isso, faço questão de construir relacionamentos sólidos, baseados na credibilidade, na proximidade e na atenção aos detalhes, oferecendo uma experiência diferenciada do primeiro contato à entrega das chaves.',
      'Meu trabalho é guiado pela excelência, pela ética e pelo compromisso em superar expectativas. Afinal, acredito que grandes negócios começam com confiança e são construídos por meio de um atendimento que valoriza cada cliente de forma única.',
    ],
  },
  // Ainda não existe no Supabase: entra pela lista EXTRAS de lib/brokers.ts.
  'lara matos': {
    foto: '/corretores/lara-matos.jpg',
    bio: [
      'Meu nome é Lara, tenho 31 anos, sou formada em Matemática e, por mais de dez anos, atuei como gerente na área financeira. Sou natural de Goiânia (GO), morei oito anos no Tocantins e hoje vivo em Jundiaí (SP).',
      'Escolhi a profissão de corretora de imóveis porque acredito que um imóvel representa muito mais do que um investimento: é o lugar onde sonhos, histórias e famílias ganham um lar. Meu propósito é ajudar cada cliente a encontrar esse lugar especial, seja na conquista do primeiro imóvel ou na construção do seu patrimônio, sempre com dedicação, transparência e cuidado.',
    ],
  },
  // Ainda não existe no Supabase: entra pela lista EXTRAS de lib/brokers.ts.
  'samir augusto': {
    foto: '/corretores/samir-augusto.jpg',
    bio: [
      'Sou Samir Augusto, profissional com sólida experiência na área comercial, apaixonado por relacionamento com pessoas e por transformar objetivos em conquistas. Acredito que confiança, transparência e dedicação são essenciais para oferecer um atendimento de excelência. Meu compromisso é ajudar cada cliente a encontrar o imóvel ideal com segurança e tranquilidade.',
    ],
  },
};

/**
 * "Gabriele Fávaro" -> "gabriele fávaro".
 *
 * `normalize('NFC')` é o que importa aqui: o mesmo "á" pode chegar do banco
 * como um caractere único ou como "a" + acento combinante, e sem normalizar as
 * duas formas não batem na comparação. Acento é preservado de propósito —
 * assim a chave do mapa é o nome legível, sem regex de diacrítico.
 */
function normalizarNome(nome: string): string {
  return nome.normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
}

function conteudoRealDe(nome: string) {
  return CONTEUDO_REAL[normalizarNome(nome)];
}

// bioFor(b) do script — valores exatos. Texto genérico de placeholder: vale para
// quem ainda não tem bio própria em CONTEUDO_REAL.
function bioFor(b: Broker): string[] {
  return [
    'Comecei no mercado imobiliário porque gosto de gente — e descobri que a melhor parte de vender um imóvel é entender a história de quem vai morar nele. Há anos atendo ' + b.area + ' e conheço cada rua, cada escola, cada esquina que pega sol da manhã.',
    'Meu jeito de trabalhar é simples: ouço primeiro, mostro só o que faz sentido pra você e fico do seu lado do começo ao fim. Sem pressão, sem catálogo jogado no WhatsApp — com dado de mercado de verdade e o cuidado que você merece.',
    'Se você procura (ou quer vender) em ' + b.area + ', me chama. A gente toma um café e eu te mostro a região pelo que ela tem de vivido.',
  ];
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function LotusCorretores({
  whatsapp = WHATSAPP_DEFAULT,
  brokers,
}: {
  whatsapp?: string;
  /** Corretores reais (portal_brokers). Vazio/undefined => fallback demo. */
  brokers?: { id: string; name: string; photoUrl: string | null; creci: string | null; imoveisAtivos: number }[];
} = {}) {
  // Fonte dos corretores: banco (se veio algum) ou fallback demo.
  const BROKERS: Broker[] =
    brokers && brokers.length > 0 ? brokers.map(realToBroker) : BROKERS_FALLBACK;

  // state (espelha o `state` do dc-runtime)
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [selId, setSelId] = useState<string | null>(null);
  const [fSquad, setFSquad] = useState('any');
  const [fCity, setFCity] = useState('any');
  const [fName, setFName] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [formDone, setFormDone] = useState(false);
  const [galIndex, setGalIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);

  // waLink — lógica exata do script.
  const wa =
    'https://wa.me/' +
    String(whatsapp ?? WHATSAPP_DEFAULT) +
    '?text=' +
    encodeURIComponent('Quero falar com um corretor especialista da Lotus.');
  const waLink = wa;

  // Carrossel automático: setInterval 5s, só avança quando view==='list'.
  // (componentDidMount / componentWillUnmount do dc-runtime)
  useEffect(() => {
    const timer = setInterval(() => {
      if (view === 'list') setGalIndex((g) => (g + 1) % GAL_LEN);
    }, 5000);
    return () => clearInterval(timer);
  }, [view]);

  const prevGallery = () => setGalIndex((g) => (g + GAL_LEN - 1) % GAL_LEN);
  const nextGallery = () => setGalIndex((g) => (g + 1) % GAL_LEN);

  const gi = galIndex;

  // Filtro de brokers (lógica exata do script).
  const list = BROKERS.filter(
    (b) =>
      (fSquad === 'any' || b.squad === fSquad) &&
      (fCity === 'any' || b.city === fCity) &&
      (fName.trim() === '' || b.name.toLowerCase().includes(fName.toLowerCase()))
  );

  const openBroker = (id: string) => {
    setView('profile');
    setSelId(id);
    setOpenFaq(0);
    setFormDone(false);
    if (rootRef.current) window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const backToList = () => {
    setView('list');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Seleção do perfil (raw + sel derivado), igual ao script.
  const raw = BROKERS.find((b) => b.id === selId) || BROKERS[0];
  const sel = {
    ...raw,
    wa,
    bio: conteudoRealDe(raw.name)?.bio ?? bioFor(raw),
    chips: [raw.area, raw.squad, 'Casas', 'Apartamentos', raw.city, 'Avaliação gratuita'],
    listings: [
      { slot: raw.id + '-l1', price: 'R$ 1.890.000', title: 'Casa · ' + raw.area, specs: '4 suítes · 280 m²' },
      { slot: raw.id + '-l2', price: 'R$ 980.000', title: 'Apartamento · ' + raw.area, specs: '3 dorms · 110 m²' },
      { slot: raw.id + '-l3', price: 'R$ 2.450.000', title: 'Casa · ' + raw.area, specs: '4 suítes · 320 m²' },
    ],
    testimonials: [
      { text: 'Atendimento impecável do início ao fim. Entendeu exatamente o que a gente queria e achou a casa certa.', name: 'Família Souza', where: 'comprou em ' + raw.area },
      { text: 'Vendi meu imóvel rápido e pelo valor justo. Comunicação clara o tempo todo. Recomendo de olhos fechados.', name: 'Patrícia M.', where: 'vendeu em ' + raw.area },
    ],
  };

  const pf = [
    { q: 'Quem é o melhor corretor para ' + raw.area + '?', a: raw.first + ' é especialista em ' + raw.area + ' na Lotus Brokers, com nota ' + raw.rating + ' e dezenas de famílias atendidas na região.' },
    { q: 'Como falar com ' + raw.first + '?', a: 'Pelo botão de WhatsApp direto nesta página, pelo formulário de contato, ou agendando uma conversa. ' + raw.first + ' responde pessoalmente.' },
  ];
  const profileFaqs = pf.map((f, i) => ({
    q: f.q,
    a: f.a,
    open: openFaq === i,
    sign: openFaq === i ? '–' : '+',
    toggle: () => setOpenFaq((cur) => (cur === i ? -1 : i)),
  }));

  const submitForm = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormDone(true);
  };

  const count = list.length;
  const hasBrokers = list.length > 0;
  const noBrokers = list.length === 0;
  const isDirectory = view === 'list';
  const isProfile = view === 'profile';
  const notDone = !formDone;

  return (
    <div ref={rootRef}>
      {/* HEADER */}
      <LotusHeader active="corretores" maxWidth={1200} whatsapp={whatsapp} />

      {/* ============ DIRETÓRIO ============ */}
      {isDirectory && (
        <div>
          {/* hero */}
          <section style={parseStyle('background:#1d3a2c;position:relative;overflow:hidden;')}>
            <div style={parseStyle('position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");')}></div>
            <div style={parseStyle('position:relative;max-width:1000px;margin:0 auto;padding:96px 32px;text-align:center;')}>
              <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#cdab6e;margin-bottom:24px;')}>Nossa equipe</div>
              <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(36px,5vw,62px);line-height:1.04;letter-spacing:-.02em;color:#f7f2e8;margin:0 0 22px;")}>Especialistas que conhecem o seu bairro <em style={parseStyle('font-style:italic;color:#cdab6e;')}>pelo nome.</em></h1>
              <p style={parseStyle('font-size:clamp(16px,1.7vw,20px);color:rgba(247,242,232,.82);font-weight:300;line-height:1.55;max-width:600px;margin:0 auto;')}>Na Lotus você não fala com um generalista de tudo. Encontre o corretor certo por bairro, especialidade ou squad.</p>
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;max-width:920px;margin:48px auto 0;text-align:left;')}>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Especialistas por bairro e condomínio</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Cada corretor domina o seu território — conhece as ruas, os condomínios e o preço justo daquele metro quadrado.</p>
                </div>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"></path></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Treinamento semanal</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Todo time passa por capacitação toda semana — mercado, negociação e atendimento sempre afiados.</p>
                </div>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="m12 2 2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6-6.3 4.6L8 13.8 2 9.4h7.6L12 2Z"></path></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Foco em serviço de excelência</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Atendimento humano e presente, do primeiro café ao pós-chave. A relação não termina na assinatura.</p>
                </div>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Time em squads, não um faz-tudo</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Alto Padrão, Lançamentos, Popular e Comercial — você sempre cai com quem é especialista no seu caso.</p>
                </div>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="M3 3v18h18"></path><path d="m7 14 3-4 3 3 5-7"></path></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Metodologia que vende até 10x mais rápido</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Trabalhamos com um modelo de negócios consagrado mundo afora, com processo e dado — que acelera a venda em até 10x frente ao jeito tradicional.</p>
                </div>
                <div style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:16px;padding:24px;')}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cdab6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={parseStyle('margin-bottom:14px;')}><path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>
                  <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:18px;color:#f7f2e8;margin:0 0 8px;")}>Marketing, vídeo e foto profissionais</h3>
                  <p style={parseStyle('font-size:14px;color:rgba(247,242,232,.72);font-weight:300;line-height:1.55;margin:0;')}>Equipe própria de marketing, gravação de vídeos e fotógrafos profissionais — que coloca cada corretor muito acima da média do mercado.</p>
                </div>
              </div>
            </div>
          </section>

          {/* filtros */}
          <section style={parseStyle('max-width:1200px;margin:0 auto;padding:36px 32px 0;')}>
            <div style={parseStyle('display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;')}>
              <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;align-items:center;')}>
                <select className="lt-field" value={fSquad} onChange={(e) => setFSquad(e.target.value)}>
                  <option value="any">Todos os squads</option><option value="Alto Padrão">Alto Padrão</option><option value="Lançamentos">Lançamentos</option><option value="Popular">Popular</option><option value="Comercial">Comercial</option>
                </select>
                <select className="lt-field" value={fCity} onChange={(e) => setFCity(e.target.value)}>
                  <option value="any">Todas as cidades</option><option value="Jundiaí">Jundiaí</option><option value="Itupeva">Itupeva</option><option value="Vinhedo">Vinhedo</option>
                </select>
              </div>
              <div style={parseStyle('position:relative;')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aa593" strokeWidth="2" style={parseStyle('position:absolute;left:14px;top:50%;transform:translateY(-50%);')}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path></svg>
                <input className="lt-field" type="text" placeholder="Buscar por nome" value={fName} onInput={(e) => setFName((e.target as HTMLInputElement).value)} style={parseStyle('padding-left:38px;width:220px;')} />
              </div>
            </div>
            <div style={parseStyle('font-size:13.5px;color:#8aa593;margin-top:18px;')}>{count} corretores especialistas na sua região</div>
          </section>

          {/* grid */}
          <section style={parseStyle('max-width:1200px;margin:0 auto;padding:24px 32px 90px;')}>
            {hasBrokers && (
              <>
                <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;')}>
                  {list.map((b, i) => (
                    <Hoverable key={i} baseStyle={parseStyle('position:relative;display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px -32px rgba(21,36,28,.32);transition:transform .3s ease, box-shadow .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px);box-shadow:0 28px 56px -34px rgba(21,36,28,.46)')}>
                      <div style={parseStyle('position:relative;aspect-ratio:1/1;background:#1d3a2c;')}>
                        <ImageSlot id={b.slot} src={b.photoUrl || undefined} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={b.name} initials={b.name} />
                        {b.founder && (<span style={parseStyle('position:absolute;top:12px;left:12px;background:#b18a4a;color:#15241c;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:30px;')}>Fundador</span>)}
                        <span style={parseStyle('position:absolute;top:12px;right:12px;background:rgba(247,242,232,.92);color:#1d3a2c;font-size:11.5px;font-weight:700;padding:4px 9px;border-radius:30px;display:flex;align-items:center;gap:3px;')}><span style={parseStyle('color:#b18a4a;')}>★</span>{b.rating}</span>
                      </div>
                      <div style={parseStyle('padding:18px;display:flex;flex-direction:column;flex:1;')}>
                        <div style={parseStyle('font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#b18a4a;margin-bottom:7px;')}>{b.squad}</div>
                        <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:20px;color:#15241c;margin:0 0 4px;line-height:1.05;")}>{b.name}</h3>
                        <div style={parseStyle('font-size:13px;color:#3f6249;')}>Especialista em {b.area}</div>
                        <div style={parseStyle('font-size:12px;color:#8aa593;margin-top:4px;')}>{b.creci} · {imoveisAtivosLabel(b.active)}</div>
                        <div style={parseStyle('display:flex;gap:8px;margin-top:16px;')}>
                          <Hoverable as="button" onClick={() => openBroker(b.id)} baseStyle={parseStyle('flex:1;background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:13px;padding:10px;border:none;border-radius:9px;cursor:pointer;transition:background .2s;')} hoverStyle={parseStyle('background:#15241c')}>Ver perfil</Hoverable>
                          <a href={wa} target="_blank" rel="noopener" aria-label="WhatsApp" style={parseStyle('flex-shrink:0;width:40px;background:#25543b;border-radius:9px;display:flex;align-items:center;justify-content:center;')}><svg width="18" height="18" viewBox="0 0 24 24" fill="#f7f2e8"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"></path></svg></a>
                        </div>
                      </div>
                    </Hoverable>
                  ))}
                </div>
              </>
            )}
            {noBrokers && (
              <>
                <div style={parseStyle('background:#ece2cf;border-radius:18px;padding:48px;text-align:center;')}>
                  <div style={parseStyle("font-family:'Fraunces',serif;font-size:22px;color:#15241c;margin-bottom:8px;")}>Nenhum corretor nesse filtro.</div>
                  <button onClick={() => { setFSquad('any'); setFCity('any'); setFName(''); }} style={parseStyle('margin-top:10px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14px;padding:11px 22px;border:none;border-radius:30px;cursor:pointer;')}>Limpar filtros</button>
                </div>
              </>
            )}
          </section>

          {/* vida na lotus (carrossel) */}
          <section style={parseStyle('background:#f7f2e8;padding:20px 32px 90px;')}>
            <div style={parseStyle('max-width:1100px;margin:0 auto;')}>
              <div style={parseStyle('text-align:center;max-width:600px;margin:0 auto 36px;')}>
                <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#b18a4a;margin-bottom:14px;')}>Vida na Lotus</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.4vw,40px);color:#15241c;line-height:1.06;margin:0;")}>Time, bastidores e conquistas.</h2>
              </div>
              <div style={parseStyle('position:relative;border-radius:22px;overflow:hidden;background:#1d3a2c;box-shadow:0 24px 60px -34px rgba(21,36,28,.5);aspect-ratio:16/9;')}>
                {galleryData.map((g, i) => (
                  <div key={i} style={parseStyle('position:absolute;inset:0;opacity:' + (i === gi ? '1' : '0') + ';transition:opacity .7s ease;pointer-events:' + (i === gi ? 'auto' : 'none') + ';')}>
                    <ImageSlot id={g.slot} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={g.label} />
                    <div style={parseStyle('position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(21,36,28,.85));')}></div>
                    <div style={parseStyle('position:absolute;left:0;right:0;bottom:0;padding:clamp(22px,3vw,40px);')}>
                      <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#cdab6e;margin-bottom:8px;')}>{g.tag}</div>
                      <div style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(22px,2.8vw,32px);color:#f7f2e8;line-height:1.1;max-width:560px;")}>{g.label}</div>
                    </div>
                  </div>
                ))}
                <Hoverable as="button" onClick={prevGallery} aria-label="Anterior" baseStyle={parseStyle('position:absolute;top:50%;left:18px;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(247,242,232,.16);backdrop-filter:blur(4px);border:1px solid rgba(247,242,232,.32);color:#f7f2e8;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:3;')} hoverStyle={parseStyle('background:rgba(247,242,232,.3)')}>‹</Hoverable>
                <Hoverable as="button" onClick={nextGallery} aria-label="Próximo" baseStyle={parseStyle('position:absolute;top:50%;right:18px;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(247,242,232,.16);backdrop-filter:blur(4px);border:1px solid rgba(247,242,232,.32);color:#f7f2e8;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:3;')} hoverStyle={parseStyle('background:rgba(247,242,232,.3)')}>›</Hoverable>
                <div style={parseStyle('position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:center;gap:8px;z-index:3;')}>
                  {galleryData.map((g, i) => (
                    <button key={i} onClick={() => setGalIndex(i)} aria-label="Ir para a foto" style={parseStyle('width:' + (i === gi ? '26px' : '9px') + ';height:9px;border-radius:30px;border:none;cursor:pointer;transition:all .3s;padding:0;background:' + (i === gi ? '#cdab6e' : 'rgba(247,242,232,.45)') + ';')}></button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA recrutamento */}
          <section style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
            <div style={parseStyle('max-width:1000px;margin:0 auto;background:#1d3a2c;border-radius:22px;padding:clamp(36px,5vw,56px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:28px;')}>
              <div style={parseStyle('max-width:520px;')}>
                <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#cdab6e;margin-bottom:14px;')}>Trabalhe na Lotus</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.2vw,38px);color:#f7f2e8;line-height:1.08;margin:0 0 12px;")}>Quer fazer parte do time?</h2>
                <p style={parseStyle('font-size:16px;color:rgba(247,242,232,.78);font-weight:300;line-height:1.55;margin:0;')}>A gente está sempre procurando especialistas que querem ser livres do braçal e focar no cliente.</p>
              </div>
              <Hoverable as="a" target="_top" href="/lotus-recrutamento" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:15px;padding:14px 26px;border-radius:40px;white-space:nowrap;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Ver vagas abertas <span>→</span></Hoverable>
            </div>
          </section>
        </div>
      )}

      {/* ============ PERFIL ============ */}
      {isProfile && (
        <div>
          {/* breadcrumb */}
          <div style={parseStyle('max-width:1100px;margin:0 auto;padding:18px 32px 0;font-size:13px;color:#8aa593;')}>
            <Hoverable as="button" onClick={backToList} baseStyle={parseStyle('background:none;border:none;color:#3f6249;font-size:13px;cursor:pointer;padding:0;')} hoverStyle={parseStyle('color:#b18a4a')}>Corretores</Hoverable> › <span style={parseStyle('color:#15241c;')}>{sel.name}</span>
          </div>

          {/* header de perfil */}
          <section style={parseStyle('max-width:1100px;margin:0 auto;padding:24px 32px 0;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;')}>
            <div style={parseStyle('position:relative;aspect-ratio:4/5;border-radius:20px;overflow:hidden;background:#1d3a2c;')}>
              <ImageSlot id={sel.slot} src={sel.photoUrl || undefined} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={sel.name} initials={sel.name} />
              <button style={parseStyle('position:absolute;left:50%;bottom:18px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;background:rgba(247,242,232,.92);border:none;border-radius:40px;padding:10px 18px;font-size:13.5px;font-weight:600;color:#1d3a2c;cursor:pointer;')}><svg width="16" height="16" viewBox="0 0 24 24" fill="#1d3a2c"><path d="M8 5v14l11-7z"></path></svg>Vídeo de apresentação</button>
            </div>
            <div style={parseStyle('position:sticky;top:88px;')}>
              <div style={parseStyle('font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#b18a4a;margin-bottom:12px;')}>{sel.squad}</div>
              <h1 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(32px,4vw,48px);color:#15241c;line-height:1.02;margin:0 0 10px;")}>{sel.name}</h1>
              <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-bottom:20px;')}>
                <span style={parseStyle('font-size:14.5px;color:#3f6249;')}>{sel.creci}</span>
                <span style={parseStyle('display:inline-flex;align-items:center;gap:5px;font-size:14px;font-weight:600;color:#15241c;')}><span style={parseStyle('color:#b18a4a;')}>★</span>{sel.rating} <span style={parseStyle('color:#8aa593;font-weight:400;')}>({sel.reviews} avaliações)</span></span>
              </div>
              <p style={parseStyle('font-size:15.5px;color:#3f6249;font-weight:300;line-height:1.55;margin:0 0 22px;')}>Especialista em <strong style={parseStyle('color:#15241c;font-weight:600;')}>{sel.area}</strong> · {sel.city} · {imoveisAtivosLabel(sel.active)}.</p>
              <div style={parseStyle('display:flex;flex-wrap:wrap;gap:10px;')}>
                <a href={sel.wa} target="_blank" rel="noopener" style={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#25543b;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:13px 22px;border-radius:11px;')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"></path></svg>Falar no WhatsApp</a>
                <Hoverable as="a" href="#agenda" baseStyle={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#b18a4a;color:#15241c;font-weight:600;font-size:14.5px;padding:13px 22px;border-radius:11px;transition:background .2s;')} hoverStyle={parseStyle('background:#cdab6e')}>Agendar conversa</Hoverable>
              </div>
            </div>
          </section>

          {/* sobre */}
          <section style={parseStyle('max-width:1100px;margin:0 auto;padding:64px 32px;')}>
            <div style={parseStyle('max-width:720px;')}>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3vw,34px);color:#15241c;margin:0 0 22px;")}>Sobre {sel.first}</h2>
              {sel.bio.map((bloco, i) =>
                typeof bloco === 'string' ? (
                  <p key={i} style={parseStyle('font-size:16.5px;color:#3f6249;font-weight:300;line-height:1.7;margin:0 0 18px;')}>{bloco}</p>
                ) : (
                  <div key={i}>
                    <h3 style={parseStyle("font-family:'Fraunces',serif;font-weight:400;font-size:20px;color:#15241c;margin:30px 0 14px;")}>{bloco.titulo}</h3>
                    {bloco.itens && (
                      <ul style={parseStyle('margin:0 0 18px;padding-left:20px;display:grid;gap:7px;')}>
                        {bloco.itens.map((item, j) => (
                          <li key={j} style={parseStyle('font-size:16px;color:#3f6249;font-weight:300;line-height:1.55;')}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          </section>

          {/* especialidades */}
          <section style={parseStyle('background:#ece2cf;padding:70px 32px;')}>
            <div style={parseStyle('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center;')}>
              <div>
                <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#b18a4a;margin-bottom:18px;')}>Atuação</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,2.8vw,32px);color:#15241c;margin:0 0 22px;line-height:1.1;")}>Onde {sel.first} é referência.</h2>
                <div style={parseStyle('display:flex;flex-wrap:wrap;gap:9px;')}>
                  {sel.chips.map((c, i) => (
                    <span key={i} style={parseStyle('background:#fff;border:1px solid rgba(21,36,28,.1);color:#3f6249;font-size:13.5px;font-weight:500;padding:8px 15px;border-radius:30px;')}>{c}</span>
                  ))}
                </div>
              </div>
              <div style={parseStyle('position:relative;aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:#e7e4d7;')}>
                <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')}>
                  <rect width="400" height="300" fill="#e7e4d7"></rect>
                  <path d="M-20 80 L180 40 L420 110" stroke="#d8d2bf" strokeWidth="12" fill="none"></path>
                  <path d="M60 -20 L110 180 L80 320" stroke="#d8d2bf" strokeWidth="10" fill="none"></path>
                  <path d="M-20 210 L200 170 L420 220" stroke="#d8d2bf" strokeWidth="13" fill="none"></path>
                  <circle cx="290" cy="90" r="48" fill="#cdd9c6" opacity=".55"></circle>
                </svg>
                <div style={parseStyle('position:absolute;left:46%;top:46%;transform:translate(-50%,-100%);background:#1d3a2c;color:#f7f2e8;border:2px solid #f7f2e8;border-radius:30px;padding:6px 13px;font-size:12.5px;font-weight:700;white-space:nowrap;')}>{sel.area}</div>
              </div>
            </div>
          </section>

          {/* imóveis do corretor */}
          <section style={parseStyle('background:#f7f2e8;padding:80px 32px;')}>
            <div style={parseStyle('max-width:1100px;margin:0 auto;')}>
              <div style={parseStyle('display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:32px;')}>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3vw,36px);color:#15241c;margin:0;")}>Imóveis com {sel.first}</h2>
                <a target="_top" href="/lotus-busca" style={parseStyle('display:inline-flex;align-items:center;gap:8px;color:#1d3a2c;font-weight:600;font-size:15px;border-bottom:1.5px solid #b18a4a;padding-bottom:3px;')}>Ver todos <span>→</span></a>
              </div>
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;')}>
                {sel.listings.map((l, i) => (
                  <Hoverable key={i} as="a" target="_top" href="/lotus-imovel" baseStyle={parseStyle('display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px -32px rgba(21,36,28,.32);transition:transform .3s ease;')} hoverStyle={parseStyle('transform:translateY(-4px)')}>
                    <div style={parseStyle('position:relative;aspect-ratio:4/3;background:#1d3a2c;')}><ImageSlot id={l.slot} style={parseStyle('position:absolute;inset:0;width:100%;height:100%;')} alt={l.title} /></div>
                    <div style={parseStyle('padding:18px;')}>
                      <div style={parseStyle("font-family:'Fraunces',serif;font-size:19px;color:#1d3a2c;")}>{l.price}</div>
                      <div style={parseStyle('font-size:13px;font-weight:600;color:#15241c;margin-top:6px;')}>{l.title}</div>
                      <div style={parseStyle('font-size:12.5px;color:#3f6249;margin-top:3px;')}>{l.specs}</div>
                    </div>
                  </Hoverable>
                ))}
              </div>
            </div>
          </section>

          {/* depoimentos */}
          <section style={parseStyle('background:#1d3a2c;padding:80px 32px;position:relative;overflow:hidden;')}>
            <div style={parseStyle('position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");')}></div>
            <div style={parseStyle('max-width:1100px;margin:0 auto;position:relative;')}>
              <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(24px,3vw,36px);color:#f7f2e8;margin:0 0 36px;")}>Quem foi atendido por {sel.first}</h2>
              <div style={parseStyle('display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;')}>
                {sel.testimonials.map((t, i) => (
                  <div key={i} style={parseStyle('background:rgba(247,242,232,.06);border:1px solid rgba(247,242,232,.12);border-radius:18px;padding:28px;')}>
                    <div style={parseStyle('color:#cdab6e;font-size:16px;letter-spacing:3px;margin-bottom:12px;')}>★★★★★</div>
                    <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.88);font-weight:300;line-height:1.6;margin:0 0 16px;')}>“{t.text}”</p>
                    <div style={parseStyle('font-size:13.5px;font-weight:600;color:#f7f2e8;')}>{t.name}</div>
                    <div style={parseStyle('font-size:12.5px;color:#8aa593;')}>{t.where}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* agenda / contato */}
          <section id="agenda" style={parseStyle('background:#ece2cf;padding:80px 32px;')}>
            <div style={parseStyle('max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;')}>
              <div>
                <div style={parseStyle('font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#b18a4a;margin-bottom:16px;')}>Vamos conversar</div>
                <h2 style={parseStyle("font-family:'Fraunces',serif;font-weight:300;font-size:clamp(26px,3.2vw,38px);color:#15241c;line-height:1.08;margin:0 0 16px;")}>Fale direto com {sel.first}.</h2>
                <p style={parseStyle('font-size:16px;color:#3f6249;font-weight:300;line-height:1.6;margin:0 0 24px;')}>Conte o que você procura (ou o que quer vender) e {sel.first} responde pessoalmente — com a região na ponta da língua.</p>
                <a href={sel.wa} target="_blank" rel="noopener" style={parseStyle('display:inline-flex;align-items:center;gap:8px;background:#25543b;color:#f7f2e8;font-weight:600;font-size:15px;padding:14px 24px;border-radius:11px;')}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"></path></svg>WhatsApp direto</a>
              </div>
              <div style={parseStyle('background:#fff;border-radius:18px;padding:30px;box-shadow:0 18px 44px -34px rgba(21,36,28,.3);')}>
                {formDone && (
                  <>
                    <div style={parseStyle('text-align:center;padding:20px 0;')}><div style={parseStyle("font-family:'Fraunces',serif;font-size:22px;color:#1d3a2c;margin-bottom:8px;")}>Recebido! 🌿</div><p style={parseStyle('font-size:14px;color:#3f6249;margin:0;')}>{sel.first} vai te chamar no WhatsApp em breve.</p></div>
                  </>
                )}
                {notDone && (
                  <>
                    <form onSubmit={submitForm} style={parseStyle('display:flex;flex-direction:column;gap:11px;')}>
                      <input type="text" required placeholder="Seu nome" style={parseStyle('border:1px solid rgba(21,36,28,.16);border-radius:10px;padding:12px 13px;font-size:14px;outline:none;')} />
                      <input type="text" required placeholder="WhatsApp" style={parseStyle('border:1px solid rgba(21,36,28,.16);border-radius:10px;padding:12px 13px;font-size:14px;outline:none;')} />
                      <select className="lt-field" style={parseStyle('border-radius:10px;width:100%;')}><option>Quero comprar</option><option>Quero vender</option><option>Quero alugar</option><option>Outro assunto</option></select>
                      <label style={parseStyle('display:flex;align-items:flex-start;gap:8px;font-size:11.5px;color:#3f6249;line-height:1.45;cursor:pointer;')}><input type="checkbox" required style={parseStyle('margin-top:2px;width:15px;height:15px;accent-color:#1d3a2c;')} />Concordo com a Política de Privacidade (LGPD).</label>
                      <button type="submit" style={parseStyle('background:#1d3a2c;color:#f7f2e8;font-weight:600;font-size:14.5px;padding:13px;border:none;border-radius:10px;cursor:pointer;')}>Enviar mensagem</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* GEO / FAQ */}
          <section style={parseStyle('background:#f7f2e8;padding:80px 32px;')}>
            <div style={parseStyle('max-width:760px;margin:0 auto;')}>
              <div style={parseStyle('background:#1d3a2c;border-radius:16px;padding:26px 28px;margin-bottom:32px;')}>
                <div style={parseStyle('font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#cdab6e;margin-bottom:12px;')}>TL;DR</div>
                <p style={parseStyle('font-size:15.5px;color:rgba(247,242,232,.85);font-weight:300;line-height:1.65;margin:0;')}>{sel.first} é corretor(a) especialista em {sel.area} ({sel.city}) na Lotus Brokers, com nota {sel.rating} e foco em {sel.squad}. Fale pelo WhatsApp ou agende uma conversa.</p>
              </div>
              {profileFaqs.map((f, i) => (
                <div key={i} style={parseStyle('border-bottom:1px solid rgba(21,36,28,.12);')}>
                  <button onClick={f.toggle} style={parseStyle('width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;cursor:pointer;padding:20px 0;text-align:left;')}>
                    <span style={parseStyle('font-size:16px;font-weight:500;color:#15241c;')}>{f.q}</span>
                    <span style={parseStyle('font-size:22px;color:#b18a4a;font-weight:300;')}>{f.sign}</span>
                  </button>
                  {f.open && (<p style={parseStyle('font-size:15px;color:#3f6249;font-weight:300;line-height:1.6;margin:0;padding:0 0 20px;')}>{f.a}</p>)}
                </div>
              ))}
              <div style={parseStyle('margin-top:36px;text-align:center;')}>
                <Hoverable as="button" onClick={backToList} baseStyle={parseStyle('background:none;border:1px solid rgba(21,36,28,.2);color:#1d3a2c;font-weight:600;font-size:14.5px;padding:12px 26px;border-radius:40px;cursor:pointer;')} hoverStyle={parseStyle('background:#ece2cf')}>← Ver todos os corretores</Hoverable>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* FOOTER */}
      <footer style={parseStyle('background:#15241c;padding:72px 32px 36px;position:relative;overflow:hidden;')}>
        <div style={parseStyle('position:absolute;inset:0;opacity:.04;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.85\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");')}></div>
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
