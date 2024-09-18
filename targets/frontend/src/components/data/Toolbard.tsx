import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import PublishIcon from "@mui/icons-material/Publish";
import * as React from "react";
import { Button, FormGroup, Stack, TextField } from "@mui/material";

interface EnhancedTableToolbarProps {
  numSelected: number;
  onClickPublish: () => void;
  onClickCreation: () => void;
  setSearch: (value: string | undefined) => void;
  customFilters?: React.ReactNode;
}

export const EnhancedTableToolbar = ({
  numSelected,
  onClickPublish,
  onClickCreation,
  setSearch,
  customFilters = undefined,
}: EnhancedTableToolbarProps) => {
  return (
    <Toolbar
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
    </Toolbar>
  );
};
