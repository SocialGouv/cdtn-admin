import fs from "fs";
import pRetry from "p-retry";
import path from "path";

import { batchPromises, chunk } from "../lib/batchPromises";
import {
  deleteAccords,
  getIngestedArchiveNames,
  markArchiveIngested,
  upsertAccords,
} from "./db";
import { downloadAndExtractArchive } from "./extractAccoArchive";
import type { AccoArchive } from "./fetchAccoArchives";
import { fetchAccoArchives } from "./fetchAccoArchives";
import { readAccordsFromDir } from "./readAccordsFromDir";
import { selectArchivesToIngest } from "./selectArchivesToIngest";
import { readSuppressionIds } from "./suppressions";

const ACCORDS_DATA_DIR = path.join(process.cwd(), "data", "accords");
const INSERT_CHUNK_SIZE = 500;
// nombre de lots (upsert/delete) envoyés à Hasura en parallèle
const BATCH_CONCURRENCY = 10;

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

/**
 * Ingère une archive : télécharge, extrait, parse les XML puis upsert les
 * accords en base et marque l'archive comme ingérée. Nettoie le dossier temp
 * dans tous les cas.
 */
export async function ingestArchive(
  archive: AccoArchive
): Promise<{ accords: number; deleted: number; errors: number }> {
  const destDir = path.join(ACCORDS_DATA_DIR, archive.name);
  try {
    console.time(`accords: ${archive.name}`);
    await pRetry(() => downloadAndExtractArchive(archive.url, destDir), {
      retries: 3,
      onFailedAttempt: (error) =>
        console.error(
          `accords: téléchargement ${archive.name} échoué (essai ${error.attemptNumber})`,
          error.message
        ),
    });

    const { accords, errors } = readAccordsFromDir(destDir);
    console.log(
      `accords: ${archive.name} → ${accords.length} accords (${errors} XML en erreur)`
    );

    const inserted = sum(
      await batchPromises(
        chunk(accords, INSERT_CHUNK_SIZE),
        (batch) => pRetry(() => upsertAccords(batch), { retries: 5 }),
        BATCH_CONCURRENCY
      )
    );

    // Suppressions : liste_suppression_acco.dat référence les accords retirés.
    const suppressionIds = readSuppressionIds(destDir);
    const deleted = sum(
      await batchPromises(
        chunk(suppressionIds, INSERT_CHUNK_SIZE),
        (batch) => pRetry(() => deleteAccords(batch), { retries: 5 }),
        BATCH_CONCURRENCY
      )
    );

    await markArchiveIngested(archive, accords.length);
    console.log(
      `accords: ${archive.name} ingérée (${inserted} upsert, ${deleted} supprimés sur ${suppressionIds.length} demandés)`
    );
    return { accords: accords.length, deleted, errors };
  } finally {
    fs.rmSync(destDir, { recursive: true, force: true });
    console.timeEnd(`accords: ${archive.name}`);
  }
}

/**
 * Point d'entrée de l'ingestion des accords d'entreprise (open data ACCO) :
 * liste les archives publiées par la DILA, ne traite que les nouvelles, puis
 * pour chacune télécharge, extrait, parse les XML et upsert les accords en base.
 */
export async function updateAccords(): Promise<void> {
  console.time("update accords");
  const archives = await fetchAccoArchives();
  const ingestedNames = await getIngestedArchiveNames();
  const toIngest = selectArchivesToIngest(archives, ingestedNames);

  console.log(
    `accords: ${archives.length} archives disponibles, ${toIngest.length} à ingérer`
  );

  for (const archive of toIngest) {
    await ingestArchive(archive);
  }
  console.timeEnd("update accords");
}
