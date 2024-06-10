const { preprocess } = require("./index");

test("Should preprocess text", async () => {
  expect(preprocess("à la nôtre")).toEqual("");
  expect(preprocess("çode du tràvail")).toEqual("code travail");
  // this one should be "aime code travail" when using better tokenization
  expect(preprocess("j'aime le code du travail")).toEqual(
    "j'aime code travail"
  );
});
