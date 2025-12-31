CREATE TABLE "contribution"."answers" (
    "question_id" uuid NOT NULL,
    "agreement_id" char(4) NOT NULL,
    "content" text NULL,
    "display_mode" text NULL,
    PRIMARY KEY ("question_id","agreement_id") ,
    FOREIGN KEY ("question_id") REFERENCES "contribution"."questions"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("agreement_id") REFERENCES "public"."agreements"("id") ON UPDATE cascade ON DELETE cascade
);
COMMENT ON TABLE "contribution"."answers" IS E'liste des réponses au question de contribution par CC';
