import { Box, Stack, Typography } from "@mui/material";
import React, { ReactNode, useId } from "react";

import { CONTRIBUTION_COLORS } from "../../../utils/contributionColors";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Section d'un formulaire : titre, description facultative, puis les champs.
 * Les couleurs viennent des variables DSFR (lisibles en thème clair comme sombre).
 */
export const FormSection = ({
  title,
  description,
  children,
}: FormSectionProps): JSX.Element => {
  const titleId = useId();
  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      sx={{
        border: `1px solid ${CONTRIBUTION_COLORS.border}`,
        borderRadius: "8px",
        padding: 3,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography id={titleId} variant="h5" component="h2">
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{ color: CONTRIBUTION_COLORS.textMention }}
            >
              {description}
            </Typography>
          )}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
};
