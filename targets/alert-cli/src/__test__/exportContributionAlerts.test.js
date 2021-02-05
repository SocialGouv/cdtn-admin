/* eslint-disable */
import fetch from "node-fetch";

import {
  contribApiUrl,
  exportContributionAlerts,
} from "../exportContributionAlerts";

jest.mock("node-fetch");

describe("exportContributionAlerts", () => {
  it("should export changes to contributions API", async () => {
    const changes = [
      {
        added: [
          {
            data: {
              cid: 42,
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
                dila_cid: 55,
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
        modified: [
          {
            context: {
              containerId: "LEGITEXT000006072050",
            },
            data: {
              cid: 45,
              etat: "NON VIGUEUR",
              nota: "nota 1",
              texte: "new text",
            },
            previous: {
              data: {
                etat: "VIGUEUR",
                nota: "nota 2",
                texte: "old text",
              },
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
        type: "dila",
      },
      {
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
        type: "vdd",
      },
    ];

    fetch.mockImplementation(() => {
      return Promise.resolve({ ok: true });
    });
    await exportContributionAlerts(changes);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(contribApiUrl, {
      body: JSON.stringify([
        {
          dila_cid: 45,
          dila_id: 46,
          value: {
            etat: { current: "NON VIGUEUR", previous: "VIGUEUR" },
            texts: [
              { current: "new text", previous: "old text" },
              { current: "nota 1", previous: "nota 2" },
            ],
          },
        },
      ]),
      headers: {
        "Content-Type": "application/json",
        Prefer: "merge-duplicates",
      },
      method: "POST",
    });
  });
});
