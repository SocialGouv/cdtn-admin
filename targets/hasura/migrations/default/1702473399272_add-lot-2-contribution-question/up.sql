update documents
set initial_id = a.id
from contribution.answers a
    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = coalesce(documents."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
    and q."content" = documents."title"
    and q.order in (50, 3, 20, 45, 39, 42, 26, 7, 51, 36, 53);
    