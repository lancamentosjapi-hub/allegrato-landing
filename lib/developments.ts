// Empreendimentos curados do site estático — fonte de fallback da home.
// Módulo compartilhável (sem 'use client'): importado tanto pelo Server Component
// (app/lotus-home/page.tsx, que faz o merge com o Supabase) quanto pelo Client
// Component (LotusHome). Importar isto de um módulo 'use client' para o server
// resultava em `undefined` no bundle do servidor — por isso vive aqui.

export type DevelopmentCard = {
  name: string;
  location: string;
  stage: string;
  builder: string;
  specs: string;
  price: string;
  exclusive: boolean;
  img: string | null;
  href: string | null;
};

// Usados enquanto o Supabase (portal_lancamentos) não tiver dados apresentáveis.
// O fonte estático tinha um `,,` esparso entre Vistta Castanho e Doppio; `.map`
// ignora buracos, então o resultado observável são estes 18 cards reais.
export const developmentsFallback: DevelopmentCard[] = [
  { name: 'Altos da Avenida', location: 'Jardim do Lago · Jundiaí', stage: 'Em obras', builder: 'Santa Angela', specs: '58–105 m² · 2 e 3 dorms', price: 'Consultar valor', exclusive: true, img: '/altos-da-avenida/a005.png', href: 'https://www.lotusbrokers.com.br/altos-da-avenida' },
  { name: 'Auten Jundiaí', location: 'Anhangabaú · Jundiaí', stage: 'Lançamento', builder: 'Construtora', specs: '128–264 m² · até 4 suítes', price: 'Consultar valor', exclusive: true, img: '/auten-jundiai/a023.jpg', href: 'https://www.lotusbrokers.com.br/auten-jundiai' },
  { name: 'Authoria by Tebas', location: 'Jundiaí', stage: 'Lançamento', builder: 'Tebas', specs: '137–211 m² · 3 e 4 suítes', price: 'Consultar valor', exclusive: true, img: '/authoria/a002.jpg', href: 'https://www.lotusbrokers.com.br/authoria' },
  { name: 'Vivarte Grand Alamedas', location: 'Vianelo · Jundiaí', stage: 'Pronto para morar', builder: 'Construtora', specs: 'Serra do Japi', price: 'Consultar valor', exclusive: false, img: '/vivarte/a003.jpg', href: 'https://www.lotusbrokers.com.br/vivarte' },
  { name: 'Allegrato', location: 'Medeiros · Jundiaí', stage: 'Lançamento', builder: 'Santa Angela', specs: 'Minha Casa Minha Vida', price: 'Consultar valor', exclusive: false, img: '/assets/a09.jpg', href: 'https://www.lotusbrokers.com.br/allegrato' },
  { name: 'Brisas do Japi', location: 'Jundiaí', stage: 'Em obras', builder: 'VVC', specs: 'Studios e apartamentos · MCMV', price: 'Consultar valor', exclusive: false, img: 'https://vvcconstrutora.com.br/images/brisas-banner/FACHADA01.jpg', href: 'https://www.lotusbrokers.com.br/brisas-do-japi' },
  { name: 'Avelã Vila Residencial', location: 'Itupeva', stage: 'Lançamento', builder: 'Construtora', specs: '66–87 m² · 2 e 3 dorms · gardens', price: 'Consultar valor', exclusive: true, img: '/avela/a007.jpg', href: 'https://www.lotusbrokers.com.br/avela' },
  { name: 'Forest Houses', location: 'Louveira', stage: 'Lançamento', builder: 'Construtora', specs: 'Casas em condomínio', price: 'Consultar valor', exclusive: false, img: '/forest-houses/a002.jpg', href: 'https://www.lotusbrokers.com.br/forest-houses' },
  { name: 'Gran Ville Santo Angelo', location: 'Itupeva', stage: 'Lançamento', builder: 'Santa Angela', specs: 'Loteamento de alto padrão', price: 'Consultar valor', exclusive: true, img: '/gran-ville-santo-angelo/a038.jpg', href: 'https://www.lotusbrokers.com.br/gran-ville-santo-angelo' },
  { name: 'Jardins do Horto', location: 'Horto Florestal · Jundiaí', stage: 'Em obras', builder: 'Santa Angela', specs: '72 m² e 95 m²', price: 'Consultar valor', exclusive: true, img: '/jardins-do-horto/a004.jpg', href: 'https://www.lotusbrokers.com.br/jardins-do-horto' },
  { name: 'Manawa', location: 'Jundiaí', stage: 'Lançamento', builder: 'Mac Lucer', specs: '2 e 3 dorms com suíte', price: 'Consultar valor', exclusive: false, img: '/manawa/a005.png', href: 'https://www.lotusbrokers.com.br/manawa' },
  { name: 'Maxx Santa Angela', location: 'Vila Galvão · Jundiaí', stage: 'Lançamento', builder: 'Santa Angela', specs: '71–98 m² · ao lado do Maxi Shopping', price: 'Consultar valor', exclusive: true, img: 'https://santaangelaconstrutora.com.br/wp-content/uploads/2021/06/CAPA-MAX-OLD.png', href: 'https://www.lotusbrokers.com.br/maxx-santa-angela' },
  { name: 'Resort Prime', location: 'Engordadouro · Jundiaí', stage: 'Lançamento', builder: 'Santa Angela', specs: 'Lazer de resort, todos os dias', price: 'Consultar valor', exclusive: true, img: '/resort-prime/a009.jpg', href: 'https://www.lotusbrokers.com.br/resort-prime' },
  { name: 'Terrace Serra do Japi', location: 'Jundiaí', stage: 'Lançamento', builder: 'Construtora', specs: 'Alto padrão · 3 torres', price: 'Consultar valor', exclusive: true, img: '/terrace-serra-do-japi/a026.jpg', href: 'https://www.lotusbrokers.com.br/terrace-serra-do-japi' },
  { name: 'Vigóre', location: 'Colônia · Jundiaí', stage: 'Em obras', builder: 'Construtora', specs: '2 dorms · lazer completo', price: 'Consultar valor', exclusive: false, img: '/vigore/a18.jpg', href: 'https://www.lotusbrokers.com.br/vigore' },
  { name: 'Vistta Castanho', location: 'Castanho · Jundiaí', stage: 'Lançamento', builder: 'Construtora', specs: 'Loteamento fechado', price: 'Consultar valor', exclusive: false, img: '/vistta-castanho/a007.jpg', href: 'https://www.lotusbrokers.com.br/vistta-castanho' },
  { name: 'Doppio Jundiaí', location: 'Campos Elísios · Jundiaí', stage: 'Lançamento', builder: 'Alto padrão', specs: '156–442 m² · alto padrão', price: 'Consultar valor', exclusive: false, img: '/vivarte/a003.jpg', href: 'https://www.lotusbrokers.com.br/doppio-jundiai' },
  { name: 'Portal dos Lagos', location: 'Jundiaí', stage: 'Lançamento', builder: 'Santa Angela', specs: 'Lotes em condomínio fechado', price: 'Consultar valor', exclusive: false, img: '/gran-ville-santo-angelo/a010.jpg', href: 'https://www.lotusbrokers.com.br/portal-dos-lagos' },
  { name: 'Avalon Residencial', location: 'Vila Hortolândia · Jundiaí', stage: 'Lançamento', builder: 'F A Oliva', specs: '78,5 e 108 m² · 2 e 3 dorms com suíte', price: 'Consultar valor', exclusive: false, img: '/avalon/a001.jpg', href: 'https://www.lotusbrokers.com.br/avalon' },
  { name: 'Best View Residence', location: 'Swiss Park · Campinas', stage: 'Lançamento', builder: 'F A Oliva', specs: '62–78 m² · 2 e 3 dorms com suíte', price: 'Consultar valor', exclusive: false, img: '/best-view-residence/a012.jpg', href: 'https://www.lotusbrokers.com.br/best-view-residence' },
  { name: 'Maitá Residencial', location: 'Vila Marlene · Jundiaí', stage: 'Em obras', builder: 'Mac Lucer', specs: '63–80 m² · 2 e 3 dorms com suíte', price: 'Consultar valor', exclusive: false, img: '/maita/a007.jpg', href: 'https://www.lotusbrokers.com.br/maita' },
  { name: 'Odeon Residencial', location: 'Portal do Paraíso II · Jundiaí', stage: 'Lançamento', builder: 'F A Oliva', specs: '95,85 e 112,3 m² · até 3 dorms', price: 'Consultar valor', exclusive: false, img: '/odeon/a011.jpg', href: 'https://www.lotusbrokers.com.br/odeon' },
  { name: 'SKY Videiras', location: 'Quintas das Videiras · Jundiaí', stage: 'Em obras', builder: 'SEBEL', specs: '56,96–83,31 m² · lazer no rooftop', price: 'Consultar valor', exclusive: false, img: '/sky-videiras/a001.jpg', href: 'https://www.lotusbrokers.com.br/sky-videiras' },
];
