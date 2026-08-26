import type { Metadata } from 'next';
import { footerLegalLine } from '@/lib/site';
import TabelaCookies from '@/components/TabelaCookies';

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

/* Índice lateral: acompanha a rolagem no desktop, vira lista simples no
   celular, onde não há coluna sobrando para ele. */
.lc-root .lc-wrap{max-width:1080px;margin:0 auto;padding:54px 24px 80px;display:grid;grid-template-columns:220px 1fr;gap:44px;align-items:start}
.lc-root .lc-indice{position:sticky;top:78px;font-size:13.5px}
.lc-root .lc-indice strong{display:block;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--bronze);margin-bottom:12px}
.lc-root .lc-indice a{display:block;padding:6px 0;color:var(--moss);text-decoration:none;line-height:1.35}
.lc-root .lc-indice a:hover{color:var(--bronze)}
.lc-root .lc-conteudo{min-width:0}
@media(max-width:820px){
  .lc-root .lc-wrap{grid-template-columns:1fr;gap:26px;padding:36px 20px 64px}
  .lc-root .lc-indice{position:static;border-bottom:1px solid rgba(21,36,28,.12);padding-bottom:16px}
  .lc-root .lc-indice a{display:inline-block;padding:6px 14px 6px 0}
}

/* Tabela de cookies. No celular ela some e entra a lista expansível: cinco
   colunas em 360px espremem "Finalidade" a uma palavra por linha. */
