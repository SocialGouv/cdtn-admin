alter table "information"."informations_contents_blocks" alter column "img_id" drop not null;
alter table "information"."informations_contents_blocks" add column "img_id" uuid;
