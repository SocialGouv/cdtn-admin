CREATE TABLE "search"."prequalified_documents" ("prequalified_id" uuid NOT NULL, "document_id" text NOT NULL, "order" integer NOT NULL, PRIMARY KEY ("prequalified_id","document_id") , FOREIGN KEY ("prequalified_id") REFERENCES "search"."prequalified"("id") ON UPDATE cascade ON DELETE cascade, FOREIGN KEY ("document_id") REFERENCES "public"."documents"("cdtn_id") ON UPDATE cascade ON DELETE cascade);