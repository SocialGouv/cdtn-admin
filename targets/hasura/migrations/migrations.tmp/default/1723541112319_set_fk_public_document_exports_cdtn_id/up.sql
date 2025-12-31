alter table "public"."document_exports" drop constraint "document_exports_cdtn_id_fkey",
  add constraint "document_exports_cdtn_id_fkey"
  foreign key ("cdtn_id")
  references "public"."documents"
  ("cdtn_id") on update cascade on delete cascade;
