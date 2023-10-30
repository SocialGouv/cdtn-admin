import { client } from "@shared/graphql-client";
import { AgreementsAnswers, AnswersResultData } from "./types";
import slugify from "@socialgouv/cdtn-slugify";
import { KaliRef, LegiRef } from "@shared/types";
import { generateKaliRef, generateLegiRef } from "@shared/utils";

const contributionAnswerQuery = `
query contribution_answer($agreementId: bpchar) {
  contribution_answers(where: {agreement_id: {_eq: $agreementId}}) {
    id
    content
    content_type
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
    }
  }
}
`;

export function generateAgreementsAnswers(
  data: AnswersResultData
): AgreementsAnswers[] {
  const res: AgreementsAnswers[] = [];

  data.contribution_answers.forEach((answer) => {
    const kaliReferences: KaliRef[] = answer.kali_references.map((ref) => ({
      dila_cid: ref.kali_article.cid,
      dila_container_id: ref.kali_article.agreement?.kali_id ?? "",
      dila_id: ref.kali_article.id,
      title: ref.kali_article.label ?? "",
      url: ref.kali_article.agreement?.kali_id
        ? generateKaliRef(
            ref.kali_article.agreement.kali_id,
            ref.kali_article.id
          )
        : "",
    }));

    const legiReferences: LegiRef[] = answer.legi_references.map((ref) => ({
      dila_cid: ref.legi_article.cid,
      dila_id: ref.legi_article.id,
      title: ref.legi_article.label ?? "",
      url: ref.legi_article.label
        ? generateLegiRef(ref.legi_article.label)
        : "",
    }));

    const references = [...kaliReferences, ...legiReferences];

    if (answer.content_type === "ANSWER") {
      res.push({
        slug: slugify(answer.question.content),
        answer: answer.content!,
        question: answer.question.content,
        index: answer.question.order,
        references,
      });
    } else if (answer.content_type === "SP") {
      res.push({
        slug: slugify(answer.question.content),
        answer: answer.content_fiche_sp!.text,
        question: answer.question.content,
        index: answer.question.order,
        references,
      });
    }
  });

  return res;
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
  return generateAgreementsAnswers(result.data);
}
