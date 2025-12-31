BEGIN TRANSACTION;
ALTER TABLE "contribution"."answers" DROP CONSTRAINT "answers_pkey";

ALTER TABLE "contribution"."answers"
    ADD CONSTRAINT "answers_pkey" PRIMARY KEY ("question_id", "agreement_id", "id");
COMMIT TRANSACTION;
