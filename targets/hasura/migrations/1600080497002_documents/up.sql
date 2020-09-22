CREATE TABLE "public"."documents" ( 
  "cdtn_id" text NOT NULL, 
  "initial_id" text NOT NULL, 
  "title" text NOT NULL, 
  "meta_description" text NOT NULL, 
  "source" text NOT NULL, 
  "slug" text NOT NULL, 
  "text" text NOT NULL, 
  "document" jsonb NOT NULL, 
  "is_published" boolean NOT NULL DEFAULT TRUE, 
  "is_searchable" boolean NOT NULL DEFAULT TRUE, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "updated_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("cdtn_id"),
  UNIQUE ("initial_id", "source")
);

COMMENT ON TABLE "public"."documents" IS E'contains all the documents for cdtn website';

CREATE TRIGGER "set_public_documents_updated_at"
  BEFORE UPDATE ON "public"."documents"
  FOR EACH ROW
  EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();

COMMENT ON TRIGGER "set_public_documents_updated_at" ON "public"."documents" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
