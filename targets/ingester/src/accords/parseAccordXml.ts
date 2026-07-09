import { XMLParser } from "fast-xml-parser";

/**
 * Représentation d'un accord d'entreprise, extraite d'un fichier XML ACCO.
 * Champs issus de la RG3 du ticket #1700.
 */
export interface Accord {
  /** Identifiant DILA, ex: `ACCOTEXT000053935667` (META_COMMUN/ID) */
  id: string;
  /** Intitulé de l'accord (TITRE_TXT) */
  title: string;
  /** SIRET de l'entreprise déposante, `null` si absent */
  siret: string | null;
  /** Dates au format `YYYY-MM-DD`, `null` si absentes */
  dateMaj: string | null;
  dateDepot: string | null;
  dateEffet: string | null;
  dateFin: string | null;
  dateDiffusion: string | null;
  /** Accord publié dans sa version intégrale (CONFORME_VERSION_INTEGRALE) */
  conformeVersionIntegrale: boolean;
  /** Libellés des thèmes (THEMES > THEME > LIBELLE) */
  themes: string[];
  /** Codes des signataires (SIGNATAIRES > SIGNATAIRE) */
  signataires: string[];
}

interface RawTheme {
  LIBELLE?: unknown;
}

interface RawMetaAcco {
  TITRE_TXT?: unknown;
  SIRET?: unknown;
  DATE_MAJ?: unknown;
  DATE_DEPOT?: unknown;
  DATE_EFFET?: unknown;
  DATE_FIN?: unknown;
  DATE_DIFFUSION?: unknown;
  CONFORME_VERSION_INTEGRALE?: unknown;
  THEMES?: { THEME?: RawTheme[] };
  SIGNATAIRES?: { SIGNATAIRE?: unknown[] };
}

interface RawAccordXml {
  TEXTE_ACCO?: {
    META?: {
      META_COMMUN?: { ID?: unknown };
      META_SPEC?: { META_ACCO?: RawMetaAcco };
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: true,
  // ne pas convertir les valeurs : SIRET/dates/booléens restent des chaînes,
  // on les normalise nous-mêmes (évite qu'un SIRET devienne un nombre, etc.)
  parseTagValue: false,
  trimValues: true,
  // force le tableau même quand il n'y a qu'un seul élément
  isArray: (name) => name === "THEME" || name === "SIGNATAIRE",
});

function toArray<T>(value: T | T[] | undefined | null | ""): T[] {
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/** Normalise une valeur texte : chaîne non vide ou `null`. */
function text(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

/**
 * Parse un fichier XML d'accord ACCO et en extrait les métadonnées.
 * @throws si la structure attendue (META_COMMUN/ID, META_ACCO) est absente.
 */
export function parseAccordXml(xml: string): Accord {
  const doc = parser.parse(xml) as RawAccordXml;
  const meta = doc.TEXTE_ACCO?.META;
  const commun = meta?.META_COMMUN;
  const acco = meta?.META_SPEC?.META_ACCO;

  const id = text(commun?.ID);
  if (!acco || !id) {
    throw new Error(
      "XML d'accord invalide : structure META_COMMUN/ID ou META_ACCO manquante"
    );
  }

  return {
    id,
    title: text(acco.TITRE_TXT) ?? "",
    siret: text(acco.SIRET),
    dateMaj: text(acco.DATE_MAJ),
    dateDepot: text(acco.DATE_DEPOT),
    dateEffet: text(acco.DATE_EFFET),
    dateFin: text(acco.DATE_FIN),
    dateDiffusion: text(acco.DATE_DIFFUSION),
    conformeVersionIntegrale: text(acco.CONFORME_VERSION_INTEGRALE) === "true",
    themes: toArray(acco.THEMES?.THEME)
      .map((theme) => text(theme.LIBELLE))
      .filter((libelle): libelle is string => libelle !== null),
    signataires: toArray(acco.SIGNATAIRES?.SIGNATAIRE)
      .map((signataire) => text(signataire))
      .filter((code): code is string => code !== null),
  };
}
