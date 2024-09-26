UPDATE contribution.answers c
SET cdtn_id = d.cdtn_id
FROM public.documents d
WHERE c.cdtn_id IS NULL
  AND c.id::text = d.initial_id;
