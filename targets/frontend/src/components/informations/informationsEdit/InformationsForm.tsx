import {
  Skeleton,
  Stack,
  Button,
  FormControl,
  Typography,
  AlertColor,
  Modal,
  Box,
} from "@mui/material";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FormTextField, FormRadioGroup } from "src/components/forms";
import { useRouter } from "next/router";

import { InformationsResult } from "./Informations.query";
import { EditInformationMutationExecute } from "./editInformation.mutation";
import { DeleteInformationMutationResult } from "./deleteInformation.mutation";
import { Information } from "../type";
import { InformationsContent } from "./InformationsContent";
import { InformationsReference } from "./InformationsReference";
import { SnackBar } from "src/components/utils/SnackBar";

export type InformationsFormProps = {
  data?: InformationsResult;
  onUpsert: EditInformationMutationExecute;
  onDelete: DeleteInformationMutationResult;
};

export const InformationsForm = ({
  data,
  onUpsert,
  onDelete,
}: InformationsFormProps): JSX.Element => {
  const { control, handleSubmit, trigger } = useForm<Information>({
    defaultValues: data ?? { title: "" },
  });
  const router = useRouter();

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  const [modalDelete, setModalDelete] = useState<boolean>(false);
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
    if (!isValid) {
      return setSnack({
        open: true,
        severity: "error",
        message: "Formulaire invalide",
      });
    }

    try {
      await onUpsert(data);
      setSnack({
        open: true,
        severity: "success",
        message: "La page information a été modifiée",
      });
    } catch (e: any) {
      setSnack({ open: true, severity: "error", message: e.message });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              rules={{ required: true }}
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="metaTitle"
              control={control}
              label="Titre Meta"
              rules={{ required: true }}
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="description"
              control={control}
              label="Description"
              rules={{ required: true }}
              multiline
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormTextField
              name="metaDescription"
              control={control}
              label="Description Meta"
              rules={{ required: true }}
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
              variant="contained"
              color="error"
              onClick={() => setModalDelete(true)}
            >
              Supprimer
            </Button>
            <Button variant="contained" type="submit">
              Sauvegarder
            </Button>
            <Button variant="contained" color="success">
              Publier
            </Button>
          </Stack>
        </Stack>
        <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
        <Modal
          open={modalDelete}
          onClose={() => setModalDelete(false)}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
        >
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              pt: 2,
              px: 4,
              pb: 3,
            }}
          >
            <h2>Suppression</h2>
            <p>
              Etes-vous certains de vouloir supprimer cette page
              d&apos;information ?
            </p>
            <Stack direction="row" spacing={2} justifyContent="end">
              <Button onClick={() => setModalDelete(false)}>Annuler</Button>
              <Button
                onClick={async () => {
                  if (!data.id) return;
                  await onDelete(data.id);
                  router.push("/informations");
                }}
              >
                Oui
              </Button>
            </Stack>
          </Box>
        </Modal>
      </form>
    </>
  );
};
