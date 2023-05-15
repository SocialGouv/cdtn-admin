CREATE OR REPLACE VIEW"v1"."fiches_sp" AS
SELECT
    fichesp.id,
    fichesp.status,
    COALESCE(documents.is_published AND documents.is_available, false)  as online_status,
    documents.cdtn_id,
    documents.is_published,
    documents.is_available
FROM service_public_contents as "fichesp"
LEFT JOIN documents on fichesp.id = documents.initial_id
ORDER BY online_status ASC, TRIM(leading 'F' FROM id)::INTEGER ASC;
