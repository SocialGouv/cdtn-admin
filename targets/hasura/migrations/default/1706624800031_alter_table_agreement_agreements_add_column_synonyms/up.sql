alter table "public"."agreements" add column "synonyms" Text[]
 not null default ARRAY[]::text[];
