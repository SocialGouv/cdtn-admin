CREATE TABLE "public"."what_is_new_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "week_start" date NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "href" text,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CHECK ("kind" IN ('evolution-juridique', 'mise-a-jour-fonctionnelle'))
);

CREATE INDEX "what_is_new_items_week_start_idx" ON "public"."what_is_new_items" ("week_start");
CREATE INDEX "what_is_new_items_kind_idx" ON "public"."what_is_new_items" ("kind");

COMMENT ON TABLE "public"."what_is_new_items" IS E'Admin content for the "Quoi de neuf ?" feature (items only; months/weeks are derived).';

CREATE TRIGGER "set_public_what_is_new_items_updated_at"
  BEFORE UPDATE ON "public"."what_is_new_items"
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TRIGGER "set_public_what_is_new_items_updated_at" ON "public"."what_is_new_items" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

