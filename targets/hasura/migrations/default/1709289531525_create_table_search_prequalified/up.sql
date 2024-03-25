CREATE TABLE "search"."prequalified" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "variants" text[] NOT NULL, "title" text not null, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
