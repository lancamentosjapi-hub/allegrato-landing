import type { Metadata } from 'next';
import { CONSENT_INLINE_SCRIPT } from '@/lib/consent-inline';
import { footerLegalLine } from '@/lib/site';

// Metadata portado do <head> do fonte estático (lotus-termos/index.html).
// TODO go-live: trocar canonical/og:url para o domínio final e remover noindex.
export const metadata: Metadata = {
  title: 'Termos de Uso | Lotus Brokers',
  description:
    'Termos de Uso do site da Lotus Brokers, condições de utilização e informações sobre imóveis e serviços.',
  alternates: {
    canonical: 'https://www.lotusbrokers.com.br/lotus-termos',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.lotusbrokers.com.br/lotus-termos',
    title: 'Termos de Uso, Lotus Brokers',
    description:
      'Termos de Uso do site da Lotus Brokers, condições de utilização e informações sobre imóveis e serviços.',
    images: [
      'https://i.postimg.cc/nzx1wvHM/Chat-GPT-Image-25-de-jun-de-2026-14-04-13.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// CSS EXATO do <style> do fonte estático. Via <style> inline para preservar
// os seletores globais (:root, *, body, header, h1, h2, p, li, a, footer) —
// um CSS Module não aceita seletores de elemento "não puros". Este CSS é
// carregado depois do globals.css, então sobrescreve o body/reset globais e
// garante o visual 100% idêntico ao estático (fontes de sistema, box-sizing próprio).
const css = `
:root{--ink:#15241c;--cream:#f7f2e8;--gold:#cdab6e;--bronze:#b18a4a;--moss:#3f6249;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--cream);color:var(--ink);line-height:1.6}
header{position:sticky;top:0;z-index:60;background:var(--ink)}
.bar{max-width:900px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo span{font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:21px;color:var(--cream)}
.logo span i{font-size:10px;letter-spacing:.18em;color:var(--gold);font-style:normal;display:block;margin-top:2px}
.back{color:rgba(247,242,232,.85);text-decoration:none;font-size:14px;font-weight:500}
.back:hover{color:var(--gold)}
main{max-width:760px;margin:0 auto;padding:54px 24px 80px}
h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(28px,5vw,40px);line-height:1.1;margin:0 0 8px}
.upd{color:var(--moss);font-size:13.5px;margin:0 0 36px}
h2{font-family:Georgia,serif;font-weight:500;font-size:21px;margin:34px 0 10px}
p,li{font-size:15.5px;color:#27382f}
a{color:var(--bronze)}
.note{background:#fffaf0;border:1px solid var(--gold);border-radius:12px;padding:14px 18px;font-size:13.5px;color:var(--moss);margin:30px 0}
footer{background:var(--ink);color:rgba(247,242,232,.7);font-size:13px}
.fbar{max-width:900px;margin:0 auto;padding:30px 24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}
footer a{color:rgba(247,242,232,.7);text-decoration:none}footer a:hover{color:var(--gold)}
`;

// Consentimento: script compartilhado, em lib/consent-inline.ts.
const cookieScript = CONSENT_INLINE_SCRIPT;

export default function LotusTermosPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header>
        <div className="bar">
          <a className="logo" href="../lotus-home/">
            <img src="/logo-lotus-dourado.png" alt="Lotus Brokers" style={{ height: 34, width: 'auto', display: 'block' }} />
            <span>
              Lotus<i>BROKERS</i>
            </span>
          </a>
          <a className="back" href="../lotus-home/">
            ← Voltar ao site
          </a>
        </div>
      </header>
      <main>
        <h1>Termos de Uso</h1>
        <p className="upd">Última atualização: 27 de julho de 2026</p>
        <div className="note">
          📋 Conteúdo-base padrão para imobiliária com LGPD.{' '}
          <strong>Recomenda-se revisão jurídica</strong> antes da divulgação
          pública (go-live), incluindo a inserção da razão social, CNPJ, CRECI-PJ
          e endereço completos da Lotus Brokers.
        </div>
        <p>
          Estes Termos de Uso (v1.0) regem o acesso e a utilização do site e
          dos serviços da Lotus Brokers.
        </p>

        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar ou utilizar este site, você concorda integralmente com
          estes Termos de Uso. O uso do site pressupõe que você tem 18 anos ou
          mais. Caso não concorde com qualquer disposição destes Termos, não
          utilize o site.
        </p>

        <h2>2. Quem somos</h2>
        <p>
          A Lotus Brokers atua no ramo de intermediação imobiliária. Dados da
          empresa:
        </p>
        <p>
          Razão social: [⬜]
          <br />
          Nome fantasia: Lotus Brokers
          <br />
          CNPJ: [⬜]
          <br />
          CRECI-PJ: [⬜]
          <br />
          Endereço: [⬜]
          <br />
          Canal de atendimento:{' '}
          <a href="mailto:atendimento@lotusbrokers.com.br">
            atendimento@lotusbrokers.com.br
          </a>
        </p>

        <h2>3. Cadastro e responsabilidades do usuário</h2>
        <p>
          Ao se cadastrar, você declara fornecer dados verdadeiros, completos
          e atualizados. Ao utilizar o site, você se compromete a não:
        </p>
        <p>
          a) fornecer informações falsas ou de terceiros sem autorização;
          <br />
          b) utilizar o site para fins ilícitos ou não autorizados;
          <br />
          c) tentar acessar áreas, sistemas ou dados restritos;
          <br />
          d) interferir no funcionamento do site ou de seus sistemas de
          segurança;
          <br />
          e) reproduzir, copiar ou explorar o conteúdo do site sem autorização
          prévia.
        </p>
        <p>
          3.5. O site não é destinado a menores de 18 anos e não coleta
          intencionalmente dados de menores. Caso identifiquemos cadastro de
          menor de idade, o tratamento seguirá o disposto no art. 14 da Lei
          Geral de Proteção de Dados (LGPD).
        </p>
        <p>
          3.6. A Lotus Brokers pode suspender ou cancelar cadastros que
          violem estes Termos.
        </p>

        <h2>4. Serviços oferecidos</h2>
        <p>
          O site oferece divulgação de imóveis, captação, intermediação,
          atendimento ao cliente, avaliação de imóveis, agendamento de visitas
          e apresentação de propostas. A Lotus Brokers atua como
          intermediadora nas negociações e não garante a conclusão de
          qualquer negócio.
        </p>

        <h2>5. Tratamento de dados pessoais</h2>
        <p>
          O tratamento de dados pessoais realizado pela Lotus Brokers segue a
          Lei Geral de Proteção de Dados (LGPD). A{' '}
          <a href="../lotus-privacidade/">Política de Privacidade</a> e a{' '}
          <a href="../lotus-cookies/">Política de Cookies</a> integram estes
          Termos de Uso.
        </p>

        <h2>6. Comunicações</h2>
        <p>
          Podemos enviar comunicações transacionais e operacionais (por
          exemplo, confirmações de agendamento ou retorno a solicitações) e
          comunicações de marketing. Você pode solicitar o cancelamento
          (opt-out) de comunicações de marketing a qualquer momento pelo canal{' '}
          <a href="mailto:atendimento@lotusbrokers.com.br">
            atendimento@lotusbrokers.com.br
          </a>
          . O opt-out de marketing não implica a exclusão de dados cuja
          manutenção seja exigida por lei.
        </p>

        <h2>7. Conteúdo gerado ou enviado pelo usuário</h2>
        <p>
          Ao enviar conteúdo ao site (mensagens, avaliações, documentos ou
          materiais), você declara ser titular dos direitos sobre esse
          conteúdo e concede à Lotus Brokers licença não exclusiva, gratuita
          e revogável para utilizá-lo nos serviços prestados.
        </p>
        <p>
          7.3.1. Em caso de suspensão de cadastro ou de venda/encerramento de
          operações, o conteúdo enviado poderá ser mantido por até 6 meses,
          para fins de: a) cumprimento de obrigação legal ou regulatória; b)
          exercício regular de direitos em processo administrativo, judicial
          ou arbitral; c) segurança e prevenção a fraudes; d) uso conforme
          autorização do titular ou consentimento previamente obtido.
        </p>
        <p>
          7.3.2. Encerrado esse prazo, o conteúdo será descartado, salvo se
          houver obrigação legal que exija sua manutenção por período
          diverso.
        </p>

        <h2>8. Propriedade intelectual</h2>
        <p>
          Marca, identidade visual, textos, imagens e demais conteúdos do
          site são protegidos por direitos de propriedade intelectual. O
          usuário não pode copiar, reproduzir ou explorar comercialmente esse
          conteúdo sem autorização prévia da Lotus Brokers.
        </p>

        <h2>9. Compartilhamento de dados com corretores Lotus</h2>
        <p>
          Dados de leads e clientes podem ser distribuídos internamente entre
          corretores da Lotus Brokers, conforme a necessidade do atendimento,
          a finalidade da coleta e controles de acesso baseados em função
          (RBAC).
        </p>

        <h2>10. Limitações de responsabilidade</h2>
        <p>
          A Lotus Brokers emprega esforços razoáveis para manter as
          informações do site atualizadas e precisas, mas não garante a
          conclusão de negócios, a aprovação de financiamento, o aceite de
          propostas, a disponibilidade ou o preço final de qualquer imóvel.
          O conteúdo do site não substitui assessoria jurídica
          especializada.
        </p>

        <h2>11. Modificações dos Termos</h2>
        <p>
          Podemos alterar estes Termos a qualquer momento. Alterações não
          materiais entram em vigor com aviso de ao menos 15 dias, com
          aceite tácito pela continuidade de uso. Alterações materiais
          exigem aceite ativo do usuário.
        </p>

        <h2>12. Lei aplicável e foro</h2>
        <p>
          Estes Termos são regidos pelas leis do Brasil. Fica eleito o foro
          da Comarca de Jundiaí/SP, ressalvadas as hipóteses de foro
          obrigatório previstas em lei.
        </p>
        <p>
          12.3. Caso qualquer disposição destes Termos seja considerada
          inválida ou inexequível, as demais disposições permanecem em pleno
          vigor e efeito.
        </p>

        <h2>13. Canal de contato</h2>
        <p>
          Dúvidas sobre estes Termos podem ser encaminhadas pelo e-mail{' '}
          <a href="mailto:atendimento@lotusbrokers.com.br">
            atendimento@lotusbrokers.com.br
          </a>{' '}
          ou pelo WhatsApp{' '}
          <a
            href="https://wa.me/5511926143393"
            target="_blank"
            rel="noopener"
          >
            +55 11 92614-3393
          </a>
          .
        </p>

        <p style={{ marginTop: 40 }}>
          <a href="../lotus-home/">← Voltar para a Lotus Brokers</a>
        </p>
      </main>
      <footer>
        <div className="fbar">
          <div>
            {footerLegalLine()}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="../lotus-privacidade/">Privacidade</a>
            <a href="../lotus-termos/">Termos</a>
            <a href="../lotus-cookies/">Cookies</a>
            <a href="/meus-dados">Meus dados</a>
          </div>
        </div>
      </footer>
      <div
        id="lotus-cookie"
        role="dialog"
        aria-label="Aviso de cookies"
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 16,
          zIndex: 9999,
          maxWidth: 560,
          margin: '0 auto',
          background: '#15241c',
          color: '#f7f2e8',
          border: '1px solid rgba(205,171,110,.4)',
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 18px 50px -20px rgba(0,0,0,.5)',
          fontFamily: 'system-ui,-apple-system,sans-serif',
          display: 'none',
        }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 13.5,
            lineHeight: 1.5,
            color: 'rgba(247,242,232,.85)',
          }}
        >
          Usamos cookies para melhorar sua experiência e entender o uso do site.
          Aceite todos ou recuse os não-essenciais.{' '}
          <a
            href="../lotus-cookies/"
            style={{ color: '#cdab6e', textDecoration: 'underline' }}
          >
            Política de Cookies
          </a>
          .
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            id="lotus-cookie-accept"
            type="button"
            style={{
              background: '#b18a4a',
              color: '#15241c',
              fontWeight: 700,
              fontSize: 13.5,
              border: 'none',
              padding: '10px 18px',
              borderRadius: 30,
              cursor: 'pointer',
            }}
          >
            Aceitar todos
          </button>
          <button
            id="lotus-cookie-reject"
            type="button"
            style={{
              background: 'transparent',
              color: '#f7f2e8',
              fontWeight: 600,
              fontSize: 13.5,
              border: '1px solid rgba(247,242,232,.3)',
              padding: '10px 18px',
              borderRadius: 30,
              cursor: 'pointer',
            }}
          >
            Recusar não-essenciais
          </button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: cookieScript }} />
    </>
  );
}
