-- Portal: vínculo EXPLÍCITO entre um lançamento e sua landing page
--   lancamentos.landing_slug -> pasta em app/<slug>/ do portal
--
-- PROBLEMA QUE ISTO RESOLVE
-- O link do card saía de slugify(nome): o nome digitado no dash TINHA que ser
-- exatamente o nome da pasta. "Vivarte Grand Alamedas" gera "vivarte-grand-alamedas"
-- e não achava /vivarte, então o card caía no WhatsApp — sem erro, sem aviso.
-- Cadastrar virava chute, e renomear um empreendimento quebrava o link em silêncio.
--
-- Com landing_slug o vínculo é declarado, não adivinhado. O nome volta a ser
-- livre para marketing. O portal usa landing_slug quando preenchido e cai no
-- slugify(nome) quando nulo, então NADA quebra: os lançamentos que hoje linkam
-- por coincidência de nome continuam linkando.
--
-- >>> CONFIRMAR antes de rodar:
--   1. A tabela base se chama `public.lancamentos` (a view portal_lancamentos lê dela).
--   2. A definição atual da view — a parte (3) precisa dela. Rode antes:
--        SELECT pg_get_viewdef('public.portal_lancamentos'::regclass, true);
--      e cole o resultado no CREATE OR REPLACE, acrescentando `l.landing_slug`
--      NO FIM da lista de colunas (o Postgres só permite ADICIONAR colunas no fim
--      de um CREATE OR REPLACE VIEW; mudar ordem ou tipo exige DROP + CREATE).
--   3. O alias da tabela base dentro da view (abaixo assumo `l`).
--
-- O portal tolera as duas ordens de deploy: se o código subir antes desta
-- migration, fetchRows() detecta a coluna ausente (SQLSTATE 42703), loga e
-- refaz a query sem ela. Ver lib/lancamentos.ts.
--
-- Aplicar em baixo tráfego (locks). Partes (1) e (2) são idempotentes.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1) Coluna na tabela base ----------------------------------------------------
-- Nullable de propósito: a esmagadora maioria dos lançamentos não tem landing, e
-- os que têm já funcionam pelo nome. Preencher é opt-in.
ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS landing_slug text;

COMMENT ON COLUMN public.lancamentos.landing_slug IS
  'Pasta da landing no portal (app/<slug>/), ex: "vivarte". Nulo = deriva do nome. '
  'Vale a lista em lib/landings.ts; slug sem página faz o card cair no contato.';

-- 2) Formato do slug ----------------------------------------------------------
-- Barra a classe de erro mais provável no dash: colar a URL inteira
-- ("https://.../vivarte" ou "/vivarte") em vez do slug. Sem isto o valor entra,
-- não casa com pasta nenhuma e volta a falhar em silêncio — exatamente o que
-- esta migration existe para acabar. A validação fica no banco porque o dash e
-- o portal são bases de código diferentes; a regra tem que valer para os dois.
ALTER TABLE public.lancamentos
  DROP CONSTRAINT IF EXISTS lancamentos_landing_slug_formato;

ALTER TABLE public.lancamentos
  ADD CONSTRAINT lancamentos_landing_slug_formato
  CHECK (landing_slug IS NULL OR landing_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  NOT VALID;  -- NOT VALID: não varre a tabela agora (a coluna acabou de nascer nula).

ALTER TABLE public.lancamentos
  VALIDATE CONSTRAINT lancamentos_landing_slug_formato;

COMMIT;

-- 3) Expor na view ------------------------------------------------------------
-- NÃO É IDEMPOTENTE E NÃO ESTÁ COMPLETO: cole a definição real (passo 2 do
-- CONFIRMAR acima) antes de rodar. O esqueleto abaixo é ilustrativo.
--
-- BEGIN;
-- CREATE OR REPLACE VIEW public.portal_lancamentos
--   WITH (security_invoker = true) AS
--   SELECT
--     l.id, l.tenant_id, l.nome, l.descricao, l.fotos, l.endereco_plantao,
--     l.cidade, l.bairro, l.estagio, l.construtora, l.dormitorios, l.specs,
--     l.preco_texto, l.exclusivo, l.tipo_dorms, l.preco_num,
--     l.created_at, l.updated_at,
--     l.landing_slug                      -- <<< a nova coluna, no FIM
--   FROM public.lancamentos l
--   WHERE /* ... mantenha o filtro atual de tenant/publicado ... */;
--
-- -- O grant é por coluna nas views portal_* (padrão da 0002): sem isto o anon
-- -- recebe 42501 e a query inteira falha.
-- GRANT SELECT (landing_slug) ON public.portal_lancamentos TO anon;
-- COMMIT;

-- 4) Preencher as landings órfãs ----------------------------------------------
-- Estas 8 têm página pronta no portal e nenhum lançamento apontando para elas.
-- Rode DEPOIS de (3), e só nas linhas que realmente existirem no dash — o WHERE
-- por nome é um chute conveniente, confira o resultado antes de commitar.
--
-- BEGIN;
-- UPDATE public.lancamentos SET landing_slug = 'vivarte'             WHERE nome ILIKE 'Vivarte%';
-- UPDATE public.lancamentos SET landing_slug = 'vigore'              WHERE nome ILIKE 'Vigore%';
-- UPDATE public.lancamentos SET landing_slug = 'odeon'               WHERE nome ILIKE 'Odeon%';
-- UPDATE public.lancamentos SET landing_slug = 'authoria'            WHERE nome ILIKE 'Authoria%';
-- UPDATE public.lancamentos SET landing_slug = 'avalon'              WHERE nome ILIKE 'Avalon%';
-- UPDATE public.lancamentos SET landing_slug = 'best-view-residence' WHERE nome ILIKE 'Best View%';
-- UPDATE public.lancamentos SET landing_slug = 'brisas-do-japi'      WHERE nome ILIKE 'Brisas%';
-- UPDATE public.lancamentos SET landing_slug = 'sky-videiras'        WHERE nome ILIKE 'Sky%';
-- SELECT nome, landing_slug FROM public.lancamentos WHERE landing_slug IS NOT NULL ORDER BY nome;
-- COMMIT;
--
-- Depois: `npm run check:landings` no portal confirma quem passou a linkar.
