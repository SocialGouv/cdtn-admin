select audit.audit_table('contribution.answers'::regclass, true, true);
select audit.audit_table('contribution.answer_comments'::regclass, true, true);
select audit.audit_table('contribution.answer_cdtn_references'::regclass, true, true);
select audit.audit_table('contribution.answer_kali_references'::regclass, true, true);
select audit.audit_table('contribution.answer_legi_references'::regclass, true, true);
select audit.audit_table('contribution.answer_other_references'::regclass, true, true);
select audit.audit_table('contribution.answer_statuses'::regclass, true, true);
select audit.audit_table('contribution.question_messages'::regclass, true, true);
select audit.audit_table('contribution.questions'::regclass, true, true);
