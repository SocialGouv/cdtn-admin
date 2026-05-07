import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useInsertSmicValueMutation } from "../SmicPage/smic.mutation";
import { useSmicValuesQuery } from "../SmicPage/smic.query";
import { ChallengerAnnotationDetail, useImpact } from "./useImpact";
import { Breadcrumb, BreadcrumbLink } from "../../../../components/utils";

const CDTN_FRONTEND_URL = "https://code.travail.gouv.fr";

function formatEur(value: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + "\u00a0€"
  );
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}\u00a0%`;
}

function exportToCsv(details: ChallengerAnnotationDetail[]) {
  const header = [
    "Contribution",
    "CC",
    "Formule",
    "Paramètre",
    "Montant rédigé",
    "Nouveau montant publié",
    "Valeur changée",
    "Lien prod",
  ].join(";");
  const rows = details.map((d) =>
    [
      `"${d.questionContent.replace(/"/g, '""')}"`,
      `"${d.agreementName}"`,
      `"${d.formulaLabel}"`,
      d.parameter ?? "",
      d.amountRedigé.toString().replace(".", ","),
      d.publishedAmount.toString().replace(".", ","),
      d.amountChanged ? "Oui" : "Non",
      d.prodSlug ? `${CDTN_FRONTEND_URL}/contribution/${d.prodSlug}` : "",
    ].join(";")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = "impact-smic.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  highlight,
  total,
  loading,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  total?: number;
  loading?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" display="block">
          {label}
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography
            variant="h4"
            fontWeight="bold"
            color={highlight && value > 0 ? "warning.dark" : undefined}
          >
            {value}
            {total !== undefined && (
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
                fontWeight="normal"
              >
                {" "}
                / {total}
              </Typography>
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function DetailTable({
  details,
  onlyChanged,
}: {
  details: ChallengerAnnotationDetail[];
  onlyChanged: boolean;
}) {
  const rows = onlyChanged ? details.filter((d) => d.amountChanged) : details;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Contribution</strong>
            </TableCell>
            <TableCell>
              <strong>CC</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Nouveau montant</strong>
            </TableCell>
            <TableCell>
              <strong>Formule</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Voir</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  Aucun montant challengé trouvé.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow
                key={`${row.answerId}-${idx}`}
                sx={{
                  backgroundColor: row.amountChanged
                    ? "warning.lighter"
                    : undefined,
                }}
              >
                <TableCell>
                  <Tooltip title={row.questionContent}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                      {row.questionContent}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                    {row.agreementId === "0000" ? "Toutes CC" : row.agreementId}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={0.5}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={row.amountChanged ? "bold" : undefined}
                      color={row.amountChanged ? "warning.dark" : undefined}
                    >
                      {formatEur(row.publishedAmount)}
                    </Typography>
                    {row.amountChanged && (
                      <Tooltip
                        title={`Avant : ${formatEur(row.currentPublishedAmount)} — Rédigé : ${formatEur(row.amountRedigé)}`}
                      >
                        <Chip
                          label="changé"
                          size="small"
                          color="warning"
                          sx={{ fontSize: "0.65rem", height: 18 }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                    {row.formulaLabel}
                    {row.parameter && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {" "}
                        ({row.parameter})
                      </Typography>
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {row.prodSlug ? (
                    <Tooltip title="Voir sur code.travail.gouv.fr">
                      <IconButton
                        component="a"
                        href={`${CDTN_FRONTEND_URL}/contribution/${row.prodSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <span
                          className="ri-external-link-line"
                          style={{ fontSize: 16 }}
                          aria-hidden
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type SmicImpactProps = {
  hourlyValue: number;
  applicationDate: string;
  note?: string;
};

export function SmicImpact({
  hourlyValue,
  applicationDate,
  note,
}: SmicImpactProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentValue } = useSmicValuesQuery();
  const [mutationState, insertSmicValue] = useInsertSmicValueMutation();
  const [onlyChanged, setOnlyChanged] = useState(false);

  const { impact, fetching: impactFetching } = useImpact(
    hourlyValue,
    currentValue?.hourlyValue ?? null
  );

  const today = new Date().toISOString().split("T")[0];
  const isRetroactive = applicationDate < today;
  const isFuture = applicationDate > today;

  const oldMonthly = currentValue
    ? currentValue.hourlyValue * ((35 * 52) / 12)
    : null;
  const newMonthly = hourlyValue * ((35 * 52) / 12);
  const percentChange = currentValue
    ? ((hourlyValue - currentValue.hourlyValue) / currentValue.hourlyValue) *
      100
    : null;

  const handleSave = async () => {
    const result = await insertSmicValue({
      hourlyValue,
      applicationDate,
      note: note ?? null,
      createdBy: session?.user?.name ?? session?.user?.email ?? null,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    router.push("/valeurs-de-reference");
  };

  const displayedDetails = onlyChanged
    ? (impact?.details ?? []).filter((d) => d.amountChanged)
    : (impact?.details ?? []);

  return (
    <Stack spacing={3}>
      <Box>
        <Breadcrumb>
          <BreadcrumbLink href={"/valeurs-de-reference"}>
            Valeurs de référence
          </BreadcrumbLink>
          <BreadcrumbLink>Mise à jour du SMIC</BreadcrumbLink>
        </Breadcrumb>
        <Typography variant="h4" sx={{ mt: 1 }}>
          Analyse de l&apos;impact
        </Typography>
      </Box>

      {isRetroactive && (
        <Alert severity="warning">
          <strong>Cette modification est rétroactive.</strong> La date
          d&apos;application ({formatDate(applicationDate)}) est dans le passé.
        </Alert>
      )}

      {/* Summary card */}
      <Card
        sx={{ borderLeft: 4, borderColor: "warning.main" }}
        variant="outlined"
      >
        <CardContent>
          <Typography variant="body1" fontWeight="bold">
            Passage de{" "}
            {currentValue ? formatEur(currentValue.hourlyValue) : "—"} →{" "}
            {formatEur(hourlyValue)} / heure brut
            {percentChange !== null && (
              <Chip
                label={formatPercent(percentChange)}
                size="small"
                color={percentChange >= 0 ? "success" : "error"}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {oldMonthly !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              SMIC mensuel 35h&nbsp;: {formatEur(oldMonthly)} →{" "}
              {formatEur(newMonthly)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Date d&apos;application&nbsp;:{" "}
            {isFuture ? (
              <Chip
                label={`Futur — ${formatDate(applicationDate)}`}
                size="small"
                color="info"
              />
            ) : (
              formatDate(applicationDate)
            )}
          </Typography>
          {note && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Note&nbsp;: {note}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <StatCard
          label="Contributions impactées"
          value={impact?.contributionsCount ?? 0}
          loading={impactFetching}
        />
        <StatCard
          label="Montants recalculés"
          value={impact?.annotationsCount ?? 0}
          loading={impactFetching}
        />
        <StatCard
          label="Dont valeur changée"
          value={impact?.changedCount ?? 0}
          total={impact?.annotationsCount ?? 0}
          highlight
          loading={impactFetching}
        />
      </Stack>

      {/* Detail table */}
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Détail des changements</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Uniquement valeurs changées
            </Typography>
            <Switch
              size="small"
              checked={onlyChanged}
              onChange={(e) => setOnlyChanged(e.target.checked)}
            />
            {!impactFetching && impact && (
              <Typography variant="caption" color="text.secondary">
                ({displayedDetails.length} ligne
                {displayedDetails.length > 1 ? "s" : ""})
              </Typography>
            )}
          </Stack>
        </Stack>

        {impactFetching ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DetailTable details={displayedDetails} onlyChanged={true} />
        )}
      </Box>

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 1 }}
      >
        <Button
          priority="secondary"
          linkProps={{ href: "/valeurs-de-reference" }}
        >
          Annuler
        </Button>
        <Stack direction="row" spacing={2}>
          {impact && impact.annotationsCount > 0 && (
            <Button
              priority="tertiary"
              iconId="fr-icon-download-line"
              iconPosition="left"
              onClick={() => exportToCsv(impact.details)}
            >
              Exporter la liste
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={mutationState.fetching}
            iconId="fr-icon-save-line"
            iconPosition="right"
          >
            {mutationState.fetching ? "Enregistrement…" : "Enregistrer le SMIC"}
          </Button>
        </Stack>
      </Stack>

      {mutationState.error && (
        <Alert severity="error">
          Erreur lors de l&apos;enregistrement&nbsp;:{" "}
          {mutationState.error.message}
        </Alert>
      )}
    </Stack>
  );
}
