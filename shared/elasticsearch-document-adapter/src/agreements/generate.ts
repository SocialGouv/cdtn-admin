import {
  AgreementDoc,
  AgreementsGenerated,
  ContributionElasticDocument,
  OldContributionElasticDocument,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getIDCCs } from "./getIdcc";
import getAgreementsArticlesByTheme from "./getAgreementsArticlesByTheme";

export const generateAgreements = async (
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  newContributions: ContributionElasticDocument[],
  oldContributions: OldContributionElasticDocument[]
): Promise<AgreementsGenerated[]> => {
  const promises = ccnData.map(async (cc) => {
    const contribIDCCs = getIDCCs(oldContributions, newContributions);

    const newContributionByIdcc = newContributions.filter((item) => {
      return parseInt(item.idcc) === cc.num;
    });

    const oldContributionByIdcc = oldContributions.filter((item) => {
      const [idcc] = item.slug.split("-");
      return idcc === cc.num.toString();
    });

    const oldAnswers = oldContributionByIdcc.map(
      (data: OldContributionElasticDocument) => {
        return {
          ...data,
          answer: data.answers,
          theme:
            data.breadcrumbs && data.breadcrumbs.length > 0
              ? data.breadcrumbs[0].label
              : undefined,
          oldContrib: true,
        };
      }
    );

    const articlesByTheme = await getAgreementsArticlesByTheme(cc.num);

    return {
      ...cc,
      answers: [...oldAnswers],
      articlesByTheme,
      contributions: contribIDCCs.has(cc.num),
      description: `Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant la convention collective ${cc.shortTitle}`,
      source: SOURCES.CCN,
    };
  });

  return Promise.all(promises);
};
