import React, { useState } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormHelperText,
  Stack,
  TextField,
} from "@mui/material";
import { TitleBox } from "src/components/forms/TitleBox";
import { useContributionSearchLegiReferenceQuery } from "src/components/forms/LegiReferences/legiReferencesSearch.query";
import { LegiReference } from "src/components/forms/LegiReferences/type";
import { Add } from "src/components/utils/dsfrIcons";
import { NewsReference } from "../../type";
import { NewsSortableList } from "./NewsSortableList";
import { ExternalLinkEditor } from "./ExternalLinkEditor";
import { ExternalLinkRow } from "./ExternalLinkRow";
import { NewsIntroField } from "./NewsIntroField";

export const NewsReferences = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "references",
  });
  const references = fields as unknown as (NewsReference & { id: string })[];
  const values: NewsReference[] =
    useWatch({ control, name: "references" }) ?? [];
  const [query, setQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [duplicate, setDuplicate] = useState(false);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const { data: options } = useContributionSearchLegiReferenceQuery(query);

  return (
    <TitleBox title="Références">
      <Stack spacing={2} mt={1}>
        <NewsSortableList
          items={references}
          onMove={move}
          onRemove={remove}
          itemLabel={(reference) =>
            reference.type === "legi"
              ? reference.legiArticle.label
              : reference.label
          }
          renderItem={(reference, index) => (
            <Stack spacing={1}>
              {reference.type === "legi" ? (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label="Légifrance" color="success" variant="outlined" />
                  <span>{reference.legiArticle.label}</span>
                </Stack>
              ) : editing === index ? (
                <ExternalLinkEditor
                  initial={reference}
                  onCancel={() => setEditing(null)}
                  onSave={(value) => {
                    update(index, { ...values[index], ...value });
                    setEditing(null);
                  }}
                />
              ) : (
                <ExternalLinkRow
                  link={reference}
                  onEdit={() => setEditing(index)}
                />
              )}
              <NewsIntroField
                control={control}
                name={`references.${index}.intro`}
              />
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
        <Autocomplete<Pick<LegiReference, "legiArticle">, false, true, false>
          key={searchKey}
          disableClearable
          options={options}
          inputValue={query}
          onInputChange={(_event, value, reason) => {
            if (reason !== "reset") setQuery(value);
          }}
          getOptionLabel={(o) => o.legiArticle.label}
          filterOptions={(o) => o}
          isOptionEqualToValue={(option, value) =>
            option.legiArticle.id === value.legiArticle.id
          }
          onChange={(_event, value) => {
            const alreadyAdded = references.some(
              (reference) =>
                reference.type === "legi" &&
                reference.legiArticle.id === value.legiArticle.id
            );
            setDuplicate(alreadyAdded);
            if (!alreadyAdded) {
              append({
                type: "legi",
                legiArticle: value.legiArticle,
                intro: "",
              });
            }
            setQuery("");
            setSearchKey((key) => key + 1);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ajouter un article du code du travail"
              placeholder="Rechercher un article, ex. L1234-9"
            />
          )}
        />
        {duplicate && (
          <FormHelperText error>Cet article est déjà ajouté</FormHelperText>
        )}
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
