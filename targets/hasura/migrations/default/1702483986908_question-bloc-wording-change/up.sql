update contribution.question_messages
set content_agreement=REPLACE(content_agreement, 'Les informations présentes sur cette page', 'Ces informations'),
content_legal=REPLACE(content_legal, 'Les informations présentes sur cette page', 'Ces informations'),
content_not_handled=REPLACE(content_not_handled, 'Les informations présentes sur cette page', 'Ces informations');
