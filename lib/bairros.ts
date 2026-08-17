/**
 * Guias de bairro — fonte única do conteúdo editorial de /lotus-bairro.
 *
 * Bairro não é dado transacional (não vive no Supabase); é conteúdo de guia.
 * Aqui fica o texto de cada bairro, todo ele conteúdo real enviado pela Lotus.
 * Nada aqui é estimado ou preenchido "para completar a página": campo sem
 * informação fica vazio e a seção correspondente some (ver `dados`).
 *
 * Os imóveis de cada bairro NÃO ficam aqui: vêm do banco, filtrados por bairro
 * (ver getImoveisPorBairro em lib/imoveis.ts).
 *
 * O índice (/lotus-bairro) agrupa por `cidade` sozinho, na ordem em que as
 * cidades aparecem no array BAIRROS. Para publicar uma cidade nova basta somar
 * os bairros dela aqui.
 */

export type BairroFaq = { q: string; a: string };
export type BairroGuideItem = { num: string; title: string; text: string };
export type BairroStat = { value: string; label: string };
export type BairroDado = {
  value: string;
  count: number;
  prefix?: string;
  suffix?: string;
  sep?: boolean;
  label: string;
};

export type Bairro = {
  slug: string;
  nome: string;
  cidade: string;
  /** Chamada curta do hero. */
  tagline: string;
  /** Imagem do hero (caminho em public/ ou URL). '' cai no gradiente. */
  heroImg: string;
  /** 4 mini-stats do topo. */
  stats: BairroStat[];
  /** Parágrafo de resumo (bloco "Em resumo"). */
  tldr: string;
  /** Guia (6 blocos numerados). */
  guide: BairroGuideItem[];
  /** Dados de mercado (contador animado). */
  dados: BairroDado[];
  /** Tipologias mais comuns (chips). */
  tipologias: string[];
  /** FAQ do bairro. */
  faq: BairroFaq[];
  /** Query do embed do Google Maps (ex "Eloy Chaves, Jundiaí, SP"). */
  mapQuery: string;
  /** Conteúdo real preenchido? (false = placeholders a revisar). */
  publicado: boolean;
};

