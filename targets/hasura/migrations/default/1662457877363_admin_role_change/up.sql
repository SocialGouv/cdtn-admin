insert into public.roles(role) values ('super');
update auth.user_roles set role = 'super' where role = 'admin';
update auth.users set default_role = 'super' where default_role = 'admin';
delete from public.roles where role='admin';
