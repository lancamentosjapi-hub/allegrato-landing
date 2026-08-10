import type { Metadata } from 'next';
import { footerLegalLine } from '@/lib/site';

// Metadata portada de lotus-cookies/index.html (paridade de SEO com o estático).
// TODO go-live: trocar canonical/og:url para o domínio final e remover noindex.
export const metadata: Metadata = {
  title: 'Política de Cookies | Lotus Brokers',
  description:
    'Política de Cookies da Lotus Brokers: tipos de cookies, finalidade e como controlar o consentimento.',
  alternates: { canonical: 'https://www.lotusbrokers.com.br/lotus-cookies' },
  openGraph: {
    title: 'Política de Cookies, Lotus Brokers',
    description:
      'Política de Cookies da Lotus Brokers: tipos de cookies, finalidade e como controlar o consentimento.',
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-cookies',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: { card: 'summary_large_image' },
};

// CSS literal do <style> do estático (mantido exato). Escopo por prefixo .lc- para
// não conflitar com estilos globais do portal (o estático era um HTML isolado).
const css = `
.lc-root{--ink:#15241c;--cream:#f7f2e8;--gold:#cdab6e;--bronze:#b18a4a;--moss:#3f6249;}
.lc-root *{box-sizing:border-box}
.lc-root{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--cream);color:var(--ink);line-height:1.6}
.lc-root header{position:sticky;top:0;z-index:60;background:var(--ink)}
.lc-root .bar{max-width:900px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.lc-root .logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.lc-root .logo span{font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:21px;color:var(--cream)}
.lc-root .logo span i{font-size:10px;letter-spacing:.18em;color:var(--gold);font-style:normal;display:block;margin-top:2px}
.lc-root .back{color:rgba(247,242,232,.85);text-decoration:none;font-size:14px;font-weight:500}
.lc-root .back:hover{color:var(--gold)}
.lc-root main{max-width:760px;margin:0 auto;padding:54px 24px 80px}
.lc-root h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(28px,5vw,40px);line-height:1.1;margin:0 0 8px}
.lc-root .upd{color:var(--moss);font-size:13.5px;margin:0 0 36px}
.lc-root h2{font-family:Georgia,serif;font-weight:500;font-size:21px;margin:34px 0 10px}
.lc-root p,.lc-root li{font-size:15.5px;color:#27382f}
.lc-root a{color:var(--bronze)}
.lc-root .note{background:#fffaf0;border:1px solid var(--gold);border-radius:12px;padding:14px 18px;font-size:13.5px;color:var(--moss);margin:30px 0}
.lc-root footer{background:var(--ink);color:rgba(247,242,232,.7);font-size:13px}
.lc-root .fbar{max-width:900px;margin:0 auto;padding:30px 24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}
.lc-root footer a{color:rgba(247,242,232,.7);text-decoration:none}
.lc-root footer a:hover{color:var(--gold)}
`;

export default function LotusCookiesPage() {
  return (
    <div className="lc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header>
        <div className="bar">
          <a className="logo" href="/lotus-home">
            <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
            <span>
              Lotus<i>BROKERS</i>
            </span>
          </a>
          <a className="back" href="/lotus-home">
            ← Voltar ao site
          </a>
        </div>
      </header>
      <main>
        <h1>Política de Cookies</h1>
        <p className="upd">Última atualização: 30 de junho de 2026</p>
        <div className="note">
          📋 Conteúdo-base padrão para imobiliária com LGPD.{' '}
          <strong>Recomenda-se revisão jurídica</strong> antes da divulgação
          pública (go-live), incluindo a inserção da razão social, CNPJ, CRECI-PJ
          e endereço completos da Lotus Brokers.
        </div>
        <p>
          Esta Política de Cookies explica como a Lotus Brokers usa cookies e
          tecnologias semelhantes no site.
        </p>
        <h2>1. O que são cookies</h2>
        <p>
          Cookies são pequenos arquivos armazenados no seu dispositivo que
          permitem reconhecer seu navegador e melhorar sua experiência.
        </p>
        <h2>2. Tipos que usamos</h2>
        <p>
          <strong>Essenciais:</strong> necessários ao funcionamento do site.{' '}
          <strong>Analíticos:</strong> ajudam a entender como o site é usado
          (ex.: Google Tag Manager/Analytics). <strong>Marketing:</strong> podem
          ser usados para mensurar campanhas.
        </p>
        <h2>3. Seu controle</h2>
        <p>
          No primeiro acesso, você pode <strong>aceitar todos</strong> ou{' '}
          <strong>recusar os não-essenciais</strong> pelo banner de cookies. Você
          também pode bloquear cookies nas configurações do seu navegador, parte
          do site pode deixar de funcionar como esperado.
        </p>
        <h2>4. Consentimento</h2>
        <p>
          Os cookies não-essenciais só são ativados mediante o seu consentimento,
          conforme a LGPD. Você pode revisar sua escolha limpando os cookies do
          navegador e recarregando o site.
        </p>
        <p style={{ marginTop: 40 }}>
          <a href="/lotus-home">← Voltar para a Lotus Brokers</a>
        </p>
      </main>
      <footer>
        <div className="fbar">
          <div>
            {footerLegalLine()}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/lotus-privacidade">Privacidade</a>
            <a href="/lotus-termos">Termos</a>
            <a href="/lotus-cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
