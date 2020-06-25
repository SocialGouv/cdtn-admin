
CREATE TABLE "public"."alert_status"("name" text NOT NULL DEFAULT 'new', PRIMARY KEY ("name") );
COMMENT ON TABLE "public"."alert_status" IS E'alert statuses';

INSERT INTO public.alert_status (name) VALUES ('todo');
INSERT INTO public.alert_status (name) VALUES ('doing');
INSERT INTO public.alert_status (name) VALUES ('done');
INSERT INTO public.alert_status (name) VALUES ('rejected');

CREATE TABLE "public"."sources"(
  "repository" text NOT NULL,
  "label" text NOT NULL,
  "tag" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("repository")
);

COMMENT ON TABLE "public"."sources" IS E'sources are git repository that acts  as data sources to track changes';

INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/legi-data', 'code du travail', 'v1.16.0');
INSERT INTO public.sources (repository, label, tag) VALUES ('socialgouv/kali-data', 'conventions collectives', 'v1.72.0');

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
