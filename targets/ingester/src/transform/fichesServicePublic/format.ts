import { SOURCES } from "@socialgouv/cdtn-sources";
import { RawJson } from "@socialgouv/fiches-vdd-types";
import { IndexedAgreement } from "@socialgouv/kali-data-types";

import { parseReferences } from "./parseReference.js";
import { ReferenceResolver } from "../../lib/referenceResolver";

function getChild(element: RawJson, name: string) {
  return element.children.find((el) => el.name === name);
}

/**
 * Beware, this one is recursive
 */
function getText(element?: RawJson): string {
  if (!element) {
    return "";
  }
  if (element.type === "text" && element.text) {
    return element.text.trim();
  }
  if (element.children) {
    return element.children.map((child) => getText(child)).join(" ");
  }
  return "";
}

export function format(
  fiche: RawJson,
  resolveCdtReference: ReferenceResolver,
  agreements: IndexedAgreement[]
) {
  const publication = fiche.children[0];
  const { ID: id } = publication.attributes;

  // We filter out the elements we will never use nor display
  publication.children = publication.children.filter(
    (child) => child.name !== "OuSAdresser" && child.name !== "ServiceEnLigne"
  );

  const title = getText(getChild(publication, "dc:title"));
  const description = getText(getChild(publication, "dc:description"));
  const dateRaw = getText(getChild(publication, "dc:date"));
  const [year, month, day] = dateRaw.split(" ")[1].split("-");
  const date = `${day}/${month}/${year}`;

  const audience = getText(getChild(publication, "Audience"));
  const urlSlug =
    audience === "Particuliers" ? "particuliers" : "professionnels-entreprises";
  const url = `https://www.service-public.fr/${urlSlug}/vosdroits/${id}`;

  const intro = getText(getChild(publication, "Introduction"));
  const texte = getText(getChild(publication, "Texte"));
  const listeSituations = getText(getChild(publication, "ListeSituations"));
  const text = intro + " " + texte + " " + listeSituations;

  const references = publication.children.filter(
    (el) => el.name === "Reference"
  );

  const referencedTexts = parseReferences(
    references,
    resolveCdtReference,
    agreements
  );

  return {
    date,
    description,
    id,
    raw: JSON.stringify(publication),
    referencedTexts,
    source: SOURCES.SHEET_SP,
    text,
    title,
    url,
  };
}
