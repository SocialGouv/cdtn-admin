ALTER TABLE "auth"."users" ALTER COLUMN "access_token" TYPE text;
ALTER TABLE "auth"."users" ALTER COLUMN "access_token" drop default;
alter table "auth"."users" add constraint "users_access_token_key" unique ("access_token");
