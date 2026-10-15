import React, { useMemo, useState } from "react";
import { CONTRIBUTION_COLORS } from "../../../utils/contributionColors";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  LinearProgress,
  MenuItem,
  Radio,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  AgreementAnswerType,
  AgreementRow,
  AgreementTypes,
  ANSWER_TYPES,
  applyTypeToSelection,
  countByType,
  filterAgreements,
  getEffectiveType,
  getRemainingAgreements,
} from "./agreementTypes";

type AgreementTypesTableProps = {
  agreements: AgreementRow[];
  types: AgreementTypes;
  onChange: (types: AgreementTypes) => void;
  disabled?: boolean;
};

export const AgreementTypesTable = ({
  agreements,
  types,
  onChange,
  disabled = false,
}: AgreementTypesTableProps): JSX.Element => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkType, setBulkType] = useState<AgreementAnswerType | "">("");

  const visible = useMemo(
    () => filterAgreements(agreements, search),
    [agreements, search]
  );
  const remaining = getRemainingAgreements(agreements, types);
  const counts = countByType(agreements, types);
  const filled = agreements.length - remaining.length;
  const progress = agreements.length
    ? Math.round((filled / agreements.length) * 100)
    : 100;
  const allVisibleSelected =
    visible.length > 0 && visible.every((row) => selectedIds.includes(row.id));

  const toggleRow = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );

  const toggleAllVisible = () =>
    setSelectedIds((ids) =>
      allVisibleSelected
        ? ids.filter((id) => !visible.some((row) => row.id === id))
        : Array.from(new Set([...ids, ...visible.map((row) => row.id)]))
    );

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          Type de réponse par convention collective
        </Typography>
        <Box role="status" aria-live="polite">
          <Typography
            fontWeight={600}
            sx={{
              color:
                remaining.length > 0
                  ? CONTRIBUTION_COLORS.textWarning
                  : CONTRIBUTION_COLORS.textSuccess,
            }}
          >
            {remaining.length > 0
              ? `${remaining.length} CC restante${
                  remaining.length > 1 ? "s" : ""
                } à renseigner`
              : "Toutes les CC sont renseignées"}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label="Progression de la saisie des types de réponse"
        />
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Filtrer par nom ou IDCC"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 280 }}
        />
        {selectedIds.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Select
              size="small"
              displayEmpty
              value={bulkType}
              disabled={disabled}
              onChange={(event) =>
                setBulkType(event.target.value as AgreementAnswerType | "")
              }
              inputProps={{ "aria-label": "Type à appliquer à la sélection" }}
              sx={{ minWidth: 320 }}
            >
              <MenuItem value="">
                <em>Choisir un type</em>
              </MenuItem>
              {ANSWER_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              disabled={disabled || bulkType === ""}
              onClick={() => {
                if (bulkType === "") return;
                onChange(
                  applyTypeToSelection(agreements, types, selectedIds, bulkType)
                );
                setSelectedIds([]);
                setBulkType("");
              }}
            >
              Appliquer aux {selectedIds.length} lignes
            </Button>
          </Stack>
        )}
      </Stack>

      <TableContainer sx={{ maxHeight: 640 }}>
        <Table size="small" stickyHeader>
          <caption style={{ captionSide: "top", textAlign: "left" }}>
            Une ligne par convention collective supportée, un type de réponse à
            choisir pour chacune.
          </caption>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={!allVisibleSelected && selectedIds.length > 0}
                  disabled={disabled}
                  onChange={toggleAllVisible}
                  inputProps={{
                    "aria-label": "Sélectionner toutes les CC affichées",
                  }}
                />
              </TableCell>
              <TableCell scope="col">IDCC</TableCell>
              <TableCell scope="col">Convention collective</TableCell>
              {ANSWER_TYPES.map((type) => (
                <TableCell key={type.value} scope="col" align="center">
                  {type.label}
                  <Typography variant="caption" display="block">
                    {counts[type.value]}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((agreement) => {
              const type = getEffectiveType(agreement, types);
              return (
                <TableRow
                  key={agreement.id}
                  hover
                  selected={selectedIds.includes(agreement.id)}
                  sx={
                    !type
                      ? {
                          // Fond d'avertissement DSFR, lisible en thème clair comme sombre
                          backgroundColor:
                            CONTRIBUTION_COLORS.warningBackground,
                          color: CONTRIBUTION_COLORS.text,
                        }
                      : undefined
                  }
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(agreement.id)}
                      disabled={disabled}
                      onChange={() => toggleRow(agreement.id)}
                      inputProps={{
                        "aria-label": `Sélectionner ${agreement.name}`,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {agreement.id}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{agreement.name}</span>
                      {!type && (
                        <Chip
                          size="small"
                          color="warning"
                          label="À renseigner"
                        />
                      )}
                      {agreement.unextended && (
                        <Chip size="small" label="Non étendue" />
                      )}
                    </Stack>
                  </TableCell>
                  {ANSWER_TYPES.map((answerType) => (
                    <TableCell key={answerType.value} align="center">
                      <Radio
                        name={`type-${agreement.id}`}
                        value={answerType.value}
                        checked={type === answerType.value}
                        disabled={disabled || agreement.unextended}
                        onChange={() =>
                          onChange({
                            ...types,
                            [agreement.id]: answerType.value,
                          })
                        }
                        inputProps={{
                          "aria-label": `${agreement.name} : ${answerType.label}`,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={3 + ANSWER_TYPES.length}>
                  Aucune convention collective ne correspond au filtre.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
