--
-- Remove old alerts trigger
--

CREATE OR REPLACE FUNCTION public.delete_old_alerts() RETURNS trigger AS $body$
BEGIN
  DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '3 month' AND status IN ('done', 'rejected');
  RETURN NULL;
END;
$body$
LANGUAGE 'plpgsql';

COMMENT ON FUNCTION public.delete_old_alerts() IS $body$
Remove alerts that are older that 3 monthes
$body$;



--
-- Table cleanJob
-- with clean trigger attached to it
-- that will delete old entries
-- we use that to allow hasura cron trigger to to called an api endpoint
-- wich will update this table and trigger the triggers (yes I know)
--

CREATE TABLE public.clean_jobs (
  job text NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.clean_jobs IS $body$
clean_jobs table list when clean jobs are called last
$body$;

INSERT INTO public.clean_jobs(job) VALUES ('logged_actions');
INSERT INTO public.clean_jobs(job) VALUES ('alerts');

-- Adding clean Trigger to table

CREATE TRIGGER logged_actions_delete
AFTER UPDATE ON public.clean_jobs FOR EACH ROW
WHEN (OLD.job = 'logged_actions')
EXECUTE PROCEDURE  audit.delete_old_actions();

CREATE TRIGGER alerts_delete
AFTER UPDATE ON public.clean_jobs FOR EACH ROW
WHEN (OLD.job = 'alerts')
EXECUTE PROCEDURE public.delete_old_alerts();
