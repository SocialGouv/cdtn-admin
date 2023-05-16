CREATE TYPE StatusType AS ENUM (
    'REDACTING',
    'REDACTED',
    'VALIDATING',
    'VALIDATED',
    'PUBLISHED'
);
CREATE TABLE "contribution"."answer_statuses" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "answer_id" uuid NOT NULL,
    "user_id" uuid,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "status" StatusType NOT NULL default 'REDACTING',
    UNIQUE ("id"),
    FOREIGN KEY ("answer_id") REFERENCES "contribution"."answers"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE
    set null ON DELETE
    set null,
        UNIQUE ("id")
);
alter table "contribution"."answers" drop column "status";