// Eloy Chaves — conteúdo real (portado do componente original).
const eloyChaves: Bairro = {
  slug: 'eloy-chaves',
  nome: 'Eloy Chaves',
  cidade: 'Jundiaí',
  tagline:
    'Na zona oeste de Jundiaí, o Parque Residencial Eloy Chaves equilibra tranquilidade residencial, infraestrutura completa e a Serra do Japi ao lado.',
  // Foto própria do bairro. Antes apontava para /gran-ville-santo-angelo/,
  // emprestando um render de landing — mexer naquela pasta trocaria a imagem
  // aqui sem aviso. Fotos de bairro agora vivem em /public/bairros/.
  heroImg: '/bairros/eloy-chaves.jpg',
  stats: [
    { value: 'R$ 7.500', label: 'preço médio do m² (compra)' },
    { value: 'Famílias', label: 'perfil predominante' },
    { value: '~12 min', label: 'até o centro de Jundiaí' },
    { value: '~10 min', label: 'até a Serra do Japi' },
  ],
  tldr:
    'O Parque Residencial Eloy Chaves, na zona oeste de Jundiaí, é um dos bairros mais desejados da cidade para quem busca qualidade de vida, segurança, infraestrutura completa e contato com a natureza. Com origem ligada à antiga Fazenda Ermida, cresceu de forma planejada e se consolidou como uma região valorizada, de forte perfil familiar e grande potencial imobiliário.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O Eloy Chaves se destaca pelo equilíbrio entre tranquilidade residencial e praticidade urbana. É um bairro de perfil familiar, com ruas arborizadas e rotina calma, mas com tudo o que o dia a dia pede a poucos minutos.' },
    { num: '2', title: 'História e formação', text: 'A origem do bairro está ligada à antiga Fazenda Ermida. A partir dela, a região cresceu de forma planejada e se consolidou como uma das áreas mais valorizadas de Jundiaí, com grande potencial imobiliário.' },
    { num: '3', title: 'Comércio e serviços', text: 'O bairro oferece uma ampla rede de comércios e serviços: supermercados, farmácias, escolas, academias, restaurantes, agências bancárias e comércio diversificado, tudo dentro da própria região.' },
    { num: '4', title: 'Transporte e acessos', text: 'Com fácil acesso às Rodovias Anhanguera e Bandeirantes, é uma excelente opção para quem se desloca diariamente para outras regiões de Jundiaí, Campinas ou São Paulo.' },
    { num: '5', title: 'Lazer e natureza', text: 'Um grande diferencial é a proximidade com a Serra do Japi e com o Parque Botânico Eloy Chaves, que oferecem lazer ao ar livre, caminhadas, trilhas e descanso em meio ao verde.' },
    { num: '6', title: 'Condomínios e perfil imobiliário', text: 'A região abriga condomínios residenciais reconhecidos pela segurança e pela qualidade de vida. Para quem busca morar bem ou investir numa região sólida e em constante valorização, é uma das escolhas mais completas da cidade.' },
  ],
  dados: [
    { value: 'R$ 7.500', count: 7500, prefix: 'R$ ', sep: true, label: 'm² médio · compra' },
    { value: 'R$ 32', count: 32, prefix: 'R$ ', label: 'm² médio · locação' },
    { value: '+8%', count: 8, prefix: '+', suffix: '%', label: 'valorização · 12 meses' },
    { value: '68 dias', count: 68, suffix: ' dias', label: 'tempo médio de venda' },
  ],
  tipologias: ['Casa térrea', 'Casa em condomínio', 'Sobrado', 'Apartamento 3 dorms'],
  faq: [
    { q: 'Eloy Chaves é um bom bairro para famílias?', a: 'É um dos mais procurados por famílias em Jundiaí: ruas arborizadas e tranquilas, boas escolas a poucos minutos, comércio de bairro no dia a dia e a Serra do Japi e parques por perto.' },
    { q: 'Quanto custa morar em Eloy Chaves?', a: 'O m² para compra fica em torno de R$ 7.500. Casas variam de R$ 600 mil a R$ 2,5 milhões; apartamentos a partir de cerca de R$ 450 mil. Locação de casa parte de aproximadamente R$ 3.000/mês.' },
    { q: 'Quais condomínios existem em Eloy Chaves?', a: 'A região concentra condomínios de casas e loteamentos fechados, além de ruas residenciais abertas. Fale com a gente que indicamos o melhor para o seu perfil.' },
    { q: 'Eloy Chaves é seguro?', a: 'É percebido como um dos bairros mais tranquilos de Jundiaí, com forte presença residencial e ruas movimentadas por moradores. Como em qualquer lugar, varia por trecho, a gente te orienta com honestidade.' },
  ],
  mapQuery: 'Eloy Chaves, Jundiaí, SP',
  publicado: true,
};

