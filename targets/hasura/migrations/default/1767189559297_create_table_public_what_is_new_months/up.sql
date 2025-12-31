CREATE TABLE "public"."what_is_new_months" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "period" text NOT NULL,
  "label" text NOT NULL,
  "short_label" text NOT NULL,
  "weeks" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("period"),
  CHECK ("period" ~ '^[0-9]{2}-[0-9]{4}$')
);

COMMENT ON TABLE "public"."what_is_new_months" IS E'Admin content for the "Quoi de neuf ?" feature (months + weeks JSON).';

CREATE TRIGGER "set_public_what_is_new_months_updated_at"
  BEFORE UPDATE ON "public"."what_is_new_months"
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TRIGGER "set_public_what_is_new_months_updated_at" ON "public"."what_is_new_months" IS 'trigger to set value of column "updated_at" to current timestamp on row update';