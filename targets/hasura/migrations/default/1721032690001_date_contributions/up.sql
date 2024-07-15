WITH updated_documents AS (
    SELECT d.initial_id, to_char(a.updated_at, 'DD/MM/YYYY') as formatted_date
    FROM public.documents d
    JOIN contribution.answers a
    ON d.cdtn_id = a.cdtn_id
    WHERE d.source = 'contributions'
)
UPDATE public.documents
SET document = jsonb_set(document, '{date}', to_jsonb(updated_documents.formatted_date), true)
FROM updated_documents
WHERE public.documents.initial_id = updated_documents.initial_id;
