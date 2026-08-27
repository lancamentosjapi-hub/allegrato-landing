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
 * Os três têm foto própria em /public/bairros/. Se um bairro novo entrar sem
 * foto, heroImg vazio cai no gradiente do template, que é melhor do que
 * emprestar imagem de outro bairro.
 *
 * Jardim Brasil e Parque das Laranjeiras entraram nesta lista no commit 26986f6
 * e foram retirados a pedido da Lotus no mesmo dia, 17/08/2026. Ficaram no ar
 * cerca de vinte minutos. Nenhum link do site aponta para eles (o índice é
 * gerado a partir deste arquivo), então some tudo junto.
 *
 * Cuidado ao conferir: /lotus-bairro/<slug-inexistente> devolve 200 com a
 * página de "não encontrado", e não 404. Vale para qualquer slug desconhecido,
 * não só para estes dois — é um soft 404 que a rota já tinha antes. O
 * generateMetadata marca robots noindex nesse caso, então não indexa, mas o
 * status continua errado. Corrigir é assunto de app/lotus-bairro/[slug].
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

const novaMonteSerrat: Bairro = {
  slug: 'nova-monte-serrat',
  nome: 'Nova Monte Serrat',
  cidade: 'Itupeva',
  tagline:
    'Localidade popular de Itupeva em desenvolvimento constante, com fácil acesso aos bairros vizinhos e boa opção para investimento imobiliário.',
  heroImg: '/bairros/nova-monte-serrat.jpg',
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

/* ---------------------------------------------------------------------------
 * JUNDIAÍ — bairros que entraram no índice antes da copy chegar
 *
 * A Lotus tem imóvel cadastrado nestes quatro bairros e pediu que eles
 * aparecessem no guia, para existirem no mapa e no índice de bairros. A
 * descrição de cada um ainda não chegou.
 *
 * O que está escrito aqui é só o que o cadastro comprova: são bairros de
 * Jundiaí. Nada de "arborizado", "perfil familiar" ou preço médio do m² —
 * inventar característica de bairro é o tipo de erro que só aparece quando um
 * cliente cobra pessoalmente, e a regra do arquivo é campo sem informação
 * ficar vazio.
 *
 * Com `guide`, `faq`, `stats` e `dados` vazios, as seções correspondentes não
 * são exibidas (ver as guardas em components/LotusBairro.tsx). Sobram o hero,
 * o resumo, o mapa e os imóveis reais do bairro — que é o conteúdo que existe.
 *
 * `publicado: false` marca noindex enquanto a página for magra: no site ela
 * aparece normalmente, no Google não. Quatro páginas quase iguais e sem
 * conteúdo próprio competindo entre si atrapalhariam o resto do domínio.
 *
 * QUANDO A COPY CHEGAR: troque a chamada da fábrica por um registro literal
 * completo, no mesmo formato do Eloy Chaves, e ponha `publicado: true`. A foto
 * vai em /public/bairros/<slug>.jpg e entra pelo campo heroImg.
 * ------------------------------------------------------------------------- */

/**
 * Registro provisório de bairro: existe no índice e no mapa, sem guia escrito.
 *
 * Fábrica em vez de quatro registros copiados porque hoje eles só diferem no
 * nome — copiar convidaria os quatro a divergirem no primeiro ajuste de texto.
 *
 * O artigo vem por parâmetro em vez de deduzido do nome: são quatro casos, e
 * um deles ("a Vila Rio Branco") já contraria a regra do "Jardim". Adivinhar
 * gênero de nome próprio custa mais do que escrever a letra.
 */
function bairroSemGuiaAinda(nome: string, slug: string, artigo: 'o' | 'a'): Bairro {
  return {
    slug,
    nome,
    cidade: 'Jundiaí',
    tagline: `Bairro de Jundiaí. O guia ainda está sendo escrito — por enquanto, veja ${artigo} ${nome} no mapa e os imóveis que a Lotus tem na região.`,
    heroImg: '',
    stats: [],
    tldr: `${artigo === 'o' ? 'O' : 'A'} ${nome} fica em Jundiaí, São Paulo. O guia completo do bairro — como é viver aqui, comércio, acessos e lazer — ainda está sendo escrito. Por enquanto, esta página traz a localização no mapa e os imóveis que a Lotus tem por lá. Para saber como é o bairro antes de decidir, fale com a gente: quem atende conhece a região de perto.`,
    guide: [],
    dados: [],
    tipologias: [],
    faq: [],
    mapQuery: `${nome}, Jundiaí, SP`,
    publicado: false,
  };
}

const jardimMessina = bairroSemGuiaAinda('Jardim Messina', 'jardim-messina', 'o');
const jardimPacaembu = bairroSemGuiaAinda('Jardim Pacaembu', 'jardim-pacaembu', 'o');
const vilaRioBranco = bairroSemGuiaAinda('Vila Rio Branco', 'vila-rio-branco', 'a');
const jardimColonial = bairroSemGuiaAinda('Jardim Colonial', 'jardim-colonial', 'o');

/* ---------------------------------------------------------------------------
 * JUNDIAÍ E ITUPEVA — segunda leva de guias
 *
 * Conteúdo enviado pela Lotus em 27/08/2026, num documento com 18 bairros.
 *
 * Os quatro que já estavam no ar (Eloy Chaves, Vianelo Bonfiglioli, Caxambu e
 * Medeiros) NÃO foram tocados, a pedido da Lotus: o documento traz versões
 * novas dos textos deles, e a orientação foi manter o que já estava publicado.
 *
 * O texto de cada bairro abaixo é o da Lotus, reorganizado nos blocos do
 * template. Os títulos dos blocos repetem a nomenclatura dos guias antigos
 * ("Comércio e serviços", "Transporte e acessos") para as páginas lerem igual.
 *
 * `dados: []` em todos: o documento não trouxe número de mercado, e a seção
 * "Transparência de mercado" só aparece com dado real. Os `stats` do topo saem
 * de afirmações do próprio texto, nunca de estimativa.
 *
 * `heroImg: ''` em todos: não vieram fotos. Cai no gradiente do template. Ao
 * receber foto, salvar em /public/bairros/<slug>.jpg e preencher o campo.
 * ------------------------------------------------------------------------- */

const parqueDoColegio: Bairro = {
  slug: 'parque-do-colegio',
  nome: 'Parque do Colégio',
  cidade: 'Jundiaí',
  tagline:
    'Bairro tradicional de Jundiaí que combina tranquilidade residencial, ruas arborizadas, infraestrutura completa e excelente localização.',
  heroImg: '',
  stats: [
    { value: 'Anos 1950', label: 'origem do loteamento' },
    { value: 'Residencial', label: 'perfil predominante' },
    { value: 'Nove de Julho', label: 'principal acesso' },
  ],
  tldr:
    'O Parque do Colégio é um bairro tradicional de Jundiaí que combina tranquilidade residencial, ruas arborizadas, infraestrutura completa e excelente localização. Com origem em um loteamento residencial planejado na década de 1950, a região passou por um processo constante de valorização e hoje se destaca como uma das áreas mais agradáveis para morar na cidade.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O bairro possui perfil predominantemente residencial, com ambiente acolhedor, ruas tranquilas e forte sensação de bem-estar. Ao mesmo tempo, oferece fácil acesso a supermercados, farmácias, academias, restaurantes, comércios locais e serviços essenciais.' },
    { num: '2', title: 'História e formação', text: 'A origem está em um loteamento residencial planejado na década de 1950. A partir dele, a região passou por um processo constante de valorização e hoje se destaca como uma das áreas mais agradáveis para morar na cidade.' },
    { num: '3', title: 'Comércio e serviços', text: 'Supermercados, farmácias, academias, restaurantes e comércios locais ficam a pouca distância, sem que o bairro perca o clima residencial.' },
    { num: '4', title: 'Escolas e ensino', text: 'A região conta com instituições de ensino e serviços importantes, como escolas municipais, estaduais e o SESI, reforçando seu perfil familiar e estruturado.' },
    { num: '5', title: 'Transporte e acessos', text: 'A localização é outro grande diferencial: o bairro tem acesso rápido à Avenida Nove de Julho, à Rua do Retiro, à região central de Jundiaí e a outros importantes corredores urbanos.' },
    { num: '6', title: 'Perfil imobiliário', text: 'A região oferece casas térreas, sobrados, apartamentos e imóveis residenciais de médio e alto padrão, atendendo diferentes perfis de moradores e investidores.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Parque do Colégio é um bairro residencial?', a: 'Sim, o perfil é predominantemente residencial, com ruas tranquilas e ambiente acolhedor — e com comércio e serviços essenciais a pouca distância.' },
    { q: 'Que tipos de imóvel existem no Parque do Colégio?', a: 'Casas térreas, sobrados, apartamentos e imóveis residenciais de médio e alto padrão.' },
  ],
  mapQuery: 'Parque do Colégio, Jundiaí, SP',
  publicado: true,
};

