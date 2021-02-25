import { SOURCES } from "@socialgouv/cdtn-sources";
import slugify from "@socialgouv/cdtn-slugify";

import { parseReferences } from "./parseReference.js";

/**
 *
 * @param {import("@socialgouv/fiches-vdd-types").RawJson} element
 * @param {string} name
 */
function getChild(element, name) {
  return element.children.find((el) => el.name === name);
}

/**
 * Beware, this one is recursive
 * @param {import("@socialgouv/fiches-vdd-types").RawJson | undefined} element
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
 * @param {import("@socialgouv/fiches-vdd-types").RawJson} fiche
 * @param {references.referenceResolver} resolveCdtReference
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement[]} agreements
 * @returns {Pick<references.FicheServicePublic, Exclude<keyof references.FicheServicePublic, keyof {is_searchable: Boolean}>> }
 */
export function format(fiche, resolveCdtReference, agreements) {
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
    slug: slugify(title),
    url,
  };
}
