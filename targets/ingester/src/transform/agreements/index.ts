import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";

import type { AgreementPage, Question } from "../../index";
import { AgreementAnswer, AnswerWithCC } from "../../index";
import { loadAgreement, loadAgreements } from "../../lib/data-loaders";
import { fetchContributions } from "../../lib/fetchContributions";
import { formatIdcc } from "../../lib/formatIdcc";
import getAgreementsWithHighlight from "./agreementsWithHighlight";
import { getAllKaliBlocks } from "./getKaliBlock";
import { getKaliArticlesByTheme } from "./kaliArticleBytheme";

type QuestionWithSlug = Question & { slug: string };

export const createSorter =
  <A>(fn: (data: A) => number) =>
  (a: A, b: A) =>
    fn(a) - fn(b);

export const getContributionsWithSlug = async () => {
  const contributions: Question[] = await fetchContributions();
  return contributions.map((contrib) => {
    const slug = slugify(contrib.title);
    return {
      ...contrib,
      slug,
    };
  });
};

export default async function getAgreementDocuments() {
  const agreements = await loadAgreements();

  const allKaliBlocks = await getAllKaliBlocks();

  const contributionsWithSlug = await getContributionsWithSlug();

  const agreementsWithHighlight = await getAgreementsWithHighlight();

  const agreementPages: AgreementPage[] = [];

  for (const agreement of agreements) {
    if (agreement.id === undefined) {
      agreementPages.push(handleCCWithNoLegiFrancePage(agreement));
    } else {
      const agreementTree = await loadAgreement(agreement.id);

      const highlight = agreementsWithHighlight[agreement.num];

      agreementPages.push({
        ...getCCNInfo(agreement),
        answers: getContributionAnswers(contributionsWithSlug, agreement.num),
        articlesByTheme: getKaliArticlesByTheme(allKaliBlocks, agreementTree),
        description: `Idcc ${formatIdcc(agreement.num)} : ${
          agreement.shortTitle
        }`,
        is_searchable: true,
        source: SOURCES.CCN,
        synonymes: agreement.synonymes,
        ...(highlight ? { highlight } : {}),
      });
    }
  }
  const sorter = createSorter(({ num }: AgreementPage) => num);
  return agreementPages.sort(sorter);
}

function handleCCWithNoLegiFrancePage(
  agreement: IndexedAgreement
): AgreementPage {
  return {
    ...getAgreementInfoWithoutId(agreement),
    answers: [],
    articlesByTheme: [],
    description: `Idcc ${formatIdcc(agreement.num)} : ${agreement.shortTitle}`,
    is_searchable: false,
    is_published: false,
    source: SOURCES.CCN,
    synonymes: agreement.synonymes,
  };
}

/**
 * Get CCN general information
 */
function getCCNInfo({
  id,
  num,
  date_publi,
  effectif,
  mtime,
  title,
  shortTitle,
  url,
}: IndexedAgreement) {
  return {
    date_publi,
    effectif,
    id,
    mtime,
    num,
    shortTitle,
    slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
    text: `IDCC ${num}: ${title} ${shortTitle}`,
    title,
    url,
  };
}

/**
 * Get CCN general information
 */
function getAgreementInfoWithoutId({
  num,
  title,
  shortTitle,
}: IndexedAgreement) {
  return {
    id: `IDCC-${num}`,
    num,
    shortTitle,
    slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
    text: `IDCC ${num}: ${title} ${shortTitle}`,
    title,
  };
}

/**
 * Return contribution answer for a given idcc
 */
export function getContributionAnswers(
  contributionsWithSlug: QuestionWithSlug[],
  agreementNum: number
) {
  return contributionsWithSlug
    .map(({ title, slug, order, answers }) => {
      const answer: AnswerWithCC | undefined = answers.conventions.find(
        (a: AnswerWithCC) => parseInt(a.idcc, 10) === agreementNum
      );
      if (!answer) {
        throw new Error(
          `No answer find for CC ${agreementNum} on contrib ${title}`
        );
      }

      const formatted: AgreementAnswer = {
        contentType: answer.contentType,
        order,
        question: title,
        references: answer.references,
        genericSlug: slug,
      };

      if (answer.contentType === "ANSWER") {
        formatted.content = answer.content;
      }
      return formatted;
    })
    .sort(createSorter((a) => a.order));
}
