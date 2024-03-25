import React from "react";
import { Layout } from "src/components/layout/auth.layout";
import { Export } from "src/modules/export";

export function UpdatePage(): JSX.Element {
  return (
    <Layout title="Mises à jour des environnements">
      <Export />
    </Layout>
  );
}

export default UpdatePage;
