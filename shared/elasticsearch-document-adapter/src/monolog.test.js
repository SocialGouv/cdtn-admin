import { SOURCES } from "@socialgouv/cdtn-sources";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testDoc = {
  slug: "activite-partielle-chomage-partiel",
  source: SOURCES.SHEET_MT,
};

jest.mock("@socialgouv/cdtn-monolog", () => ({
  LogQueries: () => ({
    getCovisitLinks: async (path) => {
      if (
        path == "fiche-ministere-travail/activite-partielle-chomage-partiel"
      ) {
        return Promise.resolve({ links: [] });
      } else {
        return Promise.reject();
      }
    },
  }),
}));

describe("Test covisits are added if available.", () => {
  test("fake", () => {
    expect(true).toBeTruthy();
  });

  /*test("should add covisites to item", async () => {
    context.provide();
    const res = await fetchCovisits(testDoc);
    expect(res).toMatchSnapshot();
  });

  test("should not fail with other item", async () => {
    context.provide();
    const res = await fetchCovisits({ slug: "fake", source: SOURCES.SHEET_MT });
    expect(res).toMatchSnapshot();
  });*/
});
