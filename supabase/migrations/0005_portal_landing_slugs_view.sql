-- Portal: view pública do vínculo lançamento -> landing — 2 de 3
--   0004         coluna landing_slug na tabela base   <- rode antes desta
--   0005 (este)  view portal_landing_slugs
--   0006         preenche o vínculo dos lançamentos existentes
--
-- POR QUE UMA VIEW NOVA, E NÃO landing_slug DENTRO DE portal_lancamentos
-- portal_lancamentos é criada no repo do dash e esta migration não conhece a
-- definição dela. Adicionar uma coluna lá exigiria repetir a definição inteira
-- (CREATE OR REPLACE VIEW não aceita "só mais uma coluna"), e errar o WHERE
-- mudaria quais lançamentos o site inteiro mostra.
--
-- Uma view separada com duas colunas não corre esse risco: portal_lancamentos
-- fica intocada, e o portal cruza as duas listas por id em JS. Se esta view não
-- existir ou falhar, o portal cai no slugify(nome) — o comportamento de sempre.
--
-- SEM security_invoker, de propósito. As outras views portal_* usam porque
-- expõem PII (nome, foto, CRECI de corretor) e a RLS precisa valer por linha.
-- Aqui são dois campos sem PII nenhuma — um uuid e um slug de pasta — e o filtro
-- de tenant está na própria view. Em troca, esta migration não precisa mexer em
-- RLS nem em grants da tabela `lancamentos`, que é justamente o que poderia
-- derrubar portal_lancamentos sem querer.
--
-- Idempotente. Não altera nenhum objeto existente — só cria.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- tenant Lotus: 65c69875-dc83-4062-90f6-6f6adc30df26

DROP VIEW IF EXISTS public.portal_landing_slugs;
CREATE VIEW public.portal_landing_slugs AS
  SELECT
    l.id            AS id,
    l.tenant_id     AS tenant_id,
    l.landing_slug  AS landing_slug
  FROM public.lancamentos l
  WHERE l.tenant_id = '65c69875-dc83-4062-90f6-6f6adc30df26'::uuid
    AND l.landing_slug IS NOT NULL;

GRANT SELECT ON public.portal_landing_slugs TO anon;

COMMIT;

-- Conferir (vazio até rodar a 0006 — a view só lista quem tem vínculo):
--   SELECT * FROM public.portal_landing_slugs;
--
-- Próximo: 0006_lancamentos_vincula_landings.sql
