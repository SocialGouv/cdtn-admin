import {
  countHighlights,
  findContributionVariables,
  hasHighlight,
  replaceContributionVariables,
} from "../contributionVariables";

describe("contributionVariables", () => {
  const html =
    '<p>La convention <span data-variable="agreement_name" class="variable">Nom de la CC</span> prévoit…</p>';

  it("trouve les variables d'un contenu", () => {
    expect(findContributionVariables(html)).toEqual(["agreement_name"]);
    expect(findContributionVariables(undefined)).toEqual([]);
    expect(findContributionVariables("<p>rien</p>")).toEqual([]);
  });

  it("remplace la variable par sa valeur, échappée", () => {
    expect(
      replaceContributionVariables(html, {
        agreement_name: "Métallurgie <Ouvriers> & cadres",
      })
    ).toBe(
      "<p>La convention Métallurgie &lt;Ouvriers&gt; &amp; cadres prévoit…</p>"
    );
  });

  it("remplace plusieurs occurrences", () => {
    const twice = `${html}${html}`;
    expect(
      replaceContributionVariables(twice, { agreement_name: "Banque" })
    ).toBe(
      "<p>La convention Banque prévoit…</p><p>La convention Banque prévoit…</p>"
    );
  });

  it("échoue sur une variable inconnue", () => {
    expect(() =>
      replaceContributionVariables('<span data-variable="idcc">x</span>', {
        agreement_name: "Banque",
      })
    ).toThrow('Variable de contribution inconnue : "idcc"');
  });

  it("échoue quand la valeur est manquante", () => {
    expect(() => replaceContributionVariables(html, {})).toThrow(
      'Aucune valeur fournie pour la variable de contribution "agreement_name"'
    );
  });

  it("laisse un contenu sans variable inchangé", () => {
    expect(replaceContributionVariables("<p>abc</p>", {})).toBe("<p>abc</p>");
  });

  it("détecte le surlignage", () => {
    expect(hasHighlight('<p><mark data-color="#ff0">x</mark></p>')).toBe(true);
    expect(hasHighlight("<p><mark>x</mark></p>")).toBe(true);
    expect(hasHighlight("<p>x</p>")).toBe(false);
    expect(hasHighlight(null)).toBe(false);
    expect(countHighlights("<mark>a</mark> <mark>b</mark>")).toBe(2);
  });
});
