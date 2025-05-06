insert into documents(cdtn_id, initial_id, title, meta_description, source, slug, text, document, is_published, is_searchable, is_available)
values(
    'd8e77197de',
	gen_random_uuid (),
	'Évaluer les risques professionnels (DUERP)',
	'Réalisez en ligne le document unique et le plan d''action de prévention par secteur d''activité ou métier',
	'external',
	'evaluer-les-risques-profesionnels-duerp',
	'Réalisez en ligne le document unique et le plan d''action de prévention par secteur d''activité ou métier',
	'{
        "url": "https://www.inrs.fr/metiers/oira-outil-tpe.html",
        "icon": "FileCheck",
        "action": "Évaluer",
        "description": "Réalisez en ligne le document unique et le plan d''action de prévention par secteur d''activité ou métier",
        "displayTool": true
    }'::jsonb,
    true,
    true,
    true
);