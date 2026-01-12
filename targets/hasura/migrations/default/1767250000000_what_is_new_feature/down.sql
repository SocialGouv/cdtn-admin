-- ============================================================================
-- Rollback de la migration "Quoi de neuf"
-- Supprime les documents publiés et la table what_is_new_items
-- ============================================================================

-- 1. Suppression des documents publiés (les 51 contenus)
-- ============================================================================
DELETE FROM "public"."documents" WHERE "source" = 'what_is_new';

-- 2. Suppression de la table what_is_new_items
-- ============================================================================
DROP TABLE IF EXISTS "public"."what_is_new_items";