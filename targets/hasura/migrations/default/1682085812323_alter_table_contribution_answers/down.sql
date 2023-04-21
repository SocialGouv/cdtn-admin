alter table "contribution"."answers" add column "display_mode" text null;
alter table "contribution"."answers" drop column "other_answer";
