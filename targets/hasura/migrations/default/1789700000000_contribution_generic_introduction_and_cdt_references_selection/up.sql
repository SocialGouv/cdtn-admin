-- Introduction de la réponse du Code du travail.
-- Propre à la réponse générique (agreement_id = '0000') : utilisée à un seul endroit, elle est portée
-- par la réponse et suit son cycle de vie (statuts, publication). Les introductions partagées entre
-- plusieurs CC restent sur contribution.questions.
ALTER TABLE "contribution"."answers"
  ADD COLUMN "introduction" text NULL;

COMMENT ON COLUMN "contribution"."answers"."introduction" IS E'Introduction (HTML) affichée avant la réponse. Utilisée uniquement par la réponse générique (0000)';

-- Références du Code du travail choisies par une réponse de CC de type « Afficher la réponse ».
-- La référence est identifiée par son URL (celle publiée dans le document de la réponse générique) :
-- les autres références de la réponse générique sont supprimées puis recréées à chaque sauvegarde,
-- leur identifiant n'est donc pas stable.
CREATE TABLE "contribution"."answer_selected_cdt_references" (
  "answer_id" uuid NOT NULL,
  "reference_url" text NOT NULL,
  PRIMARY KEY ("answer_id", "reference_url"),
  FOREIGN KEY ("answer_id") REFERENCES "contribution"."answers"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE "contribution"."answer_selected_cdt_references" IS E'Références de la réponse générique (Code du travail) à ajouter à une réponse de CC « Afficher la réponse »';

SELECT audit.audit_table('contribution.answer_selected_cdt_references'::regclass, true, true);
