import {
  AgreementDoc,
  ContributionDocumentJson,
  ContributionHighlight,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchFicheSp } from "./fetchFicheSp";

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
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
    documents: contributions.map(async (contrib) => {
      const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

      let doc = {};

      if (contrib.type === "content") {
        doc = {
          content: addGlossary(contrib.content),
        };
      } else if (contrib.type === "fiche-sp") {
        const ficheSpContent = await fetchFicheSp(contrib.ficheSpId);
        doc = {
          url: ficheSpContent.url,
          date: ficheSpContent.date,
          raw: ficheSpContent.raw,
        };
      } else if (contrib.type === "cdt") {
        const cdtContrib = contributions.find(
          (v) => v.id === contrib.genericAnswerId
        );
        if (!cdtContrib) {
          throw new Error(
            `Aucune contribution générique a été retrouvée avec cet id ${contrib.genericAnswerId}`
          );
        }
        if (cdtContrib.type === "content") {
          doc = {
            content: addGlossary(cdtContrib.content),
          };
        } else if (cdtContrib.type === "fiche-sp") {
          const ficheSpContent = await fetchFicheSp(cdtContrib.ficheSpId);
          doc = {
            url: ficheSpContent.url,
            date: ficheSpContent.date,
            raw: ficheSpContent.raw,
          };
        }
      }

      if (contrib.idcc === "0000") {
        const ccSupported = contributions
          .filter((v) => v.questionIndex === contrib.questionIndex)
          .map((v) => v.idcc);
        doc = {
          ...doc,
          ccSupported,
        };
      } else {
        const cc = ccnData.find((v) => v.num === parseInt(contrib.idcc));
        doc = {
          ...doc,
          ccnSlug: cc?.slug,
          ccnShortTitle: cc?.shortTitle,
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