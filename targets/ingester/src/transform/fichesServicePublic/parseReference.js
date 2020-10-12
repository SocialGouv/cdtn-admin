// Do we really need this one ?
import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";
import queryString from "query-string";
import find from "unist-util-find";

const { SOURCES, getRouteBySource } = cdtnSources;
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
 * resolve article.num in LEGI extract
 * @param {import("unist-util-parents").RootNodeWithParent<import("@socialgouv/legi-data").Code>} cdt
 * @param {string} id
 * @returns {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle>}
 */
const getArticleFromId = (cdt, id) => {
  return find(cdt, (node) => node.type === "article" && node.data.id === id);
};

/**
 * @param {import("unist-util-parents").RootNodeWithParent<import("@socialgouv/legi-data").Code>} cdt
 * @param {string} id
 */
const getArticlesFromSection = (cdt, id) => {
  const section = /** @type {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeSection>}*/ (find(
    cdt,
    (node) => node.data.id === id
  ));
  if (section) {
    const articles = /** @type {import("unist-util-parents").NodeWithParent<import("@socialgouv/legi-data").CodeArticle>[]}*/ (section.children.filter(
      (child) => child.type === "article"
    ));

    return articles.map((article) => ({
      id: article.data.id,
      title: `Article ${article.data.id} du code du travail`,
      type: getRouteBySource(SOURCES.CDT),
      url: `https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/${article.parent.data.id}/#${article.data.id}`,
    }));
  }
  return [];
};

/**
 * @param {import("unist-util-parents").RootNodeWithParent<import("@socialgouv/legi-data").Code>} cdt
 * @param {import("@socialgouv/kali-data").IndexedAgreement[]} agreements
 * @param {import("@socialgouv/fiches-vdd").RawJson} reference
 * @returns {ingester.Reference[]}
 */
export function parseReference(reference, cdt, agreements) {
  const { URL: url } = reference.attributes;
  const qs = /** @type {{[key:string]: string}} */ (queryString.parse(
    url.split("?")[1]
  ));
  const type = getTextType(qs);
  switch (type) {
    case "code-du-travail":
      if (qs.idArticle) {
        // resolve related article num from CDT structure
        const article = getArticleFromId(cdt, qs.idArticle);
        if (!article) return [];
        return [
          {
            id: article.data.id,
            title: `Article ${article.data.id} du code du travail`,
            type: getRouteBySource(SOURCES.CDT),
            url: `https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/${article.parent.data.id}/#${article.data.id}`,
          },
        ];
      }
      if (qs.idSectionTA) {
        // resolve related articles from CDT structure
        return getArticlesFromSection(cdt, qs.idSectionTA);
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
