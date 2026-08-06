-- Portal: vínculo EXPLÍCITO entre um lançamento e sua landing page — 1 de 3
--   0004 (este)  coluna landing_slug na tabela base
--   0005         view portal_landing_slugs (vínculo público)
--   0006         vincula os lançamentos existentes
--
-- PROBLEMA QUE ISTO RESOLVE
-- O link do card saía de slugify(nome): o nome digitado no dash TINHA que ser
-- exatamente o nome da pasta em app/. "Vivarte Grand Alamedas" gera
-- "vivarte-grand-alamedas", não acha /vivarte, e o card cai no WhatsApp — sem
-- erro, sem aviso. Cadastrar virava chute, e renomear quebrava o link em silêncio.
--
-- Com landing_slug o vínculo é declarado, não adivinhado, e o nome volta a ser
-- livre para marketing. O portal usa a coluna quando preenchida e cai no
-- slugify(nome) quando nula — nada quebra, quem linka hoje continua linkando.
--
-- >>> CONFIRMAR antes de rodar:
--   1. A tabela base se chama `public.lancamentos` (é dela que a view lê).
--
-- Seguro rodar isolado: sem a 0005 a coluna existe mas o portal não a lê,
-- e o site continua funcionando pelo nome. Idempotente.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1) Coluna -------------------------------------------------------------------
-- Nullable de propósito: a maioria dos lançamentos não tem landing, e os que têm
-- já funcionam pelo nome. Preencher é opt-in.
ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS landing_slug text;

COMMENT ON COLUMN public.lancamentos.landing_slug IS
  'Pasta da landing no portal (app/<slug>/), ex: "vivarte". Nulo = deriva do nome. '
  'Vale a lista em lib/landings.ts; slug sem página faz o card cair no contato.';

-- 2) Formato do slug ----------------------------------------------------------
-- Barra a classe de erro mais provável no dash: colar a URL inteira
-- ("https://.../vivarte" ou "/vivarte") em vez do slug. Sem isto o valor entra,
-- não casa com pasta nenhuma e volta a falhar em silêncio — exatamente o que
-- esta migration existe para acabar. A validação fica no banco porque o dash e o
-- portal são bases de código diferentes; a regra tem que valer para os dois.
ALTER TABLE public.lancamentos
  DROP CONSTRAINT IF EXISTS lancamentos_landing_slug_formato;

ALTER TABLE public.lancamentos
  ADD CONSTRAINT lancamentos_landing_slug_formato
  CHECK (landing_slug IS NULL OR landing_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  NOT VALID;  -- NOT VALID: não varre a tabela agora (a coluna acabou de nascer nula).

ALTER TABLE public.lancamentos
  VALIDATE CONSTRAINT lancamentos_landing_slug_formato;

COMMIT;

-- Conferir:
--   \d public.lancamentos
--   SELECT conname FROM pg_constraint WHERE conname = 'lancamentos_landing_slug_formato';
--
-- Próximo: 0005_portal_landing_slugs_view.sql
