import { Status } from "../../type";
import { ContributionListQueryProps, ContributionListQueryResult } from "..";

export const mock: ContributionListQueryResult = {
  rows: [
    {
      answers: [
        {
          agreement: {
            id: "0001",
            name: "CC 0001",
          },
          id: "answer1",
          otherAnswer: "",
          statuses: [],
        },
        {
          agreement: {
            id: "0002",
            name: "CC 0002",
          },
          id: "answer2",
          otherAnswer: "",
          statuses: [
            {
              createdAt: "01/01/2023",
              id: "id",
              status: "REDACTING",
              user: {
                name: "toto",
              },
              userId: "toto",
            },
          ],
        },
      ],
      content: "question1",
      id: "questionId1",
    },
    {
      answers: [
        {
          agreement: {
            id: "0002",
            name: "CC 0002",
          },
          id: "answer3",
          otherAnswer: "",
          statuses: [],
        },
        {
          agreement: {
            id: "0002",
            name: "CC 0002",
          },
          id: "answer4",
          otherAnswer: "",
          statuses: [],
        },
      ],
      content: "question2",
      id: "questionId2",
    },
  ],
  total: 2,
};

export const useContributionListQuery = (props: ContributionListQueryProps) => {
  return mock;
};
