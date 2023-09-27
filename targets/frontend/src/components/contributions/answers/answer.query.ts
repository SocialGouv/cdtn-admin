import { useQuery } from "urql";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

import { Answer, AnswerStatus } from "../type";
import { initStatus } from "../status/utils";

const contributionAnswerQuery = `
query contribution_answer($id: uuid) {
  contribution_answers(where: {id: {_eq: $id}}) {
    id
    questionId: question_id
    agreementId: agreement_id
    content
    contentType: content_type
    updatedAt: updated_at
    contentServicePublicCdtnId: content_service_public_cdtn_id
    question {
      id
      content
      order
    }
    agreement {
      id
      name
      kaliId: kali_id
    }
    answerComments: answer_comments {
      id
      content
      createdAt: created_at
      user {
        name
      }
    }
    statuses(order_by: {created_at: desc}) {
      createdAt: created_at
      status
      user {
        name
      }
    }
    kaliReferences: kali_references {
     label
      kaliArticle: kali_article {
        id
        path
        cid
        agreementId: agreement_id
        label
      }
    }
    legiReferences: legi_references {
      legiArticle: legi_article {
        id
        label
        cid
      }
    }
    otherReferences: other_references {
      label
      url
    }
    cdtnReferences: cdtn_references {
      document {
        cdtnId: cdtn_id
        title
        source
        slug
      }
    }
    contentFichesSpDocument: document {
      cdtnId: cdtn_id
      title
      source
      slug
    }
  }
}
`;

type QueryProps = {
  id: string;
};

type AnswerWithStatus = Answer & { status: AnswerStatus; updateDate: string };

type QueryResult = {
  contribution_answers: AnswerWithStatus[];
};

export const useContributionAnswerQuery = ({
  id,
}: QueryProps): AnswerWithStatus | undefined => {
  const context = useMemo(
    () => ({ additionalTypenames: ["AnswerComments"] }),
    []
  );
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    variables: {
      id,
    },
    context,
  });
  if (
    !result?.data?.contribution_answers ||
    !result?.data?.contribution_answers?.length
  ) {
    return;
  }
  const answer = result.data?.contribution_answers[0];
  if (!answer) {
    return;
  }
  return {
    ...answer,
    status: initStatus(answer),
    updateDate: format(parseISO(answer.updatedAt), "dd/MM/yyyy"),
  };
};
