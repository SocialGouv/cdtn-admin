import { context } from "../../context";
import { createGlossaryTransform } from "../";
import { glossaryData } from "./glossaryData";

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

  test("should not replace html property for cc word", () => {
    const htmlContent =
      '<p class="un accord de branche ou pas">voici une convention collective et un web component mais aussi dispositions, ceci est un test</p>';
    expect(addGlossary(htmlContent)).toEqual(
      `<p class="un accord de branche ou pas">voici une <webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc> et un web component mais aussi <webcomponent-tooltip content="Phrase%20ou%20ensemble%20de%20phrases%20d%E2%80%99un%20accord%2C%20d%E2%80%99une%20convention%20collective%2C%20d%E2%80%99une%20loi.">dispositions</webcomponent-tooltip>, ceci est un test</p>`
    );
  });

  type InputTest = { markdownContent: string; result: string };

  test.each`
    markdownContent                                                                                                                                                                                                                                                                    | result
    ${`L'indemnité de fin de contrat n'est pas due dans les cas suivants`}                                                                                                                                                                                                             | ${`L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants`}
    ${`<Tab title="test">test</Tab><Tab title="Cas où le salarié ne perçoit pas l'indemnité">\\nL'indemnité de fin de contrat n'est pas due dans les cas suivants\\n</Tab>`}                                                                                                           | ${`<Tab title="test">test</Tab><Tab title="Cas où le salarié ne perçoit pas l'indemnité">\\nL'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants\\n</Tab>`}
    ${`L'indemnité de fin de contrat n'est pas due dans les cas suivants. Avec une deuxième indemnité pour tester le replace all`}                                                                                                                                                     | ${`L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants. Avec une deuxième <webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> pour tester le replace all`}
    ${`<HDN>L'indemnité de fin de contrat n'est pas due dans les cas suivants</HDN>`}                                                                                                                                                                                                  | ${`<HDN>L'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants</HDN>`}
    ${`voici une convention collective et un web component mais aussi dispositions, ceci est un test`}                                                                                                                                                                                 | ${`voici une <webcomponent-tooltip-cc>convention collective</webcomponent-tooltip-cc> et un web component mais aussi <webcomponent-tooltip content="Phrase%20ou%20ensemble%20de%20phrases%20d%E2%80%99un%20accord%2C%20d%E2%80%99une%20convention%20collective%2C%20d%E2%80%99une%20loi.">dispositions</webcomponent-tooltip>, ceci est un test`}
    ${`En cas de démission, la durée du préavis est égale à :\\n\\n- Pour les salariés non logés : \\n  - Coefficient hiérarchique inférieur ou égal à 602 : 8 jours ;\\n  - Coefficient hiérarchique supérieur à 602 :  1 mois ;\\n\\n- Pour les salariés logés : 1 mois.\\n\\n<br>`} | ${`En cas de démission, la durée du préavis est égale à :\\n\\n- Pour les salariés non logés : \\n  - <webcomponent-tooltip content="Souvent%20pr%C3%A9sent%20sur%20le%20bulletin%20de%20paie%20du%20salari%C3%A9%2C%20le%20coefficient%20repr%C3%A9sente%20la%20position%20du%20salari%C3%A9%20dans%20la%20classification%20hi%C3%A9rarchique%20%C3%A9tablie%20par%20la%20convention%20collective%20applicable%20au%20salari%C3%A9.%20Il%20est%20d%C3%A9termin%C3%A9%20en%20fonction%20de%20divers%20crit%C3%A8res%20comme%20l%E2%80%99emploi%2C%20les%20t%C3%A2ches%20exerc%C3%A9es%2C%20l%E2%80%99autonomie%20du%20salari%C3%A9%2C%20etc...%20Il%20permet%20notamment%20de%20calculer%20le%20salaire%20minimum%20que%20le%20salari%C3%A9%20%C3%A0%20un%20tel%20coefficient%20doit%20percevoir.">Coefficient hiérarchique</webcomponent-tooltip> inférieur ou égal à 602 : 8 jours ;\\n  - <webcomponent-tooltip content="Souvent%20pr%C3%A9sent%20sur%20le%20bulletin%20de%20paie%20du%20salari%C3%A9%2C%20le%20coefficient%20repr%C3%A9sente%20la%20position%20du%20salari%C3%A9%20dans%20la%20classification%20hi%C3%A9rarchique%20%C3%A9tablie%20par%20la%20convention%20collective%20applicable%20au%20salari%C3%A9.%20Il%20est%20d%C3%A9termin%C3%A9%20en%20fonction%20de%20divers%20crit%C3%A8res%20comme%20l%E2%80%99emploi%2C%20les%20t%C3%A2ches%20exerc%C3%A9es%2C%20l%E2%80%99autonomie%20du%20salari%C3%A9%2C%20etc...%20Il%20permet%20notamment%20de%20calculer%20le%20salaire%20minimum%20que%20le%20salari%C3%A9%20%C3%A0%20un%20tel%20coefficient%20doit%20percevoir.">Coefficient hiérarchique</webcomponent-tooltip> supérieur à 602 :  1 mois ;\\n\\n- Pour les salariés logés : 1 mois.\\n\\n<br>`}
  `(
    "should replace the string by adding webcomponent-tooltip in $markdownContent",
    ({ markdownContent, result }: InputTest) => {
      expect(addGlossary(markdownContent, true)).toEqual(result);
    }
  );
});
