alter table "agreement"."agreements"
add column "is_extended" boolean not null default 'false';
update agreement.agreements
set is_extended = true
where id in ('0413', '0029', '2420');