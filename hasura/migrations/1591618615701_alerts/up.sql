
CREATE TABLE "public"."status"("name" text NOT NULL DEFAULT 'new', PRIMARY KEY ("name") );
COMMENT ON TABLE "public"."status" IS E'alert statuses';

INSERT INTO public.status (name) VALUES ('todo');
INSERT INTO public.status (name) VALUES ('doing');
INSERT INTO public.status (name) VALUES ('done');
INSERT INTO public.status (name) VALUES ('rejected');

CREATE TABLE "public"."sources"(
  "repository" text NOT NULL,
  "tag" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("repository")
);

COMMENT ON TABLE "public"."sources" IS E'sources are git repository that acts  as data sources to track changes';

INSERT INTO public.sources (repository, tag) VALUES ('@socialgouv/legi-data', 'v1.9.0');
INSERT INTO public.sources (repository, tag) VALUES ('@socialgouv/kalilegi-data', 'v1.60.0');

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."alerts"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "file" bpchar NOT NULL, "status" bpchar NOT NULL DEFAULT 'todo', "repository" bpchar NOT NULL, "diff" jsonb NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("status") REFERENCES "public"."status"("name") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("repository") REFERENCES "public"."sources"("repository") ON UPDATE restrict ON DELETE cascade); COMMENT ON TABLE "public"."alerts" IS E'alerts reprensent a change in a text from a source';