const parqueDaRepresa: Bairro = {
  slug: 'parque-da-represa',
  nome: 'Parque da Represa',
  cidade: 'Jundiaí',
  tagline:
    'Na região norte de Jundiaí, um bairro que se destaca pela tranquilidade, pela infraestrutura completa e pela forte conexão com a natureza.',
  heroImg: '',
  stats: [
    { value: 'Zona norte', label: 'região de Jundiaí' },
    { value: 'Parque Linear', label: 'lazer no bairro' },
    { value: 'Condomínios', label: 'perfil predominante' },
  ],
  tldr:
    'O Parque da Represa, localizado na região norte de Jundiaí, é um bairro que se destaca pela tranquilidade, infraestrutura completa e forte conexão com a natureza. A região possui perfil residencial valorizado e oferece um ambiente agradável para famílias, profissionais e investidores que buscam qualidade de vida sem abrir mão da praticidade urbana.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'A região possui perfil residencial valorizado e oferece um ambiente agradável para famílias, profissionais e investidores que buscam qualidade de vida sem abrir mão da praticidade urbana.' },
    { num: '2', title: 'Lazer e natureza', text: 'Um dos grandes atrativos é a proximidade com áreas verdes e espaços de lazer ao ar livre. O Parque Linear é um dos principais destaques, com ciclovias, pistas de caminhada, playground infantil, academias ao ar livre e áreas de convivência.' },
    { num: '3', title: 'Comércio e serviços', text: 'O bairro conta com escolas, postos de saúde, padarias, mercados, restaurantes, comércios locais e serviços essenciais, garantindo praticidade para a rotina dos moradores.' },
    { num: '4', title: 'Condomínios e perfil imobiliário', text: 'A região abriga condomínios residenciais modernos, muitos deles com portaria 24 horas, piscinas, quadras esportivas, salões de festas e áreas de convivência.' },
    { num: '5', title: 'Transporte e acessos', text: 'A localização estratégica facilita o acesso a importantes pontos de lazer de Jundiaí, como o Parque da Cidade e o Mundo das Crianças, além de permitir deslocamento rápido para outras regiões da cidade.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O que tem de lazer no Parque da Represa?', a: 'O Parque Linear é o principal destaque, com ciclovias, pistas de caminhada, playground infantil, academias ao ar livre e áreas de convivência. O Parque da Cidade e o Mundo das Crianças ficam próximos.' },
    { q: 'Como são os condomínios da região?', a: 'São condomínios residenciais modernos, muitos com portaria 24 horas, piscinas, quadras esportivas, salões de festas e áreas de convivência.' },
  ],
  mapQuery: 'Parque da Represa, Jundiaí, SP',
  publicado: true,
};

