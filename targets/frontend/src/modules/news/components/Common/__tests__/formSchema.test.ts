import { buildNewsFormSchema } from "../formSchema";

const base = {
  title: "Titre",
  metaTitle: "Titre meta",
  content: "Contenu",
  metaDescription: "Description meta",
  displayDate: "2026-10-09",
  links: [],
  legiReferences: [],
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
  it("exige une image quand elle est obligatoire", () => {
    const result = buildNewsFormSchema(true).safeParse(base);

    expect(errorPaths(result)).toContain("newImage");
  });

  it("accepte l'absence d'image quand elle est facultative", () => {
    expect(buildNewsFormSchema(false).safeParse(base).success).toBe(true);
  });

  it("exige un texte alternatif pour l'image", () => {
    const result = buildNewsFormSchema(true).safeParse({
      ...withImage,
      imageAlt: " ",
    });

    expect(errorPaths(result)).toContain("imageAlt");
  });

  it("exige un auteur quand la source doit être indiquée", () => {
    const result = buildNewsFormSchema(true).safeParse({
      ...withImage,
      imageLicense: "source",
    });

    expect(errorPaths(result)).toContain("imageAuthor");
  });

  it("n'exige pas d'auteur pour une image libre de droit", () => {
    expect(buildNewsFormSchema(true).safeParse(withImage).success).toBe(true);
  });

  it("refuse un article du code du travail en double", () => {
    const result = buildNewsFormSchema(false).safeParse({
      ...base,
      legiReferences: [legiReference, legiReference],
    });

    expect(errorPaths(result)).toContain("legiReferences");
  });

  it("refuse un lien externe qui n'est pas en http ou https", () => {
    const result = buildNewsFormSchema(false).safeParse({
      ...base,
      links: [{ type: "external", label: "Lien", url: "ftp://x" }],
    });

    expect(result.success).toBe(false);
  });
});
