import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertColor,
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SnackBar } from "src/components/utils/SnackBar";
import { LoadingButton } from "src/components/button/LoadingButton";
import { FormTextField } from "src/components/forms";
import type { WhatIsNewCategory, WhatIsNewMonth, WhatIsNewWeek } from "../../type";
import { whatIsNewMonthSchema } from "../../type";
import { generateWeeksForPeriod } from "../../utils/weeks";

type Props = {
  month?: WhatIsNewMonth;
  onUpsert: (data: WhatIsNewMonth) => Promise<void>;
  onPublish?: () => Promise<void>;
};

const emptyMonth: WhatIsNewMonth = {
  period: "",
  label: "",
  shortLabel: "",
  weeks: [],
};

const createDefaultCategory = (): WhatIsNewCategory => ({
  kind: "evolution-juridique",
  label: "Évolution juridique",
  items: [],
});

const createEmptyItem = () => ({
  title: "",
  href: "",
  description: "",
});

const countItemsInWeek = (week: Partial<WhatIsNewWeek> | undefined): number => {
  const categories = week?.categories ?? [];
  return categories.reduce((acc, c) => acc + (c.items?.length ?? 0), 0);
};

export const WhatIsNewMonthForm = ({
  month,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const initialValues = useMemo<WhatIsNewMonth>(() => {
    if (!month) return emptyMonth;
    return {
      ...emptyMonth,
      ...month,
      weeks: (month.weeks ?? []).map((w) => ({
        ...w,
        categories: w.categories ?? [],
      })),
    };
  }, [month]);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<WhatIsNewMonth>({
    defaultValues: initialValues,
    resolver: zodResolver(whatIsNewMonthSchema),
    shouldFocusError: true,
  });

  const {
    fields: weekFields,
    replace,
  } = useFieldArray({
    control: control as any,
    name: "weeks" as any,
    // Our domain model already has `id` for week identifier,
    // so we avoid clashing with RHF's internal `id`.
    keyName: "_key",
  });

  const period = useWatch({
    control,
    name: "period",
  });

  const generatedWeeks = useMemo(() => {
    return generateWeeksForPeriod(period ?? "");
  }, [period]);

  const generatedWeekIds = useMemo(() => {
    return new Set(generatedWeeks.map((w) => w.id));
  }, [generatedWeeks]);

  useEffect(() => {
    if (!period) return;

    const generated = generateWeeksForPeriod(period);
    if (generated.length === 0) return;

    const currentWeeks = (getValues("weeks") ?? []) as WhatIsNewWeek[];
    const currentById = new Map(currentWeeks.map((w) => [w.id, w]));
    const matched = new Set<string>();

    const nextWeeks: WhatIsNewWeek[] = generated.map((g) => {
      const existing = currentById.get(g.id);
      if (existing) matched.add(g.id);

      return {
        id: g.id,
        label: g.label,
        categories: existing?.categories ?? [],
        hasUpdates: (existing?.categories?.length ?? 0) > 0,
      };
    });

    const extras = currentWeeks.filter((w) => !matched.has(w.id));

    // Keep any legacy weeks (not matching the generated IDs) to avoid data loss.
    replace([...nextWeeks, ...extras]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({ open: false });

  const [isPublishing, setIsPublishing] = useState(false);

  const normalizeForSave = (data: WhatIsNewMonth): WhatIsNewMonth => {
    return {
      ...data,
      weeks: (data.weeks ?? []).map((w) => {
        const categoriesWithItems: WhatIsNewCategory[] = (w.categories ?? [])
          .map((c) => ({
            ...c,
            items: (c.items ?? []).map((i) => ({
              ...i,
              title: i.title,
              href: i.href?.trim() ? i.href.trim() : undefined,
              description: i.description?.trim() ? i.description.trim() : undefined,
            })),
          }))
          .filter((c) => (c.items?.length ?? 0) > 0);

        const hasUpdates = categoriesWithItems.length > 0;

        return {
          ...w,
          hasUpdates,
          categories: hasUpdates ? categoriesWithItems : undefined,
        };
      }),
    };
  };

  const onSubmit = async () => {
    try {
      const raw = getValues();
      const normalized = normalizeForSave(raw);
      await onUpsert(normalized);

      setSnack({
        open: true,
        severity: "success",
        message: month
          ? 'Le mois "Quoi de neuf ?" a été sauvegardé'
          : 'Le mois "Quoi de neuf ?" a été créé',
      });
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: `Erreur lors de la sauvegarde: ${e?.message ?? "inconnue"}`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <FormControl>
          <FormTextField
            name="period"
            control={control}
            label="Période (MM-YYYY)"
            fullWidth
            placeholder="09-2025"
          />
        </FormControl>

        <FormControl>
          <FormTextField
            name="label"
            control={control}
            label="Libellé"
            fullWidth
            placeholder="Septembre 2025"
          />
        </FormControl>

        <FormControl>
          <FormTextField
            name="shortLabel"
            control={control}
            label="Libellé court"
            fullWidth
            placeholder="09/25"
          />
        </FormControl>

        <Divider />

        <Stack spacing={2}>
          <Typography variant="h6">Semaines</Typography>

          {weekFields.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Renseignez la période pour générer automatiquement les semaines.
            </Typography>
          )}

          <Stack spacing={2}>
            {weekFields.map((week, weekIndex) => {
              const weekId = (week as unknown as WhatIsNewWeek).id;
              return (
                <WeekTimeline
                  key={week._key}
                  control={control}
                  getValues={getValues}
                  setValue={setValue}
                  weekIndex={weekIndex}
                  isLegacyWeek={period ? !generatedWeekIds.has(weekId) : false}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="end">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {month ? "Sauvegarder" : "Créer"}
          </Button>

          {onPublish && month?.id && (
            <LoadingButton
              loading={isPublishing}
              onClick={async () => {
                setIsPublishing(true);
                try {
                  await onPublish();
                  setSnack({
                    open: true,
                    severity: "success",
                    message: 'Le mois "Quoi de neuf ?" a été publié',
                  });
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: `Erreur lors de la publication: ${e?.message ?? "inconnue"}`,
                  });
                } finally {
                  setIsPublishing(false);
                }
              }}
            >
              Publier
            </LoadingButton>
          )}
        </Stack>

        <SnackBar snack={snack} setSnack={setSnack} />
      </Stack>
    </form>
  );
};

const WeekTimeline = ({
  control,
  getValues,
  setValue,
  weekIndex,
  isLegacyWeek,
}: {
  control: any;
  getValues: any;
  setValue: any;
  weekIndex: number;
  isLegacyWeek: boolean;
}) => {
  const label = useWatch({
    control,
    name: `weeks.${weekIndex}.label`,
  });

  const categories = useWatch({
    control,
    name: `weeks.${weekIndex}.categories`,
  }) as WhatIsNewCategory[] | undefined;

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } =
    useFieldArray({
      control,
      name: `weeks.${weekIndex}.categories`,
    });

  // Used for the week-level "Ajouter" button (append an item into the first category).
  const { append: appendItemToFirstCategory } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.categories.0.items`,
  });

  const totalItems = useMemo(() => {
    const week = getValues(`weeks.${weekIndex}`) as WhatIsNewWeek | undefined;
    return countItemsInWeek(week);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, weekIndex]);

  useEffect(() => {
    const hasCategories = (categories?.length ?? 0) > 0;
    setValue(`weeks.${weekIndex}.hasUpdates`, hasCategories, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [categories?.length, setValue, weekIndex]);

  const onAddCategory = useCallback(() => {
    appendCategory(createDefaultCategory());
  }, [appendCategory]);

  const onAddItemToWeek = useCallback(() => {
    if (categoryFields.length === 0) {
      appendCategory(createDefaultCategory());
    }
    appendItemToFirstCategory(createEmptyItem());
  }, [appendCategory, appendItemToFirstCategory, categoryFields.length]);

  const showNoUpdates = totalItems === 0;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{label || "Semaine"}</Typography>
            {isLegacyWeek && (
              <Typography variant="caption" color="text.secondary">
                Hors période (semaine non générée automatiquement)
              </Typography>
            )}
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddItemToWeek}
          >
            Ajouter
          </Button>
        </Stack>

        {showNoUpdates ? (
          <Typography variant="body2" color="text.secondary">
            Aucune nouveauté cette semaine.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {categoryFields.map((cat, categoryIndex) => (
              <CategoryTimeline
                key={cat.id}
                control={control}
                weekIndex={weekIndex}
                categoryIndex={categoryIndex}
                onDelete={() => removeCategory(categoryIndex)}
              />
            ))}
          </Stack>
        )}

        <Box>
          <Button
            size="small"
            variant="text"
            startIcon={<AddIcon />}
            onClick={onAddCategory}
          >
            Ajouter une catégorie
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

const CategoryTimeline = ({
  control,
  weekIndex,
  categoryIndex,
  onDelete,
}: {
  control: any;
  weekIndex: number;
  categoryIndex: number;
  onDelete: () => void;
}) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  const label = useWatch({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.label`,
  });

  const kind = useWatch({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.kind`,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.items`,
  });

  const onAddItem = useCallback(() => {
    append(createEmptyItem());
  }, [append]);

  return (
    <Box sx={{ borderLeft: "3px solid", borderColor: "divider", pl: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0}>
            <Typography variant="subtitle2">
              {label || "Catégorie"}
            </Typography>
            {kind && (
              <Typography variant="caption" color="text.secondary">
                {kind}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" variant="outlined" onClick={onAddItem}>
              Ajouter un item
            </Button>

            <Button
              size="small"
              variant="text"
              startIcon={<EditIcon />}
              onClick={() => setIsEditingCategory((v) => !v)}
            >
              Modifier
            </Button>

            <IconButton aria-label="Supprimer la catégorie" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={isEditingCategory}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <FormControl>
                <FormTextField
                  name={`weeks.${weekIndex}.categories.${categoryIndex}.kind`}
                  control={control}
                  label="Type (kind)"
                  fullWidth
                  placeholder="evolution-juridique"
                />
              </FormControl>

              <FormControl>
                <FormTextField
                  name={`weeks.${weekIndex}.categories.${categoryIndex}.label`}
                  control={control}
                  label="Libellé"
                  fullWidth
                  placeholder="Évolution juridique"
                />
              </FormControl>
            </Stack>
          </Paper>
        </Collapse>

        <Stack spacing={1.5}>
          {fields.map((item, itemIndex) => (
            <ItemTimeline
              key={item.id}
              control={control}
              weekIndex={weekIndex}
              categoryIndex={categoryIndex}
              itemIndex={itemIndex}
              onDelete={() => remove(itemIndex)}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

const ItemTimeline = ({
  control,
  weekIndex,
  categoryIndex,
  itemIndex,
  onDelete,
}: {
  control: any;
  weekIndex: number;
  categoryIndex: number;
  itemIndex: number;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const title = useWatch({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.items.${itemIndex}.title`,
  });

  const href = useWatch({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.items.${itemIndex}.href`,
  });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {title?.trim() ? title : "Sans titre"}
            </Typography>
            {href?.trim() && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {href}
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

            <IconButton aria-label="Supprimer l'item" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={isEditing}>
          <Stack spacing={2}>
            <FormControl>
              <FormTextField
                name={`weeks.${weekIndex}.categories.${categoryIndex}.items.${itemIndex}.title`}
                control={control}
                label="Titre"
                fullWidth
              />
            </FormControl>

            <FormControl>
              <FormTextField
                name={`weeks.${weekIndex}.categories.${categoryIndex}.items.${itemIndex}.href`}
                control={control}
                label="Lien (href)"
                fullWidth
                placeholder="/contribution/..."
              />
            </FormControl>

            <FormControl>
              <FormTextField
                name={`weeks.${weekIndex}.categories.${categoryIndex}.items.${itemIndex}.description`}
                control={control}
                label="Description"
                fullWidth
                multiline
              />
            </FormControl>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
};
