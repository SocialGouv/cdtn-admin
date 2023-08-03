import { createContext, useState } from "react";
import { FichesServicePublicContainer } from "src/components/fiches-sp/fichesSpContainer";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export type SelectionContextInterface = {
  selectedItems: string[];
  setSelectedItems: (selected: string[]) => void;
};

export const SelectionContext = createContext<SelectionContextInterface>({
  selectedItems: [],
  setSelectedItems: () => {
    return;
  },
});

function FichesServicePublicPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <SelectionContext.Provider
      value={{
        selectedItems,
        setSelectedItems,
      }}
    >
      <Layout title="Fiches service-public.fr">
        <FichesServicePublicContainer />
      </Layout>
    </SelectionContext.Provider>
  );
}

export default withCustomUrqlClient(withUserProvider(FichesServicePublicPage));
