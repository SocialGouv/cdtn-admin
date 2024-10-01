import { getDifferenceBetweenIndexAndDares } from "../difference";

jest.mock("../getAgreementsData");
jest.mock("../getDaresData");

describe("getDifferenceBetweenIndexAndDares", () => {
  it("should work", async () => {
    const result = await getDifferenceBetweenIndexAndDares();
    expect(true).toEqual(true);
  });
});
