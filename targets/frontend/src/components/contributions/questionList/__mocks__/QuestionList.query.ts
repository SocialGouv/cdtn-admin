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
      answers: [createAnswerStatus("TODO"), createAnswerStatus("REDACTING")],
      content: "question1",
      id: "questionId1",
      order: 1,
    },
    {
      answers: [createAnswerStatus("TODO"), createAnswerStatus("TODO")],
      content: "question2",
      id: "questionId2",
      order: 2,
    },
  ],
};

export const useQuestionListQuery = (props: QuestionListQueryProps) => {
  return mock;
};
