import { RelatedDocuments } from "../../common/populateRelatedDocuments";
import { mergeRelatedDocumentsToEditorialContents } from "../mergeRelatedDocumentsToEditorialContents";
import {
  EditorialContentType,
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";

describe("mergeRelatedDocumentsToEditorialContents", () => {
  const editorialContents = [
    {
      id: "1",
      contents: [
        {
          id: "1",
          blocks: [
            {
              type: EditorialContentType.content,
              contents: [{ cdtnId: "id1" }, { cdtnId: "id2" }],
            },
          ],
        },
      ],
    },
  ] as any as DocumentElasticWithSource<EditorialContentDoc>[];
  const relatedDocuments: RelatedDocuments = {
    id1: {
      id: "1",
      title: "Related Document 1",
      breadcrumbs: [],
      source: "",
      cdtnId: "",
      slug: "",
      description: "",
    },
    id2: {
      id: "2",
      title: "Related Document 2",
      breadcrumbs: [],
      source: "",
      cdtnId: "",
      slug: "",
      description: "",
    },
  };

  it("should merge related documents to editorial contents", () => {
    const result = mergeRelatedDocumentsToEditorialContents(
      editorialContents,
      relatedDocuments
    );

    expect(result).toEqual([
      {
        id: "1",
        contents: [
          {
            id: "1",
            blocks: [
              {
                type: EditorialContentType.content,
                contents: [
                  {
                    id: "1",
                    title: "Related Document 1",
                    breadcrumbs: [],
                    source: "",
                    cdtnId: "",
                    slug: "",
                    description: "",
                  },
                  {
                    id: "2",
                    title: "Related Document 2",
                    breadcrumbs: [],
                    source: "",
                    cdtnId: "",
                    slug: "",
                    description: "",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should throw an error if no related document is found", () => {
    const invalidRelatedDocuments = {
      id1: {
        id: "1",
        title: "Related Document 1",
        breadcrumbs: [],
        source: "",
        cdtnId: "",
        slug: "",
        description: "",
      },
    };

    expect(() =>
      mergeRelatedDocumentsToEditorialContents(
        editorialContents,
        invalidRelatedDocuments
      )
    ).toThrowError("No related document found for id2");
  });
});
