import {
  ContributionListQueryProps,
  ContributionListQueryResult,
} from "../ContributionsList.query";

export const mock = {
  rows: [
    {
      answers: [
        {
          agreements: {
            id: "0001",
            name: "CC 0001",
          },
          other_answer: "",
          status: "TODO",
        },
        {
          agreements: {
            id: "0002",
            name: "CC 0002",
          },
          other_answer: "",
          status: "DONE",
        },
      ],
      content: "question1",
      id: "questionId1",
    },
    {
      answers: [
        {
          agreements: {
            id: "0002",
            name: "CC 0002",
          },
          other_answer: "",
          status: "TODO",
        },
        {
          agreements: {
            id: "0002",
            name: "CC 0002",
          },
          other_answer: "",
          status: "TODO",
        },
      ],
      content: "question2",
      id: "questionId2",
    },
  ],
  total: 2,
};

export const useContributionListQuery = (
  props: ContributionListQueryProps
): ContributionListQueryResult => {
  return mock;
};
