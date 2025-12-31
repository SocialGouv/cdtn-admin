alter table "contribution"."answers" add column "other_answer" text null;
alter table "contribution"."answers" drop column "display_mode";
