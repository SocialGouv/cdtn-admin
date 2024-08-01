comment on column "public"."documents"."export_id" is E'contains all the documents for cdtn website';
alter table "public"."documents" alter column "export_id" drop not null;
alter table "public"."documents" add column "export_id" uuid;
