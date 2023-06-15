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
      created_at: new Date(),
      email: "user1@user.com",
    },
  };
};

export const mock: QuestionListQueryResult = {
  rows: [
    {
      answers: [
        {
          status: createAnswerStatus("TODO"),
        },
        {
          status: createAnswerStatus("REDACTING"),
        },
      ],
      content: "question1",
      id: "questionId1",
    },
    {
      answers: [
        {
          status: createAnswerStatus("TODO"),
        },
        {
          status: createAnswerStatus("TODO"),
        },
      ],
      content: "question2",
      id: "questionId2",
    },
  ],
};

export const useQuestionListQuery = (props: QuestionListQueryProps) => {
  return mock;
};
