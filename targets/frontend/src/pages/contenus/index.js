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
import {
  Box,
  Card,
  Input,
  jsx,
  Label,
  Message,
  NavLink,
  Radio,
  Select,
} from "theme-ui";
import { useMutation, useQuery } from "urql";

const searchDocumentQuery = `
query documents($offset: Int = 0, $limit: Int = 50, $and: [documents_bool_exp]!) {
  documents(where: {_and: $and}, offset: $offset, limit: $limit, order_by: [{source: asc}, {slug: asc}]) {
    id: initial_id
    cdtnId: cdtn_id
    title
    source
    isPublished: is_published
  }
  documents_aggregate(where: {_and: $and}) {
    aggregate {
      count
    }
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
];

const DEFAULT_ITEMS_PER_PAGE = 25;

export function DocumentsPage() {
  const router = useRouter();

  const context = useMemo(() => ({ additionalTypenames: ["documents"] }), []);

  const [, updatePublication] = useMutation(updatePublicationMutation);

  const { register, handleSubmit } = useForm();

  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const currentPage = parseInt(router.query.page, 10) || 0;

  const [facets, setFacets] = useState({
    currentPage: parseInt(router.query.page, 10) || 0,
    ...(router.query.published && { published: router.query.published }),
    q: router.query.q?.trim() || "",
    source: router.query.source || null,
  });

  const onSearchSubmit = ({ q, source, published }) => {
    console.log("onSearchSubmit", { published, q, source });
    setFacets({ published, q, source });
  };

  function updateUrl(event) {
    const query = { ...facets };
    query[event.target.name] =
      typeof event.target.checked !== "undefined"
        ? event.target.checked
        : event.target.value.trim();

    router.push({ pathname: router.route, query });
    setFacets(query);
  }

  const whereQueryParam = useMemo(() => {
    const params = {
      source: { _eq: facets.source || null },
      title: { _ilike: `%${facets.q}%` },
    };
    if (facets.published) {
      params.is_published = { _eq: facets.published === "true" ? true : false };
    }
    console.log(facets.unthemed);
    if (facets.unthemed) {
      params._not = { relation_b: { type: { _eq: "theme-content" } } };
    }
    return params;
  }, [facets]);

  const [result] = useQuery({
    query: searchDocumentQuery,
    variables: {
      and: whereQueryParam,
      limit: itemsPerPage,
      offset: facets.currentPage * itemsPerPage,
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
              defaultValue={facets.q}
              ref={register}
              onBlur={updateUrl}
            />
            <Select
              name="source"
              ref={register}
              onChange={updateUrl}
              defaultValue={facets.source}
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
              </Label>
            </Box>
          </Inline>
          <Inline paddingTop="xsmall">
            <Label sx={{ alignItems: "center" }}>
              Tous{" "}
              <Radio
                name="published"
                value=""
                ref={register}
                defaultChecked={!facets.published}
                onChange={updateUrl}
              />
            </Label>
            <Label sx={{ alignItems: "center" }}>
              Publiés{" "}
              <Radio
                name="published"
                value="true"
                ref={register}
                defaultChecked={facets.published === "true"}
                onChange={updateUrl}
              />
            </Label>
            <Label sx={{ alignItems: "center" }}>
              Dépubliés{" "}
              <Radio
                name="published"
                value="false"
                ref={register}
                defaultChecked={facets.published === "false"}
                onChange={updateUrl}
              />
            </Label>
            <Label sx={{ alignItems: "center" }}>
              Non-thémés{" "}
              <input
                name="unthemed"
                type="checkbox"
                sx={checkboxStyles}
                defaultChecked={facets.unthemed === "true"}
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
          {data.documents_aggregate.aggregate.count} documents trouvés
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
          sx={checkboxStyles}
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

const checkboxStyles = {
  cursor: "pointer",
  display: "block",
  height: "1.2rem",
  m: "0 0 0 small",
  padding: 0,
  width: "1.2rem",
};
export default withCustomUrqlClient(withUserProvider(DocumentsPage));
