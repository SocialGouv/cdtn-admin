alter table "contribution"."question_messages" rename column "content_agreement" to "content";
alter table "contribution"."question_messages" rename column "content_legal" to "content_agreement_unhandled";
