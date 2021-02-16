DROP TRIGGER audit_trigger_row on auth.refresh_tokens;
DROP TRIGGER audit_trigger_row on auth.user_roles;
DROP TRIGGER audit_trigger_row on auth.users;
DROP TRIGGER audit_trigger_row on alert_notes;
DROP TRIGGER audit_trigger_row on alert_status;
DROP TRIGGER audit_trigger_row on alerts;
DROP TRIGGER audit_trigger_row on document_relations;
DROP TRIGGER audit_trigger_row on glossary;
DROP TRIGGER audit_trigger_row on kali_blocks;
DROP TRIGGER audit_trigger_row on package_version;
DROP TRIGGER audit_trigger_row on roles;
DROP TRIGGER audit_trigger_row on sources;

DROP TRIGGER documents_audit_update_selective on documents;
DROP TRIGGER documents_audit_insert_delete on documents;

DROP TRIGGER logged_actions_delete on audit.logged_actions;
