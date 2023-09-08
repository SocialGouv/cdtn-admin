CREATE TYPE "information"."SectionDisplayModeType" AS ENUM ('accordion', 'tab');
CREATE TYPE "information"."ReferenceLabelType" AS ENUM ('Références juridiques', 'Liens utiles');
CREATE TABLE "information"."informations" (
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "intro" text NOT NULL,
    "title" text NOT NULL,
    "meta_title" text NOT NULL,
    "meta_description" text NOT NULL,
    "description" text NOT NULL,
    "cdtn_id" text NOT NULL,
    "section_display_mode" "information"."SectionDisplayModeType" NOT NULL default 'accordion',
    "reference_label" "information"."ReferenceLabelType",
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("cdtn_id") REFERENCES "public"."documents"("cdtn_id") ON UPDATE restrict ON DELETE restrict,
    UNIQUE ("id"),
    UNIQUE ("cdtn_id")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
