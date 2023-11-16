update contribution.question_messages
set content = '<p>Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. Elles s’appliqueront sauf si une convention ou un accord d’entreprise (ou de groupe, ou d’établissement) existant dans votre entreprise prévoit également des règles sur le même sujet. En effet, dans ce cas, cette convention ou accord s’appliquera, qu’il soit plus ou moins favorable que la convention de branche, sous réserve d’être au moins aussi favorable que le Code du travail. Dans tous les cas, reportez-vous à votre contrat de travail car s’il contient des règles plus favorables, ce sont ces dernières qui s’appliqueront. </p><p>Attention, d’autres règles non étendues peuvent potentiellement vous être applicables.</p>',
content_agreement_unplanned = '<p> Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. </p> <p> D’autres textes ou votre contrat de travail peuvent également prévoir des règles spécifiques sur ce sujet qui s’appliqueront à condition d’être au moins aussi favorables que le Code du travail. </p> <p>Plusieurs cas de figure peuvent se présenter :</p> <ul> <li> si un accord d’entreprise (ou de groupe ou d’établissement) traite de ce sujet : c’est ce texte qui s’appliquera ; </li> <li> dans tous les cas, si le contrat de travail prévoit des règles plus favorables que ces textes : il s’appliquera. </li> </ul> <p> Attention, d’autres règles non étendues peuvent potentiellement vous être applicables. </p>',
content_agreement_unhandled = '<p>Les informations présentes sur cette page sont issues du Code du travail.</p> <p> D’autres textes ou votre contrat de travail peuvent également prévoir des règles spécifiques sur ce sujet qui s’appliqueront à condition d’être au moins aussi favorables que le Code du travail. </p> <p>Plusieurs cas de figure peuvent se présenter :</p> <ul> <li> si un accord d’entreprise (ou de groupe ou d’établissement) traite de ce sujet : c’est ce texte qui s’appliquera ; </li> <li> à défaut, si une convention de branche traite de ce sujet : c’est ce texte qui s’appliquera ; </li> <li> dans tous les cas, si le contrat de travail prévoit des règles plus favorables que ces textes : il s’appliquera. </li> </ul> <p> Attention, d’autres règles non étendues peuvent potentiellement vous être applicables. </p>'
where label = 'Message Bloc 3';

update contribution.questions q
set message_id = qm.id
from contribution.question_messages qm
where qm.label = 'Message Bloc 3'
and q.order = any(ARRAY[23, 15, 19, 7, 37, 46, 38, 44, 8, 52, 53, 6, 35, 10, 39, 20, 42, 18, 1, 33, 36, 29, 47, 14, 41, 26, 34, 43, 50, 45, 55]);

update contribution.question_messages
set content = '<p> Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. Si une convention ou un accord d’entreprise (ou de groupe, ou d’établissement) existant dans votre entreprise prévoit des garanties au moins équivalentes sur le même sujet, elles s’appliqueront, sauf si votre contrat de travail contient des règles plus favorables. </p> <p> Attention, d’autres règles non étendues peuvent potentiellement vous être applicables. </p>',
content_agreement_unplanned = '<p> Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. </p> <p> D’autres textes ou votre contrat de travail peuvent également prévoir des règles spécifiques sur ce sujet. </p> <p>Plusieurs cas de figure peuvent se présenter :</p> <ul> <li> si un accord d’entreprise (ou de groupe ou d’établissement) prévoit des garanties au moins équivalentes sur le même sujet : c’est ce texte qui s’appliquera ; </li> <li> dans tous les cas, si le contrat de travail prévoit des règles plus favorables : il s’appliquera. </li> </ul> <p> Attention, d’autres règles non étendues peuvent potentiellement vous être applicables. </p>',
content_agreement_unhandled = '<p>Les informations présentes sur cette page sont issues du Code du travail.</p> <p> D’autres textes ou votre contrat de travail peuvent également prévoir des règles spécifiques sur ce sujet qui s’appliqueront à condition d’être au moins aussi favorables que le Code du travail. </p> <p>Plusieurs cas de figure peuvent se présenter :</p> <ul> <li> si votre convention de branche prévoit des dispositions sur ce sujet : c’est ce texte qui s’appliquera ; </li> <li> si un accord d’entreprise (ou de groupe ou d’établissement) prévoit des garanties au moins équivalentes sur le même sujet : c’est ce texte qui s’appliquera ; </li> </ul>'
where label = 'Message Bloc 2';

update contribution.questions q
set message_id = qm.id
from contribution.question_messages qm
where qm.label = 'Message Bloc 2'
and q.order = 48;

update contribution.question_messages
set content = '<p>Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. Dans tous les cas, reportez vous à votre contrat de travail car s’il contient des règles plus favorables, ce sont ces dernières qui s’appliqueront.</p>',
content_agreement_unplanned = '<p>Les informations présentes sur cette page sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail. Dans tous les cas, reportez vous à votre contrat de travail car s’il contient des règles plus favorables, ce sont ces dernières qui s’appliqueront.</p>',
content_agreement_unhandled = '<p>Les informations présentes sur cette page sont issues du Code du travail.</p> <p>Si votre convention de branche prévoit des dispositions sur ce sujet : c’est ce texte qui s’appliquera.</p> <p>Dans tous les cas, reportez vous à votre contrat de travail car s’il contient des règles plus favorables, ce sont ces dernières qui s’appliqueront.</p>'
where label = 'Message Domaine exclusif de la branche';

update contribution.questions q
set message_id = qm.id
from contribution.question_messages qm
where qm.label = 'Message Domaine exclusif de la branche'
and q.order = any(ARRAY[4, 9, 12, 17, 16]);