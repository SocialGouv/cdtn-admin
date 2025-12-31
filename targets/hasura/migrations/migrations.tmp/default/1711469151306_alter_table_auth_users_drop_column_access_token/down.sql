comment on column "auth"."users"."access_token" is E'Users table';
alter table "auth"."users" add constraint "users_access_token_key" unique (access_token);
alter table "auth"."users" alter column "access_token" drop not null;
alter table "auth"."users" add column "access_token" text;
