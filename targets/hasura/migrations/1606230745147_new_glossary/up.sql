DROP TABLE "public"."glossary";

CREATE TABLE "public"."glossary"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "term" text NOT NULL,
  "slug" text NOT NULL,
  "definition" text NOT NULL,
  "abbreviations" jsonb NOT NULL DEFAULT jsonb_build_array(),
  "variants" jsonb NOT NULL DEFAULT jsonb_build_array(),
  "references" jsonb NOT NULL DEFAULT jsonb_build_array(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("term"),
  UNIQUE ("slug")
);

CREATE TRIGGER "set_public_glossary_updated_at"
  BEFORE UPDATE ON "public"."glossary"
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TRIGGER "set_public_glossary_updated_at" ON "public"."glossary" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
