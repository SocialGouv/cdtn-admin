alter table "information"."informations_contents_blocks" alter column "file_id" drop not null;
alter table "information"."informations_contents_blocks" add column "file_id" uuid;
