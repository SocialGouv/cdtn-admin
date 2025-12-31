alter table "information"."informations_contents_blocks"
  add constraint "informations_contents_blocks_file_id_fkey"
  foreign key ("file_id")
  references "public"."files"
  ("id") on update cascade on delete cascade;
