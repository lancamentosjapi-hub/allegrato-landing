# Relatório de Investigação UI/UX — Landings de Condomínios

**Investigação read-only (nenhuma correção aplicada).** Metodologia: leitura completa do
código-fonte de cada componente + CSS dedicado, e verificação ao vivo com Playwright
(Chromium) nos viewports Desktop (1440), Tablet e Mobile (390), com medição de geometria,
z-index, transform em scroll e contraste (razão WCAG calculada no DOM real).

Ambiente testado: `http://localhost:3000` (build de desenvolvimento Next.js).

---

## 0. Sumário executivo — padrões de causa raiz comuns

A maioria dos problemas **NÃO é isolada de uma landing**: são consequências do mesmo
padrão de porte 1:1 de HTML estático → React. Corrigir na causa raiz resolve várias
landings de uma vez.

| Causa raiz compartilhada | Landings afetadas | Descrição |
|---|---|---|
| **P1 — Header `position:fixed` sem `scroll-padding-top`/`scroll-margin-top`** | Vistta, Jardins, Terrace, Auten, Maxx | Header fixo (~82–91px) removido do fluxo; âncoras do menu levam o topo da seção para baixo do header. Nenhuma define `scroll-padding-top` corretamente (Terrace/Auten = `auto`; Jardins = 84px≈ok; Maxx = 92px). |
| **P2 — Parallax JS move a imagem do hero em `translate3d` no scroll** | Vistta (0.12), Jardins (0.16), Terrace (0.32) | A imagem do hero translada em ritmo diferente da página → sensação de "imagem sobe junto com o header". Confirmado ao vivo. |
| **P3 — Header transparente no topo → "aparece do nada" no scroll** | Vistta, Jardins, Terrace, Maxx | Header 100% transparente sobre o hero escuro; ao rolar vira barra clara translúcida. Lê-se como pop-in/sobreposição estranha. |
| **P4 — Texto claro sobre imagem clara SEM scrim/text-shadow suficiente** | Auten, Maxx, (Gran Ville — mitigado) | Legendas e subtextos bege/branco sobre renders internos claros → contraste ~1.1–1.6:1. É o "fonte branca sobre fundo branco" relatado. |
| **P5 — Reveal on scroll: conteúdo nasce `opacity:0`, depende de JS/IO** | TODAS | Se o JS/hidratação atrasa, seções aparecem como faixas vazias até o fallback (1000–1200ms). Risco de "container vazio gigante". |
| **P6 — `data-full`/lightbox apontam para caminhos relativos não portados** | Vistta (`assets/img/*`), Terrace (`web/renders/*`) | Ao abrir o lightbox, o Next resolve caminho relativo à rota → **404, imagem quebrada no modal**. Bug funcional. |

---

## 1. Altos da Avenida — `components/AltosDaAvenida.tsx`

**Veredito:** A landing NÃO está "quebrada" em estrutura — o layout geral é coerente.
O que causa a sensação de "estranho" é **um overlap concreto no hero**.

### 1.1 [ALTO] Faixa de "facts" do hero sobrepõe os botões CTA
- **Causa raiz:** A faixa de indicadores (`58–105m²`, `2 e 3 dorms`…) é
  `position:absolute; bottom:0` dentro do hero (altura medida **93px**), mas o wrapper de
  conteúdo do hero tem `padding-bottom:90px` — **menor que a altura da faixa**. Com o hero
  em `height:90vh`, os botões são espremidos e colidem com a faixa.
- **Arquivo:** `components/AltosDaAvenida.tsx` — hero `#topo` (linha ~513), wrapper de
  conteúdo `padding:120px … 90px` (linha ~520), faixa de facts (linha ~544).
- **Evidência medida:**
  - Desktop 1440: botão "Falar no WhatsApp" bottom=741 vs topo da faixa=718 → **overlap de 23px**.
  - Mobile 390: overlap de **17px**; o 2º botão ("Conhecer o projeto") fica **totalmente escondido** atrás da faixa.
