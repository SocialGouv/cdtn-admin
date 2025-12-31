alter table "public"."document_exports" drop constraint "document_exports_export_id_fkey",
  add constraint "document_exports_export_id_fkey"
  foreign key ("export_id")
  references "public"."export_es_status"
  ("id") on update cascade on delete cascade;
