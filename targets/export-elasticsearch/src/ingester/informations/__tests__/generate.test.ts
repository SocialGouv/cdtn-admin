import {
  DocumentElasticWithSource,
  EditorialContentDoc,
  EditorialContentType,
} from "@socialgouv/cdtn-types";
import { generateEditorialContents } from "../generate";

const buildDocument = (overrides: Record<string, unknown> = {}) =>
  ({
    cdtnId: "doc1",
    title: "Titre",
    intro: "<p>intro sans glossaire</p>",
    introWithGlossary: "<p>Texte de l'<strong>intro</strong></p>",
    contents: [],
    ...overrides,
  }) as any as DocumentElasticWithSource<EditorialContentDoc>;

describe("generateEditorialContents", () => {
  it("construit le texte à partir de l'intro quand il n'y a aucun bloc", () => {
    const { documents } = generateEditorialContents([buildDocument()], []);

    expect(documents[0]).toMatchObject({
      intro: "<p>Texte de l'<strong>intro</strong></p>",
      text: "Texte de l'intro",
    });
  });

  it("construit le texte à partir de l'intro puis des blocs", () => {
    const { documents } = generateEditorialContents(
      [
        buildDocument({
          contents: [
            {
              title: "Section",
              blocks: [
                {
                  type: EditorialContentType.markdown,
                  markdown: "# Bloc",
                  htmlWithGlossary: "<p>Premier bloc</p>",
                },
                {
                  type: EditorialContentType.markdown,
                  markdown: "# Bloc 2",
                  htmlWithGlossary: "<p>Second bloc</p>",
                },
              ],
            },
          ],
        }),
      ],
      []
    );

    expect((documents[0] as any).text).toBe(
      "Texte de l'intro\n\nPremier bloc\n\nSecond bloc"
    );
  });

  it("ignore une intro vide", () => {
    const { documents } = generateEditorialContents(
      [
        buildDocument({
          introWithGlossary: "",
          contents: [
            {
              blocks: [
                {
                  type: EditorialContentType.markdown,
                  htmlWithGlossary: "<p>Seul bloc</p>",
                },
              ],
            },
          ],
        }),
      ],
      []
    );

    expect((documents[0] as any).text).toBe("Seul bloc");
  });

  it("renvoie un texte vide sans intro ni bloc", () => {
    const { documents } = generateEditorialContents(
      [buildDocument({ introWithGlossary: undefined, contents: undefined })],
      []
    );

    expect((documents[0] as any).text).toBe("");
  });
});
