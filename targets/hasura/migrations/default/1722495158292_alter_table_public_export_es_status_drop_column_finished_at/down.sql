alter table "public"."export_es_status" alter column "finished_at" drop not null;
alter table "public"."export_es_status" add column "finished_at" timestamptz;
