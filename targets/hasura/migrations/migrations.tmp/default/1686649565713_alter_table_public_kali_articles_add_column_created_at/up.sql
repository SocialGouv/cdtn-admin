alter table "public"."kali_articles" add column "created_at" timestamptz
 null default now();
