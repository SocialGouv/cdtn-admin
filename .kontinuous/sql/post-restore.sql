-- Anonymize users
UPDATE auth.users as u
SET 
  password = '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
  email = u.id || '@travail.gouv.fr',
  name = CONCAT(
    UPPER(SUBSTRING(name FROM 1 FOR 1)),
    CASE
        WHEN POSITION(' ' IN name) > 0 THEN UPPER(SUBSTRING(name FROM POSITION(' ' IN name)+1 FOR 1))
        ELSE ''
    END
  );

-- Add a fake user
INSERT INTO auth.users (email, password, name, role, is_active, id)
VALUES (
    'codedutravailnumerique@travail.gouv.fr',
    '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
    'Administrateur',
    'super',
    TRUE,
    'd8b11bd2-dd16-4632-b5de-0e7021faadeb'
  );

-- Remove all data from audit tables
TRUNCATE audit.logged_actions;

-- Kill all connections !
-- Make all connected services restart !
-- Hasura migration will be re-applyed.
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = '${PGDATABASE}';

