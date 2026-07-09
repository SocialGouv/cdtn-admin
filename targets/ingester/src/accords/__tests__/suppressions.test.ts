import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

import { parseSuppressionList, readSuppressionIds } from "../suppressions";

const fixture = (name: string): string =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf-8");

describe("parseSuppressionList", () => {
  test("extrait les IDs d'accords depuis la fixture réelle", () => {
    expect(parseSuppressionList(fixture("liste_suppression_acco.dat"))).toEqual(
      ["ACCOTEXT000053431098", "ACCOTEXT000053431099"]
    );
  });

  test("ignore les lignes bureautique (.docx)", () => {
    const content = [
      "acco/global/ACCO/TEXT/00/00/53/43/10/ACCOTEXT000053431098",
      "acco/global/bureautique//2025/12/22/T02826061367-56201242700059.docx",
    ].join("\n");
    expect(parseSuppressionList(content)).toEqual(["ACCOTEXT000053431098"]);
  });

  test("tolère une extension .xml sur la ligne", () => {
    const content =
      "acco/global/ACCO/TEXT/00/00/53/43/10/ACCOTEXT000053431098.xml";
    expect(parseSuppressionList(content)).toEqual(["ACCOTEXT000053431098"]);
  });

  test("ignore les lignes vides et dédoublonne", () => {
    const content = [
      "",
      "acco/global/ACCO/TEXT/00/00/53/43/10/ACCOTEXT000053431098",
      "",
      "acco/global/ACCO/TEXT/00/00/53/43/10/ACCOTEXT000053431098",
    ].join("\n");
    expect(parseSuppressionList(content)).toEqual(["ACCOTEXT000053431098"]);
  });

  test("retourne un tableau vide pour un contenu sans accord", () => {
    expect(parseSuppressionList("")).toEqual([]);
    expect(parseSuppressionList("acco/global/bureautique//x.docx")).toEqual([]);
  });
});

describe("readSuppressionIds", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "acco-supp-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("lit la liste de suppression sous le dossier horodaté", () => {
    const sub = path.join(dir, "20260206-180417");
    fs.mkdirSync(sub, { recursive: true });
    fs.writeFileSync(
      path.join(sub, "liste_suppression_acco.dat"),
      fixture("liste_suppression_acco.dat")
    );
    expect(readSuppressionIds(dir)).toEqual([
      "ACCOTEXT000053431098",
      "ACCOTEXT000053431099",
    ]);
  });

  test("retourne un tableau vide en l'absence de liste de suppression", () => {
    expect(readSuppressionIds(dir)).toEqual([]);
  });
});
