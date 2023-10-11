import type { DocumentReference } from "@shared/types";

import type { EditorialContentSubset } from "../editorialContents";
import { extractEditorialContentTemplateRef } from "../editorialContents";
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
          type: "base",
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
  expect(references).toMatchInlineSnapshot(`
Array [
  Object {
    "document": Object {
      "id": "be3ba4c0-4540-4c38-9203-65bc732486a0",
      "source": "information",
      "title": "Intéressement et participation : nouveautés Covid-19",
    },
    "references": Array [
      Object {
        "dila_cid": "LEGIARTI000041747466",
        "dila_container_id": "cdtn",
        "dila_id": "LEGIARTI000041747466",
        "title": "article LEGIARTI000041747466",
        "url": "",
      },
      Object {
        "dila_cid": "LEGIARTI000041979663",
        "dila_container_id": "cdtn",
        "dila_id": "LEGIARTI000041979663",
        "title": "article LEGIARTI000041979663",
        "url": "",
      },
      Object {
        "dila_cid": "LEGIARTI000038613233",
        "dila_container_id": "cdtn",
        "dila_id": "LEGIARTI000038613233",
        "title": "article LEGIARTI000038613233",
        "url": "",
      },
      Object {
        "dila_cid": "LEGIARTI000041973737",
        "dila_container_id": "cdtn",
        "dila_id": "LEGIARTI000041973737",
        "title": "article LEGIARTI000041973737",
        "url": "",
      },
      Object {
        "dila_cid": "LEGIARTI000042012392",
        "dila_container_id": "cdtn",
        "dila_id": "LEGIARTI000042012392",
        "title": "article LEGIARTI000042012392",
        "url": "",
      },
    ],
  },
]
`);
});
