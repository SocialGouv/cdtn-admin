import {
  Alert,
  Button,
  Checkbox,
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
import React, { useMemo, useState } from "react";

import { TitleBox } from "../../../forms/TitleBox";
import { statusesMapping } from "../../status/data";
import { ANSWER_TYPES, filterAgreements, sortByIdcc } from "./agreementTypes";
import { TemplateResetAnswer } from "./templateReset.query";

export type TemplateResetBlockProps = {
  answers: TemplateResetAnswer[];
  /** Template actuel de la question : vide, il n'y a rien à appliquer */
  template: string | undefined;
  disabled?: boolean;
  onApply: (ids: string[]) => Promise<void>;
};

const getTypeLabel = (contentType: string | null): string =>
  ANSWER_TYPES.find((type) => type.value === contentType)?.label ??
  "Non renseigné";

const getStatusLabel = (status: TemplateResetAnswer["status"]): string =>
  statusesMapping[status ?? "TODO"]?.text ?? status ?? "";

/**
 * Application du template aux réponses des CC, depuis l'édition de la question :
 * une ligne par CC, cases à cocher, puis confirmation. Les réponses choisies
 * passent en « Afficher la réponse » avec le template pour contenu et repassent
 * « En rédaction », quel que soit leur statut.
 */
export const TemplateResetBlock = ({
  answers,
  template,
  disabled = false,
  onApply,
}: TemplateResetBlockProps): JSX.Element | null => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [applying, setApplying] = useState(false);

  const visible = useMemo(() => {
    const byAgreement = new Map(
      answers.map((answer) => [answer.agreement.id, answer])
    );
    return filterAgreements(
      sortByIdcc(answers.map((answer) => answer.agreement)),
      search
    ).flatMap((agreement) => byAgreement.get(agreement.id) ?? []);
  }, [answers, search]);

  if (answers.length === 0) {
    return null;
  }

  const templateEmpty = !template || template.trim() === "";
  const locked = disabled || applying;
  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((answer) => selectedIds.includes(answer.id));

  const toggleRow = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );

  const toggleAllVisible = () =>
    setSelectedIds((ids) =>
      allVisibleSelected
        ? ids.filter((id) => !visible.some((answer) => answer.id === id))
        : Array.from(new Set([...ids, ...visible.map((answer) => answer.id)]))
    );

  const apply = async () => {
    setApplying(true);
    try {
      await onApply(selectedIds);
      setSelectedIds([]);
      setConfirming(false);
    } catch {
      // Erreur affichée par l'appelant : la sélection est conservée pour réessayer
    } finally {
      setApplying(false);
    }
  };

  const count = selectedIds.length;
  const plural = count > 1 ? "s" : "";

  return (
    <TitleBox title="Appliquer le template aux conventions collectives">
      <Stack spacing={2} mt={4} pb={2}>
        <Typography id="template-reset-help">
          Modifier le template n&apos;est pas répercuté automatiquement sur les
          réponses. Cochez les CC auxquelles appliquer le template ci-dessus :
          leur réponse passe en « Afficher la réponse », son contenu est
          remplacé par le template et elle repasse « En rédaction », quel que
          soit son statut.
        </Typography>
        {templateEmpty && (
          <Alert severity="info">
            Renseignez le template pour pouvoir l&apos;appliquer.
          </Alert>
        )}
        <TextField
          size="small"
          label="Filtrer par nom ou IDCC"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 320 }}
        />
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table
            size="small"
            stickyHeader
            aria-describedby="template-reset-help"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && count > 0}
                    disabled={locked}
                    onChange={toggleAllVisible}
                    inputProps={{
                      "aria-label": "Sélectionner toutes les CC affichées",
                    }}
                  />
                </TableCell>
                <TableCell scope="col">IDCC</TableCell>
                <TableCell scope="col">Convention collective</TableCell>
                <TableCell scope="col">Type de réponse</TableCell>
                <TableCell scope="col">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((answer) => (
                <TableRow
                  key={answer.id}
                  hover
                  selected={selectedIds.includes(answer.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(answer.id)}
                      disabled={locked}
                      onChange={() => toggleRow(answer.id)}
                      inputProps={{
                        "aria-label": `Appliquer le template à ${answer.agreement.id} - ${answer.agreement.name}`,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {answer.agreement.id}
                  </TableCell>
                  <TableCell>{answer.agreement.name}</TableCell>
                  <TableCell>{getTypeLabel(answer.contentType)}</TableCell>
                  <TableCell>{getStatusLabel(answer.status)}</TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Aucune convention collective ne correspond au filtre.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {confirming ? (
          <Alert
            severity="warning"
            role="alert"
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  // Sans « button », un clic déclencherait la soumission du formulaire de la question.
                  type="button"
                  color="inherit"
                  size="small"
                  disabled={applying}
                  onClick={() => setConfirming(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  color="warning"
                  variant="contained"
                  size="small"
                  disabled={applying || count === 0 || templateEmpty}
                  onClick={apply}
                >
                  Confirmer
                </Button>
              </Stack>
            }
          >
            Le contenu de {count} réponse{plural} sera remplacé par le template
            et repassera « En rédaction ». Une réponse déjà publiée reste en
            ligne telle quelle jusqu&apos;à sa prochaine publication.
          </Alert>
        ) : (
          <Stack direction="row" justifyContent="end">
            <Button
              type="button"
              variant="contained"
              color="warning"
              disabled={locked || count === 0 || templateEmpty}
              onClick={() => setConfirming(true)}
            >
              Appliquer le template à la sélection ({count})
            </Button>
          </Stack>
        )}
      </Stack>
    </TitleBox>
  );
};
