import fetch, { Response } from "node-fetch";
import { mocked } from "ts-jest/utils";

import { exportContributionAlerts } from "../exportContributionAlerts";
import type { AlertChanges } from "../types";

jest.mock("node-fetch");

afterEach(() => {
  delete process.env.CONTRIBUTIONS_ENDPOINT;
});

describe("exportContributionAlerts", () => {
  it("should skip exportContributionAlerts", () => {
    exportContributionAlerts("repositoryTest", { ref: "v0.0.0" }, []);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("should export changes to contributions API", () => {
    process.env.CONTRIBUTIONS_ENDPOINT = "contributions.url";
    const changes: AlertChanges[] = [
      {
        added: [
          {
            cid: "42",
            etat: "VIGUEUR",
            id: "42",
            parents: ["parents"],
            title: "quarante deux",
          },
        ],
        date: new Date(2021, 0 /* january */, 1),
        documents: [
          {
            document: {
              id: "cdtnId-contrib-1",
              source: "contributions",
              title: "title doc",
            },
            references: [
              {
                dila_cid: "KALIARTI-42",
                dila_container_id: "kalicont42",
                dila_id: "KALIARTI-43",
                title: "article 1",
                url: "ref.url",
              },
            ],
          },
          {
            document: {
              id: "cdtnId-fiche-mt",
              source: "fiches_ministere_travail",
              title: "title source doc",
            },
            references: [
              {
                dila_cid: "KALIARTI-45",
                dila_container_id: "kalicont123",
                dila_id: "KALIARTI-46",
                title: "article 3",
                url: "ref.url",
              },
              {
                dila_cid: "KALIARTI-13",
                dila_container_id: "kalicont123",
                dila_id: "KALIARTI-13",
                title: "article 13",
                url: "ref.url",
              },
            ],
          },
        ],
        file: "kalicont42.json",
        id: "kalicont42",
        modified: [
          {
            cid: "KALIARTI-42",
            diffs: [
              {
                currentText: "VIGUEUR",
                previousText: "NON VIGUEUR",
                type: "etat",
              },
              {
                currentText: "new text",
                previousText: "old text",
                type: "texte",
              },
              { currentText: "nota 2", previousText: "nota 1", type: "nota" },
            ],
            etat: "NON VIGUEUR",
            id: "KALIARTI-1337",
            parents: ["parents"],
            title: "change 123",
          },
        ],
        num: 42,
        ref: "va.b.c",
        removed: [
          {
            cid: "55",
            id: "55",
            parents: ["parents"],
            title: "cinquante cing",
          },
        ],
        title: "Convention collective Lambda",
        type: "dila",
      },
    ];

    mocked(fetch).mockImplementation(async () => {
      return Promise.resolve(new Response());
    });

    exportContributionAlerts("repositoryTest", { ref: "v0.0.0" }, changes);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("contributions.url/alerts", {
      body: JSON.stringify([
        {
          answer_id: "cdtnId-contrib-1",
          dila_cid: "KALIARTI-42",
          dila_container_id: "kalicont42",
          dila_id: "KALIARTI-43",
          value: {
            etat: { current: "VIGUEUR", previous: "NON VIGUEUR" },
            texts: [
              { current: "new text", previous: "old text" },
              { current: "nota 2", previous: "nota 1" },
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
