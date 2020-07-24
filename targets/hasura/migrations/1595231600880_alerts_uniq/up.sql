
alter table "public"."alerts" add constraint "alerts_ref_info_key" unique ("ref", "info");

DELETE FROM alerts where (info -> 'type') is null;
