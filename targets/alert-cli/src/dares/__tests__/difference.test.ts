import { getDifferenceBetweenIndexAndDares } from "../difference";

jest.mock("../getAgreementsData");
jest.mock("../getDaresData");

describe("getDifferenceBetweenIndexAndDares", () => {
  it("should work", async () => {
    const result = await getDifferenceBetweenIndexAndDares();
    expect(result).toEqual({
      addedAgreementsFromDares: [
        {
          name: "Convention collective nationale de l'Import-export et du Commerce international",
          num: 43,
        },
      ],
      removedAgreementsFromDares: [
        {
          name: "Convention collective nationale des industries chimiques et connexes",
          num: 44,
        },
      ],
    });
  });
});