const jardimTannus: Bairro = {
  slug: 'jardim-tannus',
  nome: 'Jardim Tannus',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro residencial conhecido pelo ambiente tranquilo, pelas ruas organizadas e pela proximidade com a Serra do Japi.',
  heroImg: '',
  stats: [
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Serra do Japi', label: 'natureza ao lado' },
    { value: 'Casas e terrenos', label: 'perfil predominante' },
  ],
  tldr:
    'O Jardim Tannus, localizado na região oeste de Jundiaí, é um bairro residencial conhecido pelo ambiente tranquilo, ruas organizadas e proximidade com a natureza. Com perfil familiar, a região é formada principalmente por casas térreas, sobrados e terrenos residenciais, sendo uma ótima escolha para quem busca sossego, segurança e qualidade de vida.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O bairro possui ruas bem pavimentadas, iluminação pública, baixo fluxo intenso de veículos e uma atmosfera acolhedora, características que reforçam seu perfil residencial valorizado.' },
    { num: '2', title: 'Lazer e natureza', text: 'A proximidade com a Serra do Japi é um dos grandes diferenciais. Essa conexão com a natureza proporciona clima mais agradável, paisagens arborizadas, melhor qualidade do ar e uma rotina mais leve.' },
    { num: '3', title: 'Comércio e serviços', text: 'Mesmo sendo uma região tranquila, o bairro conta com fácil acesso a supermercados, escolas, farmácias, padarias, academias, comércios locais e serviços diversos.' },
    { num: '4', title: 'Transporte e acessos', text: 'A mobilidade é favorecida pela proximidade com a Rodovia Dom Gabriel Paulino Bueno Couto, que conecta o bairro a outras regiões de Jundiaí e a cidades vizinhas.' },
    { num: '5', title: 'Perfil imobiliário', text: 'A região é formada principalmente por casas térreas, sobrados e terrenos residenciais. Com imóveis diversificados e potencial de valorização, é uma escolha para quem deseja viver em um bairro residencial, organizado e próximo ao verde.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Jardim Tannus fica perto da Serra do Japi?', a: 'Sim. A proximidade com a Serra é um dos grandes diferenciais do bairro, e traz clima mais agradável, paisagens arborizadas e melhor qualidade do ar.' },
    { q: 'Que tipos de imóvel existem no Jardim Tannus?', a: 'Principalmente casas térreas, sobrados e terrenos residenciais, num bairro de perfil familiar.' },
  ],
  mapQuery: 'Jardim Tannus, Jundiaí, SP',
  publicado: true,
};

const jardimGuanabara: Bairro = {
  slug: 'jardim-guanabara',
  nome: 'Jardim Guanabara',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro residencial com tranquilidade, infraestrutura completa e fácil acesso às principais vias da cidade.',
  heroImg: '',
  stats: [
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Familiar', label: 'perfil predominante' },
    { value: 'Transporte público', label: 'atende o bairro' },
  ],
  tldr:
    'O Jardim Guanabara, localizado na região oeste de Jundiaí, é um bairro residencial que oferece tranquilidade, infraestrutura completa e fácil acesso às principais vias da cidade. Com ruas organizadas, clima familiar e boa estrutura urbana, é uma ótima opção para quem busca morar com conforto, segurança e praticidade.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'A região é formada principalmente por casas térreas, sobrados e imóveis familiares, mantendo uma atmosfera acolhedora e predominantemente residencial.' },
    { num: '2', title: 'Comércio e serviços', text: 'O bairro conta com escolas, supermercados, farmácias, padarias, academias, comércios locais e serviços essenciais nas proximidades, facilitando a rotina dos moradores.' },
    { num: '3', title: 'Lazer e convivência', text: 'Nos últimos anos, a região recebeu melhorias voltadas ao lazer e à qualidade de vida, como quadra poliesportiva, pista de caminhada e espaços de convivência.' },
    { num: '4', title: 'Transporte e acessos', text: 'A mobilidade é outro diferencial: o bairro tem fácil acesso a diferentes regiões de Jundiaí e é atendido por transporte público, o que ajuda quem precisa se deslocar diariamente.' },
    { num: '5', title: 'Perfil imobiliário', text: 'Com mercado imobiliário diversificado, boa localização e ambiente familiar, o Jardim Guanabara se destaca como uma região agradável para morar e com bom potencial de valorização.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Jardim Guanabara tem transporte público?', a: 'Sim, o bairro é atendido por transporte público e tem fácil acesso a diferentes regiões de Jundiaí.' },
    { q: 'Que tipos de imóvel existem no Jardim Guanabara?', a: 'Principalmente casas térreas, sobrados e imóveis de perfil familiar.' },
  ],
  mapQuery: 'Jardim Guanabara, Jundiaí, SP',
  publicado: true,
};

