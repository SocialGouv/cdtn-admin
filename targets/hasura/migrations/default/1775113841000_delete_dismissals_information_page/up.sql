-- Prevent duplicate links in public.document_relations.
--
-- Objective: prevent inserting the same link multiple times
-- for the same triplet (document_a, document_b, type).
--
-- Note: `document_a` is nullable (used for root theme relations). PostgreSQL UNIQUE
-- constraints allow multiple rows where `document_a IS NULL`.
DELETE FROM public.documents d
  USING information.informations i
WHERE d.initial_id = i.id::text
  AND i.dismissal_process = true;

DELETE FROM information.informations WHERE dismissal_process = true;
