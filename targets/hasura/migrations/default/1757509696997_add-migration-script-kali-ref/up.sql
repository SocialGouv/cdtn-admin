with list as (
SELECT aor.id as aorid, aor.answer_id, aor.url, aor."label", ka.id as kaid
FROM contribution.answer_other_references aor
inner JOIN kali_articles ka
    ON REGEXP_REPLACE(SPLIT_PART(aor.url, '/', -1), '\?.*', '') = ka.id
WHERE aor.url LIKE '%KALIART%'
),
inserted as (
    INSERT INTO contribution.answer_kali_references (answer_id, article_id, "label")
    SELECT answer_id, kaid, "label"
    FROM list
    RETURNING id
),
deleted as (
    DELETE FROM contribution.answer_other_references
    WHERE id IN (SELECT aorid FROM list)
    RETURNING id
)
select id, 'inserted' as status from inserted
union
select id, 'deleted' as status from deleted;
