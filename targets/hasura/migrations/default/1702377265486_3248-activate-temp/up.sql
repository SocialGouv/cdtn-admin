update documents set is_published = true, is_searchable = true, is_available = true
where source = 'conventions_collectives' and split_part(slug, '-', 1) = '3248';