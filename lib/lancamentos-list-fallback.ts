// Itens da LISTAGEM /lotus-lancamentos curados do site estático — fonte de fallback.
// Módulo compartilhável (sem 'use client'): importado tanto pelo Server Component
// (app/lotus-lancamentos/page.tsx, que faz o merge com o Supabase) quanto pelo Client
// Component (LotusLancamentos). Importar isto de um módulo 'use client' para o server
// resultava em `undefined` no bundle do servidor — por isso vive aqui.
// Espelha lib/developments.ts (o fallback da home).

export type EmpItem = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  stage: string;
  type: string;
  priceNum: number;
  // null = preço não informado. O card decide o texto ("A partir de R$ …" ou
  // "Valor sob consulta"); a camada de dados não carrega texto de interface.
  price: string | null;
  specs: string;
  exclusive: boolean;
  // Construtora canonicalizada, alimenta o filtro de /lotus-lancamentos.
  // Opcional porque os itens estaticos deste arquivo nao a declaram: quando
  // ausente, o empreendimento simplesmente nao e alcancado por esse filtro,
  // igual ja acontece com tipo e preco.
  builder?: string;
  slot: string;
  // Estáticos resolvem a imagem por EMP_IMG[id]; dinâmicos (Supabase) já trazem img.
  img?: string | null;
  // Rota da landing rica quando existe; null/ausente => card abre contato (WhatsApp).
  href?: string | null;
};

// EMP do <script> estático (valores exatos).
// `href` aponta para a landing rica quando ela existe (pastas em app/); itens sem
// landing ficam sem href e o card cai no contato (WhatsApp). Os nomes do fallback
// não batem 1:1 com o slug da landing (ex.: id 'jardins' -> /jardins-do-horto), por
// isso o href é explícito aqui em vez de derivado do id.
export const empsFallback: EmpItem[] = [
  { id: 'allegrato', name: 'Allegrato', neighborhood: 'Medeiros', city: 'Jundiaí', stage: 'Em obras', type: '3 dorms', priceNum: 720000, price: 'R$ 720 mil', specs: '3 dorms · 92–118 m² · 1–2 vagas', exclusive: true, slot: 'le-1', href: '/allegrato' },
  { id: 'jardins', name: 'Jardins do Horto', neighborhood: 'Horto', city: 'Jundiaí', stage: 'Pré-lançamento', type: '3 dorms', priceNum: 1200000, price: 'R$ 1,2 mi', specs: '3 suítes · 105–140 m² · 2–3 vagas', exclusive: true, slot: 'le-2', href: '/jardins-do-horto' },
  { id: 'vigore', name: 'Vigore', neighborhood: 'Anhangabaú', city: 'Jundiaí', stage: 'Em obras', type: '2 dorms', priceNum: 540000, price: 'R$ 540 mil', specs: '2–3 dorms · 64–88 m² · 1–2 vagas', exclusive: false, slot: 'le-3', href: '/vigore' },
  { id: 'terrace', name: 'Terrace Jundiaí', neighborhood: 'Centro', city: 'Jundiaí', stage: 'Pronto', type: '4 dorms', priceNum: 1650000, price: 'R$ 1,65 mi', specs: 'Coberturas · 180–230 m² · 3 vagas', exclusive: false, slot: 'le-4', href: '/terrace-serra-do-japi' },
  { id: 'doppio', name: 'Doppio Jundiaí', neighborhood: 'Vila Arens', city: 'Jundiaí', stage: 'Pré-lançamento', type: '2 dorms', priceNum: 480000, price: 'R$ 480 mil', specs: '1–2 dorms · 38–62 m² · 1 vaga', exclusive: true, slot: 'le-5', href: '/doppio-jundiai' },
  { id: 'reserva', name: 'Reserva da Serra', neighborhood: 'Caxambu', city: 'Itupeva', stage: 'Em obras', type: '4 dorms', priceNum: 1890000, price: 'R$ 1,89 mi', specs: 'Casas em condomínio · 4 suítes · 280 m²', exclusive: true, slot: 'le-6', href: null },
  { id: 'vivarte', name: 'Vivarte Grand', neighborhood: 'Eloy Chaves', city: 'Jundiaí', stage: 'Em obras', type: '3 dorms', priceNum: 850000, price: 'R$ 850 mil', specs: '3 dorms · 88–110 m² · 2 vagas', exclusive: false, slot: 'le-7', href: '/vivarte' },
  { id: 'forest', name: 'Forest Manduca', neighborhood: 'Vianelo', city: 'Jundiaí', stage: 'Pré-lançamento', type: '3 dorms', priceNum: 990000, price: 'R$ 990 mil', specs: '3 dorms · 95–120 m² · 2 vagas', exclusive: false, slot: 'le-8', href: '/forest-houses' },
  { id: 'gran', name: 'Gran Park Itupeva', neighborhood: 'Residencial Phytus', city: 'Itupeva', stage: 'Pronto', type: '2 dorms', priceNum: 420000, price: 'R$ 420 mil', specs: '2 dorms · 55–70 m² · 1 vaga', exclusive: false, slot: 'le-9', href: null },
];

// IMG do renderVals estático (id -> imagem). Os itens de fallback resolvem a
// imagem por este map; itens dinâmicos do Supabase já trazem `img` próprio.
export const EMP_IMG: Record<string, string> = {
  allegrato: '/assets/a09.jpg',
  jardins: '/jardins-do-horto/a004.jpg',
  vigore: '/vigore/a18.jpg',
  terrace: '/terrace-serra-do-japi/a026.jpg',
  doppio: '/assets/doppio-capa.jpg',
  reserva: '/vistta-castanho/a007.jpg',
  vivarte: '/vivarte/a003.jpg',
  forest: '/forest-houses/a002.jpg',
  gran: '/gran-ville-santo-angelo/a038.jpg',
};
