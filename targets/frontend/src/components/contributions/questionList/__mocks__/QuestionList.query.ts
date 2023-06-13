import { QuestionListQueryResult, QuestionListQueryProps } from "..";

export const mock: QuestionListQueryResult = {
  rows: [
    {
      answers: [
        {
          status: {
            id: "1",
            createdAt: "01/01/2023",
            userId: "1",
            status: "TODO",
            user: {
              name: "user1",
              id: "1",
              created_at: new Date(),
              email: "user1@user.com",
            },
          },
        },
        {
          status: {
            id: "1",
            createdAt: "01/01/2023",
            userId: "1",
            status: "REDACTING",
            user: {
              name: "user1",
              id: "1",
              created_at: new Date(),
              email: "user1@user.com",
            },
          },
        },
      ],
      content: "question1",
      id: "questionId1",
    },
    {
      answers: [
        {
          status: {
            id: "1",
            createdAt: "01/01/2023",
            userId: "1",
            status: "TODO",
            user: {
              name: "user1",
              id: "1",
              created_at: new Date(),
              email: "user1@user.com",
            },
          },
        },
        {
          status: {
            id: "1",
            createdAt: "01/01/2023",
            userId: "1",
            status: "TODO",
            user: {
              name: "user1",
              id: "1",
              created_at: new Date(),
              email: "user1@user.com",
            },
          },
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
