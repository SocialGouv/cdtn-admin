CREATE FUNCTION pg_temp.challenger_show_asterisk(html text) RETURNS text AS $$
  SELECT regexp_replace(html, '\s+data-challenger-hide-asterisk="[^"]*"', '', 'g');
$$ LANGUAGE sql IMMUTABLE;

UPDATE contribution.answers
SET content = pg_temp.challenger_show_asterisk(content)
WHERE question_id = 'ae7d8fd5-dbef-44d1-8889-8dd824c96650'
  AND content LIKE '%data-challenger-hide-asterisk%';

UPDATE public.documents
SET document = document
  || jsonb_build_object('content', pg_temp.challenger_show_asterisk(document->>'content'))
  || jsonb_build_object('contentWithGlossary', pg_temp.challenger_show_asterisk(document->>'contentWithGlossary'))
WHERE source = 'contributions'
  AND document->>'questionId' = 'ae7d8fd5-dbef-44d1-8889-8dd824c96650'
  AND document->>'type' = 'content'
  AND document->>'content' LIKE '%data-challenger-hide-asterisk%';
