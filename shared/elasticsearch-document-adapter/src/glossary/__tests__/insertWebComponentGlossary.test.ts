import { insertWebComponentGlossary } from "../insertWebComponentGlossary";

test("real", () => {
  const htmlContent = `Le code du travail prévoit une protection différente du salarié en cas de maladie ou accident non professionnel et en cas de maladie professionnelle ou accident du travail.

<Tab title="Maladie ou accident non professionnel">

Le code du travail prévoit que l’employeur ne peut pas licencier le salarié en raison de son état de santé. S’il invoque la maladie du salarié, le licenciement est discriminatoire et donc nul.

Toutefois, l’employeur peut licencier le salarié dans certains cas.

</Tab>

<Tab title="Maladie professionnelle ou accident du travail">

Le code du travail prévoit une protection du salarié en cas de maladie professionnelle ou accident du travail.

</Tab>

<HDN>

L'employeur applique les conditions prévues par la convention ou l'accord collectif ou un usage, si elles sont plus favorables que le code du travail pour le salarié.

Le contrat de travail peut toujours prévoir des mesures plus favorables, qui s’appliqueront.

</HDN>`;
  expect(
    insertWebComponentGlossary(htmlContent, [
      {
        definition:
          "Maladie qui présente un lien avec l’activité professionnelle d’un salarié. ",
        pattern:
          /(?<!<webcomponent-tooltip(-cc)>)(?<=>[^><]*)(Maladie professionnelle)(?=[^<]*)(?!<\/webcomponent-tooltip(-cc)>)/,
        term: "Maladie professionnelle",
      },
    ])
  ).toEqual(
    `Le code du travail prévoit une protection différente du salarié en cas de maladie ou accident non professionnel et en cas de <webcomponent-tooltip content="Maladie%20qui%20pr%C3%A9sente%20un%20lien%20avec%20l%E2%80%99activit%C3%A9%20professionnelle%20d%E2%80%99un%20salari%C3%A9.%20">maladie professionnelle</webcomponent-tooltip> ou accident du travail.

<Tab title="Maladie ou accident non professionnel">

Le code du travail prévoit que l’employeur ne peut pas licencier le salarié en raison de son état de santé. S’il invoque la maladie du salarié, le licenciement est discriminatoire et donc nul.

Toutefois, l’employeur peut licencier le salarié dans certains cas.

</Tab>

<Tab title="<webcomponent-tooltip content="Maladie%20qui%20pr%C3%A9sente%20un%20lien%20avec%20l%E2%80%99activit%C3%A9%20professionnelle%20d%E2%80%99un%20salari%C3%A9.%20">Maladie professionnelle</webcomponent-tooltip> ou accident du travail">

Le code du travail prévoit une protection du salarié en cas de <webcomponent-tooltip content="Maladie%20qui%20pr%C3%A9sente%20un%20lien%20avec%20l%E2%80%99activit%C3%A9%20professionnelle%20d%E2%80%99un%20salari%C3%A9.%20">maladie professionnelle</webcomponent-tooltip> ou accident du travail.

</Tab>

<HDN>

L'employeur applique les conditions prévues par la convention ou l'<webcomponent-tooltip content="Accord%20conclu%20entre%20un%20employeur%20ou%20des%20repr%C3%A9sentants%20d%E2%80%99employeurs%20et%20une%20ou%20plusieurs%20organisations%20syndicales%20ou%20des%20repr%C3%A9sentants%20de%20salari%C3%A9s%2C%20ou%20dans%20certains%20cas%2C%20%C3%A0%20la%20suite%20de%20la%20consultation%20des%20salari%C3%A9s%2C%20en%20respectant%20des%20r%C3%A8gles%20de%20validit%C3%A9%20issues%20du%20code%20du%20travail.%20Il%20peut%20%C3%AAtre%20conclu%20%C3%A0%20plusieurs%20niveaux%20%3A%20branche%20professionnelle%2C%20groupe%2C%20entreprise%2C%20%C3%A9tablissement...%20L%E2%80%99accord%20collectif%20concerne%20un%20ou%20plusieurs%20th%C3%A8mes%20contrairement%20%C3%A0%20la%20convention%20collective%20qui%20traite%20de%20l%E2%80%99ensemble%20des%20conditions%20d%E2%80%99emploi%2C%20de%20travail%20et%20de%20formation%20professionnelle%20et%20des%20garanties%20sociales%20des%20salari%C3%A9s.%20">accord collectif</webcomponent-tooltip> ou un usage, si elles sont plus favorables que le code du travail pour le salarié.

Le contrat de travail peut toujours prévoir des mesures plus favorables, qui s’appliqueront.

</HDN>`
  );
});
