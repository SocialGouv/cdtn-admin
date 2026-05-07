import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Editor } from "@tiptap/react";
import { gql, useQuery } from "urql";
import {
  applyAmountsToEditor,
  detectAmountsInRange,
  DetectedAmount,
} from "./utils";
import {
  CHALLENGER_FORMULAS,
  ChallengerFormula,
  computeChallengerReference,
  formatChallengerEur,
} from "@shared/utils/build/src/challenger.utils";

const smicCurrentValueQuery = gql`
  query SmicCurrentValueBulk {
    reference_value_smic_values(order_by: { applicationDate: desc }) {
      id
      hourlyValue
      applicationDate
    }
  }
`;

type SmicRow = { id: string; hourlyValue: number; applicationDate: string };
type SmicQueryResult = { reference_value_smic_values: SmicRow[] };

export type BulkChallengerDialogProps = {
  open: boolean;
  editor: Editor | null;
  range: { from: number; to: number } | null;
  onClose: () => void;
};

export function BulkChallengerDialog({
  open,
  editor,
  range,
  onClose,
}: BulkChallengerDialogProps) {
  const [amounts, setAmounts] = useState<DetectedAmount[]>([]);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (!open || !editor || !range) {
      setAmounts([]);
      return;
    }
    setDetecting(true);
    const timer = setTimeout(() => {
      setAmounts(detectAmountsInRange(editor, range.from, range.to));
      setDetecting(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  // editor and range are intentionally excluded: we only scan on open, using the snapshot at that moment

  const [smicResult] = useQuery<SmicQueryResult>({
    query: smicCurrentValueQuery,
    requestPolicy: "cache-and-network",
    pause: !open,
  });

  const today = new Date().toISOString().split("T")[0];
  const allSmic = smicResult.data?.reference_value_smic_values ?? [];
  const currentSmic = allSmic.find((v) => v.applicationDate <= today) ?? null;

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const actionableAmounts = useMemo(
    () => amounts.filter((a) => !a.alreadyChallenged && a.parsedValue !== null),
    [amounts]
  );
  const alreadyChallengedCount = amounts.filter(
    (a) => a.alreadyChallenged
  ).length;

  const filteredAmounts = useMemo(() => {
    const min = minAmount !== "" ? parseFloat(minAmount) : null;
    const max = maxAmount !== "" ? parseFloat(maxAmount) : null;
    return amounts.filter((a) => {
      if (a.parsedValue === null) return true;
      if (min !== null && a.parsedValue < min) return false;
      if (max !== null && a.parsedValue > max) return false;
      return true;
    });
  }, [amounts, minAmount, maxAmount]);

  useEffect(() => {
    setPage(0);
  }, [amounts, minAmount, maxAmount]);

  const pageStart = page * PAGE_SIZE;
  const visibleAmounts = filteredAmounts.slice(
    pageStart,
    pageStart + PAGE_SIZE
  );

  const [bulkFormula, setBulkFormula] = useState<ChallengerFormula | "">("");
  const [bulkParameter, setBulkParameter] = useState("");

  const bulkFormulaDef = CHALLENGER_FORMULAS.find(
    (f) => f.value === bulkFormula
  );

  const applyFormulaToAll = () => {
    if (!bulkFormula) return;
    const ids = new Set(
      filteredAmounts.filter((a) => !a.alreadyChallenged).map((a) => a.id)
    );
    setAmounts((prev) =>
      prev.map((a) =>
        ids.has(a.id)
          ? { ...a, formula: bulkFormula, parameter: bulkParameter }
          : a
      )
    );
  };

  const setFormula = (id: number, formula: ChallengerFormula | "") => {
    setAmounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, formula, parameter: "" } : a))
    );
  };

  const setParameter = (id: number, parameter: string) => {
    setAmounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, parameter } : a))
    );
  };

  const handleConfirm = () => {
    if (editor) {
      applyAmountsToEditor(editor, amounts);
    }
    onClose();
  };

  const annotatedCount = actionableAmounts.filter((a) => a.formula).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Détecter et challenger les montants</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {detecting ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : amounts.length === 0 ? (
            <Typography color="text.secondary">
              Aucun montant monétaire détecté dans la sélection.
            </Typography>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  {actionableAmounts.length} montant
                  {actionableAmounts.length > 1 ? "s" : ""} détecté
                  {actionableAmounts.length > 1 ? "s" : ""}
                  {alreadyChallengedCount > 0 &&
                    ` (${alreadyChallengedCount} déjà challengé${alreadyChallengedCount > 1 ? "s" : ""})`}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  label="Montant min (€)"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  sx={{ width: 160 }}
                />
                <TextField
                  size="small"
                  label="Montant max (€)"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  sx={{ width: 160 }}
                />
                {(minAmount !== "" || maxAmount !== "") && (
                  <Typography variant="caption" color="text.secondary">
                    {filteredAmounts.length} / {amounts.length} affiché
                    {filteredAmounts.length > 1 ? "s" : ""}
                  </Typography>
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "grey.50",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  Appliquer à tous :
                </Typography>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel>Formule</InputLabel>
                  <Select
                    value={bulkFormula}
                    label="Formule"
                    onChange={(e) => {
                      setBulkFormula(e.target.value as ChallengerFormula | "");
                      setBulkParameter("");
                    }}
                  >
                    <MenuItem value="">
                      <em>Choisir une formule…</em>
                    </MenuItem>
                    {CHALLENGER_FORMULAS.map((f) => (
                      <MenuItem key={f.value} value={f.value}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {bulkFormulaDef?.paramLabel && (
                  <TextField
                    size="small"
                    label={bulkFormulaDef.paramLabel}
                    value={bulkParameter}
                    onChange={(e) => setBulkParameter(e.target.value)}
                    type="number"
                    inputProps={{ min: 0, step: "0.01" }}
                    sx={{ width: 160 }}
                    required
                  />
                )}
                <Button
                  size="small"
                  variant="contained"
                  disabled={
                    !bulkFormula ||
                    (!!bulkFormulaDef?.paramLabel && !bulkParameter)
                  }
                  onClick={applyFormulaToAll}
                >
                  Appliquer
                </Button>
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Montant</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Contexte</strong>
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <strong>Formule challenger</strong>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <strong>Paramètre</strong>
                      </TableCell>
                      {currentSmic && (
                        <TableCell align="right">
                          <strong>Publié</strong>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleAmounts.map((row) => {
                      const formulaDef = CHALLENGER_FORMULAS.find(
                        (f) => f.value === row.formula
                      );
                      const reference =
                        row.formula && currentSmic
                          ? computeChallengerReference(
                              row.formula,
                              row.parameter,
                              currentSmic.hourlyValue
                            )
                          : null;
                      const published =
                        reference !== null && row.parsedValue !== null
                          ? Math.max(row.parsedValue, reference)
                          : null;

                      return (
                        <TableRow
                          key={row.id}
                          sx={{
                            opacity: row.alreadyChallenged ? 0.5 : 1,
                            backgroundColor: row.formula
                              ? "success.lighter"
                              : undefined,
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                noWrap
                              >
                                {row.rawText}
                              </Typography>
                              {row.alreadyChallenged && (
                                <Chip
                                  label="déjà challengé"
                                  size="small"
                                  color="info"
                                  sx={{ fontSize: "0.6rem", height: 16 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 320 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                            >
                              …{row.contextBefore}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              sx={{
                                backgroundColor: "warning.light",
                                borderRadius: 0.5,
                                px: 0.25,
                              }}
                              component="span"
                            >
                              {row.rawText}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                            >
                              {row.contextAfter}…
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <FormControl
                              size="small"
                              fullWidth
                              disabled={row.alreadyChallenged}
                            >
                              <InputLabel>Formule</InputLabel>
                              <Select
                                value={row.formula}
                                label="Formule"
                                onChange={(e) =>
                                  setFormula(
                                    row.id,
                                    e.target.value as ChallengerFormula | ""
                                  )
                                }
                              >
                                <MenuItem value="">
                                  <em>Ignorer</em>
                                </MenuItem>
                                {CHALLENGER_FORMULAS.map((f) => (
                                  <MenuItem key={f.value} value={f.value}>
                                    {f.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            {formulaDef?.paramLabel ? (
                              <TextField
                                size="small"
                                label={formulaDef.paramLabel}
                                value={row.parameter}
                                onChange={(e) =>
                                  setParameter(row.id, e.target.value)
                                }
                                type="number"
                                inputProps={{ min: 0, step: "0.01" }}
                                disabled={row.alreadyChallenged}
                                required
                                fullWidth
                              />
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          {currentSmic && (
                            <TableCell align="right">
                              {published !== null ? (
                                <Tooltip
                                  title={`Rédigé : ${formatChallengerEur(row.parsedValue!)} — Référence : ${formatChallengerEur(reference!)}`}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    {formatChallengerEur(published)}
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {filteredAmounts.length > PAGE_SIZE && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <Button
                    size="small"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <Typography variant="caption">
                    {pageStart + 1}–
                    {Math.min(pageStart + PAGE_SIZE, filteredAmounts.length)} /{" "}
                    {filteredAmounts.length}
                  </Typography>
                  <Button
                    size="small"
                    disabled={pageStart + PAGE_SIZE >= filteredAmounts.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleConfirm} variant="contained">
          Appliquer {annotatedCount > 0 ? `(${annotatedCount})` : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { detectAmountsInRange };
