CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "auth"."users" add column "access_token" uuid
 null default gen_random_uuid();
