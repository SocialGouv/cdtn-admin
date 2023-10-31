import { client } from "@shared/graphql-client";
import { AgreementsAnswers, AnswersResult, AnswersResultData } from "./types";
import slugify from "@socialgouv/cdtn-slugify";
import {
  ConventionCollectiveReference,
  KaliRef,
  LegiRef,
  OtherReference,
} from "@shared/types";
import { generateKaliRef, generateLegiRef } from "@shared/utils";

const contributionAnswerQuery = `
query contribution_answer($agreementId: bpchar) {
  contribution_answers(where: {agreement_id: {_eq: $agreementId}}) {
    id
    content
    content_type
    question_id
    question {
      content
      order
    }
    kali_references {
      label
      kali_article {
        id
        path
        cid
        label
        agreement {
          kali_id
        }
      }
    }
    legi_references {
      legi_article {
        id
        label
        cid
      }
    }
    other_references {
      label
      url
    }
    cdtn_references {
      document {
        title
        source
        slug
      }
    }
    content_fiche_sp: document {
      document
    }
  }
}
`;

const contributionAnswerGenericQuery = `
query contribution_answer_generic($questionId: uuid!) {
  contribution_answers(where: {question_id: {_eq: $questionId}, agreement_id: {_eq: "0000"}}) {
    id
    content
    content_type
    question_id
    question {
      content
      order
    }
    kali_references {
      label
      kali_article {
        id
        path
        cid
        label
        agreement {
          kali_id
        }
      }
    }
    legi_references {
      legi_article {
        id
        label
        cid
      }
    }
    other_references {
      label
      url
    }
    cdtn_references {
      document {
        title
        source
        slug
      }
    }
    content_fiche_sp: document {
      title
      source
      slug
      document
    }
  }
}
`;

export function getReferences(
  answer: AnswersResult
): ConventionCollectiveReference[] {
  const kaliReferences: KaliRef[] = answer.kali_references.map((ref) => ({
    dila_cid: ref.kali_article.cid,
    dila_container_id: ref.kali_article.agreement?.kali_id ?? "",
    dila_id: ref.kali_article.id,
    title: ref.kali_article.label ?? "",
    url: ref.kali_article.agreement?.kali_id
      ? generateKaliRef(ref.kali_article.agreement.kali_id, ref.kali_article.id)
      : "",
  }));

  const legiReferences: LegiRef[] = answer.legi_references.map((ref) => ({
    dila_cid: ref.legi_article.cid,
    dila_id: ref.legi_article.id,
    title: ref.legi_article.label ?? "",
    url: ref.legi_article.label ? generateLegiRef(ref.legi_article.label) : "",
  }));

  const otherReferences: OtherReference[] = answer.other_references.map(
    (ref) => ({
      title: ref.label,
      url: ref.url,
    })
  );

  const references: ConventionCollectiveReference[] = [
    ...kaliReferences,
    ...legiReferences,
    ...otherReferences,
  ];
  return references;
}

export async function generateAgreementsAnswers(
  data: AnswersResultData
): Promise<AgreementsAnswers[]> {
  const res: AgreementsAnswers[] = [];

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  data.contribution_answers.forEach(async (answer) => {
    if (answer.content_type === "ANSWER") {
      res.push({
        slug: slugify(answer.question.content),
        answer: answer.content!,
        question: answer.question.content,
        index: answer.question.order,
        references: getReferences(answer),
      });
    } else if (
      answer.content_type === "CDT" ||
      answer.content_type === "NOTHING" ||
      answer.content_type === "UNFAVOURABLE" ||
      answer.content_type === "UNKNOWN"
    ) {
      const genericAnswer = await getGenericAnswer(answer.question_id);
      let content = genericAnswer.content!;
      if (genericAnswer.content_type === "SP") {
        content = JSON.stringify(answer.content_fiche_sp!.document);
      }
      res.push({
        slug: slugify(answer.question.content),
        answer: content,
        question: answer.question.content,
        index: answer.question.order,
        references: getReferences(genericAnswer),
      });
    } else if (answer.content_type === "SP") {
      // afficher la fiche sp
      res.push({
        slug: slugify(answer.question.content),
        answer: JSON.stringify(answer.content_fiche_sp!.document),
        question: answer.question.content,
        index: answer.question.order,
        references: getReferences(answer),
      });
    }
  });

  return res;
}

async function getGenericAnswer(questionId: string): Promise<AnswersResult> {
  const result = await client
    .query<AnswersResultData>(contributionAnswerGenericQuery, { questionId })
    .toPromise();
  if (
    result.error ||
    !result.data ||
    result.data.contribution_answers.length !== 1
  ) {
    throw new Error(
      `Error fetching generic answers for question ${questionId}`
    );
  }
  return result.data.contribution_answers[0];
}

export default async function getAgreementsAnswers(
  idccNumber: number
): Promise<AgreementsAnswers[]> {
  const result = await client
    .query<AnswersResultData>(contributionAnswerQuery)
    .toPromise();

  if (result.error) {
    throw new Error(`Error fetching answers of IDCC ${idccNumber}`);
  }
  if (!result.data) {
    return [];
  }
  return await generateAgreementsAnswers(result.data);
}
