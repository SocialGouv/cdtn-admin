alter table "auth"."user_roles"
  add constraint "user_roles_user_id_fkey"
  foreign key ("user_id")
  references "auth"."users"
  ("id") on update restrict on delete cascade;
