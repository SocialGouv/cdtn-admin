import {
  AgreementContribAnswer,
  AgreementDoc,
  ContributionCompleteDoc,
  ContributionDocumentJson,
} from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { SOURCES } from "@socialgouv/cdtn-sources";

const ccnQR =
  "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";

export const documentToAgreementPage = (
  {
    title,
    shortTitle,
    num,
    ...content
  }: DocumentElasticWithSource<AgreementDoc>,
  contributions: (
    | DocumentElasticWithSource<ContributionCompleteDoc>
    | DocumentElasticWithSource<ContributionDocumentJson>
  )[],
  contribIDCCs: Set<number>,
  addGlossary: (text: string) => string
) => {
  const contributionByIdcc = contributions.filter(({ slug }) => {
    const [idcc] = slug.split("-");
    return idcc === num.toString();
  });
  return {
    // default effectif as some CCN doesn't have it defined
    effectif: 1,
    longTitle: title,
    shortTitle,
    title: shortTitle,
    ...content,
    answers: contributionByIdcc.reduce<
      (AgreementContribAnswer & { theme: string })[]
    >((arr, data) => {
      const [theme] = data.breadcrumbs;
      arr.push({
        index: 50,
        slug: data.slug,
        answer: "", //addGlossary(data.answer),
        theme: theme.label,
        question: "",
        references: [],
      });
      return arr;
    }, []),
    contributions: true, //contribIDCCs.has(content.num),
    description: ccnQR,
    source: SOURCES.CCN,
  };
};
