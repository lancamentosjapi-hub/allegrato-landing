# LGPD no Portal Lotus — Termos v1.0, Privacidade 14 seções e /meus-dados

**Data:** 2026-07-27
**Escopo desta rodada:** conteúdo/front-end apenas. Sem backend.

## Contexto

O portal já tem `/lotus-termos`, `/lotus-privacidade` e `/lotus-cookies` no ar,
com versões curtas/genéricas, e um banner de cookies (aceitar / recusar
não-essenciais). Os docs LGPD (8, 8a, 8b) descrevem um pacote muito maior — o
backlog de "Gate Zero LGPD" com ~40-60 dias-dev (consent_log, opt-out, jobs,
RBAC). **Esse backlog está fora de escopo.**

Esta rodada entrega três frentes de **conteúdo**:

1. Termos de Uso v1.0 completo (13 cláusulas) — doc `8. LGPD + Protocolo Jurídico Captação` §2
2. Política de Privacidade com 14 seções (incl. transparência sobre IA) — doc `8a. LGPD - Manual Webdesigner` §4
3. Página nova `/meus-dados` (exercício de direitos LGPD) — doc `8a` §7

## Padrão reusado (não criar abstração nova)

Cada página LGPD atual é um Server Component com esta estrutura, que será
preservada:

- `css` inline (string com seletores globais `:root`, `header`, `h1`, `h2`, `p`, `footer`…)
- `<header>` sticky com logo Lotus + "← Voltar ao site"
- `<main>` com `<h1>`, `.upd` (data), `.note` (callout de revisão jurídica), corpo
- `<footer>` com `footerLegalLine()` de `lib/site.ts` + links Privacidade/Termos/Cookies
- banner de cookies inline + `cookieScript` (em termos e privacidade)

Dados institucionais vêm de `lib/site.ts` (`SITE` / `footerLegalLine`), que já
omite CRECI/CNPJ enquanto forem placeholders. **Não inventar razão social,
CNPJ, CRECI-PJ nem endereço reais** — manter a `.note` de "recomenda-se revisão
jurídica antes do go-live, incluindo inserção de razão social/CNPJ/CRECI/endereço".

**Canais:** manter ambos — WhatsApp `+55 11 92614-3393` para dúvidas gerais e
e-mail `atendimento@lotusbrokers.com.br` (+ `/meus-dados`) para exercício formal
de direitos. (Usuário pode trocar depois.)

## Frente 1 — `/lotus-termos`: reescrever para v1.0 (13 cláusulas)

Arquivo: `app/lotus-termos/page.tsx`. Trocar **só o conteúdo do `<main>`**
(hoje 6 tópicos genéricos) pelo texto oficial do doc 8 §2, mantendo header/CSS/
footer/banner intactos.

Cláusulas (títulos `<h2>`):

1. Aceitação dos Termos
2. Quem somos (dados da empresa como `[⬜]` — mesma disciplina do `.note`)
3. Cadastro e responsabilidades do usuário (incl. menores §3.5, suspensão §3.6)
4. Serviços oferecidos
5. Tratamento de dados pessoais (link para `/lotus-privacidade` e `/lotus-cookies`)
6. Comunicações (transacionais vs. marketing, opt-out)
7. Conteúdo gerado ou enviado pelo usuário (incl. **7.3.1** janela 6 meses pós-suspensão/venda, **7.3.2** cessação)
8. Propriedade intelectual
9. Compartilhamento de dados com corretores Lotus
10. Limitações de responsabilidade
11. Modificações dos Termos (aceite tácito vs. ativo)
12. Lei aplicável e foro (Comarca de Jundiaí/SP; severability)
13. Canal de contato (`atendimento@lotusbrokers.com.br` + WhatsApp)

Ajustes de metadata: atualizar `.upd` para a data de hoje e manter `description`.
Adicionar link `/meus-dados` no footer.

## Frente 2 — `/lotus-privacidade`: expandir de 5 para 14 seções

Arquivo: `app/lotus-privacidade/page.tsx`. Trocar só o conteúdo do `<main>` pelo
rascunho copy do doc 8a §4. Seções `<h2>`:

1. Quem somos
2. O que este documento faz
3. Quais dados coletamos
4. Por que coletamos (finalidades)
5. Base legal para cada tratamento
6. Com quem compartilhamos
7. Por quanto tempo guardamos
8. Onde os dados ficam armazenados
9. Segurança
10. Seus direitos LGPD → **link para `/meus-dados`**
11. **Uso de inteligência artificial** (LIA no atendimento, VISÃO no scoring; direito a revisão humana — art. 20 LGPD) — destacado com `.note`
12. Menores de 18 anos
13. Cookies → link para `/lotus-cookies`
14. Contato do DPO (`atendimento@lotusbrokers.com.br`) + WhatsApp

Fechar com histórico de versões (texto simples: "v1.0 — 2026-07-27 — versão
inicial"; sem componente accordion — YAGNI). Atualizar `.upd` e footer com
`/meus-dados`.

## Frente 3 — `/meus-dados`: página nova

Arquivo novo: `app/meus-dados/page.tsx`. **Client Component** (`'use client'`)
porque o formulário precisa de estado. Reusar o mesmo `css`/header/footer das
outras páginas LGPD (copiar o padrão; sem extrair componente compartilhado nesta
rodada — as páginas já duplicam o CSS entre si).

Conteúdo (doc 8a §7):

- Título "Seus dados são seus" + parágrafo explicativo (LGPD art. 18, SLA ≤15 dias úteis)
- Lista dos 10 direitos (art. 18) — lista simples, sem hover/expand
- "Como funciona" — 4 passos (envia → confirma identidade → executa → responde)
- **Formulário (mailto:)**:
  - Campos: Nome*, E-mail*, Telefone (opcional), Direito (dropdown com os 10), Descrição (textarea)
  - Botão "Enviar pedido" monta e abre:
    `mailto:atendimento@lotusbrokers.com.br?subject=<encodeURIComponent>&body=<encodeURIComponent>`
    com nome/e-mail/telefone/direito/descrição no corpo.
  - Validação client-side mínima: Nome e E-mail obrigatórios; botão desabilitado até preencher.
- FAQ curta (4 perguntas do doc 8a §7 Bloco 5: gratuito, identidade, sem conta, por terceiro)

`ponytail:` mailto — sem protocolo/persistência/consent_log; trocar por
`/api/meus-dados` quando o backend do doc 8b existir.

Metadata: `title: 'Seus Dados LGPD | Lotus Brokers'` + description.

## Verificação

- `npm run build` (ou `next build`) compila sem erro nas 3 páginas.
- Self-check inline no montador do `mailto:`: um `mailto:` bem-formado tem
  `subject=` e `body=` percent-encoded; verificar manualmente que caracteres
  acentuados/quebra de linha ficam encodados (usar `encodeURIComponent`).

## Explicitamente fora de escopo

- Backend: `consent_log`, opt-out global, jobs de retenção/24m, RBAC, dashboard COEX (doc 8b — todas as 12 features)
- Banner de cookies granular por categoria (mantém o atual aceitar/recusar)
- Checkbox de consent nos formulários do site
- Varredura de todos os footers do site — só as páginas LGPD tocadas aqui ganham link `/meus-dados`
- Dados institucionais reais (razão social, CNPJ, CRECI-PJ, endereço) — dependem do go-live jurídico
