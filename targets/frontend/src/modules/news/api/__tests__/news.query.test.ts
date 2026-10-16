import { mapNewsRow, NewsRow } from "../news.query";

const documentA = {
  cdtnId: "a",
  title: "Contenu A",
  source: "fiches_service_public",
  slug: "contenu-a",
};
const documentLie = {
  cdtnId: "lie",
  title: "Contenu lié",
  source: "information",
  slug: "contenu-lie",
};
const legiArticle = {
  cid: "LEGIARTI000006901112",
  id: "LEGIARTI000006901112",
  label: "L1234-9",
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
  imageWidth: null,
  imageHeight: null,
  cdtnReferences: [{ document: documentLie }],
  newsLinks: [
    {
      kind: "cdtn",
      document: documentA,
      label: null,
      url: null,
      intro: "Voir aussi",
    },
    {
      kind: "external",
      document: null,
      label: "Lien B",
      url: "https://b.fr",
      intro: null,
    },
  ],
  newsReferences: [
    {
      kind: "external",
      legiArticle: null,
      label: "Décret",
      url: "https://d.fr",
      intro: "Texte",
    },
    {
      kind: "legi",
      legiArticle,
      label: null,
      url: null,
      intro: null,
    },
  ],
};

describe("mapNewsRow", () => {
  it("garde les contenus liés tels quels", () => {
    expect(mapNewsRow(row).cdtnReferences).toEqual([{ document: documentLie }]);
  });

  it("transforme les liens « Pour aller plus loin » dans l'ordre", () => {
    expect(mapNewsRow(row).links).toEqual([
      { type: "cdtn", document: documentA, intro: "Voir aussi" },
      { type: "external", label: "Lien B", url: "https://b.fr", intro: null },
    ]);
  });

  it("transforme les références dans l'ordre", () => {
    expect(mapNewsRow(row).references).toEqual([
      {
        type: "external",
        label: "Décret",
        url: "https://d.fr",
        intro: "Texte",
      },
      { type: "legi", legiArticle, intro: null },
    ]);
  });

  it("retire les relations brutes du résultat", () => {
    const news = mapNewsRow(row);

    expect("newsLinks" in news).toBe(false);
    expect("newsReferences" in news).toBe(false);
    expect(news.title).toBe("Titre");
  });
});
