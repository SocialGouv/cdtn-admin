-- Métadonnées des accords d'entreprise (open data ACCO / data.gouv.fr).
-- La clé primaire est l'identifiant DILA (ex: ACCOTEXT000053935667) : une
-- republication de l'accord met à jour la ligne existante (upsert).
CREATE TABLE "accords"."accords" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "siret" text,
  "date_maj" date,
  "date_depot" date,
  "date_effet" date,
  "date_fin" date,
  "date_diffusion" date,
  "conforme_version_integrale" boolean NOT NULL DEFAULT false,
  "themes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "signataires" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "accords_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "accords"."accords" IS E'Accords d''entreprise issus de l''open data ACCO (DILA / data.gouv.fr)';

-- Recherche des accords par SIRET (cas d'usage principal côté frontend).
CREATE INDEX "accords_accords_siret_idx" ON "accords"."accords" ("siret");
-- Filtre des accords actifs (DATE_FIN dans le futur) à l'export.
CREATE INDEX "accords_accords_date_fin_idx" ON "accords"."accords" ("date_fin");

-- Suivi d'ingestion : une ligne par archive .tar.gz déjà traitée, pour ne
-- réingérer que les nouvelles archives publiées par la DILA.
CREATE TABLE "accords"."ingested_archives" (
  "name" text NOT NULL,
  "url" text NOT NULL,
  "archive_date" timestamptz NOT NULL,
  "type" text NOT NULL,
  "accords_count" integer NOT NULL DEFAULT 0,
  "ingested_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "accords_ingested_archives_pkey" PRIMARY KEY ("name"),
  CONSTRAINT "accords_ingested_archives_type_check"
    CHECK ("type" IN ('full', 'incremental'))
);
COMMENT ON TABLE "accords"."ingested_archives" IS E'Archives ACCO déjà ingérées (suivi d''ingestion)';
