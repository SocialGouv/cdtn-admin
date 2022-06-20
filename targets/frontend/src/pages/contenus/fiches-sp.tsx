/** @jsxImportSource theme-ui */

import { createContext, useState } from "react";
import { FichesServicePublicContainer } from "src/components/fiches-sp/fichesSpContainer";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export const SelectionContext = createContext([
  [],
  () => {
    return;
  },
]);

function FichesServicePublicPage() {
  const [selectedItems, setSelectedItems] = useState([]);

  return (
    <SelectionContext.Provider
      value={[selectedItems, (...args) => setSelectedItems(args)]}
    >
      <Layout title="Fiches service-public.fr">
        <FichesServicePublicContainer />
      </Layout>
    </SelectionContext.Provider>
  );
}

export default withCustomUrqlClient(withUserProvider(FichesServicePublicPage));
