alter table "auth"."users" drop constraint "users_refresh_token_key";
alter table "auth"."users" alter column "refresh_token" set not null;
