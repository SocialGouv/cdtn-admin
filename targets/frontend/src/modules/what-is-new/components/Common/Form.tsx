import React, { useMemo, useState } from "react";
import {
  AlertColor,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SnackBar } from "src/components/utils/SnackBar";
import { LoadingButton } from "src/components/button/LoadingButton";
import { FormSwitch, FormTextField } from "src/components/forms";
import { WhatIsNewMonth, whatIsNewMonthSchema } from "../../type";

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

  const { control, handleSubmit, getValues } = useForm<WhatIsNewMonth>({
    defaultValues: initialValues,
    resolver: zodResolver(whatIsNewMonthSchema),
    shouldFocusError: true,
  });

  const {
    fields: weekFields,
    append,
    remove,
  } = useFieldArray({
    control: control as any,
    name: "weeks" as any,
    // Our domain model already has `id` for week identifier,
    // so we avoid clashing with RHF's internal `id`.
    keyName: "_key",
  });

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
        const categories =
          w.hasUpdates === true
            ? (w.categories ?? []).map((c) => ({
                ...c,
                items: (c.items ?? []).map((i) => ({
                  ...i,
                  href: i.href?.trim() ? i.href.trim() : undefined,
                  description: i.description?.trim()
                    ? i.description.trim()
                    : undefined,
                })),
              }))
            : undefined;

        return {
          ...w,
          categories,
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

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Semaines</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              append({
                id: "",
                label: "",
                hasUpdates: false,
                categories: [],
              });
            }}
          >
            Ajouter une semaine
          </Button>
        </Stack>

        <Stack spacing={2}>
          {weekFields.map((week, weekIndex) => (
            <WeekEditor
              key={week._key}
              control={control}
              weekIndex={weekIndex}
              onDelete={() => remove(weekIndex)}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" color="primary" type="submit">
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

const WeekEditor = ({
  control,
  weekIndex,
  onDelete,
}: {
  control: any;
  weekIndex: number;
  onDelete: () => void;
}) => {
  const hasUpdates = useWatch({
    control,
    name: `weeks.${weekIndex}.hasUpdates`,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.categories`,
  });

  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1">Semaine #{weekIndex + 1}</Typography>
          <IconButton aria-label="Supprimer la semaine" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormTextField
              name={`weeks.${weekIndex}.id`}
              control={control}
              label="ID semaine"
              fullWidth
              placeholder="2025-09-22_2025-09-28"
            />
          </FormControl>

          <FormControl sx={{ flex: 2 }}>
            <FormTextField
              name={`weeks.${weekIndex}.label`}
              control={control}
              label="Libellé semaine"
              fullWidth
              placeholder="Semaine du 22 au 28 septembre"
            />
          </FormControl>
        </Stack>

        <FormControl>
          <FormSwitch
            name={`weeks.${weekIndex}.hasUpdates`}
            control={control}
            label="Contient des mises à jour"
          />
        </FormControl>

        {hasUpdates && (
          <>
            <Divider />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2">Catégories</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  append({
                    kind: "evolution-juridique",
                    label: "Évolution juridique",
                    items: [],
                  });
                }}
              >
                Ajouter une catégorie
              </Button>
            </Stack>

            <Stack spacing={2}>
              {fields.map((cat, categoryIndex) => (
                <CategoryEditor
                  key={cat.id}
                  control={control}
                  weekIndex={weekIndex}
                  categoryIndex={categoryIndex}
                  onDelete={() => remove(categoryIndex)}
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
};

const CategoryEditor = ({
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.categories.${categoryIndex}.items`,
  });

  return (
    <Box sx={{ border: "1px solid #eee", borderRadius: 1, p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1">
            Catégorie #{categoryIndex + 1}
          </Typography>
          <IconButton aria-label="Supprimer la catégorie" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl sx={{ flex: 1 }}>
            <FormTextField
              name={`weeks.${weekIndex}.categories.${categoryIndex}.kind`}
              control={control}
              label="Type (kind)"
              fullWidth
              placeholder="evolution-juridique"
            />
          </FormControl>

          <FormControl sx={{ flex: 1 }}>
            <FormTextField
              name={`weeks.${weekIndex}.categories.${categoryIndex}.label`}
              control={control}
              label="Libellé"
              fullWidth
              placeholder="Évolution juridique"
            />
          </FormControl>
        </Stack>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">Items</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              append({
                title: "",
                href: "",
                description: "",
              });
            }}
          >
            Ajouter un item
          </Button>
        </Stack>

        <Stack spacing={2}>
          {fields.map((item, itemIndex) => (
            <ItemEditor
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

const ItemEditor = ({
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
  return (
    <Box sx={{ border: "1px dashed #ddd", borderRadius: 1, p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2">Item #{itemIndex + 1}</Typography>
          <IconButton aria-label="Supprimer l'item" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Stack>

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
    </Box>
  );
};
