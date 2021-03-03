/** @jsxImportSource theme-ui */

import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Button } from "src/components/button";
import { DocumentList } from "src/components/documents/List";
import {
  DEFAULT_ITEMS_PER_PAGE,
  SearchFilters,
} from "src/components/documents/SearchFilters";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { usePrevious } from "src/hooks";
import { Card, Flex, Message } from "theme-ui";
import { useMutation, useQuery } from "urql";

const searchDocumentQuery = `
query documents($source: String, $search: String!, $published: [Boolean!]!, $offset: Int = 0, $limit: Int = 50) {
  documents(where: {
    _not: {
      document: {_has_key: "split"}
    }
    _and: {
      source: {_eq: $source, _neq: "code_du_travail"}
      title: {_ilike: $search}
      is_published: {_in: $published}
    }
  },
  offset: $offset, limit: $limit, order_by: [{source: asc}, {slug: asc}]) {
    id: initial_id
    cdtnId: cdtn_id
    title
    source
    isPublished: is_published
  }

  documents_aggregate(where: {
    _not: {
      document: {_has_key: "split"}
    }
    _and: {
      source: {_eq: $source, _neq: "code_du_travail"}
      title: {_ilike: $search},
      is_published: {_in: $published}

    }
  }) {
    aggregate {
      count
    }
  }
}
`;

const updatePublicationMutation = `
mutation publication($cdtnId:String!, $isPublished:Boolean!) {
  document: update_documents_by_pk(
    _set: {is_published: $isPublished}
    pk_columns: { cdtn_id: $cdtnId }
  ) {
    cdtnId:cdtn_id, isPublished:is_published
  }
}
`;

export function getInitialFilterValues(query) {
  return {
    itemsPerPage: parseInt(query.itemsPerPage, 10) || DEFAULT_ITEMS_PER_PAGE,
    page: parseInt(query.page, 10) || 0,
    published: query.published || "all",
    q: query.q?.trim() || "",
    source: query.source || null,
  };
}
export function DocumentsPage() {
  const router = useRouter();
  const context = useMemo(() => ({ additionalTypenames: ["documents"] }), []);

  const [updatedPublishDoc] = useState(new Map());

  const [, updatePublication] = useMutation(updatePublicationMutation);

  const updatePublicationStatus = useCallback(
    (docEntries) => {
      docEntries.forEach(([cdtnId, isPublished]) => {
        updatePublication({ cdtnId, isPublished });
      });
      updatedPublishDoc.clear();
    },
    [updatePublication, updatedPublishDoc]
  );

  const updateUrl = useCallback(
    (filterValues) => {
      console.log("updateUrl search");
      // we reset changed published value if search critera change
      updatedPublishDoc.clear();
      const query = { ...filterValues, page: 0 };
      router.push({ pathname: router.route, query }, undefined, {
        shallow: true,
      });
    },
    [router, updatedPublishDoc]
  );

  const initialFilterValues = getInitialFilterValues(router.query);

  const [result] = useQuery({
    context,
    query: searchDocumentQuery,
    variables: {
      limit: initialFilterValues.itemsPerPage,
      offset: initialFilterValues.page * initialFilterValues.itemsPerPage,
      published:
        initialFilterValues.published === "yes"
          ? [true]
          : initialFilterValues.published === "no"
          ? [false]
          : [true, false],
      search: `%${initialFilterValues.q}%`,
      source: initialFilterValues.source || null,
    },
  });

  const { fetching, error, data } = result;
  const previousDocuments = usePrevious(data?.documents);
  console.log(
    "document page render",
    fetching,
    data,
    data?.documents === previousDocuments
  );

  if (error) {
    return (
      <Layout title="Contenus">
        <Message variant="primary">{error.message}</Message>
      </Layout>
    );
  }

  return (
    <Layout title="Contenus">
      <Stack>
        <Flex sx={{ justifyContent: "flex-end" }}>
          <Link href="/contenus/create/" passHref>
            <Button as="a" size="small" outline variant="secondary">
              <IoMdAdd
                sx={{
                  height: "iconSmall",
                  mr: "xxsmall",
                  width: "iconSmall",
                }}
              />
              Ajouter un contenu
            </Button>
          </Link>
        </Flex>
        {fetching ? (
          <>
            <Card sx={{ position: "sticky", top: 0 }} bg="white">
              <SearchFilters
                initialValues={initialFilterValues}
                onSearchUpdate={updateUrl}
              />
            </Card>
            chargement...
          </>
        ) : data.documents.length ? (
          <>
            <DocumentList
              documents={data.documents}
              onSearchUpdate={updateUrl}
              onUpdatePublication={updatePublicationStatus}
              updatedPublishDoc={updatedPublishDoc}
            />
            <Pagination
              count={data.documents_aggregate.aggregate.count}
              currentPage={initialFilterValues.page}
              pageSize={initialFilterValues.itemsPerPage}
            />
          </>
        ) : (
          <p>Pas de résultats.</p>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentsPage));
