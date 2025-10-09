import { slugify } from "@socialgouv/cdtn-utils";
import type { Audience } from "@socialgouv/cdtn-types";

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
  audience: Audience,
  ficheSpInitialId: string
): string => {
  switch (audience) {
    case "associations":
      return `https://www.service-public.gouv.fr/associations/vosdroits/${ficheSpInitialId}`;
    case "particuliers":
      return `https://www.service-public.gouv.fr/particuliers/vosdroits/${ficheSpInitialId}`;
    case "professionnels":
      return `https://entreprendre.service-public.gouv.fr/vosdroits/${ficheSpInitialId}`;
  }
};
