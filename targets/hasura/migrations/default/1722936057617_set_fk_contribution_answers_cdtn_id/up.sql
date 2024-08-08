alter table "contribution"."answers"
  add constraint "answers_cdtn_id_fkey"
  foreign key ("cdtn_id")
  references "public"."document_exports"
  ("cdtn_id") on update restrict on delete restrict;
