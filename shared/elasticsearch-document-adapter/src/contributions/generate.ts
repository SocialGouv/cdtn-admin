import {
  AgreementDoc,
  ContributionDocumentJson,
  ContributionHighlight,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { generateMetadata } from "./generateMetadata";
import { isGenericContribution } from "./helpers";
import { getCcSupported } from "./getCcSupported";
import { getCcInfos } from "./getCcInfos";
import { generateContent } from "./generateContent";
import { Breadcrumbs, GetBreadcrumbsFn } from "../breadcrumbs";
import { addGlossaryToContent } from "./addGlossaryToContent";
import {
  ContributionConventionnelInfos,
  ContributionElasticDocument,
  ContributionGenericInfos,
} from "./types";
import { generateMessageBlock } from "./generateMessageBlock";
import { generateLinkedContent } from "./generateLinkedContent";

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  addGlossary: (valueInHtml: string) => string,
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<ContributionElasticDocument[]> {
  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: Record<number, Breadcrumbs[]>, contribution) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.questionIndex] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  const generatedContributions: ContributionElasticDocument[] = [];

  for (let i = 0; i < contributions.length; i++) {
    const contrib = contributions[i];
    const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

    const content = await generateContent(contributions, contrib);

    const messageBlock = await generateMessageBlock(contrib);

    let doc:
      | ContributionConventionnelInfos
      | ContributionGenericInfos
      | undefined;

    if (isGenericContribution(contrib)) {
      doc = {
        ccSupported: getCcSupported(contributions, contrib),
      };
    } else {
      doc = {
        ...getCcInfos(ccnData, contrib),
      };
    }

    const linkedContent = await generateLinkedContent(
      contrib,
      getBreadcrumbs,
      breadcrumbsOfRootContributionsPerIndex
    );

    generatedContributions.push({
      ...contrib,
      ...linkedContent,
      ...generateMetadata(contrib, content),
      ...addGlossaryToContent(content, addGlossary),
      ...doc,
      breadcrumbs:
        contrib.breadcrumbs.length > 0
          ? contrib.breadcrumbs
          : breadcrumbsOfRootContributionsPerIndex[contrib.questionIndex],
      highlight,
      messageBlock,
    });
  }

  return generatedContributions;
}
