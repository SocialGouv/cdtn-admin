import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDatePicker } from "src/components/forms/DatePicker";
import { FormTextField } from "src/components/forms/TextField";
import { SmicFormData, SmicValue, smicFormSchema } from "../../type";
import { useSmicValuesQuery } from "./smic.query";
import { Breadcrumb, BreadcrumbLink } from "../../../../components/utils";

const HOURS_PER_MONTH = (35 * 52) / 12;

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

function CurrentValueCard({ value }: { value: SmicValue }) {
  const monthly = value.hourlyValue * HOURS_PER_MONTH;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
            >
              Valeur en vigueur
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
              {formatEur(value.hourlyValue)} / heure brut
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Soit {formatEur(monthly)} / mois (35h — 151,67 h/mois)
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
            >
              Depuis le
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
              {formatDate(value.applicationDate)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function HistoryTable({ rows }: { rows: SmicValue[] }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Historique
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Date d&apos;application</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Horaire brut</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Mensuel 35h</strong>
              </TableCell>
              <TableCell>
                <strong>Modifié par</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune valeur enregistrée
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor: index === 0 ? "action.hover" : undefined,
                  }}
                >
                  <TableCell>{formatDate(row.applicationDate)}</TableCell>
                  <TableCell align="right">
                    {formatEur(row.hourlyValue)}
                  </TableCell>
                  <TableCell align="right">
                    {formatEur(row.hourlyValue * HOURS_PER_MONTH)}
                  </TableCell>
                  <TableCell>{row.createdBy ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function SmicPage() {
  const router = useRouter();
  const { currentValue, history, fetching, error } = useSmicValuesQuery();

  const { control, handleSubmit } = useForm<SmicFormData>({
    defaultValues: {
      hourlyValue: undefined,
      applicationDate: "",
      note: "",
    },
    resolver: zodResolver(smicFormSchema),
  });

  const onSubmit = (data: SmicFormData) => {
    const params = new URLSearchParams({
      hourlyValue: String(data.hourlyValue),
      applicationDate: data.applicationDate,
      ...(data.note ? { note: data.note } : {}),
    });
    router.push(`/valeurs-de-reference/impact?${params.toString()}`);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ mt: 1 }}>
          SMIC
        </Typography>
      </Box>

      {fetching && !currentValue && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error">
          Erreur lors du chargement des données.
        </Typography>
      )}

      {!fetching && !error && !currentValue && (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary">
              Aucune valeur de SMIC enregistrée pour le moment.
            </Typography>
          </CardContent>
        </Card>
      )}

      {currentValue && <CurrentValueCard value={currentValue} />}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mettre à jour le SMIC
          </Typography>
          <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormTextField
                name="hourlyValue"
                control={control}
                label="Nouveau SMIC horaire brut"
                placeholder="ex : 12,15"
                type="number"
                hintText="Valeur en € (ex : 12.15)"
              />
              <FormDatePicker
                name="applicationDate"
                control={control}
                label="Date d'application"
              />
            </Stack>
            <FormTextField
              name="note"
              control={control}
              label="Note interne (optionnelle)"
              fullWidth
              multiline
            />
            <Divider />
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                iconId="fr-icon-search-line"
                iconPosition="right"
              >
                Analyser l&apos;impact
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <HistoryTable rows={history} />
    </Stack>
  );
}
