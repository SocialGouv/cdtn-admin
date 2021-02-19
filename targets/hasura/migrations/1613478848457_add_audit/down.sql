DROP TRIGGER IF EXISTS audit_trigger_row on auth.refresh_tokens;
DROP TRIGGER IF EXISTS audit_trigger_stm on auth.refresh_tokens;
DROP TRIGGER IF EXISTS audit_trigger_row on auth.user_roles;
DROP TRIGGER IF EXISTS audit_trigger_stm on auth.user_roles;
DROP TRIGGER IF EXISTS audit_trigger_row on auth.users;
DROP TRIGGER IF EXISTS audit_trigger_stm on auth.users;
DROP TRIGGER IF EXISTS audit_trigger_row on alert_notes;
DROP TRIGGER IF EXISTS audit_trigger_stm on alert_notes;
DROP TRIGGER IF EXISTS audit_trigger_row on alert_status;
DROP TRIGGER IF EXISTS audit_trigger_stm on alert_status;
DROP TRIGGER IF EXISTS audit_trigger_row on alerts;
DROP TRIGGER IF EXISTS audit_trigger_stm on alerts;
DROP TRIGGER IF EXISTS audit_trigger_row on document_relations;
DROP TRIGGER IF EXISTS audit_trigger_stm on document_relations;
DROP TRIGGER IF EXISTS audit_trigger_row on glossary;
DROP TRIGGER IF EXISTS audit_trigger_stm on glossary;
DROP TRIGGER IF EXISTS audit_trigger_row on kali_blocks;
DROP TRIGGER IF EXISTS audit_trigger_stm on kali_blocks;
DROP TRIGGER IF EXISTS audit_trigger_row on package_version;
DROP TRIGGER IF EXISTS audit_trigger_stm on package_version;
DROP TRIGGER IF EXISTS audit_trigger_row on roles;
DROP TRIGGER IF EXISTS audit_trigger_stm on roles;
DROP TRIGGER IF EXISTS audit_trigger_row on sources;
DROP TRIGGER IF EXISTS audit_trigger_stm on sources;

DROP TRIGGER IF EXISTS documents_audit_update_selective on documents;
DROP TRIGGER IF EXISTS documents_audit_insert_delete on documents;


