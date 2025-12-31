update contribution.answers a 
set cdtn_id = d.cdtn_id
from documents d
where d.initial_id = a.id::text
and source = 'contributions';