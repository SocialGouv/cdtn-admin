DROP TRIGGER IF EXISTS "forbid_highlight_on_content" ON "contribution"."answers";
DROP TRIGGER IF EXISTS "forbid_highlight_on_status" ON "contribution"."answer_statuses";
DROP FUNCTION IF EXISTS "contribution"."forbid_highlight_on_content"();
DROP FUNCTION IF EXISTS "contribution"."forbid_highlight_on_status"();
DROP FUNCTION IF EXISTS "contribution"."is_status_after_redacting"(text);
DROP FUNCTION IF EXISTS "contribution"."has_highlight"(text);
ALTER TABLE "contribution"."questions"
  DROP COLUMN IF EXISTS "template_answer",
  DROP COLUMN IF EXISTS "introduction_cdt",
  DROP COLUMN IF EXISTS "introduction_nothing";
