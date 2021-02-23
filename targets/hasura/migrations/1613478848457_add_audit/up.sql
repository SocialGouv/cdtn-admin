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
select audit.audit_table('documents'::regclass, true, true, '{document,is_available}');

--
-- Remove old logged actions
--
CREATE TRIGGER logged_actions_delete
    AFTER INSERT ON audit.logged_actions
    EXECUTE PROCEDURE audit.delete_old_actions();
