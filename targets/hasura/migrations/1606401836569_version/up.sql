CREATE TABLE "public"."package_version" ( "repository" text NOT NULL, "version" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("repository")
);

COMMENT ON TABLE "public"."package_version" IS E'tracks git pacakge version for documents';

CREATE TRIGGER "set_public_package_version_updated_at"
  BEFORE UPDATE ON "public"."package_version"
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp ();

COMMENT ON TRIGGER "set_public_package_version_updated_at" ON "public"."package_version" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
