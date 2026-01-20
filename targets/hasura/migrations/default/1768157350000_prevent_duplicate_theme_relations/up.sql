-- Prevent duplicate links in public.document_relations.
--
-- Objective: prevent inserting the same link multiple times
-- for the same couple (document_a, document_b).
--
-- Note: `document_a` is nullable (used for root theme relations). PostgreSQL UNIQUE
-- constraints allow multiple rows where `document_a IS NULL`.
ALTER TABLE public.document_relations
  ADD CONSTRAINT document_relations_document_a_document_b_key
  UNIQUE (document_a, document_b);
