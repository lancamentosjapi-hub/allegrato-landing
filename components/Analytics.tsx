'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CONSENT_EVENT, readConsent, type ConsentValue } from '@/lib/consent';

// Medição do site (Parte 1 do briefing 8h): GTM + GA4 (via GTM) + Clarity.
// IDs vêm de env NEXT_PUBLIC_*; sem ID o bloco simplesmente não renderiza,
// então dev/preview ficam limpos e o deploy liga tudo só pelas envs.
//
// LGPD / Consent Mode v2: o script inline abaixo roda antes do GTM e declara
// analytics_storage/ad_storage = denied por padrão (ou granted, se já existe
// cookie lotus_consent=all). CookieConsent faz o `consent update` no aceite.
// Clarity e Meta Pixel não têm consent mode: só carregam com consentimento 'all'.
//
// GA4 em SPA: o GTM não vê a navegação client-side do Next. Cada troca de rota
// faz push de `page_view` no dataLayer. Na tag GA4 Configuration do GTM, desligar
// "Send a page view event when this configuration loads" e criar uma tag de
// evento GA4 `page_view` disparada pelo Custom Event `page_view` (senão a
// primeira página conta em dobro).

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Consentimento atual, reagindo ao aceite do banner (CONSENT_EVENT). */
function useConsent(): ConsentValue | null {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  useEffect(() => {
    setConsent(readConsent());
    const onChange = (e: Event) => setConsent((e as CustomEvent<ConsentValue>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);
  return consent;
}

const consentInit = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var granted = /(^|; )lotus_consent=all(;|$)/.test(document.cookie);
gtag('consent','default',{
  analytics_storage: granted ? 'granted' : 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
`;

function PageViews() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname]);
  return null;
}

function Clarity() {
  const consent = useConsent();
  if (!CLARITY_ID || consent !== 'all') return null;
  return (
    <Script id="clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}

function MetaPixel() {
  const consent = useConsent();
  const pathname = usePathname();
  const primeiraRota = useRef(true);

  // PageView por troca de rota SPA. A primeira é pulada: o snippet base já
  // dispara o PageView inicial ao carregar. Sem consentimento, fbq não existe
  // e o optional chaining vira no-op.
  useEffect(() => {
    if (!pathname) return;
    if (primeiraRota.current) {
      primeiraRota.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  if (!META_PIXEL_ID || consent !== 'all') return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  );
}

export default function Analytics() {
  if (!GTM_ID) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: consentInit }} />
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <PageViews />
      <Clarity />
      <MetaPixel />
    </>
  );
}

/** <noscript> do GTM — vai logo após a abertura do <body>, como pede o Google. */
export function AnalyticsNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
