-- On renomme description en intro
update documents set document = jsonb_set(document #- '{description}',
                                '{intro}',
                                document#>'{description}')
where source = 'modeles_de_courriers';

--On Remet un champs description avec le contenu de la meta_description
update documents set document = jsonb_set(document, '{description}', to_jsonb(meta_description))
where source = 'modeles_de_courriers';
