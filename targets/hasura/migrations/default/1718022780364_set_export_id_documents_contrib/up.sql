with _last_export as (
	select id from export_es_status ees
	where status = 'completed'
	order by created_at desc
	limit 1
)
update public.documents d
set export_id = le.id
from _last_export le
where d.source = 'contributions' or d.source = 'information' or d.source = 'modeles_de_courriers';