// Vianelo Bonfiglioli — conteúdo real.
const vianeloBonfiglioli: Bairro = {
  slug: 'vianelo-bonfiglioli',
  nome: 'Vianelo Bonfiglioli',
  cidade: 'Jundiaí',
  tagline:
    'Numa região central de Jundiaí, um dos bairros mais tradicionais da cidade, infraestrutura consolidada, mobilidade privilegiada e ampla oferta de serviços.',
  heroImg: '/bairros/vianelo-bonfiglioli.jpg',
  stats: [
    { value: 'Central', label: 'localização' },
    { value: 'Misto', label: 'perfil predominante' },
    { value: 'Anos 1940', label: 'início do desenvolvimento' },
  ],
  tldr:
    'O Vianelo Bonfiglioli é um dos bairros mais tradicionais e estratégicos de Jundiaí. Formado pela união entre o Vianelo e o Jardim Bonfiglioli, combina perfil residencial e comercial de forma equilibrada, com infraestrutura consolidada, forte rede de saúde no entorno e acesso fácil às principais vias da cidade.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O bairro combina características residenciais e comerciais de forma equilibrada. Está numa região central da cidade e reúne infraestrutura consolidada, excelente mobilidade urbana e uma ampla oferta de serviços.' },
    { num: '2', title: 'História e formação', text: 'Formado pela união entre o Vianelo e o Jardim Bonfiglioli, o bairro tem forte identidade histórica e urbana. Seu desenvolvimento ganhou força a partir da década de 1940, impulsionado pelo crescimento industrial da cidade e pela presença da antiga fábrica da CICA, ligada à tradicional família Bonfiglioli.' },
    { num: '3', title: 'Comércio e serviços', text: 'A infraestrutura é um dos grandes pontos fortes da região: supermercados, farmácias, bancos, lotéricas, lojas, autopeças, concessionárias, escolas, restaurantes e serviços variados.' },
    { num: '4', title: 'Saúde', text: 'A região se destaca pela proximidade com hospitais importantes, como o Hospital Universitário, o Hospital Sobam e o Hospital Pitangueiras, além de UBS e clínicas especializadas.' },
    { num: '5', title: 'Transporte e acessos', text: 'A mobilidade é privilegiada, com fácil acesso à Rodovia Anhanguera, à Avenida Nove de Julho, à Avenida Dr. Odil Campos de Sáes, à Rua Messina e ao Terminal Rodoviário de Jundiaí.' },
    { num: '6', title: 'Perfil imobiliário', text: 'Na região é possível encontrar casas tradicionais, edifícios residenciais, condomínios, apartamentos modernos e imóveis com perfil familiar e urbano, uma variedade que atende objetivos diferentes de moradia e investimento.' },
  ],
  // Sem dados de mercado informados: a seção de números não é exibida enquanto
  // o array estiver vazio (ver LotusBairro). Preencher só com dado real.
  dados: [],
  tipologias: ['Casa tradicional', 'Apartamento', 'Condomínio', 'Edifício residencial'],
  faq: [
    { q: 'Onde fica o Vianelo Bonfiglioli?', a: 'Numa região central de Jundiaí, com acesso fácil à Rodovia Anhanguera, à Avenida Nove de Julho, à Avenida Dr. Odil Campos de Sáes, à Rua Messina e ao Terminal Rodoviário.' },
    { q: 'Que tipos de imóvel existem no bairro?', a: 'Casas tradicionais, edifícios residenciais, condomínios e apartamentos modernos, com perfil familiar e urbano.' },
    { q: 'Como é a infraestrutura de saúde da região?', a: 'É um dos pontos fortes: o bairro fica próximo do Hospital Universitário, do Hospital Sobam e do Hospital Pitangueiras, além de UBS e clínicas especializadas.' },
  ],
  mapQuery: 'Vianelo, Jundiaí, SP',
  publicado: true,
};

