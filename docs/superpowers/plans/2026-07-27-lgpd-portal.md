# LGPD no Portal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o conteúdo LGPD do portal por versões completas — Termos v1.0 (13 cláusulas), Privacidade 14 seções (com IA) — e criar a página `/meus-dados` de exercício de direitos.

**Architecture:** Termos e Privacidade são Server Components que já existem; só o miolo do `<main>` é reescrito, preservando header/CSS/footer/banner de cookies. `/meus-dados` é uma página nova Client Component que reusa o mesmo shell visual e cujo formulário abre um `mailto:` pré-preenchido (sem backend).

**Tech Stack:** Next.js App Router, React (Server + um Client Component), TypeScript. Sem libs novas.

## Global Constraints

- Sem backend nesta rodada: nenhum endpoint, nenhuma tabela, nenhum job.
- Dados institucionais (razão social, CNPJ, CRECI-PJ, endereço) permanecem placeholders — usar `[⬜]` no texto e manter a `.note` de revisão jurídica. **Nunca inventar valores reais.**
- Empresa/rodapé vêm de `footerLegalLine()` em `@/lib/site` — não duplicar.
- Manter ambos os canais: WhatsApp `+55 11 92614-3393` (dúvidas gerais) e e-mail `atendimento@lotusbrokers.com.br` (+ `/meus-dados`) para direitos formais.
- Preservar em cada página existente: string `css` inline, `<header>` sticky, `.note`, `<footer>` com `footerLegalLine()`, banner de cookies + `cookieScript`.
- Data de atualização exibida (`.upd`): **27 de julho de 2026**.
- Fonte dos textos: doc `8. LGPD + Protocolo Jurídico Captação` §2 (Termos), doc `8a. LGPD - Manual Webdesigner` §4 (Privacidade) e §7 (`/meus-dados`).
- Verificação de cada task de página: `npm run build` compila sem erro.

---

### Task 1: Termos de Uso v1.0 (13 cláusulas)

**Files:**
- Modify: `app/lotus-termos/page.tsx` — trocar o conteúdo do `<main>` (linhas ~81-136, do `<h1>` até o link "← Voltar") e atualizar `.upd`. Header/CSS/footer/banner/`metadata` ficam.

**Interfaces:**
- Consumes: `footerLegalLine` de `@/lib/site` (já importado).
- Produces: rota `/lotus-termos` com 13 `<h2>` na ordem do spec; link `/meus-dados` no footer.

- [ ] **Step 1: Reescrever o `<main>`**

Manter `<h1>Termos de Uso</h1>`, trocar `.upd` para `Última atualização: 27 de julho de 2026`, manter a `.note` atual de revisão jurídica. Substituir os 6 tópicos pelos 13 `<h2>` abaixo, com o texto do doc 8 §2 (parafrasear fiel; empresa como `[⬜]`):

1. `Aceitação dos Termos` — uso implica aceite integral; declara ≥18 anos; se discorda, não usar.
2. `Quem somos` — atividade imobiliária; dados da empresa: Razão social `[⬜]`, Nome fantasia Lotus Brokers, CNPJ `[⬜]`, CRECI PJ `[⬜]`, Endereço `[⬜]`, canal `atendimento@lotusbrokers.com.br`.
3. `Cadastro e responsabilidades do usuário` — dados verdadeiros; vedações (a-e); §3.5 menores (≥18, não coleta intencional de menores, art. 14 LGPD); §3.6 suspensão de cadastro.
4. `Serviços oferecidos` — divulgação/captação/intermediação/atendimento/avaliação/visitas/propostas; atua como intermediadora, não garante fechamento.
5. `Tratamento de dados pessoais` — conforme LGPD; a `<a href="/lotus-privacidade">Política de Privacidade</a>` e a `<a href="/lotus-cookies">Política de Cookies</a>` integram estes Termos.
6. `Comunicações` — transacionais/operacionais vs. marketing; opt-out via `atendimento@lotusbrokers.com.br`; opt-out de marketing não apaga dados necessários por lei.
7. `Conteúdo gerado ou enviado pelo usuário` — declara titularidade; licença não exclusiva/gratuita/revogável; **§7.3.1** manutenção por até 6 meses após suspensão/venda (a-d); **§7.3.2** cessação findo o prazo, salvo obrigação legal.
8. `Propriedade intelectual` — marca/identidade/conteúdo protegidos; usuário não copia/explora sem autorização.
9. `Compartilhamento de dados com corretores Lotus` — distribuição interna de leads conforme necessidade/finalidade/RBAC.
10. `Limitações de responsabilidade` — esforços razoáveis; não garante fechamento/financiamento/aceite/disponibilidade/preço; não substitui assessoria jurídica.
11. `Modificações dos Termos` — comunica com ≥15 dias; aceite tácito p/ mudança não material, aceite ativo p/ material.
12. `Lei aplicável e foro` — leis do Brasil; foro Comarca de Jundiaí/SP, ressalvadas hipóteses legais; §12.3 independência das cláusulas (severability).
13. `Canal de contato` — `atendimento@lotusbrokers.com.br` + WhatsApp `<a href="https://wa.me/5511926143393" target="_blank" rel="noopener">+55 11 92614-3393</a>`.

