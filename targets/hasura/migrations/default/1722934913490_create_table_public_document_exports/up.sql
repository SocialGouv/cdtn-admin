CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "public"."document_exports" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "export_id" uuid NOT NULL,
    "cdtn_id" text NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("export_id") REFERENCES "public"."export_es_status"("id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("cdtn_id") REFERENCES "public"."documents"("cdtn_id") ON UPDATE restrict ON DELETE restrict,
    UNIQUE ("export_id", "cdtn_id")
);