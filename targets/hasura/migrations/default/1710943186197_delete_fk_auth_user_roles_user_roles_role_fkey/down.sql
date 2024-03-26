alter table "auth"."user_roles"
  add constraint "user_roles_role_fkey"
  foreign key ("role")
  references "public"."roles"
  ("role") on update restrict on delete cascade;
