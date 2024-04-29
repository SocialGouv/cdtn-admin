import {
  AgreementDoc,
  ElasticAgreement,
  ContributionElasticDocument,
  ExportAnswer,
} from "@socialgouv/cdtn-types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getIDCCs } from "./getIdcc";
import getAgreementsArticlesByTheme from "./getAgreementsArticlesByTheme";
import { getTheme } from "./getTheme";
import { getInfoMessage } from "./getInfoMessage";
import pMap from "p-map";

const DESCRIPTION =
  "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail vous concernant.";

export const generateAgreements = async (
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  contributions: ContributionElasticDocument[]
): Promise<ElasticAgreement[]> => {
  return await pMap(
    ccnData,
    async (cc) => {
      const contribIDCCs = getIDCCs(contributions);

      const contributionByIdccNotUnknown = contributions
        .filter((item) => {
          return parseInt(item.idcc) === cc.num;
        })
        .filter((item) => item.contentType !== "UNKNOWN");

      const answers: ExportAnswer[] = contributionByIdccNotUnknown
        .map((data) => {
          return {
            ...data,
            theme: getTheme(data),
            infoMessage: getInfoMessage(data),
          };
        })
        .sort(
          // On ordonne les questions par index
          (a: ExportAnswer, b: ExportAnswer) =>
            // @ts-ignore
            a.questionIndex - b.questionIndex
        );

      const articlesByTheme = await getAgreementsArticlesByTheme(cc.num);

      const agreementGenerated: ElasticAgreement = {
        ...cc,
        answers,
        articlesByTheme,
        contributions: contribIDCCs.has(cc.num),
        description: DESCRIPTION, // On affiche la nouvelle description s'il n'y a plus d'anciennes réponses conventionnelles
        source: SOURCES.CCN,
      };

      return agreementGenerated;
    },
    {
      concurrency: 5,
    }
  );
};