const gramadao: Bairro = {
  slug: 'gramadao',
  nome: 'Gramadão',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro conhecido pela tranquilidade, pelas áreas verdes e pela qualidade de vida.',
  heroImg: '',
  stats: [
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Arborizado', label: 'ambiente predominante' },
    { value: 'Casas e condomínios', label: 'perfil imobiliário' },
  ],
  tldr:
    'O Gramadão, localizado na região oeste de Jundiaí, é um bairro conhecido pela tranquilidade, áreas verdes e excelente qualidade de vida. Com perfil predominantemente residencial, a região é ideal para quem busca um ambiente mais reservado, arborizado e próximo à natureza, sem abrir mão da mobilidade urbana.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'Com perfil predominantemente residencial, a região é ideal para quem busca um ambiente mais reservado, arborizado e próximo à natureza, sem abrir mão da mobilidade urbana.' },
    { num: '2', title: 'Lazer e natureza', text: 'O contato com a natureza é um dos principais atrativos. A presença de áreas arborizadas e espaços abertos contribui para uma rotina mais tranquila, com melhor qualidade do ar, menor poluição sonora e sensação constante de bem-estar.' },
    { num: '3', title: 'Condomínios e perfil imobiliário', text: 'O bairro oferece opções variadas de moradia, como casas térreas, sobrados, condomínios fechados e terrenos para construção. Entre os empreendimentos da região, destaca-se o Condomínio Villa Verde, reconhecido pela segurança e pela integração com o verde.' },
    { num: '4', title: 'Transporte e acessos', text: 'Apesar do clima calmo, a localização é estratégica. A proximidade com a Avenida Antônio Pincinato facilita o acesso a diferentes pontos de Jundiaí, enquanto as Rodovias Anhanguera e Bandeirantes ampliam a conexão com cidades vizinhas.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Como é o ambiente do Gramadão?', a: 'É um bairro predominantemente residencial, reservado e arborizado, com áreas verdes e espaços abertos, mas com acesso rápido a outras regiões da cidade.' },
    { q: 'Quais condomínios existem no Gramadão?', a: 'Entre os empreendimentos da região destaca-se o Condomínio Villa Verde, reconhecido pela segurança e pela integração com o verde.' },
  ],
  mapQuery: 'Gramadão, Jundiaí, SP',
  publicado: true,
};

const retiro: Bairro = {
  slug: 'retiro',
  nome: 'Retiro',
  cidade: 'Jundiaí',
  tagline:
    'Um dos bairros mais consolidados de Jundiaí, com infraestrutura completa, mobilidade privilegiada e imóveis de perfis bem diferentes entre si.',
  heroImg: '',
  stats: [
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Misto', label: 'perfil urbano' },
    { value: 'Anhanguera', label: 'rodovia de acesso' },
  ],
  tldr:
    'O Retiro é um dos bairros mais consolidados e estratégicos de Jundiaí, conhecido pela combinação entre infraestrutura completa, mobilidade privilegiada e diversidade imobiliária. Localizado na região oeste da cidade, apresenta perfil urbano versátil, reunindo áreas residenciais, comerciais e empreendimentos de diferentes padrões.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O bairro apresenta perfil urbano versátil, reunindo áreas residenciais, comerciais e empreendimentos de diferentes padrões.' },
    { num: '2', title: 'Comércio e serviços', text: 'A infraestrutura é um dos grandes diferenciais: supermercados, farmácias, escolas, restaurantes, padarias, academias, bancos, comércios variados e serviços essenciais.' },
    { num: '3', title: 'Transporte e acessos', text: 'A localização é altamente estratégica, com acesso rápido à Avenida Prefeito Luiz Latorre, à Rua do Retiro, à Avenida Antônio Pincinato e à Rodovia Anhanguera. O bairro também é bem atendido por transporte público, com linhas que conectam os moradores a diferentes pontos da cidade.' },
    { num: '4', title: 'Perfil imobiliário', text: 'Na região é possível encontrar casas térreas, sobrados, apartamentos, condomínios residenciais e imóveis com perfil comercial, atendendo famílias, profissionais, jovens casais e investidores.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Por que o Retiro é considerado estratégico?', a: 'Pela mobilidade: o bairro tem acesso rápido à Avenida Prefeito Luiz Latorre, à Rua do Retiro, à Avenida Antônio Pincinato e à Rodovia Anhanguera, além de boa cobertura de transporte público.' },
    { q: 'Que tipos de imóvel existem no Retiro?', a: 'Casas térreas, sobrados, apartamentos, condomínios residenciais e imóveis de perfil comercial.' },
  ],
  mapQuery: 'Retiro, Jundiaí, SP',
  publicado: true,
};

const jardimSamambaia: Bairro = {
  slug: 'jardim-samambaia',
  nome: 'Jardim Samambaia',
  cidade: 'Jundiaí',
  tagline:
    'Uma das regiões mais valorizadas de Jundiaí: perfil residencial, ruas arborizadas, imóveis de alto padrão e localização estratégica.',
  heroImg: '',
  stats: [
    { value: 'Alto padrão', label: 'perfil residencial' },
    { value: 'Jundiaí Shopping', label: 'comércio próximo' },
    { value: 'Anhanguera', label: 'rodovia de acesso' },
  ],
  tldr:
    'O Jardim Samambaia é uma das regiões mais valorizadas de Jundiaí, conhecida pelo perfil residencial, ruas arborizadas, imóveis de alto padrão e excelente localização. O bairro oferece um ambiente tranquilo, seguro e familiar, muito procurado por quem busca qualidade de vida sem abrir mão da praticidade urbana.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O bairro oferece um ambiente tranquilo, seguro e familiar, sendo muito procurado por quem busca qualidade de vida sem abrir mão da praticidade urbana.' },
    { num: '2', title: 'Perfil imobiliário', text: 'A região conta com casas amplas, condomínios sofisticados e ruas bem urbanizadas. O alto padrão residencial atrai famílias e investidores que procuram segurança, conforto e valorização imobiliária.' },
    { num: '3', title: 'Comércio e serviços', text: 'Escolas, supermercados, farmácias, academias, hospitais, o Jundiaí Shopping, a Avenida Jundiaí e diversas regiões comerciais importantes ficam próximos.' },
    { num: '4', title: 'Transporte e acessos', text: 'O acesso é rápido a importantes vias da cidade, como a Rodovia Anhanguera e a Avenida Nove de Julho.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Jardim Samambaia é um bairro nobre?', a: 'É uma das regiões mais valorizadas de Jundiaí, com casas amplas, condomínios sofisticados e ruas bem urbanizadas.' },
    { q: 'O que fica perto do Jardim Samambaia?', a: 'Escolas, supermercados, farmácias, academias, hospitais, o Jundiaí Shopping e a Avenida Jundiaí, além do acesso rápido à Rodovia Anhanguera e à Avenida Nove de Julho.' },
  ],
  mapQuery: 'Jardim Samambaia, Jundiaí, SP',
  publicado: true,
};

