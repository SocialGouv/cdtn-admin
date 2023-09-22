CREATE TABLE "information"."informations_contents_blocks" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "content" text NOT NULL,
    "order" integer NOT NULL,
    "type" text NOT NULL default 'markdown',
    "content_display_mode" text,
    "informations_contents_id" uuid NOT NULL,
    "file_id" uuid,
    "img_id" uuid,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_contents_id") REFERENCES "information"."informations_contents"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("img_id") REFERENCES "public"."files"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("id"),
    UNIQUE ("informations_contents_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
