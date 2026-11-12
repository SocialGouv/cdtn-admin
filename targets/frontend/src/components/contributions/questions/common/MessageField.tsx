import { Stack, Typography } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";

import { FormEditionField } from "src/components/forms";
import { CONTRIBUTION_COLORS } from "../../../utils/contributionColors";
import { MESSAGE_FIELDS } from "./messageBlock";

type Props = {
  /** Colonne du message (`contentAgreement`, `contentLegal`, …) */
  dbKey: (typeof MESSAGE_FIELDS)[number]["dbKey"];
  control: Control<any>;
  /** Création : les champs masqués à la création (cf. `hiddenOnCreation`) ne sont pas affichés */
  creation: boolean;
  disabled?: boolean;
};

/**
 * Un message du bloc de message de la question, propre à la contribution.
 * Il est placé là où il s'applique (réponse du Code du travail, cas particulier, template…).
 */
export const MessageField = ({
  dbKey,
  control,
  creation,
  disabled = false,
}: Props): JSX.Element | null => {
  const field = MESSAGE_FIELDS.find((item) => item.dbKey === dbKey);
  if (
    !field ||
    (creation && "hiddenOnCreation" in field && field.hiddenOnCreation)
  ) {
    return null;
  }
  return (
    <Stack spacing={1}>
      <FormEditionField
        name={field.formKey}
        control={control}
        label={field.label}
        disabled={disabled}
      />
      <Typography
        variant="body2"
        sx={{ color: CONTRIBUTION_COLORS.textMention }}
      >
        {field.help}
      </Typography>
    </Stack>
  );
};
