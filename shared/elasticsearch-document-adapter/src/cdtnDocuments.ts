import type {
  AgreementDoc,
  ContributionCompleteDoc,
  ContributionDocumentJson,
  ContributionHighlight,
  EditorialContentDoc,
  FicheTravailEmploiDoc,
} from "@shared/types";
import { logger } from "@socialgouv/cdtn-logger";
import { SOURCES } from "@socialgouv/cdtn-sources";
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
import { DocumentElasticWithSource } from "./types/Glossary";
import {
  isNewContribution,
  generateContributions,
  isOldContribution,
} from "./contributions";

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

export function getIDCCs(
  oldContributions: DocumentElasticWithSource<ContributionCompleteDoc>[],
  newContributions: DocumentElasticWithSource<ContributionDocumentJson>[]
) {
  const contribIDCCs = new Set<number>();
  oldContributions.forEach(({ answers }: any) => {
    if (answers.conventionAnswer) {
      const idccNum = parseInt(answers.conventionAnswer.idcc);
      contribIDCCs.add(idccNum);
    }
  });
  newContributions.forEach((contrib: any) => {
    if (contrib.idcc !== "0000") {
      const idccNum = parseInt(contrib.idcc);
      contribIDCCs.add(idccNum);
    }
  });
  return contribIDCCs;
}

export async function* cdtnDocumentsGen() {
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
  const addGlossaryToAllMarkdownField = (obj: Record<string, any>) => {
    return keyFunctionParser("markdown", obj, (content) =>
      addGlossary(content)
    );
  };

  logger.info("=== Editorial contents ===");
  const documents = await getDocumentBySource<EditorialContentDoc>(
    SOURCES.EDITORIAL_CONTENT,
    getBreadcrumbs
  );
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

  logger.info("=== Contributions ===");
  const contributions: DocumentElasticWithSource<
    ContributionDocumentJson | ContributionCompleteDoc
  >[] = await getDocumentBySource<ContributionCompleteDoc>(
    SOURCES.CONTRIBUTIONS,
    getBreadcrumbs
  );

  const ccnData = await getDocumentBySource<AgreementDoc>(SOURCES.CCN);

  const ccnListWithHighlightFiltered = ccnData.filter((ccn) => {
    return ccn.highlight;
  });

  const ccnListWithHighlight = ccnListWithHighlightFiltered.reduce(
    (acc: Record<number, ContributionHighlight>, curr) => {
      acc[curr.num] = curr.highlight as any;
      return acc;
    },
    {}
  );

  const newContributions = contributions.filter(isNewContribution);

  const newGeneratedContributions = await generateContributions(
    newContributions,
    ccnData,
    ccnListWithHighlight,
    addGlossary
  );

  const oldContributions: DocumentElasticWithSource<ContributionCompleteDoc>[] =
    contributions.filter(isOldContribution);

  const breadcrumbsOfRootContributionsPerIndex = oldContributions.reduce(
    (state: any, contribution: any) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.index] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  const oldGeneratedContributions = oldContributions.map(
    ({ answers, breadcrumbs, ...contribution }: any) => {
      const newAnswer = answers;
      if (newAnswer.conventions) {
        newAnswer.conventions = answers.conventions.map((answer: any) => {
          const highlight = ccnListWithHighlight[parseInt(answer.idcc)];
          const cc = ccnData.find((v) => v.num === parseInt(answer.idcc));
          const answerWithSlug = {
            ...answer,
            conventionAnswer: {
              ...answer.conventionAnswer,
              slug: cc?.slug,
            },
          };
          return {
            ...answerWithSlug,
            ...(highlight ? { highlight } : {}),
          };
        });
      }

      if (newAnswer.conventionAnswer) {
        const highlight =
          ccnListWithHighlight[parseInt(newAnswer.conventionAnswer.idcc)];
        if (highlight) {
          newAnswer.conventionAnswer = {
            ...newAnswer.conventionAnswer,
            highlight,
          };
        }

        const cc = ccnData.find(
          (v) => v.num === parseInt(newAnswer.conventionAnswer.idcc)
        );
        newAnswer.conventionAnswer = {
          ...newAnswer.conventionAnswer,
          slug: cc?.slug,
        };
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
  );

  yield {
    documents: [...newGeneratedContributions, ...oldGeneratedContributions],
    source: SOURCES.CONTRIBUTIONS,
  };

  logger.info("=== Conventions Collectives ===");
  // we keep track of the idccs used in the contributions
  // in order to flag the corresponding conventions collectives below
  const contribIDCCs = getIDCCs(oldContributions, newContributions);

  const ccnQR =
    "Retrouvez les questions-réponses les plus fréquentes organisées par thème et élaborées par le ministère du Travail concernant cette convention collective.";

  yield {
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
  yield {
    documents: await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs),
    source: SOURCES.SHEET_SP,
  };

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource<FicheTravailEmploiDoc>(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  yield {
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

  logger.info("=== Code du travail ===");
  yield {
    documents: await getDocumentBySource(SOURCES.CDT),
    source: SOURCES.CDT,
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
