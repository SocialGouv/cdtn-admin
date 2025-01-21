import {
  Button,
  FormGroup,
  TextField,
  Toolbar as MuiToolbar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import PublishIcon from "@mui/icons-material/Publish";
import * as React from "react";

interface ToolbarProps {
  numSelected?: number;
  onClickPublish?: () => void;
  onClickCreation: () => void;
  setSearch: (value: string | undefined) => void;
  customFilters?: React.ReactNode;
}

export const Toolbar = ({
  numSelected = 0,
  onClickPublish,
  onClickCreation,
  setSearch,
  customFilters = undefined,
}: ToolbarProps) => {
  return (
    <MuiToolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} contenu{numSelected > 1 ? "s" : ""} sélectionné
          {numSelected > 1 ? "s" : ""}
        </Typography>
      ) : (
        <FormGroup row={true} style={{ flex: "1 1 100%" }}>
          <TextField
            label="Recherche"
            variant="outlined"
            size="small"
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value ? `%${value}%` : undefined);
            }}
            data-testid="list-search"
          />
          {customFilters}
        </FormGroup>
      )}
      {numSelected > 0 ? (
        <Button
          variant="contained"
          startIcon={<PublishIcon />}
          onClick={onClickPublish}
        >
          Publier
        </Button>
      ) : (
        <Button variant="contained" color="success" onClick={onClickCreation}>
          Créer
        </Button>
      )}
    </MuiToolbar>
  );
};
