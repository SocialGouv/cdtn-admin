DROP INDEX IF EXISTS public.document_relations_theme_unique_by_slug_source;

DROP TRIGGER IF EXISTS set_document_relations_dedupe_columns ON public.document_relations;
DROP FUNCTION IF EXISTS public.set_document_relations_dedupe_columns();

DROP TRIGGER IF EXISTS propagate_documents_to_document_relations ON public.documents;
DROP FUNCTION IF EXISTS public.propagate_documents_to_document_relations();

ALTER TABLE public.document_relations
  DROP COLUMN IF EXISTS document_a_source,
  DROP COLUMN IF EXISTS document_b_slug,
  DROP COLUMN IF EXISTS document_b_source;

