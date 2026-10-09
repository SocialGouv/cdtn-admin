ALTER TABLE "news"."news_cdtn_references" ADD COLUMN "order" integer NOT NULL DEFAULT 0;
UPDATE "news"."news_cdtn_references" r SET "order" = s.rn FROM (SELECT news_id, cdtn_id, row_number() OVER (PARTITION BY news_id ORDER BY ctid) - 1 AS rn FROM "news"."news_cdtn_references") s WHERE r.news_id = s.news_id AND r.cdtn_id = s.cdtn_id;
