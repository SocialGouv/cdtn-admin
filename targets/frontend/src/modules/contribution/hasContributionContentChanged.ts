import { ContributionDocumentJson } from "@socialgouv/cdtn-types";

// Champs visibles par l'usager : une modification de l'un d'eux met à jour la date de la contribution.
// Sont volontairement exclus `date` (calculée), `contentWithGlossary` (dépend du glossaire)
// et les métadonnées de la question (`questionIndex`, `questionName`, `seoTitle`, `questionId`, `idcc`).
const USER_VISIBLE_FIELDS = [
  "type",
  "contentType",
  "content",
  "messageBlockGenericNoCDT",
  "genericAnswerId",
  "ficheSpId",
  "description",
  "references",
  "linkedContent",
  "infographics",
] as const;

// Le document publié est stocké en jsonb, qui ne conserve pas l'ordre des clés :
// on trie les clés et on assimile undefined à null pour éviter les faux positifs.
const normalize = (value: unknown): unknown => {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
};

const pickUserVisibleFields = (doc: ContributionDocumentJson): string =>
  JSON.stringify(
    USER_VISIBLE_FIELDS.map((field) => normalize((doc as any)[field]))
  );

export const hasContributionContentChanged = (
  previous: ContributionDocumentJson | undefined,
  next: ContributionDocumentJson
): boolean => {
  if (!previous) return true;
  return pickUserVisibleFields(previous) !== pickUserVisibleFields(next);
};

// Date du jour (yyyy-MM-dd) dans le fuseau de Paris, indépendamment du fuseau du serveur.
export const getTodayInParis = (now: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};
