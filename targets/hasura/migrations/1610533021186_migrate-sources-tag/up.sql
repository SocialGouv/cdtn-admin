--
-- Migrate data
-- Update tag field of sources table 
--

UPDATE "public"."sources" SET tag = 'v2.24.0' WHERE repository = 'socialgouv/legi-data';
UPDATE "public"."sources" SET tag = 'v2.31.0' WHERE repository = 'socialgouv/kali-data';
UPDATE "public"."sources" SET tag = 'v2.55.0' WHERE repository = 'socialgouv/fiches-vdd';
UPDATE "public"."sources" SET tag = 'v4.37.0' WHERE repository = 'socialgouv/fiches-travail-data';
