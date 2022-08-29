alter table "public"."documents" add constraint "documents_initial_id_source_key" unique ("initial_id", "source");
