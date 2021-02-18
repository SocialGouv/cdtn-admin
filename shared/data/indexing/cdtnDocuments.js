import { SOURCES } from "@socialgouv/cdtn-sources";
import fetch from "node-fetch";
import pMap from "p-map";
import pRetry from "p-retry";

import { buildGetBreadcrumbs } from "./breadcrumbs";
import { buildThemes } from "./buildThemes";
import {
  getAllKaliBlocks,
  getDocumentBySource,
  getDocumentBySourceWithRelation,
  getGlossary,
} from "./fetchCdtnAdminDocuments";
import { splitArticle } from "./fichesTravailSplitter";
import { createGlossaryTransform } from "./glossary";
import { getArticlesByTheme } from "./kali";
import { logger } from "./logger";
import { markdownTransform } from "./markdown";
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
    contentRelations: relation_a(where: {type: {_eq: "theme-content"}}, order_by: {}) {
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
export async function getDuplicateSlugs(allDocuments) {
  let slugs = [];
  for await (const documents of allDocuments) {
    slugs = slugs.concat(
      documents.map(({ source, slug }) => `${source}/${slug}`)
    );
  }

  return slugs
    .map((slug) => ({ count: slugs.filter((s) => slug === s).length, slug }))
    .filter(({ count }) => count > 1)
    .reduce((state, { slug, count }) => ({ ...state, [slug]: count }), {});
}

export async function* cdtnDocumentsGen() {
  const CDTN_ADMIN_ENDPOINT =
    process.env.CDTN_ADMIN_ENDPOINT || "http://localhost:8080/v1/graphql";

  logger.info(`Accessing cdtn admin on ${CDTN_ADMIN_ENDPOINT}`);
  const themesQueryResult = await pRetry(
    async () => {
      const response = await fetch(CDTN_ADMIN_ENDPOINT, {
        body: themesQuery,
        method: "POST",
      });

      if (response.status >= 400) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data);
      }

      if (data.errors) {
        logger.error(data);
        throw new Error(data.errors);
      }

      return data;
    },
    {
      onFailedAttempt: async (error) => {
        console.log(
          `On "${CDTN_ADMIN_ENDPOINT}".` +
            ` Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
        );

        // NOTE(douglasduteil): wait ~1min x 10 for the database to be restore
        // In dev cases, the script could run before the database is restored
        // To make the scirpt less floppy we retry 10 times every minutes
        await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      },
      retries: 10,
    }
  );

  logger.info("themes fetched");

  const themes = themesQueryResult.data.themes;

  const getBreadcrumbs = buildGetBreadcrumbs(themes);

  const glossaryTerms = await getGlossary();
  const addGlossary = createGlossaryTransform(glossaryTerms);

  logger.info("=== Editorial contents ===");
  const documents = await getDocumentBySource(SOURCES.EDITORIAL_CONTENT);
  yield {
    documents: markdownTransform(addGlossary, documents),
    source: SOURCES.EDITORIAL_CONTENT,
  };

  logger.info("=== Courriers ===");
  yield {
    documents: await getDocumentBySource(SOURCES.LETTERS, getBreadcrumbs),
    source: SOURCES.LETTERS,
  };

  logger.info("=== Outils ===");
  yield {
    documents: await getDocumentBySource(SOURCES.TOOLS, getBreadcrumbs),
    source: SOURCES.TOOLS,
  };

  logger.info("=== Outils externes ===");
  yield {
    documents: await getDocumentBySource(SOURCES.EXTERNALS, getBreadcrumbs),
    source: SOURCES.EXTERNALS,
  };

  logger.info("=== Dossiers ===");
  yield {
    documents: await getDocumentBySource(
      SOURCES.THEMATIC_FILES,
      getBreadcrumbs
    ),
    source: SOURCES.THEMATIC_FILES,
  };

  logger.info("=== Code du travail ===");
  yield {
    documents: await getDocumentBySource(SOURCES.CDT),
    source: SOURCES.CDT,
  };

  logger.info("=== Contributions ===");
  const contributions = await getDocumentBySource(
    SOURCES.CONTRIBUTIONS,
    getBreadcrumbs
  );
  // we keep track of the idccs used in the contributions
  // in order to flag the corresponding conventions collectives below
  const contribIDCCs = new Set();
  contributions.forEach(({ answers }) => {
    if (answers.conventionAnswer) {
      contribIDCCs.add(parseInt(answers.conventionAnswer.idcc));
    }
  });

  yield {
    documents: contributions.map(({ answers, ...contribution }) => ({
      ...contribution,
      answers: {
        ...answers,
        generic: {
          ...answers.generic,
          markdown: addGlossary(answers.generic.markdown),
        },
      },
    })),
    source: SOURCES.CONTRIBUTIONS,
  };

  logger.info("=== Conventions Collectives ===");
  const ccnQR =
    "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";
  const ccnData = await getDocumentBySource(SOURCES.CCN);
  const allKaliBlocks = await getAllKaliBlocks();
  yield {
    documents: await pMap(
      ccnData,
      async ({ title, shortTitle, ...content }) => {
        // we use our custom description
        delete content.description;
        const articlesByTheme = await getArticlesByTheme(
          allKaliBlocks,
          content.id
        );
        return {
          description: ccnQR,
          longTitle: title,
          shortTitle,
          title: shortTitle,
          ...content,
          answers: content.answers.map((data) => {
            const contrib = contributions.find(
              ({ slug }) => data.slug === slug
            );
            if (!contrib) {
              throw "unknown contribution";
            }
            const [theme] = contrib.breadcrumbs;
            return {
              ...data,
              answer: addGlossary(data.answer),
              theme: theme && theme.label,
            };
          }),
          articlesByTheme,
          contributions: contribIDCCs.has(content.num),
          source: SOURCES.CCN,
        };
      },
      // NOTE(douglasduteil): limite the concurrent request to unpkg
      // As we get kali data from unpkg now, we should limit the concurrent
      // request to it to ensure not having many http errors.
      { concurrency: 5 }
    ),
    source: SOURCES.CCN,
  };

  logger.info("=== Fiches SP ===");
  yield {
    documents: await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs),
    source: SOURCES.SHEET_SP,
  };

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  yield {
    documents: fichesMT.map(({ sections, ...infos }) => ({
      ...infos,
      sections: sections.map(({ html, ...section }) => {
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
  yield {
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
  yield {
    documents: buildThemes(themes, getBreadcrumbs),
    source: SOURCES.THEMES,
  };

  logger.info("=== Highlights ===");
  yield {
    documents: await getDocumentBySourceWithRelation(
      SOURCES.HIGHLIGHTS,
      getBreadcrumbs
    ),
    source: SOURCES.HIGHLIGHTS,
  };

  logger.info("=== PreQualified Request ===");
  yield {
    documents: await getDocumentBySourceWithRelation(
      SOURCES.PREQUALIFIED,
      getBreadcrumbs
    ),
    source: SOURCES.PREQUALIFIED,
  };

  logger.info("=== glossary ===");
  yield {
    documents: [
      {
        data: glossaryTerms,
        source: SOURCES.GLOSSARY,
      },
    ],
    source: SOURCES.GLOSSARY,
  };

  logger.info("=== data version ===");
  yield {
    documents: [
      {
        data: getVersions(),
        source: SOURCES.VERSIONS,
      },
    ],
    source: SOURCES.VERSIONS,
  };
}
