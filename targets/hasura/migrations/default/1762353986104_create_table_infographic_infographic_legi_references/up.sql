CREATE TABLE "infographic"."infographic_legi_references"
(
  "infographic_id" uuid NOT NULL,
  "article_id"     text NOT NULL,
  "id"             uuid NOT NULL DEFAULT gen_random_uuid(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("infographic_id") REFERENCES "infographic"."infographic" ("id") ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY ("article_id") REFERENCES "public"."legi_articles" ("id") ON UPDATE restrict ON DELETE restrict,
  UNIQUE ("infographic_id", "article_id"),
  UNIQUE ("id")
);
COMMENT ON TABLE "infographic"."infographic_legi_references" IS E'Références legifrance sur les infographies';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
