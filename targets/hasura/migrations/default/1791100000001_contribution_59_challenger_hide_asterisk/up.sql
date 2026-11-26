-- Contribution n°59 (question ae7d8fd5-dbef-44d1-8889-8dd824c96650) : on masque l'astérisque
-- affiché après chaque montant challengé, dans les réponses ET dans les documents déjà publiés.
-- L'attribut est d'abord retiré puis ré-ajouté juste après formule/paramètre (même ordre que
-- tiptap) : la migration est rejouable sans créer de doublon.

CREATE FUNCTION pg_temp.challenger_hide_asterisk(html text) RETURNS text AS $$
  SELECT regexp_replace(
    regexp_replace(html, '\s+data-challenger-hide-asterisk="[^"]*"', '', 'g'),
    '(data-challenger-formula="[^"]*"(\s+data-challenger-parameter="[^"]*")?)',
    '\1 data-challenger-hide-asterisk="true"',
    'g'
  );
$$ LANGUAGE sql IMMUTABLE;

UPDATE contribution.answers
SET content = pg_temp.challenger_hide_asterisk(content)
WHERE question_id = 'ae7d8fd5-dbef-44d1-8889-8dd824c96650'
  AND content LIKE '%data-challenger-formula%';

UPDATE public.documents
SET document = document
  || jsonb_build_object('content', pg_temp.challenger_hide_asterisk(document->>'content'))
  || jsonb_build_object('contentWithGlossary', pg_temp.challenger_hide_asterisk(document->>'contentWithGlossary'))
WHERE source = 'contributions'
  AND document->>'questionId' = 'ae7d8fd5-dbef-44d1-8889-8dd824c96650'
  AND document->>'type' = 'content'
  AND document->>'content' LIKE '%data-challenger-formula%';
