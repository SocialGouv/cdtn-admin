import { fetchAccoArchives } from "./fetchAccoArchives";
import { ingestArchive } from ".";

/**
 * Runner de développement : ingère UNE seule archive ACCO pour valider le
 * pipeline en local de bout en bout.
 *
 * Par défaut, une petite archive incrémentale connue (~685 Ko). Surchargeable
 * via la variable d'env `ACCO_ARCHIVE` (nom exact du .tar.gz), y compris la
 * base complète Freemium :
 *
 *   ACCO_ARCHIVE=ACCO_20260427-063417.tar.gz pnpm cli:accords:one
 *   ACCO_ARCHIVE=Freemium_acco_global_20250713-140000.tar.gz pnpm cli:accords:one
 */
const DEFAULT_ARCHIVE = "ACCO_20260424-063142.tar.gz";

async function main() {
  const wanted = process.env.ACCO_ARCHIVE ?? DEFAULT_ARCHIVE;
  const archives = await fetchAccoArchives();
  const archive = archives.find((a) => a.name === wanted);
  if (!archive) {
    throw new Error(
      `Archive introuvable dans l'index DILA: ${wanted}\nDisponibles: ${archives
        .map((a) => a.name)
        .join(", ")}`
    );
  }
  console.log(`accords[dev]: ingestion de ${archive.name} (${archive.type})…`);
  const result = await ingestArchive(archive);
  console.log(
    `accords[dev]: terminé — ${result.accords} accords, ${result.deleted} supprimés, ${result.errors} erreurs`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
