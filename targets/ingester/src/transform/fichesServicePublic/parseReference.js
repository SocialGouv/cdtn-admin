import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import queryString from "query-string";

import { fixArticleNum } from "../../lib/referenceResolver";

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
  return null;
};

/**
 *
 * @param {string} url
 */
function isPreviousLegifranceUrl(url) {
  return /affich.+\.do/.test(url);
}

/**
 *
 * @param {import("@socialgouv/legi-data-types").CodeArticle} article
 */
function cdtArticleReference(article) {
  return {
    slug: slugify(fixArticleNum(article.data.id, article.data.num)),
    title: article.data.num,
    type: SOURCES.CDT,
  };
}
/**
 *
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement} convention
 */
function agreementReference(convention) {
  const { num, shortTitle } = convention;
  return {
    slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
    title: shortTitle,
    type: SOURCES.CCN,
  };
}
/**
 *
 * @param {string} url
 * @param {string} label
 */
function externalReference(url, label) {
  return {
    title: label,
    type: SOURCES.EXTERNALS,
    url,
  };
}

/**
 * @param {import("@socialgouv/fiches-vdd-types").RawJson[]} references
 * @param {ingester.referenceResolver} resolveCdtReference
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement[]} agreements
 * @returns { ingester.ReferencedTexts[] }
 */
export function parseReferences(references, resolveCdtReference, agreements) {
  /** @type {ingester.ReferencedTexts[][]} */
  const referencedTexts = [];

  for (const reference of references) {
    const { URL: url } = reference.attributes;
    const label = reference.children[0].children[0].text;
    const refExtractor = isPreviousLegifranceUrl(url)
      ? extractOldReference
      : extractNewReference;

    const refs = refExtractor(url, label, resolveCdtReference, agreements);
    referencedTexts.push(refs);
  }
  return referencedTexts.flat();
}
/**
 * @param {string} url
 * @param {string} label
 * @param {ingester.referenceResolver} resolveCdtReference
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement[]} agreements
 * @returns {ingester.ReferencedTexts[]}
 */
export function extractOldReference(
  url,
  label,
  resolveCdtReference,
  agreements
) {
  /**
   * Typologie des anciens liens legifrance
   *
   * /affichCode.do?cidTexte=LEGITEXT000006072050&idSectionTA=LEGISCTA000033444780
   * /affichCode.do?idArticle=LEGIARTI000006526850&idSectionTA=LEGISCTA000006182537&cidTexte=LEGITEXT000006071191
   * /affichCodeArticle.do;?cidTexte=LEGITEXT000006073189&idArticle=LEGIARTI000036467594
   * /affichIDCC.do?cidTexte=KALITEXT000005670044&idSectionTA=KALISCTA000005747382&idConvention=KALICONT000005635534
   * /affichJuriJudi.do?idTexte=JURITEXT000007023096
   * /affichTexte.do;?cidTexte=JORFTEXT000034298773
   * /affichTexteArticle.do?cidTexte=JORFTEXT000029953502&idArticle=JORFARTI000029953537
   *
   */
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
          console.error(
            `extractOldReferences: unkown article id ${qs.idArticle}, maybe reference is obsolete`
          );
          return [externalReference(url, label)];
        }
        return [cdtArticleReference(article)];
      }
      if (qs.idSectionTA) {
        const [
          section,
        ] = /** @type {import("@socialgouv/legi-data-types").CodeSection[]} */ (resolveCdtReference(
          qs.idSectionTA
        ));
        if (!section) {
          console.error(
            `extractOldReferences: unkown section id ${qs.idSectionTA}, maybe reference is obsolete`
          );
          return [externalReference(url, label)];
        }
        if (section.children.every((child) => child.type !== "article")) {
          return [externalReference(url, label)];
        }
        return section.children.flatMap((child) => {
          if (child.type !== "article") {
            return [];
          }
          return [cdtArticleReference(child)];
        });
      }
      console.error(
        `extractOldReferences: cannot extract article reference from url ${url}`
      );
      return [externalReference(url, label)];
    }

    case "convention-collective": {
      const convention = agreements.find(
        (convention) => convention.id === qs.idConvention
      );
      if (!convention) {
        console.error(
          `extractOldReferences: unkown convention id ${qs.idConvention}`
        );
        return [externalReference(url, label)];
      }
      return [agreementReference(convention)];
    }
    // all other type fall as external link
    default: {
      return [externalReference(url, label)];
    }
  }
}

/**
 * @param {string} url
 * @param {string} label
 * @param {ingester.referenceResolver} resolveCdtReference
 * @param {import("@socialgouv/kali-data-types").IndexedAgreement[]} agreements
 * @returns {ingester.ReferencedTexts[]}
 */
export function extractNewReference(
  url,
  label,
  resolveCdtReference,
  agreements
) {
  /**
   * typologie des nouveaux liens legifrance que l'on trouve dans les fiches service-public.fr
   *
   * /codes/id/LEGIARTI000041973733/: affiche un article et la section qui le contient
   * /codes/article_lc/LEGIARTI000041973733/ : affiche l'article seul
   * /codes/id/LEGISCTA000006156295 : affiche un section
   * /codes/section_lc/LEGITEXT000006072050/LEGISCTA000006177917 affiche une section
   * /conv_coll/id/KALICONT000005635598/ : affiche un convention collective
   * /loda/article_lc/LEGIARTI000038836271/
   * /loda/id/JORFTEXT000000196442/
   * /circulaire/id/39848
   * /download/pdf/circ?id=44449
   * /eli/arrete/2016/12/5/AFSS1628753A/jo/texte
   * /eli/decret/2014/12/30/ETST1429039D/jo/texte
   * /loi/2018/12/22/CPAX1824950L/jo/article_18
   * /article_jo/JORFARTI000042665320
   * /id/JORFTEXT000000599731
   * /jorf/id/JORFTEXT000042748814
   *
   */

  if (/\/codes\//.test(url)) {
    if (/LEGIARTI/.test(url)) {
      const [, articleId] = url.match(/(LEGIARTI\w+)(\W|$)/) || [];
      const [
        article,
      ] = /** @type {import("@socialgouv/legi-data-types").CodeArticle[]} */ (resolveCdtReference(
        articleId
      ));
      if (article) {
        return [cdtArticleReference(article)];
      }
    } else if (/LEGISCTA/.test(url)) {
      const [, sectionId] = url.match(/(LEGISCTA\w+)(\W|$)/) || [];
      const [
        section,
      ] = /** @type {import("@socialgouv/legi-data-types").CodeSection[]} */ (resolveCdtReference(
        sectionId
      ));

      if (section) {
        if (section.children.every((child) => child.type !== "article")) {
          return [externalReference(url, label)];
        }
        return section.children.flatMap((child) => {
          if (child.type !== "article") {
            return [];
          }
          return [cdtArticleReference(child)];
        });
      }
    }
  }

  if (/\/conv_coll\//.test(url)) {
    const [, kalicontainerId] = url.match(/(KALICONT\w+)(\W|$)/) || [];
    const convention = agreements.find(
      (convention) => convention.id === kalicontainerId
    );
    if (!convention) {
      console.error(
        `extractNewReferences: unkown convention id ${kalicontainerId}`
      );
      return [externalReference(url, label)];
    }
    return [agreementReference(convention)];
  }

  return [externalReference(url, label)];
}
