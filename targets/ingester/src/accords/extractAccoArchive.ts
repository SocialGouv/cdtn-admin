import got from "got";
import gunzip from "gunzip-maybe";
import { Readable } from "stream";
import * as tar from "tar-fs";

/**
 * Dossier, dans l'archive ACCO, contenant les fichiers XML décrivant chaque
 * accord. Les autres dossiers (`acco/global/bureautique` : Word/PDF) sont hors
 * périmètre.
 */
export const ACCO_XML_DIR = "acco/global/ACCO/TEXT";

/** Fichier, à la racine de l'archive, listant les accords supprimés. */
export const SUPPRESSION_LIST_FILE = "liste_suppression_acco.dat";

/**
 * Normalise un chemin d'entrée d'archive : séparateurs en `/`, sans `./` ni `/`
 * initial.
 */
export function normalizeEntryPath(entryPath: string): string {
  return entryPath.replace(/\\/g, "/").replace(/^\.?\//, "");
}

// Les archives ont un dossier racine horodaté (ex: `20260424-063142/`) et les
// XML sont nichés sous des sous-dossiers shardés
// (`.../ACCO/TEXT/00/00/53/93/56/ACCOTEXT….xml`). On matche donc le dossier
// TEXT où qu'il se trouve, à n'importe quelle profondeur.
const ACCORD_XML_RE = new RegExp(`(^|/)${ACCO_XML_DIR}/.+\\.xml$`, "i");

/** Vrai si l'entrée est un fichier XML d'accord à ingérer. */
export function isAccordXml(entryPath: string): boolean {
  return ACCORD_XML_RE.test(normalizeEntryPath(entryPath));
}

/** Vrai si l'entrée est la liste des accords supprimés. */
export function isSuppressionList(entryPath: string): boolean {
  const normalized = normalizeEntryPath(entryPath);
  return (
    normalized === SUPPRESSION_LIST_FILE ||
    normalized.endsWith(`/${SUPPRESSION_LIST_FILE}`)
  );
}

/**
 * Prédicat `ignore` de tar-fs : on n'extrait que les XML d'accords et la liste
 * de suppression, tout le reste est ignoré (notamment `bureautique`, qui
 * constitue l'essentiel du volume).
 */
export function shouldIgnoreEntry(entryPath: string): boolean {
  return !isAccordXml(entryPath) && !isSuppressionList(entryPath);
}

/**
 * Décompresse et détarre un flux d'archive ACCO (`.tar.gz`) vers `destDir`, en
 * n'écrivant sur disque que les fichiers pertinents.
 */
export function extractArchive(
  source: Readable,
  destDir: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    source
      .on("error", reject)
      .pipe(gunzip())
      .on("error", reject)
      .pipe(
        tar.extract(destDir, {
          ignore: (name, header) => shouldIgnoreEntry(header?.name ?? name),
        })
      )
      .on("error", reject)
      .on("finish", resolve);
  });
}

/**
 * Télécharge une archive ACCO depuis `url` et l'extrait vers `destDir` en
 * streaming (pas de matérialisation complète de l'archive en mémoire).
 */
export function downloadAndExtractArchive(
  url: string,
  destDir: string
): Promise<void> {
  return extractArchive(got.stream(url), destDir);
}
