update documents
set initial_id = i.id
from information.informations i
where documents."source" = 'information'
    and documents.title = i.title;
alter table information.informations drop column cdtn_id;
