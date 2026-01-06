import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/router";
import { gql, useMutation, useQuery } from "urql";
import { addMonths, format, isValid, parse } from "date-fns";
import fr from "date-fns/locale/fr";

import { usePublishMutation } from "src/modules/documents/components/publish.mutation";
import { generateWeeksForPeriod } from "../../utils/weeks";
import type {
  WhatIsNewItemKind,
  WhatIsNewItemRow,
} from "../../api/whatIsNewItems.query";

const kindOptions: Array<{ value: WhatIsNewItemKind; label: string }> = [
  { value: "mise-a-jour-fonctionnelle", label: "Mise à jour fonctionnelle" },
  { value: "evolution-juridique", label: "Évolution juridique" },
];

const kindLabel: Record<WhatIsNewItemKind, string> = {
  "mise-a-jour-fonctionnelle": "Mise à jour fonctionnelle",
  "evolution-juridique": "Évolution juridique",
};

const itemsAggregateQuery = gql`
  query WhatIsNewItemsAggregate {
    agg: what_is_new_items_aggregate {
      aggregate {
        min {
          weekStart
        }
        max {
          weekStart
        }
      }
    }
  }
`;

const itemsByRangeQuery = gql`
  query WhatIsNewItemsByRange($from: date!, $to: date!) {
    items: what_is_new_items(
      where: { weekStart: { _gte: $from, _lte: $to } }
      order_by: [{ weekStart: desc }, { createdAt: asc }]
    ) {
      id
      weekStart
      kind
      title
      href
      description
      createdAt
      updatedAt
    }
  }
`;

const insertItemMutation = gql`
  mutation InsertWhatIsNewItem($item: what_is_new_items_insert_input!) {
    insert_what_is_new_items_one(object: $item) {
      id
    }
  }
`;

const updateItemMutation = gql`
  mutation UpdateWhatIsNewItem($id: uuid!, $patch: what_is_new_items_set_input!) {
    update_what_is_new_items_by_pk(pk_columns: { id: $id }, _set: $patch) {
      id
      updatedAt
    }
  }
`;

const deleteItemMutation = gql`
  mutation DeleteWhatIsNewItem($id: uuid!) {
    delete_what_is_new_items_by_pk(id: $id) {
      id
    }
  }
`;

type ItemsAggregateResult = {
  agg: {
    aggregate: {
      min: { weekStart: string | null } | null;
      max: { weekStart: string | null } | null;
    } | null;
  } | null;
};

type ItemsByRangeResult = {
  items: WhatIsNewItemRow[];
};

type InsertVariables = {
  item: {
    weekStart: string;
    kind: WhatIsNewItemKind;
    title: string;
    href?: string | null;
    description?: string | null;
  };
};

type UpdateVariables = {
  id: string;
  patch: {
    weekStart?: string;
    kind?: WhatIsNewItemKind;
    title?: string;
    href?: string | null;
    description?: string | null;
  };
};

type DeleteVariables = {
  id: string;
};

const toPeriod = (date: Date): string => format(date, "MM-yyyy");
const toShortLabel = (date: Date): string => format(date, "MM/yy");

const capitalizeFirst = (s: string) =>
  s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const periodToMonthLabel = (period: string): string => {
  const d = parse(period, "MM-yyyy", new Date());
  if (!isValid(d)) return period;
  return capitalizeFirst(format(d, "LLLL yyyy", { locale: fr }));
};

const parseISODate = (iso: string): Date => {
  // iso expected YYYY-MM-DD (date-only)
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
};