/**
 * ATENÇÃO ao mexer neste bairro: ele conflita com lib/bairros-taxonomia.
 *
 * Aquele arquivo mapeia "Jardim Ermida I" e "Jardim Ermida II" como sub-bairros
 * do Eloy Chaves, e o mapeamento veio dos títulos dos imóveis: AP676 e AP677
 * dizem "Vila Sereno, Eloy Chaves" enquanto o campo bairro diz "Jardim Ermida
 * II". Só que AP679 diz apenas "Jardim Ermida I", sem Eloy Chaves, e o texto
 * que a Lotus enviou trata o Jardim Ermida como bairro próprio, vizinho do
 * Eloy Chaves ("a infraestrutura é complementada pelas regiões próximas,
 * especialmente o Eloy Chaves").
 *
 * Resultado hoje: este guia existe e não lista imóvel nenhum, porque os três
 * cadastrados como Ermida I/II continuam contando para o Eloy Chaves. Ficou
 * assim de propósito — mover os imóveis mudaria a página do Eloy Chaves, que
 * já está publicada, e a orientação foi não alterar o que já estava no ar.
 *
 * Para migrar, quando a Lotus decidir: em lib/bairros-taxonomia.ts, tirar as
 * linhas de 'jardim ermida i' e 'jardim ermida ii' do PERTENCE_A (os imóveis
 * passam a casar por nome exato com este guia). A dúvida real é o Vila Sereno,
 * que o cadastro chama de Ermida II e o título chama de Eloy Chaves.
 */
const jardimErmida: Bairro = {
  slug: 'jardim-ermida',
  nome: 'Jardim Ermida',
  cidade: 'Jundiaí',
  tagline:
    'Uma das regiões mais promissoras de Jundiaí: tranquilidade, boa infraestrutura e acesso rápido às principais vias da cidade.',
  heroImg: '',
  stats: [
    { value: 'Condomínios', label: 'perfil predominante' },
    { value: 'Serra do Japi', label: 'natureza próxima' },
    { value: 'Anhanguera', label: 'rodovia de acesso' },
  ],
  tldr:
    'O Jardim Ermida está localizado em uma das regiões mais promissoras de Jundiaí e se destaca pela tranquilidade, boa infraestrutura e acesso rápido às principais vias da cidade. Com ambiente residencial calmo e proximidade com áreas verdes, é uma excelente opção para quem busca qualidade de vida, contato com a natureza e um clima seguro e acolhedor.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'O ambiente residencial é calmo e próximo de áreas verdes, o que faz do bairro uma opção para quem busca qualidade de vida, contato com a natureza e um clima seguro e acolhedor.' },
    { num: '2', title: 'Condomínios e perfil imobiliário', text: 'A região conta com condomínios fechados e conjuntos residenciais bem organizados, muitos deles com lazer e segurança, atraindo famílias que procuram conforto e praticidade.' },
    { num: '3', title: 'Transporte e acessos', text: 'A localização é um dos grandes diferenciais: fácil acesso à Rodovia Anhanguera e à Avenida Reynaldo Porcari, uma rota prática para quem trabalha em Jundiaí ou precisa se deslocar para Campinas, São Paulo e cidades vizinhas.' },
    { num: '4', title: 'Comércio e serviços', text: 'A infraestrutura do bairro é complementada pelas regiões próximas, especialmente o Eloy Chaves, que oferece supermercados, restaurantes, academias, bancos, escolas, farmácias e serviços essenciais.' },
    { num: '5', title: 'Lazer e natureza', text: 'Próximo à Serra do Japi, o Jardim Ermida favorece uma rotina com mais contato com a natureza, trilhas, parques e atividades ao ar livre.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O Jardim Ermida fica perto do Eloy Chaves?', a: 'Sim. A infraestrutura do bairro é complementada pelas regiões próximas, especialmente o Eloy Chaves, com supermercados, restaurantes, academias, bancos, escolas e farmácias.' },
    { q: 'Como é o acesso a partir do Jardim Ermida?', a: 'O bairro tem fácil acesso à Rodovia Anhanguera e à Avenida Reynaldo Porcari, o que facilita o deslocamento para Jundiaí, Campinas, São Paulo e cidades vizinhas.' },
  ],
  mapQuery: 'Jardim Ermida, Jundiaí, SP',
  publicado: true,
};

