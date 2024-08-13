import {
  AgreementDoc,
  Breadcrumb,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

export const generateMetadata = (
  ccns: DocumentElasticWithSource<AgreementDoc>[],
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  breadcrumbs: Breadcrumb[]
): ContributionMetadata => {
  const cc = ccns.find((v) => v.num === parseInt(contribution.idcc));

  const titleWithQuestion =
    cc?.shortTitle &&
    cc.shortTitle.length > 14 &&
    contribution.questionName.length > 50
      ? `${contribution.questionName} - ${cc.shortTitle}`
      : contribution.questionName;

  const metaTitle =
    contribution.seoTitle ??
    (breadcrumbs.length > 0 && cc?.shortTitle
      ? `${breadcrumbs[breadcrumbs.length - 1].label} - ${cc.shortTitle}`
      : titleWithQuestion);

  const metaDescription = `${metaTitle} - ${contribution.description}`;

  return {
    title: titleWithQuestion,
    text: contribution.description, // champ qui est indexé par elasticsearch
    metaTitle,
    metaDescription,
  };
};
