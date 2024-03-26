import { useRouter } from "next/router";
import { createContext, useContext, useState } from "react";
import { DocumentListContainer } from "src/components/documents/Container";
import { DEFAULT_ITEMS_PER_PAGE } from "src/components/documents/SearchFilters";
import { Layout } from "src/components/layout/auth.layout";

type ContentQueryParam = {
  available?: string;
  itemsPerPage: string;
  page: string;
  published?: string;
  q?: string;
  source?: string;
};

export function getInitialFilterValues(query: ContentQueryParam) {
  return {
    available: query.available || "yes",
    itemsPerPage: parseInt(query.itemsPerPage, 10) || DEFAULT_ITEMS_PER_PAGE,
    page: parseInt(query.page, 10) || 0,
    published: query.published || "all",
    q: query.q?.trim() || "",
    source: query.source || null,
  };
}

const SelectionContext = createContext([
  {},
  () => {
    return;
  },
]);

export const useSelectionContext = function () {
  return useContext(SelectionContext);
};

export function DocumentsPage() {
  const router = useRouter();

  const initialFilterValues = getInitialFilterValues(
    router.query as ContentQueryParam
  );
  const [selectedItems, setSelectedItems] = useState({});
  return (
    <SelectionContext.Provider value={[selectedItems, setSelectedItems]}>
      <Layout title="Contenus">
        <DocumentListContainer initialFilterValues={initialFilterValues} />
      </Layout>
    </SelectionContext.Provider>
  );
}

export default DocumentsPage;
