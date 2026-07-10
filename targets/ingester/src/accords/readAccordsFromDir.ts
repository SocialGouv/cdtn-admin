import fs from "fs";
import path from "path";

import { isAccordXml } from "./extractAccoArchive";
import { type Accord, parseAccordXml } from "./parseAccordXml";

export interface ReadAccordsResult {
  accords: Accord[];
  /** Nombre de fichiers XML dont le parsing a échoué. */
  errors: number;
}

/** Liste récursivement les fichiers XML d'accords sous `dir`. */
export function listAccordXmlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listAccordXmlFiles(full);
    }
    return isAccordXml(full) ? [full] : [];
  });
}

/**
 * Lit et parse tous les XML d'accords d'un dossier extrait. Tolère les fichiers
 * invalides (comptés dans `errors`) pour ne pas interrompre l'ingestion sur un
 * XML corrompu (cf. tolérance < 1% du ticket).
 */
export function readAccordsFromDir(dir: string): ReadAccordsResult {
  const accords: Accord[] = [];
  let errors = 0;
  for (const file of listAccordXmlFiles(dir)) {
    try {
      accords.push(parseAccordXml(fs.readFileSync(file, "utf-8")));
    } catch (error: unknown) {
      errors++;
      console.error(`accords: parsing échoué pour ${file}`, error);
    }
  }
  return { accords, errors };
}
