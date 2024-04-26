import {
  BlockDisplayMode,
  ContentBlockContent,
  ContentBlockContentItem,
  ContentType,
} from "@socialgouv/cdtn-utils";
import { getContentBlockIds } from "../getContentBlockIds";
import {
  EditorialContentBaseContentPart,
  EditorialContentType,
} from "@socialgouv/cdtn-types";

describe("function getContentBlockIds", () => {
  const mockedContent: EditorialContentBaseContentPart = {
    blocks: [],
    name: "name",
    references: [],
    title: "title",
  };
  const mockedBlock: ContentBlockContent = {
    type: ContentType.content,
    blockDisplayMode: BlockDisplayMode.line,
    contents: [],
    title: "title",
  };
  const mockedContentItem: ContentBlockContentItem = {
    cdtnId: "cdtnId",
    title: "title",
    description: "description",
    slug: "slug",
    source: "source",
  };
  let props: EditorialContentBaseContentPart[];
  let result: string[];
  beforeEach(() => {
    result = getContentBlockIds(props);
  });
  describe("Given a parameter containing two blocks with cdtnId id1 & id2", () => {
    beforeAll(() => {
      props = [{ ...mockedContent }];
      props[0].blocks = [
        {
          ...mockedBlock,
          contents: [
            { ...mockedContentItem, cdtnId: "id1" },
            { ...mockedContentItem, cdtnId: "id2" },
          ],
          type: EditorialContentType.content,
        },
      ];
    });
    it("should return an array ['id1', 'id2']", () => {
      expect(result).toStrictEqual(["id1", "id2"]);
    });
  });

  describe("Given a parameter containing two blocks with cdtnId id1 & id3", () => {
    beforeAll(() => {
      props = [{ ...mockedContent }];
      props[0].blocks = [
        {
          ...mockedBlock,
          contents: [
            { ...mockedContentItem, cdtnId: "id1" },
            { ...mockedContentItem, cdtnId: "id3" },
          ],
          type: EditorialContentType.content,
        },
      ];
    });
    it("should return an array ['id1', 'id3']", () => {
      expect(result).toStrictEqual(["id1", "id3"]);
    });
  });

  describe("Given a parameter containing no blocks", () => {
    beforeAll(() => {
      props = [{ ...mockedContent }];
    });
    it("should return an empty array", () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe("Given an empty parameter", () => {
    beforeAll(() => {
      props = [];
    });
    it("should return an empty array", () => {
      expect(result).toStrictEqual([]);
    });
  });
});
