alter table "infographic"."infographic_other_references" drop constraint "infographic_other_references_infographic_id_fkey",
  add constraint "infographic_other_references_infographic_id_fkey"
  foreign key ("infographic_id")
  references "infographic"."infographic"
  ("id") on update cascade on delete cascade;
