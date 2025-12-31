with _idccs as (
	SELECT TO_CHAR(i, 'fm0000') as idcc from unnest(ARRAY[54, 650, 714, 822, 827, 828, 829, 836, 860, 863, 878, 887, 898, 899, 911, 914, 920, 923, 930, 934, 937, 943, 948, 965, 979, 984, 1007, 1059, 1159, 1164, 1274, 1315, 1353, 1365, 1369, 1387, 1472, 1525, 1560, 1564, 1572, 1576, 1577, 1578, 1592, 1604, 1626, 1627, 1628, 1634, 1635, 1732, 1813, 1867, 1885, 1902, 1912, 1960, 1966, 1967, 2003, 2126, 2221, 2266, 2294, 2489, 2542, 2579, 2615, 2630, 2700, 2755, 2980, 2992, 3053, 3209, 3231]) as i
),
_agreements as (
	select a.id from contrib.agreements a where a.idcc::text = any(ARRAY(select idcc from _idccs)) 
),
_locations_agreements as (
	select la.id from contrib.locations_agreements la
	inner join _agreements a on a.id = la.agreement_id
),
_answers as (
	select a.id from contrib.answers a
	inner join _agreements ag on ag.id = a.agreement_id
),
_answers_comments as (
	select ac.id from contrib.answers_comments ac
	inner join _answers a on a.id = ac.answer_id
),
_answers_references as (
	select ar.id from contrib.answers_references ar
	inner join _answers a on a.id = ar.answer_id
),
_answers_references_delete as (
	delete from contrib.answers_references where id in (select ar.id from _answers_references ar)
),
_answers_comments_delete as (
	delete from contrib.answers_comments where id in (select ac.id from _answers_comments ac)
),
_answers_delete as (
	delete from contrib.answers where id in (select a.id from _answers a)
),
_locations_agreements_delete as (
	delete from contrib.locations_agreements where id in (select la.id from _locations_agreements la)
)
delete from contrib.agreements where id in (select a.id from _agreements a);