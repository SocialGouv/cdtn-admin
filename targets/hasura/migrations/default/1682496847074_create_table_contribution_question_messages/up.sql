CREATE TABLE "contribution"."question_messages" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "label" text NOT NULL,
  "content" text NOT NULL,
  UNIQUE ("id"),
  UNIQUE ("label")
);
COMMENT ON TABLE "contribution"."question_messages" IS E'Contient les messages à afficher dans les réponses pour chaque question (appelé également bloc)';