const hortoFlorestal: Bairro = {
  slug: 'horto-florestal',
  nome: 'Horto Florestal',
  cidade: 'Jundiaí',
  tagline:
    'Bairro de Jundiaí com forte ligação histórica, natureza presente e excelente infraestrutura urbana.',
  heroImg: '',
  stats: [
    { value: 'Século XX', label: 'origem do bairro' },
    { value: 'Parque da Cidade', label: 'lazer próximo' },
    { value: 'Maxi Shopping', label: 'comércio próximo' },
  ],
  tldr:
    'O Horto Florestal é um bairro de Jundiaí com forte ligação histórica, natureza presente e excelente infraestrutura urbana. Suas origens estão relacionadas ao início do século XX, quando a região fazia parte de projetos ligados à Companhia Paulista de Estradas de Ferro. Com o tempo, a área se transformou em um bairro completo, arborizado e muito procurado por famílias e investidores.',
  guide: [
    { num: '1', title: 'História e formação', text: 'As origens estão no início do século XX, quando a região fazia parte de projetos ligados à Companhia Paulista de Estradas de Ferro. Com o tempo, a área se transformou em um bairro completo, arborizado e muito procurado por famílias e investidores.' },
    { num: '2', title: 'Comércio e serviços', text: 'O bairro conta com escolas públicas, opções de serviços, comércios e fácil acesso a importantes pontos da cidade. O Maxi Shopping Jundiaí é outro destaque, com lojas, restaurantes, cinema e serviços variados.' },
    { num: '3', title: 'Lazer e natureza', text: 'Um dos grandes atrativos é a proximidade com o Parque da Cidade, um dos espaços de lazer ao ar livre mais conhecidos de Jundiaí, ideal para caminhadas, atividades esportivas e contato com a natureza.' },
    { num: '4', title: 'Transporte e acessos', text: 'A localização é estratégica, com fácil acesso a bairros como Vila Rio Branco, Vila Hortolândia e a região do Parque da Cidade.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Qual é a origem do Horto Florestal?', a: 'As origens estão no início do século XX, quando a região fazia parte de projetos ligados à Companhia Paulista de Estradas de Ferro.' },
    { q: 'O que tem de lazer perto do Horto Florestal?', a: 'O Parque da Cidade, um dos espaços de lazer ao ar livre mais conhecidos de Jundiaí, e o Maxi Shopping Jundiaí, com lojas, restaurantes e cinema.' },
  ],
  mapQuery: 'Horto Florestal, Jundiaí, SP',
  publicado: true,
};

const vilaHortolandia: Bairro = {
  slug: 'vila-hortolandia',
  nome: 'Vila Hortolândia',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro que combina tradição, infraestrutura completa e excelente mobilidade urbana.',
  heroImg: '',
  stats: [
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Misto', label: 'perfil do bairro' },
    { value: 'Anhanguera', label: 'rodovia de acesso' },
  ],
  tldr:
    'A Vila Hortolândia, localizada na região oeste de Jundiaí, é um bairro que combina tradição, infraestrutura completa e excelente mobilidade urbana. Com perfil misto, a região reúne áreas residenciais e comerciais, oferecendo casas, sobrados e apartamentos em condomínios — uma diversidade que atende diferentes perfis de moradores e investidores.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'Com perfil misto, a região reúne áreas residenciais e comerciais, oferecendo casas, sobrados e apartamentos em condomínios. Essa diversidade atende diferentes perfis de moradores e investidores.' },
    { num: '2', title: 'Comércio e serviços', text: 'O bairro conta com ampla oferta de serviços e comércios, como supermercados, escolas, farmácias, restaurantes, padarias, academias e estabelecimentos diversos, garantindo praticidade na rotina dos moradores.' },
    { num: '3', title: 'Lazer e convivência', text: 'A região também oferece praças e espaços públicos voltados ao lazer e às atividades ao ar livre, contribuindo para o bem-estar da comunidade.' },
    { num: '4', title: 'Transporte e acessos', text: 'Situada entre a Rodovia Anhanguera e o Rio Jundiaí, a região tem acesso facilitado à Avenida Prefeito Luiz Latorre, à Rua do Retiro e à Avenida Nove de Julho. O bairro também é bem atendido por transporte público.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'A Vila Hortolândia é residencial ou comercial?', a: 'As duas coisas. O perfil é misto: a região reúne áreas residenciais e comerciais, com casas, sobrados e apartamentos em condomínios.' },
    { q: 'Onde fica a Vila Hortolândia?', a: 'Na região oeste de Jundiaí, entre a Rodovia Anhanguera e o Rio Jundiaí, com acesso à Avenida Prefeito Luiz Latorre, à Rua do Retiro e à Avenida Nove de Julho.' },
  ],
  mapQuery: 'Vila Hortolândia, Jundiaí, SP',
  publicado: true,
};

