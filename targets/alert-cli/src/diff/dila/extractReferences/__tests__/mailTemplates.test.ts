import type { DocumentReference } from "@shared/types";

import type { MailTemplateSubset } from "../mailTemplates";
import { extractMailTemplateRef } from "../mailTemplates";
import payload from "./mocks/mailTemplate.payload.json";

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
  const references = await extractMailTemplateRef(
    payload as MailTemplateSubset[]
  );
  expect(references).toMatchInlineSnapshot(`
    [
      {
        "document": {
          "id": "576b0a92-16de-449e-a9d0-199e89d674cd",
          "source": "modeles_de_courriers",
          "title": "document de test",
        },
        "references": [
          {
            "dila_cid": "LEGIARTI000035643605",
            "dila_container_id": "cdtn",
            "dila_id": "LEGIARTI000035643605",
            "title": "article LEGIARTI000035643605",
            "url": "",
          },
        ],
      },
    ]
  `);
});
