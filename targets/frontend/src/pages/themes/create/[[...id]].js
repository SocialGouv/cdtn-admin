/** @jsx jsx  */

import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import {
  formatContentsMutation,
  updateContentsMutation,
} from "src/components/themes/common";
import { ThemeForm } from "src/components/themes/Form";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { jsx, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getInitialData = `
query getInitialData($parentId: uuid = null, $isNull: Boolean = false) {
  theme_relations_aggregate(where: {parent: {_eq: $parentId}}) {
    aggregate {
      max {
        position
      }
    }
  }
  themes(where: {id: {_is_null: $isNull, _eq: $parentId}}) {
    title
  }
}
`;

const createThemeMutation = `
mutation CreateTheme(
  $title: String!,
  $shortTitle: String = null,
  $description: String = null,
  $icon: String = null,
  $parentId: uuid = null,
  $position: Int!
) {
  insert_theme_relations_one(
    object: {
      child_theme: {
        data: {
          title: $title,
          short_title: $shortTitle,
          description: $description,
          icon: $icon
        }
      },
      parent: $parentId,
      position: $position
    }
  ) {
    __typename
    id
    child
  }
}
`;

export function EditThemePage() {
  const router = useRouter();
  const { id: [parentId = null] = [] } = router.query;

  const [
    { error, fetching, data: { theme_relations_aggregate, themes = [] } = {} },
  ] = useQuery({
    query: getInitialData,
    requestPolicy: "network-only",
    variables: { isNull: !parentId, parentId },
  });

  const [createResult, createTheme] = useMutation(createThemeMutation);
  const [updateContentsResult, updateContents] = useMutation(
    updateContentsMutation
  );

  async function onSubmit({ contents = [], ...data }) {
    let result = await createTheme({
      parentId,
      position: theme_relations_aggregate?.aggregate.max.position + 1,
      ...data,
    });
    if (!result.error) {
      result = await updateContents(
        formatContentsMutation({
          contents,
          themeId: result.data.insert_theme_relations_one.child,
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

  const notFound = (parentId && error) || (parentId && !themes.length);

  const pageTitle = `Ajouter un thème ${
    themes.length ? `dont le parent est ${themes[0].title}` : "sans parent"
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
