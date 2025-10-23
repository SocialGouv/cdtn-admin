import { SOURCES } from "@socialgouv/cdtn-utils";
import type { RawJson } from "@socialgouv/fiches-vdd-types";

import type { FicheServicePublic } from "../..";
import type { ReferenceResolver } from "../../lib/referenceResolver";
import { parseReferences } from "./parseReference";
import { generateFichesSpRef } from "@shared/utils";
import { ShortAgreement } from "./fetchAgreementsWithKaliId";
import { Audience } from "@socialgouv/cdtn-types";

function getChild(element: RawJson, name: string) {
  // RawJson children not exist on text node
  //eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (element.children !== undefined) {
    return element.children.find((el) => el.name === name);
  }
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
  // RawJson children not exist on text node
  //eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (element.children) {
    return element.children.map((child) => getText(child)).join(" ");
  }
  return "";
}

const elementToNotDisplay = [
  "OuSAdresser",
  "ServiceEnLigne",
  "QuestionReponse",
  "VoirAussi",
  "PourEnSavoirPlus",
  "Definition",
  "Abreviation",
  "QuiPeutMAider",
];

const filterOutElementToNotDisplay = (publication: RawJson) =>
  publication.children.filter(
    (child) => !elementToNotDisplay.includes(child.name)
  );

export function format(
  fiche: RawJson,
  resolveCdtReference: ReferenceResolver,
  agreements: ShortAgreement[]
): Omit<FicheServicePublic, "is_searchable" | "slug"> {
  const publication = fiche.children[0];
  const { ID: id } = publication.attributes;

  publication.children = filterOutElementToNotDisplay(publication);

  const title = getText(getChild(publication, "dc:title"));
  const description = getText(getChild(publication, "dc:description"));
  const dateRaw = getText(getChild(publication, "dc:date"));
  const [year, month, day] = dateRaw.split(" ")[1].split("-");
  const date = `${day}/${month}/${year}`;

  const audience = getText(
    getChild(publication, "Audience")
  ).toLowerCase() as Audience;

  const url = generateFichesSpRef(audience, id);

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
