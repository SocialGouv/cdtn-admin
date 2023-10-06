import React from "react";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Export } from "src/modules/export";

export function UpdatePage(): JSX.Element {
  return (
    <Layout title="Mises à jour des environnements">
      <Export />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UpdatePage));
