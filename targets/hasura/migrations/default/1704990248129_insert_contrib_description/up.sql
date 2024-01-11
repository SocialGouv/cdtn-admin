with _content_get as (
	select id, content as "content"
	from contribution.answers
	where content_type = 'ANSWER'
	union
	select a.id, d.text as "content"
	from contribution.answers a
	inner join public.documents d on d.cdtn_id = a.content_service_public_cdtn_id 
	where content_type = 'SP'
),
_content_formatted as (
	select id, substring(trim(REGEXP_REPLACE(REGEXP_REPLACE("content", '(<[^>]*>?)|(&nbsp;)', ' ', 'gm'), '[ ]{2,}', ' ', 'gm')), 1, 146) as "content"
	from _content_get
	where "content" is not null and "content" <> ''
),
_content_points as (
	select id, case when length("content") = 146 then substring("content", 1, 146 - position(' ' in reverse("content"))) || ' ...' else "content" end as description from _content_formatted
),
_update_contribution as (
	update contribution.answers a
	set description = cp.description
	from _content_points cp
	where cp.id = a.id
)
update public.documents d
set "document" = case when "document"->'description' is null
	then  jsonb_insert(d."document", '{description}', jsonb_build_object('description', cp.description)->'description')
	else jsonb_set(d."document", '{description}', jsonb_build_object('description', cp.description)->'description') end
from _content_points cp
where cp.id::text = d.initial_id;