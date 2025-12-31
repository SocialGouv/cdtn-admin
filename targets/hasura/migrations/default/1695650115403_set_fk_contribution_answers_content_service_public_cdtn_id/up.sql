alter table "contribution"."answers"
  add constraint "answers_content_service_public_cdtn_id_fkey"
  foreign key ("content_service_public_cdtn_id")
  references "public"."documents"
  ("cdtn_id") on update restrict on delete restrict;
