// Do we really need this one ?
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import queryString from "query-string";

import { articletoReference } from "../../lib/referenceResolver";

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
 * @param {(id:string) => (import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementArticle> )[]} resolveCdtReference
 * @param {string} id
 * @returns {ingester.Reference[]}
 */
const getArticlesFromSection = (resolveCdtReference, id) => {
  const [
    section,
  ] = /** @type {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection>[]} */ (resolveCdtReference(
    id
  ));
  if (!section) {
    return [];
  }
  return section.children.flatMap((child) => {
    if (child.type !== "article") {
      return [];
    }
    return articletoReference(
      /** @type {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle>} */ (child)
    );
  });
};

/**
 * @param {import("@socialgouv/fiches-vdd").RawJson} reference
 * @param {(id:string) => (import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementSection> | import("unist-util-parents").NodeWithParent<import("@socialgouv/kali-data").AgreementArticle> )[]} resolveCdtReference
 * @param {import("@socialgouv/kali-data").IndexedAgreement[]} agreements
 * @returns {ingester.Reference[]}
 */
export function parseReference(reference, resolveCdtReference, agreements) {
  const { URL: url } = reference.attributes;
  const qs = /** @type {{[key:string]: string}} */ (queryString.parse(
    url.split("?")[1]
  ));
  const type = getTextType(qs);
  switch (type) {
    case "code-du-travail":
      if (qs.idArticle) {
        const [article] = resolveCdtReference(qs.idArticle);
        return article ? [articletoReference(article)] : [];
      }
      if (qs.idSectionTA) {
        // resolve related articles from CDT structure
        return getArticlesFromSection(resolveCdtReference, qs.idSectionTA);
      }
      return [];
    case "convention-collective": {
      const convention = agreements.find(
        (convention) => convention.id === qs.idConvention
      );
      if (!convention) {
        return [];
      }
      const { num, shortTitle } = convention;

      return [
        {
          id: convention.id,
          title: `${shortTitle}`,
          type: "external",
          url: `${getRouteBySource(SOURCES.CCN)}/${slugify(
            `${num}-${shortTitle}`.substring(0, 80)
          )}`,
        },
      ];
    }
    case "journal-officiel":
      return [
        {
          id: qs.cidTexte,
          title: reference.children[0].children[0].text,
          type: "external",
          url,
        },
      ];
    default:
      return [];
  }
}