// Medeiros — conteúdo real.
const medeiros: Bairro = {
  slug: 'medeiros',
  nome: 'Medeiros',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro em crescimento constante, ambiente calmo e arborizado, próximo à Serra do Japi, com forte potencial de valorização.',
  heroImg: '/bairros/medeiros.jpg',
  stats: [
    { value: 'Oeste', label: 'região de Jundiaí' },
    { value: 'Famílias e casais', label: 'perfil predominante' },
    { value: 'Em expansão', label: 'infraestrutura' },
  ],
  tldr:
    'O Medeiros é um bairro em constante crescimento na região oeste de Jundiaí, procurado por quem busca tranquilidade, natureza e valorização imobiliária. Nos últimos anos recebeu diversos condomínios fechados e empreendimentos residenciais voltados para segurança, lazer e conforto.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'A região se destaca pelo ambiente calmo, arborizado e próximo à Serra do Japi, atraindo famílias, casais e moradores que valorizam um estilo de vida mais leve e saudável.' },
    { num: '2', title: 'Condomínios e novos empreendimentos', text: 'Nos últimos anos o bairro recebeu diversos condomínios fechados e empreendimentos residenciais voltados para segurança, lazer e conforto, fortalecendo seu perfil de região planejada e promissora.' },
    { num: '3', title: 'Comércio e serviços', text: 'Apesar do perfil residencial, o bairro conta com comércios e serviços essenciais: mercearias, farmácias, escolas, academias, restaurantes e o Mini Shopping Sarapiranga, que oferece conveniência para o dia a dia.' },
    { num: '4', title: 'Transporte e acessos', text: 'Localização estratégica, com fácil acesso às Rodovias Anhanguera e Bandeirantes e conexão com cidades vizinhas como Itupeva, Louveira e Campinas. As avenidas Reynaldo Porcari e Juvenal Arantes facilitam o deslocamento interno e o acesso a outras regiões de Jundiaí.' },
    { num: '5', title: 'Lazer e natureza', text: 'A proximidade com a Serra do Japi é um dos grandes atrativos, somada ao ambiente arborizado do próprio bairro, o que sustenta o estilo de vida mais tranquilo que atrai seus moradores.' },
    { num: '6', title: 'Potencial de valorização', text: 'Com qualidade de vida, infraestrutura em expansão e forte potencial de valorização, o Medeiros é uma excelente opção tanto para morar quanto para investir em Jundiaí.' },
  ],
  dados: [],
  tipologias: ['Casa em condomínio', 'Casa térrea', 'Apartamento', 'Terreno'],
  faq: [
    { q: 'Onde fica o Medeiros?', a: 'Na região oeste de Jundiaí, com acesso fácil às Rodovias Anhanguera e Bandeirantes e conexão com Itupeva, Louveira e Campinas.' },
    { q: 'O Medeiros é bom para famílias?', a: 'Sim. O ambiente calmo e arborizado, a proximidade com a Serra do Japi e a oferta de condomínios fechados com lazer atraem especialmente famílias e casais.' },
    { q: 'Vale a pena investir no Medeiros?', a: 'O bairro reúne infraestrutura em expansão, novos empreendimentos e forte potencial de valorização, fatores que o tornam atrativo para investimento.' },
  ],
  mapQuery: 'Medeiros, Jundiaí, SP',
  publicado: true,
};

// Caxambu — conteúdo real.
const caxambu: Bairro = {
  slug: 'caxambu',
  nome: 'Caxambu',
  cidade: 'Jundiaí',
  tagline:
    'Na região norte de Jundiaí, herança italiana, produção de uvas e paisagens rurais a cerca de 15 minutos do centro.',
  heroImg: '/bairros/caxambu.jpg',
  stats: [
    { value: 'Norte', label: 'região de Jundiaí' },
    { value: '~15 min', label: 'até o centro de Jundiaí' },
    { value: 'Rota da Uva', label: 'roteiro turístico' },
  ],
  tldr:
    'O Caxambu é um dos bairros mais tradicionais e charmosos de Jundiaí, na região norte da cidade. É conhecido pela herança italiana, pelas paisagens rurais, pela produção de uvas e por integrar a Rota da Uva, mantendo atmosfera tranquila mesmo perto das áreas urbanas.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'Mesmo próximo às áreas urbanas, o Caxambu mantém uma atmosfera tranquila e acolhedora, ideal para quem busca contato com a natureza, mais privacidade e qualidade de vida.' },
    { num: '2', title: 'História e identidade', text: 'A história do bairro está diretamente ligada à imigração italiana e à tradição vitivinícola de Jundiaí. A região foi uma das pioneiras na produção de uvas e ainda hoje mantém viva essa identidade por meio de vinícolas, adegas, restaurantes típicos e propriedades rurais.' },
    { num: '3', title: 'Rota da Uva e turismo', text: 'O Caxambu integra a conhecida Rota da Uva, um dos principais roteiros turísticos da cidade, reunindo experiências gastronômicas, turismo rural, produção artesanal e paisagens que preservam o charme do interior.' },
    { num: '4', title: 'Comércio e serviços', text: 'A infraestrutura da região vem se desenvolvendo constantemente, com supermercados, padarias, farmácias, postos de combustível, restaurantes, comércios locais, serviços essenciais e instituições de ensino.' },
    { num: '5', title: 'Transporte e acessos', text: 'Com acesso facilitado pela Avenida Humberto Cereser e pela Avenida José Mezzalira, o bairro fica a aproximadamente 15 minutos do centro de Jundiaí.' },
    { num: '6', title: 'Para quem é', text: 'Para quem deseja morar ou investir em uma região com identidade cultural, natureza e valorização imobiliária, o Caxambu é uma das opções mais autênticas da cidade.' },
  ],
  dados: [],
  tipologias: ['Chácara', 'Casa térrea', 'Terreno', 'Casa em condomínio'],
  faq: [
    { q: 'Onde fica o Caxambu?', a: 'Na região norte de Jundiaí, com acesso pela Avenida Humberto Cereser e pela Avenida José Mezzalira, a aproximadamente 15 minutos do centro.' },
    { q: 'O que é a Rota da Uva?', a: 'É um dos principais roteiros turísticos de Jundiaí, do qual o Caxambu faz parte. Reúne vinícolas, adegas, restaurantes típicos, produção artesanal e turismo rural.' },
    { q: 'O Caxambu tem comércio no dia a dia?', a: 'Sim. A região conta com supermercados, padarias, farmácias, postos de combustível, restaurantes, comércios locais e instituições de ensino.' },
  ],
  mapQuery: 'Caxambu, Jundiaí, SP',
  publicado: true,
};

