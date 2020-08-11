ALTER TABLE "public"."alerts"
  DROP CONSTRAINT IF EXISTS "alerts_ref_info_key";

ALTER TABLE "public"."alerts"
  ADD CONSTRAINT "alerts_ref_info_key" UNIQUE ("ref", "info");

DELETE FROM alerts
WHERE (info -> 'type') IS NULL;
