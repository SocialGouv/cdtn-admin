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
)

