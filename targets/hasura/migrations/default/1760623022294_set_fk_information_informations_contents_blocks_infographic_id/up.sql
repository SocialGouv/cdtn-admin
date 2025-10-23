alter table "information"."informations_contents_blocks"
  add constraint "informations_contents_blocks_infographic_id_fkey"
  foreign key ("infographic_id")
  references "infographic"."infographic"
  ("id") on update restrict on delete restrict;
