DROP TABLE "contribution"."answer_statuses";
alter table "contribution"."answers" add column "status" text
not null default 'TODO';
