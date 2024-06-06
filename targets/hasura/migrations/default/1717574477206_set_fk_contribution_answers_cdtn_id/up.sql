alter table "contribution"."answers"
  add constraint "answers_cdtn_id_fkey"
  foreign key ("cdtn_id")
  references "public"."documents"
  ("cdtn_id") on update set null on delete set null;
