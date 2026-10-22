INSERT INTO "news"."news_cdtn_references" ("news_id", "cdtn_id")
SELECT DISTINCT "news_id", "cdtn_id" FROM "news"."news_links" WHERE "kind" = 'cdtn'
ON CONFLICT DO NOTHING;
