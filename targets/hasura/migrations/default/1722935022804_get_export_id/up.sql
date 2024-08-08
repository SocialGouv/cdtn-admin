INSERT INTO public.document_exports (export_id, cdtn_id)
SELECT export_id, cdtn_id 
FROM public.documents 
WHERE export_id IS NOT NULL;
