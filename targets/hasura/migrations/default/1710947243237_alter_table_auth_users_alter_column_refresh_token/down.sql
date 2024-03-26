alter table "auth"."users" alter column "refresh_token" set default public.gen_random_uuid();
