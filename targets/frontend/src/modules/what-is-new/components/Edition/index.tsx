import React from "react";
import { Alert, Skeleton, Stack } from "@mui/material";
import { gql, useMutation, useQuery } from "urql";

import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { WhatIsNewMonthForm } from "../Common";
import type { WhatIsNewMonth } from "../../type";
import { usePublishMutation } from "../../../documents/components/publish.mutation";

type Props = {
  id: string;
};

const selectWhatIsNewMonthQuery = gql`
  query SelectWhatIsNewMonth($id: uuid!) {
    month: what_is_new_months_by_pk(id: $id) {
      id
      createdAt
      updatedAt
      period
      label
      shortLabel
      weeks
    }
  }
`;

type QueryResult = {
  month: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    period: string;
    label: string;
    shortLabel: string;
    weeks: unknown;
  } | null;
};

const updateWhatIsNewMonthMutation = gql`
  mutation UpdateWhatIsNewMonth(
    $id: uuid!
    $patch: what_is_new_months_set_input!
  ) {
    update_what_is_new_months_by_pk(pk_columns: { id: $id }, _set: $patch) {
      id
      updatedAt
    }
  }
`;

type UpdateMutationResult = {
  update_what_is_new_months_by_pk: { id: string; updatedAt?: string } | null;
};

type UpdateMutationVariables = {
  id: string;
  patch: {
    period?: string;
    label?: string;
    shortLabel?: string;
    weeks?: unknown;
  };
};

export const WhatIsNewEdition = ({ id }: Props): React.ReactElement => {
  const [{ data, fetching, error }, reexecuteQuery] = useQuery<QueryResult>({
    query: selectWhatIsNewMonthQuery,
    variables: { id },
    requestPolicy: "cache-and-network",
  });

  const [, executeUpdate] = useMutation<
    UpdateMutationResult,
    UpdateMutationVariables
  >(updateWhatIsNewMonthMutation);

  const publish = usePublishMutation();

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération du mois « Quoi de neuf ? ».
        <p>
          <code>{JSON.stringify(error)}</code>
        </p>
      </Alert>
    );
  }

  if (!data && fetching) {
    return <Skeleton />;
  }

  if (!data?.month) {
    return (
      <Alert severity="error">Ce mois « Quoi de neuf ? » n’existe plus.</Alert>
    );
  }

  const month: WhatIsNewMonth = {
    id: data.month.id,
    createdAt: data.month.createdAt,
    updatedAt: data.month.updatedAt,
    period: data.month.period,
    label: data.month.label,
    shortLabel: data.month.shortLabel,
    weeks: (data.month.weeks as any) ?? [],
  };

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/what-is-new"}>Quoi de neuf ?</BreadcrumbLink>
      <BreadcrumbLink>{month.label}</BreadcrumbLink>
    </Breadcrumb>
  );

  return (
    <Stack
      alignItems="stretch"
      direction="column"
      justifyContent="start"
      spacing={2}
    >
      <Header />
      <Stack mt={4} spacing={2}>
        <WhatIsNewMonthForm
          month={month}
          onUpsert={async (newData) => {
            const result = await executeUpdate({
              id: month.id as string,
              patch: {
                period: newData.period,
                label: newData.label,
                shortLabel: newData.shortLabel,
                weeks: newData.weeks as unknown,
              },
            });

            if (result.error) {
              throw new Error(result.error.message);
            }
            reexecuteQuery({ requestPolicy: "network-only" });
          }}
          onPublish={async () => {
            await publish({
              id: month.id as string,
              source: "what_is_new",
            });
            reexecuteQuery({ requestPolicy: "network-only" });
          }}
        />
      </Stack>
    </Stack>
  );
};
