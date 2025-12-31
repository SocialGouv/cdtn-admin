-- Fix Hasura catalog after pg_restore
-- This script adds missing PRIMARY KEY constraints and initializes Hasura metadata

-- Add PRIMARY KEY constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hdb_version_pkey' 
        AND conrelid = 'hdb_catalog.hdb_version'::regclass
    ) THEN
        ALTER TABLE hdb_catalog.hdb_version ADD PRIMARY KEY (version);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hdb_metadata_pkey' 
        AND conrelid = 'hdb_catalog.hdb_metadata'::regclass
    ) THEN
        ALTER TABLE hdb_catalog.hdb_metadata ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hdb_schema_notifications_pkey' 
        AND conrelid = 'hdb_catalog.hdb_schema_notifications'::regclass
    ) THEN
        ALTER TABLE hdb_catalog.hdb_schema_notifications ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'schema_migrations_pkey' 
        AND conrelid = 'hdb_catalog.schema_migrations'::regclass
    ) THEN
        ALTER TABLE hdb_catalog.schema_migrations ADD PRIMARY KEY (version);
    END IF;
END $$;

-- Insert Hasura version (catalog version 48 for Hasura 2.45.1)
INSERT INTO hdb_catalog.hdb_version (version, upgraded_on) 
VALUES (48, NOW()) 
ON CONFLICT (version) DO NOTHING;

-- Mark all migrations as applied (60 migrations in total)
INSERT INTO hdb_catalog.schema_migrations (version, dirty) 
VALUES 
    (1, false), (2, false), (3, false), (4, false), (5, false),
    (6, false), (7, false), (8, false), (9, false), (10, false),
    (11, false), (12, false), (13, false), (14, false), (15, false),
    (16, false), (17, false), (18, false), (19, false), (20, false),
    (21, false), (22, false), (23, false), (24, false), (25, false),
    (26, false), (27, false), (28, false), (29, false), (30, false),
    (31, false), (32, false), (33, false), (34, false), (35, false),
    (36, false), (37, false), (38, false), (39, false), (40, false),
    (41, false), (42, false), (43, false), (44, false), (45, false),
    (46, false), (47, false), (48, false), (49, false), (50, false),
    (51, false), (52, false), (53, false), (54, false), (55, false),
    (56, false), (57, false), (58, false), (59, false), (60, false)
ON CONFLICT (version) DO NOTHING;