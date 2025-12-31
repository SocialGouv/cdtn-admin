comment on column "auth"."users"."expires_in" is E'Users table';
alter table "auth"."users" alter column "expires_in" set default now();
alter table "auth"."users" alter column "expires_in" drop not null;
alter table "auth"."users" add column "expires_in" timestamptz;