Manter o link final `<a href="../lotus-home/">← Voltar para a Lotus Brokers</a>`.

- [ ] **Step 2: Adicionar `/meus-dados` no footer**

No `<footer>`, no bloco de links (junto de Privacidade/Termos/Cookies), acrescentar `<a href="/meus-dados">Meus dados</a>`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: compila sem erro; rota `/lotus-termos` presente na saída.

- [ ] **Step 4: Commit**

```bash
git add app/lotus-termos/page.tsx
git -c user.name="hash-cell" commit -m "feat(lgpd): termos de uso v1.0 completo (13 cláusulas)"
```

---

### Task 2: Política de Privacidade — 14 seções (com IA)

**Files:**
- Modify: `app/lotus-privacidade/page.tsx` — trocar o conteúdo do `<main>` (do `<h1>` até o link "← Voltar", ~linhas 73-122) e atualizar `.upd`. Header/CSS/footer/banner/`metadata` ficam.

**Interfaces:**
- Consumes: `footerLegalLine` de `@/lib/site` (já importado); a classe `.note` já definida no `css` da página.
- Produces: rota `/lotus-privacidade` com 14 `<h2>`; seção 10 e 14 linkam `/meus-dados`; link `/meus-dados` no footer.

- [ ] **Step 1: Reescrever o `<main>`**

Manter `<h1>Política de Privacidade</h1>`, `.upd` = `Última atualização: 27 de julho de 2026`, manter a `.note` de revisão jurídica. Substituir as 5 seções pelas 14 `<h2>` (texto do doc 8a §4, parafrasear fiel):

1. `Quem somos` — imobiliária em Jundiaí/Itupeva; usa tecnologia inclusive IA; empresa `[⬜]`.
2. `O que este documento faz` — explica como a Lotus cuida dos dados.
3. `Quais dados coletamos` — nome, e-mail, telefone, preferências, histórico, navegação/cookies, docs (CPF/RG) só em negociação, financeiros só em proposta.
4. `Por que coletamos (finalidades)` — atender, executar negociação, cumprir lei, e com autorização, marketing.
5. `Base legal para cada tratamento` — consentimento, execução pré-contratual/contratual, legítimo interesse, obrigação legal.
6. `Com quem compartilhamos` — corretores parceiros e provedores de tecnologia p/ as finalidades; não vende dados.
7. `Por quanto tempo guardamos` — pelo tempo necessário às finalidades ou conforme a lei.
8. `Onde os dados ficam armazenados` — em plataformas/provedores contratados, com medidas de segurança.
9. `Segurança` — medidas técnicas e organizacionais razoáveis.
10. `Seus direitos LGPD` — art. 18; exercer via `<a href="/meus-dados">/meus-dados</a>` ou `atendimento@lotusbrokers.com.br`; SLA ≤15 dias úteis.
11. `Uso de inteligência artificial` — **envolver num `<div className="note">`** (destaque): LIA no atendimento (pode pedir humano a qualquer momento), VISÃO no scoring (priorização interna, não decisão automatizada com efeitos jurídicos), direito a revisão humana (art. 20 LGPD) via `atendimento@lotusbrokers.com.br`.
12. `Menores de 18 anos` — serviços p/ maiores de 18; não coleta intencional de menores; apaga/anonimiza se descoberto.
13. `Cookies` — ver `<a href="/lotus-cookies">Política de Cookies</a>`.
14. `Contato do DPO` — `atendimento@lotusbrokers.com.br` + WhatsApp `<a href="https://wa.me/5511926143393" target="_blank" rel="noopener">+55 11 92614-3393</a>`.