const buildMonthPeriodsDesc = (from: Date, to: Date): string[] => {
  // from/to are month anchor dates (1st of month)
  const periods: string[] = [];
  let cursor = new Date(to.getFullYear(), to.getMonth(), 1, 12, 0, 0);
  const stop = new Date(from.getFullYear(), from.getMonth(), 1, 12, 0, 0);

  while (cursor.getTime() >= stop.getTime()) {
    periods.push(toPeriod(cursor));
    cursor = addMonths(cursor, -1);
  }
  return periods;
};

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

  // Prefilled UI even when there are no items:
  // default window = last 4 months (including current), extended if items exist outside.
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

  const months = useMemo(() => {
    return buildMonthPeriodsDesc(minBound, maxBound);
  }, [minBound.getTime(), maxBound.getTime()]);

  const selectedPeriod = useMemo(() => {
    if (urlPeriod && months.includes(urlPeriod)) return urlPeriod;
    // Months are sorted desc: index 0 = most recent
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
    variables: range.from && range.to ? { from: range.from, to: range.to } : undefined,
    pause: !range.from || !range.to,
    requestPolicy: "cache-and-network",
  });

  const items = itemsData?.items ?? [];

  const itemsByWeekStart = useMemo(() => {
    const map = new Map<string, WhatIsNewItemRow[]>();
    for (const item of items) {
      const list = map.get(item.weekStart) ?? [];
      list.push(item);
      map.set(item.weekStart, list);
    }
    return map;
  }, [items]);

  const [, execInsert] = useMutation<{ insert_what_is_new_items_one: { id: string } | null }, InsertVariables>(
    insertItemMutation
  );
  const [, execUpdate] = useMutation<{ update_what_is_new_items_by_pk: { id: string } | null }, UpdateVariables>(
    updateItemMutation
  );
  const [, execDelete] = useMutation<{ delete_what_is_new_items_by_pk: { id: string } | null }, DeleteVariables>(
    deleteItemMutation
  );

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

  const [isPublishing, setIsPublishing] = useState(false);

  const onPublish = async () => {
    setIsPublishing(true);
    try {
      await publish({ id: "what_is_new", source: "what_is_new" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{periodToMonthLabel(selectedPeriod)}</Typography>
        <Button variant="outlined" onClick={onPublish} disabled={isPublishing}>
          Publier
        </Button>
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
                    href: data.href?.trim() ? data.href.trim() : null,
                    description: data.description?.trim()
                      ? data.description.trim()
                      : null,
                  },
                });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });
              }}
              onUpdate={async (id, patch) => {
                const result = await execUpdate({
                  id,
                  patch: {
                    ...patch,
                    href: patch.href?.trim() ? patch.href.trim() : null,
                    description: patch.description?.trim()
                      ? patch.description.trim()
                      : null,
                  },
                });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });
              }}
              onDelete={async (id) => {
                const result = await execDelete({ id });
                if (result.error) throw new Error(result.error.message);
                reexecuteItems({ requestPolicy: "network-only" });
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

const WeekCard = ({
  label,
  hasAny,
  groups,
  onCreate,
  onUpdate,
  onDelete,
}: {
  label: string;
  hasAny: boolean;
  groups: Record<WhatIsNewItemKind, WhatIsNewItemRow[]>;
  onCreate: (data: {
    kind: WhatIsNewItemKind;
    title: string;
    href?: string;
    description?: string;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    patch: {
      kind?: WhatIsNewItemKind;
      title?: string;
      href?: string;
      description?: string;
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsAdding((v) => !v)}
          >
            Ajouter
          </Button>
        </Stack>

        {!hasAny && (
          <Typography variant="body2" color="text.secondary">
            Aucune nouveauté cette semaine.
          </Typography>
        )}

        {hasAny && (
          <Stack spacing={2}>
            {(["mise-a-jour-fonctionnelle", "evolution-juridique"] as WhatIsNewItemKind[])
              .filter((k) => (groups[k]?.length ?? 0) > 0)
              .map((k) => (
                <Box key={k}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {kindLabel[k]}
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    {groups[k].map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
          </Stack>
        )}

        <Collapse in={isAdding}>
          <Divider sx={{ my: 1 }} />
          <NewItemForm
            onCancel={() => setIsAdding(false)}
            onSave={async (data) => {
              await onCreate(data);
              setIsAdding(false);
            }}
          />
        </Collapse>
      </Stack>
    </Paper>
  );
};

const NewItemForm = ({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (data: {
    kind: WhatIsNewItemKind;
    title: string;
    href?: string;
    description?: string;
  }) => Promise<void>;
}) => {
  const [kind, setKind] = useState<WhatIsNewItemKind>("evolution-juridique");
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="flex-start"
      >
        <TextField
          select
          fullWidth
          size="small"
          label="Catégorie"
          value={kind}
          onChange={(e) => setKind(e.target.value as WhatIsNewItemKind)}
        >
          {kindOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Stack>

      <TextField
        fullWidth
        size="small"
        label="Lien"
        placeholder="https://code.travail.gouv.fr/contribution/..."
        value={href}
        onChange={(e) => setHref(e.target.value)}
      />

      <TextField
        fullWidth
        size="small"
        label="Description"
        multiline
        minRows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Stack direction="row" spacing={1} justifyContent="end">
        <Button variant="text" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({
                kind,
                title,
                href,
                description,
              });
              setTitle("");
              setHref("");
              setDescription("");
              setKind("evolution-juridique");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving || !title.trim()}
        >
          Enregistrer
        </Button>
      </Stack>
    </Stack>
  );
};

const ItemRow = ({
  item,
  onUpdate,
  onDelete,
}: {
  item: WhatIsNewItemRow;
  onUpdate: (
    id: string,
    patch: {
      kind?: WhatIsNewItemKind;
      title?: string;
      href?: string;
      description?: string;
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [kind, setKind] = useState<WhatIsNewItemKind>(item.kind);
  const [title, setTitle] = useState(item.title);
  const [href, setHref] = useState(item.href ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              {item.title}
            </Typography>
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.description}
              </Typography>
            )}
            {item.href && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.href}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="text"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing((v) => !v)}
            >
              Modifier
            </Button>

            <IconButton
              aria-label="Supprimer l'item"
              onClick={() => setIsDeleteOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={isEditing}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Catégorie"
                value={kind}
                onChange={(e) => setKind(e.target.value as WhatIsNewItemKind)}
              >
                {kindOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                size="small"
                label="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Lien"
              placeholder="https://code.travail.gouv.fr/contribution/..."
              value={href}
              onChange={(e) => setHref(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Stack direction="row" spacing={1} justifyContent="end">
              <Button
                variant="text"
                onClick={() => {
                  setIsEditing(false);
                  setKind(item.kind);
                  setTitle(item.title);
                  setHref(item.href ?? "");
                  setDescription(item.description ?? "");
                }}
                disabled={saving}
              >
                Annuler
              </Button>

              <Button
                variant="contained"
                disabled={saving || !title.trim()}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await onUpdate(item.id, {
                      kind,
                      title,
                      href,
                      description,
                    });
                    setIsEditing(false);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Sauvegarder
              </Button>
            </Stack>
          </Stack>
        </Collapse>

        <Dialog
          open={isDeleteOpen}
          onClose={() => {
            if (!isDeleting) setIsDeleteOpen(false);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Supprimer cet item ?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {item.description}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="text"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await onDelete(item.id);
                } finally {
                  setIsDeleting(false);
                  setIsDeleteOpen(false);
                }
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Paper>
  );
};