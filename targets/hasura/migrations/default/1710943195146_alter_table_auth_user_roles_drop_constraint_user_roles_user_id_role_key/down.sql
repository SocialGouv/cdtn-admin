alter table "auth"."user_roles" add constraint "user_roles_user_id_role_key" unique ("user_id", "role");
