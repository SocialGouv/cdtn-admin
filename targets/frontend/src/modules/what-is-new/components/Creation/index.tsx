import { Stack } from "@mui/material";
import React from "react";
import { useRouter } from "next/router";

import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { WhatIsNewMonthForm } from "../Common";
import { useWhatIsNewMonthInsertMutation } from "./month.mutation";
import type { WhatIsNewMonth } from "../../type";

export const WhatIsNewCreation = (): React.ReactElement => {
  const router = useRouter();
  const insert = useWhatIsNewMonthInsertMutation();

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/what-is-new"}>Quoi de neuf ?</BreadcrumbLink>
      <BreadcrumbLink>Création d&apos;un nouveau mois</BreadcrumbLink>
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
          onUpsert={async (data: WhatIsNewMonth) => {
            const { id } = await insert(data);
            router.push(`/what-is-new/${id}`);
          }}
        />
      </Stack>
    </Stack>
  );
};
