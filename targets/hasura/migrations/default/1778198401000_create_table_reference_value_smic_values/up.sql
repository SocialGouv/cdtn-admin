CREATE TABLE "reference_value"."smic_values" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "hourly_value" numeric(10, 4) NOT NULL,
  "application_date" date NOT NULL,
  "note" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "created_by" text,
  PRIMARY KEY ("id")
);
COMMENT ON TABLE "reference_value"."smic_values" IS E'Historique des valeurs du SMIC horaire brut';
