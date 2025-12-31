CREATE TABLE "infographic"."infographic_other_references"
(
  "id"             uuid NOT NULL DEFAULT gen_random_uuid(),
  "infographic_id" uuid NOT NULL,
  "label"          text NOT NULL,
  "url"            text,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("infographic_id") REFERENCES "infographic"."infographic" ("id") ON UPDATE cascade ON DELETE cascade,
  UNIQUE ("id")
);
COMMENT ON TABLE "infographic"."infographic_other_references" IS E'Autres références liées aux infographies';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
