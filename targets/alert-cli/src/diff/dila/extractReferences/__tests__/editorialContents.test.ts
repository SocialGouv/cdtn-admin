import type { DocumentReference } from "@socialgouv/cdtn-types";
import { extractEditorialContentTemplateRef } from "../editorialContents";
import payload from "./mocks/editorialContent.payload.json";

jest.mock("@shared/utils", () => {
  return {
    ...jest.requireActual("@shared/utils"),
    gqlClient: jest.fn(),
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
  const references = await extractEditorialContentTemplateRef(payload as any);
  expect(references).toMatchInlineSnapshot(`
    [
      {
        "document": {
          "id": "be3ba4c0-4540-4c38-9203-65bc732486a0",
          "slug": "interessement-et-participation-nouveautes-covid-19",
          "source": "information",
          "title": "Intéressement et participation : nouveautés Covid-19",
        },
        "references": [
          {
            "dila_cid": "LEGIARTI000041747466",
            "dila_container_id": "cdtn",
            "dila_id": "LEGIARTI000041747466",
            "title": "article LEGIARTI000041747466",
            "url": "",
          },
          {
            "dila_cid": "LEGIARTI000041979663",
            "dila_container_id": "cdtn",
            "dila_id": "LEGIARTI000041979663",
            "title": "article LEGIARTI000041979663",
            "url": "",
          },
          {
            "dila_cid": "LEGIARTI000038613233",
            "dila_container_id": "cdtn",
            "dila_id": "LEGIARTI000038613233",
            "title": "article LEGIARTI000038613233",
            "url": "",
          },
          {
            "dila_cid": "LEGIARTI000041973737",
            "dila_container_id": "cdtn",
            "dila_id": "LEGIARTI000041973737",
            "title": "article LEGIARTI000041973737",
            "url": "",
          },
          {
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
