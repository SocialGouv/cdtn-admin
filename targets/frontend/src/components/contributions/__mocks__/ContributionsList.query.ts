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
          display_mode: "",
          status: "TODO",
        },
        {
          agreements: {
            id: "0002",
            name: "CC 0002",
          },
          display_mode: "",
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
          display_mode: "",
          status: "TODO",
        },
        {
          agreements: {
            id: "0002",
            name: "CC 0002",
          },
          display_mode: "",
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
