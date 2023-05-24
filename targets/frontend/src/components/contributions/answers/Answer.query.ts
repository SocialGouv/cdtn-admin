import { useQuery } from "urql";

import { Answer, Status } from "../type";

export const contributionAnswerQuery = `
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
    answer_comments {
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
    kali_references {
      kali_article {
        id
        path
        cid
        agreement_id
      }
    }
    legi_references {
      legi_article {
        id
        index
        cid
      }
    }
    cdtn_documents {
      document {
        cdtn_id
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

type AnswerWithStatus = Answer & { status: Status };

type QueryResult = {
  contribution_answers: AnswerWithStatus[];
};

export const useContributionAnswerQuery = ({
  id,
}: QueryProps): AnswerWithStatus | undefined => {
  const [result] = useQuery<QueryResult>({
    query: contributionAnswerQuery,
    variables: {
      id,
    },
  });
  if (
    !result?.data?.contribution_answers ||
    !result?.data?.contribution_answers?.length
  ) {
    return;
  }
  const answer = result.data?.contribution_answers[0];
  if (!answer) {
    return answer;
  }
  return {
    ...answer,
    status: answer.statuses?.[0]?.status ?? "TODO",
  };
};
