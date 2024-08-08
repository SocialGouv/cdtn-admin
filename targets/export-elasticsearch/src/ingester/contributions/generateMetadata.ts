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

  const defaultTitle = contribution.seoTitle ?? titleWithQuestion;

  const metaTitle =
    breadcrumbs.length > 0 && cc?.shortTitle
      ? `${breadcrumbs[breadcrumbs.length - 1].label} + " - " + ${
          cc.shortTitle
        }`
      : defaultTitle;

  const metaDescription = `${defaultTitle} ${contribution.description}`;

  return {
    title: defaultTitle,
    text: contribution.description, // champ qui est indexé par elasticsearch
    metas: {
      title: metaTitle,
      description: metaDescription,
    },
  };
};
