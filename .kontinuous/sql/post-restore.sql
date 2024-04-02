-- Anonymize users
UPDATE auth.users as u
SET 
  password = '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
  email = u.id || '@travail.gouv.fr',
  name = u.id

-- Disable triggers
ALTER TABLE auth.users DISABLE TRIGGER USER;

-- Add a fake user
INSERT INTO auth.users (email, password, name, role, is_active, id)
VALUES (
    'codedutravailnumerique@travail.gouv.fr',
    '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8',
    'Administrateur',
    'super',
    TRUE,
    'd8b11bd2-dd16-4632-b5de-0e7021faadeb'
  )
    
-- Create empty audit logs
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

-- Enable triggers
ALTER TABLE auth.users ENABLE TRIGGER USER;
