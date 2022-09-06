ALTER TABLE public.roles DISABLE TRIGGER ALL;
update public.roles set role='super' where role = 'admin';
ALTER TABLE public.roles ENABLE TRIGGER ALL;

ALTER TABLE auth.user_roles DISABLE TRIGGER ALL;
update auth.user_roles set role = 'super' where role = 'admin';
ALTER TABLE auth.user_roles ENABLE TRIGGER ALL;

ALTER TABLE auth.users DISABLE TRIGGER ALL;
update auth.users set default_role = 'super' where default_role = 'admin';
ALTER TABLE auth.users ENABLE TRIGGER ALL;
