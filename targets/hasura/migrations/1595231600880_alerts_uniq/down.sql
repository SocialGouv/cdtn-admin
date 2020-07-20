
SELECT
  repository,
  info -> 'title' AS title,
  info -> 'type' AS TYPE
FROM
  alerts

alter table "public"."alerts" drop constraint "alerts_ref_info_key";
