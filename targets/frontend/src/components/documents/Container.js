import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import { IoMdAdd } from "react-icons/io";
import { useSelectionContext } from "src/pages/contenus";
import { Card, Flex, Message } from "theme-ui";
import { useMutation, useQuery } from "urql";

import { Stack } from "../layout/Stack";
import { Pagination } from "../pagination";
import { DocumentsListActions } from "./Actions";
import { DocumentList } from "./List";
import { SearchFilters } from "./SearchFilters";

export function DocumentListContainer({ initialFilterValues }) {
  const router = useRouter();
  const context = useMemo(() => ({ additionalTypenames: ["documents"] }), []);
  const [, setSelectedItems] = useSelectionContext();
  const [, updatePublication] = useMutation(updatePublicationMutation);
  const updatePublicationStatus = useCallback(
    (docEntries) => {
      docEntries.forEach(([cdtnId, isPublished]) => {
        updatePublication({ cdtnId, isPublished });
      });
      setSelectedItems({});
    },
    [updatePublication, setSelectedItems]
  );

  const updateUrl = useCallback(
    (filterValues) => {
      // we reset changed published value if search critera change
      setSelectedItems({});
      const query = { ...filterValues, page: 0 };
      router.push({ pathname: router.route, query }, undefined, {
        shallow: true,
      });
    },
    [router, setSelectedItems]
  );

  const [result] = useQuery({
    context,
    query: searchDocumentQuery,
    variables: {
      available:
        initialFilterValues.available === "yes"
          ? [true]
          : initialFilterValues.available === "no"
          ? [false]
          : [true, false],
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

  if (error) {
    return <Message variant="primary">{error.message}</Message>;
  }
  return (
    <Stack>
      <Flex sx={{ justifyContent: "flex-end" }}>
        <Link
          href="/contenus/create/"
          passHref
          style={{ textDecoration: "none" }}
        >
          <Button size="small" variant="secondary">
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
      <Card sx={{ position: "sticky", top: 0 }} bg="white">
        <SearchFilters
          initialValues={initialFilterValues}
          onSearchUpdate={updateUrl}
        />
      </Card>
      {fetching ? (
        <>chargement...</>
      ) : data.documents.length ? (
        <form>
          <DocumentList documents={data.documents} />
          <DocumentsListActions onUpdatePublication={updatePublicationStatus} />
          <Pagination
            count={data.documents_aggregate.aggregate.count}
            currentPage={initialFilterValues.page}
            pageSize={initialFilterValues.itemsPerPage}
          />
        </form>
      ) : (
        <p>Pas de résultats.</p>
      )}
    </Stack>
  );
}

DocumentListContainer.propTypes = {
  initialFilterValues: PropTypes.shape({
    available: PropTypes.oneOf(["all", "yes", "no"]),
    itemsPerPage: PropTypes.number,
    page: PropTypes.number,
    published: PropTypes.oneOf(["all", "yes", "no"]),
    q: PropTypes.string,
    source: PropTypes.string,
  }),
};

const searchDocumentQuery = `
query documents($source: String, $search: String!, $published: [Boolean!]!, $available: [Boolean!]!, $offset: Int = 0, $limit: Int = 50) {
  documents(where: {
    _not: {
      document: {_has_key: "split"}
    }
    _and: {
      source: {_eq: $source, _neq: "code_du_travail"}
      title: {_ilike: $search}
      is_published: {_in: $published}
      is_available: {_in: $available}
    }
  },
  offset: $offset, limit: $limit, order_by: [{source: asc}, {slug: asc}]) {
    id: initial_id
    cdtnId: cdtn_id
    title
    source
    isPublished: is_published
    isAvailable: is_available
  }

  documents_aggregate(where: {
    _not: {
      document: {_has_key: "split"}
    }
    _and: {
      source: {_eq: $source, _neq: "code_du_travail"}
      title: {_ilike: $search},
      is_published: {_in: $published}
      is_available: {_in: $available}
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
