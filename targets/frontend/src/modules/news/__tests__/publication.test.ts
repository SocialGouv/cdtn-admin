import { getNewsPublicationErrors } from "../publication";
import { News } from "../type";

const baseNews: News = {
  id: "b3c4d5e6-1111-4222-8333-444455556666",
  title: "Titre",
  metaTitle: "Titre meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-01-01",
  updatedAt: "2026-01-01T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
  links: [],
  legiReferences: [],
  imageFile: { id: null, url: "https://example.com/image.png", size: null },
  imageAlt: "Texte alternatif",
  imageAuthor: "Auteur",
  imageLicense: "source",
  imageWidth: 100,
  imageHeight: 100,
};

describe("getNewsPublicationErrors", () => {
  it("renvoie une erreur si le texte alternatif est vide", () => {
    expect(getNewsPublicationErrors({ ...baseNews, imageAlt: "  " })).toEqual([
      "Le texte alternatif de l'image doit être renseigné",
    ]);
  });

  it("renvoie une erreur si les droits sont absents", () => {
    expect(
      getNewsPublicationErrors({ ...baseNews, imageLicense: null })
    ).toEqual(["Les droits d'utilisation de l'image doivent être renseignés"]);
  });

  it("renvoie une erreur si la licence source n'a pas d'auteur", () => {
    expect(
      getNewsPublicationErrors({ ...baseNews, imageAuthor: null })
    ).toEqual(["L'auteur ou la source de l'image doit être renseigné"]);
  });

  it("accepte la licence free sans auteur", () => {
    expect(
      getNewsPublicationErrors({
        ...baseNews,
        imageLicense: "free",
        imageAuthor: null,
      })
    ).toEqual([]);
  });

  it("renvoie [] sans image", () => {
    expect(
      getNewsPublicationErrors({
        ...baseNews,
        imageFile: null,
        imageAlt: null,
        imageLicense: null,
        imageAuthor: null,
      })
    ).toEqual([]);
  });
});
