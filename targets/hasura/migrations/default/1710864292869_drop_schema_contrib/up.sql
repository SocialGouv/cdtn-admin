drop schema "contrib" cascade;
delete FROM public.documents
WHERE source = 'contributions'
AND document ? 'split'
AND is_available = false;