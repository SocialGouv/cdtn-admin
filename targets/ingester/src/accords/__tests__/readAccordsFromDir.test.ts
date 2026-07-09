import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

import { readAccordsFromDir } from "../readAccordsFromDir";

const TEXT_DIR = "20260424-063142/acco/global/ACCO/TEXT/00/00/53";

describe("readAccordsFromDir", () => {
  let dir: string;

  const write = (relPath: string, content: string) => {
    const filePath = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  };

  const fixture = (name: string) =>
    fs.readFileSync(path.join(__dirname, "fixtures", name), "utf-8");

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "acco-read-"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  test("parse tous les XML d'accords présents (récursivement)", () => {
    write(
      `${TEXT_DIR}/ACCOTEXT000053935667.xml`,
      fixture("accord-1-theme.xml")
    );
    write(
      `${TEXT_DIR}/93/56/ACCOTEXT000053935660.xml`,
      fixture("accord-4-themes.xml")
    );

    const { accords, errors } = readAccordsFromDir(dir);
    expect(errors).toBe(0);
    expect(accords.map((a) => a.id).sort()).toEqual([
      "ACCOTEXT000053935660",
      "ACCOTEXT000053935667",
    ]);
  });

  test("ignore les fichiers non-XML d'accords (liste de suppression)", () => {
    write(
      `${TEXT_DIR}/ACCOTEXT000053935667.xml`,
      fixture("accord-1-theme.xml")
    );
    write("20260424-063142/liste_suppression_acco.dat", "T00003\nT00004");

    const { accords } = readAccordsFromDir(dir);
    expect(accords).toHaveLength(1);
  });

  test("compte les XML invalides sans interrompre le parsing", () => {
    write(
      `${TEXT_DIR}/ACCOTEXT000053935667.xml`,
      fixture("accord-1-theme.xml")
    );
    write(`${TEXT_DIR}/corrompu.xml`, "<TEXTE_ACCO><META></META></TEXTE_ACCO>");

    const { accords, errors } = readAccordsFromDir(dir);
    expect(accords).toHaveLength(1);
    expect(errors).toBe(1);
  });

  test("retourne un résultat vide pour un dossier inexistant", () => {
    expect(readAccordsFromDir(path.join(dir, "nope"))).toEqual({
      accords: [],
      errors: 0,
    });
  });
});
