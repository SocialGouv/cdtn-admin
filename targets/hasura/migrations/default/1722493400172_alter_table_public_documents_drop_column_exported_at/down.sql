comment on column "public"."documents"."exported_at" is E'contains all the documents for cdtn website';
alter table "public"."documents" alter column "exported_at" drop not null;
alter table "public"."documents" add column "exported_at" timestamptz;
