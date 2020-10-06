/** @jsx jsx  */
import { generateIds } from "@shared/id-generator";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { ThemeForm } from "src/components/themes/Form";
import {
  formatContentsMutation,
  updateContentsMutation,
} from "src/components/themes/updateContentsMutation";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { jsx, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getInitialData = `
query getInitialData($parentId: String = null, $isNull: Boolean = false) {
  parentThemes: documents(where: {cdtn_id: {_eq: $parentId, _is_null: $isNull}}) {
    title
  }
  siblingRelations: document_relations(where: {document_a: {_eq: $parentId, _is_null: $isNull}, type: {_eq:"${RELATIONS.THEME}"}}) {
    position: data(path: "position")
  }
}
`;

const createThemeMutation = `
mutation CreateTheme(
  $parentId: String = null,
  $relationData: jsonb!
  $cdtn_id: String!,
  $initial_id: String!,
  $title: String!,
  $metaDescription: String!,
  $slug: String!,
  $document: jsonb!,
){
  insert_document_relations_one(
    object: {
      b: {
        data: {
          cdtn_id: $cdtn_id,
          initial_id: $initial_id,
          title: $title,
          text: $title,
          slug: $slug,
          meta_description: $metaDescription,
          document: $document,
          source: "${SOURCES.THEMES}"
        }
      },
      document_a: $parentId,
      data: $relationData,
      type: "${RELATIONS.THEME}"
    }
  ) {
      __typename
      id
      createdThemeId: document_b
    }
  }
`;

export function EditThemePage() {
  const router = useRouter();
  const { id: [parentId = null] = [] } = router.query;

  const [
    {
      error,
      fetching,
      data: { siblingRelations = [], parentThemes = [] } = {},
    },
  ] = useQuery({
    query: getInitialData,
    requestPolicy: "network-only",
    variables: { isNull: !parentId, parentId },
  });

  const [createResult, createTheme] = useMutation(createThemeMutation);
  const [updateContentsResult, updateContents] = useMutation(
    updateContentsMutation
  );

  async function onSubmit({
    contents = [],
    title,
    metaDescription,
    ...document
  }) {
    let result = await createTheme({
      ...generateIds(SOURCES.THEMES),
      document: document,
      metaDescription: metaDescription || document.description || title,
      parentId,
      relationData: {
        position:
          siblingRelations.reduce((accumulator, { position }) => {
            return accumulator >= position ? accumulator : position;
          }, 0) + 1,
      },
      slug: slugify(document.shortTitle || title),
      title,
    });
    if (!result.error) {
      result = await updateContents(
        formatContentsMutation({
          contents,
          themeId: result.data.insert_document_relations_one.createdThemeId,
        })
      );
      if (!result.error) {
        router.push(
          "/themes/[[...id]]",
          `/themes${parentId ? `/${parentId}` : ""}`
        );
      }
    }
  }

  const notFound =
    !fetching && ((parentId && error) || (parentId && !parentThemes.length));

  const pageTitle = `Ajouter un thème ${
    parentThemes.length
      ? `dont le parent est ${parentThemes[0].title}`
      : "sans parent"
  }`;

  return (
    <Layout errorCode={(notFound && 404) || null} title={pageTitle}>
      {fetching ? (
        <Spinner />
      ) : (
        <ThemeForm
          parentId={parentId}
          loading={createResult.fetching || updateContentsResult.fetching}
          onSubmit={onSubmit}
        />
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditThemePage));
