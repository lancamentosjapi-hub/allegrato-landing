import type { Metadata } from 'next';
import './vistta-castanho.css';
import VisttaCastanho from '@/components/VisttaCastanho';
import AtalhosLanding from '@/components/AtalhosLanding';

// Metadata portada do <head> do index.html original (valores EXATOS).
export const metadata: Metadata = {
  title: 'Vistta Castanho · Loteamento Fechado em Jundiaí, SP',
  description:
    'Vistta Castanho: loteamento fechado com lotes a partir de 126 m² no bairro do Castanho, Jundiaí, entre São Paulo e Campinas. Clube completo, lago, portaria inteligente e natureza. Fale com um corretor.',
  keywords:
    'Vistta Castanho, loteamento fechado Jundiaí, lotes Castanho Jundiaí, terrenos condomínio fechado Jundiaí, comprar lote Jundiaí, Vistta Castanho Applausi',
  robots: 'index, follow',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/vistta-castanho' },
  openGraph: {
    type: 'website',
    title: 'Vistta Castanho · Loteamento Fechado em Jundiaí, SP',
    description:
      'Um sonho do tamanho do seu. Lotes a partir de 126 m² em meio à natureza, com clube completo e lago. Castanho, Jundiaí, SP.',
    locale: 'pt_BR',
    images: ['/vistta-castanho/a008.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    'geo.region': 'BR-SP',
    'geo.placename': 'Jundiaí',
  },
};

// Structured data portado EXATO do <script type="application/ld+json"> do fonte.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Vistta Castanho',
  description:
    'Loteamento fechado com lotes a partir de 126 m² no bairro do Castanho, em Jundiaí, SP. Clube completo, lago, paisagismo multiespécies e portaria inteligente.',
  image: 'assets/img/hero-lago.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Prolongamento da Avenida Benedito Chrispim, Avenida Marginal do Loteamento Applausi Castanho',
    addressLocality: 'Jundiaí',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
  // `broker` removido junto com o branding da Imobiliária Japi. Um
  // RealEstateAgent sem `name` seria inválido, então o bloco sai inteiro —
  // `Residence` não exige `broker`. Para reintroduzir, basta voltar o objeto
  // com o nome da imobiliária responsável.
  telephone: '+55 11 92614-3393',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VisttaCastanho />
      <AtalhosLanding />
    </>
  );
}