const aeroporto: Bairro = {
  slug: 'aeroporto',
  nome: 'Aeroporto',
  cidade: 'Jundiaí',
  tagline:
    'Na região oeste de Jundiaí, um bairro que combina história, tranquilidade e grande potencial de valorização.',
  heroImg: '',
  stats: [
    { value: 'Desde 1941', label: 'aeroporto em atividade' },
    { value: 'Zona oeste', label: 'região de Jundiaí' },
    { value: 'Em expansão', label: 'projetos urbanos' },
  ],
  tldr:
    'O bairro Aeroporto, localizado na região oeste de Jundiaí, combina história, tranquilidade e grande potencial de valorização. A região é marcada pela presença do Aeroporto Estadual Comandante Rolim Adolfo Amaro, em atividade desde 1941, e possui raízes ligadas à aviação civil e à pesquisa agrícola.',
  guide: [
    { num: '1', title: 'História e formação', text: 'A região é marcada pela presença do Aeroporto Estadual Comandante Rolim Adolfo Amaro, em atividade desde 1941, e possui raízes ligadas à aviação civil e à pesquisa agrícola.' },
    { num: '2', title: 'Como é viver aqui', text: 'Com infraestrutura consolidada e projetos de expansão urbana em andamento, o bairro apresenta boas perspectivas para investimentos de médio e longo prazo.' },
    { num: '3', title: 'Escolas e serviços', text: 'Entre os destaques da região estão instituições de ensino reconhecidas, como o Colégio Degraus e a Etec Benedito Storani, além de serviços comunitários.' },
    { num: '4', title: 'Lazer e natureza', text: 'O Parque Botânico Eloy Chaves fica entre os espaços de lazer próximos ao bairro.' },
    { num: '5', title: 'Transporte e acessos', text: 'A localização é estratégica, com fácil acesso a bairros importantes como Eloy Chaves, Recanto Quarto Centenário, Fazenda Grande e Distrito Industrial.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Desde quando o aeroporto funciona?', a: 'O Aeroporto Estadual Comandante Rolim Adolfo Amaro está em atividade desde 1941, e é o que marca a identidade do bairro.' },
    { q: 'Quais escolas existem no bairro Aeroporto?', a: 'Entre as instituições reconhecidas da região estão o Colégio Degraus e a Etec Benedito Storani.' },
  ],
  mapQuery: 'Aeroporto, Jundiaí, SP',
  publicado: true,
};

const engordadouro: Bairro = {
  slug: 'engordadouro',
  nome: 'Engordadouro',
  cidade: 'Jundiaí',
  tagline:
    'Na região noroeste de Jundiaí, um bairro em transformação que une tradição, desenvolvimento urbano, áreas verdes e qualidade de vida.',
  heroImg: '',
  stats: [
    { value: 'Zona noroeste', label: 'região de Jundiaí' },
    { value: 'Parque Ângelo Costa', label: 'lazer no bairro' },
    { value: 'Condomínios', label: 'perfil predominante' },
  ],
  tldr:
    'O Engordadouro é um bairro em constante transformação na região noroeste de Jundiaí, unindo tradição, desenvolvimento urbano, áreas verdes e qualidade de vida. A região, que possui origem ligada a atividades agrícolas e industriais, hoje abriga diversos empreendimentos residenciais, condomínios e apartamentos.',
  guide: [
    { num: '1', title: 'História e formação', text: 'A região possui origem ligada a atividades agrícolas e industriais, e hoje abriga diversos empreendimentos residenciais, condomínios e apartamentos, com opções variadas para diferentes perfis de moradores.' },
    { num: '2', title: 'Condomínios e perfil imobiliário', text: 'Entre os condomínios e empreendimentos da região estão o Vintage Engordadouro Condomínio Club, o Reservatto Residenziale, o Parque dos Jatobás e o Resort Santa Angela.' },
    { num: '3', title: 'Comércio e serviços', text: 'O bairro conta com boa estrutura educacional, com escolas de educação infantil, ensino fundamental e unidade universitária, além de comércios e serviços variados, como supermercados, postos de combustível, oficinas, restaurantes, pizzarias e o CEASA de Jundiaí.' },
    { num: '4', title: 'Lazer e natureza', text: 'Um dos principais atrativos é o Parque Ângelo Costa, uma ampla área de lazer com trilhas, lagos, mirantes, quiosques, academia ao ar livre, parque infantil, quadras esportivas, áreas adaptadas e espaço pet-friendly.' },
    { num: '5', title: 'Transporte e acessos', text: 'A localização é estratégica, com proximidade das Rodovias Anhanguera e Dom Gabriel Paulino Bueno Couto, o que facilita o acesso a outras regiões de Jundiaí, Campinas e São Paulo.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'O que tem no Parque Ângelo Costa?', a: 'Trilhas, lagos, mirantes, quiosques, academia ao ar livre, parque infantil, quadras esportivas, áreas adaptadas e espaço pet-friendly.' },
    { q: 'Quais condomínios existem no Engordadouro?', a: 'Entre eles estão o Vintage Engordadouro Condomínio Club, o Reservatto Residenziale, o Parque dos Jatobás e o Resort Santa Angela.' },
  ],
  mapQuery: 'Engordadouro, Jundiaí, SP',
  publicado: true,
};

const recantoQuartoCentenario: Bairro = {
  slug: 'recanto-quarto-centenario',
  nome: 'Recanto Quarto Centenário',
  cidade: 'Jundiaí',
  tagline:
    'Bairro residencial de Jundiaí que se destaca pela tranquilidade, pela infraestrutura e pela localização estratégica.',
  heroImg: '',
  stats: [
    { value: 'Familiar', label: 'perfil predominante' },
    { value: 'Eloy Chaves', label: 'bairro vizinho' },
    { value: 'Três rodovias', label: 'acessos próximos' },
  ],
  tldr:
    'O Recanto Quarto Centenário, também conhecido como Recanto IV Centenário, é um bairro residencial de Jundiaí que se destaca pela tranquilidade, infraestrutura e localização estratégica. Com ambiente familiar e acolhedor, a região é ideal para quem busca conforto, segurança e qualidade de vida em uma área bem conectada da cidade.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'Com ambiente familiar e acolhedor, a região é ideal para quem busca conforto, segurança e qualidade de vida em uma área bem conectada da cidade. A atmosfera é tranquila e há áreas verdes por perto.' },
    { num: '2', title: 'Comércio e serviços', text: 'O bairro conta com comércios e serviços que atendem às necessidades do dia a dia.' },
    { num: '3', title: 'Perfil imobiliário', text: 'As opções imobiliárias são variadas: apartamentos, casas e imóveis em condomínios fechados.' },
    { num: '4', title: 'Transporte e acessos', text: 'A localização é um dos principais diferenciais. Próximo ao Eloy Chaves, o bairro tem fácil acesso às Rodovias Anhanguera, Bandeirantes e Dom Gabriel, além da Avenida Nove de Julho, o que facilita o deslocamento para o centro de Jundiaí e cidades vizinhas. A região também é atendida por transporte público.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Recanto Quarto Centenário e Recanto IV Centenário são o mesmo bairro?', a: 'Sim, são dois nomes para a mesma região de Jundiaí.' },
    { q: 'Como é o acesso a partir do Recanto Quarto Centenário?', a: 'O bairro fica próximo ao Eloy Chaves e tem fácil acesso às Rodovias Anhanguera, Bandeirantes e Dom Gabriel, além da Avenida Nove de Julho. Também é atendido por transporte público.' },
  ],
  mapQuery: 'Recanto Quarto Centenário, Jundiaí, SP',
  publicado: true,
};

