import { expect, test } from "@jest/globals";

import main, { extractFicheTravailEmploiRef } from "../ficheTravailEmploi";

const fiches = [
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
              dila_cid: "cid1337",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id1337",
              title: "L1337",
              url: "legifrance.url/id1337",
            },
            {
              category: "code_du_travail",
              dila_cid: "cid42",
              dila_container_id: "LEGITEXT000006072050",
              dila_id: "id42",
              title: "L42",
              url: "legifrance.url/id42",
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
              cid: "cid123",
              id: "id123",
              text: "L. 123",
              url: "legifrance.url/id123",
            },
            {
              category: "legifrance.url/id14",
              cid: "cid14",
              id: "id14",
              text: "L. 14",
              type: "code_du_travail",
            },
          ],
          text: "text",
          title: "sous titre 2",
        },
      ],
      url: "https://travail-emploi",
    },
    id: "doc1",
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
      id: "fiche-sp-1",
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
      id: "fiche-sp-1",
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
      /** @type {import("@shared/types").FicheTravailEmploiDocument[]} */ (fiches)
    )
  ).toEqual(expected);
});

test("default export should return an array of references", () => {
  expect(main()).toEqual(expected);
});
