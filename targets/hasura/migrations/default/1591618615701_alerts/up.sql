-- 
-- Alert Status 
-- 
CREATE TABLE "public"."alert_status"(
  "name" text NOT NULL DEFAULT 'new', 
  PRIMARY KEY ("name") 
);
COMMENT ON TABLE "public"."alert_status" IS E'alert statuses';

INSERT INTO public.alert_status (name) VALUES ('todo');
INSERT INTO public.alert_status (name) VALUES ('doing');
INSERT INTO public.alert_status (name) VALUES ('done');
INSERT INTO public.alert_status (name) VALUES ('rejected');

-- 
-- Alert Sources 
-- 
CREATE TABLE "public"."sources"(
  "repository" text NOT NULL,
  "label" text NOT NULL,
  "tag" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("repository")
);
COMMENT ON TABLE "public"."sources" IS E'sources are git repository that acts  as data sources to track changes';

INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/legi-data', 'Code du travail', 'v1.33.0');
INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/kali-data', 'Conventions collectives', 'v1.102.0');
INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/fiches-vdd', 'Fiches service-public', 'v1.147.0');
INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/fiches-travail-data', 'Fiches travail-emploi', 'v3.197.0');

-- 
-- Alerts
--
CREATE TABLE "public"."alerts"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "info" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'todo',
  "repository" text NOT NULL,
  "ref" text NOT NULL,
  "changes" jsonb NOT NULL,
  "created_at" timestamptz NULL DEFAULT now(),
  "updated_at" timestamptz NULL DEFAULT now(),
  PRIMARY KEY ("id") ,
  CONSTRAINT "alerts_ref_info_key" UNIQUE ("ref", "info"),
  FOREIGN KEY ("status") REFERENCES "public"."alert_status"("name") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("repository") REFERENCES "public"."sources"("repository") ON UPDATE restrict ON DELETE cascade);

COMMENT ON TABLE "public"."alerts" IS
  E'alerts reprensent a change in a text from a source';

CREATE TRIGGER "set_public_alerts_updated_at"
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

COMMENT ON TRIGGER "set_public_alerts_updated_at" ON public.alerts
  IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- 
-- Notes 
-- 
CREATE TABLE "public"."alert_notes" ( 
  "id" uuid NOT NULL DEFAULT gen_random_uuid (), 
  "message" text NOT NULL, 
  "user_id" uuid NOT NULL, 
  "alert_id" uuid NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("id"), 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY ("alert_id") REFERENCES "public"."alerts" ("id") ON UPDATE RESTRICT ON DELETE CASCADE
);

COMMENT ON TABLE "public"."alert_notes" IS E'alert notes';

--
-- Creating view
--
CREATE SCHEMA v1;

CREATE OR REPLACE VIEW "v1"."kali_data_alerts" AS
SELECT
  alerts.id,
  alerts.info,
  alerts.status,
  alerts.repository,
  alerts.ref,
  alerts.created_at,
  alerts.updated_at
FROM
  alerts
WHERE (alerts.repository = 'socialgouv/kali-data'::text)
ORDER BY
  alerts.created_at DESC,
  alerts.info ->> 'num';

CREATE OR REPLACE VIEW "v1"."fiches_vdd_alerts" AS
SELECT
  alerts.id,
  alerts.info,
  alerts.status,
  alerts.repository,
  alerts.ref,
  alerts.created_at,
  alerts.updated_at
FROM
  alerts
WHERE (alerts.repository = 'socialgouv/fiches-vdd'::text)
ORDER BY
  alerts.created_at DESC;

CREATE OR REPLACE VIEW "v1"."legi_data_alerts" AS
SELECT
  alerts.id,
  alerts.info,
  alerts.status,
  alerts.repository,
  alerts.ref,
  alerts.created_at,
  alerts.updated_at
FROM
  alerts
WHERE (alerts.repository = 'socialgouv/legi-data'::text)
ORDER BY
  alerts.created_at DESC;


CREATE OR REPLACE VIEW "v1"."fiches_travail_data_alerts" AS
SELECT
  alerts.id,
  alerts.info,
  alerts.status,
  alerts.repository,
  alerts.ref,
  alerts.created_at,
  alerts.updated_at
FROM
  alerts
WHERE (alerts.repository = 'socialgouv/fiches-travail-data'::text)
ORDER BY
  alerts.created_at DESC;
