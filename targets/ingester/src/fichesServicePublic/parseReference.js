// Do we really need this one ?
import slugify from "@socialgouv/cdtn-slugify";
import conventions from "@socialgouv/kali-data/data/index.json";
import cdt from "@socialgouv/legi-data/data/LEGITEXT000006072050.json";
import queryString from "query-string";
import find from "unist-util-find";

const isConventionCollective = (qs) => qs.idConvention;
const isCodeDuTravail = (qs) => qs.cidTexte === "LEGITEXT000006072050";
const isJournalOfficiel = (qs) => (qs.cidText || "").includes("JORFTEXT");

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
};

// resolve article.num in LEGI extract
const getArticleNumFromId = (id) => {
  const article = find(
    cdt,
    (node) => node.type === "article" && node.data.id === id
  );
  return article && article.data.num;
};

const getArticlesFromSection = (id) => {
  const section = find(cdt, (node) => node.data.id === id);
  if (section) {
    return section.children
      .filter((child) => child.type === "article")
      .map((article) => createCDTRef(article.data.num));
  }
  return [];
};

const createCDTRef = (id) => ({
  id: id.toLowerCase(),
  title: `Article ${id} du code du travail`,
  type: "code-du-travail",
});

const createCCRef = (id, slug, title) => ({
  id,
  slug,
  title,
  type: "convention-collective",
});

const createJORef = (id, title, url) => ({
  id,
  title,
  type: "journal-officiel",
  url,
});

/**
 *
 * @param {import("@socialgouv/fiches-vdd").RawJson} reference
 */
export function parseReference(reference) {
  const { URL: url } = reference.attributes;
  const qs = queryString.parse(url.split("?")[1]);
  const type = getTextType(qs);
  switch (type) {
    case "code-du-travail":
      if (qs.idArticle) {
        // resolve related article num from CDT structure
        const articleNum = getArticleNumFromId(qs.idArticle);
        if (!articleNum) return [];
        return [createCDTRef(articleNum)];
      }
      if (qs.idSectionTA) {
        // resolve related articles from CDT structure
        return getArticlesFromSection(qs.idSectionTA);
      }
      break;
    case "convention-collective": {
      const {
        id,
        title,
        num,
        shortTitle,
      } = /** @type {import("src").KaliContainer} */ (conventions).find(
        (convention) => convention.id === qs.idConvention
      );
      const slug = slugify(`${num}-${shortTitle}`.substring(0, 80)); // as in populate.js
      return [createCCRef(id, slug, title)];
    }
    case "journal-officiel":
      return [
        createJORef(qs.cidTexte, reference.children[0].children[0].text, url),
      ];
    default:
      return [];
  }
}
