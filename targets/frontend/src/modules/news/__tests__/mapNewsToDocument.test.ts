import { mapNewsToDocument } from "../mapNewsToDocument";
import { News } from "../type";

jest.mock("@shared/utils", () => ({
  generateCdtnId: () => "cdtn-id",
}));

const news: News = {
  id: "8d2b1c4e-2f6a-4b8e-9a51-7c3e2f1d0a11",
  title: "Nouveau barème",
  metaTitle: "Nouveau barème meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-10-09",
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
  links: [
    {
      type: "cdtn",
      document: {
        cdtnId: "a",
        title: "Contenu A",
        source: "information",
        slug: "contenu-a",
      },
    },
    { type: "external", label: "Lien B", url: "https://b.fr" },
  ],
  legiReferences: [
    {
      legiArticle: {
        cid: "LEGIARTI000006901112",
        id: "LEGIARTI000006901112",
        label: "L1234-9",
      },
    },
  ],
  imageFile: { id: null, url: "nouveau-bareme.webp", size: "1200" },
  imageAlt: "Une salariée à son bureau",
  imageAuthor: null,
  imageLicense: "free",
};

describe("mapNewsToDocument", () => {
  it("publie les liens dans l'ordre, les références et l'image", () => {
    const { document } = mapNewsToDocument(news);

    expect(document.links).toEqual([
      { type: "cdtn", cdtnId: "a" },
      { type: "external", title: "Lien B", url: "https://b.fr" },
    ]);
    expect(document.cdtnReferences).toEqual([{ cdtnId: "a" }]);
    expect(document.references?.[0].title).toBe(
      "Article L1234-9 du code du travail"
    );
    expect(document.references?.[0].url).toMatch(/LEGIARTI000006901112$/);
    expect(document.image).toEqual({
      filename: "nouveau-bareme.webp",
      sizeOctet: 1200,
      alt: "Une salariée à son bureau",
      license: "free",
    });
  });

  it("n'ajoute pas d'image quand l'actualité n'en a pas", () => {
    const { document } = mapNewsToDocument({ ...news, imageFile: null });

    expect("image" in document).toBe(false);
  });
});
