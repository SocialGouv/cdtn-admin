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

    expect(news.links).toEqual([{ type: "cdtn", ...linkedDocument }]);
    expect(news.linkedContent).toEqual([linkedDocument]);
    expect(news.references).toEqual([]);
    expect(news.image).toBeUndefined();
    expect("cdtnReferences" in news).toBe(false);
  });

  it("ajoute les anciens cdtnReferences à la suite des liens, sans doublon", async () => {
    (fetchLinkedContent as jest.Mock).mockImplementation(async (cdtnId) => ({
      ...linkedDocument,
      slug: cdtnId,
    }));
    const external = {
      type: "external" as const,
      title: "Lien externe",
      url: "https://externe.fr",
    };

    const [news] = await generateNews([
      buildNews({
        cdtnReferences: [{ cdtnId: "deja-lie" }, { cdtnId: "ancien" }],
        links: [{ type: "cdtn", cdtnId: "deja-lie" }, external],
      }),
    ]);

    expect(news.links).toEqual([
      { type: "cdtn", ...linkedDocument, slug: "deja-lie" },
      external,
      { type: "cdtn", ...linkedDocument, slug: "ancien" },
    ]);
    // linkedContent : les seuls contenus CDTN, dans le même ordre.
    expect(news.linkedContent).toEqual([
      { ...linkedDocument, slug: "deja-lie" },
      { ...linkedDocument, slug: "ancien" },
    ]);
  });

  it("garde l'ordre des liens et leur texte d'introduction", async () => {
    (fetchLinkedContent as jest.Mock).mockResolvedValue(linkedDocument);
    const external = {
      type: "external" as const,
      title: "Lien externe",
      url: "https://externe.fr",
      intro: "Pour en savoir plus",
    };

    const [news] = await generateNews([
      buildNews({
        links: [external, { type: "cdtn", cdtnId: "a", intro: "Voir aussi" }],
      }),
    ]);

    expect(news.links).toEqual([
      external,
      { type: "cdtn", ...linkedDocument, intro: "Voir aussi" },
    ]);
  });

  it("transmet les références telles quelles", async () => {
    const references = [
      {
        type: "legi" as const,
        title: "Article L1234-9 du code du travail",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901112",
        intro: "Indemnité de licenciement",
      },
      {
        type: "external" as const,
        title: "Décret",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000001",
      },
    ];

    const [news] = await generateNews([buildNews({ references })]);

    expect(news.references).toEqual(references);
  });

  it("retire un contenu CDTN qui n'est plus publié", async () => {
    (fetchLinkedContent as jest.Mock).mockResolvedValue(undefined);

    const [news] = await generateNews([
      buildNews({ links: [{ type: "cdtn", cdtnId: "a" }] }),
    ]);

    expect(news.links).toEqual([]);
    expect(news.linkedContent).toEqual([]);
  });
});
