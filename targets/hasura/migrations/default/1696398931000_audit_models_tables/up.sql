select audit.audit_table('model.models'::regclass, true, true);
select audit.audit_table('model.models_other_references'::regclass, true, true);
select audit.audit_table('model.models_legi_references'::regclass, true, true);
