import type { DocumentReference } from "@shared/types";

import type { EditorialContentSubset } from "../editorialContent";
import { extractEditorialContentTemplateRef } from "../editorialContent";
import payload from "./mocks/editorialContent.payload.json";

jest.mock("@shared/graphql-client", () => ({
  __esModule: true, // this property makes it work
  client: jest.fn(),
}));

jest.mock("@shared/dila-resolver", () => {
  const originalModule = jest.requireActual("@shared/dila-resolver");
  /* eslint-disable-next-line */
  return {
    __esModule: true, // this property makes it work
    ...originalModule,
    createGetArticleReference: () =>
      async function (id: string): Promise<DocumentReference> {
        return Promise.resolve({
          dila_cid: id,
          dila_container_id: "cdtn",
          dila_id: id,
          title: `article ${id}`,
          url: "",
        });
      },
  };
});

test("extractMailTemplateRef", async () => {
  const references = await extractEditorialContentTemplateRef(
    payload as EditorialContentSubset[]
  );
  expect(references).toMatchInlineSnapshot(`Array []`);
});
