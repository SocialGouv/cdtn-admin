alter table "contribution"."questions"
  add constraint "questions_message_id_fkey"
  foreign key ("message_id")
  references "contribution"."question_messages"
  ("id") on update restrict on delete restrict;
