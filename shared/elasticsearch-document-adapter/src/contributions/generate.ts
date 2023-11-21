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
import { Breadcrumbs } from "../breadcrumbs";
import { addGlossaryToContent } from "./addGlossaryToContent";
import {
  ContributionConventionnelInfos,
  ContributionElasticDocument,
  ContributionGenericInfos,
} from "./types";

export function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  addGlossary: (valueInHtml: string) => string
): ContributionElasticDocument[] {
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

  contributions.forEach(async (contrib) => {
    const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

    const content = await generateContent(contributions, contrib);

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
    });
  });

  return generatedContributions;
}
