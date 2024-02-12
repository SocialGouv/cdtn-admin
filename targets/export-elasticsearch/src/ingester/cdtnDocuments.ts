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

import { buildGetBreadcrumbs } from "./breadcrumbs";
import { buildThemes } from "./buildThemes";
import {
  getDocumentBySource,
  getDocumentBySourceWithRelation,
} from "./documents/fetchCdtnAdminDocuments";
import { splitArticle } from "./fichesTravailSplitter";
import { createGlossaryTransform } from "./glossary";
import { markdownTransform } from "./markdown";
import { keyFunctionParser } from "./utils";
import { getVersions } from "./versions";
import { DocumentElasticWithSource } from "./types/Glossary";
import {
  generateContributions,
  isNewContribution,
  isOldContribution,
} from "./contributions";
import { generateAgreements } from "./agreements";
import { getGlossary } from "./documents/fetchGlossary";
import { fetchThemes } from "./themes/fetchThemes";

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
  updateDocs: (source: string, documents: unknown[]) => Promise<void>
) {
  const themes = await fetchThemes();

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
  await updateDocs(
    SOURCES.EDITORIAL_CONTENT,
    markdownTransform(addGlossary, documents)
  );

  logger.info("=== Courriers ===");
  await updateDocs(
    SOURCES.LETTERS,
    await getDocumentBySource(SOURCES.LETTERS, getBreadcrumbs)
  );

  logger.info("=== Outils ===");
  await updateDocs(
    SOURCES.TOOLS,
    await getDocumentBySource(SOURCES.TOOLS, getBreadcrumbs)
  );

  logger.info("=== Outils externes ===");
  await updateDocs(
    SOURCES.EXTERNALS,
    await getDocumentBySource(SOURCES.EXTERNALS, getBreadcrumbs)
  );

  logger.info("=== Dossiers ===");
  await updateDocs(
    SOURCES.THEMATIC_FILES,
    await getDocumentBySource(SOURCES.THEMATIC_FILES, getBreadcrumbs)
  );

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
    throw Error(
      `Le nombre de contributions (${generatedContributions.length}) est inférieur à celui attendu (1998)`
    );
  }

  await updateDocs(SOURCES.CONTRIBUTIONS, generatedContributions);

  logger.info("=== Conventions Collectives ===");
  const agreementsDocs = await generateAgreements(
    ccnData,
    newGeneratedContributions,
    oldGeneratedContributions
  );

  await updateDocs(SOURCES.CCN, agreementsDocs);

  logger.info("=== Fiches SP ===");
  await updateDocs(
    SOURCES.SHEET_SP,
    await getDocumentBySource(SOURCES.SHEET_SP, getBreadcrumbs)
  );

  logger.info("=== page fiches travail ===");
  const fichesMT = await getDocumentBySource<FicheTravailEmploiDoc>(
    SOURCES.SHEET_MT_PAGE,
    getBreadcrumbs
  );
  await updateDocs(
    SOURCES.SHEET_MT_PAGE,
    fichesMT.map(({ sections, ...infos }) => ({
      ...infos,
      sections: sections.map(({ html, ...section }: any) => {
        delete section.description;
        delete section.text;
        return {
          ...section,
          html: addGlossary(html),
        };
      }),
    }))
  );

  logger.info("=== Fiche MT ===");
  const splittedFiches = fichesMT.flatMap(splitArticle);
  await updateDocs(
    SOURCES.SHEET_MT,
    splittedFiches.map((fiche) => {
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
    })
  );

  logger.info("=== Themes ===");
  await updateDocs(SOURCES.THEMES, buildThemes(themes, getBreadcrumbs));

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
  await updateDocs(SOURCES.HIGHLIGHTS, highlightsWithContrib);

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
  await updateDocs(SOURCES.PREQUALIFIED, prequalifiedWithContrib);

  logger.info("=== glossary ===");
  await updateDocs(SOURCES.GLOSSARY, [
    {
      data: glossaryTerms,
      source: SOURCES.GLOSSARY,
    },
  ]);

  logger.info("=== Code du travail ===");
  await updateDocs(SOURCES.CDT, await getDocumentBySource(SOURCES.CDT));

  logger.info("=== data version ===");
  await updateDocs(SOURCES.VERSIONS, [
    {
      data: getVersions(),
      source: SOURCES.VERSIONS,
    },
  ]);
}
