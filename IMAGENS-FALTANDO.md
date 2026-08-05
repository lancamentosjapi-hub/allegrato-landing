# Pendências de conteúdo (dados reais a fornecer)

> Itens que a auditoria corrigiu no código **até onde dava**, mas que dependem
> de dados reais que só a Lotus tem. Nenhum número/legal foi inventado.

## Dados legais da empresa — `lib/site.ts`
Os rodapés agora leem de um único lugar (`footerLegalLine()`), e **omitem**
CRECI/CNPJ enquanto forem placeholders (`00000…`). Para exibi-los, edite
`lib/site.ts` e troque `creciPj` e `cnpj` pelos números reais — aparecem em
todas as ~15 páginas automaticamente.

## Guias de bairro (conteúdo placeholder) — `lib/bairros.ts`
`/lotus-bairro` agora é um índice; cada bairro tem sua página `/lotus-bairro/[slug]`.
**Eloy Chaves** está 100% preenchido (conteúdo real). Os outros 6 (Anhangabaú, Malota,
Medeiros, Centro-Itupeva, Reserva da Serra, Horto Florestal) têm textos `TODO` — editar
em `lib/bairros.ts` (tagline, tldr, guide, faq, dados, especialista). Enquanto `publicado:
false`, essas páginas ficam `noindex`. Os imóveis de cada bairro vêm do banco filtrados
por bairro — hoje só "Jardim Colonial" (CA054) tem imóvel; os demais mostram empty-state.

## Corretores (dados fictícios) — `components/LotusCorretores.tsx` e `LotusSobre.tsx`
Nomes, CRECIs (`CRECI 000001-F`…) e fotos são **placeholders de pessoas fictícias**.
Substituir por corretores reais (nome, CRECI, foto). Enquanto não houver foto, o
avatar mostra as iniciais do nome (fallback já implementado — não fica mais vazio).

---

# Imagens faltando (404) nas landings

Os componentes referenciam estes arquivos, mas eles **não existem em `public/`** → 404 em produção,
fazendo galerias inteiras renderizarem como blocos vazios.

**Ação:** subir os arquivos reais nos caminhos abaixo (mantendo nomes/extensões exatos).
Auditoria: Playwright, 2026-07-22.

> **Atualização 2026-07-24 — extração dos HTMLs em `htmls/`.**
> Os HTMLs salvos (Wix/standalone) embutem as imagens num blob JSON por UUID.
> Extraí e renomeei via `alt`/ordem de galeria (bate com os componentes).
> **Resultado: 9 de 11 landings 100% completas.**
>
> Resolvidas 100% pelos HTMLs:
> - `/vigore` (21/21) — hero `a44` = render aéreo da fachada.
> - `/jardins-do-horto` (19/19) — ver obs. `a012` abaixo.
> - `/auten-jundiai` (4/4 plantas) — 128 e 131 são espelhadas; usei ordem do DOM.
> - `/gran-ville-santo-angelo` (17/17).
> - `/manawa` (4/4 plantas).
> - `/portal-dos-lagos` (8/8) — 3 vistas do salão + 2 ângulos da portaria.
> - `/resort-prime` (21/21).
> - `/terrace-serra-do-japi` (37/37).
> - `/vistta-castanho` (6/6).
>
> Obs. `/jardins-do-horto` `a012.jpg`: legenda "Hall de Entrada" no componente,
> mas a imagem é a sala de beleza ("GLOW"). Carrega — só a legenda diverge
> (decisão de conteúdo da Lotus).
>
> **Atualização 2026-07-24 (2) — extração dos books PDF em `pdf/`.**
> Os PDFs (`Book - Altos da Avenida.pdf`, `Book do Corretor - Brisas Do Japi`)
> trazem os renders em alta resolução. Extraí com PyMuPDF e identifiquei cada
> imagem VISUALMENTE (os renders do PDF não têm legenda). Resultado:
> - `/brisas-do-japi` → **12/12 completo** (fachada, piscina, beach tennis,
>   quadra, academia, coworking, jogos, festas, quiosque, hall/portaria,
>   garagem, quarto). Obs.: `HALLDEENTRADA` usa a portaria com placa (não há
>   render de lobby interno no book).
> - `/altos-da-avenida` → **19/20**. As 4 plantas (58/68/96/105) + 11 amenidades
>   vieram do book. `a003.png` (bg do CTA, opacity .22) reusa a piscina hero
>   `a005.png`. **Falta só `assets/cinema.jpg`** — o book NÃO tem render de sala
>   de cinema/home-theater. Único item pendente do projeto inteiro.
>
> **RESULTADO FINAL: 10 de 11 landings 100% completas. Pendência única:**
> `/altos-da-avenida/assets/cinema.jpg` (não existe no material disponível —
> HTML nem PDF). Precisa de um render de cinema da Santa Angela, ou remover o
> tile "Cinema" da galeria em `components/AltosDaAvenida.tsx` (linha ~161).

---

## `/altos-da-avenida` — faltam 17 (o HTML só tinha hero; já extraídos: `a001.png`, `a002.png`, `a004.png`)

