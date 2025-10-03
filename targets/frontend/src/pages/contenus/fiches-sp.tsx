import { createContext, useState } from "react";
import { FichesServicePublicContainer } from "src/components/fiches-sp/fichesSpContainer";
import { Layout } from "src/components/layout/auth.layout";

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
      <Layout title="Fiches service-public.gouv.fr">
        <FichesServicePublicContainer />
      </Layout>
    </SelectionContext.Provider>
  );
}

export default FichesServicePublicPage;
