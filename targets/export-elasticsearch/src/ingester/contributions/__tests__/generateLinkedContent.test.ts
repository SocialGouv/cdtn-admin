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

  it("un contenu lié à document qui n'existe pas doit retourner undefined", async () => {
    const contrib: any = {
      questionIndex: 1,
      idcc: "0000",
      linkedContent: [{ cdtnId: "1234" }],
    };
    const linkedContent = await generateLinkedContent(
      [],
      contrib,
      () => breadcrumbs,
      {}
    );

    expect(linkedContent).toEqual([]);
  });

  it("un contenu lié autres qu'une contribution personnalisée doit retourner les infos du document depuis la BDD", async () => {
    const dataFetchLinkedContent: LinkedContentLight = {
      cdtnId: "123456",
      title: "Titre",
      slug: "slug",
      description: "description",
      source: "information",
    };
    (fetchLinkedContent as jest.Mock).mockResolvedValue(dataFetchLinkedContent);
    const contrib: any = {
      questionIndex: 1,
      idcc: "0000",
      linkedContent: [{ cdtnId: "12345" }],
    };

    const linkedContent = await generateLinkedContent(
      [],
      contrib,
      () => breadcrumbs,
      {}
    );

    expect(linkedContent).toEqual([
      {
        breadcrumbs: breadcrumbs,
        description: "description",
        slug: "slug",
        source: "information",
        title: "Titre",
      },
    ]);
  });

  it("un contenu lié qui est une contribution personnalisée doit retourner les infos de la contribution générée", async () => {
    const contribution = {
      cdtnId: "678910",
      breadcrumbs: breadcrumbs,
      description: "description contrib",
      source: "contributions",
      slug: "slug-contrib",
      title: "title contrib",
    } as ContributionElasticDocumentLightRelatedContent;

    const contrib: any = {
      questionIndex: 1,
      idcc: "0000",
      linkedContent: [{ cdtnId: "678910" }],
    };

    const linkedContent = await generateLinkedContent(
      [contribution],
      contrib,
      () => breadcrumbs,
      {}
    );

    expect(linkedContent).toEqual([
      {
        breadcrumbs: breadcrumbs,
        description: "description contrib",
        slug: "slug-contrib",
        source: "contributions",
        title: "title contrib",
      },
    ]);
  });

  it("devrait renvoyer le contenu de la générique si une CC référence le CDT via son contentType", async () => {
    const dataFetchLinkedContent: LinkedContentLight = {
      cdtnId: "123456",
      title: "Titre",
      slug: "slug",
      description: "description",
      source: "information",
    };
    (fetchLinkedContent as jest.Mock).mockResolvedValue(dataFetchLinkedContent);
    const contribGeneric: any = {
      questionIndex: 1,
      idcc: "0000",
      linkedContent: [{ cdtnId: "123456" }],
    };

    const contribClassique: any = {
      contentType: "CDT",
      questionIndex: 1,
      idcc: "1900",
      linkedContent: [{ cdtnId: "ABCD" }],
    };

    const linkedContent = await generateLinkedContent(
      [contribGeneric, contribClassique],
      contribClassique,
      () => breadcrumbs,
      {}
    );

    expect(linkedContent).toEqual([
      {
        breadcrumbs,
        description: "description",
        slug: "slug",
        source: "information",
        title: "Titre",
      },
    ]);
  });
});
