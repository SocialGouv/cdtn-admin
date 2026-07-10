import got from "got";

/**
 * Index Apache listant les archives ACCO (accords d'entreprise) publiées par la
 * DILA. Référencé par la resource « Base ACCO » du dataset data.gouv.fr
 * `acco-accords-dentreprise`.
 */
export const ACCO_INDEX_URL = "https://echanges.dila.gouv.fr/OPENDATA/ACCO/";

/**
 * - `full` : base complète historique (archive `Freemium_acco_global_*`)
 * - `incremental` : mise à jour publiée régulièrement (archive `ACCO_*`)
 */
export type AccoArchiveType = "full" | "incremental";

export interface AccoArchive {
  /** Nom du fichier, ex: `ACCO_20260629-064356.tar.gz` */
  name: string;
  /** URL absolue de téléchargement */
  url: string;
  /** Date extraite du nom de fichier (UTC) */
  date: Date;
  type: AccoArchiveType;
}

// href d'un lien pointant vers une archive `.tar.gz`
const TARGZ_HREF_RE = /href="([^"]+\.tar\.gz)"/gi;
// horodatage `YYYYMMDD-HHMMSS` présent dans le nom des archives
const ARCHIVE_DATE_RE = /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/;

function parseArchiveDate(name: string): Date | null {
  const match = ARCHIVE_DATE_RE.exec(name);
  if (!match) {
    return null;
  }
  const [, year, month, day, hours, minutes, seconds] = match;
  return new Date(
    Date.UTC(+year, +month - 1, +day, +hours, +minutes, +seconds)
  );
}

function getArchiveType(name: string): AccoArchiveType | null {
  if (name.startsWith("Freemium")) {
    return "full";
  }
  if (name.startsWith("ACCO_")) {
    return "incremental";
  }
  return null;
}

/**
 * Récupère la liste des archives ACCO à extraire pour l'ingestion en parsant la
 * page d'index de la DILA. Retourne toutes les archives listées ; le filtrage
 * de ce qui reste à ingérer est effectué en aval.
 */
export async function fetchAccoArchives(
  indexUrl: string = ACCO_INDEX_URL
): Promise<AccoArchive[]> {
  const html = await got(indexUrl).text();
  const archives: AccoArchive[] = [];
  for (const match of html.matchAll(TARGZ_HREF_RE)) {
    const href = match[1];
    const name = decodeURIComponent(href.split("/").pop() as string);
    const type = getArchiveType(name);
    if (!type) {
      continue;
    }
    const date = parseArchiveDate(name);
    if (!date) {
      continue;
    }
    archives.push({
      name,
      url: new URL(href, indexUrl).href,
      date,
      type,
    });
  }
  return archives;
}
