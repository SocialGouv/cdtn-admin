import React, { useState } from "react";
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
import type {
  WhatIsNewItemKind,
  WhatIsNewItemRow,
} from "../../api/whatIsNewItems.query";
import { whatIsNewItemSchema } from "../../type";
import { kindLabel, kindOptions } from "./constants";

type FormErrors = Partial<Record<"title" | "href" | "description", string>>;

type CreateData = {
  kind: WhatIsNewItemKind;
  title: string;
  href: string;
  description: string;
};

type UpdatePatch = {
  kind?: WhatIsNewItemKind;
  title?: string;
  href?: string;
  description?: string;
};

export type WeekCardProps = {
  label: string;
  hasAny: boolean;
  groups: Record<WhatIsNewItemKind, WhatIsNewItemRow[]>;
  onCreate: (data: CreateData) => Promise<void>;
  onUpdate: (id: string, patch: UpdatePatch) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export const WeekCard = ({
  label,
  hasAny,
  groups,
  onCreate,
  onUpdate,
  onDelete,
}: WeekCardProps) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
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
            {(
              [
                "mise-a-jour-fonctionnelle",
                "evolution-juridique",
              ] as WhatIsNewItemKind[]
            )
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
  onSave: (data: CreateData) => Promise<void>;
}) => {
  const [kind, setKind] = useState<WhatIsNewItemKind>("evolution-juridique");
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
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
          required
          error={Boolean(errors.title)}
          helperText={errors.title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title)
              setErrors((prev) => ({ ...prev, title: undefined }));
          }}
        />
      </Stack>

      <TextField
        fullWidth
        size="small"
        label="Lien"
        placeholder="https://code.travail.gouv.fr/contribution/..."
        value={href}
        required
        error={Boolean(errors.href)}
        helperText={errors.href}
        onChange={(e) => {
          setHref(e.target.value);
          if (errors.href) setErrors((prev) => ({ ...prev, href: undefined }));
        }}
      />

      <TextField
        fullWidth
        size="small"
        label="Description"
        multiline
        minRows={2}
        value={description}
        required
        error={Boolean(errors.description)}
        helperText={errors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          if (errors.description)
            setErrors((prev) => ({ ...prev, description: undefined }));
        }}
      />

      <Stack direction="row" spacing={1} justifyContent="end">
        <Button variant="text" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const parsed = whatIsNewItemSchema.safeParse({
              title,
              href,
              description,
            });
            if (!parsed.success) {
              const fieldErrors = parsed.error.flatten().fieldErrors;
              setErrors({
                title: fieldErrors.title?.[0],
                href: fieldErrors.href?.[0],
                description: fieldErrors.description?.[0],
              });
              return;
            }

            setErrors({});
            setSaving(true);
            try {
              await onSave({
                kind,
                title: parsed.data.title,
                href: parsed.data.href,
                description: parsed.data.description,
              });
              setTitle("");
              setHref("");
              setDescription("");
              setKind("evolution-juridique");
            } finally {
              setSaving(false);
            }
          }}
          disabled={
            saving || !title.trim() || !href.trim() || !description.trim()
          }
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
  onUpdate: (id: string, patch: UpdatePatch) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [kind, setKind] = useState<WhatIsNewItemKind>(item.kind);
  const [title, setTitle] = useState(item.title);
  const [href, setHref] = useState(item.href ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
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
                required
                error={Boolean(errors.title)}
                helperText={errors.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title)
                    setErrors((prev) => ({ ...prev, title: undefined }));
                }}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Lien"
              placeholder="https://code.travail.gouv.fr/contribution/..."
              value={href}
              required
              error={Boolean(errors.href)}
              helperText={errors.href}
              onChange={(e) => {
                setHref(e.target.value);
                if (errors.href)
                  setErrors((prev) => ({ ...prev, href: undefined }));
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              minRows={2}
              value={description}
              required
              error={Boolean(errors.description)}
              helperText={errors.description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
            />

            <Stack direction="row" spacing={1} justifyContent="end">
              <Button
                variant="text"
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
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
                disabled={
                  saving || !title.trim() || !href.trim() || !description.trim()
                }
                onClick={async () => {
                  const parsed = whatIsNewItemSchema.safeParse({
                    title,
                    href,
                    description,
                  });
                  if (!parsed.success) {
                    const fieldErrors = parsed.error.flatten().fieldErrors;
                    setErrors({
                      title: fieldErrors.title?.[0],
                      href: fieldErrors.href?.[0],
                      description: fieldErrors.description?.[0],
                    });
                    return;
                  }

                  setErrors({});
                  setSaving(true);
                  try {
                    await onUpdate(item.id, {
                      kind,
                      title: parsed.data.title,
                      href: parsed.data.href,
                      description: parsed.data.description,
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
