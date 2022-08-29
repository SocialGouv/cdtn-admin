with extracted_contents as (
	select
		d.initial_id,
		d.document->'contents' as contents
	from documents d
	where document->'contents' is not null
),
extracted_content as (
	select
		ec.initial_id,
		jsonb_array_elements(ec.contents) as "content"
	from extracted_contents as ec
),
formated_content as (
	select
	ec.initial_id,
	ec.content->'title' as title,
	ec.content->'name' as name,
	ec.content->'references' as references,
	ec.content->'blocks'->0->'type' as type,
	ec.content->'blocks'->0->'markdown' as markdown,
	ec.content->'blocks'->0->'size' as size,
	ec.content->'blocks'->0->'imgUrl' as imgUrl,
	ec.content->'blocks'->0->'altText' as altText,
	ec.content->'blocks'->0->'fileUrl' as fileUrl
	from extracted_content as ec
),
aggregated_contents as (
    select
    fc.initial_id,
    array_agg(
        json_build_object(
            'title', fc.title,
            'name', fc.name,
            'references', fc.references,
            'type', fc."type",
            'markdown', fc.markdown,
            'size', fc.size,
            'imgUrl', fc.imgUrl,
            'altText', fc.altText,
            'fileUrl', fc.fileUrl
        )
    ) as contents
    from formated_content fc
    group by fc.initial_id
)
update documents d 
set document = json_build_object(
	'description', d.document->'description',
    'date', d.document->'date',
    'sectionDisplayMode', d.document->'sectionDisplayMode',
    'references', d.document->'references',
    'intro', d.document->'intro',
    'contents', ac.contents
)
from aggregated_contents ac
where ac.initial_id = d.initial_id;