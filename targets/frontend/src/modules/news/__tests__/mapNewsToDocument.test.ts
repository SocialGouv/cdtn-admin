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
  imageWidth: null,
  imageHeight: null,
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

  it("exporte la largeur et la hauteur de l'image quand elles sont connues", () => {
    const { document } = mapNewsToDocument({
      ...news,
      imageWidth: 1600,
      imageHeight: 900,
    });

    expect(document.image?.width).toBe(1600);
    expect(document.image?.height).toBe(900);
  });

  it("n'ajoute ni largeur ni hauteur sans dimensions", () => {
    const { document } = mapNewsToDocument(news);

    expect(document.image).toBeDefined();
    expect("width" in document.image!).toBe(false);
    expect("height" in document.image!).toBe(false);
  });

  it("n'ajoute pas d'image quand l'actualité n'en a pas", () => {
    const { document } = mapNewsToDocument({ ...news, imageFile: null });

    expect("image" in document).toBe(false);
  });

  it("exporte la date de dernière modification de l'actualité", () => {
    const { document } = mapNewsToDocument({
      ...news,
      updatedAt: "2026-10-10T13:07:55.843403+00:00",
    });

    expect(document.updatedAt).toBe("2026-10-10T13:07:55.843403+00:00");
  });

  it("n'exporte pas de date de modification vide", () => {
    const { document } = mapNewsToDocument({ ...news, updatedAt: "" });

    expect("updatedAt" in document).toBe(false);
  });
});
