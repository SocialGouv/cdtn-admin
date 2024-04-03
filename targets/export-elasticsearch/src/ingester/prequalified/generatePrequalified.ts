import { SOURCES } from "@socialgouv/cdtn-sources";
import { fetchPrequalified } from "./fetchPrequalified";
import { PrequalifiedElasticDocument } from "@shared/types";
import { removeUndefinedKeys } from "../utils/removeUndefinedKeys";

export const generatePrequalified = async (): Promise<
  PrequalifiedElasticDocument[]
> => {
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
        breadcrumbs: [],
        url: document.url,
        icon: document.icon,
        action: document.action,
      })
    ),
  }));
};
