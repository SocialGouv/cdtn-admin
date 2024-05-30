import { slugify } from "@socialgouv/cdtn-utils";

export const generateKaliRef = (
  kaliArticleId: string,
  agreementContainerId: string
) => {
  return `https://legifrance.gouv.fr/conv_coll/id/${kaliArticleId}/?idConteneur=${agreementContainerId}`;
};

export const generateLegiRef = (
  legiArticleTitle: string,
  withPrefix = true
) => {
  return `${
    withPrefix ? "https://code.travail.gouv.fr" : ""
  }/code-du-travail/${slugify(legiArticleTitle)}`;
};

export const generateFichesSpRef = (
  audience: "Associations" | "Particuliers" | "Professionnels",
  ficheSpInitialId: string
) => {
  switch (audience) {
    case "Associations":
      return `https://www.service-public.fr/associations/vosdroits/${ficheSpInitialId}`;
    case "Particuliers":
      return `https://www.service-public.fr/particuliers/vosdroits/${ficheSpInitialId}`;
    case "Professionnels":
      return `https://entreprendre.service-public.fr/vosdroits/${ficheSpInitialId}`;
  }
};

export const generateFichesSpRefLocal = (
  urlSlug: string,
  withPrefix = true
) => {
  return `${
    withPrefix ? "https://code.travail.gouv.fr" : ""
  }/fiche-service-public/${urlSlug}`;
};
