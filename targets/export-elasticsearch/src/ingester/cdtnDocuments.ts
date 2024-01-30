import {
  AgreementDoc,
  Breadcrumbs,
  ContributionCompleteDoc,
  ContributionDocumentJson,
  ContributionHighlight,
  EditorialContentDoc,
  FicheTravailEmploiDoc,
  OldContributionElasticDocument,
} from "@shared/types";
import { logger } from "@shared/utils";
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
  generateContributions,
  isNewContribution,
  isOldContribution,
} from "./contributions";
import { generateAgreements } from "./agreements";
import { updateExportEsStatusWithInformations } from "./exportStatus/updateExportEsStatusWithInformations";

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

export async function* cdtnDocumentsGen() {
  let documentsLength = {};
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
  const editorialContents = markdownTransform(addGlossary, documents);
  documentsLength = {
    ...documentsLength,
    [SOURCES.EDITORIAL_CONTENT]: editorialContents.length,
  };
  yield {
    documents: editorialContents,
    source: SOURCES.EDITORIAL_CONTENT,
  };

  logger.info("=== Courriers ===");
  const modelesDeCourriers = await getDocumentBySource(
    SOURCES.LETTERS,
    getBreadcrumbs
  );
  documentsLength = {
    ...documentsLength,
    [SOURCES.LETTERS]: modelesDeCourriers.length,
  };
  yield {
    documents: modelesDeCourriers,
    source: SOURCES.LETTERS,
  };

  logger.info("=== Outils ===");
  const tools = await getDocumentBySource(SOURCES.TOOLS, getBreadcrumbs);
  documentsLength = {
    ...documentsLength,
    [SOURCES.TOOLS]: tools.length,
  };
  yield {
    documents: tools,
    source: SOURCES.TOOLS,
  };

  logger.info("=== Outils externes ===");
  const externalTools = await getDocumentBySource(
    SOURCES.EXTERNALS,
    getBreadcrumbs
  );
  documentsLength = {
    ...documentsLength,
    [SOURCES.EXTERNALS]: externalTools.length,
  };
  yield {
    documents: externalTools,
    source: SOURCES.EXTERNALS,
  };

  logger.info("=== Dossiers ===");
  const dossiers = await getDocumentBySource(
    SOURCES.THEMATIC_FILES,
    getBreadcrumbs
  );
  documentsLength = {
    ...documentsLength,
    [SOURCES.THEMATIC_FILES]: dossiers.length,
  };
  yield {
    documents: dossiers,
    source: SOURCES.THEMATIC_FILES,
  };

  logger.info("=== Contributions ===");
  const contributions: DocumentElasticWithSource<
    ContributionDocumentJson | ContributionCompleteDoc
  >[] = await getDocumentBySource<ContributionCompleteDoc>(
    SOURCES.CONTRIBUTIONS,
    getBreadcrumbs
  );
  logger.info(`Fetched ${contributions.length} contributions`);

  const ccnData = await getDocumentBySource<AgreementDoc>(SOURCES.CCN);
  logger.info(`Fetched ${ccnData.length} conventions`);

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

  const oldContributions: DocumentElasticWithSource<ContributionCompleteDoc>[] =
    contributions.filter(isOldContribution);
  logger.info(`Fetched ${oldContributions.length} old contributions`);

  const breadcrumbsOfRootContributionsPerIndex = oldContributions.reduce(
    (state: Record<number, Breadcrumbs[]>, contribution: any) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.index] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  const newContributions = contributions.filter(isNewContribution);
  logger.info(`Fetched ${newContributions.length} new contributions`);

  const newGeneratedContributions = await generateContributions(
    newContributions,
    breadcrumbsOfRootContributionsPerIndex,
    ccnData,
    ccnListWithHighlight,
    addGlossary,
    getBreadcrumbs
  );

  logger.info(
    `Generated ${newGeneratedContributions.length} new contributions`
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
  ) as unknown as OldContributionElasticDocument[];

  logger.info(
    `Generated ${oldGeneratedContributions.length} old contributions`
  );

  const generatedContributions = [
    ...newGeneratedContributions,
    ...oldGeneratedContributions,
  ];
  if (generatedContributions.length < 1998) {
    throw Error("Le nombre de contributions est inférieur à celui attendu");
  }

  documentsLength = {
    ...documentsLength,
    [SOURCES.CONTRIBUTIONS]: generatedContributions.length,
  };

  yield {
    documents: generatedContributions,
    source: SOURCES.CONTRIBUTIONS,
  };

  logger.info("=== Conventions Collectives ===");
  const agreementsDocs = await generateAgreements(
    ccnData,
    newGeneratedContributions,
    oldGeneratedContributions
  );

  documentsLength = {
    ...documentsLength,
    [SOURCES.CCN]: agreementsDocs.length,
  };

  yield {
    documents: agreementsDocs,
    source: SOURCES.CCN,
  };

  logger.info("=== Fiches SP ===");
  const fichesSp = await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs);

  documentsLength = {
    ...documentsLength,
    [SOURCES.SHEET_SP]: fichesSp.length,
  };

  yield {
    documents: fichesSp,
    source: SOURCES.SHEET_SP,
  };

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource<FicheTravailEmploiDoc>(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  const fichesMTWithGlossary = fichesMT.map(({ sections, ...infos }) => ({
    ...infos,
    sections: sections.map(({ html, ...section }: any) => {
      delete section.description;
      delete section.text;
      return {
        ...section,
        html: addGlossary(html),
      };
    }),
  }));

  documentsLength = {
    ...documentsLength,
    [SOURCES.SHEET_MT_PAGE]: fichesMTWithGlossary.length,
  };

  yield {
    documents: fichesMTWithGlossary,
    source: SOURCES.SHEET_MT_PAGE,
  };

  logger.info("=== Fiche MT ===");
  const splittedFiches = fichesMT.flatMap(splitArticle);
  const splittedFichesMt = splittedFiches.map((fiche) => {
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
  });
  documentsLength = {
    ...documentsLength,
    [SOURCES.SHEET_MT]: splittedFichesMt.length,
  };
  yield {
    documents: splittedFichesMt,
    source: SOURCES.SHEET_MT,
  };

  logger.info("=== Themes ===");
  const themesDoc = buildThemes(themes, getBreadcrumbs);
  documentsLength = {
    ...documentsLength,
    [SOURCES.THEMES]: themesDoc.length,
  };
  yield {
    documents: themesDoc,
    source: SOURCES.THEMES,
  };

  logger.info("=== Highlights ===");
  const highlights = await getDocumentBySourceWithRelation(
    SOURCES.HIGHLIGHTS,
    getBreadcrumbs
  );
  const highlightsWithContrib = highlights.map((highlight) => ({
    ...highlight,
    refs: highlight.refs.map((ref) => {
      if (!ref.description) {
        const foundContrib = newGeneratedContributions.find(
          (newGeneratedContribution) => {
            return newGeneratedContribution.cdtnId === ref.cdtnId;
          }
        );
        return {
          ...ref,
          description: foundContrib?.description,
        };
      }
      return ref;
    }),
  }));
  documentsLength = {
    ...documentsLength,
    [SOURCES.HIGHLIGHTS]: highlightsWithContrib.length,
  };
  yield {
    documents: highlightsWithContrib,
    source: SOURCES.HIGHLIGHTS,
  };

  logger.info("=== PreQualified Request ===");
  const prequalified = await getDocumentBySourceWithRelation(
    SOURCES.PREQUALIFIED,
    getBreadcrumbs
  );
  const prequalifiedWithContrib = prequalified.map((prequalif) => ({
    ...prequalif,
    refs: prequalif.refs.map((ref) => {
      if (!ref.description) {
        const foundContrib = newGeneratedContributions.find(
          (newGeneratedContribution) => {
            return newGeneratedContribution.cdtnId === ref.cdtnId;
          }
        );
        return {
          ...ref,
          description: foundContrib?.description,
        };
      }
      return ref;
    }),
  }));
  documentsLength = {
    ...documentsLength,
    [SOURCES.PREQUALIFIED]: prequalifiedWithContrib.length,
  };
  yield {
    documents: prequalifiedWithContrib,
    source: SOURCES.PREQUALIFIED,
  };

  logger.info("=== glossary ===");
  documentsLength = {
    ...documentsLength,
    [SOURCES.GLOSSARY]: glossaryTerms.length,
  };

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
  const cdtDoc = await getDocumentBySource(SOURCES.CDT);
  documentsLength = {
    ...documentsLength,
    [SOURCES.CDT]: cdtDoc.length,
  };
  yield {
    documents: cdtDoc,
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

  logger.info("=== Save the documents length ===");
  await updateExportEsStatusWithInformations(documentsLength);
}
