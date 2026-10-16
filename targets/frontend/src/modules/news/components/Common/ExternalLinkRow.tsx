import React from "react";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { Edit } from "src/components/utils/dsfrIcons";
import { ExternalLinkValue } from "./ExternalLinkEditor";

export const ExternalLinkRow = ({
  link,
  onEdit,
}: {
  link: ExternalLinkValue;
  onEdit: () => void;
}) => (
  <Stack direction="row" alignItems="center" spacing={2}>
    <Chip label="Externe" variant="outlined" />
    <Stack flex={1}>
      <Typography>{link.label}</Typography>
      <Typography variant="body2" color="text.secondary">
        {link.url}
      </Typography>
    </Stack>
    <IconButton aria-label={`Modifier ${link.label}`} onClick={onEdit}>
      <Edit />
    </IconButton>
  </Stack>
);