.lc-root [data-cookies-tabela]{overflow-x:auto;margin:18px 0 8px;border:1px solid rgba(21,36,28,.14);border-radius:12px}
.lc-root [data-cookies-tabela] table{width:100%;border-collapse:collapse;font-size:14px;min-width:640px}
.lc-root [data-cookies-tabela] th{text-align:left;background:#efe7d8;color:var(--ink);font-weight:600;font-size:12.5px;letter-spacing:.04em;padding:11px 14px;white-space:nowrap}
.lc-root [data-cookies-tabela] td{padding:13px 14px;border-top:1px solid rgba(21,36,28,.1);color:#27382f;vertical-align:top}
.lc-root [data-cookies-tabela] code{font-size:13px;background:#efe7d8;padding:2px 6px;border-radius:5px;white-space:nowrap}
.lc-root [data-cookies-lista]{display:none;margin:18px 0 8px}
.lc-root .ck-item{border:1px solid rgba(21,36,28,.14);border-radius:12px;margin-bottom:10px;overflow:hidden;background:#fff}
.lc-root .ck-item>button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;background:none;border:none;padding:14px 16px;cursor:pointer;text-align:left;font:inherit}
.lc-root .ck-item>button>span:first-child{display:flex;flex-direction:column;gap:4px;min-width:0}
.lc-root .ck-item small{font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.lc-root .ck-item>button>span:last-child{font-size:22px;color:var(--bronze);line-height:1;flex-shrink:0}
.lc-root .ck-item dl{margin:0;padding:0 16px 16px;font-size:14px}
.lc-root .ck-item dt{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--bronze);margin-top:12px}
.lc-root .ck-item dd{margin:4px 0 0;color:#27382f;line-height:1.55}
@media(max-width:700px){
  .lc-root [data-cookies-tabela]{display:none}
  .lc-root [data-cookies-lista]{display:block}
}
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
        <div className="lc-wrap">
          <nav className="lc-indice" aria-label="Índice desta política">
            <strong>Nesta página</strong>
            <a href="#c1">1. O que são cookies</a>
            <a href="#c2">2. Como usamos cookies</a>
            <a href="#c3">3. Lista completa dos cookies</a>
            <a href="#c4">4. Como recusar ou gerenciar</a>
            <a href="#c5">5. Cookies de terceiros</a>
            <a href="#c6">6. Alterações desta política</a>
            <a href="#c7">7. Contato</a>
          </nav>

          <div className="lc-conteudo">
            <h1>Política de Cookies</h1>
            <p className="upd">Versão 2 · Última atualização: 26 de agosto de 2026</p>

            <h2 id="c1">1. O que são cookies</h2>
            <p>
              Cookies são pequenos arquivos que sites deixam no seu navegador pra lembrar de coisas: o que
              você já viu, se você está logado, quais suas preferências. Alguns são essenciais pro site
              funcionar. Outros ajudam a gente a entender o que está funcionando bem. E outros permitem
              mostrar anúncios mais relevantes.
            </p>

            <h2 id="c2">2. Como usamos cookies</h2>
            <p>
              Na Lotus, o uso é enxuto. Um cookie essencial guarda a sua escolha sobre cookies, para não
              perguntarmos de novo a cada visita: esse é gravado sempre, porque sem ele não há como
              respeitar a sua decisão. Os demais são de medição, entram apenas se você aceitar os
              não-essenciais, e servem para entendermos quais páginas ajudam e quais atrapalham.
            </p>
            <p>
              <strong>A Lotus não usa cookies de publicidade.</strong> Não há pixel de Meta (Facebook ou
              Instagram) nem tag de Google Ads neste site, e o consentimento de armazenamento para
              publicidade está desligado por padrão na nossa configuração, mesmo para quem aceita todos os
              cookies. Se isso mudar, esta política muda antes.
            </p>

            <h2 id="c3">3. Lista completa dos cookies</h2>
            <p>
              Esta lista reflete o que o site realmente usa hoje. Se um cookie não está aqui, ele não é
              colocado por nós.
            </p>
            <TabelaCookies />

            <h2 id="c4">4. Como recusar ou gerenciar</h2>
            <p>Você tem três formas de controlar cookies na Lotus:</p>
            <p>
              <strong>1. Pelo nosso banner</strong> — use o botão &ldquo;Abrir preferências de cookies&rdquo;
              acima. Você pode mudar a sua escolha a qualquer momento.
            </p>
            <p>
              <strong>2. Pelo seu navegador</strong> — todos os navegadores (Chrome, Safari, Firefox, Edge)
              têm configuração pra recusar ou apagar cookies. Vale lembrar: se você recusar todos os
              cookies, algumas partes do site podem não funcionar direito.
            </p>
            <p>
              <strong>3. Pelas ferramentas de terceiros</strong> — Google e Meta têm páginas específicas pra
              você recusar publicidade personalizada:
            </p>
            <ul>
              <li>
                Google: <a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a>
              </li>
              <li>
                Meta (Facebook/Instagram):{' '}
                <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener">facebook.com/adpreferences</a>
              </li>
            </ul>

            <h2 id="c5">5. Cookies de terceiros</h2>
            <p>
              Alguns cookies são colocados por empresas parceiras quando você usa recursos delas no nosso
              site. Hoje isso se aplica ao Google Analytics e ao Microsoft Clarity, listados na tabela
              acima, e só depois de você aceitar os cookies não-essenciais. A Lotus não controla esses
              cookies diretamente: eles seguem as políticas próprias dos parceiros.
            </p>
            <ul>
              <li>
                Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>
              </li>
              <li>
                Microsoft:{' '}
                <a href="https://privacy.microsoft.com/pt-br/privacystatement" target="_blank" rel="noopener">privacy.microsoft.com</a>
              </li>
            </ul>

            <h2 id="c6">6. Alterações desta política</h2>
            <p>
              Sempre que mudarmos as ferramentas que usamos, atualizamos esta página e a data de revisão no
              topo. Mudança que amplie a coleta pede consentimento de novo: o banner reaparece para você
              decidir outra vez.
            </p>

            <h2 id="c7">7. Contato</h2>
            <p>
              Dúvidas sobre cookies ou sobre os seus dados falam com o nosso Encarregado de Proteção de
              Dados (DPO):
            </p>
            <p>
              <a href="mailto:atendimento@lotusbrokers.com.br">atendimento@lotusbrokers.com.br</a>
            </p>
            <div className="note">
              Esta política complementa a{' '}
              <a href="/lotus-privacidade">Política de Privacidade</a>, que explica quais dados tratamos, com
              que finalidade e quais são os seus direitos pela LGPD.
            </div>
          </div>
        </div>
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
