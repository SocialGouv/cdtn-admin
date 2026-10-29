-- Fusion des blocs « Contenus liés » des actualités : les anciennes références
-- CDTN sont ajoutées à la suite des liens, sans doublon.
INSERT INTO "news"."news_links" ("news_id", "order", "kind", "cdtn_id")
SELECT r."news_id",
       COALESCE((SELECT MAX(l."order") FROM "news"."news_links" l WHERE l."news_id" = r."news_id"), -1)
         + ROW_NUMBER() OVER (PARTITION BY r."news_id" ORDER BY r."cdtn_id"),
       'cdtn',
       r."cdtn_id"
FROM "news"."news_cdtn_references" r
WHERE NOT EXISTS (
  SELECT 1 FROM "news"."news_links" l
  WHERE l."news_id" = r."news_id" AND l."kind" = 'cdtn' AND l."cdtn_id" = r."cdtn_id"
);
DELETE FROM "news"."news_cdtn_references";
