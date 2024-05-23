-- On renomme intro en description
update documents set document = jsonb_set(document #- '{intro}',
                                '{description}',
                                document#>'{intro}')
where source = 'modeles_de_courriers';
