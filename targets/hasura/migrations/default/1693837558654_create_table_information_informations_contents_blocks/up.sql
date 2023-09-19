CREATE TABLE "information"."informations_contents_blocks" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "content" text NOT NULL,
    "order" integer NOT NULL,
    "type" text NOT NULL default 'markdown',
    "informations_contents_id" uuid NOT NULL,
    "files_id" uuid,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_contents_id") REFERENCES "information"."informations_contents"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("files_id") REFERENCES "public"."files"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("id"),
    UNIQUE ("informations_contents_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
