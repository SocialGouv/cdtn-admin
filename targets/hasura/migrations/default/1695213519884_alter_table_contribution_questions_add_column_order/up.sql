alter table "contribution"."questions"
add column "order" integer null;
alter table "contribution"."questions"
add constraint "questions_order_key" unique ("order");
update contribution.questions
set "order" = q2."index"
from contrib.questions q2
where q2.value = "content"
    and q2."index" <> 55;
