CREATE TABLE "information"."informations_references" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "url" text NOT NULL,
    "type" text NOT NULL default 'external',
    "title" text NOT NULL,
    "informations_id" uuid NOT NULL,
    "order" integer NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_id") REFERENCES "information"."informations"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("id"),
    UNIQUE ("informations_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
