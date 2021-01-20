TRUNCATE TABLE "auth"."users" CASCADE;

--
-- DISABLE TRIGGERS
--

SET session_replication_role = REPLICA;

WITH admin_row AS (
INSERT INTO auth.users (email, PASSWORD, name, default_role, active)
    VALUES ('codedutravailnumerique@travail.gouv.fr', '$argon2i$v=19$m=4096,t=3,p=1$n9eoWSv+5sCgc7SjB5hLig$iBQ7NzrHHLkJSku/dCetNs+n/JI1CMdkWaoZsUekLU8', 'Administrateur', 'admin', TRUE)
  RETURNING
    id, default_role)
  INSERT INTO auth.user_roles (ROLE, user_id)
  SELECT
    default_role,
    id
  FROM
    admin_row;

WITH admin_row AS (
INSERT INTO auth.users (email, PASSWORD, name, default_role, active)
    VALUES ('utilisateur@travail.gouv.fr', '$argon2i$v=19$m=4096,t=3,p=1$PqKPf9cxunVLLtEcINHhWQ$CwHKhk71fc8LGp6BWbcFPzQ2ftOiHa7vUkp1eAqVHSM', 'Utilisateur', 'user', TRUE)
  RETURNING
    id, default_role)
  INSERT INTO auth.user_roles (ROLE, user_id)
  SELECT
    default_role,
    id
  FROM
    admin_row;

--
-- ENABLE TRIGGERS
--

SET session_replication_role = DEFAULT;
