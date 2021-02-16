CREATE OR REPLACE FUNCTION delete_old_alerts() RETURNS trigger AS $body$
BEGIN
  DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '3 month';
  RETURN NULL;
END;
$body$
LANGUAGE 'plpgsql';

COMMENT ON FUNCTION delete_old_alerts() IS $body$
Remove alerts that are older that 3 monthes
$body$;

CREATE TRIGGER delete_alerts
    AFTER INSERT OR UPDATE ON alerts
    EXECUTE PROCEDURE delete_old_alerts();
COMMENT ON TRIGGER "delete_alerts" ON alerts
  IS 'trigger to remove alert that older than 3 monthes';
