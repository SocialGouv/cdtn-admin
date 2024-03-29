with user_ids as (
  select distinct id
  from auth.users
)
update "auth"."users"
set password = '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
  email = u.id || '@travail.gouv.fr'
from user_ids u
where u.id = users.id;
--
-- DISABLE TRIGGERS
--

ALTER TABLE auth.users DISABLE TRIGGER USER;
WITH admin_row AS (
  INSERT INTO auth.users (email, PASSWORD, name, default_role, active, id)
  VALUES (
      'codedutravailnumerique@travail.gouv.fr',
      '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
      'Administrateur',
      'super',
      TRUE,
      'd8b11bd2-dd16-4632-b5de-0e7021faadeb'
    )
  RETURNING id,
    default_role
)
INSERT INTO auth.user_roles (ROLE, user_id)
SELECT default_role,
  id
FROM admin_row;
WITH admin_row AS (
  INSERT INTO auth.users (email, PASSWORD, name, default_role, active, id)
  VALUES (
      'utilisateur@travail.gouv.fr',
      '$argon2i$v=19$m=4096,t=3,p=1$PqKPf9cxunVLLtEcINHhWQ$CwHKhk71fc8LGp6BWbcFPzQ2ftOiHa7vUkp1eAqVHSM',
      'Utilisateur',
      'user',
      TRUE,
      '3d6dddc4-e117-4772-9288-cd8a608693e4'
    )
  RETURNING id,
    default_role
)
INSERT INTO auth.user_roles (ROLE, user_id)
SELECT default_role,
  id
FROM admin_row;
--
-- create empty audit logs table
--

CREATE TABLE IF NOT EXISTS audit.logged_actions (
  event_id bigserial primary key,
  schema_name text not null,
  table_name text not null,
  relid oid not null,
  session_user_name text,
  hasura_user jsonb,
  action_tstamp_tx TIMESTAMP WITH TIME ZONE NOT NULL,
  action_tstamp_stm TIMESTAMP WITH TIME ZONE NOT NULL,
  action_tstamp_clock TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_id bigint,
  application_name text,
  client_addr inet,
  client_port integer,
  client_query text,
  action TEXT NOT NULL CHECK (action IN ('I', 'D', 'U', 'T')),
  row_data jsonb,
  changed_fields jsonb,
  statement_only boolean not null
);
--
-- ENABLE TRIGGERS
--

ALTER TABLE auth.users ENABLE TRIGGER USER;
--
-- Kill all connections !
-- Make all connected services restart !
-- Hasura migration will be re-applyed.
--

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = '${PGDATABASE}';
