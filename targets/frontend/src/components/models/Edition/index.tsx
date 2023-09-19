import { FormControl, Skeleton, Stack } from "@mui/material";
import { BreadcrumbLink } from "src/components/utils";
import { FormEditionField, FormTextField } from "src/components/forms";
import { useForm } from "react-hook-form";
import { useListModelQuery } from "./model.query";
import { Model } from "../type";
import React from "react";

type Props = {
  id: string;
};

type FormData = Model;

export const ModelEdition = ({ id }: Props): React.ReactElement => {
  const data = useListModelQuery({ id });

  const { control, handleSubmit } = useForm<FormData>({
    values: data,
    defaultValues: {
      updatedAt: "",
      title: "",
      description: "",
      fileName: "",
    },
  });

  if (!data) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  const Header = () => (
    <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
      <BreadcrumbLink href={"/modeles"}>Modèles de courrier</BreadcrumbLink>
      <BreadcrumbLink>{data.title}</BreadcrumbLink>
    </ol>
  );

  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <Header />
        <Stack mt={4} spacing={2}>
          <form>
            <Stack spacing={4}>
              <FormControl>
                <FormTextField
                  name="updateAt"
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
                <FormEditionField
                  label="Description"
                  name="description"
                  control={control}
                  rules={{
                    required: true,
                  }}
                />
              </FormControl>
              <FormControl>
                <FormTextField
                  name="fileName"
                  control={control}
                  label="Fichier"
                  rules={{ required: true }}
                  fullWidth
                />
              </FormControl>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </>
  );
};
