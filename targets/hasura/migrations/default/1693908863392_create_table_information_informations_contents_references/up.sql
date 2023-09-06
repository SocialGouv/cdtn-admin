CREATE TYPE "information"."ReferenceType" AS ENUM ('external', 'internal');
CREATE TABLE "information"."informations_contents_references" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "type" "information"."ReferenceType" NOT NULL default 'external',
    "url" text NOT NULL,
    "title" text NOT NULL,
    "order" integer NOT NULL,
    "informations_contents_id" uuid NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_contents_id") REFERENCES "information"."informations_contents"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("id"),
    UNIQUE ("informations_contents_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
