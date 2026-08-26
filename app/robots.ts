import type { MetadataRoute } from 'next';

/**
 * robots.txt do portal.
 *
 * Existe sobretudo para declarar o sitemap: é assim que o Google sai de
 * "descobre página por página seguindo links" para "confere a lista toda".
 *
 * Bloqueios: /api (não é conteúdo) e /meus-dados (área do titular, LGPD, não
 * deve ser indexada). O resto é liberado — nada aqui é privado.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lotusbrokers.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/meus-dados'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
