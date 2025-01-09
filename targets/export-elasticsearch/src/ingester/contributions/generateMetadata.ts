import {
  AgreementDoc,
  Breadcrumb,
  ContributionDocumentJson,
  ContributionMetadata,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";

export const generateMetadata = (
  agreements: DocumentElasticWithSource<AgreementDoc>[],
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  breadcrumbs: Breadcrumb[]
): ContributionMetadata => {
  if (breadcrumbs.length === 0) {
    throw new Error(
      `Merci d'assigner un thème à la contribution ${contribution.questionIndex} - ${contribution.questionName} (${contribution.id}). Cette opération est disponible dans le menu Vérifications -> Contenus sans thèmes.`
    );
  }
  
  if (contribution.idcc === "0000") {
    return generateGenericMetadata(contribution);
  }

  const agreement = agreements.find(
    (v) => v.num === parseInt(contribution.idcc)
  );

  if (!agreement) {
    throw new Error(
      `Can't find the agreement (${contribution.idcc}) information for contribution ${contribution.questionIndex} - ${contribution.questionName} (${contribution.id})`
    );
  }

  return generateCustomMetadata(
    contribution,
    breadcrumbs[breadcrumbs.length - 1],
    agreement
  );
};

const generateGenericMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>
): ContributionMetadata => {
  return {
    title: contribution.questionName,
    text: contribution.description,
    metas: {
      title: contribution.questionName,
      description: contribution.description,
    },
  };
};

const generateCustomMetadata = (
  contribution: DocumentElasticWithSource<ContributionDocumentJson>,
  breadcrumb: Breadcrumb,
  agreement: DocumentElasticWithSource<AgreementDoc>
): ContributionMetadata => {
  return {
    title: generateTitle(contribution.questionName, agreement.shortTitle),
    text: contribution.description,
    metas: {
      title: generateMetaTitle(
        contribution.seoTitle,
        breadcrumb,
        agreement.shortTitle
      ),
      description: `${contribution.questionName} - ${contribution.description}`,
    },
  };
};
const generateTitle = (
  questionName: string,
  agreementShortTitle: string | undefined
) => {
  if (
    !agreementShortTitle ||
    agreementShortTitle.length > 14 ||
    questionName.length > 50
  ) {
    return questionName;
  }
  return `${questionName} - ${agreementShortTitle}`;
};

const generateMetaTitle = (
  seoTitle: string | undefined,
  breadcrumb: Breadcrumb,
  agreementShortTitle: string
): string => {
  if (seoTitle && seoTitle !== "") {
    return `${seoTitle} - ${agreementShortTitle}`;
  }
  return `${breadcrumb.label} - ${agreementShortTitle}`;
};
