import { QuestionListQueryResult, QuestionListQueryProps } from "..";
import { AnswerStatus, Status } from "../../type";

const createAnswerStatus = (status: Status): AnswerStatus => {
  return {
    id: "1",
    createdAt: "01/01/2023",
    userId: "1",
    status,
    user: {
      name: "user1",
      id: "1",
      created_at: new Date().toString(),
      email: "user1@user.com",
    },
  };
};

export const mock: QuestionListQueryResult = {
  rows: [
    {
      content: "question1",
      id: "questionId1",
      order: 1,
      answers_aggregate: {
        aggregate: {
          count: 50,
        },
      },
    },
    {
      content: "question2",
      id: "questionId2",
      order: 2,
      answers_aggregate: {
        aggregate: {
          count: 50,
        },
      },
    },
  ],
};

export const useQuestionListQuery = (props: QuestionListQueryProps) => {
  return mock;
};