Após a seção 14, um parágrafo curto de histórico de versões: `<strong>Histórico de versões:</strong> v1.0 — 27 de julho de 2026 — versão inicial.` (sem accordion). Manter o link final `← Voltar para a Lotus Brokers`.

- [ ] **Step 2: Adicionar `/meus-dados` no footer**

No `<footer>`, junto de Privacidade/Termos/Cookies, acrescentar `<a href="/meus-dados">Meus dados</a>`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: compila sem erro; rota `/lotus-privacidade` presente.

- [ ] **Step 4: Commit**

```bash
git add app/lotus-privacidade/page.tsx
git -c user.name="hash-cell" commit -m "feat(lgpd): política de privacidade com 14 seções (incl. uso de IA)"
```

---

### Task 3: Builder do mailto: (lógica testável de /meus-dados)

**Files:**
- Create: `lib/meus-dados-mailto.ts` — função pura que monta o link.
- Test: `lib/meus-dados-mailto.test.ts` — self-check com assert.

**Interfaces:**
- Produces: `export function buildMeusDadosMailto(input: { nome: string; email: string; telefone?: string; direito: string; descricao: string }): string` — retorna uma URL `mailto:` com `subject` e `body` percent-encoded, destinada a `atendimento@lotusbrokers.com.br`. Consumida pela Task 4.

- [ ] **Step 1: Escrever o teste que falha**

`lib/meus-dados-mailto.test.ts`:

```ts
import assert from 'node:assert/strict';
import { buildMeusDadosMailto } from './meus-dados-mailto';

const url = buildMeusDadosMailto({
  nome: 'Ana Antão',
  email: 'ana@example.com',
  telefone: '',
  direito: 'Eliminação',
  descricao: 'Quero apagar\nmeus dados',
});

// destinatário fixo
assert.ok(url.startsWith('mailto:atendimento@lotusbrokers.com.br?'), 'destinatário correto');
// subject e body percent-encoded (acento e quebra de linha não vazam crus)
assert.ok(url.includes('subject='), 'tem subject');
assert.ok(url.includes('body='), 'tem body');
assert.ok(!url.includes('Antão'), 'acento é encodado no output');
assert.ok(!url.includes('\n'), 'quebra de linha é encodada');
// dados presentes de forma encodada
assert.ok(url.includes(encodeURIComponent('Ana Antão')), 'nome encodado presente');
assert.ok(url.includes(encodeURIComponent('Eliminação')), 'direito encodado presente');

console.log('ok');
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --experimental-strip-types lib/meus-dados-mailto.test.ts`
Expected: FAIL — módulo `./meus-dados-mailto` não existe.

- [ ] **Step 3: Implementar**

`lib/meus-dados-mailto.ts`:

```ts
export interface MeusDadosInput {
  nome: string;
  email: string;
  telefone?: string;
  direito: string;
  descricao: string;
}

// Monta um mailto: pré-preenchido para o canal de direitos LGPD.
// ponytail: mailto — sem protocolo/persistência; trocar por /api/meus-dados
// quando o backend do doc 8b (consent_log) existir.
export function buildMeusDadosMailto(input: MeusDadosInput): string {
  const to = 'atendimento@lotusbrokers.com.br';
  const subject = `Pedido LGPD — ${input.direito}`;
  const body = [
    `Nome: ${input.nome}`,
    `E-mail: ${input.email}`,
    input.telefone ? `Telefone: ${input.telefone}` : null,
    `Direito solicitado: ${input.direito}`,
    '',
    'Descrição:',
    input.descricao,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --experimental-strip-types lib/meus-dados-mailto.test.ts`
Expected: PASS — imprime `ok`.

- [ ] **Step 5: Commit**

```bash
git add lib/meus-dados-mailto.ts lib/meus-dados-mailto.test.ts
git -c user.name="hash-cell" commit -m "feat(lgpd): builder do mailto: de exercício de direitos"
```

