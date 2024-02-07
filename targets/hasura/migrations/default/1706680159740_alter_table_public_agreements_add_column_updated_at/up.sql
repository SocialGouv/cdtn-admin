alter table "public"."agreements" add column "updated_at" timestamp
 not null default now();
