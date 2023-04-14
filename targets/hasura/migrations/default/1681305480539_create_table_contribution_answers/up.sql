CREATE TABLE "contribution"."answers" (
    "id_question" uuid NOT NULL,
    "id_cc" char(4) NOT NULL,
    "content" text NULL,
    "display_mode" text NOT NULL default 'NORMAL',
    PRIMARY KEY ("id_question","id_cc") ,
    FOREIGN KEY ("id_question") REFERENCES "contribution"."questions"("id") ON UPDATE cascade ON DELETE cascade,
    FOREIGN KEY ("id_cc") REFERENCES "public"."agreements"("id") ON UPDATE cascade ON DELETE cascade
);
COMMENT ON TABLE "contribution"."answers" IS E'liste des réponses au question de contribution par CC';
