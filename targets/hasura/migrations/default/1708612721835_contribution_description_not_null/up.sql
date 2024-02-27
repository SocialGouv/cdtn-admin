with _content_get as (
    select id,
        content as "content"
    from contribution.answers
    where content_type in ('ANSWER', 'GENERIC_NO_CDT')
    union
    select a.id,
        d.text as "content"
    from contribution.answers a
        inner join public.documents d on d.cdtn_id = a.content_service_public_cdtn_id
    where content_type = 'SP'
    union
    select a.id,
        coalesce(d."text", ag."content") as "content"
    from contribution.answers a
        inner join contribution.answers ag on a.question_id = ag.question_id
        and ag.agreement_id = '0000'
        left join public.documents d on d.cdtn_id = ag.content_service_public_cdtn_id
    where a.content_type in ('NOTHING', 'UNKNOWN', 'UNFAVOURABLE', 'CDT')
),
_content_formatted as (
    select id,
        substring(
            trim(
                REGEXP_REPLACE(
                    REGEXP_REPLACE("content", '(<[^>]*>?)|(&nbsp;)', ' ', 'gm'),
                    '[ ]{2,}',
                    ' ',
                    'gm'
                )
            ),
            1,
            156
        ) as "content"
    from _content_get
    where "content" is not null
        and "content" <> ''
),
_content_points as (
    select id,
        case
            when length("content") = 156 then substring(
                "content",
                1,
                156 - position(' ' in reverse("content"))
            ) || ' ...'
            else "content"
        end as description
    from _content_formatted
),
_update_contribution as (
    update contribution.answers a
    set description = cp.description
    from _content_points cp
    where cp.id = a.id
        and (
            a.description is null
            or a.description = ''
        )
)
update public.documents d
set "document" = jsonb_insert(
        d."document",
        '{description}',
        jsonb_build_object('description', cp.description)->'description'
    )
from _content_points cp
where cp.id::text = d.initial_id
    and (
        "document"->'description' is null
        or "document"->>'description' = ''
    );
alter table contribution.answers
add constraint check_description_not_null check (
        content_type = 'NOTHING'
        or content_type is null
        or (
            description is not null
            and description <> ''
        )
    );