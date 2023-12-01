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
import { getTheme } from "./getTheme";
import { getInfoMessage } from "./getInfoMessage";

const OLD_DESCRIPTION =
  "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";
const DESCRIPTION =
  "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail vous concernant.";

export const generateAgreements = async (
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  newContributions: ContributionElasticDocument[],
  oldContributions: OldContributionElasticDocument[]
): Promise<AgreementGenerated[]> => {
  const promises = ccnData.map(async (cc) => {
    const contribIDCCs = getIDCCs(oldContributions, newContributions);

    const contributionByIdccNotUnknown = newContributions
      .filter((item) => {
        return parseInt(item.idcc) === cc.num;
      })
      .filter((item) => item.contentType !== "UNKNOWN");

    const oldContributionByIdcc = oldContributions.filter((item) => {
      return item.answers.conventionAnswer
        ? parseInt(item.answers.conventionAnswer.idcc) === cc.num
        : false;
    });

    // Suppression des réponses inutiles qui ne prévoient rien
    const unhandledRegexp =
      /La (<.*>|)convention collective(<.*>|) ne prévoit rien sur ce point/i;

    const oldAnswers: OldExportAnswer[] = oldContributionByIdcc
      .map((data) => {
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
      })
      .filter((answer) => {
        return !unhandledRegexp.test(answer.answer);
      });

    const newAnswers: ExportAnswer[] = contributionByIdccNotUnknown.map(
      (data) => {
        return {
          ...data,
          theme: getTheme(data),
          infoMessage: getInfoMessage(data),
        };
      }
    );

    const answers: (OldExportAnswer | ExportAnswer)[] = [
      ...oldAnswers,
      ...newAnswers,
    ].sort(
      // On ordonne les questions par index
      (a: OldExportAnswer | ExportAnswer, b: OldExportAnswer | ExportAnswer) =>
        // @ts-ignore
        (a.questionIndex ?? a.index) - (b.questionIndex ?? b.index)
    );

    const articlesByTheme = await getAgreementsArticlesByTheme(cc.num);

    const agreementGenerated: AgreementGenerated = {
      ...cc,
      answers,
      articlesByTheme,
      contributions: contribIDCCs.has(cc.num),
      description: oldAnswers.length === 0 ? DESCRIPTION : OLD_DESCRIPTION, // On affiche la nouvelle description s'il n'y a plus d'anciennes réponses conventionnelles
      source: SOURCES.CCN,
    };

    console.log(agreementGenerated);

    return agreementGenerated;
  });

  return Promise.all(promises);
};
