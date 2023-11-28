update documents
set initial_id = a.id
from contribution.answers a
    inner join contribution.questions q on q.id = a.question_id
where documents."source" = 'contributions'
    and a.agreement_id = coalesce(documents."document"->'answers'->'conventionAnswer'->>'idcc', '0000')
    and q."content" = documents."title"
    and q.id in ('ddaff496-65dc-49c4-a6de-a27b9a1fcf19', 'b4c9c59f-20cc-462d-8bcd-70f34dcbc813', 'ca1f331c-deb5-4b25-baf4-b0fc1a3ebd04')
