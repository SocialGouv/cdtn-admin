-- remplace tous les H4 par H3 si pas de H3 présent
UPDATE contribution.answers
SET content =  REPLACE(
    REPLACE(content, '<h4>', '<h3>'),
    '</h4>',
    '</h3>'
)
WHERE "content" LIKE '%<h4%'
AND "content" NOT LIKE '%<h3%'

-- idem dans la table documents pour les docs déjà publiés
UPDATE public.documents
SET document = jsonb_set(
    document,
    '{content}',
    to_jsonb(
      REPLACE(
        REPLACE("document"->>'content', '<h4>', '<h3>'),
        '</h4>',
        '</h3>'
      )
    )
)
WHERE source = 'contributions'
AND "document"->>'idcc' IS NOT NULL
AND "document"->>'content' IS NOT NULL
AND "document"->>'content' LIKE '%<h4%'
AND "document"->>'content' NOT LIKE '%<h3%'

-- remplace tous les H3 par des "titles" et les h4 par des "sub-title"
UPDATE contribution.answers
SET content = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(content, '<h3>', '<span class="title">'),
            '</h3>',
            '</span>'
        ),
        '<h4>',
        '<span class="sub-title">'
    ),
    '</h4>',
    '</span>'
);

-- idem dans la table documents pour les docs déjà publiés
UPDATE public.documents
SET document = jsonb_set(
    document,
    '{content}',
    to_jsonb(
	    REPLACE(
		    REPLACE(
		        REPLACE(
		            REPLACE("document"->>'content', '<h3>', '<span class="title">'),
		            '</h3>',
		            '</span>'
		        ),
		        '<h4>',
		        '<span class="sub-title">'
		    ),
		    '</h4>',
		    '</span>'
		)
    )
)
WHERE source = 'contributions'
AND "document"->>'idcc' IS NOT NULL
AND "document"->>'content' IS NOT NULL;
