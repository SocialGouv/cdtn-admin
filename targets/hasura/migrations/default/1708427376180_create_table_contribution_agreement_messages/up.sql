CREATE TABLE "contribution"."agreement_messages" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "agreement_id" bpchar NOT NULL,
    "content" text NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("agreement_id") REFERENCES "agreement"."agreements"("id") ON UPDATE cascade ON DELETE cascade,
    UNIQUE ("agreement_id")
);
insert into contribution.agreement_messages(agreement_id, content)
values (
        '0413',
        '<p>Les dispositions de cette convention n’ont pas été étendues. Cela signifie qu''elles ne s''appliquent qu''aux entreprises adhérentes à l’une des organisations signataires de l''accord. Dans ce contexte, nous ne sommes pas en mesure d''identifier si cette règle s''applique ou non au sein de votre entreprise. C''est la raison pour laquelle nous ne portons à votre connaissance que les règles prévues par le code du travail, qui s''appliquent à tous. Vous pouvez toutefois consulter la convention collective <a href="https://www.legifrance.gouv.fr/affichIDCC.do?idConvention=KALICONT000005635407" target="_blank">ici</a> dans le cas où elle s''applique à votre situation.</p>'
    );
insert into contribution.agreement_messages(agreement_id, content)
values (
        '0029',
        '<p>Les dispositions de cette convention n’ont pas été étendues. Cela signifie qu''elles ne s''appliquent qu''aux entreprises adhérentes à l’une des organisations signataires de l''accord. Dans ce contexte, nous ne sommes pas en mesure d''identifier si cette règle s''applique ou non au sein de votre entreprise. C''est la raison pour laquelle nous ne portons à votre connaissance que les règles prévues par le code du travail, qui s''appliquent à tous. Vous pouvez toutefois consulter la convention collective <a href="https://www.legifrance.gouv.fr/affichIDCC.do?idConvention=KALICONT000005635234" target="_blank">ici</a> dans le cas où elle s''applique à votre situation.</p>'
    );
insert into contribution.agreement_messages(agreement_id, content)
values (
        '2420',
        '<p>Les dispositions de cette convention n’ont pas été étendues. Cela signifie qu''elles ne s''appliquent qu''aux entreprises adhérentes à l’une des organisations signataires de l''accord. Dans ce contexte, nous ne sommes pas en mesure d''identifier si cette règle s''applique ou non au sein de votre entreprise. C''est la raison pour laquelle nous ne portons à votre connaissance que les règles prévues par le code du travail, qui s''appliquent à tous. Vous pouvez toutefois consulter la convention collective <a href="https://www.legifrance.gouv.fr/affichIDCC.do?idConvention=KALICONT000017941839" target="_blank">ici</a> dans le cas où elle s''applique à votre situation.</p>'
    );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
update contribution.answers
set content_type = 'NOTHING'
where agreement_id in ('0413', '0029', '2420');