-- Le contrôle du surlignage ne concerne que les réponses de type « Afficher la réponse » (ANSWER) :
-- c'est le seul type dont le contenu est publié. Pour les autres types (renvoie au Code du travail,
-- ne prévoit rien, moins favorable, pas de réponse, fiche SP…), `content` n'est qu'un reste d'un
-- ancien type (ex. : template surligné) qui n'est jamais publié, il ne doit pas bloquer la soumission.

-- 1. Passage à un statut >= REDACTED
CREATE OR REPLACE FUNCTION "contribution"."forbid_highlight_on_status"()
RETURNS trigger AS $$
BEGIN
  IF "contribution"."is_status_after_redacting"(NEW.status::text) AND EXISTS (
    SELECT 1
    FROM "contribution"."answers" a
    WHERE a.id = NEW.answer_id
      AND a.content_type = 'ANSWER'
      AND "contribution"."has_highlight"(a.content)
  ) THEN
    RAISE EXCEPTION 'Cette réponse contient des passages surlignés. Relisez-les, adaptez-les puis retirez le surlignage avant de la soumettre.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Enregistrement d'un contenu surligné (ou changement de type vers ANSWER) sur une réponse
--    dont le statut courant est >= REDACTING
CREATE OR REPLACE FUNCTION "contribution"."forbid_highlight_on_content"()
RETURNS trigger AS $$
DECLARE
  current_status text;
BEGIN
  IF NEW.content_type = 'ANSWER' AND "contribution"."has_highlight"(NEW.content) THEN
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

-- Le déclencheur écoute aussi `content_type` : repasser une réponse surlignée en « Afficher la réponse »
-- alors qu'elle est déjà soumise doit être refusé.
DROP TRIGGER IF EXISTS "forbid_highlight_on_content" ON "contribution"."answers";
CREATE TRIGGER "forbid_highlight_on_content"
  BEFORE UPDATE OF "content", "content_type" ON "contribution"."answers"
  FOR EACH ROW EXECUTE PROCEDURE "contribution"."forbid_highlight_on_content"();
