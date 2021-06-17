--
-- Migrate data
-- Update tag field of sources table 
--
UPDATE "public"."sources" SET tag = 'v2.33.0' WHERE repository = 'socialgouv/legi-data';
UPDATE "public"."sources" SET tag = 'v2.56.0' WHERE repository = 'socialgouv/kali-data';
UPDATE "public"."sources" SET tag = 'v2.85.0' WHERE repository = 'socialgouv/fiches-vdd';
UPDATE "public"."sources" SET tag = 'v4.75.0' WHERE repository = 'socialgouv/fiches-travail-data';

