CREATE TABLE "information"."informations_contents_blocks_contents" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "informations_contents_blocks_id" uuid NOT NULL,
    "cdtn_id" text NOT NULL,
    "order" integer NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("informations_contents_blocks_id") REFERENCES "information"."informations_contents_blocks"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("cdtn_id") REFERENCES "public"."documents"("cdtn_id") ON UPDATE restrict ON DELETE restrict,
    UNIQUE ("id"),
    UNIQUE ("informations_contents_blocks_id", "order")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
