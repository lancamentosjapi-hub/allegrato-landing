'use client';

// ponytail: Client Component (form usa useState) -> nao pode export const metadata.
// Sem SEO dedicado nesta rota; aceitavel pois e uma pagina de utilidade (exercicio de direitos),
// nao uma pagina de aquisicao/organica.
import { useState } from 'react';
import { footerLegalLine } from '@/lib/site';
import { buildMeusDadosMailto } from '@/lib/meus-dados-mailto';

// CSS EXATO do shell das paginas LGPD (copiado de app/lotus-privacidade/page.tsx).
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

const DIREITOS = [
  'Confirmação de tratamento',
  'Acesso',
  'Correção',
  'Anonimização, bloqueio ou eliminação',
  'Portabilidade',
  'Eliminação de dados tratados com consentimento',
  'Informação sobre compartilhamento',
  'Revogação de consentimento',
  'Oposição a tratamento por legítimo interesse',
  'Revisão de decisão automatizada',
];

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: 'var(--ink)',
  background: '#fff',
  border: '1px solid rgba(21,36,28,.2)',
  borderRadius: '8px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13.5px',
  fontWeight: 600,
  color: 'var(--moss)',
  margin: '16px 0 6px',
};

export default function MeusDadosPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [direito, setDireito] = useState(DIREITOS[0]);
  const [descricao, setDescricao] = useState('');

  const podeEnviar = nome.trim() !== '' && email.trim() !== '';

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const href = buildMeusDadosMailto({ nome, email, telefone, direito, descricao });
    window.location.href = href;
  }

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
        <h1>Seus dados são seus</h1>
        <p className="upd">Exercício de direitos LGPD | Lotus Brokers</p>
        <p>
          Conforme o art. 18 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode
          solicitar a qualquer momento o exercício dos seus direitos sobre os dados pessoais que
          tratamos. Respondemos em até 15 dias úteis, no e-mail informado no formulário abaixo.
        </p>

        <h2>Seus 10 direitos</h2>
        <ul>
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos</li>
          <li>Portabilidade dos dados a outro fornecedor</li>
          <li>Eliminação dos dados tratados com consentimento</li>
          <li>Informação sobre compartilhamento com terceiros</li>
          <li>Revogação do consentimento</li>
          <li>Oposição a tratamento realizado com base em legítimo interesse</li>
          <li>Revisão de decisões tomadas unicamente com base em tratamento automatizado</li>
        </ul>

        <h2>Como funciona</h2>
        <ol>
          <li>Você envia o pedido pelo formulário abaixo.</li>
          <li>Confirmamos sua identidade.</li>
          <li>Executamos o solicitado em até 15 dias úteis.</li>
          <li>Você recebe a resposta por e-mail.</li>
        </ol>

        <h2>Solicitar</h2>
        <form onSubmit={onSubmit}>
          <label style={labelStyle} htmlFor="md-nome">
            Nome*
          </label>
          <input
            id="md-nome"
            style={fieldStyle}
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label style={labelStyle} htmlFor="md-email">
            E-mail*
          </label>
          <input
            id="md-email"
            style={fieldStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={labelStyle} htmlFor="md-telefone">
            Telefone (opcional)
          </label>
          <input
            id="md-telefone"
            style={fieldStyle}
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <label style={labelStyle} htmlFor="md-direito">
            Direito
          </label>
          <select
            id="md-direito"
            style={fieldStyle}
            value={direito}
            onChange={(e) => setDireito(e.target.value)}
          >
            {DIREITOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label style={labelStyle} htmlFor="md-descricao">
            Descrição
          </label>
          <textarea
            id="md-descricao"
            style={{ ...fieldStyle, minHeight: '120px', resize: 'vertical' }}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            type="submit"
            disabled={!podeEnviar}
            style={{
              marginTop: '22px',
              background: podeEnviar ? 'var(--bronze)' : 'rgba(21,36,28,.25)',
              color: podeEnviar ? '#fff' : 'rgba(21,36,28,.6)',
              fontWeight: 700,
              fontSize: '14.5px',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '30px',
              cursor: podeEnviar ? 'pointer' : 'not-allowed',
            }}
          >
            Enviar pedido
          </button>
        </form>
        <div className="note">
          Prefere falar diretamente? Escreva para{' '}
          <a href="mailto:atendimento@lotusbrokers.com.br">atendimento@lotusbrokers.com.br</a> ou
          pelo WhatsApp{' '}
          <a href="https://wa.me/5511926143393" target="_blank" rel="noopener">
            +55 11 92614-3393
          </a>
          .
        </div>

        <h2>Perguntas frequentes</h2>
        <p>
          <strong>É gratuito?</strong>
          <br />
          Sim. O exercício dos seus direitos LGPD é sempre gratuito.
        </p>
        <p>
          <strong>Vocês confirmam minha identidade?</strong>
          <br />
          Sim, antes de executar o pedido confirmamos que quem solicitou é o titular dos dados.
        </p>
        <p>
          <strong>Preciso ter conta ou já ter comprado um imóvel?</strong>
          <br />
          Não. Qualquer pessoa cujos dados a Lotus tenha tratado pode fazer o pedido.
        </p>
        <p>
          <strong>Posso solicitar em nome de outra pessoa?</strong>
          <br />
          Sim, desde que apresente procuração ou outro documento que comprove a representação
          legal do titular.
        </p>

        <p style={{ marginTop: '40px' }}>
          <a href="../lotus-home/">← Voltar para a Lotus Brokers</a>
        </p>
      </main>
      <footer>
        <div className="fbar">
          <div>{footerLegalLine()}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="../lotus-privacidade/">Privacidade</a>
            <a href="../lotus-termos/">Termos</a>
            <a href="../lotus-cookies/">Cookies</a>
            <a href="/meus-dados">Meus dados</a>
          </div>
        </div>
      </footer>
    </>
  );
}