- **Screenshot:** `.playwright-mcp/qa-shots/ada-desktop-top.jpeg`, `ada-mobile-hero.jpeg`.
- **Severidade:** ALTO — o CTA principal (WhatsApp) é o objetivo de conversão e está cortado.
- **Impacto UX:** botões cortados/escondidos exatamente na dobra; parece "quebrado".

### 1.2 [BAIXO] Erro de console — path SVG inválido
- 2 erros no console: `<path> attribute d: Expected number…` (ícone WhatsApp inline) e
  `favicon.ico 404`. Não afetam layout, mas poluem o console.

### 1.3 [INFO] Header fixo sem compensação de âncora (mesmo P1)
- Header `position:fixed; z-index:120`, altura 90px. Hero compensa via padding interno,
  mas âncoras internas herdam o padrão P1.

---

## 2. Vistta Castanho — `components/VisttaCastanho.tsx` + `app/vistta-castanho/vistta-castanho.css`

**Bug relatado (header sobrepõe imagem inicial; imagem sobe junto no scroll): CONFIRMADO.**

### 2.1 [CRÍTICO] Header fixo + hero sem `padding-top` de compensação
- **Causa raiz:** `.header{position:fixed;top:0;z-index:80}` (`vistta-castanho.css:482`),
  altura medida **85px**. O hero (`.hero`, css:562) começa em `top:0` e é
  `display:flex; align-items:center`; a única folga é `padding-top:90px` na coluna de
  **texto** (`.hero-copy`, css:575) — **não** na seção nem na imagem. A imagem
  (`.hero-media`) é `inset:-8% 0 0 0` e `img{height:116%}` (css:563-564): sangra 8% para
  **cima**, ou seja, foi dimensionada para viver **atrás do header**.
- **Evidência medida:** header top=0 h=85; hero top=0; hero img top=**-70px** (encoberta pelo header); `heroPaddingTop: 0px`.
- **Severidade:** CRÍTICO.

### 2.2 [ALTO] Parallax move a imagem do hero no scroll (a "sensação estranha")
- **Causa raiz:** listener de scroll aplica `translate3d(0, off, 0)` à `.hero-media`
  (`VisttaCastanho.tsx:127-134`, alvo `data-parallax="0.12"` em `:366`).
- **Evidência AO VIVO:** em `scrollY=200`, transform da imagem = `matrix(1,0,0,1,0,-29.3)` →
  a imagem desloca **-29px** enquanto a página rolou 200px. Ritmo diferente = a imagem
  "sobe junto com o header".
- **Screenshots:** `vistta-desktop-top.jpeg` (scroll 0, ok) vs `vistta-desktop-scrolled200.jpeg` (imagem deslocada).
- **Severidade:** ALTO (é a causa direta do sintoma relatado).

### 2.3 [ALTO] Lightbox 404 (P6)
- Thumbs usam `/vistta-castanho/aNNN.jpg`, mas `data-full` abre `assets/img/piscina.jpg`
  etc. (`VisttaCastanho.tsx:735,752,767,779,794,811`) → resolve para
  `/vistta-castanho/assets/img/…` = **404**, imagem quebrada no modal.

### 2.4 [MÉDIO] `.hero h1` sem `color` explícito nem `text-shadow`
- `.hero h1` (css:576) herda cor de corpo; só `.accent` tem `--gold-2`. A foto é um pôr do
  sol (áreas claras) → risco de baixo contraste do título. O `.hero-sub` tem text-shadow, o
  `h1` não.

---

## 3. Auten Jundiaí — `components/AutenJundiai.tsx` + `app/auten-jundiai/auten-jundiai.css`

**Bugs relatados (header sobre hero; fonte branca sobre branco; baixo contraste): CONFIRMADOS
(com nuance).** Não há literal `#fff` sobre `#fff` estático — o problema é **texto
claro/bege sobre imagem clara sem scrim** e **nav branco sobre header transparente**.

### 3.1 [ALTO] Legendas/subtextos claros sobre renders internos claros (P4)
- **Causa raiz:** legendas dos cards de galeria e subtextos são bege claro
  (`rgb(230,214,194)`, `rgb(240,227,211)`) posicionadas sobre imagens de interiores muito
  claros, sem scrim/gradiente por baixo do texto e sem `text-shadow`.
