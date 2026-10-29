import React, { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { NewsExternalLink, newsExternalLinkSchema } from "../../type";

export type ExternalLinkValue = Pick<NewsExternalLink, "label" | "url">;

export const ExternalLinkEditor = ({
  initial,
  onCancel,
  onSave,
}: {
  initial?: ExternalLinkValue;
  onCancel: () => void;
  onSave: (value: ExternalLinkValue) => void;
}) => {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [errors, setErrors] = useState<{ label?: string; url?: string }>({});

  const handleSave = () => {
    const result = newsExternalLinkSchema
      .pick({ label: true, url: true })
      .safeParse({ label, url });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        label: fieldErrors.label?.join(" "),
        url: fieldErrors.url?.join(" "),
      });
      return;
    }
    setErrors({});
    onSave(result.data);
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Libellé"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        error={Boolean(errors.label)}
        helperText={errors.label}
        fullWidth
      />
      <TextField
        label="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        error={Boolean(errors.url)}
        helperText={errors.url}
        fullWidth
      />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Valider
        </Button>
      </Stack>
    </Stack>
  );
};
