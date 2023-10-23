insert into public.agreements(id, name, kali_id)
values (
        '3248',
        'Convention collective nationale de la métallurgie',
        'KALICONT000046993250'
    );
with inserted_questions as (
    insert into contribution.questions (content)
    select distinct q.value
    from contrib.questions q
    returning id,
        content
)
insert into contribution.answers (question_id, agreement_id)
select iq.id,
    a.id
from inserted_questions iq
    cross join public.agreements a
where a.id = '3248';
