import { Glossary } from "@socialgouv/cdtn-types";
import { context } from "../context";
import { gqlClient } from "@shared/utils";

const gqlGlossary = `
query Glossary {
  glossary {
    term
    abbreviations
    definition
    variants
    references
    slug
  }
}

`;

export async function getGlossary(): Promise<Glossary> {
  const graphqlEndpoint: string =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const adminSecret: string =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const result = await gqlClient({
    graphqlEndpoint,
    adminSecret,
  })
    .query<{ glossary: Glossary }>(gqlGlossary, {})
    .toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error(
      `error fetching kali blocks => ${JSON.stringify(result.error)}`
    );
  }
  return result.data.glossary;
}
