alter table "auth"."users" alter column "refresh_token" set default gen_random_uuid();
