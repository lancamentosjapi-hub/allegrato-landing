import type { Metadata } from 'next';
import './resort-prime.css';
import ResortPrime from '@/components/ResortPrime';

// Metadata portada do <head> de resort-prime/index.html (paridade de SEO com o estático).
export const metadata: Metadata = {
  title:
    'Resort Prime Santa Angela, Lazer de Resort, todos os dias | Jundiaí',
  description:
    'Resort Prime Santa Angela em Jundiaí: 4 torres, apartamentos de 68 a 112m², lazer completo estilo resort, Academia Céltica e Club Prime. Agende sua visita.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/resort-prime' },
  openGraph: {
    type: 'website',
    title: 'Resort Prime Santa Angela, Lazer de Resort, todos os dias',
    description:
      'Resort Prime Santa Angela em Jundiaí: 4 torres, apartamentos de 68 a 112m², lazer completo estilo resort, Academia Céltica e Club Prime. Agende sua visita.',
  },
};

export default function ResortPrimePage() {
  return <ResortPrime />;
}
