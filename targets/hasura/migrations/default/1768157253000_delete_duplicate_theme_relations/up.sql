-- Delete duplicate theme relations in public.document_relations
--
-- OBJECTIF : Supprimer les documents qui apparaissent plusieurs fois dans le même thème
--
-- Context / assumptions:
-- - Themes are stored in public.documents with source = 'themes'
-- - Theme → Document links are stored in public.document_relations with:
--     document_a = theme cdtn_id (le thème)
--     document_b = document cdtn_id (le document lié au thème)
--
-- Cette migration supprime les relations en double où le même document (document_b)
-- apparaît plusieurs fois dans le même thème (document_a) avec le même type.
--
-- Pour chaque groupe de doublons (même thème + même document + même type),
-- on garde UNE SEULE relation choisie selon :
-- 1. On préfère les lignes avec data (data IS NOT NULL)
-- 2. Puis on prend le plus petit id pour être déterministe

WITH theme_relations AS (
  SELECT dr.*
  FROM public.document_relations dr
  JOIN public.documents t
    ON t.cdtn_id = dr.document_a
   AND t.source = 'themes'
),
ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY document_a, document_b, type
      -- Keep the "best" row:
      -- 1) prefer rows with data (data IS NULL last)
      -- 2) then smallest id for determinism
      ORDER BY (data IS NULL) ASC, id ASC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY document_a, document_b, type) AS cnt
  FROM theme_relations
),
to_delete AS (
  SELECT id
  FROM ranked
  WHERE cnt > 1 AND rn > 1
)
DELETE FROM public.document_relations dr
USING to_delete d
WHERE dr.id = d.id;