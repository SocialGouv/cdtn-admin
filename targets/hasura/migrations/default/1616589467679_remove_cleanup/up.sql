DROP TRIGGER delete_alerts on alerts;
DROP FUNCTION delete_old_alerts;
DROP TRIGGER logged_actions_delete on audit.logged_actions;
DROP FUNCTION audit.delete_old_actions;

select audit.audit_table('documents'::regclass, false, true);
