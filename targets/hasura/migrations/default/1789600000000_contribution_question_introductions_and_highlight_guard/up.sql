-- Contenus saisis à la création d'une question :
--  * introduction_nothing : introduction affichée avant la réponse CDT pour les CC « ne prévoit rien »
--  * introduction_cdt     : introduction affichée avant la réponse CDT pour les CC « renvoie au CDT »
--  * template_answer      : template proposé pour les CC de type « Afficher la réponse »
ALTER TABLE "contribution"."questions"
  ADD COLUMN "introduction_nothing" text NULL,
  ADD COLUMN "introduction_cdt" text NULL,
  ADD COLUMN "template_answer" text NULL;

COMMENT ON COLUMN "contribution"."questions"."introduction_nothing" IS E'Introduction (HTML) affichée avant la réponse CDT quand la CC ne prévoit rien';
COMMENT ON COLUMN "contribution"."questions"."introduction_cdt" IS E'Introduction (HTML) affichée avant la réponse CDT quand la CC renvoie au Code du travail';
COMMENT ON COLUMN "contribution"."questions"."template_answer" IS E'Template (HTML) proposé comme contenu des réponses de type « Afficher la réponse »';

-- Interdiction du surlignage (balise <mark>) à partir du statut « À valider » (REDACTED).
-- Le surlignage sert uniquement à guider la relecture : il ne doit jamais atteindre la validation / publication.
CREATE OR REPLACE FUNCTION "contribution"."has_highlight"(content text)
RETURNS boolean AS $$
  SELECT content IS NOT NULL AND content ~ '<mark[ >]';
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION "contribution"."is_status_after_redacting"(status text)
RETURNS boolean AS $$
  SELECT status IN ('REDACTED', 'VALIDATING', 'VALIDATED', 'TO_PUBLISH', 'PUBLISHING', 'PUBLISHED');
$$ LANGUAGE sql IMMUTABLE;

-- 1. Passage à un statut >= REDACTED : le contenu de la réponse ne doit pas être surligné.
CREATE OR REPLACE FUNCTION "contribution"."forbid_highlight_on_status"()
RETURNS trigger AS $$
BEGIN
  IF "contribution"."is_status_after_redacting"(NEW.status::text) AND EXISTS (
    SELECT 1
    FROM "contribution"."answers" a
    WHERE a.id = NEW.answer_id
      AND "contribution"."has_highlight"(a.content)
  ) THEN
    RAISE EXCEPTION 'Cette réponse contient des passages surlignés. Relisez-les, adaptez-les puis retirez le surlignage avant de la soumettre.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "forbid_highlight_on_status"
  BEFORE INSERT ON "contribution"."answer_statuses"
  FOR EACH ROW EXECUTE PROCEDURE "contribution"."forbid_highlight_on_status"();

-- 2. Enregistrement d'un contenu surligné sur une réponse dont le statut courant est >= REDACTED.
CREATE OR REPLACE FUNCTION "contribution"."forbid_highlight_on_content"()
RETURNS trigger AS $$
DECLARE
  current_status text;
BEGIN
  IF "contribution"."has_highlight"(NEW.content) THEN
    SELECT s.status::text INTO current_status
    FROM "contribution"."answer_statuses" s
    WHERE s.answer_id = NEW.id
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF current_status IS NOT NULL AND "contribution"."is_status_after_redacting"(current_status) THEN
      RAISE EXCEPTION 'Cette réponse contient des passages surlignés. Relisez-les, adaptez-les puis retirez le surlignage avant de la soumettre.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "forbid_highlight_on_content"
  BEFORE UPDATE OF "content" ON "contribution"."answers"
  FOR EACH ROW EXECUTE PROCEDURE "contribution"."forbid_highlight_on_content"();
