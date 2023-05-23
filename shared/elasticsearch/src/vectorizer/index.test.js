const { vectorizeDocument, vectorizeQuery, preprocess } = require("./index");

const timeout = 10000;

test(
  "Should vectorize document",
  async () => {
    const vector1 = await vectorizeDocument("titre", "contenu");
    expect(vector1).toBeDefined();
    // FIXME Should return the same result but don't. See with remi and fabien.
    // expect(vector1).toMatchSnapshot();

    // preprocessing should make those embeddings equal
    // FIXME Should return the same result but don't. See with remi and fabien.
    // const vector2 = await vectorizeDocument("le titre", "et le contènu");
    // expect(vector2).toEqual(vector1);
  },
  timeout
);

test(
  "Should vectorize query",
  async () => {
    // FIXME Résultat aléatoire, voir pourquoi on n'obtient pas toujours la même réponse
    // const vector1 = await vectorizeQuery("requete");
    // expect(vector1).toMatchSnapshot();
    // const vector2 = await vectorizeQuery("la requête");
    // expect(vector2).toEqual(vector1);
  },
  timeout
);

test(
  "Should fail when no content passed",
  async () => {
    await expect(vectorizeQuery()).rejects.toThrow(
      new Error("Cannot vectorize empty query.")
    );
  },
  timeout
);

test("Should preprocess text", async () => {
  expect(preprocess("à la nôtre")).toEqual("");
  expect(preprocess("çode du tràvail")).toEqual("code travail");
  // this one should be "aime code travail" when using better tokenization
  expect(preprocess("j'aime le code du travail")).toEqual(
    "j'aime code travail"
  );
});
