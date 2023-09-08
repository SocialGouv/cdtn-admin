import { Skeleton, Stack, Button, FormControl } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { FormTextField, FormRadioGroup } from "src/components/forms";
import { BreadcrumbLink } from "src/components/utils";

import { useInformationsQuery } from "./Informations.query";
import { Information } from "../type";

export type EditInformationProps = {
  id: string;
};

type FormData = Information;

export const InformationsEdit = ({ id }: EditInformationProps): JSX.Element => {
  const data = useInformationsQuery({ id });
  const { control, handleSubmit } = useForm<FormData>({
    values: data,
    defaultValues: {
      title: "",
      metaTitle: "",
      description: "",
      metaDescription: "",
      intro: "",
      sectionDisplayMode: "accordion",
      referenceLabel: "Références juridiques",
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
      <BreadcrumbLink href={"/informations"}>Informations</BreadcrumbLink>
      <BreadcrumbLink>{data?.title}</BreadcrumbLink>
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
                  rules={{ required: true }}
                  multiline
                  fullWidth
                />
              </FormControl>
              {data && (
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
              {data && (
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
              <Stack direction="row" spacing={2} justifyContent="end">
                <Button variant="contained" type="submit">
                  Sauvegarder
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </>
  );
};
