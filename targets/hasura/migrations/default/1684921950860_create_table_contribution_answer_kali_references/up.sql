CREATE TABLE "contribution"."answer_kali_references" ("answer_id" uuid NOT NULL, "article_id" text NOT NULL, PRIMARY KEY ("answer_id","article_id") , FOREIGN KEY ("answer_id") REFERENCES "contribution"."answers"("id") ON UPDATE cascade ON DELETE cascade, FOREIGN KEY ("article_id") REFERENCES "public"."kali_articles"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("answer_id", "article_id"));COMMENT ON TABLE "contribution"."answer_kali_references" IS E'Références de la convention collective (kali) liées aux réponses ';