---

### Task 4: Página /meus-dados

**Files:**
- Create: `app/meus-dados/page.tsx` — Client Component com o mesmo shell visual das outras páginas LGPD + formulário.

**Interfaces:**
- Consumes: `buildMeusDadosMailto` da Task 3.
- Produces: rota `/meus-dados`.

- [ ] **Step 1: Criar a página**

`app/meus-dados/page.tsx` começa com `'use client';`. Reusar o mesmo `css` inline, `<header>` (logo + "← Voltar ao site") e `<footer>` (com `footerLegalLine()` + links Privacidade/Termos/Cookies/Meus dados) das páginas existentes — copiar o padrão verbatim; não extrair componente compartilhado nesta rodada (as páginas já duplicam entre si). Como é Client Component, `footerLegalLine()` roda no cliente sem problema (é função pura). Não incluir banner de cookies (opcional; omitir p/ enxugar).

Metadata: como é Client Component, definir `<title>` via `document.title` num `useEffect`, ou deixar o title da página herdar. **Simplificar:** não exportar `metadata` (Client Component não suporta); adicionar no `<main>` só o conteúdo. (SEO desta página não é prioridade — `ponytail:` sem metadata dedicada.)

Conteúdo do `<main>`:
- `<h1>Seus dados são seus</h1>` + subtítulo + parágrafo (art. 18 LGPD, SLA ≤15 dias úteis, resposta no e-mail informado).
- `<h2>Seus 10 direitos</h2>` — `<ul>` com os 10: Confirmação, Acesso, Correção, Anonimização/bloqueio/eliminação, Portabilidade, Eliminação, Informação sobre compartilhamento, Revogar consentimento, Oposição a legítimo interesse, Revisão humana de decisão automatizada.
- `<h2>Como funciona</h2>` — `<ol>` de 4 passos: envia o pedido → confirmamos identidade → executamos (≤15 dias úteis) → você recebe resposta por e-mail.
- `<h2>Solicitar</h2>` + formulário (ver Step 2).
- `<h2>Perguntas frequentes</h2>` — 4 Q&A: gratuito (sim, é gratuito); identidade (sim, confirmamos); sem conta (também pode pedir); por terceiro (sim, com procuração).

- [ ] **Step 2: Formulário com estado + mailto**

Dentro do componente, estado com `useState` para nome, email, telefone, direito, descricao. Os 10 direitos num `<select>`. Botão desabilitado enquanto `nome` ou `email` vazios. Ao submeter:

```tsx
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

function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  const href = buildMeusDadosMailto({ nome, email, telefone, direito, descricao });
  window.location.href = href;
}
```

Campos: Nome*, E-mail* (`type="email"`), Telefone (opcional), `<select>` Direito (default = primeiro), Descrição (`<textarea>`). `<label>` associado a cada input (acessibilidade). Botão `type="submit"` "Enviar pedido".

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: compila sem erro; rota `/meus-dados` presente na saída.

- [ ] **Step 4: Commit**

```bash
git add app/meus-dados/page.tsx
git -c user.name="hash-cell" commit -m "feat(lgpd): página /meus-dados de exercício de direitos (mailto:)"
```

---

## Self-Review

**Spec coverage:**
- Frente 1 (Termos v1.0, 13 cláusulas) → Task 1 ✓
- Frente 2 (Privacidade 14 seções + IA) → Task 2 ✓
- Frente 3 (/meus-dados + mailto) → Tasks 3 (builder) + 4 (página) ✓
- Links `/meus-dados` nos footers das páginas tocadas → Tasks 1, 2, 4 ✓
- Manter ambos os canais → Global Constraints + Tasks 1, 2, 4 ✓
- Dados como placeholder + `.note` → Global Constraints + Tasks 1, 2 ✓
- Fora de escopo (backend, cookies granular, checkbox) → não há task, correto ✓

**Placeholder scan:** nenhum "TBD/TODO" pendente no plano; o `[⬜]` nos textos é intencional (dados jurídicos reais, disciplina do spec).

**Type consistency:** `buildMeusDadosMailto(input)` e `MeusDadosInput` iguais em Task 3 (def) e Task 4 (uso); array `DIREITOS` da Task 4 alinha com os direitos do `<select>`.
