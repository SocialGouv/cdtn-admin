import fs from "fs";
import path from "path";

import {
  ACCO_XML_DIR,
  isSuppressionList,
  normalizeEntryPath,
} from "./extractAccoArchive";

/**
 * Extrait les identifiants d'accords à supprimer depuis le contenu de
 * `liste_suppression_acco.dat`.
 *
 * Chaque accord supprimé y figure via deux lignes : le chemin de son XML
 * (`acco/global/ACCO/TEXT/…/ACCOTEXT…`, sans extension) et celui de son
 * document bureautique associé (`.docx`, ignoré). On ne retient que le
 * basename des lignes situées sous le dossier des accords.
 */
export function parseSuppressionList(content: string): string[] {
  const ids = new Set<string>();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeEntryPath(rawLine.trim());
    if (!line.includes(`${ACCO_XML_DIR}/`)) {
      continue;
    }
    const id = line
      .split("/")
      .pop()
      ?.replace(/\.xml$/i, "");
    if (id) {
      ids.add(id);
    }
  }
  return [...ids];
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

/**
 * Lit les listes de suppression d'un dossier extrait et retourne les
 * identifiants d'accords à supprimer.
 */
export function readSuppressionIds(dir: string): string[] {
  const ids = new Set<string>();
  for (const file of listFiles(dir).filter(isSuppressionList)) {
    for (const id of parseSuppressionList(fs.readFileSync(file, "utf-8"))) {
      ids.add(id);
    }
  }
  return [...ids];
}
