UPDATE information.informations_contents_blocks
SET content = regexp_replace(
    regexp_replace(
        regexp_replace(
            regexp_replace(content, '<h3([^>]*)>', '<span class="title"\1>', 'gi'),
            '</h3>', '</span>', 'gi'
        ),
        '<h4([^>]*)>', '<span class="sub-title"\1>', 'gi'
    ),
    '</h4>', '</span>', 'gi'
);

UPDATE documents
SET document = document || jsonb_build_object(
    'content',
    regexp_replace(
        regexp_replace(
            regexp_replace(
                regexp_replace(document ->> 'content', '<h3([^>]*)>', '<span class="title"\1>', 'gi'),
                '</h3>', '</span>', 'gi'
            ),
            '<h4([^>]*)>', '<span class="sub-title"\1>', 'gi'
        ),
        '</h4>', '</span>', 'gi'
    )
) where source = 'information';