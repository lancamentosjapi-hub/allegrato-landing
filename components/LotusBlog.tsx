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

/**
 * Bloco do corpo do artigo. `string` é um parágrafo — forma curta, usada pela
 * maioria. A variante em objeto cobre artigos com seção e lista; sem ela, uma
 * lista de itens viraria um parágrafo corrido.
 */
type BlocoArtigo = string | { titulo?: string; itens?: string[]; nivel?: 2 | 3 };

type Post = {
  id: string;
  cat: string;
  date: string;
  read: string;
  img: string;
  slot: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  tldr: string;
  body: BlocoArtigo[];
};

// Exportado para a home consumir os destaques (LotusHome importa e mostra os
// três primeiros). Antes a home mantinha uma lista própria de posts escrita à
// mão, que envelheceu: títulos que não existiam mais no blog e nenhuma capa.
export const POSTS: Post[] = [
  {
    id: 'p00000', cat: 'Região', date: 'Ago 2026', read: '6 min', img: '/blog/bairro-caxambu.jpg', slot: 'blog-p00000', title: 'Bairro Caxambu: tradição, natureza e qualidade de vida em Jundiaí', excerpt: 'Conheça o bairro Caxambu, em Jundiaí, e descubra por que a região é uma das melhores opções para quem busca tranquilidade, qualidade de vida e valorização imobiliária.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Na região norte de Jundiaí, o Caxambu mantém perfil residencial e rural, herança da imigração italiana e da produção de uvas, com acesso fácil ao centro e às rodovias. Reúne casas, sobrados, chácaras, terrenos e condomínios fechados, e atrai quem busca espaço e tranquilidade sem perder praticidade.',
    body: [
      'O Caxambu é um dos bairros mais tradicionais de Jundiaí e se destaca por oferecer um estilo de vida que combina tranquilidade, contato com a natureza e excelente infraestrutura. Conhecido por sua forte influência da imigração italiana e pela produção de uvas e vinhos, o bairro preserva seu charme histórico ao mesmo tempo em que acompanha o crescimento imobiliário da cidade.',
      'Nos últimos anos, a região passou a atrair cada vez mais famílias e investidores interessados em morar em um ambiente mais calmo, sem abrir mão da praticidade de estar próximo ao centro e às principais vias de acesso.',
      'Neste artigo, a Lotus Brokers apresenta os diferenciais do Caxambu e explica por que o bairro continua entre as melhores opções para morar e investir em Jundiaí.',
      { titulo: 'Onde fica o bairro Caxambu?' },
      'O Caxambu está localizado na região norte de Jundiaí e possui fácil acesso ao centro da cidade e às principais rodovias que ligam o município a São Paulo, Campinas e outras cidades do interior.',
      'Apesar da proximidade com áreas urbanas, o bairro mantém características residenciais e rurais, oferecendo um ambiente tranquilo e agradável para quem busca desacelerar a rotina. Essa combinação entre mobilidade e qualidade de vida é um dos principais atrativos da região.',
      { titulo: 'Um bairro marcado pela tradição' },
      'O Caxambu faz parte da história de Jundiaí. A região preserva a influência da imigração italiana por meio da gastronomia, das festas típicas, das propriedades rurais e da produção de frutas, especialmente uvas.',
      'Esse patrimônio cultural torna o bairro um dos destinos mais conhecidos da cidade, atraindo visitantes durante todo o ano e contribuindo para sua valorização. Além do aspecto histórico, o Caxambu oferece uma atmosfera acolhedora que conquista moradores de diferentes perfis.',
      { titulo: 'Contato com a natureza' },
      'Quem escolhe morar no Caxambu geralmente busca uma rotina mais tranquila e próxima da natureza. O bairro conta com:',
      { itens: ['Áreas verdes', 'Ruas arborizadas', 'Propriedades rurais', 'Paisagens preservadas', 'Clima agradável'] },
      'Essa característica proporciona maior sensação de bem-estar e cria um ambiente ideal para famílias, crianças e pessoas que valorizam atividades ao ar livre.',
      { titulo: 'Infraestrutura em constante evolução' },
      'Embora mantenha seu perfil residencial, o Caxambu oferece uma infraestrutura que atende às necessidades do dia a dia. Os moradores encontram na região ou nas proximidades:',
      { itens: ['Supermercados', 'Padarias', 'Farmácias', 'Escolas', 'Restaurantes', 'Academias', 'Clínicas médicas', 'Comércio local'] },
      'Além disso, o desenvolvimento de novos empreendimentos vem ampliando a oferta de serviços e contribuindo para o crescimento organizado do bairro.',
      { titulo: 'Mercado imobiliário' },
      'O mercado imobiliário do Caxambu apresenta oportunidades para diferentes perfis de compradores. Entre os principais tipos de imóveis encontrados na região estão:',
      { itens: ['Casas térreas', 'Sobrados', 'Chácaras', 'Terrenos', 'Condomínios fechados', 'Empreendimentos residenciais'] },
      'Essa diversidade permite atender desde famílias que procuram mais espaço até investidores interessados em imóveis com potencial de valorização.',
      { titulo: 'Vale a pena investir no Caxambu?' },
      'O Caxambu reúne fatores que tornam a região atrativa para investimentos imobiliários. Entre eles:',
      { itens: ['Crescimento urbano planejado', 'Valorização gradual dos imóveis', 'Qualidade de vida', 'Disponibilidade de terrenos em algumas áreas', 'Procura crescente por imóveis residenciais'] },
      'À medida que Jundiaí continua se desenvolvendo, bairros que oferecem equilíbrio entre infraestrutura e natureza tendem a despertar ainda mais interesse dos compradores.',
      { titulo: 'Mobilidade e localização estratégica' },
      'Apesar do ambiente tranquilo, o Caxambu oferece fácil deslocamento para diferentes regiões da cidade. O acesso às principais avenidas e rodovias facilita o dia a dia de quem trabalha em Jundiaí ou em municípios vizinhos.',
      'Essa característica permite aproveitar a tranquilidade do bairro sem abrir mão da praticidade.',
      { titulo: 'Para quem o Caxambu é indicado?' },
      'O bairro atende especialmente pessoas que valorizam qualidade de vida. É uma excelente opção para:',
      { itens: ['Famílias que desejam mais espaço', 'Casais que procuram uma rotina mais tranquila', 'Aposentados', 'Pessoas que apreciam contato com a natureza', 'Investidores interessados em regiões com potencial de crescimento'] },
      'O ambiente acolhedor e a boa infraestrutura tornam o Caxambu uma escolha bastante versátil.',
      { titulo: 'Como escolher um imóvel no Caxambu?' },
      'Antes de comprar um imóvel na região, vale observar alguns pontos:',
      { itens: ['Localização dentro do bairro', 'Facilidade de acesso às principais vias', 'Infraestrutura disponível', 'Proximidade de escolas e comércio', 'Potencial de valorização do imóvel', 'Objetivos de longo prazo'] },
      'Com uma avaliação cuidadosa e orientação especializada, é possível encontrar oportunidades alinhadas às suas necessidades e ao seu planejamento financeiro.',
      { titulo: 'Conclusão' },
      'O Caxambu é um bairro que preserva a história de Jundiaí enquanto acompanha o desenvolvimento da cidade. Sua combinação entre natureza, tradição, infraestrutura e valorização imobiliária faz da região uma excelente escolha para quem busca um estilo de vida mais tranquilo sem abrir mão da praticidade.',
      'Seja para morar ou investir, o bairro oferece oportunidades para diferentes perfis de compradores e continua despertando o interesse de quem deseja viver em uma das regiões mais charmosas de Jundiaí.',
      'A Lotus Brokers acompanha diariamente o mercado imobiliário do Caxambu e pode ajudar você a encontrar o imóvel ideal, oferecendo atendimento consultivo e acesso às melhores oportunidades da região.',
    ],
  },
  {
    id: 'p0000', cat: 'Guia', date: 'Ago 2026', read: '8 min', img: '/blog/financiar-lancamento.jpg', slot: 'blog-p0000', title: 'Como financiar um lançamento imobiliário? Guia completo para comprar seu imóvel em Jundiaí', excerpt: 'Saiba como financiar um lançamento imobiliário, conheça as principais modalidades de crédito e descubra as melhores oportunidades para comprar imóveis em Jundiaí.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'O financiamento de um lançamento acontece em duas fases: durante a obra você paga entrada e parcelas direto à construtora; depois da entrega, o saldo devedor é financiado no banco, que só então analisa crédito e renda. FGTS pode entrar na entrada ou na amortização, e a escolha entre SAC e Tabela Price muda o peso das primeiras parcelas.',
    body: [
      'Comprar um imóvel é uma das decisões financeiras mais importantes da vida. Quando se trata de um lançamento imobiliário, além da possibilidade de adquirir um imóvel novo e com excelente potencial de valorização, surgem diversas dúvidas sobre o processo de financiamento.',
      'Como financiar um lançamento imobiliário? Essa é uma pergunta frequente entre famílias, investidores e compradores do primeiro imóvel que desejam aproveitar as condições oferecidas pelas construtoras.',
      'Em uma cidade como Jundiaí, onde o mercado imobiliário cresce de forma consistente e novos empreendimentos são lançados todos os anos, entender como funciona esse processo pode fazer toda a diferença para realizar um excelente negócio.',
      'Neste guia, você conhecerá as etapas do financiamento, as modalidades disponíveis, os documentos necessários, as vantagens de comprar um imóvel na planta e por que Jundiaí continua sendo um dos mercados mais promissores do interior paulista.',
      { titulo: 'Como funciona o financiamento de um lançamento imobiliário?' },
      'Ao contrário da compra de um imóvel pronto, o financiamento de um lançamento costuma acontecer em duas fases.',
      { titulo: '1. Pagamento durante a obra', nivel: 3 },
      'Enquanto o empreendimento está sendo construído, normalmente o comprador paga:',
      { itens: ['Entrada', 'Parcelas mensais', 'Parcelas intermediárias, quando previstas em contrato', 'Eventuais reforços anuais'] },
      'Esses pagamentos são realizados diretamente para a construtora. Essa etapa costuma ser mais flexível, permitindo que o comprador organize melhor seu planejamento financeiro até a entrega do empreendimento.',
      { titulo: '2. Financiamento do saldo devedor', nivel: 3 },
      'Após a conclusão da obra e emissão da documentação necessária, chega o momento de financiar o saldo restante junto a uma instituição financeira. Nessa etapa, o banco realiza uma análise completa, considerando fatores como:',
      { itens: ['Renda familiar', 'Capacidade de pagamento', 'Histórico de crédito', 'Documentação pessoal', 'Valor do imóvel', 'Avaliação do empreendimento'] },
      'Depois da aprovação, o banco quita o saldo devido à construtora, e o comprador passa a pagar as parcelas diretamente para a instituição financeira.',
      { titulo: 'Quais são as principais modalidades de financiamento?' },
      'Hoje existem diferentes formas de financiar um lançamento imobiliário. A modalidade mais adequada depende do perfil financeiro de cada comprador.',
      { titulo: 'Financiamento bancário tradicional', nivel: 3 },
      'É a modalidade mais utilizada. Após a entrega das chaves, o comprador contrata o financiamento junto ao banco, podendo parcelar o pagamento em prazos que geralmente chegam a até 35 anos, conforme as condições da instituição financeira.',
      { titulo: 'Utilização do FGTS', nivel: 3 },
      'Dependendo das regras vigentes e do enquadramento do comprador, o Fundo de Garantia pode ser utilizado para:',
      { itens: ['Complementar a entrada', 'Reduzir o saldo financiado', 'Amortizar parcelas futuras'] },
      'Essa alternativa costuma reduzir significativamente o valor financiado.',
      { titulo: 'Sistemas de amortização', nivel: 3 },
      'Entre os principais sistemas utilizados estão o SAC e a Tabela Price. No SAC (Sistema de Amortização Constante), as parcelas começam maiores e diminuem ao longo do contrato, é uma opção bastante escolhida por quem busca pagar menos juros ao longo do financiamento.',
      'Na Tabela Price, as parcelas tendem a permanecer mais estáveis durante boa parte do contrato. É indicada para quem prefere maior previsibilidade no orçamento mensal.',
      { titulo: 'Quais documentos normalmente são necessários?' },
      'Embora possa haver pequenas variações entre as instituições financeiras, normalmente são solicitados:',
      { itens: ['Documento de identidade', 'CPF', 'Certidão de estado civil', 'Comprovante de renda', 'Comprovante de residência', 'Declaração de Imposto de Renda, quando exigida', 'Extratos bancários, dependendo da análise de crédito'] },
      'Ter toda a documentação organizada costuma agilizar a aprovação do financiamento.',
      { titulo: 'Quais são as vantagens de comprar um lançamento imobiliário?' },
      'Optar por um lançamento oferece benefícios importantes tanto para quem deseja morar quanto para quem pretende investir.',
      { titulo: 'Potencial de valorização', nivel: 3 },
      'Uma das maiores vantagens está na valorização do imóvel ao longo da construção. Em muitos casos, imóveis adquiridos no lançamento apresentam valorização até a entrega das chaves, especialmente em regiões em expansão.',
      { titulo: 'Condições comerciais mais flexíveis', nivel: 3 },
      'Construtoras frequentemente oferecem:',
      { itens: ['Parcelamento da entrada', 'Condições especiais durante o lançamento', 'Campanhas promocionais', 'Negociação personalizada'] },
      'Isso facilita o acesso ao imóvel para diferentes perfis de compradores.',
      { titulo: 'Imóvel novo', nivel: 3 },
      'Um imóvel recém-construído oferece diversas vantagens:',
      { itens: ['Menor necessidade de manutenção', 'Instalações hidráulicas e elétricas atualizadas', 'Melhor eficiência energética', 'Plantas mais modernas', 'Infraestrutura de lazer completa'] },
      { titulo: 'Tecnologia e sustentabilidade', nivel: 3 },
      'Os empreendimentos atuais costumam incorporar soluções que tornam o condomínio mais eficiente, como:',
      { itens: ['Iluminação em LED', 'Reaproveitamento de água', 'Infraestrutura para veículos elétricos', 'Áreas compartilhadas inteligentes', 'Segurança automatizada'] },
      { titulo: 'Por que investir em um lançamento imobiliário em Jundiaí?' },
      'Jundiaí se consolidou como um dos mercados imobiliários mais fortes do estado de São Paulo. Diversos fatores explicam esse crescimento.',
      { titulo: 'Localização estratégica', nivel: 3 },
      'A cidade está situada entre São Paulo e Campinas, com acesso facilitado pelas Rodovias Anhanguera e Bandeirantes. Essa localização favorece moradores que trabalham em grandes centros, além de atrair empresas e novos investimentos.',
      { titulo: 'Qualidade de vida', nivel: 3 },
      'Jundiaí aparece constantemente entre os municípios com melhores indicadores do Brasil. Entre seus diferenciais estão:',
      { itens: ['Segurança', 'Mobilidade urbana', 'Áreas verdes', 'Parques', 'Escolas de qualidade', 'Hospitais', 'Comércio diversificado', 'Ampla oferta gastronômica'] },
      'Esses fatores aumentam a procura por imóveis e fortalecem o mercado local.',
      { titulo: 'Desenvolvimento econômico', nivel: 3 },
      'A cidade possui uma economia diversificada, com destaque para:',
      { itens: ['Indústria', 'Logística', 'Tecnologia', 'Comércio', 'Serviços'] },
      'Esse cenário contribui para a geração de empregos e mantém elevada a demanda por imóveis residenciais.',
      { titulo: 'Potencial de valorização', nivel: 3 },
      'Bairros em expansão, novos eixos comerciais e investimentos em infraestrutura fazem com que diversos lançamentos apresentem excelente perspectiva de valorização no médio e longo prazo.',
      { titulo: 'O que avaliar antes de financiar um lançamento?' },
      'Antes de fechar contrato, vale analisar alguns pontos importantes.',
      { titulo: 'Planejamento financeiro', nivel: 3 },
      'Avalie:',
      { itens: ['Valor disponível para entrada', 'Renda familiar', 'Reserva financeira', 'Capacidade de pagamento das parcelas'] },
      'O ideal é que o financiamento não comprometa excessivamente o orçamento mensal.',
      { titulo: 'Credibilidade da construtora', nivel: 3 },
      'Pesquisar o histórico da empresa ajuda a conhecer:',
      { itens: ['Empreendimentos entregues', 'Qualidade construtiva', 'Cumprimento de prazos', 'Reputação no mercado'] },
      { titulo: 'Localização', nivel: 3 },
      'Um bom imóvel também depende da região. Observe fatores como:',
      { itens: ['Acesso às principais vias', 'Comércio', 'Supermercados', 'Escolas', 'Hospitais', 'Transporte', 'Áreas de lazer'] },
      'Esses aspectos influenciam diretamente na valorização do imóvel.',
      { titulo: 'Perfil do empreendimento', nivel: 3 },
      'Cada lançamento atende públicos diferentes. Alguns são voltados para famílias, outros priorizam investidores ou jovens profissionais. Escolher um empreendimento alinhado ao seu objetivo aumenta a satisfação e o potencial de valorização.',
      { titulo: 'Vale a pena comprar um imóvel na planta?' },
      'Na maioria dos casos, sim. Além das condições facilitadas durante a construção, o comprador pode aproveitar:',
      { itens: ['Preços iniciais mais competitivos', 'Maior potencial de valorização', 'Possibilidade de escolher unidades mais bem localizadas', 'Maior prazo para organização financeira'] },
      'Para investidores, adquirir um imóvel ainda na planta costuma representar uma excelente estratégia patrimonial.',
      { titulo: 'Como a Lotus Brokers pode ajudar?' },
      'Comprar um lançamento envolve muito mais do que escolher um apartamento. É preciso analisar documentação, comparar empreendimentos, entender as condições de financiamento e identificar o imóvel mais adequado ao seu perfil.',
      'A Lotus Brokers acompanha todo esse processo. Nossa equipe oferece atendimento personalizado para apresentar os melhores lançamentos de Jundiaí, esclarecer dúvidas sobre financiamento e auxiliar em todas as etapas da compra.',
      'Com profundo conhecimento do mercado imobiliário local, ajudamos você a fazer uma escolha segura e estratégica.',
      { titulo: 'Perguntas frequentes' },
      { titulo: 'Posso financiar um imóvel ainda na planta?', nivel: 3 },
      'Sim. Durante a construção, normalmente são pagos os valores diretamente à construtora. Após a entrega do empreendimento, o saldo devedor costuma ser financiado junto a uma instituição financeira.',
      { titulo: 'É possível utilizar o FGTS?', nivel: 3 },
      'Dependendo das regras vigentes e do enquadramento do comprador, o FGTS pode ser utilizado para compor a entrada, amortizar o saldo devedor ou reduzir parcelas.',
      { titulo: 'Comprar um lançamento vale a pena?', nivel: 3 },
      'Para muitos compradores, sim. Os lançamentos costumam oferecer melhores condições comerciais, imóveis modernos e maior potencial de valorização.',
      { titulo: 'Quanto preciso ter de entrada?', nivel: 3 },
      'O valor varia conforme o empreendimento, a negociação com a construtora e a instituição financeira escolhida para o financiamento.',
      { titulo: 'Jundiaí continua sendo uma boa cidade para investir?', nivel: 3 },
      'Sim. A cidade reúne localização estratégica, economia forte, excelente infraestrutura e constante valorização imobiliária, fatores que mantêm o mercado aquecido.',
      { titulo: 'Conclusão' },
      'Entender como financiar um lançamento imobiliário é essencial para realizar uma compra segura e aproveitar as melhores oportunidades do mercado. Além de oferecer condições diferenciadas de pagamento, os lançamentos permitem adquirir imóveis modernos, com elevado potencial de valorização e excelente qualidade construtiva.',
      'Jundiaí continua entre os mercados imobiliários mais atrativos do interior paulista, combinando localização estratégica, qualidade de vida e crescimento econômico consistente.',
      'Se você está procurando um lançamento imobiliário ou deseja entender qual opção de financiamento faz mais sentido para o seu perfil, conte com a Lotus Brokers. Nossa equipe está preparada para apresentar as melhores oportunidades e acompanhar você em todas as etapas da compra do seu novo imóvel.',
    ],
  },
  {
    id: 'p000', cat: 'Mercado', date: 'Ago 2026', read: '8 min', img: '/blog/tendencias-lancamentos-jundiai.jpg', slot: 'blog-p000', title: 'Por que Jundiaí continua atraindo novos empreendimentos?', excerpt: 'Infraestrutura de lazer completa, plantas funcionais, sustentabilidade e tecnologia: as tendências que moldam os lançamentos imobiliários da cidade.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Os lançamentos em Jundiaí seguem sete tendências claras: infraestrutura de lazer completa, plantas mais funcionais, soluções sustentáveis, tecnologia de segurança e gestão, valorização de bairros em expansão, foco em qualidade de vida e projetos desenhados para diferentes perfis de comprador, de jovens profissionais a investidores.',
    body: [
      'Jundiaí reúne características que favorecem o crescimento do setor imobiliário e mantêm a cidade entre os destinos mais procurados por famílias e investidores.',
      'Sua localização estratégica entre São Paulo e Campinas, a excelente infraestrutura urbana e a qualidade de vida fazem com que novos lançamentos sejam planejados para atender uma demanda crescente por imóveis modernos e bem localizados.',
      'Além disso, o município possui uma economia diversificada, forte geração de empregos e investimentos constantes em mobilidade, educação, saúde e áreas de lazer, fatores que sustentam o desenvolvimento do mercado imobiliário.',
      { titulo: 'Empreendimentos com infraestrutura completa' },
      'Uma das principais tendências dos lançamentos imobiliários em Jundiaí é a oferta de condomínios com infraestrutura cada vez mais completa. Os novos projetos deixam de oferecer apenas um apartamento e passam a proporcionar uma experiência de moradia.',
      'É comum encontrar empreendimentos com:',
      { itens: ['Piscinas adulto e infantil', 'Academias equipadas', 'Salões de festas', 'Espaço gourmet', 'Brinquedotecas', 'Playground', 'Quadras esportivas', 'Coworking', 'Pet place', 'Espaços para delivery', 'Bicicletários', 'Áreas de convivência integradas'] },
      'Essa estrutura atende famílias, profissionais que trabalham em home office e pessoas que buscam praticidade no dia a dia.',
      { titulo: 'Plantas mais inteligentes e funcionais' },
      'Outra tendência marcante está no aproveitamento dos espaços internos. Os novos apartamentos são projetados para oferecer ambientes mais versáteis, confortáveis e adaptáveis às diferentes fases da vida dos moradores.',
      'Entre os diferenciais mais encontrados estão:',
      { itens: ['Integração entre sala e cozinha', 'Varanda gourmet', 'Suítes amplas', 'Espaços multifuncionais', 'Plantas flexíveis', 'Melhor iluminação natural', 'Ventilação cruzada'] },
      'Essas soluções aumentam o conforto e valorizam o imóvel ao longo do tempo.',
      { titulo: 'Sustentabilidade como diferencial' },
      'A preocupação ambiental deixou de ser apenas um diferencial e passou a fazer parte dos projetos imobiliários modernos. Os lançamentos em Jundiaí incorporam diversas soluções voltadas à sustentabilidade, como:',
      { itens: ['Iluminação em LED nas áreas comuns', 'Reaproveitamento de água da chuva', 'Torneiras com economia de água', 'Sensores de presença', 'Coleta seletiva', 'Paisagismo com espécies de baixa manutenção', 'Infraestrutura para carregamento de veículos elétricos'] },
      'Além de reduzir impactos ambientais, essas iniciativas podem contribuir para maior eficiência operacional do condomínio.',
      { titulo: 'Tecnologia aplicada à moradia' },
      'A tecnologia também tem transformado os lançamentos imobiliários. Os empreendimentos mais recentes oferecem recursos que proporcionam mais segurança, praticidade e conectividade. Entre eles, destacam-se:',
      { itens: ['Portaria remota ou inteligente', 'Controle de acesso digital', 'Fechaduras eletrônicas', 'Monitoramento por câmeras', 'Aplicativos para gestão condominial', 'Reservas online de áreas comuns', 'Infraestrutura para internet de alta velocidade'] },
      'Essas soluções acompanham o novo perfil de moradores, que valorizam comodidade e inovação.',
      { titulo: 'Valorização de bairros em expansão' },
      'Jundiaí continua registrando crescimento urbano em diversas regiões, impulsionando novos empreendimentos. Bairros que recebem investimentos em infraestrutura, comércio, mobilidade e serviços costumam atrair incorporadoras interessadas em desenvolver projetos residenciais modernos.',
      'Para quem busca investir, acompanhar essas áreas em expansão pode representar boas oportunidades de valorização patrimonial no médio e longo prazo.',
      { titulo: 'Condomínios com foco em qualidade de vida' },
      'A procura por imóveis vai além da localização. Os compradores valorizam empreendimentos capazes de oferecer bem-estar, segurança e convivência. Por isso, muitos lançamentos priorizam:',
      { itens: ['Áreas verdes', 'Praças internas', 'Espaços de contemplação', 'Trilhas para caminhada', 'Academias ao ar livre', 'Ambientes destinados ao lazer das crianças', 'Espaços para convivência entre moradores'] },
      'Essa tendência acompanha a busca crescente por equilíbrio entre vida profissional e qualidade de vida.',
      { titulo: 'Crescimento da demanda por imóveis para investimento' },
      'Jundiaí também se destaca pelo interesse de investidores. A combinação entre crescimento econômico, localização estratégica e constante valorização imobiliária torna a cidade atrativa para quem deseja construir patrimônio.',
      'Os lançamentos costumam despertar interesse por oferecer:',
      { itens: ['Potencial de valorização durante a obra', 'Imóveis novos com alta liquidez', 'Demanda consistente por locação', 'Projetos alinhados às exigências atuais do mercado'] },
      { titulo: 'Localização continua sendo decisiva' },
      'Mesmo com tantas inovações, a localização permanece como um dos fatores mais importantes na escolha de um imóvel. Empreendimentos próximos a escolas, supermercados, hospitais, parques, centros comerciais, rodovias e transporte público continuam apresentando maior procura e excelente perspectiva de valorização.',
      'Em Jundiaí, a facilidade de acesso às Rodovias Anhanguera e Bandeirantes é um diferencial que atrai moradores e investidores de diferentes regiões.',
      { titulo: 'Perfil dos compradores está mudando' },
      'Os lançamentos imobiliários acompanham a transformação do comportamento dos consumidores. Hoje, é comum encontrar empreendimentos pensados para diferentes públicos. Entre eles:',
      { titulo: 'Jovens profissionais', nivel: 3 },
      'Buscam apartamentos funcionais, boa localização, lazer e facilidade de deslocamento.',
      { titulo: 'Famílias', nivel: 3 },
      'Valorizam segurança, áreas de lazer, proximidade de escolas e infraestrutura completa.',
      { titulo: 'Investidores', nivel: 3 },
      'Analisam potencial de valorização, liquidez e demanda por locação.',
      { titulo: 'Pessoas em busca de qualidade de vida', nivel: 3 },
      'Priorizam condomínios com áreas verdes, tranquilidade e boa mobilidade urbana.',
      'Essa diversidade faz com que os lançamentos atendam diferentes necessidades sem abrir mão da qualidade construtiva.',
      { titulo: 'Como escolher um bom lançamento imobiliário?' },
      'Antes de tomar uma decisão, vale analisar alguns fatores importantes.',
      { titulo: 'Avalie a localização', nivel: 3 },
      'A região possui infraestrutura consolidada? Há perspectiva de crescimento? Como está a mobilidade urbana?',
      { titulo: 'Conheça a construtora', nivel: 3 },
      'Verifique o histórico da empresa, qualidade das entregas e reputação no mercado.',
      { titulo: 'Analise o projeto', nivel: 3 },
      'Observe:',
      { itens: ['Planta', 'Áreas comuns', 'Padrão construtivo', 'Diferenciais tecnológicos', 'Soluções sustentáveis'] },
      { titulo: 'Considere seu objetivo', nivel: 3 },
      'Quem pretende morar pode priorizar conforto e qualidade de vida. Já investidores costumam analisar potencial de valorização e facilidade de locação.',
      { titulo: 'Como a Lotus Brokers acompanha essas tendências?' },
      'A Lotus Brokers acompanha diariamente os principais lançamentos imobiliários de Jundiaí, identificando empreendimentos que unem localização estratégica, qualidade construtiva e potencial de valorização.',
      'Nossa equipe realiza uma análise criteriosa para apresentar opções alinhadas ao perfil de cada cliente, seja para moradia ou investimento.',
      'Além de conhecer os diferenciais de cada projeto, oferecemos suporte completo durante todo o processo de compra, proporcionando mais segurança na tomada de decisão.',
      { titulo: 'Perguntas frequentes' },
      { titulo: 'Os lançamentos imobiliários costumam valorizar?', nivel: 3 },
      'Em muitos casos, sim. Imóveis adquiridos ainda na fase inicial das obras podem apresentar valorização ao longo da construção, especialmente quando localizados em regiões em desenvolvimento.',
      { titulo: 'Vale a pena investir em lançamentos em Jundiaí?', nivel: 3 },
      'Jundiaí reúne fatores que favorecem investimentos imobiliários, como economia diversificada, localização estratégica, qualidade de vida e crescimento urbano consistente.',
      { titulo: 'Quais diferenciais os novos empreendimentos oferecem?', nivel: 3 },
      'Os lançamentos atuais costumam apresentar infraestrutura de lazer completa, tecnologias para segurança e gestão condominial, soluções sustentáveis e plantas mais funcionais.',
      { titulo: 'Os condomínios modernos possuem espaços para home office?', nivel: 3 },
      'Sim. Muitos empreendimentos incorporam coworkings, salas de reunião e áreas compartilhadas voltadas para quem trabalha remotamente.',
      { titulo: 'Como escolher o melhor lançamento?', nivel: 3 },
      'É importante considerar localização, reputação da construtora, infraestrutura do condomínio, potencial de valorização e compatibilidade do imóvel com seus objetivos.',
      { titulo: 'Conclusão' },
      'As principais tendências dos lançamentos imobiliários em Jundiaí mostram um mercado cada vez mais preparado para atender às novas necessidades dos compradores. Empreendimentos com infraestrutura completa, tecnologia, sustentabilidade, plantas inteligentes e excelente localização refletem a evolução do setor e contribuem para a valorização dos imóveis na cidade.',
      'Jundiaí continua entre os mercados imobiliários mais atrativos do interior paulista, oferecendo oportunidades para quem deseja morar com qualidade de vida ou investir em uma região com forte potencial de crescimento.',
      'Conte com a Lotus Brokers para conhecer os principais lançamentos imobiliários de Jundiaí e encontrar o imóvel ideal de acordo com seu perfil, objetivos e planejamento.',
    ],
  },
  {
    id: 'p00', cat: 'Guia', date: 'Ago 2026', read: '9 min', img: '/blog/imovel-na-planta.jpg', slot: 'blog-p00', title: 'Como comprar imóvel na planta com segurança? Guia completo para investir com tranquilidade em Jundiaí', excerpt: 'Saiba mais sobre como comprar imóvel na planta com segurança e descubra oportunidades, tendências e informações relevantes para quem busca imóveis em Jundiaí.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Comprar na planta compensa quando há preparo: pesquise a construtora, leia o memorial descritivo, confirme o registro da incorporação, avalie a localização e planeje o orçamento além do preço do imóvel, entrada, ITBI, registro e o financiamento do saldo após a entrega das chaves.',
    body: [
      'Comprar um imóvel na planta pode ser uma excelente oportunidade para quem deseja conquistar a casa própria ou investir em um patrimônio com alto potencial de valorização. Além de oferecer condições de pagamento mais flexíveis, os lançamentos imobiliários costumam reunir projetos modernos, infraestrutura completa e localização estratégica.',
      'No entanto, para que a compra seja realmente vantajosa, é fundamental tomar alguns cuidados antes de assinar o contrato.',
      'Como comprar um imóvel na planta com segurança? Essa é uma das principais dúvidas de quem pesquisa o mercado imobiliário em Jundiaí, cidade que vem se destacando pela qualidade de vida, crescimento urbano e valorização constante dos imóveis.',
      'Neste guia, a Lotus Brokers reúne orientações práticas para ajudar você a fazer uma compra segura, conhecer os principais pontos de atenção e identificar boas oportunidades no mercado imobiliário de Jundiaí.',
      { titulo: 'Por que comprar um imóvel na planta?' },
      'Os lançamentos imobiliários atraem milhares de compradores todos os anos por oferecerem benefícios que muitas vezes não estão disponíveis em imóveis prontos. Entre as principais vantagens estão:',
      { itens: ['Condições facilitadas de pagamento', 'Possibilidade de parcelamento da entrada', 'Imóveis novos e modernos', 'Menor necessidade de manutenção', 'Potencial de valorização durante a construção', 'Infraestrutura de lazer atualizada', 'Plantas mais inteligentes e funcionais'] },
      'Quando a compra é feita com planejamento e orientação especializada, o imóvel na planta pode representar uma excelente decisão financeira.',
      { titulo: 'Pesquise a reputação da construtora' },
      'O primeiro passo para comprar com segurança é conhecer a empresa responsável pelo empreendimento. Antes de fechar negócio, procure informações sobre:',
      { itens: ['Histórico da construtora', 'Empreendimentos já entregues', 'Cumprimento de prazos', 'Qualidade das obras', 'Reputação junto aos clientes', 'Experiência no mercado'] },
      'Uma empresa sólida transmite mais confiança e reduz riscos durante o processo de compra.',
      { titulo: 'Analise cuidadosamente o memorial descritivo' },
      'Muitos compradores concentram sua atenção apenas nas imagens do apartamento decorado. Entretanto, o documento mais importante é o memorial descritivo. Nele estão especificados diversos detalhes do empreendimento, como:',
      { itens: ['Materiais de acabamento', 'Revestimentos', 'Equipamentos das áreas comuns', 'Especificações técnicas', 'Itens entregues nas unidades'] },
      'Esse documento faz parte do contrato e serve como referência para a entrega do imóvel.',
      { titulo: 'Verifique a documentação do empreendimento' },
      'Antes da compra, é importante confirmar se o lançamento possui toda a documentação necessária. Entre os principais documentos estão:',
      { itens: ['Registro da incorporação imobiliária', 'Aprovação dos órgãos competentes', 'Licenças exigidas', 'Matrícula do terreno'] },
      'Essas informações garantem maior segurança jurídica para o comprador.',
      { titulo: 'Avalie a localização' },
      'A localização continua sendo um dos fatores mais importantes para a valorização de um imóvel. Em Jundiaí, vale observar aspectos como:',
      { itens: ['Proximidade de escolas', 'Supermercados', 'Hospitais', 'Parques', 'Centros comerciais', 'Acesso às Rodovias Anhanguera e Bandeirantes', 'Transporte público', 'Infraestrutura urbana'] },
      'Regiões bem estruturadas tendem a apresentar maior valorização e liquidez.',
      { titulo: 'Conheça o potencial de valorização' },
      'Um dos principais motivos que levam investidores a comprar imóveis na planta é o potencial de valorização. Empreendimentos adquiridos no início das vendas podem apresentar aumento de valor ao longo da construção, principalmente quando estão localizados em bairros em expansão.',
      'Em Jundiaí, o crescimento urbano e os investimentos em infraestrutura contribuem para esse cenário positivo.',
      { titulo: 'Planeje seu orçamento' },
      'Antes da compra, faça um planejamento financeiro detalhado. Considere não apenas o valor do imóvel, mas também despesas como:',
      { itens: ['Entrada', 'Parcelas durante a obra', 'Documentação', 'Registro do imóvel', 'ITBI', 'Financiamento após a entrega das chaves', 'Custos de mudança e mobília'] },
      'Um planejamento adequado evita dificuldades futuras.',
      { titulo: 'Entenda como funciona o pagamento' },
      'Ao comprar um imóvel na planta, normalmente existem duas etapas financeiras.',
      { titulo: 'Durante a construção', nivel: 3 },
      'O comprador realiza os pagamentos previstos em contrato diretamente para a construtora. Esses valores costumam incluir:',
      { itens: ['Entrada', 'Parcelas mensais', 'Parcelas intermediárias', 'Reforços anuais, quando previstos'] },
      { titulo: 'Após a entrega', nivel: 3 },
      'Depois da conclusão das obras, o saldo restante geralmente é financiado junto a uma instituição financeira. Nesse momento, o banco realiza a análise de crédito para aprovar o financiamento.',
      { titulo: 'Visite o decorado e conheça o projeto' },
      'Mesmo sendo um imóvel ainda em construção, é possível conhecer diversos detalhes do empreendimento. Sempre que possível:',
      { itens: ['Visite o apartamento decorado', 'Observe a planta humanizada', 'Conheça a maquete', 'Analise as áreas comuns', 'Esclareça dúvidas com a equipe de vendas'] },
      'Essas informações ajudam a visualizar melhor o projeto final.',
      { titulo: 'Avalie a infraestrutura do condomínio' },
      'Os lançamentos atuais oferecem muito mais do que apenas apartamentos. Hoje é comum encontrar condomínios com:',
      { itens: ['Academia', 'Piscinas', 'Espaço gourmet', 'Coworking', 'Brinquedoteca', 'Pet place', 'Playground', 'Salão de festas', 'Bicicletário', 'Espaços para delivery', 'Áreas verdes'] },
      'Esses diferenciais aumentam o conforto e também influenciam na valorização do imóvel.',
      { titulo: 'Observe o perfil da região' },
      'Além do condomínio, é importante entender como é o bairro. Pergunte-se:',
      { itens: ['A região está em crescimento?', 'Existem novos empreendimentos próximos?', 'Há comércio suficiente?', 'O acesso é fácil?', 'Existe potencial de valorização?'] },
      'Esses fatores impactam diretamente no retorno do investimento.',
      { titulo: 'Conte com uma imobiliária especializada' },
      'Comprar um imóvel envolve diversas etapas técnicas. Ter o apoio de uma imobiliária experiente faz toda a diferença. Uma consultoria especializada pode auxiliar na:',
      { itens: ['Escolha do empreendimento', 'Análise contratual', 'Comparação entre lançamentos', 'Avaliação do potencial de valorização', 'Negociação das melhores condições'] },
      'Esse acompanhamento proporciona mais segurança durante toda a jornada de compra.',
      { titulo: 'Por que Jundiaí é uma excelente cidade para comprar um imóvel na planta?' },
      'Jundiaí reúne características que favorecem tanto quem deseja morar quanto quem pretende investir. Entre seus principais diferenciais estão:',
      { titulo: 'Localização estratégica', nivel: 3 },
      'A cidade está situada entre São Paulo e Campinas, com acesso rápido às principais rodovias do estado.',
      { titulo: 'Economia forte', nivel: 3 },
      'O município possui setores consolidados na indústria, logística, comércio, tecnologia e serviços. Essa diversidade econômica impulsiona a demanda por imóveis.',
      { titulo: 'Qualidade de vida', nivel: 3 },
      'Jundiaí oferece:',
      { itens: ['Excelente infraestrutura urbana', 'Segurança', 'Hospitais de referência', 'Escolas renomadas', 'Áreas verdes', 'Parques', 'Ampla oferta gastronômica', 'Centros comerciais'] },
      'Esses fatores tornam a cidade uma das mais desejadas do interior paulista.',
      { titulo: 'Mercado imobiliário aquecido', nivel: 3 },
      'O constante lançamento de novos empreendimentos demonstra a confiança das incorporadoras no potencial da cidade. Esse cenário amplia as oportunidades para compradores e investidores.',
      { titulo: 'Como a Lotus Brokers pode ajudar?' },
      'Comprar um imóvel na planta exige conhecimento do mercado, análise documental e avaliação das melhores oportunidades.',
      'A Lotus Brokers acompanha diariamente os principais lançamentos imobiliários de Jundiaí e oferece atendimento consultivo para apresentar empreendimentos alinhados ao perfil de cada cliente.',
      'Nossa equipe auxilia desde a escolha do imóvel até a negociação, esclarecendo dúvidas sobre financiamento, documentação e potencial de valorização. Assim, você realiza sua compra com mais segurança, tranquilidade e confiança.',
      { titulo: 'Perguntas frequentes' },
      { titulo: 'Comprar um imóvel na planta é seguro?', nivel: 3 },
      'Sim, desde que o comprador verifique a documentação do empreendimento, pesquise a reputação da construtora e conte com orientação especializada durante a negociação.',
      { titulo: 'O imóvel costuma valorizar durante a construção?', nivel: 3 },
      'Em muitos casos, sim. Principalmente quando o empreendimento está localizado em regiões com forte crescimento urbano e alta demanda imobiliária.',
      { titulo: 'Posso financiar um imóvel na planta?', nivel: 3 },
      'Sim. Normalmente existe uma etapa de pagamento à construtora durante a obra e, posteriormente, o financiamento do saldo devedor junto a uma instituição financeira.',
      { titulo: 'Vale a pena investir em imóveis na planta em Jundiaí?', nivel: 3 },
      'Jundiaí reúne localização estratégica, economia sólida, excelente qualidade de vida e constante valorização imobiliária, tornando-se uma das cidades mais atrativas do interior paulista para esse tipo de investimento.',
      { titulo: 'Qual o principal cuidado antes da compra?', nivel: 3 },
      'Pesquisar a construtora, analisar a documentação do empreendimento, compreender o contrato e avaliar a localização são etapas fundamentais para uma compra segura.',
      { titulo: 'Conclusão' },
      'Saber como comprar um imóvel na planta com segurança é essencial para aproveitar todas as vantagens que os lançamentos imobiliários oferecem. Ao pesquisar a construtora, analisar a documentação, escolher uma boa localização e realizar um planejamento financeiro adequado, você reduz riscos e aumenta as chances de fazer um excelente investimento.',
      'Jundiaí continua entre os mercados imobiliários mais atrativos do interior paulista, reunindo qualidade de vida, infraestrutura completa e grande potencial de valorização.',
      'Conte com a Lotus Brokers para encontrar os melhores lançamentos imobiliários e receber uma consultoria especializada em todas as etapas da compra. Nossa equipe está pronta para ajudar você a conquistar o imóvel ideal com segurança e tranquilidade.',
    ],
  },
  {
    id: 'p0', cat: 'Guia', date: 'Ago 2026', read: '7 min', img: '/blog/melhores-bairros-jundiai.jpg', slot: 'blog-p0', title: 'Melhores bairros para morar em Jundiaí: guia completo para escolher o lugar ideal', excerpt: 'Jardim Ana Maria, Malota, Engordadouro, Bonfiglioli, Eloy Chaves, Medeiros e Vila Arens: o perfil de cada região e o que pesa na escolha.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Sete bairros concentram a procura em Jundiaí: Jardim Ana Maria e Vila Arens pela praticidade perto do centro; Malota e Eloy Chaves pela tranquilidade e pela Serra do Japi; Engordadouro e Medeiros pelo ritmo de lançamentos e potencial de valorização; e o Jardim Bonfiglioli pelo equilíbrio entre os dois lados.',
    body: [
      'Jundiaí está entre as cidades mais desejadas do interior de São Paulo para quem busca qualidade de vida, segurança e valorização imobiliária. Sua localização estratégica entre São Paulo e Campinas, aliada à excelente infraestrutura urbana, faz com que a procura por imóveis em Jundiaí cresça ano após ano.',
      'Se você está pesquisando os melhores bairros para morar em Jundiaí, seja para viver com a família, investir ou comprar seu primeiro imóvel, conhecer as características de cada região é fundamental para tomar uma decisão segura.',
      'Neste guia, a Lotus Brokers apresenta os bairros mais valorizados da cidade, seus diferenciais e as oportunidades que fazem de Jundiaí um dos mercados imobiliários mais promissores do estado.',
      { titulo: 'Por que morar em Jundiaí?' },
      'Antes de escolher o bairro ideal, vale entender por que tantas pessoas estão migrando para a cidade. Jundiaí reúne fatores que atraem moradores e investidores:',
      {
        itens: [
          'Fácil acesso às Rodovias Anhanguera e Bandeirantes',
          'Excelente oferta de escolas e universidades',
          'Rede completa de hospitais e serviços',
          'Alto índice de segurança em comparação com grandes centros',
          'Grande oferta de áreas verdes e lazer',
          'Economia diversificada e geração constante de empregos',
        ],
      },
      'Esses fatores contribuem diretamente para a valorização dos imóveis em Jundiaí e tornam a cidade uma excelente opção para quem busca qualidade de vida sem abrir mão da proximidade com a capital paulista.',
      { titulo: '1. Jardim Ana Maria' },
      'O Jardim Ana Maria é um dos bairros mais tradicionais e valorizados de Jundiaí. Sua localização privilegiada oferece acesso rápido ao centro da cidade e às principais avenidas, além da proximidade com supermercados, escolas particulares, clínicas médicas, academias e restaurantes.',
      'O bairro é bastante procurado por famílias e profissionais que desejam praticidade no dia a dia.',
      'Perfil dos imóveis:',
      { itens: ['Apartamentos de alto padrão', 'Coberturas', 'Condomínios modernos'] },
      'Potencial de valorização: alto.',
      { titulo: '2. Malota' },
      'A Malota é referência quando o assunto é exclusividade e contato com a natureza. Com ruas arborizadas, condomínios fechados e vista privilegiada da Serra do Japi, a região atrai famílias que priorizam tranquilidade e segurança.',
      'Apesar do ambiente residencial, o bairro possui fácil acesso às principais vias da cidade. É um dos locais mais desejados por quem procura casas de alto padrão em Jundiaí.',
      { titulo: '3. Engordadouro' },
      'Nos últimos anos, o Engordadouro passou por um intenso processo de desenvolvimento imobiliário. Diversos condomínios horizontais e verticais foram lançados na região, tornando o bairro uma excelente escolha para famílias jovens e investidores.',
      'Entre seus diferenciais estão:',
      { itens: ['Fácil acesso à Rodovia Anhanguera', 'Novos empreendimentos', 'Comércio em expansão', 'Excelente custo-benefício'] },
      'O potencial de valorização continua elevado devido ao crescimento da infraestrutura local.',
      { titulo: '4. Jardim Bonfiglioli' },
      'Para quem deseja morar próximo ao centro sem abrir mão de tranquilidade, o Jardim Bonfiglioli é uma excelente opção. O bairro oferece ampla estrutura comercial e serviços essenciais, além de contar com imóveis que atendem diferentes perfis de compradores.',
      'É muito procurado tanto para moradia quanto para investimento.',
      { titulo: '5. Eloy Chaves' },
      'O Eloy Chaves tornou-se praticamente uma cidade dentro de Jundiaí. Com comércio completo, escolas, supermercados, farmácias, restaurantes e acesso facilitado às rodovias, a região oferece excelente qualidade de vida.',
      'Outro diferencial é a proximidade com a Serra do Japi, proporcionando clima agradável e diversas opções de lazer ao ar livre. É um dos bairros que mais atraem famílias.',
      { titulo: '6. Medeiros' },
      'O Medeiros vem registrando um dos maiores crescimentos imobiliários da cidade. Grandes incorporadoras investiram na região, trazendo condomínios modernos com infraestrutura completa.',
      'Entre as vantagens estão:',
      { itens: ['Fácil acesso às rodovias', 'Novos empreendimentos', 'Excelente potencial de valorização', 'Boa oferta de áreas verdes'] },
      'É uma região bastante procurada por quem deseja comprar apartamento em Jundiaí.',
      { titulo: '7. Vila Arens' },
      'A Vila Arens combina tradição com desenvolvimento urbano. Além da proximidade com o centro, possui forte comércio local, escolas, hospitais e acesso facilitado ao transporte público.',
      'É uma excelente alternativa para quem procura imóveis bem localizados e com grande liquidez.',
      { titulo: 'Como escolher o melhor bairro em Jundiaí?' },
      'A resposta depende dos seus objetivos. Quem busca praticidade pode priorizar bairros próximos ao centro. Já famílias costumam preferir regiões com condomínios fechados, áreas verdes e maior tranquilidade.',
      'Para investidores, bairros em expansão como Medeiros e Engordadouro apresentam excelente potencial de valorização nos próximos anos.',
      'Antes da compra, vale considerar fatores como:',
      { itens: ['Tempo de deslocamento', 'Infraestrutura da região', 'Segurança', 'Perfil do imóvel', 'Potencial de valorização'] },
      'Contar com uma imobiliária especializada faz toda a diferença para encontrar oportunidades alinhadas ao seu perfil.',
      { titulo: 'O mercado imobiliário de Jundiaí continua em crescimento' },
      'O mercado imobiliário de Jundiaí permanece aquecido graças ao crescimento econômico da cidade, à constante chegada de novos empreendimentos e à alta procura por imóveis de qualidade.',
      'Além da valorização consistente, a cidade oferece excelente liquidez para quem deseja investir em apartamentos, casas ou terrenos. Esse cenário torna Jundiaí uma das melhores opções do interior paulista tanto para moradia quanto para investimento imobiliário de longo prazo.',
      { titulo: 'Encontre o imóvel ideal com a Lotus Brokers' },
      'Escolher entre os melhores bairros para morar em Jundiaí fica muito mais fácil com o apoio de especialistas que conhecem profundamente o mercado local.',
      'A Lotus Brokers acompanha as principais oportunidades da cidade e oferece atendimento personalizado para quem deseja comprar, vender ou investir em imóveis em Jundiaí.',
      'Seja para encontrar um apartamento moderno, uma casa em condomínio ou um imóvel para investimento, conte com uma equipe preparada para ajudar você a fazer a melhor escolha.',
    ],
  },
  {
    id: 'p1', cat: 'Mercado', date: 'Jun 2026', read: '7 min', img: '/forest-houses/a000.jpg', slot: 'blog-p1', title: 'Onde morar em Jundiaí em 2026: 5 bairros em ascensão', excerpt: 'A cidade cresce para além do centro. Veja os bairros que combinam infraestrutura, verde e valorização.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Eloy Chaves, Medeiros, Malota, Jardim do Lago e a região do Engordadouro combinam infraestrutura consolidada, áreas verdes e procura crescente e concentram boa parte das buscas por imóveis em Jundiaí em 2026.',
    body: [
      'Jundiaí sempre foi uma cidade de bairros fortes, cada um com identidade própria. Mas nos últimos anos, alguns deles passaram a concentrar a atenção de quem busca qualidade de vida sem abrir mão de estar perto de tudo.',
      'Eloy Chaves segue como o queridinho das famílias: ruas arborizadas, escolas por perto e a Serra do Japi a dez minutos. Medeiros cresce com condomínios novos e comércio de bairro cada vez mais completo. A Malota atrai quem quer casas maiores e tranquilidade.',
      'O Jardim do Lago e a região do Engordadouro entram na lista pela combinação de preço ainda acessível com localização estratégica, perto dos acessos e do centro.',
      'O que esses bairros têm em comum? Infraestrutura pronta, verde de verdade e liquidez: imóveis bem precificados nessas regiões não ficam muito tempo no mercado.',
      'Se você está pensando em comprar (ou vender) em um deles, converse com um especialista que conhece cada rua, é isso que muda o resultado da negociação.',
    ],
  },
  {
    id: 'p2', cat: 'Guia', date: 'Jun 2026', read: '6 min', img: '/blog/financiamento-2026.jpg', slot: 'blog-p2', title: 'Financiamento em 2026: o que muda e como se preparar', excerpt: 'Taxas, documentação e o passo a passo para chegar ao banco com aprovação quase garantida.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Para financiar bem em 2026: organize a documentação de renda, cuide do score, compare bancos (as taxas variam mais do que parece) e faça a pré-aprovação antes de escolher o imóvel.',
    body: [
      'A pergunta mais comum de quem quer comprar o primeiro imóvel continua sendo a mesma: "será que o banco aprova?". A boa notícia é que a aprovação depende menos de sorte e mais de preparo.',
      'O primeiro passo é entender a regra dos 30%: os bancos esperam que a parcela não comprometa mais do que cerca de um terço da renda familiar bruta. Somar a renda de duas pessoas no mesmo financiamento é permitido e muito comum.',
      'O segundo é a documentação: comprovantes de renda organizados, declaração de imposto de renda em dia e nome limpo. Trabalhadores autônomos conseguem financiar, sim, com extratos e histórico bem apresentados.',
      'Terceiro: compare. A diferença de taxa entre bancos pode significar dezenas de milhares de reais ao longo do contrato. Vale simular em pelo menos três instituições, ou pedir para a Lotus fazer isso por você.',
      'Por fim, faça a pré-aprovação antes de se apaixonar por um imóvel. Com o crédito aprovado, você negocia com força de comprador à vista.',
    ],
  },
  {
    id: 'p3', cat: 'Região', date: 'Mai 2026', read: '5 min', img: '/terrace-serra-do-japi/a000.jpg', slot: 'blog-p3', title: 'Serra do Japi: o que ter a serra por perto muda no seu dia', excerpt: 'Mais que paisagem: como a reserva influencia clima, lazer e valorização dos bairros vizinhos.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'A Serra do Japi é uma das maiores reservas de mata atlântica do interior paulista. Morar perto dela significa clima mais ameno, trilhas e lazer de fim de semana e bairros vizinhos historicamente mais valorizados.',
    body: [
      'Quem mora em Jundiaí fala da Serra do Japi com a naturalidade de quem fala de um vizinho querido. Mas o impacto dela no dia a dia vai muito além da vista bonita.',
      'Primeiro, o clima: as áreas próximas da serra são visivelmente mais frescas no verão. Segundo, o lazer: trilhas, cachoeiras e estradas de terra para pedalar a minutos de casa.',
      'E há o efeito no mercado: bairros na região da serra, como Eloy Chaves e Malota, e os condomínios de Itupeva, mantêm procura constante justamente por essa combinação de natureza com cidade.',
      'Para quem vem de fora, é o argumento que resume a mudança: qualidade de vida que não depende de viajar no fim de semana.',
    ],
  },
  {
    id: 'p4', cat: 'Cidade', date: 'Mai 2026', read: '4 min', img: '/gran-ville-santo-angelo/a000.jpg', slot: 'blog-p4', title: 'Itupeva em crescimento: por que a cidade atrai novas famílias', excerpt: 'Condomínios, indústria e a serra ao lado: o retrato de uma das cidades que mais crescem na região.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Itupeva cresce puxada por condomínios de casas, novos empregos e preço mais acessível que o de Jundiaí, mantendo acesso rápido à Anhanguera, perfil ideal para famílias que querem espaço.',
    body: [
      'Itupeva vive um momento raro: cresce em população, em empregos e em infraestrutura ao mesmo tempo, sem perder o jeito de cidade tranquila.',
      'O motor são os condomínios de casas. Famílias que buscavam espaço e segurança encontraram na cidade lotes maiores e um custo de vida mais leve que o dos grandes centros.',
      'A localização ajuda: acesso direto à Anhanguera, Jundiaí ao lado e Campinas e São Paulo a distâncias viáveis para o trabalho híbrido.',
      'Para quem investe, o raciocínio é simples: cidade em crescimento, com demanda real de moradia, tende a valorizar. Para quem vai morar, o argumento é ainda melhor: qualidade de vida agora, não daqui a dez anos.',
    ],
  },
  {
    id: 'p5', cat: 'Guia', date: 'Abr 2026', read: '5 min', img: '/vistta-castanho/a000.jpg', slot: 'blog-p5', title: 'Vender um imóvel: os 5 erros que mais atrasam a venda', excerpt: 'Do preço errado à foto escura, o que segura um imóvel no mercado e como evitar.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Os erros que mais atrasam uma venda: preço fora do mercado, fotos ruins, anúncio genérico, visitas sem filtro e documentação desorganizada. Todos têm solução e ela começa pela avaliação correta.',
    body: [
      'Um imóvel que demora para vender quase nunca tem um problema, tem um conjunto de pequenos erros que se somam.',
      'O primeiro e mais grave é o preço fora da realidade. Imóvel caro demais não gera visita; e sem visita, não há negociação. A avaliação com comparáveis reais do bairro resolve isso de saída.',
      'O segundo é a apresentação: fotos escuras, tortas ou de celular derrubam o interesse antes mesmo da leitura do anúncio. Fotografia profissional não é luxo, é conversão.',
      'Depois vêm o anúncio genérico (que não conta a história do imóvel), as visitas sem filtro (curiosos consomem seu tempo e desgastam o imóvel) e a documentação desorganizada, que trava a negociação na reta final.',
      'A boa notícia: todos os cinco têm solução, e ela começa por uma avaliação honesta. Se quiser, a Lotus faz a sua gratuitamente.',
    ],
  },
  {
    id: 'p6', cat: 'Mercado', date: 'Abr 2026', read: '6 min', img: '/vigore/a00.jpg', slot: 'blog-p6', title: 'Comprar na planta ou pronto: qual faz mais sentido pra você', excerpt: 'Preço, prazo, personalização e risco, a comparação honesta entre os dois caminhos.', author: 'Equipe Lotus', role: 'Squad de conteúdo',
    tldr: 'Na planta: melhor preço de entrada, pagamento diluído e valorização até a chave, mas exige esperar a obra. Pronto: mudança imediata e o que você vê é o que você leva, mas o preço já embute a valorização. A escolha depende do seu prazo e momento.',
    body: [
      'É uma das dúvidas mais comuns de quem chega até a gente: "compro na planta ou um imóvel pronto?". A resposta certa depende de uma pergunta anterior: quando você precisa morar?',
      'Se a mudança pode esperar dois ou três anos, a planta costuma render mais: o preço de tabela de lançamento é menor, a entrada é diluída durante a obra e a valorização até a entrega vem como bônus.',
      'Se a necessidade é imediata, casamento, mudança de cidade, filho a caminho, o imóvel pronto vence: você vê exatamente o que está comprando e resolve a vida agora.',
      'Há ainda o meio-termo: empreendimentos em fase final de obra, que unem prazo curto com condições de construtora.',
      'O importante é decidir com dado, não com ansiedade. Um especialista que conhece os dois mercados te ajuda a colocar os números lado a lado.',
    ],
  },
];

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

export default function LotusBlog({
  whatsapp = WHATSAPP_DEFAULT,
}: {
  whatsapp?: string;
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
        itemListElement: POSTS.map((p, i) => ({
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

  const featuredRaw = POSTS[0];
  const featured = { ...featuredRaw, open: () => openArt(featuredRaw.id) };

  const rest = POSTS.filter((p) => (cat === 'all' ? p.id !== featuredRaw.id : p.cat === cat));
  const cats = CATS.map((c) => ({
    label: c.label,
    select: () => setCat(c.id),
    style: cat === c.id ? chipOn : chipOff,
  }));
  const postsView = rest.map((p) => ({ ...p, open: () => openArt(p.id) }));

  const artRaw = POSTS.find((p) => p.id === artId) || POSTS[0];
  const art = artRaw;
  const related = POSTS.filter((p) => p.id !== artRaw.id)
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
