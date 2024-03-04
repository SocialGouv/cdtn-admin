with _prequalified_variants as (
    select distinct cdtn_id,
        jsonb_array_elements_text(document->'variants') as variant
    from documents
    where source = 'prequalified'
),
_prequalified as (
    select distinct cdtn_id,
        array_agg(variant) as variants
    from _prequalified_variants
    group by cdtn_id
    order by variants asc
),
_prequalified_documents as (
    select distinct p.variants,
        dr.document_b as document_id,
        (dr.data->>'position')::int as "order"
    from _prequalified p
        inner join document_relations dr on dr.document_a = cdtn_id
),
_inserted_prequalified as (
    insert into "search".prequalified(variants)
    select variants
    from _prequalified
    returning id,
        variants
),
_inserted_prequalified_documents as (
    insert into search.prequalified_documents(prequalified_id, document_id, "order")
    select ip.id,
        pd.document_id,
        pd."order"
    from _prequalified_documents pd
        inner join _inserted_prequalified ip on ip.variants = pd.variants
    returning prequalified_id,
        document_id
)
select *
from _inserted_prequalified_documents;