CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "contribution"."answer_legi_references"
add column "id" uuid null unique default gen_random_uuid();
BEGIN TRANSACTION;
ALTER TABLE "contribution"."answer_legi_references" DROP CONSTRAINT "answer_legi_references_pkey";
ALTER TABLE "contribution"."answer_legi_references"
ADD CONSTRAINT "answer_legi_references_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;
alter table "contribution"."answer_legi_references"
add constraint "answer_legi_references_answer_id_article_id_label_key" unique ("answer_id", "article_id");
