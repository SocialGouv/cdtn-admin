CREATE TABLE "public"."alert_notes" ( 
  "id" uuid NOT NULL DEFAULT gen_random_uuid (), 
  "message" text NOT NULL, 
  "user_id" uuid NOT NULL, 
  "alert_id" uuid NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("id"), 
  FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id") ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY ("alert_id") REFERENCES "public"."alerts" ("id") ON UPDATE RESTRICT ON DELETE CASCADE
);

COMMENT ON TABLE "public"."alert_notes" IS E'alert notes';
