/* eslint-disable */
jest.mock("node-fetch");

import fetch from "node-fetch";

import {
  contribApiUrl,
  exportContributionAlerts,
} from "../exportContributionAlerts";

describe("exportContributionAlerts", () => {
  it("should export changes to contributions API", async () => {
    const changes = [
      {
        type: "dila",
        added: [
          {
            data: {
              cid: 42,
            },
          },
        ],
        removed: [
          {
            data: {
              cid: 55,
            },
          },
        ],
        modified: [
          {
            context: {
              containerId: "LEGITEXT000006072050",
            },
            previous: {
              data: {
                etat: "VIGUEUR",
                texte: "old text",
                nota: "nota 2",
              },
            },
            data: {
              etat: "NON VIGUEUR",
              cid: 45,
              texte: "new text",
              nota: "nota 1",
            },
          },
        ],
        documents: [
          {
            document: {
              source: "contributions",
            },
            references: [
              {
                dila_cid: 42,
                dila_id: 43,
              },
              {
                dila_cid: 45,
                dila_id: 46,
              },
            ],
          },
          {
            document: {
              source: "not-contributions",
            },
            references: [
              {
                x: 2021,
                y: 2022,
              },
              {
                x: 2023,
                y: 2024,
              },
            ],
          },
        ],
      },
      {
        type: "not-dila",
        documents: [
          {
            document: {
              source: "contributions",
            },
            references: [
              {
                dila_cid: 123,
                dila_id: 456,
              },
              {
                dila_cid: 789,
                dila_id: 987,
              },
            ],
          },
          {
            document: {
              source: "not-contributions",
            },
            references: [
              {
                id: 99,
                x: 66,
              },
            ],
          },
        ],
      },
    ];

    expect(await exportContributionAlerts(changes)).toMatchSnapshot();
    fetch.mockReturnValue(Promise.resolve());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(contribApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        { cid: 42, id: 43, value: { type: "added" } },
        {
          cid: 45,
          id: 46,
          value: {
            etat: { current: "NON VIGUEUR", previous: "VIGUEUR" },
            texts: [
              { current: "new text", previous: "old text" },
              { current: "nota 1", previous: "nota 2" },
            ],
            type: "modified",
          },
        },
      ]),
    });
  });
});
