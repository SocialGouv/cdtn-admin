UPDATE contribution.answers
SET description = REPLACE(description, '\n', '')
WHERE description LIKE '%\n%';

UPDATE public.documents d
SET "document" = jsonb_set(
    d."document",
    '{description}',
    jsonb_build_object('description', REPLACE((d."document"->'description'->>'description')::text, '\n', ''))
)
WHERE d."document"->'description' is not null
  AND (d."document"->'description'->>'description')::text LIKE '%\n%';
