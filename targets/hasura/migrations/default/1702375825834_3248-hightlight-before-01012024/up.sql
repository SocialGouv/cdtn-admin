update documents
set "document" = jsonb_set("document", '{highlight}','{"title": "Attention : les informations données sur cette page seront applicables à partir du 01/01/2024","content": "Cette page est publiée pour vous donner accès aux dispositions avant leur entrée en vigueur à partir du 01/01/2024. Cette convention collective résulte du regroupement des conventions collectives locales de la métallurgie ainsi que de la convention collective spécifique aux ingénieurs et cadres de la métallurgie. Ces dernières restent applicables jusqu’au 31/12/2023.", "searchInfo": "Nouvelle convention collective en vigueur issue du regroupement des conventions locales de la métallurgie ainsi que de la convention spécifique aux ingénieurs et cadres"}', true)
where "source" = 'conventions_collectives'
and split_part(slug, '-', 1) = '3248';

update documents
set "document" = jsonb_set("document", '{highlight}','{"title": "Attention : les informations données sur cette page seront applicables à partir du 01/01/2024","content": "Cette page est publiée pour vous donner accès aux dispositions avant leur entrée en vigueur à partir du 01/01/2024. Cette convention collective résulte du regroupement des conventions collectives locales de la métallurgie ainsi que de la convention collective spécifique aux ingénieurs et cadres de la métallurgie. Ces dernières restent applicables jusqu’au 31/12/2023."}', true)
where "source" = 'contributions'
and split_part(slug, '-', 1) = '3248';