import { Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { generateInitialId } from "@shared/utils";
import { NewsForm } from "../Common";
import { useNewsInsertMutation } from "./news.mutation";

export const NewsCreation = (): React.ReactElement => {
  const router = useRouter();
  const insert = useNewsInsertMutation();
  // Généré une fois pour toutes : un envoi répété retombe sur la même actualité.
  const [newsId] = useState(generateInitialId);

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/news"}>Actualités</BreadcrumbLink>
      <BreadcrumbLink>Création d&apos;une nouvelle actualité</BreadcrumbLink>
    </Breadcrumb>
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
          <NewsForm
            onUpsert={async (props) => {
              const { id } = await insert({ ...props, id: newsId });
              router.push(`/news/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
