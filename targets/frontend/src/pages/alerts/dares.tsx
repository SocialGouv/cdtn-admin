import React, { useMemo } from "react";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function AlertPage(): JSX.Element {
  return <Layout title="Gestion des alertes">Chargement...</Layout>;
}

export default withCustomUrqlClient(withUserProvider(AlertPage));

export const getServerSideProps = async () => {
  console.log("ok");
  return {
    props: {
      status: "ok",
    },
  };
};
