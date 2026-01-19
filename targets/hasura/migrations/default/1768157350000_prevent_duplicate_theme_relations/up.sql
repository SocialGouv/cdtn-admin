-- Prevent duplicate Theme → Document relations.
--
-- Goal: avoid re-introducing duplicates in public.document_relations for themes,
-- where the same functional content (same documents.slug + documents.source)
-- is linked multiple times to the same theme (document_a) with the same relation type.
--
-- Approach:
-- - Denormalize documents.slug/source for document_b, and documents.source for document_a
--   into document_relations.
-- - Keep those columns in sync via triggers.
-- - Add a partial UNIQUE index for themes enforcing:
--     (document_a, type, document_b_source, document_b_slug) unique

ALTER TABLE public.document_relations
  ADD COLUMN document_a_source text,
  ADD COLUMN document_b_slug text,
  ADD COLUMN document_b_source text;

-- Backfill denormalized columns for existing rows
UPDATE public.document_relations dr
SET
  document_b_slug = d.slug,
  document_b_source = d.source
FROM public.documents d
WHERE d.cdtn_id = dr.document_b;

UPDATE public.document_relations dr
SET document_a_source = a.source
FROM public.documents a
WHERE a.cdtn_id = dr.document_a;

-- Ensure document_b_* is always present (document_b is NOT NULL + FK to documents)
ALTER TABLE public.document_relations
  ALTER COLUMN document_b_slug SET NOT NULL,
  ALTER COLUMN document_b_source SET NOT NULL;

-- Keep denormalized columns in sync on INSERT/UPDATE in document_relations
CREATE OR REPLACE FUNCTION public.set_document_relations_dedupe_columns()
RETURNS trigger AS $$
DECLARE
  a_source text;
  b_slug text;
  b_source text;
BEGIN
  -- document_a can be NULL, so this may return NULL
  IF NEW.document_a IS NOT NULL THEN
    SELECT d.source INTO a_source
    FROM public.documents d
    WHERE d.cdtn_id = NEW.document_a;
  ELSE
    a_source := NULL;
  END IF;

  -- document_b is NOT NULL and FK'd to documents
  SELECT d.slug, d.source
    INTO b_slug, b_source
  FROM public.documents d
  WHERE d.cdtn_id = NEW.document_b;

  NEW.document_a_source := a_source;
  NEW.document_b_slug := b_slug;
  NEW.document_b_source := b_source;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_document_relations_dedupe_columns ON public.document_relations;
CREATE TRIGGER set_document_relations_dedupe_columns
BEFORE INSERT OR UPDATE ON public.document_relations
FOR EACH ROW
EXECUTE PROCEDURE public.set_document_relations_dedupe_columns();

-- Propagate slug/source changes from documents to document_relations.
-- This is defensive: slug/source are generally stable, but if they change we keep
-- the unique index consistent.
CREATE OR REPLACE FUNCTION public.propagate_documents_to_document_relations()
RETURNS trigger AS $$
BEGIN
  UPDATE public.document_relations dr
  SET
    document_b_slug = NEW.slug,
    document_b_source = NEW.source
  WHERE dr.document_b = NEW.cdtn_id;

  UPDATE public.document_relations dr
  SET document_a_source = NEW.source
  WHERE dr.document_a = NEW.cdtn_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS propagate_documents_to_document_relations ON public.documents;
CREATE TRIGGER propagate_documents_to_document_relations
AFTER UPDATE OF slug, source ON public.documents
FOR EACH ROW
EXECUTE PROCEDURE public.propagate_documents_to_document_relations();

-- Enforce uniqueness for themes only.
-- Prevents duplicates even when different cdtn_id point to the same functional content
-- (same slug + same source).
CREATE UNIQUE INDEX document_relations_theme_unique_by_slug_source
  ON public.document_relations (document_a, type, document_b_source, document_b_slug)
  WHERE document_a_source = 'themes';

