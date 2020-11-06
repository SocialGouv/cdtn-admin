// Do we really need this one ?
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import queryString from "query-string";

import { articleToReference, fixArticleNum } from "../../lib/referenceResolver";

/**
 * check if qs params come from a ccn url
 * @param {{[key:string]:string}} qs
 */
function isConventionCollective(qs) {
  return qs.idConvention;
}

/**
 * check if qs params come from a cdt url
 * @param {{[key:string]:string}} qs
 */
function isCodeDuTravail(qs) {
  return qs.cidTexte === "LEGITEXT000006072050";
}
/**
 * check if qs params come from a jo url
 * @param {{[key:string]:string}} qs
 */
function isJournalOfficiel(qs) {
  return (qs.cidTexte || "").includes("JORFTEXT");
}

/**
 * determine url type based on qs params
 * @param {{[key:string]:string}} qs
 * @returns {"code-du-travail" | "convention-collective" | "journal-officiel" | null}
 */
const getTextType = (qs) => {
  if (isCodeDuTravail(qs)) {
    return "code-du-travail";
  }
  if (isConventionCollective(qs)) {
    return "convention-collective";
  }
  if (isJournalOfficiel(qs)) {
    return "journal-officiel";
  }
  return null;
};

/**
 * @param {import("@socialgouv/fiches-vdd-types").RawJson[]} references
 * @param {ingester.referenceResolver} resolveCdtReference
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement[]} agreements
 * @returns {[ingester.LegalReference[], ingester.ReferencedTexts[]]}
 */
export function parseReferences(references, resolveCdtReference, agreements) {
  /** @type {ingester.LegalReference[]} */
  const legalReferences = [];

  /** @type {ingester.ReferencedTexts[]} */
  const referencedTexts = [];

  for (const reference of references) {
    const { URL: url } = reference.attributes;
    const qs = /** @type {{[key:string]: string}} */ (queryString.parse(
      url.split("?")[1]
    ));
    const type = getTextType(qs);
    switch (type) {
      case "code-du-travail": {
        if (qs.idArticle) {
          const [
            article,
          ] = /** @type {import("@socialgouv/legi-data-types").CodeArticle[]} */ (resolveCdtReference(
            qs.idArticle
          ));
          if (!article) {
            break;
          }
          legalReferences.push(articleToReference(article));
          referencedTexts.push({
            slug: slugify(fixArticleNum(article.data.id, article.data.num)),
            title: article.data.num,
            type: SOURCES.CDT,
          });
        }
        if (qs.idSectionTA) {
          const [
            section,
          ] = /** @type {import("@socialgouv/legi-data-types").CodeSection[]} */ (resolveCdtReference(
            qs.idSectionTA
          ));
          if (!section) {
            break;
          }
          for (const child of section.children) {
            if (child.type !== "article") {
              break;
            }
            legalReferences.push(articleToReference(child));
            referencedTexts.push({
              slug: slugify(fixArticleNum(child.data.id, child.data.num)),
              title: child.data.num,
              type: SOURCES.CDT,
            });
          }
        }
        break;
      }

      case "convention-collective": {
        const convention = agreements.find(
          (convention) => convention.id === qs.idConvention
        );
        if (!convention) {
          break;
        }
        const { num, shortTitle } = convention;
        referencedTexts.push({
          slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
          title: shortTitle,
          type: SOURCES.CCN,
        });
        break;
      }

      case "journal-officiel": {
        referencedTexts.push({
          title: reference.children[0].children[0].text,
          type: SOURCES.EXTERNALS,
          url,
        });
        break;
      }
    }
  }
  return [legalReferences, referencedTexts];
}
