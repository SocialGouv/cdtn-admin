import {
  ContributionDocumentJson,
  ContributionsAnswers,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { filterContributionDocumentsToPublish } from "../fetchContributionDocumentsToPublish";

const contributionMock: ContributionsAnswers = {
  id: "d61a3e21-9bf1-4199-b9d7-944c2382750c",
  updatedAt: "2024-03-25T17:25:33.002376+00:00",
  agreement: {
    id: "id",
    kali_id: "",
    name: "",
  },
  cdtn_references: [],
  content: "",
  content_fiche_sp: {
    initial_id: "",
    document: {
      date: "",
      description: "",
      raw: "",
      referencedTexts: [],
      url: "",
    },
  },
  content_type: "ANSWER",
  description: "",
  kali_references: [],
  legi_references: [],
  message_block_generic_no_CDT: "",
  other_references: [],
  question: {
    content: "",
    id: "",
    order: 1,
  },
  statuses: [],
  display_date: "2024-03-25",
};

const doc: DocumentElasticWithSource<ContributionDocumentJson> = {
  date: "",
  id: "",
  title: "",
  excludeFromSearch: true,
  slug: "",
  source: "contributions",
  text: "",
  isPublished: true,
  metaDescription: "",
  references: [],
  linkedContent: [],
  questionIndex: 1,
  questionName: "",
  questionId: "",
  genericAnswerId: "",
  type: "cdt",
  idcc: "",
  refs: [],
  breadcrumbs: [],
  cdtnId: "",
  contentType: "ANSWER",
  description: "",
  contribution: contributionMock,
};

describe("filterContributionDocumentsToPublish", () => {
  it("should send the list of contributions which have been updated after last export", () => {
    const result = filterContributionDocumentsToPublish(
      {
        id: "id",
        created_at: new Date("2024-06-03T08:10:03.697249+00:00"),
      },
      [
        {
          ...doc,
          cdtnId: "388f8d7860",
          contribution: {
            ...contributionMock,
            statuses: [
              {
                status: "TO_PUBLISH",
                createdAt: "2024-03-27T14:26:28.387898+00:00",
              },
            ],
          },
        },
      ]
    );
    expect(result?.length).toBe(0);
  });
  it("should send the list of contributions which have been updated after last export2", () => {
    const result = filterContributionDocumentsToPublish(
      {
        id: "id",
        created_at: new Date("2024-06-03T08:10:03.697249+00:00"),
      },
      [
        {
          ...doc,
          cdtnId: "388f8d7860",
          contribution: {
            ...contributionMock,
            statuses: [
              {
                status: "TO_PUBLISH",
                createdAt: "2024-06-27T14:26:28.387898+00:00",
              },
            ],
          },
        },
      ]
    );
    expect(result?.length).toBe(1);
  });
});
