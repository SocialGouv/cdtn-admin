alter table "contribution"."answers" drop constraint "answers_pkey";
alter table "contribution"."answers"
    add constraint "answers_pkey"
    primary key ("question_id", "id", "agreement_id");
