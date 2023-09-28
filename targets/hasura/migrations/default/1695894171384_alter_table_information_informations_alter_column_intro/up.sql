alter table "information"."informations"
alter column "intro" drop not null;
alter table "public"."files"
alter column "alt_text" drop not null;
alter table "public"."files"
alter column "size" drop not null;
