CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "contribution"."answer_kali_references"
add column "id" uuid null unique default gen_random_uuid();
BEGIN TRANSACTION;
ALTER TABLE "contribution"."answer_kali_references" DROP CONSTRAINT "answer_kali_references_pkey";
ALTER TABLE "contribution"."answer_kali_references"
ADD CONSTRAINT "answer_kali_references_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;
alter table "contribution"."answer_kali_references"
add constraint "answer_kali_references_answer_id_article_id_label_key" unique ("answer_id", "article_id", "label");
