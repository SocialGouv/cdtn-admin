--
-- Audit the following table using audit triggers
--

select audit.audit_table('auth.refresh_tokens');
select audit.audit_table('auth.user_roles');
select audit.audit_table('auth.users');
select audit.audit_table('alert_notes');
select audit.audit_table('alert_status');
select audit.audit_table('alerts');
select audit.audit_table('document_relations');
select audit.audit_table('glossary');
select audit.audit_table('kali_blocks');
select audit.audit_table('package_version');
select audit.audit_table('roles');
select audit.audit_table('sources');

--
-- select audit.audit_table('documents');
-- we use audit trigger directly to take advantage of WHEN clause
-- to log actions only if data updated since document is updated daily by the ingester,
--
CREATE TRIGGER documents_audit_update_selective
  AFTER UPDATE ON documents FOR EACH ROW
  WHEN ( (OLD.title, OLD.meta_description, OLD.slug, OLD.is_published, OLD.is_searchable)
  IS DISTINCT FROM (NEW.title, NEW.meta_description, NEW.slug, NEW.is_published, NEW.is_searchable) )
  EXECUTE PROCEDURE audit.if_modified_func('true');

CREATE TRIGGER documents_audit_insert_delete
  AFTER INSERT OR DELETE ON documents FOR EACH ROW
  EXECUTE PROCEDURE audit.if_modified_func('true');

CREATE TRIGGER logged_actions_delete
    AFTER INSERT ON audit.logged_actions
    EXECUTE PROCEDURE audit.delete_old_actions();
