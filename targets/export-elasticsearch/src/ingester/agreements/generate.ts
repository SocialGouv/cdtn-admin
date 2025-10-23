import {
  AgreementDoc,
  ContributionElasticDocument,
  DocumentElasticWithSource,
  ElasticAgreement,
} from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { getIDCCs } from "./getIdcc";
import getAgreementsArticlesByTheme from "./getAgreementsArticlesByTheme";
import { getTheme } from "./getTheme";
import pMap from "p-map";
import { groupByTheme } from "./groupByTheme";

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

      const answers = contributionByIdccNotUnknown.map((data) => {
        return {
          slug: data.slug,
          question: data.questionName,
          questionIndex: data.questionIndex,
          theme: getTheme(data),
        };
      });

      const articlesByTheme = await getAgreementsArticlesByTheme(cc.num);

      const agreementGenerated: ElasticAgreement = {
        ...cc,
        answers: groupByTheme(answers),
        articlesByTheme,
        contributions: contribIDCCs.has(cc.num),
        description: DESCRIPTION,
        source: SOURCES.CCN,
      };

      return agreementGenerated;
    },
    {
      concurrency: 10,
    }
  );
};