- **Evidência AO VIVO (contraste calculado):**
  - "Ambientes integrados com iluminação natural" → **1.06:1**.
  - "Living ampliado" (`rgb(251,248,243)` sobre região clara) → **1.27:1**.
  - subtítulo hero "Um projeto que nasceu para ser…" → **1.19:1**.
- **Screenshot:** `.playwright-mcp/qa-shots/auten-lowcontrast-beige.jpeg` — legendas quase invisíveis sobre os renders.
- **Severidade:** ALTO — falha WCAG 1.4.3 (texto <4.5:1). É o "branca sobre branco" percebido.

### 3.2 [ALTO] Nav-links brancos sobre header transparente (`--paper` #fbf8f3)
- **Causa raiz:** `.nav-links a{color:var(--paper);opacity:.9}` (css:466); header sem
  background até `.scrolled` (css:449). O scrim do hero é forte à esquerda mas cai para
  `.18` de opacidade à direita (css:511) — exatamente onde ficam os nav-links. Sem text-shadow.
- **Severidade:** ALTO — contraste dependente do brilho da imagem; provável falha WCAG.

### 3.3 [ALTO] `.btn-ghost` do header herda `--ink` (escuro) — inconsistente com nav claro
- **Causa raiz:** `.btn-ghost{border:currentColor;color:inherit}` (css:481). O
  `.site-header` não define `color`, então o botão herda `--ink` (#2a2018, escuro) →
  texto escuro sobre hero escuro; e os nav-links ao lado são claros. Inconsistência visível.

### 3.4 [MÉDIO] Textos `--muted` (#8a7866) 11–12px sobre creme (~3.4:1)
- Labels, legal, captions (css:556,564,709,732,739). Texto pequeno exige 4.5:1 → falha AA limítrofe.

### 3.5 [INFO] Header fixo (86px) sem `scroll-padding-top` (P1) — `scrollPaddingTop: auto` confirmado ao vivo.

---

## 4. Jardins do Horto — `components/JardinsDoHorto.tsx` + `app/jardins-do-horto/jardins-do-horto.css`

**Bug relatado (header sobrepõe de forma estranha): CONFIRMADO** — combinação de header
transparente que "materializa" no scroll + parallax.

### 4.1 [ALTO] Header transparente → barra clara translúcida no scroll (P3)
- **Causa raiz:** `initScroll` (`JardinsDoHorto.tsx:229-247`) faz
  `header.style.background = s ? 'rgba(244,238,228,.94)' : 'transparent'` no threshold 40px.
- **Evidência AO VIVO:** scroll 0 → headerBg `rgba(0,0,0,0)`; scroll 250 → `rgba(244,238,228,0.54)`. Header materializa sobre pixels do hero ainda visíveis = pop-in.
- **Severidade:** ALTO.

### 4.2 [MÉDIO] Parallax do hero (P2) — confirmado ao vivo
- Imagem base `scale(1.12)`; parallax `translate3d(0, y*0.16, 0) scale(1.12)` (`:248`).
- **Evidência:** scroll 250 → transform `matrix(1.12,0,0,1.12,0,37.36)` (deslocou 37px).

### 4.3 [ALTO] Header fixo (82px) — offset de âncora depende só de `scroll-padding-top:84px`
- É a **única** compensação (P1). 84px ≈ header 82px (ok por 2px), mas frágil se o header crescer.

### 4.4 [MÉDIO] Reveal `opacity:0` (P5) — dezenas de nós; fallback 1200ms.

---

## 5. Terrace Serra do Japi — `components/TerraceSerraDoJapi.tsx` + `app/.../terrace-serra-do-japi.css`

**Bug relatado (mesmo comportamento header/hero/scroll): CONFIRMADO.**

### 5.1 [CRÍTICO] Header fixo (91px) SEM `scroll-padding-top` (P1)
- **Causa raiz:** `.nav{position:fixed;z-index:100}` (css:507); `html{scroll-behavior:smooth}`
  **sem** `scroll-padding-top` (css:415). Nenhuma seção tem `scroll-margin-top`.
- **Evidência AO VIVO:** `scrollPaddingTop: "auto"` confirmado. Ao clicar `#localizacao`, o
  **topo/padding da seção fica sob o header** (section top=6px, header bottom=67px). Seções
  com padding-top grande salvam o título; as sem padding têm o topo cortado.
- **Severidade:** CRÍTICO (afeta toda navegação por menu).

### 5.2 [MÉDIO] Header muda o próprio padding no scroll (26px→14px) → snap/flicker
- `nav.classList.toggle('scrolled', y>60)` (`:32`); `.nav.scrolled{padding:14px}` (css:513).
  Como o nav é fixo, não gera CLS de corpo, mas o re-tint + resize é percebido como instabilidade.

### 5.3 [MÉDIO] Parallax hero (P2) — `translate3d(0, y*0.32, 0) scale(1.04)`; imagem `height:118%`.

### 5.4 [ALTO] Lightbox/OG 404 (P6) — `data-full` e OG usam `web/renders/*.jpg` (relativo, sem `/`) → 404 no modal.

---

## 6. Maxx Santa Angela — `components/MaxxSantaAngela.tsx` + `app/.../maxx-santa-angela.css`

**Bug relatado (bloco marrom gigante nos indicadores; contraste ruim): CONFIRMADO.**

### 6.1 [ALTO] O "bloco marrom gigante" = seção CONFIANÇA super-alta e vazia
- **Causa raiz REAL (verificada ao vivo — NÃO é contador invisível):** a seção
  "A CONSTRUTORA MAIS CONFIÁVEL DA REGIÃO" é uma faixa full-bleed marrom `#33291f`
  (`MaxxSantaAngela.tsx:687`) com `padding:120px 0` (top **e** bottom) **medido**. O conteúdo
  (kicker + h2 + 3 números) ocupa ~160px de texto; a `grid` de stats tem `margin-top:64px`
  (`:694`). Resultado medido: seção de **709px de altura** com o grid de números só em
  `topInSection=480px`. **~55-60% da faixa é marrom vazio.**
- **Evidência AO VIVO:** `sectionH=709`, `paddingTop=120px`, `paddingBottom=120px`; heading
  em top=120 mas com "buraco" até os stats em top=480; todos `opacity:1` (os números
  aparecem — a teoria de "contador escondido" é secundária/edge-case).
- **Screenshots:** `.playwright-mcp/qa-shots/maxx-brownblock.jpeg`, `maxx-brownblock-full.jpeg` — enorme vazio marrom acima de 3 números.
- **Severidade:** ALTO — é literalmente o bloco marrom sem informação útil relatado.
- **Agravantes:** seção LAZER adjacente também é marrom escuro `#2B2521` (`:505`) → leem-se
  como uma massa marrom única; em ≤920px o grid vira 1 coluna
  (`maxx-santa-angela.css:588`), esticando ainda mais a faixa.

### 6.2 [ALTO] Botões gold `#B0894E` com texto branco (~2.9:1)
- `MaxxSantaAngela.tsx:449, 750, 814`. Branco sobre gold médio falha WCAG AA para texto normal.

### 6.3 [MÉDIO] Textos warm-gray `#8a7d6f`/`#9a8a72` 11–12px sobre creme (~3:1)
- `:400,463,487,650,671,751`; footer `#7d7163` sobre `#211c17` (~3.2:1) `:783`.

### 6.4 [INFO] Header fixo, hero `align-items:flex-end` sem padding-top (P1); `scroll-padding-top:92px` presente. `void gold` variável morta (`:236`).

---

## 7. Gran Ville — `components/GranVilleSantoAngelo.tsx` + `app/.../gran-ville-santo-angelo.css`

**Bugs relatados (hero ilegível, botões escondidos, contraste péssimo): NÃO REPRODUZEM
no build local.** ⚠️ Este é o achado mais importante desta landing.

### 7.1 [CRÍTICO — de diagnóstico] O hero renderizado está CORRETO e legível
- **Verificação AO VIVO:** CSS dedicado **carrega** (overlay duplo `rgba(16,15,11,.92)`
  aplicado, `text-shadow` no título presente, título `rgb(251,248,242)` cor cream,
  fonte Cormorant, `opacity:1`). Botão primário terracota **sólido** e visível; botão glass
  visível. Stats bar legível. Testado em Desktop e Mobile.
- **Screenshots:** `.playwright-mcp/qa-shots/granville-desktop-hero.jpeg`, `granville-mobile-hero.jpeg` — hero excelente, alto contraste.
- **Conclusão de causa raiz:** o sintoma relatado (texto claro ilegível sobre imagem, sem
  overlay, botões fantasma) corresponde a um estado de **CSS não carregado** (texto cru
  branco sobre a imagem crua). Isso indica que **o relato provavelmente veio de outro
  ambiente** — produção/deploy com `gran-ville-santo-angelo.css` não aplicado, ou versão
  antiga. **Ação sugerida: verificar a URL/ambiente exato onde o bug foi observado.**

### 7.2 [MÉDIO] Botão glass secundário — borda 0.4-alpha de baixo contraste (SC 1.4.11)
- `.btn.glass{--bg:rgba(251,248,242,.1);border:1px solid rgba(251,248,242,.4)}` (css:645).
  A borda do botão pode cair abaixo de 3:1 sobre regiões médias da imagem. O rótulo (texto)
  passa; só o contorno é fraco. É o único elemento que parcialmente casa com "botão escondido".

### 7.3 [ALTO] Reveal por `animation:forwards` com fallback reduced-motion incompleto
- Hero copy nasce `opacity:0` e só aparece via `animation` (css:624,632,639,643,660,683).
  O reset `@media (prefers-reduced-motion)` cobre kicker/title/lede/cta mas **NÃO** cobre
  `.hero__bar` (css:660) nem `.scrollcue` (css:683) → para usuários com reduced-motion, a
  **barra de stats e o scroll cue ficam invisíveis** (`opacity:0` permanente). Falha WCAG 1.4.1.

---

## 8. Priorização sugerida (para o plano de correção)

| # | Item | Landings | Sev. | Tipo |
|---|---|---|---|---|
| 1 | Investigar ambiente do bug do Gran Ville (CSS não carrega?) | Gran Ville | **Crítico** | Diagnóstico/infra |
| 2 | `scroll-padding-top` ausente/errado (P1) | Terrace, Auten (+Vistta/Jardins/Maxx) | **Crítico/Alto** | CSS 1 linha por landing |
| 3 | Header fixo sem padding-top no hero → imagem encoberta | Vistta | **Crítico** | CSS |
| 4 | Faixa de facts sobrepõe CTAs do hero | Altos | **Alto** | CSS (padding-bottom) |
| 5 | Bloco marrom gigante e vazio | Maxx | **Alto** | CSS (padding/altura da seção) |
| 6 | Texto claro sobre imagem clara sem scrim/shadow (P4) | Auten, Maxx | **Alto** | CSS (scrim/text-shadow) |
| 7 | Lightbox/OG 404 por caminho relativo (P6) | Vistta, Terrace | **Alto** | Dados (paths) |
| 8 | Parallax "imagem sobe junto" (P2) | Vistta, Jardins, Terrace | **Médio** | JS (rever/opcionalizar) |
| 9 | Header transparente pop-in (P3) | Vistta, Jardins, Terrace, Maxx | **Médio** | UX (decisão de design) |
| 10 | Botões gold/glass baixo contraste | Maxx, Gran Ville | **Médio** | CSS |
| 11 | Reveal `opacity:0` sem fallback robusto (P5) | Todas (Gran Ville: reduced-motion) | **Médio** | JS/CSS |

**Nada foi corrigido.** Aguardando definição do plano de correção.

*Screenshots de evidência em `.playwright-mcp/qa-shots/` (gitignored).*
