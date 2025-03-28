import {
  AgreementDoc,
  ContributionDocumentJson,
  ContributionHighlight,
  DocumentElasticWithSource,
  DocumentRef,
  EditorialContentDoc,
  ElasticFicheTravailEmploi,
  ExportEsStatus,
  FicheTravailEmploiDoc,
} from "@socialgouv/cdtn-types";
import { logger } from "@shared/utils";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { buildGetBreadcrumbs } from "./breadcrumbs";
import { buildThemes } from "./themes/buildThemes";
import {
  getDocumentBySource,
  getDocumentBySourceWithRelation,
} from "./common/fetchCdtnAdminDocuments";
import { splitArticle } from "./fichesTravailSplitter";
import { getVersions } from "./versions";
import {
  fetchContributionDocumentToPublish,
  generateContributions,
} from "./contributions";
import { generateAgreements } from "./agreements";
import { fetchThemes } from "./themes/fetchThemes";
import { updateExportEsStatusWithDocumentsCount } from "./exportStatus/updateExportEsStatusWithDocumentsCount";
import { generatePrequalified } from "./prequalified";
import { generateEditorialContents } from "./informations/generate";
import { populateRelatedDocuments } from "./common/populateRelatedDocuments";
import { mergeRelatedDocumentsToEditorialContents } from "./informations/mergeRelatedDocumentsToEditorialContents";
import { updateExportStatuses } from "./documents/updateExportStatuses";
import { getGlossary } from "./common/fetchGlossary";

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

