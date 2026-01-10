import { HasuraDocument, WhatIsNewItemDoc } from "@socialgouv/cdtn-types";

import type { WhatIsNewItemRow } from "./api/whatIsNewItems.query";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { generateCdtnId } from "@shared/utils";

const toText = (title: string, description?: string) =>
  description?.trim() ? `${title}\n\n${description.trim()}` : title;

const toMetaDescription = (title: string, description?: string) =>
  description?.trim() ? description.trim() : `Mise à jour - ${title}`;

const toSlug = (id: string) => `quoi-de-neuf-${id}`;

const normalizeOptionalText = (value?: string | null) =>
  value?.trim() || undefined;

export const mapWhatIsNewItemToDocument = (
  item: WhatIsNewItemRow,
  existing?: HasuraDocument<WhatIsNewItemDoc>
): HasuraDocument<WhatIsNewItemDoc> => {
  const title = item.title;
  const description = normalizeOptionalText(item.description);
  const url = normalizeOptionalText(item.href);

  const document: WhatIsNewItemDoc = {
    title,
    weekStart: item.weekStart,
    kind: item.kind,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(item.createdAt ? { createdAt: item.createdAt } : {}),
    ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
  };

  return {
    ...existing,
    cdtn_id: existing?.cdtn_id ?? generateCdtnId(SOURCES.WHAT_IS_NEW + item.id),
    initial_id: item.id,
    source: SOURCES.WHAT_IS_NEW,
    title,
    text: toText(title, description),
    slug: toSlug(item.id),
    meta_description: toMetaDescription(title, description),
    is_searchable: true,
    is_published: true,
    is_available: true,
    document,
  };
};

export const mapWhatIsNewItemsToDocument = (
  items: WhatIsNewItemRow[]
): HasuraDocument<WhatIsNewItemDoc>[] => {
  return items.map((item) => mapWhatIsNewItemToDocument(item));
};
