import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { WhatIsNewMonth } from "./type";

export type WhatIsNewDocument = {
  months: WhatIsNewMonth[];
};

export const mapWhatIsNewToDocument = (
  data: WhatIsNewMonth,
  document?: HasuraDocument<WhatIsNewDocument>
): HasuraDocument<WhatIsNewDocument> => {
  const title = "Quoi de neuf ?";
  const slug = "quoi-de-neuf";

  // Get existing months or create empty array
  const existingMonths = document?.document?.months || [];

  // Update or add the current month
  const monthIndex = existingMonths.findIndex((m) => m.period === data.period);
  let updatedMonths: WhatIsNewMonth[];

  if (monthIndex >= 0) {
    // Update existing month
    updatedMonths = [...existingMonths];
    updatedMonths[monthIndex] = data;
  } else {
    // Add new month
    updatedMonths = [...existingMonths, data];
  }

  // Sort months by period in descending order (most recent first)
  updatedMonths.sort((a, b) => b.period.localeCompare(a.period));

  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(title),
    initial_id: "what_is_new",
    source: "what_is_new" as any,
    meta_description:
      "Retrouvez toutes les nouveautés du Code du travail numérique : nouvelles fonctionnalités, évolutions juridiques et mises à jour des contenus.",
    title,
    text: title,
    slug: document?.slug ?? slug,
    is_searchable: document ? document.is_searchable : true,
    is_published: document ? document.is_published : true,
    is_available: true,
    document: {
      months: updatedMonths,
    },
  };
};