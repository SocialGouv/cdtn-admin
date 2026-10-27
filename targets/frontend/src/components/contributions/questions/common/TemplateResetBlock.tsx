import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import { TitleBox } from "../../../forms/TitleBox";

export type TemplateResetAnswer = {
  id: string;
  agreement: { id: string; name: string };
  resettable: boolean;
};

export type TemplateResetBlockProps = {
  answers: TemplateResetAnswer[];
  /** Template actuel de la question : vide, il n'y a rien à réinitialiser */
  template: string | undefined;
  disabled?: boolean;
  onReset: (ids: string[]) => Promise<void>;
};

/**
 * Réinitialisation des réponses de CC « Afficher la réponse » depuis le
 * template de la question : cases à cocher pour sélectionner les CC, puis
 * remplacement du contenu par le template.
 */
export const TemplateResetBlock = ({
  answers,
  template,
  disabled = false,
  onReset,
}: TemplateResetBlockProps): JSX.Element | null => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [resetting, setResetting] = useState(false);

  if (answers.length === 0) {
    return null;
  }

  const resettable = answers.filter((answer) => answer.resettable);
  const templateEmpty = !template || template.trim() === "";

  const toggle = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );

  const reset = async () => {
    if (selectedIds.length === 0 || templateEmpty) return;
    setResetting(true);
    try {
      await onReset(selectedIds);
      setSelectedIds([]);
    } finally {
      setResetting(false);
    }
  };

  return (
    <TitleBox
      title="Réinitialiser des réponses depuis le template"
      disabled={disabled}
    >
      <Stack spacing={2} mt={4} pb={2}>
        <Typography id="template-reset-help">
          Modifier le template n&apos;est pas répercuté automatiquement sur les
          réponses déjà créées. Cochez les CC dont la réponse doit être
          réinitialisée avec le template ci-dessus, puis cliquez sur
          «&nbsp;Réinitialiser&nbsp;».
        </Typography>
        {resettable.length === 0 ? (
          <Alert severity="info">
            Aucune réponse réinitialisable : elles sont toutes au-delà de la
            rédaction. Réinitialisez-les depuis leur page.
          </Alert>
        ) : (
          <FormGroup aria-describedby="template-reset-help">
            {resettable.map((answer) => (
              <FormControlLabel
                key={answer.id}
                disabled={disabled || resetting}
                control={
                  <Checkbox
                    checked={selectedIds.includes(answer.id)}
                    onChange={() => toggle(answer.id)}
                    inputProps={{
                      "aria-label": `Réinitialiser la réponse de la CC ${answer.agreement.id} - ${answer.agreement.name}`,
                    }}
                  />
                }
                label={`${answer.agreement.id} - ${answer.agreement.name}`}
              />
            ))}
          </FormGroup>
        )}
        <Stack direction="row" justifyContent="end">
          <Button
            variant="contained"
            color="warning"
            disabled={
              disabled || resetting || selectedIds.length === 0 || templateEmpty
            }
            onClick={reset}
          >
            Réinitialiser la sélection ({selectedIds.length})
          </Button>
        </Stack>
      </Stack>
    </TitleBox>
  );
};
