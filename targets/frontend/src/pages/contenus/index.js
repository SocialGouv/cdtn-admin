import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosSearch } from "react-icons/io";
import { IconButton } from "src/components/button";
/** @jsx jsx  */
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Card, Input, jsx, Message, NavLink, Select } from "theme-ui";
import { useQuery } from "urql";

const searchDocumentQuery = `

query documents($source: String, $search: String!) {
  sources: documents_aggregate(distinct_on: source) {
    nodes{
      source
    }
  }
  documents(where: {
    _and: {
      source: {_eq: $source}
    	title: {_ilike: $search }
    }
  }
  order_by:[{source: asc}, {slug: asc}])
  {
    id:initial_id
    cdtnId:cdtn_id
    title
    source
  }
}
`;

export function DocumentsPage() {
  const { register, handleSubmit } = useForm();
  const [search, setSearch] = useState({ search: "%%", source: null });
  const onSearchSubmit = ({ search, source }) => {
    console.log({ source: source ? source : null });
    setSearch({
      search: `%${search}%`,
      source: source ? source : null,
    });
  };
  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: search,
  });
  const { fetching, error, data } = result;

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
  function isSourceDisabled(source) {
    return (
      data.sources.nodes.find((node) => node.source === source) === undefined
    );
  }
  return (
    <Layout title="Contenus">
      <Card>
        <form onSubmit={handleSubmit(onSearchSubmit)}>
          <Inline>
            <span>Rechercher: </span>
            <Input
              sx={{ flex: 1 }}
              name="search"
              type="search"
              defaultValue=""
              ref={register}
            />
            <Select
              name="source"
              ref={register}
              defaultValue=""
              onChange={(event) =>
                setSearch({ ...search, source: event.target.value || null })
              }
            >
              <option value="">toutes les sources</option>
              {Object.values(SOURCES).flatMap((source) =>
                getLabelBySource(source)
                  ? [
                      <option
                        key={source}
                        value={source}
                        disabled={isSourceDisabled(source)}
                      >
                        {getLabelBySource(source)}
                      </option>,
                    ]
                  : []
              )}
            </Select>
            <IconButton>
              <IoIosSearch />
            </IconButton>
          </Inline>
        </form>
      </Card>
      <ul>
        {data.documents.map((doc) => (
          <li key={doc.cdtnId}>
            <Link href="/contenus/[id]" as={`/contenus/${doc.cdtnId}`} passHref>
              <NavLink>
                {doc.source} › {doc.title}
              </NavLink>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentsPage));
