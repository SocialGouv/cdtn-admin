import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { gql, useQuery } from "urql";
import { parseAmount } from "./utils";
import {
  CHALLENGER_FORMULAS,
  ChallengerFormula,
  computeChallengerReference,
  HOURS_PER_MONTH,
  formatChallengerEur,
} from "@socialgouv/cdtn-utils";

const smicCurrentValueQuery = gql`
  query SmicCurrentValue {
    reference_value_smic_values(order_by: { applicationDate: desc }) {
      id
      hourlyValue
      applicationDate
    }
  }
`;

type SmicRow = {
  id: string;
  hourlyValue: number;
  applicationDate: string;
};

type SmicQueryResult = {
  reference_value_smic_values: SmicRow[];
};

export type ChallengerDialogProps = {
  open: boolean;
  selectedText: string;
  existingFormula?: ChallengerFormula | null;
  existingParameter?: string | null;
  onConfirm: (formula: ChallengerFormula, parameter?: string | null) => void;
  onRemove: () => void;
  onClose: () => void;
};

export function ChallengerDialog({
  open,
  selectedText,
  existingFormula,
  existingParameter,
  onConfirm,
  onRemove,
  onClose,
}: ChallengerDialogProps) {
  const [formula, setFormula] = useState<ChallengerFormula>(
    existingFormula ?? "smic_monthly_35h"
  );
  const [parameter, setParameter] = useState<string>(existingParameter ?? "");

  useEffect(() => {
    if (open) {
      setFormula(existingFormula ?? "smic_monthly_35h");
      setParameter(existingParameter ?? "");
    }
  }, [open, existingFormula, existingParameter]);

  const [smicResult] = useQuery<SmicQueryResult>({
    query: smicCurrentValueQuery,
    requestPolicy: "cache-and-network",
    pause: !open,
  });

  const today = new Date().toISOString().split("T")[0];
  const allSmic = smicResult.data?.reference_value_smic_values ?? [];
  const currentSmic = allSmic.find((v) => v.applicationDate <= today) ?? null;

  const parsedAmount = parseAmount(selectedText);
  const isInvalidAmount = parsedAmount === null;

  const selectedFormulaDef = CHALLENGER_FORMULAS.find(
    (f) => f.value === formula
  );
  const needsParam = !!selectedFormulaDef?.paramLabel;

  const reference = currentSmic
    ? computeChallengerReference(formula, parameter, currentSmic.hourlyValue)
    : null;

  const publishedAmount =
    parsedAmount !== null && reference !== null
      ? Math.max(parsedAmount, reference)
      : null;

  const isParamRequired = needsParam && !parameter;
  const canConfirm = !isInvalidAmount && !isParamRequired;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Challenger ce montant avec une valeur de référence
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
            >
              Montant sélectionné
            </Typography>
            {isInvalidAmount ? (
              <Alert severity="error" sx={{ mt: 0.5 }}>
                La sélection ne contient pas de montant exploitable.
              </Alert>
            ) : (
              <Typography variant="h6">{selectedText}</Typography>
            )}
          </Box>

          <FormControl fullWidth disabled={isInvalidAmount}>
            <InputLabel id="challenger-formula-label">Comparer avec</InputLabel>
            <Select<ChallengerFormula>
              labelId="challenger-formula-label"
              value={formula}
              label="Comparer avec"
              onChange={(e) => {
                setFormula(e.target.value as ChallengerFormula);
                setParameter("");
              }}
            >
              {CHALLENGER_FORMULAS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {needsParam && (
            <TextField
              label={selectedFormulaDef?.paramLabel}
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              disabled={isInvalidAmount}
              required
              fullWidth
            />
          )}

          {!isInvalidAmount && reference !== null && currentSmic && (
            <Box
              sx={{
                backgroundColor: "info.light",
                borderRadius: 1,
                p: 2,
                border: "1px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Aperçu du calcul
              </Typography>
              <Typography variant="body2">
                Montant rédigé&nbsp;:{" "}
                <strong>{formatChallengerEur(parsedAmount!)}</strong>
              </Typography>
              <Typography variant="body2">
                Valeur de référence&nbsp;:{" "}
                <strong>{formatChallengerEur(reference)}</strong> (
                {selectedFormulaDef?.label}
                {formula === "smic_monthly_35h" &&
                  `, ${formatChallengerEur(currentSmic.hourlyValue * HOURS_PER_MONTH)}`}
                , au{" "}
                {new Date(currentSmic.applicationDate).toLocaleDateString(
                  "fr-FR"
                )}
                )
              </Typography>
              {publishedAmount !== null && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  → Montant publié&nbsp;:{" "}
                  <strong>{formatChallengerEur(publishedAmount)}</strong>{" "}
                  <em>
                    (le plus favorable au salarié
                    {publishedAmount > parsedAmount!
                      ? " — la valeur de référence s'applique"
                      : " — le montant rédigé s'applique"}
                    )
                  </em>
                </Typography>
              )}
            </Box>
          )}

          {smicResult.fetching && (
            <Typography variant="body2" color="text.secondary">
              Chargement de la valeur du SMIC…
            </Typography>
          )}

          {!smicResult.fetching && !currentSmic && (
            <Alert severity="warning">
              Aucune valeur du SMIC enregistrée. L&apos;aperçu du calcul
              n&apos;est pas disponible.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {existingFormula && (
          <Button onClick={onRemove} color="error" sx={{ mr: "auto" }}>
            Supprimer le challenge
          </Button>
        )}
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={() => onConfirm(formula, needsParam ? parameter : null)}
          variant="contained"
          disabled={!canConfirm}
        >
          Challenger
        </Button>
      </DialogActions>
    </Dialog>
  );
}
