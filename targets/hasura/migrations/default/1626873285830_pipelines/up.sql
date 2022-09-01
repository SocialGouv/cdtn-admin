
 
CREATE TABLE IF NOT EXISTS "public"."pipelines"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(), 
  "pipeline_id" Text NOT NULL, 
  "user_id" uuid NOT NULL, 
  "environment" text NOT NULL DEFAULT 'preprod', 
  "status" text NOT NULL DEFAULT 'pending', 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "updated_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("id") , 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") 
    ON UPDATE restrict ON DELETE cascade, 
  UNIQUE ("pipeline_id")
); 
COMMENT ON TABLE "public"."pipelines" IS E'track environment data update';

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "set_public_pipelines_updated_at" on "public"."pipelines";
CREATE TRIGGER "set_public_pipelines_updated_at"
BEFORE UPDATE ON "public"."pipelines"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_pipelines_updated_at" ON "public"."pipelines" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

 