update documents
set initial_id = a.id
from contribution.answers a


    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = coalesce(documents."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
    and q."content" = documents."title"
    and q.id in ('ad1c2bd2-8f37-450e-bf4a-bb8fb50ea2c7')
