import {
  AgreementDoc,
  ContributionElasticDocument,
  OldContributionElasticDocument,
  AgreementGenerated,
  OldExportAnswer,
  ExportAnswer,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { getIDCCs } from "./getIdcc";
import getAgreementsArticlesByTheme from "./getAgreementsArticlesByTheme";

export const generateAgreements = async (
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  newContributions: ContributionElasticDocument[],
  oldContributions: OldContributionElasticDocument[]
): Promise<AgreementGenerated[]> => {
  const promises = ccnData.map(async (cc) => {
    const contribIDCCs = getIDCCs(oldContributions, newContributions);

    const newContributionByIdcc = newContributions.filter((item) => {
      return parseInt(item.idcc) === cc.num;
    });

    const oldContributionByIdcc = oldContributions.filter((item) => {
      return item.answers.conventionAnswer
        ? parseInt(item.answers.conventionAnswer.idcc) === cc.num
        : false;
    });

    const oldAnswers: OldExportAnswer[] = oldContributionByIdcc.map((data) => {
      return {
        ...data,
        slug: data.slug
          .split("-")
          .slice(1, data.slug.split("-").length)
          .join("-"), // Slug de la générique 😅 (on supprimera hein)
        question: data.title.trim(),
        answer: data.answers.conventionAnswer
          ? data.answers.conventionAnswer.markdown
          : data.answers.generic.markdown,
        references: data.answers.conventionAnswer
          ? data.answers.conventionAnswer.references
          : data.answers.generic.references,
        theme:
          data.breadcrumbs && data.breadcrumbs.length > 0
            ? data.breadcrumbs[0].label
            : undefined,
      };
    });
    // Suppression des réponses inutiles qui ne prévoient rien
    const unhandledRegexp =
      /La convention collective ne prévoit rien sur ce point/i;
    oldAnswers.filter((answer) => {
      return !unhandledRegexp.test(answer.answer);
    });
    // On ordonne les questions par index
    oldAnswers.sort((a, b) => a.index - b.index);

    const newAnswers: ExportAnswer[] = newContributionByIdcc
      .map((data) => {
        return {
          ...data,
          theme:
            data.breadcrumbs && data.breadcrumbs.length > 0
              ? data.breadcrumbs[0].label
              : undefined,
        };
      })
      .sort((a, b) => a.questionIndex - b.questionIndex);

    const articlesByTheme = await getAgreementsArticlesByTheme(cc.num);

    const agreementGenerated: AgreementGenerated = {
      ...cc,
      answers: [...oldAnswers, ...newAnswers],
      articlesByTheme,
      contributions: contribIDCCs.has(cc.num),
      description: `Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant la convention collective ${cc.shortTitle}`,
      source: SOURCES.CCN,
    };

    return agreementGenerated;
  });

  return Promise.all(promises);
};
