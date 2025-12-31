UPDATE public.files
SET size =
      ROUND(
        COALESCE(
          NULLIF(REPLACE(REGEXP_REPLACE(size, '[^0-9.,]', '', 'g'), ',', '.'), '')::numeric,
          0
        )
          *
        CASE
          WHEN LOWER(REGEXP_REPLACE(size, '[^a-zA-Z]', '', 'g')) IN ('mb','mo') THEN 1000*1000
          WHEN LOWER(REGEXP_REPLACE(size, '[^a-zA-Z]', '', 'g')) IN ('kb','ko','k') THEN 1000
          WHEN LOWER(REGEXP_REPLACE(size, '[^a-zA-Z]', '', 'g')) IN ('b','octet','octets') THEN 1
          ELSE 1
          END
      )::bigint
WHERE (url LIKE '%.svg' OR url LIKE '%.pdf')
  AND size IS NOT NULL;

-- Cas1_moins_dun_an.svg
UPDATE public.files SET size = '579000' WHERE id = 'e48b4e6f-5f3c-4257-bbf3-85a56c5b37ac';
-- Cas2_plus_dun_an_avant_expiration_report.svg
UPDATE public.files SET size = '692000' WHERE id = 'b0f15b58-7653-4599-b916-86597ccf935f';
-- Cas3_plus_dun_an_après_expiration_report.svg
UPDATE public.files SET size = '713000' WHERE id = 'ba2f29a4-0dd4-4914-b194-c06e8c76750c';
-- Partage_de_la_valeur_2025.svg
UPDATE public.files SET size = '1000000' WHERE id = '0c8a13d6-4785-42fc-a0b6-aff7ee9b8b51';
