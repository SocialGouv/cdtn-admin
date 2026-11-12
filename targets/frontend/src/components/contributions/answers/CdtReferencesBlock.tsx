import {
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { Control, Controller } from "react-hook-form";

import { TitleBox } from "../../forms/TitleBox";
import {
  CdtReferenceItem,
  CdtReferencesMode,
  TYPE_LABELS,
} from "./cdtReferences";

type Props = {
  mode: Exclude<CdtReferencesMode, "none">;
  items: CdtReferenceItem[];
  genericAnswerId?: string;
  /** Champ du formulaire qui porte les URL cochées (mode « selectable ») */
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

/**
 * Références du Code du travail dans la page d'une CC :
 * - lecture seule pour NOTHING / CDT / UNFAVOURABLE (ajoutées automatiquement à l'export) ;
 * - cases à cocher, décochées par défaut, pour « Afficher la réponse ».
 */
export const CdtReferencesBlock = ({
  mode,
  items,
  genericAnswerId,
  name,
  control,
  disabled = false,
}: Props): React.ReactElement | null => {
  if (mode === "selectable" && items.length === 0) {
    return null;
  }

  return (
    <TitleBox title="Références du Code du travail" disabled={disabled}>
      <Stack spacing={2} mt={4} pb={2}>
        {mode === "readonly" ? (
          <>
            <Alert severity="info">
              Ces références du Code du travail sont ajoutées automatiquement
              lors de l&apos;export. Pour les modifier, rendez-vous sur la{" "}
              {genericAnswerId ? (
                <Link href={`/contributions/answers/${genericAnswerId}`}>
                  réponse du Code du travail
                </Link>
              ) : (
                "réponse du Code du travail"
              )}
              .
            </Alert>
            {items.length === 0 ? (
              <Typography>Aucune référence du Code du travail.</Typography>
            ) : (
              <ul aria-label="Références du Code du travail (lecture seule)">
                {items.map((item) => (
                  <li key={item.url}>
                    {item.label}{" "}
                    <Typography component="span" variant="caption">
                      ({TYPE_LABELS[item.type]})
                    </Typography>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <Typography id={`${name}-help`}>
              Cochez les références du Code du travail à ajouter à cette réponse
              lors de l&apos;export. Aucune n&apos;est cochée par défaut.
            </Typography>
            <Controller
              name={name}
              control={control}
              render={({ field: { value, onChange } }) => {
                const selected: string[] = value ?? [];
                return (
                  <FormGroup aria-describedby={`${name}-help`}>
                    {items.map((item) => (
                      <FormControlLabel
                        key={item.url}
                        disabled={disabled}
                        control={
                          <Checkbox
                            checked={selected.includes(item.url)}
                            onChange={(event) =>
                              onChange(
                                event.target.checked
                                  ? [...selected, item.url]
                                  : selected.filter((url) => url !== item.url)
                              )
                            }
                          />
                        }
                        label={`${item.label} (${TYPE_LABELS[item.type]})`}
                      />
                    ))}
                  </FormGroup>
                );
              }}
            />
          </>
        )}
      </Stack>
    </TitleBox>
  );
};
