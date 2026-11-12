import { generateLegiRef } from "@shared/utils";

/**
 * Référence de la réponse générique (Code du travail) proposée aux réponses de CC.
 * Elle est identifiée par son URL, la même que celle publiée dans le document de la réponse
 * générique : c'est avec elle que l'export applique la sélection d'une CC « Afficher la réponse ».
 * (L'identifiant des « autres références » n'est pas utilisable : elles sont supprimées puis
 * recréées à chaque sauvegarde de la réponse générique.)
 */
export type CdtReferenceItem = {
  url: string;
  label: string;
  type: "legi" | "other";
};

export type GenericReferences = {
  legiReferences: { legiArticle: { label: string } }[];
  otherReferences: { label: string; url?: string | null }[];
};

export const TYPE_LABELS: Record<CdtReferenceItem["type"], string> = {
  legi: "Article",
  other: "Autre référence",
};

/** Même titre et même URL que ceux publiés par `getReferences` (modules/contribution). */
export const buildCdtReferenceItems = (
  generic: GenericReferences | undefined
): CdtReferenceItem[] => {
  if (!generic) {
    return [];
  }
  const legi = generic.legiReferences.map(
    (ref): CdtReferenceItem => ({
      type: "legi",
      label: `Article ${ref.legiArticle.label} du code du travail`,
      url: generateLegiRef(ref.legiArticle.label),
    })
  );
  // Une autre référence sans lien ne peut pas être identifiée : elle n'est pas proposée
  const other = generic.otherReferences
    .filter((ref): ref is { label: string; url: string } => !!ref.url)
    .map(
      (ref): CdtReferenceItem => ({
        type: "other",
        label: ref.label,
        url: ref.url,
      })
    );
  const all = [...legi, ...other];
  return all.filter(
    (item, index) => all.findIndex((other) => other.url === item.url) === index
  );
};

/** Retire de la sélection les références qui n'existent plus dans la réponse générique. */
export const pruneSelection = (
  selectedUrls: string[],
  items: CdtReferenceItem[]
): string[] => selectedUrls.filter((url) => items.some((i) => i.url === url));

export type CdtReferencesMode = "readonly" | "selectable" | "none";

/**
 * - NOTHING / CDT / UNFAVOURABLE : références du Code du travail ajoutées automatiquement à l'export (lecture seule)
 * - ANSWER : cases à cocher
 * - autres types (dont UNKNOWN) et réponse générique : rien
 */
export const getCdtReferencesMode = (
  contentType: string | null | undefined,
  isGeneric: boolean
): CdtReferencesMode => {
  if (isGeneric) {
    return "none";
  }
  switch (contentType) {
    case "NOTHING":
    case "CDT":
    case "UNFAVOURABLE":
      return "readonly";
    case "ANSWER":
      return "selectable";
    default:
      return "none";
  }
};
