import type {
  AgreementDoc,
  ContributionCompleteDoc,
  EditorialContentDoc,
  FicheTravailEmploiDoc,
} from "@shared/types";
import { logger } from "@socialgouv/cdtn-logger";
import { SOURCES } from "@socialgouv/cdtn-sources";
import fs from "fs";
import fetch from "node-fetch";

import { buildGetBreadcrumbs } from "./breadcrumbs";
import { buildThemes } from "./buildThemes";
import { context } from "./context";
import {
  getDocumentBySource,
  getDocumentBySourceWithRelation,
  getGlossary,
} from "./fetchCdtnAdminDocuments";
import { splitArticle } from "./fichesTravailSplitter";
import { createGlossaryTransform } from "./glossary";
import { markdownTransform } from "./markdown";
import type { ThemeQueryResult } from "./types/themes";
import { keyFunctionParser } from "./utils";
import { getVersions } from "./versions";

const themesQuery = JSON.stringify({
  query: `{
  themes: documents(where: {source: {_eq: "${SOURCES.THEMES}"}}) {
    cdtnId: cdtn_id
    id: initial_id
    slug
    source
    title
    document
    contentRelations: relation_a(where: {type: {_eq: "theme-content"}, b: {is_published: {_eq: true}, is_available: {_eq: true}}}, order_by: {}) {
      content: b {
        cdtnId: cdtn_id
        slug
        source
        title
        document
      }
      position: data(path: "position")
    }
    parentRelations: relation_b(where: {type: {_eq: "theme"}}) {
      parentThemeId: document_a
      position: data(path: "position")
    }
  }
}`,
});

/**
 * Find duplicate slugs
 * @param {iterable} allDocuments is an iterable generator
 */
export async function getDuplicateSlugs(allDocuments: any) {
  let slugs: any = [];
  for await (const documents of allDocuments) {
    slugs = slugs.concat(
      documents.map(({ source, slug }: any) => `${source}/${slug}`)
    );
  }

  return slugs
    .map((slug: string) => ({
      count: slugs.filter((s: string) => slug === s).length,
      slug,
    }))
    .filter(({ count }: any) => count > 1)
    .reduce(
      (state: any, { slug, count }: any) => ({ ...state, [slug]: count }),
      {}
    );
}

