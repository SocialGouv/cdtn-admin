alter table "contribution"."question_messages" rename column "content_agreement_unhandled" to "content_legal";
alter table "contribution"."question_messages" rename column "content" to "content_agreement";
alter table "contribution"."question_messages" rename column "content_agreement_unplanned" to "content_not_handled";
