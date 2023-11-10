update documents
set initial_id = a.id
from contribution.answers a
    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = documents."document"->'answers'->'conventionAnswer'->>'idcc'
    and q."content" = documents."title";
