import {
  AgreementDoc,
  Breadcrumb,
  ContributionConventionnelInfos,
  ContributionDocumentJson,
  ContributionElasticDocument,
  ContributionGenericInfos,
  ContributionHighlight,
  ContributionLinkedContent,
  DocumentElasticWithSource,
  InfographicElasticDocument,
} from "@socialgouv/cdtn-types";
import { generateMetadata } from "./generateMetadata";
import { isGenericContribution, isGenericNotCdtContribution } from "./helpers";
import { getCcSupported } from "./getCcSupported";
import { fetchAgreementUnextended } from "./fetchCcUnextended";
import { getCcInfos } from "./getCcInfos";
import { generateContent } from "./generateContent";
import { context } from "../context";
import type { ReferenceValues } from "../../controllers/middlewares/export";
import {
  getContributionContent,
  getContributionText,
} from "./getContributionContent";
import { generateMessageBlock } from "./generateMessageBlock";
import { generateLinkedContent } from "./generateLinkedContent";
import pMap from "p-map";
import { generateReferences } from "./generateReferences";
import {
  fetchQuestionIntroductions,
  QuestionIntroductions,
} from "./fetchQuestionIntroductions";
import {
  resolveContentVariables,
  resolveHtml,
  selectIntroduction,
} from "./generateIntroduction";
import { ContributionVariableValues } from "@shared/utils";

export type ContributionElasticDocumentLightRelatedContent = Omit<
  ContributionElasticDocument,
  "linkedContent"
> & {
  linkedContent: ContributionLinkedContent[];
  contentWithGlossary?: string;
};

export async function generateContributions(
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  ccnData: DocumentElasticWithSource<AgreementDoc>[],
  ccnListWithHighlight: Record<number, ContributionHighlight | undefined>,
  infographicDocuments: InfographicElasticDocument[]
): Promise<ContributionElasticDocument[]> {
  const breadcrumbsOfRootContributionsPerIndex = contributions.reduce(
    (state: Record<number, Breadcrumb[]>, contribution) => {
      if (contribution.breadcrumbs.length > 0) {
        state[contribution.questionIndex] = contribution.breadcrumbs;
      }
      return state;
    },
    {}
  );

  const generatedContributions: ContributionElasticDocumentLightRelatedContent[] =
    [];

  // Les introductions sont portées par la question : une seule requête par question
  const introductionsByQuestion = new Map<
    string,
    Promise<QuestionIntroductions | undefined>
  >();
  const getIntroductions = (questionId: string) => {
    if (!introductionsByQuestion.has(questionId)) {
      introductionsByQuestion.set(
        questionId,
        fetchQuestionIntroductions(questionId)
      );
    }
    return introductionsByQuestion.get(questionId);
  };

  const reference = context.get<ReferenceValues | undefined>("reference");
  const smicHourlyValue = reference?.smicHourly;

  for (let i = 0; i < contributions.length; i++) {
    const contrib = contributions[i];
    const contribGeneric = contributions.find(
      (c) => c.questionId === contrib.questionId && c.idcc === "0000"
    );
    const highlight = ccnListWithHighlight[parseInt(contrib.idcc)];

    const label = `Contribution ${contrib.questionIndex} - ${contrib.idcc}`;
    const ccInfos = isGenericContribution(contrib)
      ? undefined
      : getCcInfos(ccnData, contrib);
    // Valeurs des variables insérables dans les contenus (cf. @shared/utils).
    // Pas de nom de CC pour la générique : aucune variable n'y est autorisée.
    const variableValues: ContributionVariableValues = ccInfos
      ? { agreement_name: ccInfos.ccnShortTitle }
      : {};

    const content = resolveContentVariables(
      await generateContent(
        contribGeneric,
        contrib,
        infographicDocuments,
        smicHourlyValue
      ),
      variableValues,
      label
    );

    // - NOTHING / CDT : introduction partagée entre CC, portée par la question
    // - réponse générique : introduction propre à la réponse, publiée dans son document
    const rawIntroduction = isGenericContribution(contrib)
      ? contrib.introduction
      : selectIntroduction(
          contrib.contentType,
          await getIntroductions(contrib.questionId)
        );
    const introduction = rawIntroduction
      ? resolveHtml(rawIntroduction, variableValues, label, "introduction")
      : undefined;

    const messageBlock = await generateMessageBlock(contribGeneric, contrib);

    const references = generateReferences(contribGeneric, contrib);

    const ccUnextended = await fetchAgreementUnextended();

    let doc:
      | ContributionConventionnelInfos
      | ContributionGenericInfos
      | undefined;

    if (isGenericContribution(contrib)) {
      doc = {
        ccSupported: getCcSupported(contributions, contrib),
        ccUnextended: isGenericNotCdtContribution(contrib.contentType)
          ? ccUnextended
          : [],
      };
    } else {
      doc = {
        ...ccInfos,
      } as ContributionConventionnelInfos;
    }

    const breadcrumbs =
      contrib.breadcrumbs.length > 0
        ? contrib.breadcrumbs
        : (breadcrumbsOfRootContributionsPerIndex[contrib.questionIndex] ?? []);

    const contributionContent = getContributionContent(content);
    const text = getContributionText(content, contrib.description);

    const contribution: ContributionElasticDocumentLightRelatedContent = {
      ...contrib,
      ...doc,
      ...contributionContent,
      ...generateMetadata(ccnData, contrib, breadcrumbs),
      ...content,
      breadcrumbs,
      highlight,
      messageBlock,
      ...(introduction ? { introduction } : {}),
      references,
      text,
    };

    delete contribution.contentWithGlossary;
    // Sélection des références du Code du travail : déjà appliquée (generateReferences), non publiée
    delete (contribution as { includedCdtReferences?: string[] })
      .includedCdtReferences;

    generatedContributions.push(contribution);
  }

  // Some related content link to another customized contribution
  // In this case, the description of the contribution is not available
  // so we populate the related content at the end
  const allGeneratedContributions = await pMap(
    generatedContributions,
    async (contribution): Promise<ContributionElasticDocument> => {
      const linkedContent = await generateLinkedContent(
        generatedContributions,
        contribution
      );
      return {
        ...contribution,
        linkedContent,
      } as ContributionElasticDocument;
    },
    { concurrency: 5 }
  );

  return allGeneratedContributions;
}
