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
