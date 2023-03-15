select audit.audit_table('documents'::regclass, true, true, '{updated_at}');

CREATE OR REPLACE FUNCTION jsonb_diff_val(val1 JSONB, val2 JSONB, excluded_cols text[])
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  jsonVal JSONB;
  v RECORD;
 
BEGIN
   result = jsonb_build_object('old', val1 - excluded_cols, 'new', val2 - excluded_cols);
   FOR v IN SELECT * FROM jsonb_each(val2 - excluded_cols) loop
	 IF jsonb_typeof(v.value) = 'object' then
	 	jsonVal = jsonb_diff_val(val1->v.key, v.value);
	 	if jsonb_extract_path(jsonVal, 'new') = jsonb_build_object()
	 	and jsonb_extract_path(jsonVal, 'old') = jsonb_build_object()
	 	then
	 		result = jsonb_build_object(
	 			'old', jsonb_extract_path(result, 'old') - v.key,
	 			'new', jsonb_extract_path(result, 'new') - v.key
	 		);
		end if;
     ELSIF jsonb_extract_path(result, 'old') @> jsonb_build_object(v.key, v.value)
     then
     	result = jsonb_build_object(
     		'old', jsonb_extract_path(result, 'old') - v.key,
 			'new', jsonb_extract_path(result, 'new') - v.key
 		);
     END IF;
   END LOOP;
   RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit.if_modified_func() RETURNS TRIGGER AS $body$
DECLARE
    audit_row audit.logged_actions;
    excluded_cols text[] = ARRAY[]::text[];
    non_primary_cols text[] = ARRAY[]::text[];
    new_r jsonb;
    old_r jsonb;
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
    END IF;
   
   select array_agg(c.column_name::text) into non_primary_cols
	from information_schema.columns c
	where c.table_name = 'documents'
	and c.column_name not in (
		SELECT ccu.column_name
		FROM information_schema.table_constraints tc 
		JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
		WHERE tc.constraint_type = 'PRIMARY KEY' and tc.table_schema = TG_TABLE_SCHEMA::text and tc.table_name = TG_TABLE_NAME::text
	);

    audit_row = ROW(
        nextval('audit.logged_actions_event_id_seq'), -- event_id
        TG_TABLE_SCHEMA::text,                        -- schema_name
        TG_TABLE_NAME::text,                          -- table_name
        TG_RELID,                                     -- relation OID for much quicker searches
        session_user::text,                           -- session_user_name
        current_setting('hasura.user', 't')::jsonb,   -- user information from hasura graphql engine
        current_timestamp,                            -- action_tstamp_tx
        statement_timestamp(),                        -- action_tstamp_stm
        clock_timestamp(),                            -- action_tstamp_clock
        txid_current(),                               -- transaction ID
        current_setting('application_name'),          -- client application
        inet_client_addr(),                           -- client_addr
        inet_client_port(),                           -- client_port
        current_query(),                              -- top-level query or queries (if multistatement) from client
        substring(TG_OP,1,1),                         -- action
        NULL,			  							  -- row_data
        NULL,                                    	  -- changed_fields
        'f'                                           -- statement_only
        );

    IF (TG_LEVEL = 'ROW' or NOT TG_ARGV[0]::boolean IS DISTINCT FROM 'f'::boolean) THEN
        audit_row.client_query = NULL;
    END IF;

    IF TG_ARGV[1] IS NOT NULL THEN
        excluded_cols = TG_ARGV[1]::text[];
    END IF;

    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        old_r = to_jsonb(OLD);
        new_r = to_jsonb(NEW);
       	audit_row.changed_fields = jsonb_diff_val(old_r, new_r, excluded_cols);
       audit_row.row_data = to_jsonb(OLD) - non_primary_cols;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        audit_row.changed_fields = jsonb_build_object('old', to_jsonb(OLD) - excluded_cols);
       audit_row.row_data = to_jsonb(OLD) - non_primary_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        audit_row.changed_fields = jsonb_build_object('new', to_jsonb(NEW) - excluded_cols);
       audit_row.row_data = to_jsonb(NEW) - non_primary_cols;
    ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
        audit_row.statement_only = 't';
    ELSE
        RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;
   	if (jsonb_extract_path(audit_row.changed_fields, 'new') <> jsonb_build_object()
	 	or jsonb_extract_path(audit_row.changed_fields, 'old') <> jsonb_build_object())
	then
    	INSERT INTO audit.logged_actions VALUES (audit_row.*);
   	end if;
    RETURN NULL;
END;
$body$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;
