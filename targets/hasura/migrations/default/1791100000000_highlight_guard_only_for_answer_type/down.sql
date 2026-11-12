-- Retour au contrôle sur tous les types de réponse
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

DROP TRIGGER IF EXISTS "forbid_highlight_on_content" ON "contribution"."answers";
CREATE TRIGGER "forbid_highlight_on_content"
  BEFORE UPDATE OF "content" ON "contribution"."answers"
  FOR EACH ROW EXECUTE PROCEDURE "contribution"."forbid_highlight_on_content"();
