import { expect, test } from "@jest/globals";

import type { FicheTravail } from "../ficheTravailEmploi";
import main, { extractFicheTravailEmploiRef } from "../ficheTravailEmploi";

jest.mock("../getAllDocumentsBySource", () => {
  return {
    getAllDocumentsBySource: () => mockFiches,
  };
});

//using name starting with mock allow jest to hoist variable and then mock
const mockFiches: FicheTravail[] = [
  {
    cdtnId: "cdtn-id1",
    document: {
      date: "01/01/01",
      description: "desc",
      intro: "intro",
      sections: [
        {
          anchor: "sous-titre",
          description: "desc",
          html: "html",
          references: [
            {
              cid: "cid123",
              id: "id123",
              slug: "l123",
              title: "L123",
              type: "code_du_travail",
              url: "legifrance.url/id123",
            },
            {
              cid: "cid14",
              id: "id14",
              slug: "l14",
              title: "L14",
              type: "code_du_travail",
              url: "legifrance.url/id14",
            },
          ],
          text: "text",
          title: "sous titre",
        },
        {
          anchor: "sous-titre-2",
          description: "desc 2",
          html: "html",
          references: [
            {
              cid: "cid123",
              id: "id123",
              slug: "l123",
              title: "L123",
              type: "code_du_travail",
              url: "legifrance.url/id123",
            },
            {
              cid: "cid14",
              id: "id14",
              slug: "l14",
              title: "L14",
              type: "code_du_travail",
              url: "legifrance.url/id14",
            },
          ],
          text: "text",
          title: "sous titre 2",
        },
      ],
      url: "https://travail-emploi",
    },
    initialId: "fiche-sp-1",
    source: "fiches_ministere_travail",
    title: "fiche1",
  },
];

const expected = [
  {
    document: {
      id: "fiche-sp-1",
      source: "fiches_ministere_travail",
      title: "fiche1#sous-titre",
    },
    references: [
      {
        dila_cid: "cid123",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id123",
        title: "L123",
        url: "legifrance.url/id123",
      },
      {
        dila_cid: "cid14",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id14",
        title: "L14",
        url: "legifrance.url/id14",
      },
    ],
  },
  {
    document: {
      id: "fiche-sp-1",
      source: "fiches_ministere_travail",
      title: "fiche1#sous-titre-2",
    },
    references: [
      {
        dila_cid: "cid123",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id123",
        title: "L123",
        url: "legifrance.url/id123",
      },
      {
        dila_cid: "cid14",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id14",
        title: "L14",
        url: "legifrance.url/id14",
      },
    ],
  },
];

test("extractContributionRef should return an array of references", () => {
  expect(extractFicheTravailEmploiRef(mockFiches)).toEqual(expected);
});

test("default export should return an array of references", async () => {
  expect(await main()).toEqual(expected);
});
