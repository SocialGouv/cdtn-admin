import React, { useState } from "react";
import { getRouteBySource, SourceKeys } from "@socialgouv/cdtn-utils";
import { Control, useFieldArray } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { TitleBox } from "src/components/forms/TitleBox";
import { FormTextField } from "src/components/forms";
import { useSearchCdtnReferencesQuery } from "src/components/forms/CdtnReferences/cdtnReferencesSearch.query";
import { CdtnReference } from "src/components/forms/CdtnReferences/type";
import {
  Delete as DeleteIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "src/components/utils/dsfrIcons";
import { NewsLink } from "../../type";

const getDocumentLabel = ({ document }: CdtnReference) =>
  `${getRouteBySource(document.source as SourceKeys)} > ${document.title}`;

export const NewsLinks = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "links",
  });
  const links = fields as unknown as (NewsLink & { id: string })[];
  const [query, setQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const { data: options } = useSearchCdtnReferencesQuery(query);

  return (
    <TitleBox title="Pour aller plus loin">
      <Stack spacing={2} mt={1}>
        {links.map((link, index) => (
          <Stack
            key={link.id}
            direction="row"
            alignItems="center"
            spacing={2}
            padding={1}
            border={`1px solid ${fr.colors.decisions.border.default.grey.default}`}
          >
            <Chip
              label={link.type === "cdtn" ? "CDTN" : "Externe"}
              color={link.type === "cdtn" ? "info" : "default"}
            />
            {link.type === "cdtn" ? (
              <Box flex={1}>{getDocumentLabel(link)}</Box>
            ) : (
              <Stack direction="row" spacing={2} flex={1}>
                <FormTextField
                  name={`links.${index}.label`}
                  control={control}
                  label="Libellé"
                  fullWidth
                />
                <FormTextField
                  name={`links.${index}.url`}
                  control={control}
                  label="URL"
                  fullWidth
                />
              </Stack>
            )}
            <Stack direction="row">
              <IconButton
                aria-label="moveTop"
                disabled={index === 0}
                onClick={() => swap(index, index - 1)}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                aria-label="moveDown"
                disabled={index === links.length - 1}
                onClick={() => swap(index, index + 1)}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
              <IconButton aria-label="delete" onClick={() => remove(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        ))}
        <Autocomplete<CdtnReference, false, true, false>
          key={searchKey}
          disableClearable
          options={options}
          inputValue={query}
          onInputChange={(_event, value, reason) => {
            if (reason !== "reset") setQuery(value);
          }}
          getOptionLabel={(option) =>
            `${getDocumentLabel(option)} (${option.document.slug})`
          }
          filterOptions={(o) => o}
          isOptionEqualToValue={(option, value) =>
            option.document.cdtnId === value.document.cdtnId
          }
          onChange={(_event, value) => {
            const alreadyLinked = links.some(
              (link) =>
                link.type === "cdtn" &&
                link.document.cdtnId === value.document.cdtnId
            );
            if (!alreadyLinked) {
              append({ type: "cdtn", document: value.document });
            }
            setQuery("");
            setSearchKey((key) => key + 1);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ajouter un contenu CDTN"
              placeholder="Rechercher un contenu"
            />
          )}
        />
        <Box>
          <Button
            variant="outlined"
            onClick={() => append({ type: "external", label: "", url: "" })}
          >
            + Ajouter un lien externe
          </Button>
        </Box>
      </Stack>
    </TitleBox>
  );
};
