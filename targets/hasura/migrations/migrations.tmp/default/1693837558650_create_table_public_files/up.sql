CREATE TABLE "public"."files" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "url" text NOT NULL,
    "alt_text" text,
    "size" text,
    PRIMARY KEY ("id"),
    UNIQUE ("id")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
