comment on column "public"."documents"."export_id" is E'contains all the documents for cdtn website';
alter table "public"."documents"
  add constraint "documents_export_id_fkey"
  foreign key (export_id)
  references "public"."export_es_status"
  (id) on update restrict on delete restrict;
alter table "public"."documents" alter column "export_id" drop not null;
alter table "public"."documents" add column "export_id" uuid;
