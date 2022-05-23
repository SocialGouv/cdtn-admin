CREATE SCHEMA contrib;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS contrib.agreements (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  name text NOT NULL,
  idcc character(4) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  parent_id uuid,
  PRIMARY KEY(id)
  );

ALTER TABLE IF EXISTS contrib.agreements
  ADD CONSTRAINT agreements_parent_id_fkey
  FOREIGN KEY (parent_id)
  REFERENCES contrib.agreements (id)
  ON DELETE SET NULL;

CREATE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

RETURN NEW;
END
  $$ LANGUAGE plpgsql;

CREATE TRIGGER update_updated_at
  BEFORE UPDATE ON contrib.agreements
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS contrib.locations (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  name character varying(255) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY(id)
  );

CREATE SEQUENCE contrib.locations_agreements_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE TABLE IF NOT EXISTS contrib.locations_agreements (
  id integer DEFAULT nextval('contrib.locations_agreements_id_seq'::regclass) NOT NULL,
  location_id uuid NOT NULL,
  agreement_id uuid NOT NULL,
  PRIMARY KEY(id)
  );

ALTER TABLE IF EXISTS contrib.locations_agreements
  ADD CONSTRAINT locations_agreements_agreement_id_fkey
  FOREIGN KEY (agreement_id)
  REFERENCES contrib.agreements (id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS contrib.locations_agreements
  ADD CONSTRAINT locations_agreements_location_id_fkey
  FOREIGN KEY (location_id)
  REFERENCES contrib.locations (id)
  ON DELETE CASCADE;

CREATE SEQUENCE contrib.questions_index_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE TABLE IF NOT EXISTS contrib.questions (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  "value" text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  "index" integer DEFAULT nextval('contrib.questions_index_seq'::regclass) NOT NULL,
  PRIMARY KEY(id)
  );

CREATE TABLE IF NOT EXISTS contrib.answers (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  "value" text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  parent_id uuid,
  question_id uuid,
  agreement_id uuid,
  user_id uuid,
  generic_reference text,
  state text DEFAULT 'todo',
  prevalue text DEFAULT ''::text NOT NULL,
  PRIMARY KEY(id)
  );

ALTER TABLE IF EXISTS contrib.answers
  ADD CONSTRAINT answers_agreement_id_fkey
  FOREIGN KEY (agreement_id)
  REFERENCES contrib.agreements (id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS contrib.answers
  ADD CONSTRAINT answers_parent_id_fkey
  FOREIGN KEY (parent_id)
  REFERENCES contrib.answers (id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS contrib.answers
  ADD CONSTRAINT answers_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users (id)
  ON DELETE SET NULL;

ALTER TABLE IF EXISTS contrib.answers
  ADD CONSTRAINT answers_question_id_fkey
  FOREIGN KEY (question_id)
  REFERENCES contrib.questions (id)
  ON DELETE CASCADE;

CREATE SEQUENCE contrib.answers_comments_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE TABLE IF NOT EXISTS contrib.answers_comments (
  id integer DEFAULT nextval('contrib.answers_comments_id_seq'::regclass) NOT NULL,
  "value" text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  answer_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_private boolean DEFAULT false NOT NULL,
  PRIMARY KEY(id)
  );

ALTER TABLE IF EXISTS contrib.answers_comments
  ADD CONSTRAINT answers_comments_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users (id);

ALTER TABLE IF EXISTS contrib.answers_comments
  ADD CONSTRAINT answers_comments_answer_id_fkey
  FOREIGN KEY (answer_id)
  REFERENCES contrib.answers (id);

CREATE TABLE IF NOT EXISTS contrib.answers_references (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  category text,
  "value" text NOT NULL,
  url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  answer_id uuid NOT NULL,
  dila_id text,
  dila_cid text,
  dila_container_id text,
  PRIMARY KEY(id)
  );

ALTER TABLE IF EXISTS contrib.answers_references
  ADD CONSTRAINT answers_references_answer_id_fkey
  FOREIGN KEY (answer_id)
  REFERENCES contrib.answers (id);
