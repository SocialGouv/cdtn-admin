alter table "contribution"."answers" add column "updated_at" timestamptz
 not null default now();
