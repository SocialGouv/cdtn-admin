import React, { useState } from "react";
import { getRouteBySource, SourceKeys } from "@socialgouv/cdtn-utils";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import { TitleBox } from "src/components/forms/TitleBox";
import { useSearchCdtnReferencesQuery } from "src/components/forms/CdtnReferences/cdtnReferencesSearch.query";
import { CdtnReference } from "src/components/forms/CdtnReferences/type";
import { Add } from "src/components/utils/dsfrIcons";
import { NewsLink } from "../../type";
import { NewsSortableList } from "./NewsSortableList";
import { ExternalLinkEditor } from "./ExternalLinkEditor";
import { ExternalLinkRow } from "./ExternalLinkRow";
import { NewsIntroField } from "./NewsIntroField";

const getDocumentLabel = ({ document }: CdtnReference) =>
  `${getRouteBySource(document.source as SourceKeys)} > ${document.title}`;

export const NewsLinks = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "links",
  });
  const links = fields as unknown as (NewsLink & { id: string })[];
  // `fields` ne suit pas la saisie de l'introduction : on lit les valeurs à jour
  // pour ne pas l'écraser en modifiant un lien externe.
  const values: NewsLink[] = useWatch({ control, name: "links" }) ?? [];
  const [query, setQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const { data: options } = useSearchCdtnReferencesQuery(query);

  return (
    <TitleBox title="Pour aller plus loin">
      <Stack spacing={2} mt={1}>
        <NewsSortableList
          items={links}
          onMove={(from, to) => move(from, to)}
          onRemove={remove}
          itemLabel={(link) =>
            link.type === "cdtn" ? link.document.title : link.label
          }
          renderItem={(link, index) => (
            <Stack spacing={1}>
              {link.type === "cdtn" ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label="CDTN" color="info" variant="outlined" />
                  <Box>{getDocumentLabel(link)}</Box>
                </Stack>
              ) : editing === index ? (
                <ExternalLinkEditor
                  initial={link}
                  onCancel={() => setEditing(null)}
                  onSave={(value) => {
                    update(index, { ...values[index], ...value });
                    setEditing(null);
                  }}
                />
              ) : (
                <ExternalLinkRow link={link} onEdit={() => setEditing(index)} />
              )}
              <NewsIntroField control={control} name={`links.${index}.intro`} />
            </Stack>
          )}
        />
        {editing === "new" && (
          <ExternalLinkEditor
            onCancel={() => setEditing(null)}
            onSave={(value) => {
              append({ type: "external", ...value, intro: "" });
              setEditing(null);
            }}
          />
        )}
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
              append({ type: "cdtn", document: value.document, intro: "" });
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
            startIcon={<Add />}
            onClick={() => setEditing("new")}
          >
            Ajouter un lien externe
          </Button>
        </Box>
      </Stack>
    </TitleBox>
  );
};
