import { AgreementDoc } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";
import {
  ContributionElasticDocument,
  OldContributionElasticDocument,
} from "../contributions/types";

const ccnQR =
  "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";

export const documentToAgreementPage = (
  {
    title,
    shortTitle,
    num,
    ...content
  }: DocumentElasticWithSource<AgreementDoc>,
  newContributions: ContributionElasticDocument[],
  oldContributions: OldContributionElasticDocument[],
  contribIDCCs: Set<number>
) => {
  const newContributionByIdcc = newContributions.filter((item) => {
    return parseInt(item.idcc) === num;
  });
  const oldContributionByIdcc = oldContributions.filter((item) => {
    const [idcc] = item.slug.split("-");
    return idcc === num.toString();
  });
  const newAnswers = newContributionByIdcc.map(
    (data: ContributionElasticDocument) => {
      return {
        index: data.questionIndex,
        slug: data.slug,
        answer: data.text,
        theme:
          data.breadcrumbs && data.breadcrumbs.length
            ? data.breadcrumbs[0].label
            : "",
        question: data.title,
        references: [],
      };
    }
  );

  const oldAnswers = oldContributionByIdcc.map(
    (data: OldContributionElasticDocument) => {
      return {
        index: data.index,
        slug: data.slug,
        answer: data.text,
        theme:
          data.breadcrumbs && data.breadcrumbs.length
            ? data.breadcrumbs[0].label
            : "",
        question: data.title,
        references: [],
        oldContrib: true,
      };
    }
  );

  return {
    // default effectif as some CCN doesn't have it defined
    effectif: 1,
    longTitle: title,
    shortTitle,
    title: shortTitle,
    ...content,
    answers: oldAnswers.concat(newAnswers as any),
    contributions: contribIDCCs.has(num),
    description: ccnQR,
    source: SOURCES.CCN,
  };
};
