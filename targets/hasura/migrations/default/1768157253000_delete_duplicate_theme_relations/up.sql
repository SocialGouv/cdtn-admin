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
-- NB: dans certains cas, les doublons ne sont pas strictement identiques sur document_b
-- (cdtn_id différent) mais correspondent en réalité au même contenu fonctionnel
-- (même slug + même type de contenu). Dans ce cas, la déduplication doit se baser
-- sur (slug, source) plutôt que uniquement sur document_b.
--
-- Pour chaque groupe de doublons (même thème + même document + même type),
-- on garde UNE SEULE relation choisie selon :
-- 1. On préfère les lignes avec data (data IS NOT NULL)
-- 2. Puis on prend le plus petit id pour être déterministe

WITH theme_relations AS (
  SELECT
    dr.*,
    d.slug AS document_b_slug,
    d.source AS document_b_source,
    d.is_available AS document_b_is_available,
    -- Clé de déduplication:
    -- - si on a (slug + source), alors on déduplique sur (slug, source)
    -- - sinon, on revient au comportement initial: déduplication par cdtn_id (document_b)
    CASE
      WHEN d.slug IS NOT NULL AND d.source IS NOT NULL THEN d.slug
      ELSE dr.document_b
    END AS dedupe_key,
    CASE
      WHEN d.slug IS NOT NULL AND d.source IS NOT NULL THEN d.source
      ELSE '__by_cdtn_id__'
    END AS dedupe_content_type
  FROM public.document_relations dr
  JOIN public.documents t
    ON t.cdtn_id = dr.document_a
   AND t.source = 'themes'
  LEFT JOIN public.documents d
    ON d.cdtn_id = dr.document_b
),
ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      -- Dédoublonnage par thème + (slug, type de contenu) + type de relation.
      -- Fallback sur document_b si (slug, source) n'est pas disponible.
      PARTITION BY document_a, dedupe_key, dedupe_content_type, type
      -- Keep the "best" row:
      -- 1) prefer rows with data (data IS NULL last)
      -- 2) prefer available documents when possible
      -- 3) then smallest id for determinism
      ORDER BY (data IS NULL) ASC,
               (document_b_is_available IS DISTINCT FROM TRUE) ASC,
               id ASC
    ) AS rn,
    COUNT(*) OVER (
      PARTITION BY document_a, dedupe_key, dedupe_content_type, type
    ) AS cnt
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
