import { CombinedError } from "urql";
import { getElementsToDelete, isDuplicateIdError } from "../mutationUtils";

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

const constraintError = (message: string) =>
  new CombinedError({
    graphQLErrors: [{ message, extensions: { code: "constraint-violation" } }],
  });

describe("isDuplicateIdError", () => {
  it("reconnaît un id déjà inséré dans la table", () => {
    expect(
      isDuplicateIdError(
        constraintError(
          'Uniqueness violation. duplicate key value violates unique constraint "infographic_pkey"'
        ),
        "infographic"
      )
    ).toBe(true);
    expect(
      isDuplicateIdError(
        constraintError(
          'Uniqueness violation. duplicate key value violates unique constraint "news_id_key"'
        ),
        "news"
      )
    ).toBe(true);
  });

  it("ne confond pas avec la clé d'une autre table", () => {
    expect(
      isDuplicateIdError(
        constraintError(
          'Uniqueness violation. duplicate key value violates unique constraint "infographic_cdtn_references_pkey"'
        ),
        "infographic"
      )
    ).toBe(false);
  });

  it("ne masque pas les autres erreurs", () => {
    expect(
      isDuplicateIdError(
        constraintError(
          'Foreign key violation. insert or update on table "news_links" violates foreign key constraint "news_links_cdtn_id_fkey"'
        ),
        "news"
      )
    ).toBe(false);
    expect(isDuplicateIdError(undefined, "news")).toBe(false);
    expect(
      isDuplicateIdError(
        new CombinedError({ networkError: new Error("Network error") }),
        "news"
      )
    ).toBe(false);
  });
});
