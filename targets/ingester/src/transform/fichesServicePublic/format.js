import cdtnSources from "@socialgouv/cdtn-sources";

import { parseReference } from "./parseReference.js";

const { SOURCES } = cdtnSources;
/**
 *
 * @param {import("@socialgouv/fiches-vdd").RawJson} element
 * @param {string} name
 */
function getChild(element, name) {
  return element.children.find((el) => el.name === name);
}

/**
 * Beware, this one is recursive
 * @param {import("@socialgouv/fiches-vdd").RawJson | undefined} element
 * @returns {string}
 */
function getText(element) {
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
/**
 *
 * @param {import("@socialgouv/fiches-vdd").RawJson} fiche
 * @param {import("unist-util-parents").RootNodeWithParent<import("@socialgouv/legi-data").Code>} cdt
 * @param {import("@socialgouv/kali-data").IndexedAgreement[]} agreement
 * @returns {Pick<ingester.FicheServicePublic, Exclude<keyof ingester.FicheServicePublic, keyof {slug, url:string, excludeFromSearch: string}>> }
 */
export function format(fiche, cdt, agreement) {
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

  const intro = getText(getChild(publication, "Introduction"));
  const texte = getText(getChild(publication, "Texte"));
  const listeSituations = getText(getChild(publication, "ListeSituations"));
  const text = intro + " " + texte + " " + listeSituations;

  const references_juridiques = publication.children
    .filter((el) => el.name === "Reference")
    .flatMap((refs) => parseReference(refs, cdt, agreement));

  return {
    date,
    description,
    id,
    raw: JSON.stringify(publication),
    references_juridiques,
    source: SOURCES.SHEET_SP,
    text,
    title,
  };
}
