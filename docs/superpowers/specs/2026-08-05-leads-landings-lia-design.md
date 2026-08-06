# Envio dos leads das landings para a LIA — design

Data: 2026-08-05
Status: aprovado para planejamento

## Problema

As 23 landings de empreendimento têm 26 formulários de lead. Todos fazem a mesma
coisa hoje: montam um texto de WhatsApp com os campos preenchidos, chamam
`window.open('https://wa.me/...')` e mostram a tela de sucesso.

**O dado do lead não é gravado nem enviado a lugar nenhum.** Ele existe apenas
como rascunho na aba do WhatsApp. Quem preenche o formulário e não aperta
"enviar" no WhatsApp desaparece por completo — nome e telefone se perdem, e a
LIA nunca fica sabendo que aquela pessoa existiu.

Objetivo: todo formulário preenchido vira um lead registrado na LIA, tenha o
visitante ido ao WhatsApp ou não.

## Contrato do webhook (fornecido pelo time da LIA)

```
POST <LIA_LEAD_WEBHOOK_URL>
x-webhook-secret: <LEAD_WEBHOOK_SECRET>
Content-Type: application/json

{
  "event": "lead.created",
  "data": {
    "id":       "id-do-lead-no-crm",
    "name":     "Maria Souza",
    "phone":    "+55 11 99999-8888",
    "email":    "maria@exemplo.com",
    "source":   "meta_ads",
    "interest": "Residencial Japi Vista",
    "message":  "Quero saber sobre as plantas de 2 quartos"
  }
}
```

Regras do contrato:

- Obrigatório: pelo menos `name` **ou** `phone`.
- `id` é a chave de deduplicação — enviar sempre.
- Telefone inválido não derruba o evento (fica registrado como inválido).
- O canal apenas **registra** o lead; ele não envia mensagem para ninguém.

A abordagem ativa da LIA é disparada por automação do CRM ao receber
`lead.created` — confirmado com o time. Do lado do portal, registrar é
suficiente.

## Decisão

**Rota proxy server-side + função `sendLead()` compartilhada.**

Espelha o padrão que o chat já usa em `app/api/chat/route.ts` + `lib/chat.ts`:
o segredo vive só no servidor, a UI conhece apenas um módulo de serviço.

### Alternativas descartadas

**POST direto do navegador para o webhook.** Diff menor, mas o
`x-webhook-secret` teria que virar `NEXT_PUBLIC_` e vazaria no bundle —
qualquer pessoa poderia injetar leads no CRM. Descartada por segurança.

**Gravar também numa tabela `leads` no Supabase.** Sobreviveria a webhook fora
do ar, mas o Supabase do portal é somente leitura por design (é o banco do
octo-dash2) e exigiria migration + RLS no território de outro time. O webhook é
o sistema de registro dos leads. Fica como evolução se indisponibilidade do
webhook virar problema medido.

## Arquitetura

### `app/api/lead/route.ts` (novo)

Espelha `app/api/chat/route.ts`. Motivos de existir são os mesmos já
documentados lá: o segredo não pode ir para o cliente, e se o webhook for http
o portal https bloquearia por mixed content.

- Lê `LIA_LEAD_WEBHOOK_URL` e `LEAD_WEBHOOK_SECRET` do ambiente.
- Valida a entrada (ver Segurança).
- Monta o envelope `{ event: 'lead.created', data: {...} }` e repassa com o
  header `x-webhook-secret`.
- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
- URL e segredo nunca aparecem em resposta nem em log.

### `lib/lead.ts` (novo)

Espelha `lib/chat.ts`. É o único módulo que as landings conhecem.

```ts
export type Lead = {
  name?: string;
  phone?: string;
  email?: string;
  source: string;    // "landing_allegrato"
  interest: string;  // "Allegrato Residencial"
  message?: string;
};

// usados pela rota (funções puras, testáveis sem subir servidor)
export function toE164(raw: string): string;
export function leadId(source: string, phone: string, name: string): string;

// usado pelas landings
export function sendLead(lead: Lead): void;  // dispara e não espera
```

As funções puras ficam aqui, e não dentro da rota, para o teste importá-las sem
arrastar `next/server` junto.

O cliente **não** envia o `id`, nem o telefone normalizado: manda os campos crus
e a rota deriva os dois a partir do que já validou. Chave de deduplicação não se
aceita de entrada não confiável, e normalizar num lugar só evita divergência
entre cliente e servidor.

### Os 26 call sites

Cada `onSubmit` que já existe ganha 2–3 linhas antes do `window.open`. Nenhum
formulário é reescrito, nenhuma validação existente é alterada.

