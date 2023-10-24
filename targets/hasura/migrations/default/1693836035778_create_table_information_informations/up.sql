CREATE TABLE "information"."informations" (
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "intro" text,
    "title" text NOT NULL,
    "meta_title" text NOT NULL,
    "meta_description" text NOT NULL,
    "description" text NOT NULL,
    "section_display_mode" text NOT NULL default 'accordion',
    "reference_label" text,
    "dismissal_process" boolean not null default false,
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    PRIMARY KEY ("id"),
    UNIQUE ("id")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
