import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { Question } from "@socialgouv/contributions-data-types";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";
import remark from "remark";
import html from "remark-html";

import type { AgreementPage } from "../../index";
import { loadAgreement, loadAgreements } from "../../lib/data-loaders";
import fetchContributions from "../../lib/fetchContributions";
import { formatIdcc } from "../../lib/formatIdcc";
import getAgreementsWithHighlight from "./agreementsWithHighlight";
import { getAllKaliBlocks } from "./getKaliBlock";
import { getKaliArticlesByTheme } from "./kaliArticleBytheme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compiler = remark().use(html as any, { sanitize: true });

type QuestionWithSlug = Question & { slug: string };

export const createSorter =
  <A>(fn: (data: A) => number) =>
  (a: A, b: A) =>
    fn(a) - fn(b);

export default async function getAgreementDocuments() {
  const agreements = await loadAgreements();

  const contributions = await fetchContributions();

  const allKaliBlocks = await getAllKaliBlocks();

  const contributionsWithSlug = contributions.map((contrib) => {
    const slug = slugify(contrib.title);
    return {
      ...contrib,
      slug,
    };
  });

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
function getContributionAnswers(
  contributionsWithSlug: QuestionWithSlug[],
  agreementNum: number
) {
  return contributionsWithSlug
    .flatMap(({ title, slug, index, answers }) => {
      const maybeAnswer = answers.conventions.filter(
        ({ idcc }) => parseInt(idcc, 10) === agreementNum
      );
      if (maybeAnswer.length === 0) {
        return [];
      }
      const [answer] = maybeAnswer;
      const unhandledRegexp =
        /La convention collective ne prévoit rien sur ce point/i;
      if (unhandledRegexp.test(answer.markdown)) {
        return [];
      }
      return [
        {
          answer: compiler.processSync(answer.markdown).contents.toString(),
          index,
          question: title.trim(),
          references: answer.references,
          slug,
        },
      ];
    })
    .sort(createSorter((a) => a.index));
}
