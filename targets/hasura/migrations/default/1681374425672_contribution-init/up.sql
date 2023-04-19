with idccs as (
    select TO_CHAR(unnest::int, 'fm0000')  as id
	from unnest(array['0', '16', '29', '44', '86', '176', '275', '292', '413', '573', '650', '675', '787', '843', '1043', '1090', '1147', '1266', '1351', '1404', '1483', '1486', '1501', '1505', '1516', '1517', '1518', '1527', '1596', '1597', '1606', '1672', '1702', '1740', '1979', '1996', '2098', '2120', '2148', '2216', '2264', '3239', '2420', '2511', '2596', '2609', '2614', '2941', '3043', '3127', '1480'])
)
insert into public.agreements(id, name)
select '0000', 'Code du travail'
union
select idcc, name
from contrib.agreements
inner join idccs as i on i.id = idcc;

with inserted_questions as (
	insert into contribution.questions (content)
	select distinct q.value
	from contrib.questions q
	returning id, content
)
insert into contribution.answers (id_question, id_cc)
select iq.id, a.id
from inserted_questions iq
cross join public.agreements a;