export async function cdtnDocumentsGen() {
  const CDTN_ADMIN_ENDPOINT =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";

  console.error(`Accessing cdtn admin on ${CDTN_ADMIN_ENDPOINT}`);
  const themesQueryResult = await fetch(CDTN_ADMIN_ENDPOINT, {
    body: themesQuery,
    method: "POST",
  }).then(async (r: any) => {
    const data = await r.json();
    if (r.ok) {
      return data as ThemeQueryResult;
    }
    return Promise.reject(data);
  });

  if (!themesQueryResult.data) {
    throw new Error(
      `Requête pour récupérer les thèmes a échoué ${JSON.stringify(
        themesQueryResult.errors
      )}`
    );
  }
  const themes = themesQueryResult.data.themes;

  const getBreadcrumbs = buildGetBreadcrumbs(themes);

  const glossaryTerms = await getGlossary();
  const addGlossary = createGlossaryTransform(glossaryTerms);
  const durations: number[] = [];
  const addGlossaryToAllMarkdownField = (obj: Record<string, any>) => {
    return keyFunctionParser("markdown", obj, (content) => {
      const data = addGlossary(content);
      durations.push(data.duration);
      logger.info(
        `keyFunctionParser in ${data.duration} ms (size content: ${content.length})`
      );
      return data.result;
    });
  };

  logger.info("=== Editorial contents ===");
  const start = process.hrtime();
  const documents = await getDocumentBySource<EditorialContentDoc>(
    SOURCES.EDITORIAL_CONTENT,
    getBreadcrumbs
  );
  const data = {
    documents: markdownTransform(addGlossary, documents),
    source: SOURCES.EDITORIAL_CONTENT,
  };
  const end = process.hrtime(start);
  logger.info(`=== Editorial contents in ${end[1] / 1000000}ms ===`);

  logger.info("=== Courriers ===");
  const data2 = {
    documents: await getDocumentBySource(SOURCES.LETTERS, getBreadcrumbs),
    source: SOURCES.LETTERS,
  };

  logger.info("=== Outils ===");
  const data3 = {
    documents: await getDocumentBySource(SOURCES.TOOLS, getBreadcrumbs),
    source: SOURCES.TOOLS,
  };

  logger.info("=== Outils externes ===");
  const data4 = {
    documents: await getDocumentBySource(SOURCES.EXTERNALS, getBreadcrumbs),
    source: SOURCES.EXTERNALS,
  };

  logger.info("=== Dossiers ===");
  const data5 = {
    documents: await getDocumentBySource(
      SOURCES.THEMATIC_FILES,
      getBreadcrumbs
    ),
    source: SOURCES.THEMATIC_FILES,
  };

  logger.info("=== Contributions ===");
  const startC = process.hrtime();
  const contributions = await getDocumentBySource<ContributionCompleteDoc>(
    SOURCES.CONTRIBUTIONS,
    getBreadcrumbs
  );
  const endC = process.hrtime(startC);
  logger.info(`Fetch ContributionCompleteDoc in ${endC[1] / 1000000}ms`);

  const startCcn = process.hrtime();
  logger.info(`START FETCH CCN`);
  const ccnData = await getDocumentBySource<AgreementDoc>(SOURCES.CCN);
  const endCcn = process.hrtime(startCcn);
  logger.info(`Fetch CCN in ${endCcn[1] / 1000000}ms`);

  const startHighlights = process.hrtime();
  logger.info(`START FILTER HIGHTLIGHTS`);
  const ccnListWithHighlightFiltered = ccnData.filter((ccn) => {
    return ccn.highlight;
  });
  const ccnListWithHighlight = ccnListWithHighlightFiltered.reduce(
    (acc: any, curr: any) => {
      acc[curr.num] = curr.highlight;
      return acc;
    },
    {}
  );
  const endHighlights = process.hrtime(startHighlights);
  logger.info(`Filter Highlights in ${endHighlights[1] / 1000000}ms`);

  const startContrib = process.hrtime();
  logger.info(`START FILTER CONTRIB BREADCRUMBS`);
  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: any, contribution: any) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.index] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );
  const endContrib = process.hrtime(startContrib);
  logger.info(`ContribBreadcrumbs CCN in ${endContrib[1] / 1000000}ms`);

  // we keep track of the idccs used in the contributions
  // in order to flag the corresponding conventions collectives below
  const contribIDCCs = new Set();
  contributions.forEach(({ answers }: any) => {
    if (answers.conventionAnswer) {
      contribIDCCs.add(parseInt(answers.conventionAnswer.idcc));
    }
  });
  const startContribMap = process.hrtime();
  logger.info(`START MAP CONTRIBUTIONS`);
  const data01 = {
    documents: contributions.map(
      ({ answers, breadcrumbs, ...contribution }: any) => {
        const newAnswer = answers;
        if (newAnswer.conventions) {
          newAnswer.conventions = answers.conventions.map((answer: any) => {
            const highlight = ccnListWithHighlight[answer.idcc];
            return {
              ...answer,
              ...(highlight ? { highlight } : {}),
            };
          });
        }

        const obj = addGlossaryToAllMarkdownField({
          ...contribution,
          answers: {
            ...newAnswer,
          },
          breadcrumbs:
            breadcrumbs.length > 0
              ? breadcrumbs
              : breadcrumbsOfRootContributionsPerIndex[contribution.index],
        });
        return obj;
      }
    ),
    source: SOURCES.CONTRIBUTIONS,
  };
  const endContribMap = process.hrtime(startContribMap);
  logger.info(`ContribMap CCN in ${endContribMap[1] / 1000000}ms`);
  logger.info(
    `Glossarified ${durations.length} -> average ${durations.reduce(
      (total, curr) => total + curr,
      0
    )}ms`
  );
  logger.info(
    `Glossarified max : ${durations.reduce(
      (max, curr) => (curr > max ? curr : max),
      0
    )}ms & min ${durations.reduce(
      (min, curr) => (curr < min ? curr : min),
      0
    )}ms`
  );

  logger.info("=== Conventions Collectives ===");
  const ccnQR =
    "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";

  const data10 = {
    documents: ccnData.map(({ title, shortTitle, ...content }) => {
      return {
        // default effectif as some CCN doesn't have it defined
        effectif: 1,
        longTitle: title,
        shortTitle,
        title: shortTitle,
        ...content,
        answers: content.answers.map((data: any) => {
          const contrib = contributions.find(({ slug }) => data.slug === slug);
          if (!contrib) {
            // slug de la contrib
            throw `Contribution with slug ${data.slug} not found. Perhaps the contribution has been deactivated, please check on the admin.`;
          }
          const [theme] = contrib.breadcrumbs;
          return {
            ...data,
            answer: addGlossary(data.answer),
            theme: theme && theme.label,
          };
        }),
        contributions: contribIDCCs.has(content.num),
        description: ccnQR,
        source: SOURCES.CCN,
      };
    }),
    source: SOURCES.CCN,
  };

  logger.info("=== Fiches SP ===");
  const data11 = {
    documents: await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs),
    source: SOURCES.SHEET_SP,
  };

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource<FicheTravailEmploiDoc>(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  const data22 = {
    documents: fichesMT.map(({ sections, ...infos }) => ({
      ...infos,
      sections: sections.map(({ html, ...section }: any) => {
        delete section.description;
        delete section.text;
        return {
          ...section,
          html: addGlossary(html),
        };
      }),
    })),
    source: SOURCES.SHEET_MT_PAGE,
  };

  logger.info("=== Fiche MT(split) ===");
  const splittedFiches = fichesMT.flatMap(splitArticle);
  const data66 = {
    documents: splittedFiches.map((fiche) => {
      // we don't want splitted fiches to have the same cdtnId than full pages
      // it causes bugs, tons of weird bugs, but we need the id for the
      // breadcrumbs generation
      const breadcrumbs = getBreadcrumbs(fiche.cdtnId);
      delete fiche.cdtnId;
      return {
        ...fiche,
        breadcrumbs,
        source: SOURCES.SHEET_MT,
      };
    }),
    source: SOURCES.SHEET_MT,
  };

  logger.info("=== Themes ===");
  const data67 = {
    documents: buildThemes(themes, getBreadcrumbs),
    source: SOURCES.THEMES,
  };

  logger.info("=== Highlights ===");
  const data68 = {
    documents: await getDocumentBySourceWithRelation(
      SOURCES.HIGHLIGHTS,
      getBreadcrumbs
    ),
    source: SOURCES.HIGHLIGHTS,
  };

  logger.info("=== PreQualified Request ===");
  const data69 = {
    documents: await getDocumentBySourceWithRelation(
      SOURCES.PREQUALIFIED,
      getBreadcrumbs
    ),
    source: SOURCES.PREQUALIFIED,
  };

  logger.info("=== glossary ===");
  const data70 = {
    documents: [
      {
        data: glossaryTerms,
        source: SOURCES.GLOSSARY,
      },
    ],
    source: SOURCES.GLOSSARY,
  };

  logger.info("=== Code du travail ===");
  const data71 = {
    documents: await getDocumentBySource(SOURCES.CDT),
    source: SOURCES.CDT,
  };

  logger.info("=== data version ===");
  const data72 = {
    documents: [
      {
        data: getVersions(),
        source: SOURCES.VERSIONS,
      },
    ],
    source: SOURCES.VERSIONS,
  };
}