// `jardim-primavera-itupeva` e não `jardim-primavera`, pelo mesmo motivo do
// `centro-itupeva`: Jardim Primavera é um dos nomes de bairro mais repetidos do
// país, e o slug é a URL pública — colidir depois obrigaria a redirecionar. O
// sufixo ainda ajuda a busca local, que é feita por bairro + cidade.
const jardimPrimavera: Bairro = {
  slug: 'jardim-primavera-itupeva',
  nome: 'Jardim Primavera',
  cidade: 'Itupeva',
  tagline:
    'Bairro residencial de Itupeva que se destaca pela tranquilidade, pela infraestrutura completa e pela localização próxima ao centro da cidade.',
  heroImg: '',
  stats: [
    { value: '~300 m²', label: 'lote típico do bairro' },
    { value: 'Familiar', label: 'perfil predominante' },
    { value: 'Av. Guanabara', label: 'principal acesso' },
  ],
  tldr:
    'O Jardim Primavera, localizado em Itupeva, é um bairro residencial que se destaca pela tranquilidade, infraestrutura completa e excelente localização próxima ao centro da cidade. Com perfil familiar, reúne casas térreas, sobrados, terrenos amplos e ruas organizadas, criando um ambiente acolhedor para quem busca conforto, segurança e praticidade.',
  guide: [
    { num: '1', title: 'Como é viver aqui', text: 'A região possui lotes com aproximadamente 300 m², ruas largas, clima residencial e baixo fluxo intenso de veículos, o que proporciona mais privacidade e qualidade de vida aos moradores.' },
    { num: '2', title: 'Comércio e serviços', text: 'Mesmo mantendo uma atmosfera tranquila, o bairro oferece fácil acesso a supermercados, farmácias, restaurantes, academias, escolas, comércios e serviços essenciais.' },
    { num: '3', title: 'Lazer e natureza', text: 'A Praça Amadeu Poli é um dos espaços mais frequentados da região, com área para caminhadas, playground infantil, espaços arborizados e ambiente de convivência.' },
    { num: '4', title: 'Transporte e acessos', text: 'A localização próxima à Avenida Guanabara facilita o deslocamento para o centro de Itupeva e outras regiões da cidade. O transporte público também atende o bairro.' },
    { num: '5', title: 'Perfil imobiliário', text: 'O bairro reúne casas térreas, sobrados, terrenos amplos e ruas organizadas, num ambiente acolhedor e de valorização constante.' },
  ],
  dados: [],
  tipologias: [],
  faq: [
    { q: 'Qual o tamanho dos lotes no Jardim Primavera?', a: 'A região possui lotes com aproximadamente 300 m², com ruas largas e baixo fluxo intenso de veículos.' },
    { q: 'O Jardim Primavera fica perto do centro de Itupeva?', a: 'Sim. A localização próxima à Avenida Guanabara facilita o deslocamento para o centro de Itupeva e para outras regiões da cidade, e o bairro é atendido por transporte público.' },
  ],
  mapQuery: 'Jardim Primavera, Itupeva, SP',
  publicado: true,
};

// A ordem daqui define a ordem do índice, inclusive das cidades: os bairros de
// Jundiaí primeiro, depois os de Itupeva.
export const BAIRROS: Bairro[] = [
  eloyChaves,
  vianeloBonfiglioli,
  medeiros,
  caxambu,
  parqueDoColegio,
  parqueDaRepresa,
  jardimTannus,
  jardimGuanabara,
  gramadao,
  retiro,
  jardimSamambaia,
  jardimErmida,
  hortoFlorestal,
  vilaHortolandia,
  aeroporto,
  engordadouro,
  recantoQuartoCentenario,
  jardimMessina,
  jardimPacaembu,
  vilaRioBranco,
  jardimColonial,
  centroItupeva,
  novaMonteSerrat,
  residencialSaoVenancio,
  jardimPrimavera,
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

/**
 * Slugs que o sitemap deve oferecer ao Google.
 *
 * Separado de bairroSlugs() de propósito: o prerender quer TODOS os bairros
 * (a página existe e é navegável), mas o sitemap só pode listar o que a página
 * autoriza indexar. Um bairro com `publicado: false` responde com robots
 * noindex; anunciá-lo no sitemap seria pedir ao Google para rastrear uma URL
 * que manda embora — sinal contraditório, do tipo que derruba a confiança no
 * sitemap inteiro.
 */
export function bairroSlugsIndexaveis(): string[] {
  return BAIRROS.filter((b) => b.publicado).map((b) => b.slug);
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
