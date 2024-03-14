import { context } from "../../context";
import { createGlossaryTransform } from "..";
import { glossaryData } from "../__mock__/glossaryData";

describe("Glossary", () => {
  describe("addGlossary", () => {
    context.provide();
    const addGlossary = createGlossaryTransform(glossaryData);
    test("should return a formatted html with web components tooltip", () => {
      const htmlContent =
        "<p>voici une convention collective et un web component mais aussi dispositions, ceci est un test</p>";
      expect(addGlossary(htmlContent)).toEqual(
        `<p>voici une <webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc> et un web component mais aussi <webcomponent-tooltip content="Phrase%20ou%20ensemble%20de%20phrases%20d%E2%80%99un%20accord%2C%20d%E2%80%99une%20convention%20collective%2C%20d%E2%80%99une%20loi.">dispositions</webcomponent-tooltip>, ceci est un test</p>`
      );
    });
    test("should not replace html property for glossary word", () => {
      const htmlContent = `<Tab title="test">test</Tab>
  <Tab title="Cas où le salarié ne perçoit pas l'indemnité">
    L'indemnité de fin de contrat n'est pas due dans les cas suivants
  </Tab>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<Tab title="test">test</Tab>
  <Tab title="Cas où le salarié ne perçoit pas l'indemnité">
    L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants
  </Tab>`
      );
    });

    test("should not add webcomponent tooltip in a summary tag", () => {
      const htmlContent = `<summary>test</summary>
  <summary>
    L'indemnité de fin de contrat n'est pas due dans les cas suivants
  </summary>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<summary>test</summary>
  <summary>
    L'indemnité de fin de contrat n'est pas due dans les cas suivants
  </summary>`
      );
    });

    test("should add webcomponent tooltip even if next tag is omitted", () => {
      const htmlContent = `<p>indemnité</p><summary>test</summary>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<p><webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip></p><summary>test</summary>`
      );
    });

    test("should not add webcomponent tooltip in a summary tag with strong", () => {
      const htmlContent = `<summary><strong>L'indemnité de fin de contrat n'est pas due dans les cas suivants</strong></summary>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<summary><strong>L'indemnité de fin de contrat n'est pas due dans les cas suivants</strong></summary>`
      );
    });

    test.each`
      heading
      ${"h1"}
      ${"h2"}
      ${"h3"}
      ${"h4"}
      ${"h5"}
      ${"h6"}
    `("should not add webcomponent tooltip in $heading", ({ heading }) => {
      const markdown = `<${heading}>indemnité</${heading}>`;
      expect(addGlossary(markdown)).toEqual(markdown);
    });

    test("should not add webcomponent tooltip in a span tag with class \"title\"", () => {
      const htmlContent = `<span class="title">L'indemnité de fin de contrat n'est pas due dans les cas suivants</span>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<span class="title">L'indemnité de fin de contrat n'est pas due dans les cas suivants</span>`
      );
    });

    test("should not add webcomponent tooltip in a span tag with class \"sub-title\"", () => {
      const htmlContent = `<span class="sub-title">L'indemnité de fin de contrat n'est pas due dans les cas suivants</span>`;
      expect(addGlossary(htmlContent)).toEqual(
        `<span class="sub-title">L'indemnité de fin de contrat n'est pas due dans les cas suivants</span>`
      );
    });

    test("should not replace within tag attributes", () => {
      const htmlContent =
        '<p class="un accord de branche ou pas">voici une convention collective et un web component mais aussi dispositions, ceci est un test</p>';
      expect(addGlossary(htmlContent)).toEqual(
        `<p class="un accord de branche ou pas">voici une <webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc> et un web component mais aussi <webcomponent-tooltip content="Phrase%20ou%20ensemble%20de%20phrases%20d%E2%80%99un%20accord%2C%20d%E2%80%99une%20convention%20collective%2C%20d%E2%80%99une%20loi.">dispositions</webcomponent-tooltip>, ceci est un test</p>`
      );
    });

    interface InputTest {
      markdownContent: string;
      result: string;
    }

    test.each`
      markdownContent                                                                                                                | result
      ${`L'indemnité de fin de contrat n'est pas due dans les cas suivants`}                                                         | ${`L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants`}
      ${`L'indemnité de fin de contrat n'est pas due dans les cas suivants. Avec une deuxième indemnité pour tester le replace all`} | ${`L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants. Avec une deuxième <webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> pour tester le replace all`}
      ${`<HDN>L'indemnité de fin de contrat n'est pas due dans les cas suivants</HDN>`}                                              | ${`<HDN>L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants</HDN>`}
      ${`voici une convention collective et un web component mais aussi dispositions, ceci est un test`}                             | ${`voici une <webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc> et un web component mais aussi <webcomponent-tooltip content="Phrase%20ou%20ensemble%20de%20phrases%20d%E2%80%99un%20accord%2C%20d%E2%80%99une%20convention%20collective%2C%20d%E2%80%99une%20loi.">dispositions</webcomponent-tooltip>, ceci est un test`}
    `(
      "should replace the string by adding webcomponent-tooltip in $markdownContent",
      ({ markdownContent, result }: InputTest) => {
        expect(addGlossary(markdownContent)).toEqual(result);
      }
    );
  });

  describe("test glossary replacements", () => {
    describe("test replace terms", () => {
      test("should work on text without tags", () => {
        const htmlContent = `word1`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word1">word1</webcomponent-tooltip>`
        );
      });
      test("should work on text before tags", () => {
        const htmlContent = `word1<Tag></Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word1">word1</webcomponent-tooltip><Tag></Tags>`
        );
      });

      test("should work on text after tags", () => {
        const htmlContent = `<Tags></Tags>word1`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags></Tags><webcomponent-tooltip content="word1">word1</webcomponent-tooltip>`
        );
      });

      test("should work between tags", () => {
        const htmlContent = `<Tags>word1</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
            {
              abbreviations: [],
              definition: "word3",
              term: "word3",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="word1">word1</webcomponent-tooltip></Tags>`
        );
      });

      test("should work between multiple tags", () => {
        const htmlContent = `<Tags><Tags2>word1</Tags2></Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
            {
              abbreviations: [],
              definition: "word3",
              term: "word3",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><Tags2><webcomponent-tooltip content="word1">word1</webcomponent-tooltip></Tags2></Tags>`
        );
      });

      test("should not work in tag's parameter", () => {
        const htmlContent = `<Tags content="word1"></Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word1",
              term: "word1",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(`<Tags content="word1"></Tags>`);
      });

      test("should not work inside another webcomponent", () => {
        const htmlContent = `<Tags>word1 word2</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word1 word2",
              variants: [],
            },
            {
              abbreviations: [],
              definition: "word",
              term: "word1",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="word">word1 word2</webcomponent-tooltip></Tags>`
        );
      });

      test("should work on plural", () => {
        const htmlContent = `<Tags>words</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="word">words</webcomponent-tooltip></Tags>`
        );
      });

      test("should work on mulitple plurals", () => {
        const htmlContent = `<Tags>words wards</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word wards",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="word">words wards</webcomponent-tooltip></Tags>`
        );
      });

      test("should not work on words containing piece of the term", () => {
        const htmlContent = `wordpress`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(`wordpress`);
      });

      test("should work on accentuated words", () => {
        const htmlContent = `wörd`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "wörd",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word">wörd</webcomponent-tooltip>`
        );
      });

      test("should keep initial term", () => {
        const htmlContent = `Word`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word">Word</webcomponent-tooltip>`
        );
      });

      test("should match capitals at start of word", () => {
        const htmlContent = `Word Ward`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word ward",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word">Word Ward</webcomponent-tooltip>`
        );
      });

      test("should not replace agreement if it is in definition", () => {
        const htmlContent = `word`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "convention collective",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="convention%20collective">word</webcomponent-tooltip>`
        );
      });

      test("should replace all terms", () => {
        const htmlContent = `<Tags>word1 et word2 et Word1</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "définition de word1",
              term: "word1",
              variants: [],
            },
            {
              abbreviations: [],
              definition: "définition de word2",
              term: "word2",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="d%C3%A9finition%20de%20word1">word1</webcomponent-tooltip> et <webcomponent-tooltip content="d%C3%A9finition%20de%20word2">word2</webcomponent-tooltip> et <webcomponent-tooltip content="d%C3%A9finition%20de%20word1">Word1</webcomponent-tooltip></Tags>`
        );
      });
    });

    describe("test on agreements", () => {
      test("should work as tooltip-cc with specific agreement terms", () => {
        const htmlContent = `convention collective`;
        expect(createGlossaryTransform([])(htmlContent)).toEqual(
          `<webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc>`
        );
      });
      test("should work as tooltip-cc with specific agreement terms in plurial", () => {
        const htmlContent = `conventions collectives`;
        expect(createGlossaryTransform([])(htmlContent)).toEqual(
          `<webcomponent-tooltip-cc>conventions collectives</webcomponent-tooltip-cc>`
        );
      });
      test("should work as tooltip-cc with uppercase agreement terms", () => {
        const htmlContent = `Convention collective`;
        expect(createGlossaryTransform([])(htmlContent)).toEqual(
          `<webcomponent-tooltip-cc>Convention collective</webcomponent-tooltip-cc>`
        );
      });
      test("should match multiple terms as tooltip-cc", () => {
        const htmlContent = `Conventions collectives blabla accord de branche`;
        expect(createGlossaryTransform([])(htmlContent)).toEqual(
          `<webcomponent-tooltip-cc>Conventions collectives</webcomponent-tooltip-cc> blabla <webcomponent-tooltip-cc>accord de branche</webcomponent-tooltip-cc>`
        );
      });
    });

    describe("test replace abbreviations", () => {
      test("should match uppercase with abbreviations", () => {
        const htmlContent = `<Tags>WW</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: ["WW"],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags><webcomponent-tooltip content="word">WW</webcomponent-tooltip></Tags>`
        );
      });

      test("should not match lowercase with abbreviations", () => {
        const htmlContent = `<Tags>ww</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: ["WW"],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(`<Tags>ww</Tags>`);
      });

      test("should match abbreviations between parenthesis", () => {
        const htmlContent = `<Tags>World web (WW) world</Tags>`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: ["WW"],
              definition: "word",
              term: "word",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `<Tags>World web (<webcomponent-tooltip content="word">WW</webcomponent-tooltip>) world</Tags>`
        );
      });
    });

    describe("test replace variants", () => {
      test("should match a variant", () => {
        const htmlContent = `ward`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word",
              variants: ["ward"],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word">ward</webcomponent-tooltip>`
        );
      });
      test("should match a variant with plural", () => {
        const htmlContent = `wards`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "word",
              term: "word",
              variants: ["ward"],
            },
          ])(htmlContent)
        ).toEqual(
          `<webcomponent-tooltip content="word">wards</webcomponent-tooltip>`
        );
      });

      test("should match with a special character", () => {
        const htmlContent = `entreprise lock-out suite à dépôt de bilan`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "Fermeture",
              term: "Lock-out",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `entreprise <webcomponent-tooltip content="Fermeture">lock-out</webcomponent-tooltip> suite à dépôt de bilan`
        );
      });

      test("should match a term with an abbreviation in the same sentence", () => {
        const htmlContent = `si le protocole d’accord préélectoral (PAP) en stipule autrement.`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: ["PAP"],
              definition: "protocole",
              term: "Protocole d’accord préélectoral (PAP)",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `si le <webcomponent-tooltip content="protocole">protocole d’accord préélectoral (PAP)</webcomponent-tooltip> en stipule autrement.`
        );
      });

      test("should not match a term from a link", () => {
        const htmlContent = `Une <a href="https://link" class="spip_out" rel="external">notice explicative</a> précise les modalités de remplissage des procès-verbaux.`;
        expect(
          createGlossaryTransform([
            {
              abbreviations: [],
              definition: "notice",
              term: "Notice",
              variants: [],
            },
          ])(htmlContent)
        ).toEqual(
          `Une <a href="https://link" class="spip_out" rel="external">notice explicative</a> précise les modalités de remplissage des procès-verbaux.`
        );
      });
    });
  });
});
