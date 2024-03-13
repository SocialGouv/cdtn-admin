alter table "public"."documents" add constraint "source_not_null_and_not_empty" check (source IS NOT NULL AND source <> ''::text);
