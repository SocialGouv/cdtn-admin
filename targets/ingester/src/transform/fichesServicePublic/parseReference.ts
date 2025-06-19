import type {
  ServicePublicExternalReference,
  ServicePublicInternalReference,
  ServicePublicReference,
} from "@socialgouv/cdtn-types";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { RawJson } from "@socialgouv/fiches-vdd-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type { ParsedQuery } from "query-string";
import * as queryString from "query-string";

import type { ReferenceResolver } from "../../lib/referenceResolver";
import { fixArticleNum } from "../../lib/referenceResolver";
import { ShortAgreement } from "./fetchAgreementsWithKaliId";

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
  agreement: ShortAgreement
): ServicePublicInternalReference {
  const { id, shortName } = agreement;
  return {
    slug: slugify(`${parseInt(id)}-${shortName}`.substring(0, 80)),
    title: shortName,
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
  agreements: ShortAgreement[]
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
// Helper function to handle article references
function handleArticleReference(
  resolveCdtReference: ReferenceResolver,
  articleId: string | string[] | null,
  url: string,
  label: string
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
  const unwrappedId = Array.isArray(articleId) ? articleId[0] : articleId;
  const [article = undefined] = resolveCdtReference(
    unwrappedId
  ) as CodeArticle[];

  if (!article) {
    console.error(
      `extractOldReferences: unknown article id ${articleId}, maybe reference is obsolete`
    );
    return [externalReference(url, label)];
  }

  return [cdtArticleReference(article)];
}

// Helper function to handle section references
function handleSectionReference(
  resolveCdtReference: ReferenceResolver,
  sectionId: string | string[] | null,
  url: string,
  label: string
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
  const unwrappedId = Array.isArray(sectionId) ? sectionId[0] : sectionId;
  const [section = undefined] = resolveCdtReference(
    unwrappedId
  ) as CodeSection[];

  if (!section) {
    console.error(
      `extractOldReferences: unknown section id ${sectionId}, maybe reference is obsolete`
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

// Helper function to handle convention collective references
function handleConventionReference(
  agreements: ShortAgreement[],
  conventionId: string | string[] | null,
  url: string,
  label: string
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
  const convention = agreements.find((ccn) => ccn.kaliId === conventionId);

  if (!convention) {
    console.error(
      `extractOldReferences: unknown convention id ${conventionId}`
    );
    return [externalReference(url, label)];
  }

  return [agreementReference(convention)];
}

export function extractOldReference(
  resolveCdtReference: ReferenceResolver,
  agreements: ShortAgreement[],
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
  const type = getTextType(qs);

  switch (type) {
    case "code-du-travail": {
      if (qs.idArticle) {
        return handleArticleReference(
          resolveCdtReference,
          qs.idArticle,
          url,
          label
        );
      }
      if (qs.idSectionTA) {
        return handleSectionReference(
          resolveCdtReference,
          qs.idSectionTA,
          url,
          label
        );
      }
      console.error(
        `extractOldReferences: cannot extract article reference from url ${url}`
      );
      return [externalReference(url, label)];
    }

    case "convention-collective": {
      return handleConventionReference(agreements, qs.idConvention, url, label);
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
// Helper function to handle article references in new Legifrance format
function handleNewArticleReference(
  resolveCdtReference: ReferenceResolver,
  url: string
): ServicePublicInternalReference[] {
  const [, articleId] = /(LEGIARTI\w+)(\W|$)/.exec(url) ?? [];
  const [article = undefined] = resolveCdtReference(articleId) as CodeArticle[];

  if (!article) {
    return [];
  }

  return [cdtArticleReference(article)];
}

// Helper function to handle section references in new Legifrance format
function handleNewSectionReference(
  resolveCdtReference: ReferenceResolver,
  url: string,
  label: string
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
  const [, sectionId] = /(LEGISCTA\w+)(\W|$)/.exec(url) ?? [];
  const [section = undefined] = resolveCdtReference(sectionId) as CodeSection[];

  if (!section) {
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

// Helper function to handle convention collective references in new Legifrance format
function handleNewConventionReference(
  agreements: ShortAgreement[],
  url: string,
  label: string
): ServicePublicExternalReference[] | ServicePublicInternalReference[] {
  const [, kalicontainerId] = /(KALICONT\w+)(\W|$)/.exec(url) ?? [];
  const [, kaliTextId] = /(KALITEXT\w+)(\W|$)/.exec(url) ?? [];

  let convention;
  if (kalicontainerId) {
    convention = agreements.find((ccn) => ccn.kaliId === kalicontainerId);
  } else if (kaliTextId) {
    convention = agreements.find((ccn) => ccn.rootText === kaliTextId);
  }

  if (!convention) {
    console.error(
      `extractNewReferences: unknown convention id ${kalicontainerId} or text ${kaliTextId} from ${url}`
    );
    return [externalReference(url, label)];
  }

  return [agreementReference(convention)];
}

export function extractNewReference(
  resolveCdtReference: ReferenceResolver,
  agreements: ShortAgreement[],
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

  // Handle code references
  if (url.includes("/codes/")) {
    if (url.includes("LEGIARTI")) {
      return handleNewArticleReference(resolveCdtReference, url);
    }

    if (url.includes("LEGISCTA")) {
      return handleNewSectionReference(resolveCdtReference, url, label);
    }
  }

  // Handle convention collective references
  if (url.includes("/conv_coll/")) {
    return handleNewConventionReference(agreements, url, label);
  }

  // Default case: return as external reference
  return [externalReference(url, label)];
}
