
CREATE OR REPLACE VIEW "v1"."kali_data_alerts" AS 
 SELECT alerts.id,
    alerts.info,
    alerts.status,
    alerts.repository,
    alerts.ref,
    alerts.created_at,
    alerts.updated_at
   FROM alerts
  WHERE (alerts.repository = 'socialgouv/kali-data'::text)
  ORDER BY alerts.created_at, alerts.info ->> 'num';

CREATE OR REPLACE VIEW "v1"."fiche_vdd_alerts" AS 
 SELECT alerts.id,
    alerts.info,
    alerts.status,
    alerts.repository,
    alerts.ref,
    alerts.created_at,
    alerts.updated_at
   FROM alerts
  WHERE (alerts.repository = 'socialgouv/fiches-vdd'::text)
  ORDER BY alerts.created_at;

CREATE OR REPLACE VIEW "v1"."legi_data_alerts" AS 
 SELECT alerts.id,
    alerts.info,
    alerts.status,
    alerts.repository,
    alerts.ref,
    alerts.created_at,
    alerts.updated_at
   FROM alerts
  WHERE (alerts.repository = 'socialgouv/legi-data'::text)
  ORDER BY alerts.created_at;
