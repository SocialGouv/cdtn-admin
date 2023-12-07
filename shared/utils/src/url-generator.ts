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
  audience: "associations" | "particuliers" | "professionnels-entreprises",
  ficheSpInitialId: string
) => {
  return `https://www.service-public.fr/${audience}/vosdroits/${ficheSpInitialId}`;
};

export const generateFichesSpRefLocal = (
  urlSlug: string,
  withPrefix = true
) => {
  return `${
    withPrefix ? "https://code.travail.gouv.fr" : ""
  }/fiche-service-public/${urlSlug}`;
};
