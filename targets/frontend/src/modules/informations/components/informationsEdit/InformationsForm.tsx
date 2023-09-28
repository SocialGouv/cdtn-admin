import { Stack, Button, FormControl, Typography } from "@mui/material";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextField, FormRadioGroup } from "src/components/forms";

import { InformationsResult } from "./Informations.query";
import { Information, informationSchema } from "../../type";
import { InformationsContent } from "./InformationsContent";
import { InformationsReference } from "./InformationsReference";
import { FormCheckbox } from "src/components/forms/Checkbox";

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
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<Information>({
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

  const onSubmit = async (data: Information) => {
    const isValid = await trigger();
    if (isValid) {
      onUpsert(data);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {Object.values(errors).map((error) => (
          <p key={error.message}>
            {error.types?.type} - {error.types?.message} - {error.message}
          </p>
        ))}
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
          <Typography variant="h5">Contenus</Typography>
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
            Ajouter un contenu
          </Button>
          <Typography variant="h5">References</Typography>
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
              variant="contained"
              color="error"
              disabled={!onDelete}
              onClick={() => onDelete && onDelete()}
            >
              Supprimer
            </Button>
            <Button variant="contained" type="submit">
              Sauvegarder
            </Button>
            <Button
              type="button"
              variant="contained"
              color="success"
              disabled={!onPublish}
              onClick={async () => {
                if (onPublish && data?.id) {
                  await onPublish();
                }
              }}
            >
              Publier
            </Button>
          </Stack>
        </Stack>
      </form>
    </>
  );
};
