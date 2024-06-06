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
  audience:
    | "Associations"
    | "Particuliers"
    | "Professionnels"
    | "associations"
    | "particuliers"
    | "professionnels",
  ficheSpInitialId: string
): string => {
  switch (audience) {
    case "Associations":
    case "associations":
      return `https://www.service-public.fr/associations/vosdroits/${ficheSpInitialId}`;
    case "Particuliers":
    case "particuliers":
      return `https://www.service-public.fr/particuliers/vosdroits/${ficheSpInitialId}`;
    case "Professionnels":
    case "professionnels":
      return `https://entreprendre.service-public.fr/vosdroits/${ficheSpInitialId}`;
  }
};
