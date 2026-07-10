import { describe, expect, test } from "@jest/globals";

import type { AccoArchive } from "../fetchAccoArchives";
import { selectArchivesToIngest } from "../selectArchivesToIngest";

const archive = (
  name: string,
  date: string,
  type: AccoArchive["type"]
): AccoArchive => ({
  name,
  url: `https://echanges.dila.gouv.fr/OPENDATA/ACCO/${name}`,
  date: new Date(date),
  type,
});

const full = archive(
  "Freemium_acco_global_20250713-140000.tar.gz",
  "2025-07-13T14:00:00Z",
  "full"
);
const inc1 = archive(
  "ACCO_20250708-061500.tar.gz",
  "2025-07-08T06:15:00Z",
  "incremental"
);
const inc2 = archive(
  "ACCO_20260629-064356.tar.gz",
  "2026-06-29T06:43:56Z",
  "incremental"
);

describe("selectArchivesToIngest", () => {
  test("écarte les archives déjà ingérées", () => {
    const selected = selectArchivesToIngest([full, inc1, inc2], [inc1.name]);
    expect(selected.map((a) => a.name)).not.toContain(inc1.name);
    expect(selected).toHaveLength(2);
  });

  test("traite la base complète (full) avant les incréments", () => {
    const selected = selectArchivesToIngest([inc2, inc1, full], []);
    expect(selected[0]).toBe(full);
  });

  test("ordonne les incréments par date croissante", () => {
    const selected = selectArchivesToIngest([inc2, inc1], []);
    expect(selected.map((a) => a.name)).toEqual([inc1.name, inc2.name]);
  });

  test("retourne un tableau vide si tout est déjà ingéré", () => {
    const selected = selectArchivesToIngest(
      [full, inc1, inc2],
      [full.name, inc1.name, inc2.name]
    );
    expect(selected).toEqual([]);
  });

  test("ne modifie pas le tableau d'entrée", () => {
    const input = [inc2, inc1, full];
    selectArchivesToIngest(input, []);
    expect(input).toEqual([inc2, inc1, full]);
  });
});
