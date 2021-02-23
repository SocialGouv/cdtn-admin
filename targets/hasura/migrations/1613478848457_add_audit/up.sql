--
-- Audit the following table using audit triggers
--

select audit.audit_table('auth.refresh_tokens'::regclass, true, true);
select audit.audit_table('auth.user_roles'::regclass);
select audit.audit_table('auth.users'::regclass, true, true, '{password,secret_token}');
select audit.audit_table('alert_notes'::regclass);
select audit.audit_table('alert_status'::regclass);
select audit.audit_table('alerts'::regclass, false, true);
select audit.audit_table('document_relations'::regclass, false, true);
select audit.audit_table('glossary'::regclass);
select audit.audit_table('kali_blocks'::regclass);
select audit.audit_table('package_version'::regclass);
select audit.audit_table('roles'::regclass);
select audit.audit_table('sources'::regclass);

--
-- select audit.audit_table('documents');
-- we use audit trigger directly to take advantage of WHEN clause
-- to log update for fields other than documents, is_available, updated_at
-- since documents are updated daily by the ingester,
--

CREATE TRIGGER documents_audit_update_selective
AFTER UPDATE ON documents FOR EACH ROW
WHEN (OLD.title IS DISTINCT FROM NEW.title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
    OR OLD.slug IS DISTINCT FROM NEW.slug
    OR OLD.is_published IS DISTINCT FROM NEW.is_published
    OR OLD.is_searchable IS DISTINCT FROM NEW.is_searchable)
EXECUTE PROCEDURE audit.if_modified_func();

CREATE TRIGGER documents_audit_insert_delete
AFTER INSERT OR DELETE ON documents FOR EACH STATEMENT
EXECUTE PROCEDURE audit.if_modified_func();

--
-- Remove old logged actions
--
CREATE TRIGGER logged_actions_delete
    AFTER INSERT ON audit.logged_actions
    EXECUTE PROCEDURE audit.delete_old_actions();
