alter table "contribution"."answers" add constraint "answers_question_id_agreement_id_key" unique ("question_id", "agreement_id");
