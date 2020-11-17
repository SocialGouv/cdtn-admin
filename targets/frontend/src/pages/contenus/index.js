/** @jsx jsx  */

import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { MdSearch } from "react-icons/md";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { theme } from "src/theme";
import { Card, Input, jsx, Label, Message, NavLink, Select } from "theme-ui";
import { useMutation, useQuery } from "urql";

const searchDocumentQuery = `
query documents($source: String, $search: String!, $offset: Int = 0, $limit: Int = 50) {
  documents(
    where: {
      _and: {
        source: {_eq: $source}
        title: {_ilike: $search }
      }
    }
    offset: $offset,
    limit: $limit,
    order_by:[{source: asc}, {slug: asc}]
  )
  {
    id:initial_id
    cdtnId:cdtn_id
    title
    source
    isPublished: is_published
  }

	documents_aggregate(
    where: {
      _and: {
        source: {_eq: $source},
        title: {_ilike: $search}
      }
    }
  )
  {
    aggregate{count}
  }
  sources: documents_aggregate(distinct_on: source) {
    nodes{
      source
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

const documentSources = [
  [SOURCES.CCN, getLabelBySource(SOURCES.CCN)],
  [SOURCES.CDT, getLabelBySource(SOURCES.CDT)],
  [SOURCES.CONTRIBUTIONS, getLabelBySource(SOURCES.CONTRIBUTIONS)],
  [SOURCES.SHEET_MT_PAGE, getLabelBySource(SOURCES.SHEET_MT)],
  [SOURCES.SHEET_SP, getLabelBySource(SOURCES.SHEET_SP)],
  [SOURCES.EDITORIAL_CONTENT, getLabelBySource(SOURCES.EDITORIAL_CONTENT)],
  [SOURCES.THEMATIC_FILES, getLabelBySource(SOURCES.THEMATIC_FILES)],
  [SOURCES.LETTERS, getLabelBySource(SOURCES.LETTERS)],
  [SOURCES.EXTERNALS, getLabelBySource(SOURCES.EXTERNALS)],
  [SOURCES.TOOLS, getLabelBySource(SOURCES.TOOLS)],
];

const DEFAULT_ITEMS_PER_PAGE = 25;

export function DocumentsPage() {
  const router = useRouter();

  const context = useMemo(() => ({ additionalTypenames: ["documents"] }), []);

  const [, updatePublication] = useMutation(updatePublicationMutation);

  const { register, handleSubmit } = useForm();

  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const currentPage = parseInt(router.query.page, 10) || 0;

  const [search, setSearch] = useState({
    source: router.query.source || null,
    value: router.query.q?.trim() || "",
  });

  const onSearchSubmit = ({ q, source }) => {
    setSearch({
      source: source || null,
      value: q || "",
    });
  };

  function updateUrl(event) {
    const query = { ...router.query };
    query[event.target.name] = event.target.value.trim();
    setSearch({
      source: query.source || null,
      value: query.q || "",
    });
    router.push({ pathname: router.route, query });
  }

  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: {
      limit: itemsPerPage,
      offset: currentPage * itemsPerPage,
      search: `%${search.value}%`,
      source: search.source,
    },
  });

  function updatePublish(cdtnId, checked) {
    return updatePublication({ cdtnId, isPublished: checked }, context);
  }

  const { fetching, error, data } = result;

  function isSourceDisabled(source) {
    return (
      data?.sources.nodes.find((node) => node.source === source) === undefined
    );
  }

  if (error) {
    return (
      <Layout title="Contenus">
        <Message variant="primary">{error.message}</Message>
      </Layout>
    );
  }

  return (
    <Layout title="Contenus">
      <Card sx={{ position: "sticky", top: 0 }} bg="white">
        <form onSubmit={handleSubmit(onSearchSubmit)}>
          <Inline>
            <Input
              sx={{ flex: 1 }}
              name="q"
              type="search"
              placeholder="titre..."
              defaultValue={search.value}
              ref={register}
              onBlur={updateUrl}
            />
            <Select
              name="source"
              ref={register}
              onChange={updateUrl}
              defaultValue={search.source}
            >
              <option value="">toutes les sources</option>
              {documentSources.map(([source, label]) => (
                <option
                  key={source}
                  value={source}
                  disabled={isSourceDisabled(source)}
                >
                  {label}
                </option>
              ))}
            </Select>
            <Button>
              <MdSearch /> Rechercher
            </Button>
            <div />
            <Label htmlFor="itemsPerPage">Documents par page</Label>
            <Select
              sx={{ width: "4rem" }}
              name="itemsPerPage"
              id="itemsPerPage"
              defaultValue={itemsPerPage}
              onChange={(event) =>
                setItemsPerPage(
                  Number.parseInt(event.target.value, 10) ||
                    DEFAULT_ITEMS_PER_PAGE
                )
              }
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={`items-per-page${size}`} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Inline>
        </form>
      </Card>

      {fetching ? (
        "chargement..."
      ) : data.documents.length ? (
        <>
          <table>
            <thead>
              <tr>
                <th sx={{ textAlign: "left" }}>Publié</th>
                <th sx={{ textAlign: "left" }}>Document</th>
              </tr>
            </thead>
            <tbody>
              {data.documents.map((doc) => (
                <DocumentRow
                  key={doc.cdtnId}
                  document={doc}
                  updatePublish={updatePublish}
                />
              ))}
            </tbody>
          </table>
          <Pagination
            count={data.documents_aggregate.aggregate.count}
            currentPage={currentPage}
            pageSize={itemsPerPage}
          />
        </>
      ) : (
        <p>Pas de résultats.</p>
      )}
    </Layout>
  );
}

const DocumentRow = memo(function _DocumentRow({
  document: { cdtnId, source, title, isPublished },
  updatePublish,
}) {
  const [isChecked, setChecked] = useState(isPublished);
  return (
    <tr>
      <td sx={{ padding: "0.4em" }}>
        <input
          type="checkbox"
          sx={{
            cursor: "pointer",
            display: "block",
            height: "1.2rem",
            m: "0 0 0 small",
            padding: 0,
            width: "1.2rem",
          }}
          checked={isChecked}
          onChange={() => {
            setChecked(!isChecked);
            updatePublish(cdtnId, !isChecked);
          }}
        />
      </td>
      <td>
        <Link href={`/contenus/${cdtnId}`} passHref>
          <NavLink>
            <span
              sx={{
                color: isChecked ? theme.colors.link : theme.colors.muted,
              }}
            >
              {source} › {title}
            </span>
          </NavLink>
        </Link>
      </td>
    </tr>
  );
});

export default withCustomUrqlClient(withUserProvider(DocumentsPage));
