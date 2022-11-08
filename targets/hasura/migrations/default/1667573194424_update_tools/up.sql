update documents
set document = document || '{"order":1}'::jsonb
where source = 'outils' and slug = 'indemnite-licenciement';

update documents
set document = document || '{"order":2}'::jsonb
where source = 'outils' and slug = 'preavis-demission';

update documents
set document = document || '{"order":3}'::jsonb
where source = 'outils' and slug = 'simulateur-embauche';

update documents
set document = document || '{"order":4}'::jsonb
where source = 'outils' and slug = 'simulateur-embauche';

update documents
set document = document || '{"order":5}'::jsonb
where source = 'outils' and slug = 'indemnite-precarite';

update documents
set document = document || '{"order":6}'::jsonb
where source = 'outils' and slug = 'preavis-licenciement';

update documents
set document = document || '{"order":7}'::jsonb
where source = 'outils' and slug = 'heures-recherche-emploi';

update documents
set document = document || '{"order":8, "icon":"SearchCC"}'::jsonb
where source = 'outils' and slug = 'convention-collective';

update documents
set document = document || '{"order":9}'::jsonb
where source = 'outils' and slug = 'preavis-retraite';

update documents
set document = document || '{"order":10}'::jsonb
where source = 'outils' and slug = 'procedure-licenciement';
