import { getDifferenceBetweenIndexAndDares } from "../difference";

jest.mock("../getAgreementsData");
jest.mock("../getDaresData");

describe("getDifferenceBetweenIndexAndDares", () => {
  it("should work", async () => {
    const result = await getDifferenceBetweenIndexAndDares();
    expect(result).toEqual({
      missingAgreements: [
        {
          name: "Convention collective départementale des industries métallurgiques, mécaniques, électriques, électro-céramiques et connexes des Hautes-Pyrénées",
          num: 1626,
        },
        {
          name: "Convention collective régionale des employés, techniciens et agents de maîtrise du bâtiment Île-de-France",
          num: 2707,
        },
      ],
      exceedingAgreements: [
        {
          name: "Convention collective nationale de la boyauderie du 19 février 1989.  Etendue par arrêté du 2 juin 1989 JORF 7 juin 1989.",
          num: 1543,
        },
        {
          name: "Convention collective nationale de la sidérurgie du 20 novembre 2001",
          num: 2344,
        },
        {
          name: "Convention collective nationale des sociétés d'aménagement foncier et d'établissement rural (SAFER)",
          num: 7515,
        },
      ],
    });
  });
});
