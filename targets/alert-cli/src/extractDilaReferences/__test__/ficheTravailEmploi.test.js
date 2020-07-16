import { describe, expect, test, jest } from "@jest/globals";
import fiches from "@socialgouv/fiches-travail-data/data/fiches-travail.json";
import main, { extractFicheTravailEmploiRef } from "../ficheTravailEmploi";

jest.mock("@socialgouv/fiches-travail-data/data/fiches-travail.json", () => [
  {
    pubId: "fiche-sp-1",
    title: "fiche1",
    url: "https://travail-emploi",
    date: "01/01/01",
    intro: "intro",
    description: "desc",
    sections: [
      {
        anchor: "sous-titre",
        title: "sous titre",
        description: "desc",
        text: "text",
        html: "html",
        references: {
          LEGITEXT000006072050: {
            name: "code du travail",
            articles: [
              {
                text: "L. 1337",
                fmt: "L1337",
                cid: "cid1337",
                id: "id1337",
              },
              {
                text: "L. 42",
                fmt: "L42",
                cid: "cid42",
                id: "id42",
              },
            ],
          },
        },
      },
      {
        anchor: "sous-titre-2",
        title: "sous titre 2",
        description: "desc 2",
        text: "text",
        html: "html",
        references: {
          LEGITEXT000006072050: {
            name: "code du travail",
            articles: [
              {
                text: "L. 123",
                fmt: "L123",
                cid: "cid123",
                id: "id123",
              },
              {
                text: "L. 14",
                fmt: "L14",
                cid: "cid14",
                id: "id14",
              },
            ],
          },
        },
      },
    ],
  },
]);

const expected = [
  {
    document: {
      id: "fiche-sp-1",
      type: "fiches_ministere_travail",
      title: "fiche1#sous-titre",
    },
    references: [
      {
        category: "labor_code",
        title: "L1337",
        dila_id: "id1337",
        dila_cid: "cid1337",
        dila_container_id: "LEGITEXT000006072050",
      },
      {
        category: "labor_code",
        title: "L42",
        dila_id: "id42",
        dila_cid: "cid42",
        dila_container_id: "LEGITEXT000006072050",
      },
    ],
  },
  {
    document: {
      id: "fiche-sp-1",
      title: "fiche1#sous-titre-2",
      type: "fiches_ministere_travail",
    },
    references: [
      {
        category: "labor_code",
        title: "L123",
        dila_id: "id123",
        dila_cid: "cid123",
        dila_container_id: "LEGITEXT000006072050",
      },
      {
        category: "labor_code",
        title: "L14",
        dila_id: "id14",
        dila_cid: "cid14",
        dila_container_id: "LEGITEXT000006072050",
      },
    ],
  },
];

test("extractContributionRef should return an array of references", () => {
  expect(extractFicheTravailEmploiRef(fiches)).toEqual(expected);
});

test("default export should return an array of references", () => {
  expect(main()).toEqual(expected);
});
