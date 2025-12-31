comment on column "auth"."users"."refresh_token" is E'Users table';
alter table "auth"."users" add constraint "users_refresh_token_key" unique (refresh_token);
alter table "auth"."users" alter column "refresh_token" drop not null;
alter table "auth"."users" add column "refresh_token" text;
