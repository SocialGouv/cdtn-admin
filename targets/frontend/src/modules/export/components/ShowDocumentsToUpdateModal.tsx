import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Environment } from "@socialgouv/cdtn-types";
import DocumentList from "./document-list";
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useDocumentsQuery } from "../document.query";
import { useSmicValuesQuery } from "../../reference-value/components/SmicPage/smic.query";

export type ConfirmModalProps = {
  open: boolean;
  name: string;
  environment: Environment;
  onClose: () => void;
  onCancel: () => void;
  onValidate: (smicHourly: number) => void;
  date: Date;
};

const formatEur = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " €";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function ShowDocumentsToUpdateModal({
  open,
  name,
  environment,
  onClose,
  onCancel,
  onValidate,
  date,
}: ConfirmModalProps): JSX.Element {
  const { docs, fetching: docsFetching } = useDocumentsQuery({
    date,
    pause: !open,
  });
  // Defer the docs list so opening the modal does not block on rendering
  // potentially thousands of rows. React renders the modal frame with the
  // previous (empty) value first, then schedules the heavy list as a
  // low-priority update.
  const deferredDocs = useDeferredValue(docs);
  const isListPending = docs !== deferredDocs;
  const isLoadingDocs = docsFetching || isListPending;

  const isProduction = environment === Environment.production;

  const {
    history: smicHistory,
    currentValue: currentSmic,
    fetching: smicFetching,
  } = useSmicValuesQuery({ pause: !open });
  const [selectedSmicId, setSelectedSmicId] = useState<string>("");

  // Default to the currently applicable SMIC.
  // In production, we always force the current value: re-sync the selection
  // whenever the modal opens or the current SMIC changes.
  useEffect(() => {
    if (!currentSmic) return;
    if (isProduction) {
      setSelectedSmicId(currentSmic.id);
    } else if (!selectedSmicId) {
      setSelectedSmicId(currentSmic.id);
    }
  }, [currentSmic, isProduction, selectedSmicId, open]);

  const selectedSmic = useMemo(
    () => smicHistory.find((v) => v.id === selectedSmicId),
    [smicHistory, selectedSmicId]
  );

  const canValidate = selectedSmic !== undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={`Mise à jour de la ${name}`}
    >
      <StyledBox>
        <Typography variant="h4" component="h2" mb={4}>
          Mise à jour de la {name}
        </Typography>
        <div>
          <p>Êtes-vous sur de vouloir mettre à jour la {name} ?</p>
          <Typography mb={1}>
            <strong>Inclus dans la mise à jour :</strong>
          </Typography>
          {smicHistory.length === 0 && !smicFetching && (
            <Typography color="error" variant="body2">
              Aucune valeur de SMIC n&apos;est disponible. Renseignez-en une
              depuis la page « Valeurs de référence » avant de lancer
              l&apos;export.
            </Typography>
          )}
          {isProduction && currentSmic && (
            <div className={fr.cx("fr-highlight", "fr-mb-3w", "fr-mt-3w")}>
              <p>
                Valeur du SMIC : {formatEur(currentSmic.hourlyValue)}{" "}
                (applicable au {formatDate(currentSmic.applicationDate)})
              </p>
            </div>
          )}
          {!isProduction && (
            <FormControl
              size="small"
              fullWidth
              sx={{ my: 2 }}
              disabled={
                isProduction || smicFetching || smicHistory.length === 0
              }
            >
              <InputLabel id={`smic-select-${name}`}>SMIC horaire</InputLabel>
              <Select
                labelId={`smic-select-${name}`}
                value={selectedSmicId}
                label="SMIC horaire"
                onChange={(e) => setSelectedSmicId(e.target.value)}
              >
                {smicHistory.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {formatEur(v.hourlyValue)} (applicable au{" "}
                    {formatDate(v.applicationDate)})
                    {currentSmic?.id === v.id ? " — actuel" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <DocumentList docs={deferredDocs} isLoadingDocs={isLoadingDocs} />
        </div>
        <Stack direction="row" spacing={2} mt={4} justifyContent="end">
          <Button variant="outlined" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={!canValidate}
            onClick={() => {
              if (selectedSmic) {
                onValidate(selectedSmic.hourlyValue);
              }
            }}
          >
            Oui
          </Button>
        </Stack>
      </StyledBox>
    </Modal>
  );
}

const StyledBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  backgroundColor: `${fr.colors.decisions.background.default.grey.default}`,
  padding: `${fr.spacing("8v")}`,
});
