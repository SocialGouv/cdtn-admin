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
  audience: string,
  ficheSpInitialId: string
) => {
  const lowerCased = audience.toLowerCase();
  switch (lowerCased) {
    case "associations":
      return `https://www.service-public.fr/associations/vosdroits/${ficheSpInitialId}`;
    case "particuliers":
      return `https://www.service-public.fr/particuliers/vosdroits/${ficheSpInitialId}`;
    case "professionnels":
      return `https://entreprendre.service-public.fr/vosdroits/${ficheSpInitialId}`;
  }
};
