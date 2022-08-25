with extracted_contents as (
	select
		d.initial_id,
		d.document->'contents' as contents
	from documents d
	where document->'contents' is not null and document->'contents'->0->'blocks' is null
),
extracted_content as (
	select
		ec.initial_id,
		jsonb_array_elements(ec.contents) as "content"
	from extracted_contents as ec
),
formated_blocks as (
	select
		ec.initial_id,
		ec.content->'title' as title,
		array_agg(
			case when ec.content->>'type' = 'markdown'
			then json_build_object(
			'type', ec.content->'type',
			'markdown', ec.content->'markdown'
			)
			else json_build_object(
			'type', ec.content->'type',
			'size', ec.content->'size',
			'imgUrl', ec.content->'imgUrl',
			'altText', ec.content->'altText',
			'fileUrl', ec.content->'fileUrl',
			'markdown', ec.content->'markdown'
			)
			end
		) as blocks
	from extracted_content as ec
	group by ec.initial_id, ec.content->'title'
),
formated_content as (
	select
	ec.initial_id,
	ec.content->'title' as title,
	ec.content->'name' as name,
	ec.content->'type' as type,
	ec.content->'references' as references,
	fb.blocks
	from extracted_content as ec
	inner join formated_blocks as fb on fb.initial_id = ec.initial_id and fb.title = ec.content->'title'
),
aggregated_contents as (
    select
    fc.initial_id,
    array_agg(
        json_build_object(
            'title', fc.title,
            'name', fc.name,
            'references', fc.references,
            'blocks', fc.blocks
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