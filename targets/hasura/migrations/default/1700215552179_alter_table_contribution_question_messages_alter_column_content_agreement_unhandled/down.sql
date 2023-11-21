alter table "contribution"."question_messages" rename column "content_agreement" to "content";
alter table "contribution"."question_messages" rename column "content_legal" to "content_agreement_unhandled";
alter table "contribution"."question_messages" rename column "content_not_handled" to "content_agreement_unplanned";