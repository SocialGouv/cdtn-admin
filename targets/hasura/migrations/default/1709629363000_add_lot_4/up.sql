update documents
set initial_id = a.id
from contribution.answers a
    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = coalesce(documents."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
    and q."content" = documents."title"
    and q.order in (6, 9, 10, 19, 29, 33, 35, 37, 40, 41);
