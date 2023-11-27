import {
  AgreementDoc,
  Breadcrumbs,
  ContributionConventionnelInfos,
  ContributionDocumentJson,
  ContributionElasticDocument,
  ContributionGenericInfos,
  ContributionHighlight,
  DocumentElasticWithSource,
} from "@shared/types";
import { generateMetadata } from "./generateMetadata";
import { isGenericContribution } from "./helpers";
import { getCcSupported } from "./getCcSupported";
import { getCcInfos } from "./getCcInfos";
import { generateContent } from "./generateContent";
import { addGlossaryToContent } from "./addGlossaryToContent";
import { generateMessageBlock } from "./generateMessageBlock";

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  addGlossary: (valueInHtml: string) => string
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

    generatedContributions.push({
      ...contrib,
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
