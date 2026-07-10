import { gqlClient } from "@shared/utils";

import type { AccoArchive } from "./fetchAccoArchives";
import type { Accord } from "./parseAccordXml";

const getIngestedArchivesQuery = `
  query ingested_archives {
    archives: accords_ingested_archives {
      name
    }
  }
`;

interface IngestedArchivesResult {
  archives: { name: string }[];
}

const upsertAccordsMutation = `
  mutation upsert_accords($objects: [accords_accords_insert_input!]!) {
    accords: insert_accords_accords(
      objects: $objects
      on_conflict: {
        constraint: accords_pkey
        update_columns: [
          title
          siret
          date_maj
          date_depot
          date_effet
          date_fin
          date_diffusion
          conforme_version_integrale
          themes
          signataires
          updated_at
        ]
      }
    ) {
      affected_rows
    }
  }
`;

interface UpsertAccordsResult {
  accords: { affected_rows: number };
}

const upsertIngestedArchiveMutation = `
  mutation upsert_ingested_archive(
    $object: accords_ingested_archives_insert_input!
  ) {
    archive: insert_accords_ingested_archives_one(
      object: $object
      on_conflict: {
        constraint: accords_ingested_archives_pkey
        update_columns: [url, archive_date, type, accords_count, ingested_at]
      }
    ) {
      name
    }
  }
`;

interface UpsertIngestedArchiveResult {
  archive: { name: string } | null;
}

const deleteAccordsMutation = `
  mutation delete_accords($ids: [String!]!) {
    accords: delete_accords_accords(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

interface DeleteAccordsResult {
  accords: { affected_rows: number };
}

/** Noms des archives déjà ingérées (pour ne traiter que les nouvelles). */
export async function getIngestedArchiveNames(): Promise<string[]> {
  const result = await gqlClient()
    .query<IngestedArchivesResult>(getIngestedArchivesQuery, {})
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error("error while retrieving ingested accords archives");
  }
  return result.data?.archives.map((archive) => archive.name) ?? [];
}

function toInsertInput(accord: Accord) {
  return {
    id: accord.id,
    title: accord.title,
    siret: accord.siret,
    date_maj: accord.dateMaj,
    date_depot: accord.dateDepot,
    date_effet: accord.dateEffet,
    date_fin: accord.dateFin,
    date_diffusion: accord.dateDiffusion,
    conforme_version_integrale: accord.conformeVersionIntegrale,
    themes: accord.themes,
    signataires: accord.signataires,
    updated_at: new Date().toISOString(),
  };
}

/** Insère ou met à jour (upsert par `id`) un lot d'accords. */
export async function upsertAccords(accords: Accord[]): Promise<number> {
  if (accords.length === 0) {
    return 0;
  }
  const result = await gqlClient()
    .mutation<UpsertAccordsResult>(upsertAccordsMutation, {
      objects: accords.map(toInsertInput),
    })
    .toPromise();
  if (result.error) {
    console.error(result.error.graphQLErrors[0] ?? result.error);
    throw new Error("error while upserting accords");
  }
  return result.data?.accords.affected_rows ?? 0;
}

/** Supprime un lot d'accords par identifiant. Retourne le nombre supprimé. */
export async function deleteAccords(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }
  const result = await gqlClient()
    .mutation<DeleteAccordsResult>(deleteAccordsMutation, { ids })
    .toPromise();
  if (result.error) {
    console.error(result.error.graphQLErrors[0] ?? result.error);
    throw new Error("error while deleting accords");
  }
  return result.data?.accords.affected_rows ?? 0;
}

/** Marque une archive comme ingérée (suivi d'ingestion). */
export async function markArchiveIngested(
  archive: AccoArchive,
  accordsCount: number
): Promise<void> {
  const result = await gqlClient()
    .mutation<UpsertIngestedArchiveResult>(upsertIngestedArchiveMutation, {
      object: {
        name: archive.name,
        url: archive.url,
        archive_date: archive.date.toISOString(),
        type: archive.type,
        accords_count: accordsCount,
        ingested_at: new Date().toISOString(),
      },
    })
    .toPromise();
  if (result.error) {
    console.error(result.error.graphQLErrors[0] ?? result.error);
    throw new Error(`error while marking archive ingested ${archive.name}`);
  }
}
