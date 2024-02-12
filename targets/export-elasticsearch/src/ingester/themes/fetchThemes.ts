import { context } from "../context";
import { gqlClient } from "@shared/utils";
import { Data, Theme } from "../types/themes";
import { SOURCES } from "@socialgouv/cdtn-sources";

const graphQLThemesQuery = `
{
  themes: documents(where: {source: {_eq: "${SOURCES.THEMES}"}}) {
    cdtnId: cdtn_id
    id: initial_id
    slug
    source
    title
    document
    contentRelations: relation_a(where: {type: {_eq: "theme-content"}, b: {is_published: {_eq: true}, is_available: {_eq: true}}}, order_by: {}) {
      content: b {
        cdtnId: cdtn_id
        slug
        source
        title
        document
      }
      position: data(path: "position")
    }
    parentRelations: relation_b(where: {type: {_eq: "theme"}}) {
      parentThemeId: document_a
      position: data(path: "position")
    }
  }
}`;

export const fetchThemes = async (): Promise<Theme[]> => {
  const graphqlEndpoint =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const adminSecret: string =
    context.get("cdtnAdminEndpointSecret") || "admin1";

  console.error(`Accessing cdtn admin on ${graphqlEndpoint}`);
  const result = await gqlClient({
    graphqlEndpoint,
    adminSecret,
  })
    .query<Data>(graphQLThemesQuery)
    .toPromise();

  if (result.error || !result.data) {
    throw new Error(
      `Requête pour récupérer les thèmes a échoué ${JSON.stringify(
        result.error
      )}`
    );
  }

  return result.data.themes;
};
