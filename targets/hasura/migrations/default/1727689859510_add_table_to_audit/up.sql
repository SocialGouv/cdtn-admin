select audit.audit_table('agreement.agreements'::regclass, true, true);
select audit.audit_table('information.informations'::regclass, true, true);
select audit.audit_table('information.informations_contents'::regclass, true, true);
select audit.audit_table('information.informations_contents_blocks'::regclass, true, true);
select audit.audit_table('information.informations_contents_blocks_contents'::regclass, true, true);
select audit.audit_table('information.informations_contents_references'::regclass, true, true);
select audit.audit_table('information.informations_references'::regclass, true, true);
select audit.audit_table('search.prequalified'::regclass, true, true);
select audit.audit_table('search.prequalified_documents'::regclass, true, true);