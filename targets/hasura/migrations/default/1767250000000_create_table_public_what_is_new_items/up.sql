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

-- One-shot migration from the legacy JSON model (what_is_new_months.weeks) to items-only.
-- This keeps the DB minimal going forward (only items are persisted), while preserving existing content.
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "public"."what_is_new_items") = 0 THEN
    INSERT INTO "public"."what_is_new_items" ("week_start", "kind", "title", "href", "description")
    SELECT
      split_part(week_obj->>'id', '_', 1)::date AS week_start,
      CASE
        WHEN (cat_obj->>'kind') IN ('evolution-juridique', 'mise-a-jour-fonctionnelle')
          THEN (cat_obj->>'kind')
        WHEN (cat_obj->>'label') = 'Mise à jour fonctionnelle'
          THEN 'mise-a-jour-fonctionnelle'
        ELSE 'evolution-juridique'
      END AS kind,
      item_obj->>'title' AS title,
      NULLIF(item_obj->>'href', '') AS href,
      NULLIF(item_obj->>'description', '') AS description
    FROM "public"."what_is_new_months" m
    CROSS JOIN LATERAL jsonb_array_elements(m."weeks") AS week_obj
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(week_obj->'categories', '[]'::jsonb)) AS cat_obj
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(cat_obj->'items', '[]'::jsonb)) AS item_obj
    WHERE (week_obj->>'id') ~ '^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$'
      AND (item_obj->>'title') IS NOT NULL
      AND length(trim(item_obj->>'title')) > 0;
  END IF;
END $$;