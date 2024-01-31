import { AlertColor, Button, FormControl, Stack } from "@mui/material";
import { FormSwitch, FormTextField } from "src/components/forms";

import { useForm } from "react-hook-form";
import { Agreement, agreementSchema } from "../../type";
import React, { useState } from "react";
import { SnackBar } from "src/components/utils/SnackBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type FormData = Partial<z.infer<typeof agreementSchemaUpsert>>;

export type FormDataResult = Required<Omit<Agreement, "updatedAt">>;

type Props = {
  agreement?: Agreement;
  onUpsert: (props: FormDataResult) => Promise<void>;
  onPublish?: () => Promise<void>;
};

const defaultValues: FormData = {
  name: "",
  shortName: "",
  isSupported: false,
};

export const agreementSchemaUpsert = agreementSchema.omit({ updatedAt: true });

export const AgreementForm = ({
  agreement,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      ...agreement,
    },
    resolver: zodResolver(agreementSchemaUpsert),
    shouldFocusError: true,
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (newData: FormData) => {
    try {
      await onUpsert({
        id: newData.id!,
        isSupported: newData.isSupported!,
        name: newData.name!,
        shortName: newData.shortName!,
        kali_id: newData.kali_id!,
        legifranceUrl: newData.legifranceUrl!,
        rootText: newData.rootText!,
        workerNumber: newData.workerNumber!,
      });
      setSnack({
        open: true,
        severity: "success",
        message: agreement
          ? "La convention collective a été modifiée avec succès"
          : "La convention collective a été créée avec succès",
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      setSnack({
        open: true,
        severity: "error",
        message:
          "Une erreur est survenue lors de la sauvegarde de la convention collective",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        {agreement && (
          <FormControl>
            <FormTextField
              name="updatedAt"
              control={control}
              label="Date mise à jour"
              disabled
              labelFixed
            />
          </FormControl>
        )}
        <FormControl>
          <FormTextField
            name="id"
            control={control}
            label="IDCC"
            disabled={agreement !== undefined}
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="name"
            control={control}
            label="Titre"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="shortName"
            control={control}
            label="Titre court"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="legifranceUrl"
            control={control}
            label="Lien legifrance"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="kali_id"
            control={control}
            label="Identifiant legifrance (KALICONT)"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="rootText"
            control={control}
            label="Texte de base legifrance (KALITEXT)"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="workerNumber"
            control={control}
            label="Nombre de salariés"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormSwitch
            name="isSupported"
            control={control}
            label="Supporté par le CDTN ?"
          />
        </FormControl>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" type="submit">
            {agreement ? "Sauvegarder" : "Créer"}
          </Button>
          {onPublish && (
            <Button
              type="button"
              variant="contained"
              color="success"
              onClick={async () => {
                if (onPublish) {
                  try {
                    await onPublish();
                    setSnack({
                      open: true,
                      severity: "success",
                      message: "La convention collective a été publiée",
                    });
                  } catch (e: any) {
                    setSnack({
                      open: true,
                      severity: "error",
                      message: `Erreur lors de la publication de la convention collective: ${e.message}`,
                    });
                  }
                }
              }}
            >
              Publier
            </Button>
          )}
        </Stack>
      </Stack>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </form>
  );
};
