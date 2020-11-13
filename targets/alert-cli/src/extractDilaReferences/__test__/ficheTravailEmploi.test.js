import { expect, test } from "@jest/globals";

import main, { extractFicheTravailEmploiRef } from "../ficheTravailEmploi";

jest.mock("../getAllDocumentsBySource", () => {
  return {
    getAllDocumentsBySource: () => mockFiches,
  };
});

//using name starting with mock allow jest to hoist variable and then mock
const mockFiches = [
  {
    document: {
      date: "01/01/01",
      description: "desc",
      intro: "intro",
      pubId: "fiche-sp-1",
      sections: [
        {
          anchor: "sous-titre",
          description: "desc",
          html: "html",
          references: [
            {
              category: "code_du_travail",
              dila_cid: "cid123",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id123",
              title: "L123",
              url: "legifrance.url/id123",
            },
            {
              category: "code_du_travail",
              dila_cid: "cid14",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id14",
              title: "L14",
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
              category: "code_du_travail",
              dila_cid: "cid123",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id123",
              title: "L123",
              url: "legifrance.url/id123",
            },
            {
              category: "code_du_travail",
              dila_cid: "cid14",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id14",
              title: "L14",
              url: "legifrance.url/id14",
            },
          ],
          text: "text",
          title: "sous titre 2",
        },
      ],
      url: "https://travail-emploi",
    },
    id: "cdtn-id1",
    initial_id: "fiche-sp-1",
    is_available: false,
    is_published: false,
    is_searchable: false,
    meta_description: "desc",
    slug: "fiche-slug",
    source: "page_fiche_ministere_travail",
    text: "text",
    title: "fiche1",
  },
];

const expected = [
  {
    document: {
      id: "cdtn-id1",
      source: "fiches_ministere_travail",
      title: "fiche1#sous-titre",
    },
    references: [
      {
        category: "code_du_travail",
        dila_cid: "cid123",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id123",
        title: "L123",
        url: "legifrance.url/id123",
      },
      {
        category: "code_du_travail",
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
      id: "cdtn-id1",
      source: "fiches_ministere_travail",
      title: "fiche1#sous-titre-2",
    },
    references: [
      {
        category: "code_du_travail",
        dila_cid: "cid123",
        dila_container_id: "LEGITEXT000006072050",
        dila_id: "id123",
        title: "L123",
        url: "legifrance.url/id123",
      },
      {
        category: "code_du_travail",
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
  expect(
    extractFicheTravailEmploiRef(
      /** @type {import("@shared/types").FicheTravailEmploiDocument[]} */ (mockFiches)
    )
  ).toEqual(expected);
});

test("default export should return an array of references", async () => {
  expect(await main()).toEqual(expected);
});
