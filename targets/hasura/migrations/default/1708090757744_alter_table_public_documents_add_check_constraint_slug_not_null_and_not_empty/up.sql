alter table "public"."documents" add constraint "slug_not_null_and_not_empty" check (slug IS NOT NULL AND slug <> '');
