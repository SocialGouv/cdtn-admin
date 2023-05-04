import updateAgreementsArticles from "../agreements-articles";

describe("helpers/convertHtmlToPlainText()", () => {
  it(`should return the expected result`, async () => {
    await updateAgreementsArticles("KALICONT000038661444");
  });
});
