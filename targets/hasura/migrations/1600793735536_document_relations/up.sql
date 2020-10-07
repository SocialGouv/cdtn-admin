CREATE TABLE "public"."document_relations"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "document_a" text,
  "document_b" text NOT NULL,
  "type" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("document_a") REFERENCES "public"."documents"("cdtn_id") ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY ("document_b") REFERENCES "public"."documents"("cdtn_id") ON UPDATE cascade ON DELETE cascade
);



COMMENT ON TABLE "public"."document_relations" IS E'contains all the document relations for cdtn website';
