import { CONSENT_COOKIE, CONSENT_EVENT } from './consent';

/**
 * Versão inline do consentimento, para as páginas portadas do estático
 * (/lotus-privacidade e /lotus-termos), que rodam sem client component e por
 * isso não conseguem importar writeConsent.
 *
 * Existe porque as duas tinham cada uma a sua cópia do script, e nenhuma
 * atualizava o Consent Mode: quem aceitava cookies ali tinha o cookie gravado
 * e o banner sumia, mas `gtag('consent','update')` nunca disparava. O GA4
 * continuava bloqueado pelo default 'denied' e o Clarity nunca carregava,
 * porque ele escuta o evento que essas cópias não emitiam. Na prática, o
 * consentimento dado nessas páginas era ignorado pela medição.
 *
 * O comportamento aqui espelha writeConsent() em lib/consent.ts. Ao mexer em
 * um, mexer no outro: são duas implementações da mesma regra, e não há como o
 * TypeScript garantir isso por ser string.
 */
export const CONSENT_INLINE_SCRIPT = `(function(){try{
var b=document.getElementById("lotus-cookie");if(!b)return;
if(document.cookie.indexOf("${CONSENT_COOKIE}=")===-1){b.style.display="block";}
function s(v){
  document.cookie="${CONSENT_COOKIE}="+v+";path=/;max-age=15552000;SameSite=Lax";
  b.style.display="none";
  window.dataLayer=window.dataLayer||[];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('consent','update',{
    analytics_storage: v==='all'?'granted':'denied',
    ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'
  });
  window.dataLayer.push({event:"cookie_consent",consent:v});
  window.dispatchEvent(new CustomEvent("${CONSENT_EVENT}",{detail:v}));
}
document.getElementById("lotus-cookie-accept").addEventListener("click",function(){s("all")});
document.getElementById("lotus-cookie-reject").addEventListener("click",function(){s("essential")});
}catch(e){}})();`;
