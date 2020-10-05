import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosSearch } from "react-icons/io";
import { Button } from "src/components/button";
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
  const [search, setSearch] = useState({ source: null, value: "" });
  const onSearchSubmit = ({ search, source }) => {
    setSearch({
      source: source ? source : null,
      value: search,
    });
  };
  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: {
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
            <Button>
              <IoIosSearch /> Rechercher
            </Button>
          </Inline>
        </form>
      </Card>
      {data.documents.length ? (
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
      ) : (
        <p>Pas de résultats.</p>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentsPage));
