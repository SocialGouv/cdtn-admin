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
          otherAnswer: "",
          status: "TODO",
        },
        {
          agreement: {
            id: "0002",
            name: "CC 0002",
          },
          otherAnswer: "",
          status: "DONE",
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
          otherAnswer: "",
          status: "TODO",
        },
        {
          agreement: {
            id: "0002",
            name: "CC 0002",
          },
          otherAnswer: "",
          status: "TODO",
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