export async function cdtnDocumentsGen(
  updateDocs: (source: string, documents: unknown[]) => Promise<void>,
  isProd: boolean
) {
  let documentsCount: Partial<ExportEsStatus["documentsCount"]> = {};

  const themes = await fetchThemes();

  const getBreadcrumbs = buildGetBreadcrumbs(themes);

  const contributionsToPublish = await fetchContributionDocumentToPublish(
    isProd
  );

  logger.info("=== Courriers ===");
  const modelesDeCourriers = await getDocumentBySource(
    SOURCES.LETTERS,
    getBreadcrumbs
  );
  documentsCount = {
    ...documentsCount,
    [SOURCES.LETTERS]: modelesDeCourriers.length,
  };
  await updateDocs(SOURCES.LETTERS, modelesDeCourriers);

  logger.info("=== Outils ===");
  const tools = await getDocumentBySource(SOURCES.TOOLS, getBreadcrumbs);
  documentsCount = {
    ...documentsCount,
    [SOURCES.TOOLS]: tools.length,
  };
  await updateDocs(SOURCES.TOOLS, tools);

  logger.info("=== Outils externes ===");
  const externalTools = await getDocumentBySource(
    SOURCES.EXTERNALS,
    getBreadcrumbs
  );
  documentsCount = {
    ...documentsCount,
    [SOURCES.EXTERNALS]: externalTools.length,
  };
  await updateDocs(SOURCES.EXTERNALS, externalTools);

  logger.info("=== Dossiers ===");

  const dossiers = await getDocumentBySource(
    SOURCES.THEMATIC_FILES,
    getBreadcrumbs
  );
  documentsCount = {
    ...documentsCount,
    [SOURCES.THEMATIC_FILES]: dossiers.length,
  };

  await updateDocs(SOURCES.THEMATIC_FILES, dossiers);

  logger.info("=== Contributions ===");
  const contributions: DocumentElasticWithSource<ContributionDocumentJson>[] =
    await getDocumentBySource<ContributionDocumentJson>(
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

  logger.info(`Fetched ${contributions.length} contributions`);
  const generatedContributions = await generateContributions(
    contributions,
    ccnData,
    ccnListWithHighlight
  );

  logger.info(`Generated ${generatedContributions.length} contributions`);

  documentsCount = {
    ...documentsCount,
    [SOURCES.CONTRIBUTIONS]: generatedContributions.length,
  };

  await updateDocs(SOURCES.CONTRIBUTIONS, generatedContributions);

  logger.info("=== Conventions Collectives ===");
  const agreementsDocs = await generateAgreements(
    ccnData,
    generatedContributions
  );

  documentsCount = {
    ...documentsCount,
    [SOURCES.CCN]: agreementsDocs.length,
  };

  await updateDocs(SOURCES.CCN, agreementsDocs);

  logger.info("=== Fiches SP ===");
  const fichesSp = await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs);

  documentsCount = {
    ...documentsCount,
    [SOURCES.SHEET_SP]: fichesSp.length,
  };
  await updateDocs(SOURCES.SHEET_SP, fichesSp);

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource<FicheTravailEmploiDoc>(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  logger.info(`Fetched ${fichesMT.length} fiches travail`);
  const fichesMTWithGlossary: ElasticFicheTravailEmploi[] = fichesMT.map(
    ({ sections, ...infos }): ElasticFicheTravailEmploi => ({
      ...infos,
      sections: sections.map((section) => ({
        html: section.htmlWithGlossary,
        anchor: section.anchor,
        references: section.references,
        title: section.title,
      })),
      source: SOURCES.SHEET_MT_PAGE,
    })
  );
  logger.info(
    `Mapped ${fichesMTWithGlossary.length} fiches travail with glossary`
  );
  documentsCount = {
    ...documentsCount,
    [SOURCES.SHEET_MT_PAGE]: fichesMTWithGlossary.length,
  };

  await updateDocs(SOURCES.SHEET_MT_PAGE, fichesMTWithGlossary);

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
  documentsCount = {
    ...documentsCount,
    [SOURCES.SHEET_MT]: splittedFichesMt.length,
  };
  await updateDocs(SOURCES.SHEET_MT, splittedFichesMt);

  logger.info("=== Themes ===");
  const themesDoc = buildThemes(themes, getBreadcrumbs);
  documentsCount = {
    ...documentsCount,
    [SOURCES.THEMES]: themesDoc.length,
  };

  await updateDocs(SOURCES.THEMES, themesDoc);

  logger.info("=== Highlights ===");
  const highlights = await getDocumentBySourceWithRelation(
    SOURCES.HIGHLIGHTS,
    getBreadcrumbs
  );
  const highlightsWithContrib = highlights.map((highlight) => ({
    ...highlight,
    refs: highlight.refs.map((ref: DocumentRef) => {
      if (!ref.description) {
        const foundContrib = generatedContributions.find(
          (generatedContribution) => {
            return generatedContribution.cdtnId === ref.cdtnId;
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
  documentsCount = {
    ...documentsCount,
    [SOURCES.HIGHLIGHTS]: highlightsWithContrib.length,
  };
  await updateDocs(SOURCES.HIGHLIGHTS, highlightsWithContrib);

  logger.info("=== PreQualified Request ===");
  const prequalified = await generatePrequalified(getBreadcrumbs);
  documentsCount = {
    ...documentsCount,
    [SOURCES.PREQUALIFIED]: prequalified.length,
  };
  await updateDocs(SOURCES.PREQUALIFIED, prequalified);

  logger.info("=== glossary ===");
  const glossaryTerms = await getGlossary();
  documentsCount = {
    ...documentsCount,
    [SOURCES.GLOSSARY]: glossaryTerms.length,
  };
  await updateDocs(SOURCES.GLOSSARY, [
    {
      data: glossaryTerms,
      source: SOURCES.GLOSSARY,
    },
  ]);

  logger.info("=== Code du travail ===");
  const cdtDoc = await getDocumentBySource(SOURCES.CDT);
  documentsCount = {
    ...documentsCount,
    [SOURCES.CDT]: cdtDoc.length,
  };
  await updateDocs(SOURCES.CDT, cdtDoc);

  logger.info("=== Editorial contents ===");
  const documents = await getDocumentBySource<EditorialContentDoc>(
    SOURCES.EDITORIAL_CONTENT,
    getBreadcrumbs
  );
  const {
    documents: editorialContents,
    relatedIdsDocuments: relatedIdsEditorialDocuments,
  } = await generateEditorialContents(documents);
  documentsCount = {
    ...documentsCount,
    [SOURCES.EDITORIAL_CONTENT]: editorialContents.length,
  };

  logger.info("=== Merge Related Documents ===");
  const allDocuments = [
    ...editorialContents,
    ...modelesDeCourriers,
    ...tools,
    ...externalTools,
    ...dossiers,
    ...generatedContributions,
    ...agreementsDocs,
    ...fichesSp,
    ...fichesMTWithGlossary,
    ...splittedFichesMt,
    ...highlightsWithContrib,
    ...cdtDoc,
  ];

  const relatedDocuments = populateRelatedDocuments(
    allDocuments,
    relatedIdsEditorialDocuments
  );

  const editorialContentsAugmented = mergeRelatedDocumentsToEditorialContents(
    editorialContents,
    relatedDocuments
  );
  await updateDocs(SOURCES.EDITORIAL_CONTENT, editorialContentsAugmented);

  logger.info("=== data version ===");
  await updateDocs(SOURCES.VERSIONS, [
    {
      data: getVersions(),
      source: SOURCES.VERSIONS,
    },
  ]);

  if (isProd && contributionsToPublish) {
    await updateExportStatuses(contributionsToPublish);
  }

  logger.info("=== Save the documents length ===");
  documentsCount = {
    ...documentsCount,
    total: Object.values(documentsCount).reduce((a: any, b: any) => a + b, 0),
  };
  await updateExportEsStatusWithDocumentsCount(
    documentsCount as ExportEsStatus["documentsCount"]
  );
}
