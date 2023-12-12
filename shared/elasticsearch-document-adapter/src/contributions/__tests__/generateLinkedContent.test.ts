import { generateLinkedContent } from "../generateLinkedContent";
import { fetchLinkedContent, LinkedContentLight } from "../fetchLinkedContent";
import { ContributionElasticDocumentLightRelatedContent } from "../generate";
import { Breadcrumbs } from "@shared/types";

jest.mock("../fetchLinkedContent");

const breadcrumbs: Breadcrumbs[] = [
  {
    label: "Thème 1",
    position: 0,
    slug: "theme-1",
  },
  { label: "Thème 2", position: 0, slug: "theme-2" },
];

describe("generateLinkedContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("un contenu lié autres qu'une contribution personnalisée", () => {
    it("doit retourner les infos du document depuis la BDD", async () => {
      const dataFetchLinkedContent: LinkedContentLight = {
        cdtnId: "123456",
        title: "Titre",
        slug: "slug",
        description: "description",
        source: "information",
      };
      (fetchLinkedContent as jest.Mock).mockResolvedValue(
        dataFetchLinkedContent
      );

      const linkedContent = await generateLinkedContent(
        [],
        1,
        "0000",
        [
          {
            cdtnId: "12345",
          },
        ],
        () => breadcrumbs,
        {}
      );

      expect(linkedContent).toEqual({
        linkedContent: [
          {
            breadcrumbs: breadcrumbs,
            description: "description",
            slug: "slug",
            source: "information",
            title: "Titre",
          },
        ],
      });
    });
  });

  describe("un contenu lié qui est une contribution personnalisée", () => {
    it("doit retourner les infos de la contribution générée", async () => {
      const contribution = {
        cdtnId: "678910",
        breadcrumbs: breadcrumbs,
        description: "description contrib",
        source: "contributions",
        slug: "slug-contrib",
        title: "title contrib",
      } as ContributionElasticDocumentLightRelatedContent;

      const linkedContent = await generateLinkedContent(
        [contribution],
        1,
        "0000",
        [
          {
            cdtnId: "678910",
          },
        ],
        () => breadcrumbs,
        {}
      );

      expect(linkedContent).toEqual({
        linkedContent: [
          {
            breadcrumbs: breadcrumbs,
            description: "description contrib",
            slug: "slug-contrib",
            source: "contributions",
            title: "title contrib",
          },
        ],
      });
    });
  });
});
