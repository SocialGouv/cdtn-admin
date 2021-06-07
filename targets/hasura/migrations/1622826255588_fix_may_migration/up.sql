--
-- Fix previous alerts migration
--

-- Remove duplicate alerts
DELETE FROM alerts 
where repository = 'socialgouv/kali-data'
and status = 'todo'
and updated_at > created_at
and updated_at::date = '2021-06-04';


-- Update alert info format 
update alerts 
set info =   info - 'title' - 'type' || jsonb_build_object('id', info -> 'title') 
where  info->>'type' = 'vdd' OR info ->>'type' = 'travail-data';

update alerts 
set info =   info - 'title' - 'type' - 'num' - 'file'
where  info->>'type' = 'dila';


--
-- Migrate data 
--
UPDATE "public"."sources" SET tag = 'v2.33.0' WHERE repository = 'socialgouv/legi-data';
UPDATE "public"."sources" SET tag = 'v2.56.0' WHERE repository = 'socialgouv/kali-data';
UPDATE "public"."sources" SET tag = 'v2.84.0' WHERE repository = 'socialgouv/fiches-vdd';
UPDATE "public"."sources" SET tag = 'v4.87.0' WHERE repository = 'socialgouv/fiches-travail-data';
 