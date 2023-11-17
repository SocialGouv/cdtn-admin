import slugify from "@socialgouv/cdtn-slugify";

export const generateContributionSlug = (
  agreementId: string,
  questionTitle: string
): string => {
  return agreementId !== "0000"
    ? slugify(`${parseInt(agreementId, 10)}-${questionTitle}`)
    : slugify(questionTitle);
};
