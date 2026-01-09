insert into documents(cdtn_id, initial_id, title, meta_description, source, slug, text, document, is_published, is_searchable, is_available)
values(
    'e2deb4718c',
	'c6485006-9d7e-4caf-8585-1686181493d1',
	'Mes démarches travail',
	'Réalisez vos démarches auprès de l''administration du travail et de l''inspection du travail.',
	'external',
	'mes-demarches-travail',
	'Réalisez vos démarches auprès de l''administration du travail et de l''inspection du travail.',
	'{
        "url": "https://mesdemarches.travail.gouv.fr/",
        "icon": "FileCheck",
        "action": "Évaluer",
        "description": "Réalisez vos démarches auprès de l''administration du travail et de l''inspection du travail.",
        "displayTool": true
    }'::jsonb,
    true,
    true,
    true
);
