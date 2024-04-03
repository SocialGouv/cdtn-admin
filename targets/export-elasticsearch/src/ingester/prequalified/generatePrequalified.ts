import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchPrequalified } from "./fetchPrequalified";
import { PrequalifiedElasticDocument } from "@shared/types";
import { removeUndefinedKeys } from "../utils/removeUndefinedKeys";
import { GetBreadcrumbsFn } from "../breadcrumbs";

export const generatePrequalified = async (
  getBreadcrumbs: GetBreadcrumbsFn
): Promise<PrequalifiedElasticDocument[]> => {
  const prequalified = await fetchPrequalified();
  if (!prequalified) {
    return [];
  }
  return prequalified.map(({ variants, id, title, documents: refs }) => ({
    cdtnId: id,
    id,
    breadcrumbs: [],
    excludeFromSearch: true,
    isPublished: true,
    metaDescription: title,
    text: title,
    title,
    source: SOURCES.PREQUALIFIED,
    variants,
    refs: refs.map(({ document }) =>
      removeUndefinedKeys({
        id: document.id,
        cdtnId: document.cdtnId,
        slug: document.slug,
        title: document.title,
        source: document.source,
        description: document.description || document.document.description,
        breadcrumbs: getBreadcrumbs(document.cdtnId),
        url: document.document.url,
        action: document.document.action,
      })
    ),
  }));
};
