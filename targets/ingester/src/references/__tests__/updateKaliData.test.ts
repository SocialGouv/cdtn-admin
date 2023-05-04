import { updateKaliData } from "../update-kali-data";

describe("helpers/convertHtmlToPlainText()", () => {
  it(`should return the expected result`, async () => {
    const result = await updateKaliData();

    expect(result).toStrictEqual("expected");
  });
});
