import { ContributionDocumentJson, ContributionHighlight } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  addGlossary: (valueInHtml: string) => string
) {
  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: any, contribution: any) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.index] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  return {
    documents: contributions.map((contrib) => {
      const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

      let doc = {};

      if (contrib.type === "content") {
        doc = {
          content: addGlossary(contrib.content),
        };
      } else if (contrib.type === "fiche-sp") {
        const ficheSpContent = "wsh";
        doc = {
          ficheSpContent,
        };
      }

      return {
        ...contrib,
        breadcrumbs:
          contrib.breadcrumbs.length > 0
            ? contrib.breadcrumbs
            : breadcrumbsOfRootContributionsPerIndex[contrib.questionIndex],
        highlight,
        ...doc,
      };
    }),
    source: SOURCES.CONTRIBUTIONS,
  };
}
