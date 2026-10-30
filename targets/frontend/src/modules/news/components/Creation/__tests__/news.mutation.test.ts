import { CombinedError } from "urql";
import { isNewsAlreadyCreated } from "../news.mutation";

const constraintError = (message: string) =>
  new CombinedError({
    graphQLErrors: [{ message, extensions: { code: "constraint-violation" } }],
  });

describe("isNewsAlreadyCreated", () => {
  it("reconnaît un id d'actualité déjà inséré", () => {
    expect(
      isNewsAlreadyCreated(
        constraintError(
          'Uniqueness violation. duplicate key value violates unique constraint "news_pkey"'
        )
      )
    ).toBe(true);
    expect(
      isNewsAlreadyCreated(
        constraintError(
          'Uniqueness violation. duplicate key value violates unique constraint "news_id_key"'
        )
      )
    ).toBe(true);
  });

  it("ne masque pas les autres violations de contrainte", () => {
    expect(
      isNewsAlreadyCreated(
        constraintError(
          'Foreign key violation. insert or update on table "news_links" violates foreign key constraint "news_links_cdtn_id_fkey"'
        )
      )
    ).toBe(false);
  });

  it("ne masque pas les autres erreurs", () => {
    expect(isNewsAlreadyCreated(undefined)).toBe(false);
    expect(
      isNewsAlreadyCreated(
        new CombinedError({ networkError: new Error("Network error") })
      )
    ).toBe(false);
  });
});
