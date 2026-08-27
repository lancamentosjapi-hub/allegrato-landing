import type { MetadataRoute } from 'next';
import { getImovelCodigos } from '@/lib/imoveis';
import { getCondominioIds } from '@/lib/condominios';
import { bairroSlugsIndexaveis } from '@/lib/bairros';
import { landingSlugs } from '@/lib/landings';

/**
 * Sitemap dinâmico do portal.
 *
 * O site não tinha sitemap nem robots.txt: o Google descobria página por
 * página seguindo links, o que atrasa a indexação em semanas. Com o sitemap
 * declarado no robots.txt, novas páginas entram na fila em 24-48h.
 *
 * É gerado a cada requisição a partir das mesmas fontes que as páginas usam,
 * então imóvel novo no dashboard ou landing nova em app/ entram sozinhos. Não
 * há lista escrita à mão para esquecer de atualizar.
 *
 * `revalidate` acompanha o das páginas (1h): não faz sentido o sitemap
 * anunciar uma URL que a listagem ainda não mostra.
 */

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lotusbrokers.com.br';

/** Páginas institucionais e de listagem, que existem independentemente de dados. */
const FIXAS: { rota: string; prioridade: number; frequencia: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { rota: '/lotus-home', prioridade: 1.0, frequencia: 'daily' },
  { rota: '/lotus-busca', prioridade: 0.9, frequencia: 'daily' },
  { rota: '/lotus-lancamentos', prioridade: 0.9, frequencia: 'daily' },
  { rota: '/lotus-bairro', prioridade: 0.7, frequencia: 'weekly' },
  { rota: '/lotus-condominio', prioridade: 0.6, frequencia: 'weekly' },
  { rota: '/lotus-corretores', prioridade: 0.7, frequencia: 'weekly' },
  { rota: '/lotus-sobre', prioridade: 0.6, frequencia: 'monthly' },
  { rota: '/lotus-blog', prioridade: 0.7, frequencia: 'weekly' },
  { rota: '/lotus-faq', prioridade: 0.5, frequencia: 'monthly' },
  { rota: '/lotus-anunciar', prioridade: 0.6, frequencia: 'monthly' },
  { rota: '/lotus-recrutamento', prioridade: 0.4, frequencia: 'monthly' },
  { rota: '/lotus-privacidade', prioridade: 0.2, frequencia: 'yearly' },
  { rota: '/lotus-termos', prioridade: 0.2, frequencia: 'yearly' },
  { rota: '/lotus-cookies', prioridade: 0.2, frequencia: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  // Falha de banco não pode derrubar o sitemap inteiro: sem imóveis ele ainda
  // declara as páginas fixas e as landings, que é melhor do que erro 500.
  const [codigos, condominios] = await Promise.all([
    getImovelCodigos().catch((e) => {
      console.error('[sitemap] imóveis indisponíveis:', e);
      return [] as string[];
    }),
    getCondominioIds().catch((e) => {
      console.error('[sitemap] condomínios indisponíveis:', e);
      return [] as string[];
    }),
  ]);

  const url = (rota: string) => `${SITE}${rota}`;

  return [
    ...FIXAS.map((f) => ({
      url: url(f.rota),
      lastModified: agora,
      changeFrequency: f.frequencia,
      priority: f.prioridade,
    })),
    // Landings de empreendimento: derivadas do filesystem, igual aos cards.
    ...[...landingSlugs()].sort().map((slug) => ({
      url: url(`/${slug}`),
      lastModified: agora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...bairroSlugsIndexaveis().map((slug) => ({
      url: url(`/lotus-bairro/${slug}`),
      lastModified: agora,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...codigos.map((codigo) => ({
      url: url(`/lotus-imovel/${codigo}`),
      lastModified: agora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...condominios.map((id) => ({
      url: url(`/lotus-condominio/${id}`),
      lastModified: agora,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
