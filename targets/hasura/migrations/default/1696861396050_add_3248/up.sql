insert into public.agreements(id, name, kali_id)
values ('3248', 'Convention collective nationale de la métallurgie', 'KALICONT000046993250');

insert into contribution.answers (question_id, agreement_id)
select q.id, '3248'
from contribution.questions q;
