CREATE SCHEMA v1;

CREATE VIEW v1.legi_alerts AS
SELECT
  id,
  info,
  status,
  repository,
  ref,
  created_at,
  updated_at
FROM
  alerts
WHERE
  repository = 'socialgouv/legi-data';

CREATE VIEW v1.kali_alerts AS
SELECT
  id,
  info,
  status,
  repository,
  ref,
  created_at,
  updated_at
FROM
  alerts
WHERE
  repository = 'socialgouv/legi-data';

CREATE VIEW v1.fiche_vdd_alerts AS
SELECT
  id,
  info,
  status,
  repository,
  ref,
  created_at,
  updated_at
FROM
  alerts
WHERE
  repository = 'socialgouv/fiches-vdd';

INSERT INTO public.sources (repository, label, tag)
  VALUES ('socialgouv/fiches-vdd', 'fiches service-public', 'v1.125.0');
