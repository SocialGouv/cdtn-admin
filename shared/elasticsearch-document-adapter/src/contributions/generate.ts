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
            `Aucune contribution générique a été retrovuée avec cet id ${contrib.genericAnswerId}`
          );
        }
        if (cdtContrib.type !== "content") {
          throw new Error(
            `La contribution générique ${contrib.genericAnswerId} doit être de type "content"`
          );
        }
        doc = {
          content: addGlossary(cdtContrib.content),
        };
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
        // rajouter le fait qu'on récupère le contenu de la générique dans la table document si le content_type
        const cc = ccnData.find((v) => v.num === parseInt(contrib.idcc));
        doc = {
          ...doc,
          ccnSlug: cc?.slug,
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
