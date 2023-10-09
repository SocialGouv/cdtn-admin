import { getElementsToDelete } from "../mutationUtils";

describe("Fonction utilitaire getElementsToDelete", () => {
  it("doit remonter pour un champs donné, la liste d'élément différent entre les 2 objets", () => {
    const result = getElementsToDelete(
      {
        list: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
        ],
      },
      {
        list: [
          {
            id: 1,
          },
          {
            id: 3,
          },
        ],
      },
      ["list", "id"]
    );
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(2);
  });
});