/* ---------------------------------------------------------------------------
 * ITUPEVA
 *
 * Conteúdo enviado pela Lotus em 17/08/2026, uma descrição curta por bairro.
 * Os guias saíram só do que veio nessa descrição, por isso têm 3 blocos e não
 * 6 como os de Jundiaí. Ao receber mais texto, é só somar blocos ao `guide`.
 *
 * `dados: []` em todos: não houve número de mercado informado, e sem isso a
 * seção "Transparência de mercado" (e as tipologias, que moram dentro dela)
 * não é exibida. Preencher só com dado real.
 *
 * Centro e Residencial São Venâncio têm foto própria em /public/bairros/. Nos
 * demais, heroImg vazio cai no gradiente do template, que é melhor do que
 * emprestar imagem de outro bairro.
 * ------------------------------------------------------------------------- */

// `centro-itupeva` e não `centro`: Jundiaí também tem um Centro, e o slug é a
// URL pública — colidir depois obrigaria a redirecionar.
const centroItupeva: Bairro = {
  slug: 'centro-itupeva',
  nome: 'Centro',
  cidade: 'Itupeva',
  tagline:
    'O centro de Itupeva concentra a maior parte do comércio da cidade e a rodoviária, cortado por vias como a Avenida Brasil e a Avenida Itália.',
  heroImg: '/bairros/centro-itupeva.jpg',
  stats: [
    { value: 'Central', label: 'localização' },
    { value: 'Comércio', label: 'perfil predominante' },
    { value: 'Rodoviária', label: 'transporte no bairro' },
  ],
  tldr:
    'O Centro é onde Itupeva se concentra. Reúne a maior parte do comércio da cidade e a rodoviária, e é cortado por vias importantes como a Avenida Brasil e a Avenida Itália. É o ponto de referência tanto para quem chega à cidade quanto para quem resolve o dia a dia por perto.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'Morar no Centro é ter a cidade resolvida por perto: é a região que concentra a maior parte do comércio de Itupeva, o que coloca o dia a dia a uma distância curta.' },
    { num: '2', title: 'Comércio e serviços', text: 'A maior parte do comércio da cidade está aqui, o que faz do bairro a referência de quem precisa resolver compras e serviços sem se deslocar.' },
    { num: '3', title: 'Transporte e acessos', text: 'A rodoviária de Itupeva fica no bairro, e a circulação se dá por vias importantes como a Avenida Brasil e a Avenida Itália.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O que tem no Centro de Itupeva?', a: 'O bairro concentra a maior parte do comércio da cidade e abriga a rodoviária.' },
    { q: 'Quais são as principais vias do Centro?', a: 'A Avenida Brasil e a Avenida Itália são as vias mais importantes da região.' },
  ],
  mapQuery: 'Centro, Itupeva, SP',
  publicado: true,
};

