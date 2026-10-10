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
  Typography,
} from "@mui/material";
import { TitleBox } from "src/components/forms/TitleBox";
import { useSearchCdtnReferencesQuery } from "src/components/forms/CdtnReferences/cdtnReferencesSearch.query";
import { CdtnReference } from "src/components/forms/CdtnReferences/type";
import { Add, Edit } from "src/components/utils/dsfrIcons";
import { NewsLink, newsExternalLinkSchema } from "../../type";
import { NewsSortableList } from "./NewsSortableList";

type ExternalLink = Extract<NewsLink, { type: "external" }>;

const getDocumentLabel = ({ document }: CdtnReference) =>
  `${getRouteBySource(document.source as SourceKeys)} > ${document.title}`;

const ExternalLinkEditor = ({
  initial,
  onCancel,
  onSave,
}: {
  initial?: ExternalLink;
  onCancel: () => void;
  onSave: (value: ExternalLink) => void;
}) => {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [errors, setErrors] = useState<{ label?: string; url?: string }>({});

  const handleSave = () => {
    const result = newsExternalLinkSchema.safeParse({
      type: "external",
      label,
      url,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        label: fieldErrors.label?.join(" "),
        url: fieldErrors.url?.join(" "),
      });
      return;
    }
    setErrors({});
    onSave(result.data);
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Libellé"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        error={Boolean(errors.label)}
        helperText={errors.label}
        fullWidth
      />
      <TextField
        label="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        error={Boolean(errors.url)}
        helperText={errors.url}
        fullWidth
      />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Valider
        </Button>
      </Stack>
    </Stack>
  );
};

export const NewsLinks = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "links",
  });
  const links = fields as unknown as (NewsLink & { id: string })[];
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
          renderItem={(link, index) => {
            if (link.type === "cdtn") {
              return (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label="CDTN" color="info" variant="outlined" />
                  <Box>{getDocumentLabel(link)}</Box>
                </Stack>
              );
            }
            if (editing === index) {
              return (
                <ExternalLinkEditor
                  initial={link}
                  onCancel={() => setEditing(null)}
                  onSave={(value) => {
                    update(index, value);
                    setEditing(null);
                  }}
                />
              );
            }
            return (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip label="Externe" variant="outlined" />
                <Stack flex={1}>
                  <Typography>{link.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {link.url}
                  </Typography>
                </Stack>
                <IconButton
                  aria-label={`Modifier ${link.label}`}
                  onClick={() => setEditing(index)}
                >
                  <Edit />
                </IconButton>
              </Stack>
            );
          }}
        />
        {editing === "new" && (
          <ExternalLinkEditor
            onCancel={() => setEditing(null)}
            onSave={(value) => {
              append(value);
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
