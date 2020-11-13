--
-- Migrate data
-- Replace all "type" by "source" in documents key of json changes
--
UPDATE public.alerts
   SET changes = jsonb_set(changes, '{documents}'::text[], replace((changes -> 'documents')::text, '"source"', '"type"')::jsonb , false)
   WHERE changes->>'documents' is not null;
