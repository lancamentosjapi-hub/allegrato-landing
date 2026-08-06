-- Portal: preenche landing_slug nos lançamentos que têm landing — 3 de 3
--   0004  coluna landing_slug na tabela base
--   0005  view portal_landing_slugs                       <- rode antes desta
--   0006 (este)  vincula os lançamentos existentes
--
-- Os 15 lançamentos abaixo JÁ apontam para a landing certa hoje — mas por
-- coincidência: o nome cadastrado calha de gerar o slug da pasta. É frágil.
-- Renomear "Maitá" para "Maitá Residencial" no dash quebra o link em silêncio.
-- Preencher landing_slug torna o vínculo explícito e o nome volta a ser livre.
--
-- Nada muda visualmente ao rodar isto: o destino do link é o mesmo. O que muda é
-- que ele para de depender do texto do nome.
--
-- >>> ANTES DE RODAR, confira o que vai casar (0 linhas = os nomes mudaram):

--   SELECT l.nome, m.slug
--     FROM public.lancamentos l
--     JOIN (VALUES
--       ('Allegrato','allegrato'), ('Altos da Avenida','altos-da-avenida'),
--       ('Auten Jundiaí','auten-jundiai'), ('Avelã','avela'),
--       ('Doppio Jundiaí','doppio-jundiai'), ('Forest Houses','forest-houses'),
--       ('Gran Ville Santo Ângelo','gran-ville-santo-angelo'),
--       ('Jardins do Horto','jardins-do-horto'), ('Maitá','maita'),
--       ('Manawa','manawa'), ('Maxx Santa Ângela','maxx-santa-angela'),
--       ('Portal dos Lagos','portal-dos-lagos'), ('Resort Prime','resort-prime'),
--       ('Terrace Serra do Japi','terrace-serra-do-japi'),
--       ('Vistta Castanho','vistta-castanho')
--     ) AS m(nome, slug) ON l.nome = m.nome
--    ORDER BY l.nome;
--
-- Idempotente: reexecutar não muda nada. Só toca linhas cujo valor difere.

BEGIN;
SET LOCAL lock_timeout = '5s';

UPDATE public.lancamentos l
   SET landing_slug = m.slug
  FROM (VALUES
    ('Allegrato',               'allegrato'),
    ('Altos da Avenida',        'altos-da-avenida'),
    ('Auten Jundiaí',           'auten-jundiai'),
    ('Avelã',                   'avela'),
    ('Doppio Jundiaí',          'doppio-jundiai'),
    ('Forest Houses',           'forest-houses'),
    ('Gran Ville Santo Ângelo', 'gran-ville-santo-angelo'),
    ('Jardins do Horto',        'jardins-do-horto'),
    ('Maitá',                   'maita'),
    ('Manawa',                  'manawa'),
    ('Maxx Santa Ângela',       'maxx-santa-angela'),
    ('Portal dos Lagos',        'portal-dos-lagos'),
    ('Resort Prime',            'resort-prime'),
    ('Terrace Serra do Japi',   'terrace-serra-do-japi'),
    ('Vistta Castanho',         'vistta-castanho')
  ) AS m(nome, slug)
 WHERE l.nome = m.nome
   AND l.landing_slug IS DISTINCT FROM m.slug;

COMMIT;

-- Conferir:
--   SELECT nome, landing_slug FROM public.lancamentos
--    WHERE landing_slug IS NOT NULL ORDER BY nome;
--
-- E no portal: `npm run check:landings` deve mostrar "(por landing_slug)" em vez
-- de "(por nome)" nestes 15.


-- ---------------------------------------------------------------------------
-- AS 8 LANDINGS ÓRFÃS NÃO ESTÃO AQUI — E NÃO É ESQUECIMENTO
-- ---------------------------------------------------------------------------
-- authoria · avalon · best-view-residence · brisas-do-japi
-- odeon    · sky-videiras · vigore · vivarte
--
-- Estas oito têm página pronta no portal e NENHUMA linha correspondente na
-- tabela `lancamentos` — não há o que atualizar. Um UPDATE não cria linha, e
-- INSERT daqui seria inventar dado de negócio (construtora, preço, fotos,
-- estágio) que só a Lotus tem.
--
-- O caminho é cadastrar cada uma no dash, preenchendo:
--   - nome          (livre — com landing_slug preenchido, não precisa casar)
--   - landing_slug  (o slug da lista acima)
--   - cidade E pelo menos uma foto  <- sem os dois o card NÃO aparece na vitrine
--
-- Se o dash ainda não expõe o campo landing_slug, dá para preencher por SQL
-- depois de cadastrar:
--   UPDATE public.lancamentos SET landing_slug = 'vivarte' WHERE id = '<uuid>';
--
-- `npm run check:landings` lista as órfãs que faltam a qualquer momento.
