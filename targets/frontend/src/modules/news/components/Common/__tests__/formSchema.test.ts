import { buildNewsFormSchema } from "../formSchema";

const base = {
  title: "Titre",
  metaTitle: "Titre meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-10-09",
  links: [],
  references: [],
  imageFile: null,
  imageAlt: null,
  imageAuthor: null,
  imageLicense: null,
  imageWidth: null,
  imageHeight: null,
  newImage: [],
};

const withImage = {
  ...base,
  imageFile: { url: "titre.webp", size: "1000" },
  imageAlt: "Une salariée à son bureau",
  imageLicense: "free" as const,
};

const legiReference = {
  type: "legi" as const,
  legiArticle: {
    cid: "LEGIARTI000006901112",
    id: "LEGIARTI000006901112",
    label: "L1234-9",
  },
};

const errorPaths = (
  result: ReturnType<ReturnType<typeof buildNewsFormSchema>["safeParse"]>
) =>
  result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."));

describe("buildNewsFormSchema", () => {
  it("accepte une actualité sans image", () => {
    expect(buildNewsFormSchema().safeParse(base).success).toBe(true);
  });

  it("exige un texte alternatif pour l'image", () => {
    const result = buildNewsFormSchema().safeParse({
      ...withImage,
      imageAlt: " ",
    });

    expect(errorPaths(result)).toContain("imageAlt");
  });

  it("exige un auteur quand la source doit être indiquée", () => {
    const result = buildNewsFormSchema().safeParse({
      ...withImage,
      imageLicense: "source",
    });

    expect(errorPaths(result)).toContain("imageAuthor");
  });

  it("n'exige pas d'auteur pour une image libre de droit", () => {
    expect(buildNewsFormSchema().safeParse(withImage).success).toBe(true);
  });

  it("refuse un article du code du travail en double", () => {
    const result = buildNewsFormSchema().safeParse({
      ...base,
      references: [legiReference, { ...legiReference, intro: "Voir" }],
    });

    expect(errorPaths(result)).toContain("references");
  });

  it("accepte un article et un lien externe avec texte d'introduction", () => {
    const result = buildNewsFormSchema().safeParse({
      ...base,
      references: [
        { ...legiReference, intro: "Indemnité de licenciement" },
        {
          type: "external",
          label: "Décret",
          url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000001",
          intro: null,
        },
      ],
      links: [
        { type: "external", label: "Lien", url: "https://b.fr", intro: "Voir" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("refuse une référence externe qui n'est pas en http ou https", () => {
    const result = buildNewsFormSchema().safeParse({
      ...base,
      references: [{ type: "external", label: "Lien", url: "ftp://x" }],
    });

    expect(errorPaths(result)).toContain("references.0.url");
  });

  it("refuse un lien externe qui n'est pas en http ou https", () => {
    const result = buildNewsFormSchema().safeParse({
      ...base,
      links: [{ type: "external", label: "Lien", url: "ftp://x" }],
    });

    expect(result.success).toBe(false);
  });
});
