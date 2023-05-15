alter table "auth"."users" add column "deleted" boolean
 not null default 'false';
