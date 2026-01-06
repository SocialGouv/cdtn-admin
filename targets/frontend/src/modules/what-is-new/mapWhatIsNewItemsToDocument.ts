import { generateCdtnId } from "@shared/utils";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { addMonths, format, isValid, parse, parseISO } from "date-fns";
import fr from "date-fns/locale/fr";

import { generateWeeksForPeriod, parseWhatIsNewPeriod } from "./utils/weeks";
import type { WhatIsNewMonth } from "./type";
import type {
  WhatIsNewItemKind,
  WhatIsNewItemRow,
} from "./api/whatIsNewItems.query";

export type WhatIsNewDocument = {
  months: WhatIsNewMonth[];
};

const KIND_ORDER: WhatIsNewItemKind[] = [
  "mise-a-jour-fonctionnelle",
  "evolution-juridique",
];

const kindToCategoryLabel: Record<WhatIsNewItemKind, string> = {
  "mise-a-jour-fonctionnelle": "Mise à jour fonctionnelle",
  "evolution-juridique": "Évolution juridique",
};

const capitalizeFirst = (s: string) =>
  s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const toPeriod = (date: Date): string => format(date, "MM-yyyy");

const periodToMonthDate = (period: string): Date =>
  parse(period, "MM-yyyy", new Date());

const periodToLabel = (period: string): string => {
  const d = periodToMonthDate(period);
  if (!isValid(d)) return period;
  return capitalizeFirst(format(d, "LLLL yyyy", { locale: fr }));
};

const periodToShortLabel = (period: string): string => {
  const d = periodToMonthDate(period);
  if (!isValid(d)) return period;
  return format(d, "MM/yy");
};

const buildMonthPeriodsDesc = (from: Date, to: Date): string[] => {
  const periods: string[] = [];
  let cursor = new Date(to.getFullYear(), to.getMonth(), 1, 12, 0, 0);
  const stop = new Date(from.getFullYear(), from.getMonth(), 1, 12, 0, 0);

  while (cursor.getTime() >= stop.getTime()) {
    periods.push(toPeriod(cursor));
    cursor = addMonths(cursor, -1);
  }

  return periods;
};

const toMonthAnchor = (weekStartISO: string): Date => {
  // weekStartISO is a date-only string (YYYY-MM-DD) stored by Hasura as `date`
  const d = parseISO(weekStartISO);
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0);
};

export const mapWhatIsNewItemsToDocument = (
  items: WhatIsNewItemRow[],
  document?: HasuraDocument<WhatIsNewDocument>
): HasuraDocument<WhatIsNewDocument> => {
  const title = "Quoi de neuf ?";
  const slug = "quoi-de-neuf";

  const itemsByWeekStart = new Map<string, WhatIsNewItemRow[]>();
  let minMonth: Date | null = null;
  let maxMonth: Date | null = null;

  for (const item of items) {
    if (!item.weekStart) continue;

    const list = itemsByWeekStart.get(item.weekStart) ?? [];
    list.push(item);
    itemsByWeekStart.set(item.weekStart, list);

    const monthAnchor = toMonthAnchor(item.weekStart);
    if (!minMonth || monthAnchor.getTime() < minMonth.getTime())
      minMonth = monthAnchor;
    if (!maxMonth || monthAnchor.getTime() > maxMonth.getTime())
      maxMonth = monthAnchor;
  }

  const currentPeriod = toPeriod(new Date());
  const currentMonth = parseWhatIsNewPeriod(currentPeriod) ?? new Date();

  const min = minMonth
    ? minMonth.getTime() < currentMonth.getTime()
      ? minMonth
      : currentMonth
    : currentMonth;

  const max = maxMonth
    ? maxMonth.getTime() > currentMonth.getTime()
      ? maxMonth
      : currentMonth
    : currentMonth;

  const periods = buildMonthPeriodsDesc(min, max);

  const months: WhatIsNewMonth[] = periods.map((period) => {
    const generatedWeeks = generateWeeksForPeriod(period);

    const weeks = generatedWeeks.map((w) => {
      const weekItems = itemsByWeekStart.get(w.startISO) ?? [];

      const byKind: Record<WhatIsNewItemKind, WhatIsNewItemRow[]> = {
        "mise-a-jour-fonctionnelle": [],
        "evolution-juridique": [],
      };

      for (const it of weekItems) {
        byKind[it.kind].push(it);
      }

      const categories = KIND_ORDER.filter((k) => byKind[k].length > 0).map(
        (k) => ({
          kind: k,
          label: kindToCategoryLabel[k],
          items: byKind[k].map((it) => ({
            title: it.title,
            href: it.href ?? undefined,
            description: it.description ?? undefined,
          })),
        })
      );

      const hasUpdates = categories.length > 0;

      return {
        id: w.id,
        label: w.label,
        hasUpdates,
        categories: hasUpdates ? categories : undefined,
      };
    });

    return {
      period,
      label: periodToLabel(period),
      shortLabel: periodToShortLabel(period),
      weeks,
    };
  });

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
      months,
    },
  };
};
