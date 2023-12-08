import { fetchDocumentContributions } from "./fetchContributions";
import { updateDocumentAvailabilityToTrue } from "./updateDocument";
import pMap from "p-map";

export async function setContributionsAvailabilityToTrue() {
  // Nous allons récupérer les contributions de la table document
  const allContributionsFromDocument = await fetchDocumentContributions();
  // Nous sélectionnons les nouvelles contributions
  const allNewContributions = allContributionsFromDocument.filter(
    (v) => "type" in v.document
  );
  // Nous récupérons les slugs des nouvelles contributions
  const allNewContributionsBySlug: string[] = allNewContributions.map(
    (v) => v.slug
  );

  // Pour chacune des nouvelles contributions nous allons les passer en is_available à true, car l'ingester les passe à false.
  await pMap(
    allNewContributionsBySlug,
    (contrib) => {
      return updateDocumentAvailabilityToTrue(contrib);
    },
    {
      concurrency: 10,
    }
  );
}
