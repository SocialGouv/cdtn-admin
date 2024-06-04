import {
  AgreementDoc,
  Breadcrumb,
  ContributionConventionnelInfos,
  ContributionDocumentJson,
  ContributionElasticDocument,
  ContributionGenericInfos,
  ContributionHighlight,
  DocumentElasticWithSource,
  ContributionLinkedContent,
} from "@socialgouv/cdtn-types";
import { generateMetadata } from "./generateMetadata";
import { isGenericContribution, isGenericNotCdtContribution } from "./helpers";
import { getCcSupported } from "./getCcSupported";
import { fetchAgreementUnextended } from "./fetchCcUnextended";
import { getCcInfos } from "./getCcInfos";
import { generateContent } from "./generateContent";
import { GetBreadcrumbsFn } from "../breadcrumbs";
import { addGlossaryToContent } from "./addGlossaryToContent";
import { generateMessageBlock } from "./generateMessageBlock";
import { generateLinkedContent } from "./generateLinkedContent";
import pMap from "p-map";
import { generateReferences } from "./generateReferences";

export type ContributionElasticDocumentLightRelatedContent = Omit<
  ContributionElasticDocument,
  "linkedContent"
> & {
  linkedContent: ContributionLinkedContent[];
};

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  addGlossary: (valueInHtml: string) => string,
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<ContributionElasticDocument[]> {
  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: Record<number, Breadcrumb[]>, contribution) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.questionIndex] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  const generatedContributions: ContributionElasticDocumentLightRelatedContent[] =
    [];

  for (let i = 0; i < contributions.length; i++) {
    const contrib = contributions[i];
    const contribGeneric = contributions.find(
      (c) => c.questionId === contrib.questionId && c.idcc === "0000"
    );
    const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

    const content = await generateContent(contribGeneric, contrib);

    const messageBlock = await generateMessageBlock(contribGeneric, contrib);

    const references = generateReferences(contribGeneric, contrib);

    const ccUnextended = await fetchAgreementUnextended();

    let doc:
      | ContributionConventionnelInfos
      | ContributionGenericInfos
      | undefined;

    if (isGenericContribution(contrib)) {
      doc = {
        ccSupported: getCcSupported(contributions, contrib),
        ccUnextended: isGenericNotCdtContribution(contrib.contentType)
          ? ccUnextended
          : [],
      };
    } else {
      doc = {
        ...getCcInfos(ccnData, contrib),
      };
    }

    generatedContributions.push({
      ...contrib,
      ...generateMetadata(contrib),
      ...addGlossaryToContent(content, addGlossary),
      ...doc,
      breadcrumbs:
        contrib.breadcrumbs.length > 0
          ? contrib.breadcrumbs
          : breadcrumbsOfRootContributionsPerIndex[contrib.questionIndex] ?? [],
      highlight,
      messageBlock,
      references,
    });
  }

  // Some related content link to another customized contribution
  // In this case, the description of the contribution is not available
  // so we populate the related content at the end
  const allGeneratedContributions = await pMap(
    generatedContributions,
    async (contribution): Promise<ContributionElasticDocument> => {
      const linkedContent = await generateLinkedContent(
        generatedContributions,
        contribution,
        getBreadcrumbs,
        breadcrumbsOfRootContributionsPerIndex
      );
      return {
        ...contribution,
        linkedContent,
      } as ContributionElasticDocument;
    },
    { concurrency: 5 }
  );

  return allGeneratedContributions;
}
