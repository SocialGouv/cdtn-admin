import type {
  ServicePublicExternalReference,
  ServicePublicInternalReference,
  ServicePublicReference,
} from "@shared/types";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { RawJson } from "@socialgouv/fiches-vdd-types";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type { ParsedQuery } from "query-string";
import * as queryString from "query-string";

import type { ReferenceResolver } from "../../lib/referenceResolver";
import { fixArticleNum } from "../../lib/referenceResolver";

function isConventionCollective(qs: ParsedQuery) {
  return qs.idConvention;
}

function isCodeDuTravail(qs: ParsedQuery) {
  return qs.cidTexte === "LEGITEXT000006072050";
}

/**
 * determine url type based on qs params
 */
const getTextType = (qs: ParsedQuery) => {
  if (isCodeDuTravail(qs)) {
    return "code-du-travail";
  }
  if (isConventionCollective(qs)) {
    return "convention-collective";
  }
  return null;
};

function isPreviousLegifranceUrl(url: string) {
  return /affich.+\.do/.test(url);
}

function cdtArticleReference(
  article: CodeArticle
): ServicePublicInternalReference {
  return {
    slug: slugify(fixArticleNum(article.data.id, article.data.num)),
    title: article.data.num,
    type: SOURCES.CDT,
  };
}

function agreementReference(
  agreement: IndexedAgreement
): ServicePublicInternalReference {
  const { num, shortTitle } = agreement;
  return {
    slug: slugify(`${num}-${shortTitle}`.substring(0, 80)),
    title: shortTitle,
    type: SOURCES.CCN,
  };
}

function externalReference(
  url: string,
  label: string
): ServicePublicExternalReference {
  return {
    title: label,
    type: SOURCES.EXTERNALS,
    url,
  };
}

export function parseReferences(
  references: RawJson[],
  resolveCdtReference: ReferenceResolver,
  agreements: IndexedAgreement[]
): ServicePublicReference[] {
  const referencedTexts = [];

  for (const reference of references) {
    const { URL: url } = reference.attributes;
    const label = reference.children[0]?.children?.[0]?.text;
    const refExtractor = isPreviousLegifranceUrl(url)
      ? extractOldReference
      : extractNewReference;

    const refs = refExtractor(resolveCdtReference, agreements, url, label);
    referencedTexts.push(refs);
  }
  return referencedTexts.flat();
}

/**
 * @returns {ingester.ReferencedTexts[]}
 */
export function extractOldReference(
  resolveCdtReference: ReferenceResolver,
  agreements: IndexedAgreement[],
  url: string,
  label = ""
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
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
  const qs = queryString.parse(url.split("?")[1]);

  const unwrapQuerystringParam = (param: (string | null)[] | string) => {
    return Array.isArray(param) ? param[0] : param;
  };

  const type = getTextType(qs);

  switch (type) {
    case "code-du-travail": {
      if (qs.idArticle) {
        const [article = undefined] = resolveCdtReference(
          unwrapQuerystringParam(qs.idArticle)
        ) as CodeArticle[];
        if (!article) {
          console.error(
            `extractOldReferences: unkown article id ${qs.idArticle}, maybe reference is obsolete`
          );
          return [externalReference(url, label)];
        }
        return [cdtArticleReference(article)];
      }
      if (qs.idSectionTA) {
        const [section = undefined] = resolveCdtReference(
          unwrapQuerystringParam(qs.idSectionTA)
        ) as CodeSection[];
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
      const convention = agreements.find((ccn) => ccn.id === qs.idConvention);
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
 * @returns {ingester.ReferencedTexts[]}
 */
export function extractNewReference(
  resolveCdtReference: ReferenceResolver,
  agreements: IndexedAgreement[],
  url: string,
  label = ""
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
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

  if (url.includes("/codes/")) {
    if (url.includes("LEGIARTI")) {
      const [, articleId] = /(LEGIARTI\w+)(\W|$)/.exec(url) ?? [];
      const [article = undefined] = resolveCdtReference(
        articleId
      ) as CodeArticle[];
      if (!article) {
        return [];
      }
      return [cdtArticleReference(article)];
    } else if (url.includes("LEGISCTA")) {
      const [, sectionId] = /(LEGISCTA\w+)(\W|$)/.exec(url) ?? [];
      const [section = undefined] = resolveCdtReference(
        sectionId
      ) as CodeSection[];

      if (!section) {
        return [];
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
  }

  if (url.includes("/conv_coll/")) {
    const [, kalicontainerId] = /(KALICONT\w+)(\W|$)/.exec(url) ?? [];
    const convention = agreements.find((ccn) => ccn.id === kalicontainerId);
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
