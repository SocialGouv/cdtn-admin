CREATE TABLE "information"."informations_contents" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "title" text NOT NULL,
    "order" Integer NOT NULL,
    "informations_id" uuid NOT NULL,
    "reference_label" text,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_id") REFERENCES "information"."informations"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("id"),
    UNIQUE ("informations_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