const jardimBrasil: Bairro = {
  slug: 'jardim-brasil',
  nome: 'Jardim Brasil',
  cidade: 'Itupeva',
  tagline:
    'Região residencial tradicional de Itupeva, bem localizada e próxima à área central, de perfil familiar e com forte presença de comércio local.',
  heroImg: '',
  stats: [
    { value: 'Residencial', label: 'perfil predominante' },
    { value: 'Famílias', label: 'público' },
    { value: 'Perto do centro', label: 'localização' },
  ],
  tldr:
    'O Jardim Brasil é uma região residencial tradicional de Itupeva, muito bem localizada e próxima da área central. Tem perfil familiar e forte presença de comércios locais, o que sustenta a rotina do bairro sem depender do deslocamento para o centro.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'É um bairro de perfil familiar e residencial tradicional, com rotina apoiada no comércio da própria região.' },
    { num: '2', title: 'Localização', text: 'A proximidade com a área central é um dos pontos fortes: o bairro é bem localizado e resolve com facilidade o acesso ao centro da cidade.' },
    { num: '3', title: 'Comércio e serviços', text: 'A presença de comércios locais é forte, o que atende o dia a dia dentro do próprio bairro.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Jardim Brasil é bom para famílias?', a: 'É uma região residencial tradicional de perfil familiar, com comércio local presente e proximidade da área central.' },
    { q: 'O Jardim Brasil fica longe do centro de Itupeva?', a: 'Não. O bairro é bem localizado e fica próximo da área central da cidade.' },
  ],
  mapQuery: 'Jardim Brasil, Itupeva, SP',
  publicado: true,
};

const parqueDasLaranjeiras: Bairro = {
  slug: 'parque-das-laranjeiras',
  nome: 'Parque das Laranjeiras',
  cidade: 'Itupeva',
  tagline:
    'Bairro planejado e bastante procurado em Itupeva, conhecido pelas ruas arborizadas e pela boa infraestrutura para moradia.',
  heroImg: '',
  stats: [
    { value: 'Planejado', label: 'formação' },
    { value: 'Ruas arborizadas', label: 'característica' },
    { value: 'Alta procura', label: 'demanda' },
  ],
  tldr:
    'O Parque das Laranjeiras é um bairro planejado de Itupeva e um dos mais procurados da cidade. É conhecido pelas ruas arborizadas e pela boa infraestrutura para moradia, combinação que explica a busca constante por imóveis na região.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'As ruas arborizadas dão o tom do bairro e são um dos motivos pelos quais ele é tão procurado por quem busca morar bem em Itupeva.' },
    { num: '2', title: 'Formação e planejamento', text: 'É um bairro planejado, e isso aparece na organização das ruas e na infraestrutura pensada para moradia.' },
    { num: '3', title: 'Infraestrutura', text: 'A boa infraestrutura para moradia é um dos pontos que sustentam a procura pela região.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Por que o Parque das Laranjeiras é tão procurado?', a: 'Pela combinação de bairro planejado, ruas arborizadas e boa infraestrutura para moradia.' },
    { q: 'O Parque das Laranjeiras é um bairro planejado?', a: 'Sim, e o planejamento aparece na organização das ruas e na infraestrutura da região.' },
  ],
  mapQuery: 'Parque das Laranjeiras, Itupeva, SP',
  publicado: true,
};

