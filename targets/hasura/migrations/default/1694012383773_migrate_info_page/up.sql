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
        "document"->'references'->0->>'label' as "reference_label"
    from documents
    where source = 'information'
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
            reference_label,
            cdtn_id
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
        reference_label,
        cdtn_id
    from _informations
    returning id,
        cdtn_id
),
_informations_references as (
    select i.id as informations_id,
        l.links->'id' as id,
        l.links->>'url' as url,
        l.links->>'type' as "type",
        l.links->>'title' as title,
        row_number() over(partition by i.id) as "order"
    from (
            select r.cdtn_id,
                jsonb_array_elements(r.refs->'links') as "links"
            from (
                    select cdtn_id,
                        jsonb_array_elements("references") as refs
                    from _informations
                    where jsonb_typeof("references") = 'array'
                ) r
        ) l
        inner join _informations_inserted i on i.cdtn_id = l.cdtn_id
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
        c."content"->>'name' as "name",
        c."content"->>'title' as title,
        c."content"->'blocks' as blocks,
        c."content"->'references' as "references",
        c."content"->'references'->0->>'label' as "reference_label",
        row_number() over(partition by i.id) as "order"
    from (
            select cdtn_id,
                jsonb_array_elements(contents) as "content"
            from _informations
        ) c
        inner join _informations_inserted i on i.cdtn_id = c.cdtn_id
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
        title
),
_informations_contents_references as (
    select i.id as informations_contents_id,
        l.links->>'id' as id,
        l.links->>'url' as url,
        l.links->>'type' as "type",
        l.links->>'title' as title,
        row_number() over(partition by i.id) as "order"
    from (
            select title,
                informations_id,
                jsonb_array_elements(r.refs->'links') as "links"
            from (
                    select title,
                        informations_id,
                        jsonb_array_elements("references") as refs
                    from _informations_contents
                    where jsonb_typeof("references") = 'array'
                ) r
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
        coalesce(b.block->>'markdown', b.block->>'title') as "content",
        b.block->>'type' as "type",
        b.block->>'size' as "size",
        b.block->>'imgUrl' as "img_url",
        b.block->>'fileUrl' as "file_url",
        b.block->>'altText' as "alt_text",
        b.block->>'blockDisplayMode' as "content_display_mode",
        b.block->'contents' as contents,
        row_number() over(partition by b.informations_id, b.title) as "order"
    from (
            select informations_id,
                title,
                jsonb_array_elements(blocks) as block
            from _informations_contents
            where jsonb_typeof(blocks) = 'array'
        ) b
        inner join _informations_contents_inserted i on i.informations_id = b.informations_id
        and i.title = b.title
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
    select c."content"->>'cdtnId' as "cdtn_id",
        i.id as informations_contents_blocks_id,
        row_number() over(partition by i.id) as "order"
    from (
            select informations_contents_id,
                "order",
                jsonb_array_elements(contents) as "content"
            from _informations_contents_blocks
            where jsonb_typeof(contents) = 'array'
        ) c
        inner join _informations_contents_blocks_inserted i on i.informations_contents_id = c.informations_contents_id
        and i."order" = c."order"
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
