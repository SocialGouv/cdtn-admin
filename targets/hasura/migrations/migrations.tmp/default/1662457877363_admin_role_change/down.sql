insert into public.roles(role) values ('admin');
update auth.user_roles set role = 'admin' where role = 'super';
update auth.users set default_role = 'admin' where default_role = 'super';
delete from public.roles where role='super';
