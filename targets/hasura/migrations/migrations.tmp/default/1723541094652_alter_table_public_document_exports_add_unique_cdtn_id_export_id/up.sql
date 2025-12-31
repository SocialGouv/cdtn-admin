alter table "public"."document_exports" drop constraint "document_exports_cdtn_id_key";
alter table "public"."document_exports" add constraint "document_exports_cdtn_id_export_id_key" unique ("cdtn_id", "export_id");
