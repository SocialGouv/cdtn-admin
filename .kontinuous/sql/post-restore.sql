-- Anonymize users
UPDATE auth.users as u
SET 
  password = '$argon2id$v=19$m=65536,t=3,p=4$mId827NijFQET4RdT+sIMA$FVZz/GH6E4Y4PeDbG+823fyXFCcokEtEdE++ZOMbP3I',
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
    '$argon2id$v=19$m=65536,t=3,p=4$mId827NijFQET4RdT+sIMA$FVZz/GH6E4Y4PeDbG+823fyXFCcokEtEdE++ZOMbP3I',
    'Administrateur',
    'super',
    TRUE,
    '8babda41-6001-4665-96f5-c430fddb0c53'
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

