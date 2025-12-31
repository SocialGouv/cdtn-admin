update contribution.question_messages
set content_legal=REPLACE(content_legal, 'prévoit des garanties au moins équivalentes sur le même', 'traite de ce')
where label = 'Message Bloc 2';
