/** @jsxImportSource theme-ui */

import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { MdSearch } from "react-icons/md";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { theme } from "src/theme";
import {
  Box,
  Card,
  Flex,
  Input,
  Label,
  Message,
  NavLink,
  Radio,
  Select,
} from "theme-ui";
import { useMutation, useQuery } from "urql";

const searchDocumentQuery = `
query documents($source: String, $search: String!, $published: [Boolean!]!, $offset: Int = 0, $limit: Int = 50) {
  documents(
    where: {
      _and: {
        source: {_eq: $source}
        title: {_ilike: $search }
        is_published: {_in: $published}
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
        is_published: {_in: $published}
      }
    }
  )
  {
    aggregate { count }
  }
  sources: documents_aggregate(distinct_on: source) {
    nodes {
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
  [SOURCES.HIGHLIGHTS, getLabelBySource(SOURCES.HIGHLIGHTS)],
];

const DEFAULT_ITEMS_PER_PAGE = 25;

export function DocumentsPage() {
  const router = useRouter();

  const context = useMemo(() => ({ additionalTypenames: ["documents"] }), []);

  const [, updatePublication] = useMutation(updatePublicationMutation);

  const { register, handleSubmit } = useForm();

  const onSearchSubmit = ({ q, source, published }) => {
    console.log("onSearchSubmit", { published, q, source });
  };

  function updateUrl(event) {
    const query = { ...facets };
    const { value, name } = event.target;
    query[name] = value;
    router.push({ pathname: router.route, query }, undefined, {
      shallow: true,
    });
  }

  const facets = {
    itemsPerPage:
      parseInt(router.query.itemsPerPage, 10) || DEFAULT_ITEMS_PER_PAGE,
    page: parseInt(router.query.page, 10) || 0,
    published: router.query.published || "all",
    q: router.query.q?.trim() || "",
    source: router.query.source || null,
  };

  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: {
      limit: facets.itemsPerPage,
      offset: facets.page * facets.itemsPerPage,
      published:
        facets.published === "yes"
          ? [true]
          : facets.published === "no"
          ? [false]
          : [true, false],
      search: `%${facets.q}%`,
      source: facets.source || null,
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
        <Card sx={{ position: "sticky", top: 0 }} bg="white">
          <form onSubmit={handleSubmit(onSearchSubmit)}>
            <Inline>
              <Input
                sx={{ flex: 1 }}
                name="q"
                type="search"
                placeholder="titre..."
                defaultValue={facets.q}
                ref={register}
                onBlur={updateUrl}
              />
              <Select
                name="source"
                ref={register}
                onChange={updateUrl}
                value={facets.source || ""}
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
              <Box sx={{ alignSelf: "flex-end" }}>
                <Label
                  htmlFor="itemsPerPage"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Select
                    sx={{ width: "4rem" }}
                    name="itemsPerPage"
                    id="itemsPerPage"
                    value={facets.itemsPerPage}
                    onChange={(event) => {
                      updateUrl(event);
                    }}
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={`items-per-page${size}`} value={size}>
                        {size}
                      </option>
                    ))}
                  </Select>
                </Label>
              </Box>
            </Inline>
            <Inline paddingTop="xsmall">
              <Label sx={{ alignItems: "center" }}>
                Tous{" "}
                <Radio
                  name="published"
                  value="all"
                  ref={register}
                  checked={facets.published === "all"}
                  onChange={updateUrl}
                />
              </Label>
              <Label sx={{ alignItems: "center" }}>
                Publié{" "}
                <Radio
                  name="published"
                  value="yes"
                  ref={register}
                  checked={facets.published === "yes"}
                  onChange={updateUrl}
                />
              </Label>
              <Label sx={{ alignItems: "center" }}>
                Non-publié{" "}
                <Radio
                  name="published"
                  value="no"
                  ref={register}
                  checked={facets.published === "no"}
                  onChange={updateUrl}
                />
              </Label>
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
              currentPage={facets.page}
              pageSize={facets.itemsPerPage}
            />
          </>
        ) : (
          <p>Pas de résultats.</p>
        )}
      </Stack>
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
          sx={checkboxStyles}
          checked={isChecked}
          onChange={() => {
            setChecked(!isChecked);
            updatePublish(cdtnId, !isChecked);
          }}
        />
      </td>
      <td>
        <Link href={sourceToRoute({ cdtnId, source })} passHref shallow>
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

const checkboxStyles = {
  cursor: "pointer",
  display: "block",
  height: "1.2rem",
  m: "0 0 0 small",
  padding: 0,
  width: "1.2rem",
};
export default withCustomUrqlClient(withUserProvider(DocumentsPage));

const sourceToRoute = ({ cdtnId, source }) => {
  switch (source) {
    case SOURCES.EDITORIAL_CONTENT:
    case SOURCES.HIGHLIGHTS:
      return `/contenus/edit/${cdtnId}`;
    default:
      return `/contenus/${cdtnId}`;
  }
};
