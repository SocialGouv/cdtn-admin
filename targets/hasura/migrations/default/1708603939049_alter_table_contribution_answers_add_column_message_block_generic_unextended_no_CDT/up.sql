alter table "contribution"."answers"
add column "message_block_generic_unextended_no_CDT" text null;
update contribution.answers
set "message_block_generic_no_CDT__unextended_CC" = 'Les dispositions de cette convention n’ont pas été étendues. Cela signifie qu''elles ne s''appliquent qu''aux entreprises adhérentes à l’une des organisations signataires de l''accord. Dans ce contexte, nous ne sommes pas en mesure d''identifier si cette règle s''applique ou non au sein de votre entreprise. Vous pouvez toutefois consulter la convention collective ici dans le cas où elle s''applique à votre situation.'
where "message_block_generic_no_CDT" is not null;
update documents
set "document" = jsonb_insert(
        "document",
        '{messageBlockGenericNoCDTUnextendedCC}',
        jsonb_build_object(
            'messageBlockGenericNoCDTUnextendedCC',
            'Les dispositions de cette convention n’ont pas été étendues. Cela signifie qu''elles ne s''appliquent qu''aux entreprises adhérentes à l’une des organisations signataires de l''accord. Dans ce contexte, nous ne sommes pas en mesure d''identifier si cette règle s''applique ou non au sein de votre entreprise. Vous pouvez toutefois consulter la convention collective ici dans le cas où elle s''applique à votre situation.'
        )->'messageBlockGenericNoCDTUnextendedCC'
    )
where "source" = 'contributions'
    and "document"->>'contentType' = 'GENERIC_NO_CDT'
    and "document"->>'idcc' = '0000';