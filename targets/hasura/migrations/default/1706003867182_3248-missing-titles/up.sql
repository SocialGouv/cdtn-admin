update documents d
set title = q.content,
meta_description = a.description
from contribution.answers a
inner join contribution.questions q on q.id = a.question_id 
where a.id::text = d.initial_id and d.slug like '3248-%';
