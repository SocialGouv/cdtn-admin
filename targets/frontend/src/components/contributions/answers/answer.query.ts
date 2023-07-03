import { useQuery } from "urql";
import { useMemo } from "react";

import { Answer, AnswerStatus } from "../type";
import { initStatus } from "../status/utils";

const contributionAnswerQuery = `
query contribution_answer($id: uuid) {
  contribution_answers(where: {id: {_eq: $id}}) {
    id
    questionId: question_id
    agreementId: agreement_id
    content
    otherAnswer: other_answer
    question {
      id
      content
    }
    agreement {
      id
      name
    }
    answerComments: answer_comments {
      id
      content
      createdAt: created_at
      user {
        name
      }
    }
    statuses(order_by: {created_at: desc}, limit: 1) {
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
  }
}
`;

type QueryProps = {
  id: string;
};

type AnswerWithStatus = Answer & { status: AnswerStatus };

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
  };
};
