import React, { useMemo } from "react";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { addMonths, isValid, parse } from "date-fns";
import { useMutation, useQuery } from "urql";

import { usePublishMutation } from "src/modules/documents/components/publish.mutation";
import { generateWeeksForPeriod } from "../../utils/weeks";
import type {
  WhatIsNewItemKind,
  WhatIsNewItemRow,
} from "../../api/whatIsNewItems.query";
import { WeekCard } from "./WeekCard";
import {
  buildMonthPeriodsDesc,
  parseISODate,
  periodToMonthLabel,
  toPeriod,
  toShortLabel,
} from "./date";
import {
  deleteItemMutation,
  insertItemMutation,
  itemsAggregateQuery,
  itemsByRangeQuery,
  updateItemMutation,
  type DeleteVariables,
  type InsertVariables,
  type ItemsAggregateResult,
  type ItemsByRangeResult,
  type UpdateVariables,
} from "./graphql";

const EMPTY_ITEMS: WhatIsNewItemRow[] = [];

export const WhatIsNewDashboard = (): JSX.Element => {
  const router = useRouter();
  const publish = usePublishMutation();

  const urlPeriod =
    typeof router.query.period === "string" ? router.query.period : undefined;

  const now = new Date();
  const currentPeriod = toPeriod(now);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0);

  const [{ data: aggData }] = useQuery<ItemsAggregateResult>({
    query: itemsAggregateQuery,
    requestPolicy: "cache-and-network",
  });

  const minWeekStart = aggData?.agg?.aggregate?.min?.weekStart ?? null;
  const maxWeekStart = aggData?.agg?.aggregate?.max?.weekStart ?? null;

  const minWindow = addMonths(currentMonth, -3);
  const maxWindow = currentMonth;

  const minFromData = minWeekStart ? parseISODate(minWeekStart) : null;
  const maxFromData = maxWeekStart ? parseISODate(maxWeekStart) : null;

  const minBound =
    minFromData && minFromData.getTime() < minWindow.getTime()
      ? minFromData
      : minWindow;

  const maxBound =
    maxFromData && maxFromData.getTime() > maxWindow.getTime()
      ? maxFromData
      : maxWindow;

  const months = buildMonthPeriodsDesc(minBound, maxBound);

  const selectedPeriod = useMemo(() => {
    if (urlPeriod && months.includes(urlPeriod)) return urlPeriod;
    return months[0] ?? currentPeriod;
  }, [urlPeriod, months, currentPeriod]);

  const generatedWeeks = useMemo(() => {
    return generateWeeksForPeriod(selectedPeriod);
  }, [selectedPeriod]);

  const range = useMemo(() => {
    const weekStarts = generatedWeeks.map((w) => w.startISO).sort();
    const from = weekStarts[0];
    const to = weekStarts[weekStarts.length - 1];
    return { from, to };
  }, [generatedWeeks]);

  const [{ data: itemsData }, reexecuteItems] = useQuery<ItemsByRangeResult>({
    query: itemsByRangeQuery,
    variables:
      range.from && range.to ? { from: range.from, to: range.to } : undefined,
    pause: !range.from || !range.to,
    requestPolicy: "cache-and-network",
  });

  const items = itemsData?.items ?? EMPTY_ITEMS;

  const itemsByWeekStart = useMemo(() => {
    const map = new Map<string, WhatIsNewItemRow[]>();
    for (const item of items) {
      const list = map.get(item.weekStart) ?? [];
      list.push(item);
      map.set(item.weekStart, list);
    }
    return map;
  }, [items]);

  const [, execInsert] = useMutation<
    { insert_what_is_new_items_one: { id: string } | null },
    InsertVariables
  >(insertItemMutation);
  const [, execUpdate] = useMutation<
    { update_what_is_new_items_by_pk: { id: string } | null },
    UpdateVariables
  >(updateItemMutation);
  const [, execDelete] = useMutation<
    { delete_what_is_new_items_by_pk: { id: string } | null },
    DeleteVariables
  >(deleteItemMutation);

  const monthIndex = months.findIndex((p) => p === selectedPeriod);
  const hasMoreRecent = monthIndex > 0;
  const hasOlder = monthIndex >= 0 && monthIndex < months.length - 1;

  const visibleMonths = useMemo(() => {
    if (months.length <= 4) return months;
    const safeIndex = monthIndex >= 0 ? monthIndex : 0;
    const start = Math.min(Math.max(safeIndex - 1, 0), months.length - 4);
    return months.slice(start, start + 4);
  }, [months, monthIndex]);

  const navigateToPeriod = (period: string) => {
    router.push(
      {
        pathname: "/what-is-new",
        query: { period },
      },
      undefined,
      { shallow: true }
    );
  };

  const publishWhatIsNew = (itemId: string) =>
    publish({ id: itemId, source: "what_is_new" }).catch((error) => {
      console.error(
        `Auto-publication error for what_is_new item ${itemId}`,
        error
      );
    });

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          {periodToMonthLabel(selectedPeriod)}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          disabled={!months.length || monthIndex <= 0}
          onClick={() => navigateToPeriod(months[0])}
        >
          Plus récent
        </Button>

        <Button
          size="small"
          variant="outlined"
          disabled={!hasMoreRecent}
          onClick={() => navigateToPeriod(months[monthIndex - 1])}
        >
          Mois suivant
        </Button>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {visibleMonths.map((p) => {
            const d = parse(p, "MM-yyyy", new Date());
            const short = isValid(d) ? toShortLabel(d) : p;
            return (
              <Button
                key={p}
                size="small"
                variant={p === selectedPeriod ? "contained" : "text"}
                onClick={() => navigateToPeriod(p)}
              >
                {short}
              </Button>
            );
          })}
        </Stack>

        <Button
          size="small"
          variant="outlined"
          disabled={!hasOlder}
          onClick={() => navigateToPeriod(months[monthIndex + 1])}
        >
          Mois précédent
        </Button>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        {generatedWeeks.map((week) => {
          const weekItems = itemsByWeekStart.get(week.startISO) ?? [];
          const byKind: Record<WhatIsNewItemKind, WhatIsNewItemRow[]> = {
            "evolution-juridique": [],
            "mise-a-jour-fonctionnelle": [],
          };
          for (const it of weekItems) {
            byKind[it.kind].push(it);
          }

          const hasAny = weekItems.length > 0;

          return (
            <WeekCard
              key={week.id}
              label={week.label}
              hasAny={hasAny}
              groups={byKind}
              onCreate={async (data) => {
                const result = await execInsert({
                  item: {
                    weekStart: week.startISO,
                    kind: data.kind,
                    title: data.title,
                    href: data.href,
                    description: data.description,
                  },
                });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });

                const createdId = result.data?.insert_what_is_new_items_one?.id;
                if (createdId) void publishWhatIsNew(createdId);
              }}
              onUpdate={async (id, patch) => {
                const result = await execUpdate({
                  id,
                  patch,
                });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });
                void publishWhatIsNew(id);
              }}
              onDelete={async (id) => {
                const result = await execDelete({ id });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });
                void publishWhatIsNew(id);
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};
