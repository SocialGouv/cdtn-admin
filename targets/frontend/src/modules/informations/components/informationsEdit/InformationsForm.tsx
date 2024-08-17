import { Button, FormControl, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormRadioGroup, FormTextField } from "src/components/forms";

import { InformationsResult } from "./Informations.query";
import { Information, informationSchema } from "../../type";
import { InformationsContent } from "./InformationsContent";
import { InformationsReference } from "./InformationsReference";
import { FormCheckbox } from "src/components/forms/Checkbox";
import { LoadingButton } from "../../../../components/button/LoadingButton";

export type InformationsFormProps = {
  data?: InformationsResult;
  onUpsert: (props: Information) => Promise<void>;
  onDelete?: () => Promise<void>;
  onPublish?: () => Promise<void>;
};

export const InformationsForm = ({
  data,
  onUpsert,
  onDelete,
  onPublish,
}: InformationsFormProps): JSX.Element => {
  const { control, handleSubmit } = useForm<Information>({
    defaultValues: data ?? { title: "", dismissalProcess: false },
    resolver: zodResolver(informationSchema),
    shouldFocusError: true,
  });

  const {
    fields: contents,
    swap: swapContent,
    remove: removeContent,
    append: appendContent,
  } = useFieldArray<Information, "contents">({
    control,
    name: "contents",
  });
  const {
    fields: references,
    swap: swapReference,
    remove: removeReference,
    append: appendReference,
  } = useFieldArray<Information, "references">({
    control,
    name: "references",
  });

  const [expandedContent, setExpandedContent] = React.useState<string | false>(
    false
  );
  const [isPublishing, setIsPublishing] = useState(false);

  return (
    <>
      <form onSubmit={handleSubmit(onUpsert)}>
        <Stack spacing={4}>
          <FormControl>
            <FormTextField
              name="updateDate"
              control={control}
              label="Date mise à jour"
              disabled
              labelFixed
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="title"
              control={control}
              label="Titre"
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="metaTitle"
              control={control}
              label="Titre Meta"
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="description"
              control={control}
              label="Description"
              multiline
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="metaDescription"
              control={control}
              label="Description Meta"
              multiline
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="intro"
              control={control}
              label="Intro"
              multiline
              fullWidth
            />
          </FormControl>
          <FormCheckbox
            control={control}
            label="Dossier licenciement"
            name="dismissalProcess"
          />
          <Typography variant="h5">Sections</Typography>
          {!!contents.length && (
            <FormRadioGroup
              name="sectionDisplayMode"
              label="Affichage des sections"
              control={control}
              options={[
                {
                  label: "Accordéon",
                  value: "accordion",
                },
                {
                  label: "Onglet",
                  value: "tab",
                },
              ]}
            />
          )}
          {contents.map(({ id }, index) => {
            return (
              <InformationsContent
                key={id}
                control={control}
                expanded={expandedContent === id}
                expand={() =>
                  setExpandedContent(expandedContent !== id ? id : false)
                }
                name={`contents.${index}`}
                first={index === 0}
                last={index === contents.length - 1}
                onDown={() => swapContent(index, index + 1)}
                onUp={() => swapContent(index, index - 1)}
                onDelete={() => removeContent(index)}
              />
            );
          })}
          <Button
            variant="outlined"
            type="button"
            onClick={() => {
              appendContent({
                title: "",
                blocks: [],
                references: [],
              });
            }}
          >
            Ajouter une section
          </Button>
          <Typography variant="h5">Références</Typography>
          {!!references.length && (
            <FormRadioGroup
              name="referenceLabel"
              label="Libellé de référence"
              control={control}
              options={[
                {
                  label: "Références juridiques",
                  value: "Références juridiques",
                },
                {
                  label: "Liens utiles",
                  value: "Liens utiles",
                },
              ]}
            />
          )}
          {references.map(({ id }, index) => {
            return (
              <InformationsReference
                key={id}
                control={control}
                name={`references.${index}`}
                first={index === 0}
                last={index === references.length - 1}
                onDown={() => swapReference(index, index + 1)}
                onUp={() => swapReference(index, index - 1)}
                onDelete={() => removeReference(index)}
              />
            );
          })}
          <Button
            variant="outlined"
            type="button"
            onClick={() => {
              appendReference({
                title: "",
                url: "",
                type: "external",
              });
            }}
          >
            Ajouter une référence
          </Button>
          <Stack direction="row" spacing={2} justifyContent="end">
            <Button
              type="button"
              color="error"
              disabled={!onDelete || data?.dismissalProcess}
              onClick={() => onDelete && onDelete()}
            >
              Supprimer
            </Button>
            <Button type="submit">Sauvegarder</Button>
            {onPublish && (
              <LoadingButton
                disabled={!onPublish}
                onClick={async () => {
                  if (data?.id) {
                    setIsPublishing(true);
                    await onPublish();
                    setIsPublishing(false);
                  }
                }}
                loading={isPublishing}
              >
                Publier
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      </form>
    </>
  );
};
