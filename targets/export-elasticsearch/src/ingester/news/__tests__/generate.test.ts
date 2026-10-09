import {
  DocumentElasticWithSource,
  NewsTemplateDoc,
} from "@socialgouv/cdtn-types";
import { LinkedContent } from "@socialgouv/cdtn-types/build/elastic/related-items";
import { generateNews } from "../generate";
import { fetchLinkedContent } from "../../common/fetchLinkedContent";

jest.mock("../../common/fetchLinkedContent");

const linkedDocument: LinkedContent = {
  title: "Titre",
  slug: "slug",
  source: "information",
};

const buildNews = (
  document: Partial<NewsTemplateDoc>
): DocumentElasticWithSource<NewsTemplateDoc> =>
  ({
    id: "news-id",
    cdtnId: "news-cdtn-id",
    title: "Actualité",
    slug: "actualite",
    source: "actualites",
    meta_title: "Titre meta",
    date: "09/10/2026",
    author: "Ministère du Travail",
    content: "Contenu",
    meta_description: "Description meta",
    cdtnReferences: [],
    ...document,
  }) as unknown as DocumentElasticWithSource<NewsTemplateDoc>;

describe("generateNews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exporte une ancienne actualité qui n'a que des cdtnReferences", async () => {
    (fetchLinkedContent as jest.Mock).mockResolvedValue(linkedDocument);

    const [news] = await generateNews([
      buildNews({ cdtnReferences: [{ cdtnId: "a" }] }),
    ]);

    expect(news.linkedContent).toEqual([linkedDocument]);
    expect(news.links[0].type).toBe("cdtn");
    expect(news.references).toEqual([]);
    expect(news.image).toBeUndefined();
    expect("cdtnReferences" in news).toBe(false);
  });

  it("garde l'ordre des liens et ne met que les contenus CDTN dans linkedContent", async () => {
    (fetchLinkedContent as jest.Mock).mockResolvedValue(linkedDocument);
    const external = {
      type: "external" as const,
      title: "Lien externe",
      url: "https://externe.fr",
    };

    const [news] = await generateNews([
      buildNews({
        cdtnReferences: [{ cdtnId: "a" }],
        links: [external, { type: "cdtn", cdtnId: "a" }],
      }),
    ]);

    expect(news.links).toEqual([external, { type: "cdtn", ...linkedDocument }]);
    expect(news.linkedContent).toEqual([linkedDocument]);
  });

  it("retire un contenu CDTN qui n'est plus publié", async () => {
    (fetchLinkedContent as jest.Mock).mockResolvedValue(undefined);

    const [news] = await generateNews([
      buildNews({
        cdtnReferences: [{ cdtnId: "a" }],
        links: [{ type: "cdtn", cdtnId: "a" }],
      }),
    ]);

    expect(news.links).toEqual([]);
    expect(news.linkedContent).toEqual([]);
  });
});
