CREATE TABLE "contribution"."answer_comments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "content" text NOT NULL,
    "answer_id" uuid NOT NULL,
    "user_id" uuid,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("answer_id") REFERENCES "contribution"."answers"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE
    set null ON DELETE
    set null,
        UNIQUE ("id")
);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
