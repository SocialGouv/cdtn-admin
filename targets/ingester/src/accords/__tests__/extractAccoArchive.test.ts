import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";
import * as tar from "tar-fs";
import zlib from "zlib";

import {
  extractArchive,
  isAccordXml,
  isSuppressionList,
  normalizeEntryPath,
  shouldIgnoreEntry,
} from "../extractAccoArchive";

describe("normalizeEntryPath", () => {
  test.each([
    ["acco/global/ACCO/TEXT/a.xml", "acco/global/ACCO/TEXT/a.xml"],
    ["./acco/global/ACCO/TEXT/a.xml", "acco/global/ACCO/TEXT/a.xml"],
    ["/acco/global/ACCO/TEXT/a.xml", "acco/global/ACCO/TEXT/a.xml"],
    ["acco\\global\\ACCO\\TEXT\\a.xml", "acco/global/ACCO/TEXT/a.xml"],
  ])("normalise %s", (input, expected) => {
    expect(normalizeEntryPath(input)).toBe(expected);
  });
});

describe("isAccordXml", () => {
  test.each([
    "acco/global/ACCO/TEXT/ACCOTEXT000053935667.xml",
    "./acco/global/ACCO/TEXT/ACCOTEXT000053935667.xml",
    // dossier racine horodaté + sous-dossiers shardés (structure réelle)
    "20260424-063142/acco/global/ACCO/TEXT/00/00/53/93/56/ACCOTEXT000053935667.xml",
  ])("reconnaît un XML d'accord: %s", (p) => {
    expect(isAccordXml(p)).toBe(true);
  });

  test.each([
    "acco/global/ACCO/TEXT/readme.txt",
    "acco/global/bureautique/doc.docx",
    "acco/global/ACCO/TEXT",
    "liste_suppression_acco.dat",
    "autre/dossier/ACCO_T00123.xml",
  ])("rejette %s", (p) => {
    expect(isAccordXml(p)).toBe(false);
  });
});

describe("isSuppressionList", () => {
  test.each([
    "liste_suppression_acco.dat",
    "./liste_suppression_acco.dat",
    "20260424-063142/liste_suppression_acco.dat",
  ])("reconnaît la liste de suppression: %s", (p) => {
    expect(isSuppressionList(p)).toBe(true);
  });

  test.each(["acco/global/ACCO/TEXT/a.xml", "autre.dat"])("rejette %s", (p) => {
    expect(isSuppressionList(p)).toBe(false);
  });
});

describe("shouldIgnoreEntry", () => {
  test("garde les XML d'accords et la liste de suppression", () => {
    expect(shouldIgnoreEntry("acco/global/ACCO/TEXT/a.xml")).toBe(false);
    expect(shouldIgnoreEntry("liste_suppression_acco.dat")).toBe(false);
  });

  test("ignore le reste (bureautique, autres fichiers)", () => {
    expect(shouldIgnoreEntry("acco/global/bureautique/doc.docx")).toBe(true);
    expect(shouldIgnoreEntry("acco/global/bureautique/doc.pdf")).toBe(true);
    expect(shouldIgnoreEntry("acco/global/ACCO/TEXT/notes.txt")).toBe(true);
  });
});

describe("extractArchive", () => {
  let base: string;
  let srcDir: string;
  let destDir: string;

  // reproduit la structure réelle : dossier racine horodaté + sous-dossiers
  // shardés sous ACCO/TEXT, dossier bureautique, liste de suppression.
  const ROOT = "20260424-063142";
  const fixtureFiles: Record<string, string> = {
    [`${ROOT}/acco/global/ACCO/TEXT/00/00/01/ACCOTEXT001.xml`]:
      "<ACCORD><ID>1</ID></ACCORD>",
    [`${ROOT}/acco/global/ACCO/TEXT/00/00/02/ACCOTEXT002.xml`]:
      "<ACCORD><ID>2</ID></ACCORD>",
    [`${ROOT}/acco/global/ACCO/TEXT/readme.txt`]: "ignore moi",
    [`${ROOT}/acco/global/bureautique/2026/contrat.docx`]: "binaire",
    [`${ROOT}/liste_suppression_acco.dat`]: "T00003\nT00004",
  };

  beforeEach(() => {
    base = fs.mkdtempSync(path.join(os.tmpdir(), "acco-test-"));
    srcDir = path.join(base, "src");
    destDir = path.join(base, "dest");
    for (const [relPath, content] of Object.entries(fixtureFiles)) {
      const filePath = path.join(srcDir, relPath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
  });

  afterEach(() => {
    fs.rmSync(base, { recursive: true, force: true });
  });

  function buildArchive(): Readable {
    return tar.pack(srcDir).pipe(zlib.createGzip());
  }

  function listExtracted(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const walk = (current: string): string[] =>
      fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(current, entry.name);
        return entry.isDirectory()
          ? walk(full)
          : [path.relative(dir, full).split(path.sep).join("/")];
      });
    return walk(dir).sort();
  }

  test("extrait uniquement les XML d'accords et la liste de suppression", async () => {
    await extractArchive(buildArchive(), destDir);
    expect(listExtracted(destDir)).toEqual([
      `${ROOT}/acco/global/ACCO/TEXT/00/00/01/ACCOTEXT001.xml`,
      `${ROOT}/acco/global/ACCO/TEXT/00/00/02/ACCOTEXT002.xml`,
      `${ROOT}/liste_suppression_acco.dat`,
    ]);
  });

  test("n'extrait pas les documents bureautique ni les fichiers non pertinents", async () => {
    await extractArchive(buildArchive(), destDir);
    const extracted = listExtracted(destDir);
    expect(extracted.some((p) => p.includes("bureautique"))).toBe(false);
    expect(extracted.some((p) => p.endsWith("readme.txt"))).toBe(false);
  });

  test("préserve le contenu des fichiers extraits", async () => {
    await extractArchive(buildArchive(), destDir);
    const xml = fs.readFileSync(
      path.join(
        destDir,
        `${ROOT}/acco/global/ACCO/TEXT/00/00/01/ACCOTEXT001.xml`
      ),
      "utf-8"
    );
    expect(xml).toBe("<ACCORD><ID>1</ID></ACCORD>");
    const suppressions = fs.readFileSync(
      path.join(destDir, `${ROOT}/liste_suppression_acco.dat`),
      "utf-8"
    );
    expect(suppressions).toBe("T00003\nT00004");
  });
});
