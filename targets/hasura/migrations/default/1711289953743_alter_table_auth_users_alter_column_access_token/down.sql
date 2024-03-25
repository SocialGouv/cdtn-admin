alter table "auth"."users" drop constraint "users_access_token_key";
alter table "auth"."users" alter column "access_token" set default gen_random_uuid();
ALTER TABLE "auth"."users" ALTER COLUMN "access_token" TYPE uuid;
