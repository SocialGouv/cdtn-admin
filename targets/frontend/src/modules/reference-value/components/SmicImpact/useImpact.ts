import { gql, useQuery } from "urql";
import { useMemo } from "react";
import {
  CHALLENGER_FORMULAS,
  ChallengerFormula,
  computeChallengerReference,
} from "@socialgouv/cdtn-utils";

const challengerAnswersQuery = gql`
  query ChallengerAnnotatedAnswers {
    contribution_answers(
      where: { content: { _ilike: "%data-challenger-formula%" } }
    ) {
      id
      questionId: question_id
      agreementId: agreement_id
      content
      question {
        content
      }
      agreement {
        id
        name
      }
      document {
        slug
      }
    }
  }
`;

type AnswerRow = {
  id: string;
  questionId: string;
  agreementId: string;
  content: string;
  question: { content: string };
  agreement: { id: string; name: string };
  document: { slug: string } | null;
};

type QueryResult = {
  contribution_answers: AnswerRow[];
};

function parseAmount(text: string): number | null {
  const cleaned = text
    .replace(/€/g, "")
    .replace(/\u00a0/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

function extractAnnotations(html: string): Array<{
  formula: ChallengerFormula;
  parameter: string | null;
  amountText: string;
}> {
  if (typeof document === "undefined") return [];
  const container = window.document.createElement("div");
  container.innerHTML = html;
  const spans = container.querySelectorAll("span[data-challenger-formula]");
  return Array.from(spans).map((span) => ({
    formula: span.getAttribute("data-challenger-formula") as ChallengerFormula,
    parameter: span.getAttribute("data-challenger-parameter"),
    amountText: span.textContent ?? "",
  }));
}

export type ChallengerAnnotationDetail = {
  answerId: string;
  questionContent: string;
  agreementId: string;
  agreementName: string;
  formula: ChallengerFormula;
  formulaLabel: string;
  parameter: string | null;
  amountRedigé: number;
  newReference: number;
  publishedAmount: number;
  currentPublishedAmount: number;
  amountChanged: boolean;
  prodSlug: string | null;
};

export type ImpactSummary = {
  contributionsCount: number;
  annotationsCount: number;
  changedCount: number;
  details: ChallengerAnnotationDetail[];
};

export function useImpact(
  newHourlyValue: number,
  currentHourlyValue: number | null
): {
  impact: ImpactSummary | null;
  fetching: boolean;
  error: unknown;
} {
  const [result] = useQuery<QueryResult>({
    query: challengerAnswersQuery,
    requestPolicy: "cache-and-network",
  });

  const impact = useMemo<ImpactSummary | null>(() => {
    if (!result.data) return null;

    const details: ChallengerAnnotationDetail[] = [];
    const affectedAnswerIds = new Set<string>();

    for (const answer of result.data.contribution_answers) {
      const annotations = extractAnnotations(answer.content ?? "");
      for (const ann of annotations) {
        const amount = parseAmount(ann.amountText);
        if (amount === null) continue;

        const formulaDef = CHALLENGER_FORMULAS.find(
          (f) => f.value === ann.formula
        );

        const newReference = computeChallengerReference(
          ann.formula,
          ann.parameter,
          newHourlyValue
        );
        const publishedAmount = Math.max(amount, newReference);

        const currentReference =
          currentHourlyValue !== null
            ? computeChallengerReference(
                ann.formula,
                ann.parameter,
                currentHourlyValue
              )
            : 0;
        const currentPublishedAmount =
          currentHourlyValue !== null
            ? Math.max(amount, currentReference)
            : amount;

        details.push({
          answerId: answer.id,
          questionContent: answer.question.content,
          agreementId: answer.agreementId,
          agreementName:
            answer.agreementId === "0000"
              ? "Toutes CC"
              : `${answer.agreement.name} (${answer.agreementId})`,
          formula: ann.formula,
          formulaLabel: formulaDef?.label ?? ann.formula,
          parameter: ann.parameter,
          amountRedigé: amount,
          newReference,
          publishedAmount,
          currentPublishedAmount,
          amountChanged: publishedAmount !== currentPublishedAmount,
          prodSlug: answer.document?.slug ?? null,
        });

        affectedAnswerIds.add(answer.id);
      }
    }

    return {
      contributionsCount: affectedAnswerIds.size,
      annotationsCount: details.length,
      changedCount: details.filter((d) => d.amountChanged).length,
      details,
    };
  }, [result.data, newHourlyValue, currentHourlyValue]);

  return { impact, fetching: result.fetching, error: result.error };
}