```
public/altos-da-avenida/a001.png            # logo do empreendimento (hero, rodapé)
public/altos-da-avenida/a002.png            # vista das torres
public/altos-da-avenida/a003.png            # background seção CTA
public/altos-da-avenida/a004.png            # família / sonho da casa própria
public/altos-da-avenida/assets/planta_58.jpg
public/altos-da-avenida/assets/planta_68.jpg
public/altos-da-avenida/assets/planta_96.jpg
public/altos-da-avenida/assets/planta_105.jpg
public/altos-da-avenida/assets/piscina.jpg
public/altos-da-avenida/assets/quadra.jpg
public/altos-da-avenida/assets/playground.jpg
public/altos-da-avenida/assets/salao_festas.jpg
public/altos-da-avenida/assets/gourmet.jpg
public/altos-da-avenida/assets/academia.jpg
public/altos-da-avenida/assets/salao_jogos.jpg
public/altos-da-avenida/assets/gamer.jpg
public/altos-da-avenida/assets/coworking.jpg
public/altos-da-avenida/assets/lounge.jpg
public/altos-da-avenida/assets/brinquedoteca.jpg
public/altos-da-avenida/assets/cinema.jpg
```

## `/jardins-do-horto` — 17 arquivos (presentes: `a003.jpg`, `a004.jpg`)

```
public/jardins-do-horto/a000.png
public/jardins-do-horto/a001.png
public/jardins-do-horto/a002.png
public/jardins-do-horto/a005.jpg
public/jardins-do-horto/a006.png
public/jardins-do-horto/a007.png
public/jardins-do-horto/a008.jpg
public/jardins-do-horto/a009.jpg
public/jardins-do-horto/a010.jpg
public/jardins-do-horto/a011.jpg
public/jardins-do-horto/a012.jpg
public/jardins-do-horto/a013.jpg
public/jardins-do-horto/a014.jpg
public/jardins-do-horto/a015.jpg
public/jardins-do-horto/a016.jpg
public/jardins-do-horto/a017.jpg
public/jardins-do-horto/a018.jpg
```

## `/vigore` — 19 arquivos (presentes: `a00.jpg`, `a18.jpg`)

```
public/vigore/a02.jpg
public/vigore/a03.jpg
public/vigore/a05.jpg
public/vigore/a06.jpg
public/vigore/a07.jpg
public/vigore/a08.jpg
public/vigore/a09.jpg
public/vigore/a10.jpg
public/vigore/a11.jpg
public/vigore/a12.jpg
public/vigore/a13.jpg
public/vigore/a14.jpg
public/vigore/a15.jpg
public/vigore/a16.jpg
public/vigore/a17.jpg
public/vigore/a19.jpg
public/vigore/a20.jpg
public/vigore/a21.jpg
public/vigore/a44.jpg
```

---

### Como reconferir depois de subir

```bash
# deve imprimir "OK" para cada arquivo
for f in $(grep -oE "a[0-9]{2}\.(jpg|png)" components/Vigore.tsx | sort -u); do
  [ -f "public/vigore/$f" ] && echo "OK $f" || echo "FALTA $f"
done
```

---

# Landings migradas em 05/08/2026 (Allegrato, Avalon, Best View, Doppio, Maitá, Odeon, SKY)

Os sete arquivos HTML de origem foram desempacotados e todos os assets que
**existiam** neles já estão em `public/<slug>/`. Duas landings referenciavam
imagens que **não vieram** no material original (já estavam quebradas lá):

## Doppio Jundiaí — plantas
`components/DoppioJundiai.tsx` aponta para `public/doppio-jundiai/plantas/`.
Enquanto os arquivos não existirem, cada planta mostra o aviso
"planta disponível sob consulta" (fallback do `PlanImg`) em vez de imagem
quebrada. Arquivos esperados:

```
public/doppio-jundiai/plantas/tipo210.jpg
public/doppio-jundiai/plantas/tipo191.jpg
public/doppio-jundiai/plantas/tipo156a.jpg
public/doppio-jundiai/plantas/tipo156b.jpg
public/doppio-jundiai/plantas/gar186.jpg
public/doppio-jundiai/plantas/gar212.jpg
public/doppio-jundiai/plantas/gar244.jpg
public/doppio-jundiai/plantas/plana442.jpg
public/doppio-jundiai/plantas/plana434.jpg
public/doppio-jundiai/plantas/dpx375i.jpg
public/doppio-jundiai/plantas/dpx375s.jpg
public/doppio-jundiai/plantas/dpx307i.jpg
public/doppio-jundiai/plantas/dpx307s.jpg
public/doppio-jundiai/plantas/dpx374i.jpg
public/doppio-jundiai/plantas/dpx374s.jpg
```

## Maitá Residencial — 3 das 4 plantas
Só a planta de 63,45 m² veio no bundle (`public/maita/a014.png`). As outras três
abas mostram "planta disponível sob consulta". Para exibi-las, adicione os
arquivos e preencha o campo `img` de `PLANTS` em `components/Maita.tsx`
(hoje `null` para 65,52 / 67,12 / 80,87 m²).

## Números e dados a confirmar
- **Allegrato**: o `WA_NUMBER` do fonte estava marcado como *PLACEHOLDER*.
  Hoje usa `5511926143393` (mesmo número do resto do portal). Confirmar.
- **Maitá**: a landing original é da marca **Japi Lançamentos** (inclusive o
  rodapé e o número `5511926143393`). Se ela for publicada sob a marca Lotus,
  o texto de marca precisa ser revisto.
