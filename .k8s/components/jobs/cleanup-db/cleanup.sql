-- Delete logged_action older than 3 monthes
DELETE FROM audit.logged_actions WHERE action_tstamp_tx < NOW() - INTERVAL '3 month';

-- Delete alerts older than 3 monthes
DELETE FROM alerts WHERE created_at < NOW() - '3 month' AND status IN ('done', 'rejected');
