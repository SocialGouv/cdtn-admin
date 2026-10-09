CREATE TABLE "news"."news_other_references" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "news_id" uuid NOT NULL, "label" text NOT NULL, "url" text NOT NULL, "order" integer NOT NULL DEFAULT 0, PRIMARY KEY ("id"), FOREIGN KEY ("news_id") REFERENCES "news"."news"("id") ON UPDATE cascade ON DELETE cascade);
COMMENT ON TABLE "news"."news_other_references" IS E'Liens externes des actualités';
