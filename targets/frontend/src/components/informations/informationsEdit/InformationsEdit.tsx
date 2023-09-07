import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { Skeleton, Stack, Typography, Button } from "@mui/material";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "src/components/forms";
import { BreadcrumbLink } from "src/components/utils";

import { useInformationsQuery } from "./Informations.query";
import { Information } from "../type";

export type EditInformationProps = {
  id: string;
};

type FormData = Information;

export const InformationsEdit = ({ id }: EditInformationProps): JSX.Element => {
  const data = useInformationsQuery({ id });
  let defaultValues = {};
  if (data !== "not_found" && data !== "error") {
    defaultValues = data?.information ?? {};
  }
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues,
  });

  if (data === undefined) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  if (data === "not_found") {
    return (
      <>
        <Stack alignItems="center" spacing={2}>
          <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
          <Typography variant="h5" component="h3" color="error">
            Page d&apos;information non trouvée
          </Typography>
          <Link href={"/informations"}>
            Retour à la liste des pages informations
          </Link>
        </Stack>
      </>
    );
  }

  if (data === "error") {
    return (
      <>
        <Stack alignItems="center" spacing={2}>
          <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
          <Typography variant="h5" component="h3" color="error">
            Une erreur est survenue
          </Typography>
          <Link href={"/informations"}>
            Retour à la liste des pages informations
          </Link>
        </Stack>
      </>
    );
  }

  const Header = () => (
    <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
      <BreadcrumbLink href={"/informations"}>Informations</BreadcrumbLink>
      <BreadcrumbLink>{data?.information?.title}</BreadcrumbLink>
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
              <FormTextField
                name="title"
                control={control}
                label="Titre"
                rules={{ required: true }}
                multiline
                fullWidth
              />
              <FormTextField
                name="title"
                control={control}
                label="Titre"
                rules={{ required: true }}
                multiline
                fullWidth
              />
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
