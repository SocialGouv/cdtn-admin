update contribution.question_messages set content_legal = '<p>Les informations présentes sur cette page sont issues du Code du travail.</p>
<p>
  D’autres textes ou votre contrat de travail peuvent également prévoir des
  règles spécifiques sur ce sujet qui s’appliqueront à condition d’être au moins
  aussi favorables que le Code du travail.
</p>
<p>Plusieurs cas de figure peuvent se présenter :</p>
<ul>
  <li>
    si seul un accord d’entreprise (ou de groupe ou d’établissement) traite de
    ce sujet : c’est ce texte qui s’appliquera ;
  </li>
  <li>
    si seule une convention de branche traite de ce sujet : c’est ce texte qui
    s’appliquera ;
  </li>
  <li>
    si à la fois une convention de branche et un accord d’entreprise traitent de
    ce sujet : c’est l’accord d’entreprise qui s’appliquera ;
  </li>
</ul>
<p>
  Attention, d’autres règles non étendues peuvent potentiellement vous être
  applicables.
</p>
'
where label = 'Message Bloc 3';

update contribution.question_messages set content_agreement = '<p>
  Les informations présentes sur cette page sont issues de l’analyse des règles
  prévues par votre convention collective de branche étendue et par le Code du
  travail.
</p>
<p>
  D’autres textes ou votre contrat de travail peuvent également prévoir des
  règles spécifiques sur ce sujet. Plusieurs cas de figure peuvent se présenter
  :
</p>
<ul>
  <li>
    si un accord d’entreprise (ou de groupe ou d’établissement) traite de ce
    sujet : c’est ce texte qui s’appliquera ;
  </li>
  <li>
    dans tous les cas, si le contrat de travail prévoit des règles plus
    favorables : il s’appliquera.
  </li>
</ul>
<p>
  Attention, d’autres règles non étendues peuvent potentiellement vous être
  applicables.
</p>
',
content_not_handled = '<p>Les informations présentes sur cette page sont issues du Code du travail.</p>
<p>
  D’autres textes ou votre contrat de travail peuvent également prévoir des
  règles spécifiques sur ce sujet qui s’appliqueront à condition d’être au moins
  aussi favorables que le Code du travail.
</p>
<p>Plusieurs cas de figure peuvent se présenter :</p>
<ul>
  <li>
    si votre convention de branche prévoit des dispositions sur ce sujet : c’est
    ce texte qui s’appliquera ;
  </li>
  <li>
    si un accord d’entreprise (ou de groupe ou d’établissement) prévoit des
    garanties au moins équivalentes que celles prévues par la convention de
    branche sur le même sujet : c’est ce texte qui s’appliquera ;
  </li>
  <li>
    dans tous les cas, si le contrat de travail prévoit des règles plus
    favorables que ces textes : il s’appliquera.
  </li>
</ul>
<p>
  Attention, d’autres règles non étendues peuvent potentiellement vous être
  applicables.
</p>
'
where label = 'Message Bloc 2';
