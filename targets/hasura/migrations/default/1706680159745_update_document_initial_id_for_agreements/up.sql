UPDATE public.documents
SET initial_id = LPAD((document->>'num')::text, 4, '0')
WHERE source = 'conventions_collectives';
