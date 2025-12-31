alter table "contribution"."answer_kali_references" drop constraint "answer_kali_references_answer_id_article_id_label_key";
alter table "contribution"."answer_kali_references" drop constraint "answer_kali_references_pkey";
alter table "contribution"."answer_kali_references"
add constraint "answer_kali_references_pkey" primary key ("article_id", "answer_id");
alter table "contribution"."answer_kali_references" drop column "id" cascade
alter table "contribution"."answer_kali_references" drop column "id";
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
