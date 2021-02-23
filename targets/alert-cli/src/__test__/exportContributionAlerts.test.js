/* eslint-disable */
import fetch from "node-fetch";

import {
  contribApiUrl,
  exportContributionAlerts,
} from "../exportContributionAlerts";

jest.mock("node-fetch");

describe("exportContributionAlerts", () => {
  it("should export changes to contributions API", async () => {
    const changes = /** @type {alerts.AlertChanges[]}*/ ([
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
              id: "cdtnId-contrib-1",
              title: "title doc",
              source: "contributions",
            },
            references: [
              {
                dila_cid: "KALIARTI-42",
                dila_id: "KALIARTI-43",
                url: "ref.url",
                category: "agreement",
                title: "article 1",
                dila_container_id: "kalicont42",
              },
            ],
          },
          {
            document: {
              id: "cdtnId-contrib-2",
              title: "title source doc",
              source: "not-contributions",
            },
            references: [
              {
                dila_cid: "KALIARTI-45",
                dila_id: "KALIARTI-46",
                url: "ref.url",
                category: "agreement",
                title: "article 3",
                dila_container_id: "kalicont123",
              },
              {
                dila_cid: "KALIARTI-13",
                dila_id: "KALIARTI-13",
                url: "ref.url",
                category: "agreement",
                title: "article 13",
                dila_container_id: "kalicont123",
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
              cid: "KALIARTI-42",
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
        date: new Date(2021, 0 /* january */, 1),
        ref: "va.b.c",
        type: "dila",
        title: "Convention collective Lambda",
        file: "kalicont42.json",
        id: "kalicont42",
        num: 42,
      },
    ]);

    fetch.mockImplementation(() => {
      return Promise.resolve({ ok: true });
    });
    await exportContributionAlerts("repositoryTest", "v0.0.0", changes);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(contribApiUrl, {
      body: JSON.stringify([
        {
          answer_id: "cdtnId-contrib-1",
          dila_cid: "KALIARTI-42",
          dila_container_id: "kalicont42",
          dila_id: "KALIARTI-43",
          value: {
            etat: { current: "NON VIGUEUR", previous: "VIGUEUR" },
            texts: [
              { current: "new text", previous: "old text" },
              { current: "nota 1", previous: "nota 2" },
            ],
          },
          version: "va.b.c",
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
