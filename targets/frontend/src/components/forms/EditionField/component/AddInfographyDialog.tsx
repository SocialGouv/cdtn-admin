import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {
  Autocomplete,
  Button,
  DialogActions,
  DialogContentText,
  Paper,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import {
  InfographicResult,
  useListInfographicQuery,
} from "../../../../modules/infographics/components/List/list.query";

type Props = {
  open: boolean;
  baseUrl: string;
  onAdd: (infoId: string, infoFileName: string) => void;
  onClose: () => void;
};
export const AddInfographyDialog = ({
  open,
  baseUrl,
  onAdd,
  onClose,
}: Props) => {
  const infographicList = useListInfographicQuery({ search: "" });
  const [selectedOption, setSelectedOption] =
    React.useState<InfographicResult | null>(null);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setSelectedOption(null);
        onClose();
      }}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (!selectedOption) return;
          onAdd(selectedOption.id!!, selectedOption.svgFile.url);
          setSelectedOption(null);
        },
      }}
    >
      <DialogTitle>Infographie</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: "1rem" }}>
          Veuillez sélectionner l&apos;infographie à intégrer
        </DialogContentText>
        <Autocomplete
          options={infographicList.rows}
          onChange={(_, newValue) => setSelectedOption(newValue)}
          getOptionKey={(option) => option.id!!}
          getOptionLabel={(option) => option.title}
          id="infoId"
          autoFocus
          renderInput={(params) => (
            <TextField {...params} label="Infographie" />
          )}
          fullWidth
          sx={{ marginBottom: "1rem" }}
        />
        <p>
          <a href="" target="_blank">
            Créer une nouvelle infographie
          </a>
        </p>
        {selectedOption && (
          <Paper elevation={1}>
            <img
              src={`${baseUrl}/${selectedOption.svgFile.url}`}
              alt="infographie"
              width={"800"}
            />
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setSelectedOption(null);
            onClose();
          }}
        >
          Annuler
        </Button>
        <Button type="submit" variant="contained">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};