const novaMonteSerrat: Bairro = {
  slug: 'nova-monte-serrat',
  nome: 'Nova Monte Serrat',
  cidade: 'Itupeva',
  tagline:
    'Localidade popular de Itupeva em desenvolvimento constante, com fácil acesso aos bairros vizinhos e boa opção para investimento imobiliário.',
  heroImg: '',
  stats: [
    { value: 'Em desenvolvimento', label: 'momento do bairro' },
    { value: 'Popular', label: 'perfil predominante' },
    { value: 'Investimento', label: 'procura' },
  ],
  tldr:
    'A Nova Monte Serrat é uma localidade popular de Itupeva em desenvolvimento constante. O acesso fácil aos bairros vizinhos e o crescimento contínuo fazem dela uma boa opção para quem pensa em investimento imobiliário.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'É uma localidade popular, em desenvolvimento constante, com a rotina apoiada na conexão fácil com os bairros vizinhos.' },
    { num: '2', title: 'Transporte e acessos', text: 'O acesso aos bairros vizinhos é fácil, o que ajuda tanto no deslocamento diário quanto na integração com o restante da cidade.' },
    { num: '3', title: 'Perfil de investimento', text: 'O desenvolvimento constante da região faz dela uma boa opção de investimento imobiliário em Itupeva.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Vale a pena investir na Nova Monte Serrat?', a: 'É uma localidade em desenvolvimento constante e com acesso fácil aos bairros vizinhos, fatores que a tornam uma boa opção de investimento imobiliário.' },
    { q: 'Como é o perfil da Nova Monte Serrat?', a: 'É uma localidade popular de Itupeva, em crescimento contínuo.' },
  ],
  mapQuery: 'Nova Monte Serrat, Itupeva, SP',
  publicado: true,
};

const residencialSaoVenancio: Bairro = {
  slug: 'residencial-sao-venancio',
  nome: 'Residencial São Venâncio',
  cidade: 'Itupeva',
  tagline:
    'Um dos loteamentos de maior destaque de Itupeva, muito procurado por quem quer morar em condomínio fechado com infraestrutura moderna.',
  heroImg: '/bairros/residencial-sao-venancio.jpg',
  stats: [
    { value: 'Condomínio fechado', label: 'formato' },
    { value: 'Loteamento', label: 'tipo' },
    { value: 'Infraestrutura moderna', label: 'diferencial' },
  ],
  tldr:
    'O Residencial São Venâncio é um dos empreendimentos e loteamentos de maior destaque de Itupeva. É muito buscado por quem deseja morar em condomínio fechado, com a infraestrutura moderna que a região oferece.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'A proposta é morar em condomínio fechado, com a segurança e a organização que esse formato oferece.' },
    { num: '2', title: 'Destaque na cidade', text: 'É um dos empreendimentos e loteamentos de maior destaque de Itupeva, o que se traduz em procura constante.' },
    { num: '3', title: 'Infraestrutura', text: 'A infraestrutura moderna é o diferencial mais citado por quem busca a região.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Residencial São Venâncio é condomínio fechado?', a: 'Sim. É um dos loteamentos de maior destaque de Itupeva, buscado justamente por quem quer morar em condomínio fechado.' },
    { q: 'Qual o diferencial do Residencial São Venâncio?', a: 'A infraestrutura moderna somada ao formato de condomínio fechado, num dos empreendimentos de maior destaque da cidade.' },
  ],
  mapQuery: 'Residencial São Venâncio, Itupeva, SP',
  publicado: true,
};

// A ordem daqui define a ordem do índice, inclusive das cidades: os bairros de
// Jundiaí primeiro, depois os de Itupeva.
export const BAIRROS: Bairro[] = [
  eloyChaves,
  vianeloBonfiglioli,
  medeiros,
  caxambu,
  centroItupeva,
  jardimBrasil,
  parqueDasLaranjeiras,
  novaMonteSerrat,
  residencialSaoVenancio,
];

const BY_SLUG = new Map(BAIRROS.map((b) => [b.slug, b]));

/** Um bairro pelo slug (undefined se não existir). */
export function getBairro(slug: string): Bairro | undefined {
  return BY_SLUG.get(slug);
}

/** Todos os slugs (para generateStaticParams). */
export function bairroSlugs(): string[] {
  return BAIRROS.map((b) => b.slug);
}

/** Cards do índice (nome, cidade, tagline curta, imagem). */
export function listBairros(): Bairro[] {
  return BAIRROS;
}

/** Vizinhos de um bairro: os demais da mesma cidade (até 4). */
export function bairrosVizinhos(slug: string): Bairro[] {
  const atual = getBairro(slug);
  if (!atual) return [];
  return BAIRROS.filter((b) => b.slug !== slug && b.cidade === atual.cidade).slice(0, 4);
}
