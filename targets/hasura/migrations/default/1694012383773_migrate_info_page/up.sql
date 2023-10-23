with _informations as (
    select cdtn_id,
        title,
        "document"->>'meta_title' as meta_title,
        meta_description,
        TO_TIMESTAMP("document"->>'date', 'DD/MM/YYYY') as updated_at,
        "document"->>'intro' as intro,
        "document"->'contents' as contents,
        "document"->'references' as "references",
        "document"->>'description' as "description",
        "document"->>'sectionDisplayMode' as "section_display_mode",
        case
            when "document"->>'dismissalProcess' = 'true' then true
            else false
        end as "dismissal_process",
        "document"->'references'->0->>'label' as "reference_label"
    from documents
    where source = 'information'
        and is_published is true
),
_informations_inserted as (
    insert into "information".informations(
            updated_at,
            intro,
            title,
            meta_title,
            meta_description,
            description,
            section_display_mode,
            dismissal_process,
            reference_label
        )
    select updated_at,
        intro,
        title,
        coalesce(meta_title, title),
        meta_description,
        description,
        coalesce(
            section_display_mode,
            'accordion'
        ),
        dismissal_process,
        reference_label
    from _informations
    returning id,
        title
),
_informations_references as (
    select i.id as informations_id,
        l.value->'id' as id,
        l.value->>'url' as url,
        l.value->>'type' as "type",
        l.value->>'title' as title,
        l."ordinality" as "order"
    from (
            select title,
                jsonb_array_elements("references") as refs
            from _informations
            where jsonb_typeof("references") = 'array'
        ) r
        cross join jsonb_array_elements(r.refs->'links') WITH ordinality as l
        inner join _informations_inserted i on i.title = r.title
),
_informations_references_inserted as (
    insert into information.informations_references(informations_id, url, "type", title, "order")
    select informations_id,
        url,
        "type",
        title,
        "order"
    from _informations_references
    returning id
),
_informations_contents as (
    select i.id as informations_id,
        c."value"->>'name' as "name",
        c."value"->>'title' as title,
        c."value"->'blocks' as blocks,
        c."value"->'references' as "references",
        c."value"->'references'->0->>'label' as "reference_label",
        c."ordinality" as "order"
    from _informations as d
        cross join jsonb_array_elements(d.contents) WITH ordinality as c
        inner join _informations_inserted i on i.title = d.title
),
_informations_contents_inserted as (
    insert into information.informations_contents(
            "name",
            "title",
            "order",
            informations_id,
            reference_label
        )
    select "name",
        "title",
        "order",
        informations_id,
        reference_label
    from _informations_contents
    returning id,
        informations_id,
        title,
        "order"
),
_informations_contents_references as (
    select i.id as informations_contents_id,
        l.links->>'id' as id,
        l.links->>'url' as url,
        l.links->>'type' as "type",
        l.links->>'title' as title,
        l."order"
    from (
            select title,
                informations_id,
                l.value as "links",
                l."ordinality" as "order"
            from (
                    select title,
                        informations_id,
                        jsonb_array_elements("references") as refs
                    from _informations_contents
                    where jsonb_typeof("references") = 'array'
                ) r
                cross join jsonb_array_elements(r.refs->'links') WITH ordinality as l
        ) l
        inner join _informations_contents_inserted i on i.informations_id = l.informations_id
        and i.title = l.title
),
_informations_contents_references_inserted as (
    insert into information.informations_contents_references(
            informations_contents_id,
            url,
            "type",
            title,
            "order"
        )
    select informations_contents_id,
        url,
        "type",
        title,
        "order"
    from _informations_contents_references
    returning id
),
_informations_contents_blocks as (
    select i.id as informations_contents_id,
        coalesce(b.value->>'markdown', b.value->>'title') as "content",
        b.value->>'type' as "type",
        b.value->>'size' as "size",
        b.value->>'imgUrl' as "img_url",
        b.value->>'fileUrl' as "file_url",
        b.value->>'altText' as "alt_text",
        b.value->>'blockDisplayMode' as "content_display_mode",
        b.value->'contents' as contents,
        b."ordinality" as "order"
    from _informations_contents ic
        cross join jsonb_array_elements(ic.blocks) WITH ordinality as b
        inner join _informations_contents_inserted i on i.informations_id = ic.informations_id
        and i.title = ic.title
    where jsonb_typeof(ic.blocks) = 'array'
),
_files as (
    select fa.url,
        jsonb_agg(
            jsonb_build_object(
                'altText',
                fa.alt_text,
                'size',
                fa."size"
            )
        ) as agg
    from (
            select distinct img_url as url,
                alt_text,
                "size"
            from _informations_contents_blocks
            where img_url is not null
            union
            select distinct file_url as url,
                alt_text,
                "size"
            from _informations_contents_blocks
            where file_url is not null
        ) as fa
    group by fa.url
),
_files_inserted as (
    insert into public.files(url, alt_text, "size")
    select url,
        agg->0->>'altText' as alt_text,
        agg->0->>'size' as "size"
    from _files
    returning id,
        url
),
_informations_contents_blocks_inserted as (
    insert into information.informations_contents_blocks(
            informations_contents_id,
            "content",
            "order",
            file_id,
            img_id,
            "type",
            "content_display_mode"
        )
    select informations_contents_id,
        "content",
        "order",
        ff.id,
        fi.id,
        "type",
        content_display_mode
    from _informations_contents_blocks i
        left outer join _files_inserted fi on fi.url = i.img_url
        left outer join _files_inserted ff on ff.url = i.file_url
    returning id,
        informations_contents_id,
        "order"
),
_informations_contents_blocks_contents as (
    select c."value"->>'cdtnId' as "cdtn_id",
        i.id as informations_contents_blocks_id,
        c."ordinality" as "order"
    from _informations_contents_blocks icb
        cross join jsonb_array_elements(icb.contents) WITH ordinality as c
        inner join _informations_contents_blocks_inserted i on i.informations_contents_id = icb.informations_contents_id
        and i."order" = icb."order"
    where jsonb_typeof(icb.contents) = 'array'
)
insert into information.informations_contents_blocks_contents(
        cdtn_id,
        informations_contents_blocks_id,
        "order"
    )
select cdtn_id,
    informations_contents_blocks_id,
    "order"
from _informations_contents_blocks_contents;
update documents
set initial_id = i.id
from information.informations i
where documents."source" = 'information'
    and documents.title = i.title;
