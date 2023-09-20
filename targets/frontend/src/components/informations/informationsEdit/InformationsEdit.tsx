import { Skeleton, Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BreadcrumbLink } from "src/components/utils";

import { useInformationsQuery } from "./Informations.query";
import {
  setDefaultData,
  useEditInformationMutation,
} from "./editInformation.mutation";
import { Information } from "../type";
import { InformationsForm } from "./InformationsForm";
import { useDeleteInformationMutation } from "./deleteInformation.mutation";

export type EditInformationProps = {
  id?: string;
};

export const InformationsEdit = ({ id }: EditInformationProps): JSX.Element => {
  const { data, fetching } = useInformationsQuery({ id });
  const onUpsert = useEditInformationMutation();
  const onDelete = useDeleteInformationMutation();

  useEffect(() => {
    if (!fetching && data) {
      setDefaultData(data);
    }
  }, [fetching]);

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
          {!fetching && (
            <InformationsForm
              data={data}
              onDelete={onDelete}
              onUpsert={onUpsert}
            ></InformationsForm>
          )}
        </Stack>
      </Stack>
    </>
  );
};
