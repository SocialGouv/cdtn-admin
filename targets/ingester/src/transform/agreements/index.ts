import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { Question } from "@socialgouv/contributions-data-types";
import type { Agreement, IndexedAgreement } from "@socialgouv/kali-data-types";
import remark from "remark";
import html from "remark-html";

import type { AgreementPage } from "../../index.js";
import { formatIdcc } from "../../lib/formatIdcc.js";
import { getJson } from "../../lib/getJson.js";
import getAgreementsWithHighlight from "./agreementsWithHighlight";
import { getAllKaliBlocks } from "./getKaliBlock.js";
import { getKaliArticlesByTheme } from "./kaliArticleBytheme.js";

const compiler = remark().use(html, { sanitize: true });

type QuestionWithSlug = Question & { slug: string };

export const createSorter =
  <A>(fn: (data: A) => number) =>
  (a: A, b: A) =>
    fn(a) - fn(b);

export default async function getAgreementDocuments(pkgName: string) {
  const agreements = await getJson<IndexedAgreement[]>(
    `${pkgName}/data/index.json`
  );

  const contributions = await getJson<Question[]>(
    `@socialgouv/contributions-data/data/contributions.json`
  );

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
    const agreementTree = await getJson<Agreement>(
      `@socialgouv/kali-data/data/${agreement.id}.json`
    );

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
  const sorter = createSorter(({ num }: AgreementPage) => num);
  return agreementPages.sort(sorter);
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
