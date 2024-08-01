alter table "public"."documents"
  add constraint "documents_export_id_fkey"
  foreign key ("export_id")
  references "public"."export_es_status"
  ("id") on update restrict on delete restrict;
