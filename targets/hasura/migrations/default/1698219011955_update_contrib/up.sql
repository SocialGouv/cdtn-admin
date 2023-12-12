update documents
set initial_id = a.id
from contribution.answers a
    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = coalesce(documents."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
    and q."content" = documents."title"
    and q.id in ('b4c9c59f-20cc-462d-8bcd-70f34dcbc813', '99fc3644-fce1-4e48-bf5f-d59cf1d6d1ae')
