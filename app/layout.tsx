import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import Analytics, { AnalyticsNoScript } from '@/components/Analytics';
import PreloadHints from '@/components/PreloadHints';

// Metadata portada de lotus-home/index.html (paridade de SEO com o estático).
// TODO go-live: revisar canonical/og:url para o domínio final e publicar sitemap/robots.
// Base para resolver URLs relativas de og:image/twitter. Vem de env
// (NEXT_PUBLIC_SITE_URL) para não hard-codar o domínio — muda por ambiente e o
// domínio final do deploy é definido lá, num só lugar. Só define metadataBase
// se a env existir (senão o Next usa o default do runtime sem quebrar o build).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'Imóveis, lançamentos e bairros em Jundiaí e Itupeva | Lotus Brokers',
  description:
    'Lotus Brokers, imobiliária moderna de Jundiaí e Itupeva, voltada para um atendimento de excelência. Lançamentos, casas, apartamentos e terrenos com especialistas que conhecem cada bairro.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/lotus-home' },
  openGraph: {
    siteName: 'Lotus Brokers',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-home',
    locale: 'pt_BR',
    title: 'Lotus Brokers, Imóveis em Jundiaí e Itupeva',
    description:
      'Imobiliária moderna de Jundiaí e Itupeva, com atendimento de excelência. Lançamentos e revenda com especialistas de cada bairro.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// JSON-LD RealEstateAgent (portado do estático).
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Lotus Brokers',
  description:
    'Imobiliária moderna de Jundiaí e Itupeva, voltada para um atendimento de excelência, com equipe de corretores segmentada por especialidade e por bairro.',
  areaServed: ['Jundiaí', 'Itupeva', 'Vinhedo', 'Valinhos', 'Indaiatuba'],
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'SP',
    addressCountry: 'BR',
    addressLocality: 'Jundiaí',
  },
  slogan: 'Grandes escolhas têm endereço.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AnalyticsNoScript />
        <PreloadHints />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        {/* Banner de consentimento global (aparece em todas as páginas, como no
            site estático). Só renderiza se não houver cookie lotus_consent. */}
        <CookieConsent />
      </body>
    </html>
  );
}
