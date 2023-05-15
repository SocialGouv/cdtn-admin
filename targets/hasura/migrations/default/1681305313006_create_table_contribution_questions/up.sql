CREATE TABLE "contribution"."questions" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "content" text NOT NULL,
    UNIQUE ("id")
);
COMMENT ON TABLE "contribution"."questions" IS E'liste des questions de contribution';
