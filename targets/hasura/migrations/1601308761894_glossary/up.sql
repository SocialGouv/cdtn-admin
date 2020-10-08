CREATE TABLE "public"."glossary"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "term" text NOT NULL,
  "abbreviations" text NOT NULL DEFAULT '[]',
  "variants" text NOT NULL DEFAULT '[]',
  "definition" text NOT NULL,
  "references" text NOT NULL DEFAULT '[]',
  PRIMARY KEY ("id") , UNIQUE ("term")
);
