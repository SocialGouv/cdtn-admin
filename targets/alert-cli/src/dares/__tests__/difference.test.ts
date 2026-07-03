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

  it("does not flag accords/statuts (IDCC 5XXX) as removed", async () => {
    // 5623 est dans notre BDD et dans les codes "Accords et statuts" de la
    // DARES, mais absent des conventions de branche : il ne doit jamais être
    // remonté comme « à supprimer ».
    const { removedAgreementsFromDares } =
      await getDifferenceBetweenIndexAndDares();
    expect(
      removedAgreementsFromDares.find((agreement) => agreement.num === 5623)
    ).toBeUndefined();
  });
});
