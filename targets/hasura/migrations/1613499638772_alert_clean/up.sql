CREATE OR REPLACE FUNCTION delete_old_alerts() RETURNS trigger AS $body$
BEGIN
  DELETE FROM alerts WHERE created_at < NOW() - TG_ARGV[0]::integer * interval'1 month' AND status IN ('done', 'rejected');
  RETURN NULL;
END;
$body$
LANGUAGE 'plpgsql';

COMMENT ON FUNCTION delete_old_alerts() IS $body$
Remove alerts that are older that a given duration

Arguments:
  duration: duration in month until alerts are dropped
$body$;

CREATE TRIGGER delete_alerts AFTER INSERT OR UPDATE ON alerts
FOR EACH STATEMENT EXECUTE PROCEDURE delete_old_alerts(3);

COMMENT ON TRIGGER "delete_alerts" ON alerts
  IS 'trigger to remove alert that older than 3 monthes';
