alter table "auth"."users"
  add constraint "users_default_role_fkey"
  foreign key ("default_role")
  references "public"."roles"
  ("role") on update cascade on delete restrict;