O acesso aos campos varia bastante entre as landings — refs
(`components/Allegrato.tsx`), state controlado (`components/Odeon.tsx`,
`components/Avela.tsx`), `querySelector` no form
(`components/GranVilleSantoAngelo.tsx`) — e os nomes dos campos também
(`telefone`, `tel`, `fone`). Por isso `sendLead()` recebe um objeto já
normalizado e **cada call site passa o que tem**. Não há detecção automática de
campos: é explícito em cada ponto, que é o que mantém isso legível.

## Fluxo do submit

1. Validação existente da landing roda como sempre (nada muda).
2. Monta o `Lead` com os campos daquele formulário.
3. `sendLead(lead)` — **sem `await`**.
4. `window.open(WhatsApp)` continua síncrono, como hoje.

O passo 3 não pode bloquear o passo 4: um `await` antes do `window.open` tira a
chamada da pilha do gesto do usuário e o bloqueador de pop-up mata a aba do
WhatsApp. Registrar o lead nunca pode piorar a experiência de quem preencheu.

`sendLead` usa `fetch(..., { keepalive: true })` para o POST sobreviver caso a
pessoa feche a aba logo após enviar.

Falha no registro é invisível para o visitante (ele vai ao WhatsApp de
qualquer forma) e fica logada no servidor.

## Mapeamento do payload

| Campo | Origem |
|---|---|
| `id` | chave natural determinística: `"portal:" + source + ":" + phone` (ver abaixo) |
| `name` | campo nome do formulário |
| `phone` | dígitos do campo telefone, normalizados para E.164 (`+55` + DDD + número) |
| `email` | só nas landings que têm o campo; omitido nas demais |
| `source` | `"landing_" + slug da rota` — ex.: `landing_allegrato`, `landing_maita` |
| `interest` | nome do empreendimento — ex.: `"Allegrato Residencial"` |
| `message` | o que a pessoa escolheu/escreveu (tipologia, interesse) |

O slug de `source` é o mesmo da rota em `app/`, então é derivável e não precisa
de tabela de/para. Landings com dois formulários (`AutenJundiai`,
`ResortPrime`, `VisttaCastanho`) usam o mesmo `source`; distinguir qual dos dois
converteu não tem valor prático hoje.

### Sobre o `id`

O contrato pede um id estável para deduplicar. Não temos id de CRM — o lead
nasce aqui. Em vez de gerar UUID e guardar em ref (o que exigiria 2 linhas de
cerimônia em cada um dos 26 call sites e **não** deduplicaria após recarregar a
página), o id é a chave natural do lead:

```
portal:landing_allegrato:5511999998888
```

Determinístico, sem estado, e a mesma pessoa preenchendo o mesmo formulário duas
vezes gera o mesmo id — inclusive em sessões e dias diferentes. Sem telefone,
cai para o nome normalizado. Sem nenhum dos dois, a rota rejeita antes de
chamar o webhook (o contrato exige um dos dois).

Derivado na rota, a partir dos campos já validados — nunca recebido do cliente.

O id não é opaco de propósito: quem estiver depurando o CRM lê de onde o lead
veio. Não expõe nada novo — o telefone já vai no `phone` do mesmo payload.

## Segurança

A rota é um POST público que despeja no CRM. Sem defesa, bots enchem a base de
lixo — e lixo no CRM significa a LIA abordando gente que não existe.

- **Teto de tamanho do corpo:** 16 KB, verificado no `content-length` **antes**
  de fazer o parse do JSON. Os limites por campo rodam depois do parse, então
  sozinhos não protegem: um corpo de 200 MB é inteiramente carregado em memória
  antes que qualquer limite de campo seja aplicado.
- **Limites de tamanho por campo:** `name` ≤ 120, `phone` ≤ 32, `email` ≤ 200,
  `interest` ≤ 200, `message` ≤ 1000, `source` ≤ 64.
- **Obrigatoriedade:** exige `name` ou `phone`, conforme o contrato. Verificada
  sobre os valores **já normalizados**, não sobre a entrada crua — senão
  `"   "` passa e o campo chega vazio no CRM.
- **Sanitização:** remove caracteres de controle antes de repassar.
- **`source` validado por regex** (`^landing_[a-z0-9-]{1,48}$`): sem isso a
  atribuição no CRM é escolhida pelo cliente.
- **`id` derivado no servidor:** o cliente não manda o `id`, então um id opaco
  forjado é ignorado. Isso **não** impede reprodução: como `id = f(source,
  phone)` e os dois vêm do cliente, quem souber o telefone de um lead consegue
  recompor a chave dele. O regex de `source` reduz a superfície; a proteção
  real contra sobrescrita é do lado do CRM.
