alter table "information"."informations_contents_blocks"
  add constraint "informations_contents_blocks_img_id_fkey"
  foreign key ("img_id")
  references "public"."files"
  ("id") on update cascade on delete cascade;
