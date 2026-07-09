import type { AccoArchive } from "./fetchAccoArchives";

/**
 * Détermine les archives restant à ingérer et les ordonne pour le traitement :
 * - on écarte celles déjà ingérées (présentes dans `ingestedNames`) ;
 * - la base complète (`full` / Freemium) passe avant les incréments, car elle
 *   sert d'amorce ;
 * - à type égal, on traite par date d'archive croissante (ordre chronologique
 *   de publication).
 */
export function selectArchivesToIngest(
  archives: AccoArchive[],
  ingestedNames: Iterable<string>
): AccoArchive[] {
  const ingested = new Set(ingestedNames);
  return archives
    .filter((archive) => !ingested.has(archive.name))
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "full" ? -1 : 1;
      }
      return a.date.getTime() - b.date.getTime();
    });
}
