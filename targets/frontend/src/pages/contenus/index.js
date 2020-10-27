import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosSearch } from "react-icons/io";
import { Button } from "src/components/button";
/** @jsx jsx  */
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Card, Input, jsx, Message, NavLink, Select } from "theme-ui";
import { useQuery } from "urql";

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

export function DocumentsPage() {
  const { register, handleSubmit } = useForm();
  const [search, setSearch] = useState({ source: null, value: "" });
  const [offset, setOffset] = useState(0);

  const onSearchSubmit = ({ search, source }) => {
    setSearch({
      source: source ? source : null,
      value: search,
    });
  };

  const ITEMS_PER_PAGE = 50;

  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: {
      limit: ITEMS_PER_PAGE,
      offset,
      search: `%${search.value}%`,
      source: search.source,
    },
  });

  const { fetching, error, data } = result;

  function isSourceDisabled(source) {
    return (
      data.sources.nodes.find((node) => node.source === source) === undefined
    );
  }

  if (fetching) {
    return <Layout title="Contenus">chargement...</Layout>;
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
      <Card>
        <form onSubmit={handleSubmit(onSearchSubmit)}>
          <Inline>
            <Input
              sx={{ flex: 1 }}
              name="search"
              type="search"
              placeholder="titre..."
              defaultValue={search.value}
              ref={register}
            />
            <Select name="source" ref={register} defaultValue={search.source}>
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
              <IoIosSearch /> Rechercher
            </Button>
          </Inline>
        </form>
      </Card>
      {data.documents.length ? (
        <>
          <ul>
            {data.documents.map((doc) => (
              <li key={doc.cdtnId}>
                <Link
                  href="/contenus/[id]"
                  as={`/contenus/${doc.cdtnId}`}
                  passHref
                >
                  <NavLink>
                    {doc.source} › {doc.title}
                  </NavLink>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            count={data.documents_aggregate.aggregate.count}
            offset={offset}
            pageSize={ITEMS_PER_PAGE}
            onChange={({ offset }) => setOffset(offset)}
          />
        </>
      ) : (
        <p>Pas de résultats.</p>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentsPage));
