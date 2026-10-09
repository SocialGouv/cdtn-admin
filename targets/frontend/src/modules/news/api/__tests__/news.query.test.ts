import { mapNewsRow, NewsRow } from "../news.query";

const documentA = {
  cdtnId: "a",
  title: "Contenu A",
  source: "fiches_service_public",
  slug: "contenu-a",
};
const documentC = {
  cdtnId: "c",
  title: "Contenu C",
  source: "information",
  slug: "contenu-c",
};

const row: NewsRow = {
  id: "8d2b1c4e-2f6a-4b8e-9a51-7c3e2f1d0a11",
  title: "Titre",
  metaTitle: "Titre meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-10-09",
  createdAt: "2026-10-09",
  updatedAt: "2026-10-09",
  imageFile: null,
  imageAlt: null,
  imageAuthor: null,
  imageLicense: null,
  legiReferences: [],
  cdtnReferences: [
    { order: 2, document: documentC },
    { order: 0, document: documentA },
  ],
  otherReferences: [{ order: 1, label: "Lien B", url: "https://b.fr" }],
};

describe("mapNewsRow", () => {
  it("fusionne les contenus CDTN et les liens externes dans l'ordre", () => {
    const news = mapNewsRow(row);

    expect(news.links).toEqual([
      { type: "cdtn", document: documentA },
      { type: "external", label: "Lien B", url: "https://b.fr" },
      { type: "cdtn", document: documentC },
    ]);
  });

  it("retire les relations brutes du résultat", () => {
    const news = mapNewsRow(row);

    expect("cdtnReferences" in news).toBe(false);
    expect("otherReferences" in news).toBe(false);
    expect(news.title).toBe("Titre");
  });
});