- **Rate limit por IP:** em memória, ~5 leads / 10 min, aplicado só depois da
  validação (um submit em branco não consome o teto de um lead de verdade).
  Marcado com comentário `ponytail:` declarando o teto — é por instância e
  zera no redeploy. Se o portal escalar para várias instâncias, vira rate
  limit compartilhado. O IP sai da **última** entrada do `x-forwarded-for` (a
  que o proxy confiável acrescentou); a primeira é fornecida pelo cliente e
  forjá-la anula o limite. Sem XFF utilizável a chave cai em `'unknown'` —
  nesse caso o limite é **pulado**, não aplicado: sem IP de cliente ele
  juntaria as 23 landings num balde só, e num formulário público perder leads
  reais em massa é pior do que deixar passar algum spam.
- Erros nunca expõem URL, segredo ou resposta crua do webhook.

**PII em log (item conhecido de LGPD):** o log de falha grava o `id`, que
embute o telefone, no stdout do container. É a única trilha de um lead que o
CRM não recebeu — sem ele, sabe-se que um lead se perdeu sem saber para quem
ligar. Fica, mas é um destino de PII novo (retenção indefinida no Easypanel)
que a política de privacidade atual não descreve.

Honeypot anti-bot foi considerado e deixado de fora: exigiria editar os 26
formulários para ganhar pouco além do rate limit. Entra se spam aparecer.

## Confiabilidade

Uma retentativa no servidor em falha de rede, 5xx, 408 (timeout) ou 429 (rate
limit) do webhook, após ~500 ms. Sem ela, um soluço do webhook perde o lead em
silêncio — exatamente o problema que este trabalho existe para resolver. Não
retenta em outro 4xx: erro de payload não melhora repetindo.

Timeout de 5,75 s por tentativa (`TIMEOUT_MS`). Com as duas tentativas mais o
delay entre elas, o pior caso fim-a-fim é ~12 s (2 × 5,75 s + 0,5 s) — bem
menor que os 60 s da rota de chat porque ninguém está esperando a resposta: o
visitante já foi para o WhatsApp e o registro é assíncrono. Segurar conexão
além disso só ocupa a instância.

## LGPD

Nenhuma mudança de semântica de consentimento. Os formulários já avisam que o
dado é usado para contato ("Ao enviar, você concorda em ser contatado sobre o
[empreendimento]") e o Maitá já tem checkbox de consentimento explícito. Este
trabalho apenas faz o contato prometido acontecer de fato, em vez de depender do
visitante reenviar no WhatsApp. Os campos enviados são os mesmos que o
formulário já coletava.

## Testes

`lib/lead.test.ts`, no padrão de `lib/meus-dados-mailto.test.ts`
(`node:assert/strict`, roda com `node lib/lead.test.ts`):

- `toE164`: celular com DDD, fixo, número já com `+55`, entrada com máscara,
  entrada curta/inválida.
- `leadId`: mesmo lead gera o mesmo id em chamadas separadas; landings
  diferentes geram ids diferentes; sem telefone cai para o nome.
- Montagem do payload: envelope `lead.created` correto, campos vazios omitidos
  em vez de irem como string vazia, limites de tamanho respeitados.

## Configuração

Duas variáveis novas, server-side apenas (sem `NEXT_PUBLIC_`, senão o segredo
vai para o bundle):

```
LIA_LEAD_WEBHOOK_URL=
LEAD_WEBHOOK_SECRET=
```

Entram em `.env.example` sem valor (o repositório é público) e nas envs do
deploy no Easypanel. Sem elas configuradas, a rota loga o erro e responde
genérico — não quebra o formulário, que continua abrindo o WhatsApp.

## Fora de escopo

- Formulários do portal fora das landings: `LotusAnunciar`, `LotusCorretores`,
  `LotusCondominio`, `LotusImovel`, FAQ, newsletter, busca, recrutamento.
- Unificar os 26 formulários num componente comum.
- Persistência própria de leads (ver alternativa descartada).
- O disparo ativo da LIA — é automação do CRM, do lado deles.

## Observação registrada

`components/BestViewResidence.tsx:268-271` abre um `waLinkForm` **estático**: o
formulário coleta nome, e-mail e telefone em state (`fNome`, `fEmail`, `fFone`)
e descarta tudo, nem no texto do WhatsApp os dados entram. É um bug anterior a
este trabalho. O registro do lead vai capturar os campos corretamente de
qualquer forma; corrigir também o texto do WhatsApp é uma linha, mas é mudança
de comportamento não pedida — fica para decisão à parte.
