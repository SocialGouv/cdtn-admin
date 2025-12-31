drop schema "contrib" cascade;
delete from contribution.answer_cdtn_references
where cdtn_id in (
	select cdtn_id
	FROM public.documents
	WHERE source = 'contributions'
	AND document ? 'split'
);
delete FROM public.documents
WHERE source = 'contributions'
AND document ? 'split';